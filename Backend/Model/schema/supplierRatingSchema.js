const { DataTypes } = require("sequelize");
const sequelize = require("../../Config/sequelize");

const SupplierRating = sequelize.define("supplier_ratings", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "معرف المورد"
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    },
    comment: "التقييم من 1 إلى 5"
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "تعليق على التقييم"
  },
  category: {
    type: DataTypes.ENUM('quality', 'delivery', 'service', 'communication', 'pricing'),
    allowNull: false,
    defaultValue: 'quality',
    comment: "فئة التقييم"
  },
  rated_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "معرف المستخدم الذي قام بالتقييم"
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: "تاريخ إنشاء التقييم"
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: "تاريخ آخر تحديث"
  }
}, {
  tableName: "SupplierRatings",
  timestamps: true,
  indexes: [
    {
      fields: ['supplier_id']
    },
    {
      fields: ['rated_by']
    },
    {
      fields: ['category']
    }
  ]
});

module.exports = SupplierRating;
