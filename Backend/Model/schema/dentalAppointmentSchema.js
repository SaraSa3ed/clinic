const { DataTypes } = require("sequelize");
const sequelize = require("../../Config/sequelize");

const DentalAppointment = sequelize.define(
  "DentalAppointment",
  {
    appointment_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
    },
    patient_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    patient_phone: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    patient_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: { isEmail: true },
    },
    doctor_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "معرف الطبيب المعالج",
    },
    doctor_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "اسم الطبيب",
    },
    treatment_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "معرف العلاج/الخدمة (اختياري)",
    },
    treatment_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "اسم العلاج/الخدمة",
    },
    treatment_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "نوع العلاج (تنظيف، حشو، تقويم، زراعة، إلخ)",
    },
    tooth_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "رقم السن المعالج",
    },
    consultation_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: { min: 0 },
      comment: "قيمة الكشف",
    },
    treatment_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: { min: 0 },
      comment: "تكلفة العلاج",
    },
    appointment_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "تاريخ ووقت الموعد",
    },
    visit_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "تاريخ الزيارة",
    },
    next_appointment: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "الموعد القادم",
    },
    status: {
      type: DataTypes.ENUM(
        "scheduled",    // مجدول
        "confirmed",    // مؤكد
        "in-progress",  // جاري
        "completed",    // مكتمل
        "cancelled",    // ملغي
        "no-show"       // لم يحضر
      ),
      allowNull: false,
      defaultValue: "scheduled",
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "التشخيص الطبي",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "ملاحظات إضافية",
    },
    payment_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: { min: 0 },
      comment: "المبلغ المدفوع",
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: { min: 0 },
      comment: "قيمة الخصم",
    },
    remaining_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: { min: 0 },
      comment: "المبلغ المتبقي",
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "card", "insurance", "installment"),
      allowNull: true,
      defaultValue: "cash",
      comment: "طريقة الدفع",
    },
    insurance_company: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "شركة التأمين",
    },
    insurance_coverage: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: { min: 0 },
      comment: "نسبة التغطية التأمينية",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "DentalAppointments",
    timestamps: false,
    indexes: [
      { fields: ["doctor_id", "appointment_datetime"] },
      { fields: ["patient_phone"] },
      { fields: ["status"] },
      { fields: ["appointment_datetime"] },
    ],
  }
);

// ملاحظة: علاقات DentalAppointment تُعرّف مركزياً في Model/index.js لتجنب تعارض الأسماء

module.exports = DentalAppointment;
