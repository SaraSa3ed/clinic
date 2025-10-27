const { DataTypes } = require('sequelize');
const sequelize = require('../Config/sequelize');

const ExpenseCategory = sequelize.define('ExpenseCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'bg-blue-100 text-blue-800',
    validate: {
      isIn: [['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-red-100 text-red-800', 'bg-yellow-100 text-yellow-800', 'bg-purple-100 text-purple-800', 'bg-pink-100 text-pink-800', 'bg-orange-100 text-orange-800', 'bg-gray-100 text-gray-800']]
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  orderIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },

  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'ExpenseCategories',
  timestamps: true,
  paranoid: true, // Soft delete
  indexes: [
    {
      fields: ['name', 'companyId'],
      unique: true
    },
    {
      fields: ['companyId']
    },
    {
      fields: ['branchId']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['orderIndex']
    }
  ]
});

module.exports = ExpenseCategory;
