const { DataTypes } = require("sequelize");
const sequelize = require("../../Config/sequelize");

const Doctor = sequelize.define(
  "Doctor",
  {
    doctor_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
    },
    doctor_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "اسم الطبيب",
    },
    specialty: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "التخصص (أسنان عامة، تقويم، زراعة، إلخ)",
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "رقم الهاتف",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: { isEmail: true },
      comment: "البريد الإلكتروني",
    },
    license_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "رقم الترخيص",
    },
    years_of_experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "سنوات الخبرة",
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "الفرع التابع له",
    },
    working_hours_from: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "بداية ساعات العمل",
    },
    working_hours_to: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "نهاية ساعات العمل",
    },
    working_days: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "أيام العمل (مصفوفة من الأيام)",
    },
    consultation_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: { min: 0 },
      comment: "قيمة الكشف",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "on-leave"),
      allowNull: false,
      defaultValue: "active",
      comment: "حالة الطبيب",
    },
    profile_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "صورة الطبيب",
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "نبذة عن الطبيب",
    },
    qualifications: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "المؤهلات والشهادات",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "ملاحظات إضافية",
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
    tableName: "Doctors",
    timestamps: false,
    indexes: [
      { fields: ["specialty"] },
      { fields: ["branch_id"] },
      { fields: ["status"] },
    ],
  }
);

// ملاحظة: علاقات Doctor تُعرّف مركزياً في Model/index.js لتجنب تعارض الأسماء

module.exports = Doctor;
