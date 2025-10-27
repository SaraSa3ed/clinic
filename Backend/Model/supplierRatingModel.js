const { DataTypes } = require('sequelize');
const sequelize = require('../Config/sequelize');

const SupplierRating = sequelize.define('SupplierRating', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  category: {
    type: DataTypes.ENUM('quality', 'delivery', 'service', 'communication', 'pricing'),
    allowNull: false,
    defaultValue: 'quality'
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'SupplierRatings',
  timestamps: true,
  paranoid: true
});

module.exports = SupplierRating;
