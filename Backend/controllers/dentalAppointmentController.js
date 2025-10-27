const { Op } = require("sequelize");
const { DentalAppointment, productsSchema } = require("../Model");

// دالة للتحقق من توفر الطبيب في وقت معين
async function checkDoctorAvailability(doctorId, appointmentDateTime, excludeAppointmentId = null) {
  if (!doctorId) {
    return { available: true, message: "لم يتم تحديد طبيب" };
  }

  const appointmentStart = new Date(appointmentDateTime);
  const appointmentEnd = new Date(appointmentStart.getTime() + 60 * 60 * 1000); // ساعة واحدة افتراضياً

  const whereCondition = {
    doctor_id: doctorId,
    status: { [Op.in]: ["scheduled", "confirmed", "in-progress"] },
    [Op.or]: [
      {
        appointment_datetime: {
          [Op.between]: [appointmentStart, appointmentEnd]
        }
      }
    ]
  };

  if (excludeAppointmentId) {
    whereCondition.appointment_id = { [Op.ne]: excludeAppointmentId };
  }

  const conflictingAppointments = await DentalAppointment.findAll({
    where: whereCondition,
    order: [["appointment_datetime", "ASC"]]
  });

  if (conflictingAppointments.length > 0) {
    const conflictingTimes = conflictingAppointments.map(apt => ({
      time: apt.appointment_datetime,
      patient: apt.patient_name
    }));

    throw new Error(`الطبيب غير متاح في هذا الوقت. يوجد ${conflictingAppointments.length} موعد متداخل. المواعيد المتداخلة: ${JSON.stringify(conflictingTimes)}`);
  }

  return {
    available: true,
    message: "الطبيب متاح في هذا الوقت"
  };
}

