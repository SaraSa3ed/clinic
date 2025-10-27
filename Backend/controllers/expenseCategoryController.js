const ExpenseCategory = require('../Model/expenseCategoryModel');
const Expense = require('../Model/expenseModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { Op } = require('sequelize');

// إنشاء فئة مصروفات جديدة
exports.createCategory = catchAsync(async (req, res, next) => {
  const { name, description, color, orderIndex } = req.body;

  // التحقق من عدم وجود فئة بنفس الاسم (على مستوى النظام)
  const existingCategory = await ExpenseCategory.findOne({ where: { name } });
  if (existingCategory) {
    return next(new AppError('فئة المصروفات موجودة بالفعل', 400));
  }

  // إنشاء الفئة
  const category = await ExpenseCategory.create({
    name,
    description,
    color: color || 'bg-blue-100 text-blue-800',
    orderIndex: orderIndex || 0,
    createdBy: req?.user?.id || null,
  });

  res.status(201).json({
    status: 'success',
    data: { category }
  });
});

// الحصول على جميع فئات المصروفات
exports.getAllCategories = catchAsync(async (req, res, next) => {
  const { isActive, search } = req.query;

  const whereClause = {};

  if (isActive !== undefined) {
    whereClause.isActive = isActive === 'true';
  }

  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const categories = await ExpenseCategory.findAll({
    where: whereClause,
    order: [['orderIndex', 'ASC'], ['name', 'ASC']]
  });

  res.status(200).json({
    status: 'success',
    data: { categories }
  });
});

// الحصول على فئة واحدة
exports.getCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const category = await ExpenseCategory.findOne({ where: { id } });
  if (!category) {
    return next(new AppError('فئة المصروفات غير موجودة', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { category }
  });
});

// تحديث فئة المصروفات
exports.updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, color, orderIndex, isActive } = req.body;

  const category = await ExpenseCategory.findOne({ where: { id } });
  if (!category) {
    return next(new AppError('فئة المصروفات غير موجودة', 404));
  }

  // التحقق من عدم وجود فئة أخرى بنفس الاسم
  if (name && name !== category.name) {
    const existingCategory = await ExpenseCategory.findOne({
      where: {
        name,
        id: { [Op.ne]: id }
      }
    });
    if (existingCategory) {
      return next(new AppError('فئة المصروفات موجودة بالفعل', 400));
    }
  }

  // تحديث الفئة
  await category.update({
    name: name || category.name,
    description: description !== undefined ? description : category.description,
    color: color || category.color,
    orderIndex: orderIndex !== undefined ? orderIndex : category.orderIndex,
    isActive: isActive !== undefined ? isActive : category.isActive,
    updatedBy: req?.user?.id || null,
  });

  res.status(200).json({
    status: 'success',
    data: { category }
  });
});

// حذف فئة المصروفات
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const category = await ExpenseCategory.findOne({ where: { id } });
  if (!category) {
    return next(new AppError('فئة المصروفات غير موجودة', 404));
  }

  // التحقق من وجود مصروفات مرتبطة بهذه الفئة
  const expensesCount = await Expense.count({ where: { categoryId: id } });
  if (expensesCount > 0) {
    return next(new AppError('لا يمكن حذف الفئة لوجود مصروفات مرتبطة بها', 400));
  }

  await category.destroy();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// تحديث ترتيب الفئات
exports.updateCategoryOrder = catchAsync(async (req, res, next) => {
  const { categories } = req.body;

  if (!Array.isArray(categories)) {
    return next(new AppError('بيانات الترتيب غير صحيحة', 400));
  }

  // تحديث ترتيب كل فئة
  const updatePromises = categories.map((category, index) =>
    ExpenseCategory.update(
      { orderIndex: index },
      { where: { id: category.id } }
    )
  );

  await Promise.all(updatePromises);

  res.status(200).json({
    status: 'success',
    message: 'تم تحديث ترتيب الفئات بنجاح'
  });
});

// الحصول على إحصائيات الفئة
exports.getCategoryStatistics = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;

  const category = await ExpenseCategory.findOne({ where: { id } });
  if (!category) {
    return next(new AppError('فئة المصروفات غير موجودة', 404));
  }

  const whereClause = { categoryId: id };
  if (startDate && endDate) {
    whereClause.expenseDate = { [Op.between]: [startDate, endDate] };
  }

  // إحصائيات الفئة
  const totalAmount = await Expense.sum('amount', { where: whereClause });
  const totalCount = await Expense.count({ where: whereClause });

  // إحصائيات حسب الحالة
  const pendingAmount = await Expense.sum('amount', { where: { ...whereClause, status: 'pending' } });
  const approvedAmount = await Expense.sum('amount', { where: { ...whereClause, status: 'approved' } });
  const rejectedAmount = await Expense.sum('amount', { where: { ...whereClause, status: 'rejected' } });

  const pendingCount = await Expense.count({ where: { ...whereClause, status: 'pending' } });
  const approvedCount = await Expense.count({ where: { ...whereClause, status: 'approved' } });
  const rejectedCount = await Expense.count({ where: { ...whereClause, status: 'rejected' } });

  res.status(200).json({
    status: 'success',
    data: {
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.color
      },
      statistics: {
        totalAmount: totalAmount || 0,
        totalCount,
        pendingAmount: pendingAmount || 0,
        approvedAmount: approvedAmount || 0,
        rejectedAmount: rejectedAmount || 0,
        pendingCount,
        approvedCount,
        rejectedCount
      }
    }
  });
});

// الحصول على فئات المصروفات مع الإحصائيات
exports.getCategoriesWithStatistics = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const expenseWhereClause = {};
  if (startDate && endDate) {
    expenseWhereClause.expenseDate = { [Op.between]: [startDate, endDate] };
  }

  const categories = await ExpenseCategory.findAll({
    order: [['orderIndex', 'ASC'], ['name', 'ASC']]
  });

  // إضافة الإحصائيات لكل فئة
  const categoriesWithStats = await Promise.all(
    categories.map(async (category) => {
      const totalAmount = await Expense.sum('amount', {
        where: { ...expenseWhereClause, categoryId: category.id }
      });
      const totalCount = await Expense.count({
        where: { ...expenseWhereClause, categoryId: category.id }
      });

      return {
        ...category.toJSON(),
        statistics: {
          totalAmount: totalAmount || 0,
          totalCount
        }
      };
    })
  );

  res.status(200).json({
    status: 'success',
    data: { categories: categoriesWithStats }
  });
});
