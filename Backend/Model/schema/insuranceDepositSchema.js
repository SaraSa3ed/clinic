const { DataTypes } = require("sequelize");
const sequelize = require("../../Config/sequelize");

const InsuranceDeposit = sequelize.define(
  "InsuranceDeposit",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    booking_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    customer_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    insurance_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    refunded_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    refund_status: {
      type: DataTypes.ENUM("pending", "partial_refund", "refunded", "forfeited"),
      allowNull: false,
      defaultValue: "pending",
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "InsuranceDeposits",
    timestamps: false,
  }
);

module.exports = InsuranceDeposit;


