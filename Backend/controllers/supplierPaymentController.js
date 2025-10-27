const { Op } = require('sequelize');
const SupplierPayment = require('../Model/supplierPaymentModel');
const Supplier = require('../Model/supplierModel');
const AppError = require('../utils/appError');

// إضافة دفعة مورد
const addSupplierPayment = async (req, res, next) => {
  try {
    const { supplierId, amount, paymentMethod, description, paymentDate } = req.body;
    
    if (!supplierId || !amount) {
      return next(new AppError('معرف المورد والمبلغ مطلوبان', 400));
    }

    // التحقق من وجود المورد
    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      return next(new AppError('المورد غير موجود', 404));
    }

    // التحقق من صحة المبلغ
    if (parseFloat(amount) <= 0) {
      return next(new AppError('المبلغ يجب أن يكون أكبر من صفر', 400));
    }

    // إنشاء رقم مرجعي فريد
    const referenceNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newPayment = await SupplierPayment.create({
      supplierId,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'bank_transfer',
      description: description || null,
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      referenceNumber,
      createdBy: req.user?.id || 1
    });

    res.status(201).json({
      status: 'success',
      data: {
        payment: newPayment
      }
    });
  } catch (error) {
    next(new AppError('خطأ في إضافة الدفعة', 500));
  }
};

// تحديث دفعة مورد
const updateSupplierPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, description, paymentDate, status } = req.body;

    const existingPayment = await SupplierPayment.findByPk(id);
    if (!existingPayment) {
      return next(new AppError('الدفعة غير موجودة', 404));
    }

    // التحقق من صحة المبلغ
    if (amount && parseFloat(amount) <= 0) {
      return next(new AppError('المبلغ يجب أن يكون أكبر من صفر', 400));
    }

    await existingPayment.update({
      amount: amount ? parseFloat(amount) : existingPayment.amount,
      paymentMethod: paymentMethod || existingPayment.paymentMethod,
      description: description !== undefined ? description : existingPayment.description,
      paymentDate: paymentDate || existingPayment.paymentDate,
      status: status || existingPayment.status,
      updatedBy: req.user?.id || 1
    });

    res.status(200).json({
      status: 'success',
      data: {
        payment: existingPayment
      }
    });
  } catch (error) {
    next(new AppError('خطأ في تحديث الدفعة', 500));
  }
};

// حذف دفعة مورد
const deleteSupplierPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await SupplierPayment.findByPk(id);
    if (!payment) {
      return next(new AppError('الدفعة غير موجودة', 404));
    }

    await payment.destroy();

    res.status(200).json({
      status: 'success',
      message: 'تم حذف الدفعة بنجاح'
    });
  } catch (error) {
    next(new AppError('خطأ في حذف الدفعة', 500));
  }
};

// الحصول على مدفوعات مورد
const getSupplierPayments = async (req, res, next) => {
  try {
    const { supplierId } = req.params;
    const { page = 1, limit = 10, status, paymentMethod, dateFrom, dateTo } = req.query;

    const whereClause = { supplierId };
    
    if (status) {
      whereClause.status = status;
    }
    
    if (paymentMethod) {
      whereClause.paymentMethod = paymentMethod;
    }
    
    if (dateFrom && dateTo) {
      whereClause.paymentDate = {
        [Op.between]: [new Date(dateFrom), new Date(dateTo)]
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows: payments } = await SupplierPayment.findAndCountAll({
      where: whereClause,
      order: [['paymentDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      status: 'success',
      data: {
        payments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(new AppError('خطأ في جلب المدفوعات', 500));
  }
};

// الحصول على إجمالي مدفوعات مورد
const getSupplierPaymentSummary = async (req, res, next) => {
  try {
    const { supplierId } = req.params;
    const { dateFrom, dateTo } = req.query;

    const whereClause = { supplierId };
    
    if (dateFrom && dateTo) {
      whereClause.paymentDate = {
        [Op.between]: [new Date(dateFrom), new Date(dateTo)]
      };
    }

    const payments = await SupplierPayment.findAll({
      where: whereClause,
      attributes: ['amount', 'status', 'paymentMethod']
    });

    const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const completedPayments = payments.filter(p => p.status === 'completed');
    const pendingPayments = payments.filter(p => p.status === 'pending');
    
    const completedAmount = completedPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const pendingAmount = pendingPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    // تجميع حسب طريقة الدفع
    const paymentMethods = {};
    payments.forEach(payment => {
      if (!paymentMethods[payment.paymentMethod]) {
        paymentMethods[payment.paymentMethod] = {
          count: 0,
          amount: 0
        };
      }
      paymentMethods[payment.paymentMethod].count++;
      paymentMethods[payment.paymentMethod].amount += parseFloat(payment.amount);
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalAmount,
        completedAmount,
        pendingAmount,
        totalPayments: payments.length,
        completedPayments: completedPayments.length,
        pendingPayments: pendingPayments.length,
        paymentMethods
      }
    });
  } catch (error) {
    next(new AppError('خطأ في جلب ملخص المدفوعات', 500));
  }
};

module.exports = {
  addSupplierPayment,
  updateSupplierPayment,
  deleteSupplierPayment,
  getSupplierPayments,
  getSupplierPaymentSummary
};