const Expense = require('../Model/expenseModel');
const ExpenseCategory = require('../Model/expenseCategoryModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { Op, fn, col } = require('sequelize');

// إنشاء مصروف جديد
exports.createExpense = catchAsync(async (req, res, next) => {
  const {
    title,
    amount,
    description,
    expenseDate,
    receiptNumber,
    paymentMethod,
    vendorName,
    vendorContact,
    notes,
    categoryId
  } = req.body;

  // التحقق من وجود الفئة
  const category = await ExpenseCategory.findByPk(categoryId);
  if (!category) {
    return next(new AppError('فئة المصروف غير موجودة', 404));
  }

  // إنشاء المصروف
  const expense = await Expense.create({
    title,
    amount: parseFloat(amount),
    description,
    expenseDate: expenseDate || new Date(),
    receiptNumber,
    paymentMethod,
    vendorName,
    vendorContact,
    notes,
    categoryId,
    createdBy: req?.user?.id
  });

  // جلب المصروف مع الفئة
  const expenseWithCategory = await Expense.findByPk(expense.id, {
    include: [
      {
        model: ExpenseCategory,
        as: 'category',
        attributes: ['id', 'name', 'description', 'color']
      }
    ]
  });

  res.status(201).json({
    status: 'success',
    data: {
      expense: expenseWithCategory
    }
  });
});

// الحصول على جميع المصروفات مع التصفية والبحث
exports.getAllExpenses = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 50,
    search = '',
    categoryId,
    status,
    startDate,
    endDate,
    sortBy = 'expenseDate',
    sortOrder = 'DESC'
  } = req.query;

  const offset = (page - 1) * limit;
  const whereClause = {};

  // إضافة شروط البحث
  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
      { vendorName: { [Op.iLike]: `%${search}%` } },
      { receiptNumber: { [Op.iLike]: `%${search}%` } }
    ];
  }

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  if (status) {
    whereClause.status = status;
  }

  if (startDate && endDate) {
    whereClause.expenseDate = {
      [Op.between]: [startDate, endDate]
    };
  }

  const { count, rows: expenses } = await Expense.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: ExpenseCategory,
        as: 'category',
        attributes: ['id', 'name', 'description', 'color']
      }
    ],
    order: [[sortBy, sortOrder]],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.status(200).json({
    status: 'success',
    data: {
      expenses,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    }
  });
});

// الحصول على مصروف واحد
exports.getExpense = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const expense = await Expense.findOne({
    where: { id },
    include: [
      {
        model: ExpenseCategory,
        as: 'category',
        attributes: ['id', 'name', 'description', 'color']
      }
    ]
  });

  if (!expense) {
    return next(new AppError('المصروف غير موجود', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      expense
    }
  });
});

// تحديث مصروف
exports.updateExpense = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    amount,
    description,
    expenseDate,
    receiptNumber,
    paymentMethod,
    vendorName,
    vendorContact,
    notes,
    categoryId
  } = req.body;

  const expense = await Expense.findOne({ where: { id } });

  if (!expense) {
    return next(new AppError('المصروف غير موجود', 404));
  }

  // التحقق من وجود الفئة إذا تم تحديثها
  if (categoryId && categoryId !== expense.categoryId) {
    const category = await ExpenseCategory.findByPk(categoryId);
    if (!category) {
      return next(new AppError('فئة المصروف غير موجودة', 404));
    }
  }

  // تحديث المصروف
  await expense.update({
    title: title || expense.title,
    amount: amount ? parseFloat(amount) : expense.amount,
    description: description !== undefined ? description : expense.description,
    expenseDate: expenseDate || expense.expenseDate,
    receiptNumber: receiptNumber || expense.receiptNumber,
    paymentMethod: paymentMethod || expense.paymentMethod,
    vendorName: vendorName || expense.vendorName,
    vendorContact: vendorContact || expense.vendorContact,
    notes: notes !== undefined ? notes : expense.notes,
    categoryId: categoryId || expense.categoryId,
    updatedBy: req?.user?.id || null
  });

  // جلب المصروف المحدث مع الفئة
  const updatedExpense = await Expense.findByPk(expense.id, {
    include: [
      {
        model: ExpenseCategory,
        as: 'category',
        attributes: ['id', 'name', 'description', 'color']
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    data: {
      expense: updatedExpense
    }
  });
});

