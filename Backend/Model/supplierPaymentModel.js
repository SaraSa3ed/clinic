const { DataTypes } = require('sequelize');
const sequelize = require('../Config/sequelize');

const SupplierPayment = sequelize.define('SupplierPayment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  paymentMethod: {
    type: DataTypes.ENUM('bank_transfer', 'cash', 'check', 'credit_card', 'other'),
    allowNull: false,
    defaultValue: 'bank_transfer'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'completed'
  },
  referenceNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'SupplierPayments',
  timestamps: true,
  paranoid: true
});

module.exports = SupplierPayment;
