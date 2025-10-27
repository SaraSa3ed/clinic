const { Op } = require("sequelize");
const { InsuranceDeposit, DentalAppointment } = require("../Model");

exports.list = async (req, res) => {
  try {
    const { status, from, to, booking_id, q } = req.query;
    const where = {};
    if (status) where.refund_status = status;
    if (booking_id) where.booking_id = booking_id;
    if (from && to) {
      where.created_at = { [Op.between]: [new Date(from), new Date(to)] };
    }
    if (q) {
      where.customer_name = { [Op.like]: `%${q}%` };
    }
    const items = await InsuranceDeposit.findAll({
      where,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: DentalAppointment,
          as: "appointment",
          attributes: [
            "appointment_id",
            "patient_name",
            "patient_phone",
            "doctor_id",
            "doctor_name",
            "treatment_name",
            "appointment_datetime",
            "visit_date",
            "status",
            "created_at",
          ],
        },
      ],
    });
    res.json({ data: items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const item = await InsuranceDeposit.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "السجل غير موجود" });
    res.json({ data: item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.refundFull = async (req, res) => {
  try {
    const item = await InsuranceDeposit.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "السجل غير موجود" });
    await item.update({
      refunded_amount: item.insurance_amount,
      refund_status: "refunded",
      updated_at: new Date(),
      reason: req.body?.reason || null,
    });
    res.json({ data: item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.refundPartial = async (req, res) => {
  try {
    const { amount, reason } = req.body || {};
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "قيمة الاسترجاع الجزئي مطلوبة ويجب أن تكون > 0" });
    }
    const item = await InsuranceDeposit.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "السجل غير موجود" });
    const newRefunded = Math.min(Number(item.insurance_amount), Number(item.refunded_amount) + Number(amount));
    const status = newRefunded >= Number(item.insurance_amount) ? "refunded" : "partial_refund";
    await item.update({
      refunded_amount: newRefunded,
      refund_status: status,
      reason: reason || item.reason,
      updated_at: new Date(),
    });
    res.json({ data: item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forfeit = async (req, res) => {
  try {
    const { reason } = req.body || {};
    const item = await InsuranceDeposit.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "السجل غير موجود" });
    await item.update({
      refund_status: "forfeited",
      updated_at: new Date(),
      reason: reason || item.reason,
    });
    res.json({ data: item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