// حذف مصروف
exports.deleteExpense = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const expense = await Expense.findOne({ where: { id } });

  if (!expense) {
    return next(new AppError('المصروف غير موجود', 404));
  }

  await expense.destroy();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// تحديث حالة المصروف
exports.updateExpenseStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  const expense = await Expense.findOne({
    where: {
      id,
      companyId: req.user.companyId
    }
  });

  if (!expense) {
    return next(new AppError('المصروف غير موجود', 404));
  }

  // التحقق من صحة الحالة
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return next(new AppError('حالة المصروف غير صحيحة', 400));
  }

  // تحديث الحالة
  const updateData = {
    status,
    updatedBy: req?.user?.id || null
  };

  if (status === 'approved') {
    updateData.approvedBy = req?.user?.id || null;
    updateData.approvedAt = new Date();
    updateData.rejectionReason = null;
  } else if (status === 'rejected') {
    updateData.rejectionReason = rejectionReason;
    updateData.approvedBy = null;
    updateData.approvedAt = null;
  }

  await expense.update(updateData);

  // جلب المصروف المحدث مع الفئة
  const updatedExpense = await Expense.findByPk(expense.id, {
    include: [
      {
        model: ExpenseCategory,
        as: 'category',
        attributes: ['id', 'name', 'description', 'color']
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    data: {
      expense: updatedExpense
    }
  });
});

// الحصول على إحصائيات المصروفات
exports.getExpenseStatistics = catchAsync(async (req, res, next) => {
  const { startDate, endDate, categoryId } = req.query;

  const whereClause = {};

  if (startDate && endDate) {
    whereClause.expenseDate = {
      [Op.between]: [startDate, endDate]
    };
  }

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  // إحصائيات عامة
  const totalExpenses = await Expense.sum('amount', { where: whereClause });
  const totalCount = await Expense.count({ where: whereClause });

  // إحصائيات حسب الحالة
  const pendingCount = await Expense.count({
    where: { ...whereClause, status: 'pending' }
  });
  const approvedCount = await Expense.count({
    where: { ...whereClause, status: 'approved' }
  });
  const rejectedCount = await Expense.count({
    where: { ...whereClause, status: 'rejected' }
  });

  // إحصائيات حسب الفئة
  const categoryStats = await Expense.findAll({
    attributes: [
      'categoryId',
      [fn('SUM', col('amount')), 'totalAmount'],
      [fn('COUNT', col('id')), 'count']
    ],
    where: whereClause,
    include: [
      {
        model: ExpenseCategory,
        as: 'category',
        attributes: ['id', 'name', 'color']
      }
    ],
    group: ['categoryId', 'category.id', 'category.name', 'category.color'],
    order: [[fn('SUM', col('amount')), 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    data: {
      statistics: {
        totalExpenses: totalExpenses || 0,
        totalCount,
        pendingCount,
        approvedCount,
        rejectedCount
      },
      categoryStats
    }
  });
});

// تصدير المصروفات
exports.exportExpenses = catchAsync(async (req, res, next) => {
  const { startDate, endDate, categoryId, status } = req.query;

  const whereClause = {};

  if (startDate && endDate) {
    whereClause.expenseDate = {
      [Op.between]: [startDate, endDate]
    };
  }

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  if (status) {
    whereClause.status = status;
  }

  const expenses = await Expense.findAll({
    where: whereClause,
    include: [
      {
        model: ExpenseCategory,
        as: 'category',
        attributes: ['id', 'name', 'description', 'color']
      }
    ],
    order: [['expenseDate', 'DESC']]
  });

  // تحويل البيانات إلى CSV
  const csvData = expenses.map(expense => ({
    'العنوان': expense.title,
    'المبلغ': expense.amount,
    'الفئة': expense.category?.name || 'غير محدد',
    'التاريخ': expense.expenseDate,
    'الحالة': expense.status,
    'رقم الإيصال': expense.receiptNumber || '',
    'طريقة الدفع': expense.paymentMethod || '',
    'اسم المورد': expense.vendorName || '',
    'الوصف': expense.description || ''
  }));

  res.status(200).json({
    status: 'success',
    data: {
      expenses: csvData
    }
  });
});
