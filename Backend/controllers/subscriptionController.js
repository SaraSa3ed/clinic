const Subscription = require('../Model/subscriptionModel');
const Plan = require('../Model/planModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { Op, fn, col } = require('sequelize');

// إنشاء اشتراك جديد
exports.createSubscription = catchAsync(async (req, res, next) => {
  const {
    customerId,
    customerName,
    customerEmail,
    customerPhone,
    planId,
    planName,
    planPrice,
    startDate,
    endDate,
    autoRenew,
    paymentMethod,
    discountCode
  } = req.body;

  // التحقق من وجود خطة
  const plan = await Plan.findOne({ where: { id: planId, isActive: true } });
  if (!plan) {
    return next(new AppError('الخطة غير موجودة', 404));
  }

  // التحقق من صحة التواريخ
  if (new Date(startDate) >= new Date(endDate)) {
    return next(new AppError('تاريخ البداية يجب أن يكون قبل تاريخ النهاية', 400));
  }

  // حساب المبلغ الإجمالي
  const totalPaid = parseFloat(planPrice);
  const discountAmount = discountCode ? parseFloat(planPrice) * 0.1 : 0; // خصم 10% إذا كان هناك كود خصم

  const subscription = await Subscription.create({
    customerId,
    customerName,
    customerEmail,
    customerPhone,
    planId,
    planName,
    planPrice: parseFloat(planPrice),
    startDate,
    endDate,
    autoRenew: Boolean(autoRenew),
    paymentMethod,
    totalPaid,
    discountApplied: discountCode,
    discountAmount,
    createdBy: null
  });

  res.status(201).json({
    status: 'success',
    data: {
      subscription
    }
  });
});

// الحصول على جميع الاشتراكات
exports.getAllSubscriptions = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 100000000,
    search,
    status,
    planId,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'DESC'
  } = req.query;

  const offset = (page - 1) * limit;
  
  // بناء شروط البحث
  const whereClause = { isActive: true };
  
  if (search) {
    whereClause[Op.or] = [
      { customerName: { [Op.like]: `%${search}%` } },
      { customerEmail: { [Op.like]: `%${search}%` } },
      { customerPhone: { [Op.like]: `%${search}%` } }
    ];
  }
  
  if (status && status !== 'all') {
    whereClause.status = status;
  }
  
  if (planId && planId !== 'all') {
    whereClause.planId = planId;
  }
  
  if (startDate && endDate) {
    whereClause.startDate = { [Op.gte]: startDate };
    whereClause.endDate = { [Op.lte]: endDate };
  }

  // بناء خيارات الترتيب
  const orderClause = [[sortBy, sortOrder.toUpperCase()]];

  const { count, rows: subscriptions } = await Subscription.findAndCountAll({
    where: whereClause,
    order: orderClause,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  const totalPages = Math.ceil(count / limit);

  res.status(200).json({
    status: 'success',
    results: count,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: count,
      itemsPerPage: parseInt(limit)
    },
    data: {
      subscriptions
    }
  });
});

// الحصول على اشتراك واحد
exports.getSubscription = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const subscription = await Subscription.findOne({
    where: { id, isActive: true }
  });

  if (!subscription) {
    return next(new AppError('الاشتراك غير موجود', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      subscription
    }
  });
});

// تحديث اشتراك
exports.updateSubscription = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const subscription = await Subscription.findOne({
    where: { id, isActive: true }
  });

  if (!subscription) {
    return next(new AppError('الاشتراك غير موجود', 404));
  }

  // التحقق من صحة التواريخ إذا تم تحديثها
  if (updateData.startDate && updateData.endDate) {
    if (new Date(updateData.startDate) >= new Date(updateData.endDate)) {
      return next(new AppError('تاريخ البداية يجب أن يكون قبل تاريخ النهاية', 400));
    }
  }

  // تحويل القيم الرقمية
  if (updateData.planPrice) updateData.planPrice = parseFloat(updateData.planPrice);
  if (updateData.totalPaid) updateData.totalPaid = parseFloat(updateData.totalPaid);
  if (updateData.discountAmount) updateData.discountAmount = parseFloat(updateData.discountAmount);

  // تحويل القيم المنطقية
  if (updateData.autoRenew !== undefined) updateData.autoRenew = Boolean(updateData.autoRenew);

  updateData.updatedBy = null;

  await subscription.update(updateData);

  res.status(200).json({
    status: 'success',
    data: {
      subscription
    }
  });
});

