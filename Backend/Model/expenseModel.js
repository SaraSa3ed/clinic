const { DataTypes } = require('sequelize');
const sequelize = require('../Config/sequelize');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    validate: {
      min: 0.01
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expenseDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: true,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'approved', 'rejected']]
    }
  },
  receiptNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  receiptPath: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'credit_card', 'check', 'other'),
    allowNull: true,
    validate: {
      isIn: [['cash', 'bank_transfer', 'credit_card', 'check', 'other']]
    }
  },
  vendorName: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  vendorContact: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ExpenseCategories',
      key: 'id'
    }},
  
  
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  tableName: 'Expenses',
  timestamps: true,
  paranoid: true, // Soft delete
  indexes: [
    {
      fields: ['categoryId']
    },
    
    {
      fields: ['createdBy']
    },
    {
      fields: ['status']
    },
    {
      fields: ['expenseDate']
    },
    {
      fields: ['receiptNumber']
    },
    {
      fields: ['vendorName']
    }
  ]
});

module.exports = Expense;