exports.create = async (req, res) => {
  try {
    const {
      appointment_id,
      patient_name,
      patient_phone,
      patient_email,
      doctor_id,
      doctor_name,
      treatment_id,
      treatment_name,
      treatment_type,
      tooth_number,
      consultation_fee,
      treatment_cost,
      appointment_datetime,
      visit_date,
      next_appointment,
      diagnosis,
      notes,
      status: requestedStatus,
      payment_amount,
      discount_amount,
      remaining_amount,
      payment_method,
      insurance_company,
      insurance_coverage,
    } = req.body;

    if (!patient_name || !patient_phone || !appointment_datetime || !visit_date) {
      return res.status(400).json({ message: "الحقول الأساسية مطلوبة (اسم المريض، رقم الهاتف، موعد الزيارة)" });
    }

    // التحقق من صحة القيم المالية
    if (consultation_fee && (isNaN(parseFloat(consultation_fee)) || parseFloat(consultation_fee) < 0)) {
      return res.status(400).json({ message: "قيمة الكشف يجب أن تكون رقماً صحيحاً أكبر من أو يساوي صفر" });
    }
    if (treatment_cost && (isNaN(parseFloat(treatment_cost)) || parseFloat(treatment_cost) < 0)) {
      return res.status(400).json({ message: "تكلفة العلاج يجب أن تكون رقماً صحيحاً أكبر من أو يساوي صفر" });
    }
    if (payment_amount && (isNaN(parseFloat(payment_amount)) || parseFloat(payment_amount) < 0)) {
      return res.status(400).json({ message: "مبلغ المدفوع يجب أن يكون رقماً صحيحاً أكبر من أو يساوي صفر" });
    }
    if (discount_amount && (isNaN(parseFloat(discount_amount)) || parseFloat(discount_amount) < 0)) {
      return res.status(400).json({ message: "مبلغ الخصم يجب أن يكون رقماً صحيحاً أكبر من أو يساوي صفر" });
    }
    if (remaining_amount && (isNaN(parseFloat(remaining_amount)) || parseFloat(remaining_amount) < 0)) {
      return res.status(400).json({ message: "المبلغ المتبقي يجب أن يكون رقماً صحيحاً أكبر من أو يساوي صفر" });
    }

    // البحث عن العلاج في المنتجات إذا تم تحديده (اختياري)
    let treatment = null;
    if (treatment_id) {
      treatment = await productsSchema.findByPk(treatment_id);
      // لا نفشل إذا لم يكن موجوداً - العلاج اختياري
    }

    const allowedStatuses = ["scheduled", "confirmed", "in-progress", "completed", "cancelled", "no-show"];
    const status = allowedStatuses.includes(requestedStatus) ? requestedStatus : "scheduled";

    // التحقق من توفر الطبيب
    if (doctor_id && (status === "scheduled" || status === "confirmed")) {
      try {
        await checkDoctorAvailability(doctor_id, appointment_datetime);
      } catch (availabilityError) {
        return res.status(400).json({ 
          message: availabilityError.message,
          type: "availability_error"
        });
      }
    }

    const created = await DentalAppointment.create({
      appointment_id: appointment_id || `APT${Date.now()}`,
      patient_name,
      patient_phone,
      patient_email,
      doctor_id,
      doctor_name,
      treatment_id,
      treatment_name: treatment_name || (treatment ? (treatment.name_ar || treatment.name_en) : null),
      treatment_type,
      tooth_number,
      consultation_fee: consultation_fee ? parseFloat(consultation_fee) : null,
      treatment_cost: treatment_cost ? parseFloat(treatment_cost) : (treatment ? treatment.selling_price : null),
      appointment_datetime,
      visit_date,
      next_appointment,
      diagnosis,
      notes,
      status,
      payment_amount: payment_amount ? parseFloat(payment_amount) : null,
      discount_amount: discount_amount ? parseFloat(discount_amount) : null,
      remaining_amount: remaining_amount ? parseFloat(remaining_amount) : null,
      payment_method: payment_method || "cash",
      insurance_company,
      insurance_coverage: insurance_coverage ? parseFloat(insurance_coverage) : null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json({ data: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { from, to, status, doctor_id, patient_phone, treatment_id } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (doctor_id) where.doctor_id = doctor_id;
    if (patient_phone) where.patient_phone = { [Op.like]: `%${patient_phone}%` };
    if (treatment_id) where.treatment_id = treatment_id;
    
    if (from && to) {
      where.appointment_datetime = { 
        [Op.between]: [new Date(from), new Date(to)] 
      };
    }
    
    const items = await DentalAppointment.findAll({ 
      where, 
      order: [["appointment_datetime", "DESC"]],
      include: [{
        model: productsSchema,
        as: 'treatment',
        attributes: ['product_id', 'name_ar', 'name_en', 'barcode'],
        required: false
      }]
    });
    
    res.json({ data: items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const item = await DentalAppointment.findByPk(req.params.id, {
      include: [{
        model: productsSchema,
        as: 'treatment',
        attributes: ['product_id', 'name_ar', 'name_en', 'barcode'],
        required: false
      }]
    });
    
    if (!item) return res.status(404).json({ message: "الموعد غير موجود" });
    res.json({ data: item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await DentalAppointment.findByPk(id);
    
    if (!existing) return res.status(404).json({ message: "الموعد غير موجود" });

    // التحقق من صحة القيم المالية
    if (req.body.consultation_fee && (isNaN(parseFloat(req.body.consultation_fee)) || parseFloat(req.body.consultation_fee) < 0)) {
      return res.status(400).json({ message: "قيمة الكشف يجب أن تكون رقماً صحيحاً أكبر من أو يساوي صفر" });
    }
    if (req.body.treatment_cost && (isNaN(parseFloat(req.body.treatment_cost)) || parseFloat(req.body.treatment_cost) < 0)) {
      return res.status(400).json({ message: "تكلفة العلاج يجب أن تكون رقماً صحيحاً أكبر من أو يساوي صفر" });
    }
    if (req.body.payment_amount && (isNaN(parseFloat(req.body.payment_amount)) || parseFloat(req.body.payment_amount) < 0)) {
      return res.status(400).json({ message: "مبلغ المدفوع يجب أن يكون رقماً صحيحاً أكبر من أو يساوي صفر" });
    }
    if (req.body.discount_amount && (isNaN(parseFloat(req.body.discount_amount)) || parseFloat(req.body.discount_amount) < 0)) {
      return res.status(400).json({ message: "مبلغ الخصم يجب أن يكون رقماً صحيحاً أكبر من أو يساوي صفر" });
    }
    if (req.body.remaining_amount && (isNaN(parseFloat(req.body.remaining_amount)) || parseFloat(req.body.remaining_amount) < 0)) {
      return res.status(400).json({ message: "المبلغ المتبقي يجب أن يكون رقماً صحيحاً أكبر من أو يساوي صفر" });
    }

    // التحقق من توفر الطبيب في حالة تغيير الموعد أو الطبيب
    if ((req.body.appointment_datetime || req.body.doctor_id) && 
        (req.body.status === "scheduled" || req.body.status === "confirmed" || 
         existing.status === "scheduled" || existing.status === "confirmed")) {
      
      const checkDoctorId = req.body.doctor_id || existing.doctor_id;
      const checkDateTime = req.body.appointment_datetime || existing.appointment_datetime;
      
      if (checkDoctorId) {
        try {
          await checkDoctorAvailability(checkDoctorId, checkDateTime, id);
        } catch (availabilityError) {
          return res.status(400).json({ 
            message: availabilityError.message,
            type: "availability_error"
          });
        }
      }
    }

    const updates = { ...req.body, updated_at: new Date() };
    
    // تحويل القيم المالية
    if (updates.consultation_fee) updates.consultation_fee = parseFloat(updates.consultation_fee);
    if (updates.treatment_cost) updates.treatment_cost = parseFloat(updates.treatment_cost);
    if (updates.payment_amount) updates.payment_amount = parseFloat(updates.payment_amount);
    if (updates.discount_amount) updates.discount_amount = parseFloat(updates.discount_amount);
    if (updates.remaining_amount) updates.remaining_amount = parseFloat(updates.remaining_amount);
    if (updates.insurance_coverage) updates.insurance_coverage = parseFloat(updates.insurance_coverage);
    
    await DentalAppointment.update(updates, { where: { appointment_id: id } });
    
    const updated = await DentalAppointment.findByPk(id, {
      include: [{
        model: productsSchema,
        as: 'treatment',
        attributes: ['product_id', 'name_ar', 'name_en', 'barcode'],
        required: false
      }]
    });

    res.json({ data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const count = await DentalAppointment.destroy({ where: { appointment_id: req.params.id } });
    if (!count) return res.status(404).json({ message: "الموعد غير موجود" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { doctor_id, appointment_datetime, exclude_appointment_id } = req.body;
    
    if (!doctor_id || !appointment_datetime) {
      return res.status(400).json({ 
        message: "الحقول المطلوبة: doctor_id, appointment_datetime" 
      });
    }

    const availability = await checkDoctorAvailability(
      doctor_id, 
      appointment_datetime, 
      exclude_appointment_id
    );

    res.json({ 
      status: "success", 
      data: availability 
    });
  } catch (err) {
    res.status(400).json({ 
      status: "error",
      message: err.message,
      type: "availability_error"
    });
  }
};

exports.getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await DentalAppointment.findAll({
      where: {
        appointment_datetime: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      order: [["appointment_datetime", "ASC"]]
    });

    const totalAppointments = appointments.length;
    
    const totalConsultationFees = appointments.reduce((sum, apt) => {
      return sum + (Number(apt.consultation_fee) || 0);
    }, 0);
    
    const totalTreatmentCost = appointments.reduce((sum, apt) => {
      return sum + (Number(apt.treatment_cost) || 0);
    }, 0);
    
    const totalPayments = appointments.reduce((sum, apt) => {
      return sum + (Number(apt.payment_amount) || 0);
    }, 0);
    
    const totalDiscounts = appointments.reduce((sum, apt) => {
      return sum + (Number(apt.discount_amount) || 0);
    }, 0);
    
    const totalRemaining = appointments.reduce((sum, apt) => {
      return sum + (Number(apt.remaining_amount) || 0);
    }, 0);

    const appointmentsByStatus = appointments.reduce((acc, apt) => {
      if (!acc[apt.status]) {
        acc[apt.status] = [];
      }
      acc[apt.status].push(apt);
      return acc;
    }, {});

    const statusStats = Object.keys(appointmentsByStatus).map(status => {
      const statusAppointments = appointmentsByStatus[status];
      const count = statusAppointments.length;
      const totalPayment = statusAppointments.reduce((sum, apt) => sum + (Number(apt.payment_amount) || 0), 0);
      
      return {
        status,
        count,
        totalPayment
      };
    });

    const appointmentsByDoctor = appointments.reduce((acc, apt) => {
      const doctorId = apt.doctor_id || 'unassigned';
      if (!acc[doctorId]) {
        acc[doctorId] = {
          doctor_id: doctorId,
          doctor_name: apt.doctor_name || 'غير محدد',
          count: 0,
          totalPayment: 0
        };
      }
      acc[doctorId].count += 1;
      acc[doctorId].totalPayment += Number(apt.payment_amount) || 0;
      return acc;
    }, {});

    const doctorStats = Object.values(appointmentsByDoctor);

    const report = {
      date: targetDate.toISOString().split('T')[0],
      summary: {
        totalAppointments,
        totalConsultationFees,
        totalTreatmentCost,
        totalPayments,
        totalDiscounts,
        totalRemaining,
        netRevenue: totalPayments
      },
      statusStats,
      doctorStats,
      appointments: appointments.map(apt => ({
        appointment_id: apt.appointment_id,
        patient_name: apt.patient_name,
        patient_phone: apt.patient_phone,
        doctor_name: apt.doctor_name,
        treatment_name: apt.treatment_name,
        consultation_fee: apt.consultation_fee,
        treatment_cost: apt.treatment_cost,
        payment_amount: apt.payment_amount,
        discount_amount: apt.discount_amount,
        remaining_amount: apt.remaining_amount,
        status: apt.status,
        appointment_datetime: apt.appointment_datetime
      }))
    };

    res.json({
      status: "success",
      data: report
    });
  } catch (err) {
    console.error("Error generating daily report:", err);
    res.status(500).json({
      status: "error",
      message: err.message || "حدث خطأ في إنشاء التقرير"
    });
  }
};

exports.getPatientHistory = async (req, res) => {
  try {
    const { patient_phone } = req.params;
    
    if (!patient_phone) {
      return res.status(400).json({ message: "رقم هاتف المريض مطلوب" });
    }

    const appointments = await DentalAppointment.findAll({
      where: { patient_phone },
      order: [["appointment_datetime", "DESC"]],
      include: [{
        model: productsSchema,
        as: 'treatment',
        attributes: ['product_id', 'name_ar', 'name_en'],
        required: false
      }]
    });

    const totalVisits = appointments.length;
    const totalPaid = appointments.reduce((sum, apt) => sum + (Number(apt.payment_amount) || 0), 0);
    const totalRemaining = appointments.reduce((sum, apt) => sum + (Number(apt.remaining_amount) || 0), 0);

    res.json({
      status: "success",
      data: {
        patient_phone,
        patient_name: appointments[0]?.patient_name || null,
        totalVisits,
        totalPaid,
        totalRemaining,
        appointments
      }
    });
  } catch (err) {
    console.error("Error fetching patient history:", err);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};