// حذف اشتراك
exports.deleteSubscription = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const subscription = await Subscription.findOne({
    where: { id, isActive: true }
  });

  if (!subscription) {
    return next(new AppError('الاشتراك غير موجود', 404));
  }

  await subscription.destroy(); // Soft delete

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// تبديل حالة الاشتراك
exports.toggleSubscriptionStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const subscription = await Subscription.findOne({
    where: { id, isActive: true }
  });

  if (!subscription) {
    return next(new AppError('الاشتراك غير موجود', 404));
  }

  await subscription.update({ status });

  res.status(200).json({
    status: 'success',
    data: {
      subscription
    }
  });
});

// الحصول على إحصائيات الاشتراكات
exports.getSubscriptionStats = catchAsync(async (req, res, next) => {
  const stats = await Subscription.findAll({
    where: { isActive: true },
    attributes: [
      'status',
      'planId',
      [fn('COUNT', col('id')), 'count'],
      [fn('SUM', col('totalPaid')), 'totalRevenue'],
      [fn('AVG', col('planPrice')), 'avgPlanPrice']
    ],
    group: ['status', 'planId']
  });

  // حساب الإحصائيات الإجمالية
  const totalSubscriptions = await Subscription.count({ where: { isActive: true } });
  const activeSubscriptions = await Subscription.count({ where: { isActive: true, status: 'نشط' } });
  const totalRevenue = await Subscription.sum('totalPaid', { where: { isActive: true } });
  const avgPlanPrice = await Subscription.findOne({
    where: { isActive: true },
    attributes: [[fn('AVG', col('planPrice')), 'avgPrice']]
  });

  res.status(200).json({
    status: 'success',
    data: {
      summary: {
        totalSubscriptions,
        activeSubscriptions,
        totalRevenue: totalRevenue || 0,
        avgPlanPrice: avgPlanPrice?.dataValues?.avgPrice || 0
      },
      detailedStats: stats
    }
  });
});

// البحث عن اشتراكات المريض
exports.getCustomerSubscriptions = catchAsync(async (req, res, next) => {
  const { customerId } = req.params;

  const subscriptions = await Subscription.findAll({
    where: { 
      customerId,
      isActive: true
    },
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: subscriptions.length,
    data: {
      subscriptions
    }
  });
});

// تصدير الاشتراكات
exports.exportSubscriptions = catchAsync(async (req, res, next) => {
  const { format = 'json' } = req.query;

  const subscriptions = await Subscription.findAll({
    where: { isActive: true },
    order: [['createdAt', 'DESC']]
  });

  if (format === 'csv') {
    // إنشاء CSV
    const headers = ['المريض', 'البريد الإلكتروني', 'الخطة', 'السعر', 'الحالة', 'تاريخ البداية', 'تاريخ النهاية', 'التجديد التلقائي'];
    const csvContent = [
      headers.join(','),
      ...subscriptions.map(sub => [
        sub.customerName,
        sub.customerEmail,
        sub.planName,
        sub.planPrice,
        sub.status,
        sub.startDate,
        sub.endDate,
        sub.autoRenew ? 'نعم' : 'لا'
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=subscriptions_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);
  } else {
    // إرجاع JSON
    res.status(200).json({
      status: 'success',
      results: subscriptions.length,
      data: {
        subscriptions
      }
    });
  }
});
