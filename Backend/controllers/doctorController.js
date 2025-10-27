const { Op } = require("sequelize");
const Doctor = require("../Model/doctorModel");

exports.create = async (req, res) => {
  try {
    const {
      doctor_id,
      doctor_name,
      specialty,
      phone,
      email,
      license_number,
      years_of_experience,
      branch_id,
      working_hours_from,
      working_hours_to,
      working_days,
      consultation_fee,
      status,
      profile_image,
      bio,
      qualifications,
      notes,
    } = req.body;

    if (!doctor_name) {
      return res.status(400).json({ message: "اسم الطبيب مطلوب" });
    }

    const created = await Doctor.create({
      doctor_id: doctor_id || `DOC${Date.now()}`,
      doctor_name,
      specialty,
      phone,
      email,
      license_number,
      years_of_experience: years_of_experience ? parseInt(years_of_experience) : null,
      branch_id: branch_id ? parseInt(branch_id) : null,
      working_hours_from,
      working_hours_to,
      working_days,
      consultation_fee: consultation_fee ? parseFloat(consultation_fee) : null,
      status: status || "active",
      profile_image,
      bio,
      qualifications,
      notes,
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
    const { specialty, status, branch_id } = req.query;
    const where = {};
    
    if (specialty) where.specialty = specialty;
    if (status) where.status = status;
    if (branch_id) where.branch_id = parseInt(branch_id);
    
    const items = await Doctor.findAll({ 
      where, 
      order: [["doctor_name", "ASC"]]
    });
    
    res.json({ data: items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const item = await Doctor.findByPk(req.params.id);
    
    if (!item) return res.status(404).json({ message: "الطبيب غير موجود" });
    res.json({ data: item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Doctor.findByPk(id);
    
    if (!existing) return res.status(404).json({ message: "الطبيب غير موجود" });

    const updates = { ...req.body, updated_at: new Date() };
    
    if (updates.years_of_experience) updates.years_of_experience = parseInt(updates.years_of_experience);
    if (updates.branch_id) updates.branch_id = parseInt(updates.branch_id);
    if (updates.consultation_fee) updates.consultation_fee = parseFloat(updates.consultation_fee);
    
    await Doctor.update(updates, { where: { doctor_id: id } });
    
    const updated = await Doctor.findByPk(id);

    res.json({ data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const count = await Doctor.destroy({ where: { doctor_id: req.params.id } });
    if (!count) return res.status(404).json({ message: "الطبيب غير موجود" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSchedule = async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const { date } = req.query;
    
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) return res.status(404).json({ message: "الطبيب غير موجود" });
    
    // يمكن إضافة منطق للحصول على جدول مواعيد الطبيب
    // بالاستعلام عن DentalAppointments
    
    res.json({
      status: "success",
      data: {
        doctor_id: doctor.doctor_id,
        doctor_name: doctor.doctor_name,
        working_hours_from: doctor.working_hours_from,
        working_hours_to: doctor.working_hours_to,
        working_days: doctor.working_days,
        consultation_fee: doctor.consultation_fee,
      }
    });
  } catch (err) {
    console.error("Error getting doctor schedule:", err);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};
