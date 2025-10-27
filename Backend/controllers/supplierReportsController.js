const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { 
  suppliersSchema: Supplier,
  SupplierInvoice,
  SupplierPayment,
  SupplierRating,
  Quotation,
  RFQ,
  InventoryMovement,
  GoodsReceipt
} = require("../Model/index");
const { Op } = require("sequelize");

class SupplierReportsController {
  // الحصول على تقارير الموردين الأساسية
  getSupplierReports = catchAsync(async (req, res, next) => {
    const { dateFrom, dateTo, category, status, search } = req.query;
    
    // بناء شروط البحث
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name_ar: { [Op.like]: `%${search}%` } },
        { name_en: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (status && status !== "الكل") {
      where.status = status;
    }
    
    // إضافة شروط التاريخ إذا تم توفيرها
    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) {
        where.created_at[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        where.created_at[Op.lte] = new Date(dateTo);
      }
    }

    const suppliers = await Supplier.findAll({
      where,
      order: [["supplier_id", "DESC"]]
    });
    
    // إضافة بيانات حقيقية من قاعدة البيانات
    const reportsData = await Promise.all(suppliers.map(async (supplier) => {
      // حساب إجمالي الفواتير
      const totalInvoices = await SupplierInvoice.findAll({
        where: { supplier_id: supplier.supplier_id },
        attributes: [
          [SupplierInvoice.sequelize.fn('COUNT', SupplierInvoice.sequelize.col('id')), 'count'],
          [SupplierInvoice.sequelize.fn('SUM', SupplierInvoice.sequelize.col('totalAmount')), 'totalAmount'],
          [SupplierInvoice.sequelize.fn('SUM', SupplierInvoice.sequelize.col('paidAmount')), 'paidAmount']
        ],
        raw: true
      });

      // حساب إجمالي المدفوعات
      const totalPayments = await SupplierPayment.findAll({
        where: { supplierId: supplier.supplier_id },
        attributes: [
          [SupplierPayment.sequelize.fn('COUNT', SupplierPayment.sequelize.col('id')), 'count'],
          [SupplierPayment.sequelize.fn('SUM', SupplierPayment.sequelize.col('amount')), 'totalAmount']
        ],
        raw: true
      });

      // حساب إجمالي الطلبيات (RFQs)
      const totalOrders = await RFQ.count({
        where: { selectedVendorId: supplier.supplier_id }
      });

      // حساب آخر طلبية
      const lastOrder = await RFQ.findOne({
        where: { selectedVendorId: supplier.supplier_id },
        order: [['createdAt', 'DESC']],
        attributes: ['createdAt']
      });

      // حساب التقييمات من Quotations
      const ratings = await Quotation.findAll({
        where: { supplierId: supplier.supplier_id },
        attributes: [
          [Quotation.sequelize.fn('AVG', Quotation.sequelize.col('vendorRating')), 'avgRating'],
          [Quotation.sequelize.fn('AVG', Quotation.sequelize.col('qualityScore')), 'avgQuality']
        ],
        raw: true
      });

      const invoiceData = totalInvoices[0] || { count: 0, totalAmount: 0, paidAmount: 0 };
      const paymentData = totalPayments[0] || { count: 0, totalAmount: 0 };
      const ratingData = ratings[0] || { avgRating: 0, avgQuality: 0 };

      const totalValue = parseFloat(invoiceData.totalAmount) || 0;
      const paidAmount = parseFloat(invoiceData.paidAmount) || 0;
      const remainingBalance = totalValue - paidAmount;

      return {
        id: supplier.supplier_id,
        name: supplier.name_ar || supplier.name_en,
        category: category || "غير محدد",
        status: supplier.is_active ? "نشط" : "موقوف",
        rating: Number((parseFloat(ratingData.avgRating) || 3.5).toFixed(1)),
        totalOrders: totalOrders,
        totalValue: totalValue,
        onTimeDelivery: 85, // يمكن حسابها من البيانات الفعلية لاحقاً
        complaints: 0, // يمكن إضافة جدول شكاوى لاحقاً
        returns: 0, // يمكن إضافة جدول مرتجعات لاحقاً
        lastOrder: lastOrder ? lastOrder.createdAt : null,
        totalPayments: parseFloat(paymentData.totalAmount) || 0,
        remainingBalance: remainingBalance
      };
    }));

    res.status(200).json({
      status: "success",
      data: reportsData
    });
  });

// الحصول على إحصائيات الموردين
  getSupplierReportStats = catchAsync(async (req, res, next) => {
    const { dateFrom, dateTo, category, status } = req.query;
    
    const where = {};
    if (status && status !== "الكل") {
      where.status = status;
    }
    
    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) {
        where.created_at[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        where.created_at[Op.lte] = new Date(dateTo);
      }
    }
    
    const totalSuppliers = await Supplier.count({ where });
    const activeSuppliers = await Supplier.count({ 
      where: { ...where, is_active: true } 
    });
    
    // حساب إجمالي قيمة الفواتير
    const totalInvoices = await SupplierInvoice.findAll({
      where: dateFrom || dateTo ? {
        invoiceDate: {
          ...(dateFrom && { [Op.gte]: new Date(dateFrom) }),
          ...(dateTo && { [Op.lte]: new Date(dateTo) })
        }
      } : {},
      attributes: [
        [SupplierInvoice.sequelize.fn('SUM', SupplierInvoice.sequelize.col('totalAmount')), 'totalAmount']
      ],
      raw: true
    });
    
    // حساب متوسط التقييم
    const averageRating = await Quotation.findAll({
      attributes: [
        [Quotation.sequelize.fn('AVG', Quotation.sequelize.col('vendorRating')), 'avgRating']
      ],
      raw: true
    });

    const stats = {
        totalSuppliers,
        activeSuppliers,
      totalOrderValue: parseFloat(totalInvoices[0]?.totalAmount) || 0,
      averageRating: Number((parseFloat(averageRating[0]?.avgRating) || 3.5).toFixed(1)),
      averageOnTime: 85 // يمكن حسابها من البيانات الفعلية لاحقاً
    };

    res.status(200).json({
      status: "success",
      data: stats
    });
  });

// تقرير أداء الموردين
  getSupplierPerformanceReport = catchAsync(async (req, res, next) => {
    const { dateFrom, dateTo, category } = req.query;
    
    const where = {};
    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) {
        where.created_at[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        where.created_at[Op.lte] = new Date(dateTo);
      }
    }

    const suppliers = await Supplier.findAll({
      where,
      order: [["supplier_id", "DESC"]]
    });

    const performanceData = await Promise.all(suppliers.map(async (supplier) => {
      // حساب التقييمات
      const ratings = await Quotation.findAll({
        where: { supplierId: supplier.supplier_id },
        attributes: [
          [Quotation.sequelize.fn('AVG', Quotation.sequelize.col('vendorRating')), 'avgRating'],
          [Quotation.sequelize.fn('AVG', Quotation.sequelize.col('qualityScore')), 'avgQuality']
        ],
        raw: true
      });

      // حساب إجمالي الطلبيات والقيمة
      const orders = await RFQ.findAll({
        where: { selectedVendorId: supplier.supplier_id },
        attributes: [
          [RFQ.sequelize.fn('COUNT', RFQ.sequelize.col('id')), 'count'],
          [RFQ.sequelize.fn('SUM', RFQ.sequelize.col('finalPrice')), 'totalValue']
        ],
        raw: true
      });

      // حساب إجمالي الفواتير
      const invoices = await SupplierInvoice.findAll({
        where: { supplier_id: supplier.supplier_id },
        attributes: [
          [SupplierInvoice.sequelize.fn('SUM', SupplierInvoice.sequelize.col('totalAmount')), 'totalAmount']
        ],
        raw: true
      });

      const ratingData = ratings[0] || { avgRating: 0, avgQuality: 0 };
      const orderData = orders[0] || { count: 0, totalValue: 0 };
      const invoiceData = invoices[0] || { totalAmount: 0 };
      
      return {
        id: supplier.supplier_id,
        name: supplier.name_ar || supplier.name_en,
        category: category || "غير محدد",
        status: supplier.is_active ? "نشط" : "موقوف",
        rating: Number((parseFloat(ratingData.avgRating) || 3.5).toFixed(1)),
        onTimeDelivery: 85, // يمكن حسابها من البيانات الفعلية لاحقاً
        totalOrders: parseInt(orderData.count) || 0,
        totalValue: parseFloat(orderData.totalValue) || parseFloat(invoiceData.totalAmount) || 0,
        complaints: 0 // يمكن إضافة جدول شكاوى لاحقاً
      };
    }));

    res.status(200).json({
      status: "success",
      data: performanceData
    });
  });

// تقرير مدفوعات الموردين
  getSupplierPaymentsReport = catchAsync(async (req, res, next) => {
    const { dateFrom, dateTo, status } = req.query;
    
    const where = {};
    if (status && status !== "الكل") {
      where.status = status;
    }
    
    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) {
        where.created_at[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        where.created_at[Op.lte] = new Date(dateTo);
      }
    }
    
    const suppliers = await Supplier.findAll({
      where,
      order: [["supplier_id", "DESC"]]
    });
    
    const paymentsData = await Promise.all(suppliers.map(async (supplier) => {
      // حساب إجمالي الفواتير
      const invoices = await SupplierInvoice.findAll({
        where: { supplier_id: supplier.supplier_id },
        attributes: [
          [SupplierInvoice.sequelize.fn('SUM', SupplierInvoice.sequelize.col('totalAmount')), 'totalAmount'],
          [SupplierInvoice.sequelize.fn('SUM', SupplierInvoice.sequelize.col('paidAmount')), 'paidAmount']
        ],
        raw: true
      });

      // حساب إجمالي المدفوعات
      const payments = await SupplierPayment.findAll({
        where: { supplierId: supplier.supplier_id },
        attributes: [
          [SupplierPayment.sequelize.fn('SUM', SupplierPayment.sequelize.col('amount')), 'totalAmount']
        ],
        raw: true
      });

      const invoiceData = invoices[0] || { totalAmount: 0, paidAmount: 0 };
      const paymentData = payments[0] || { totalAmount: 0 };

      const totalValue = parseFloat(invoiceData.totalAmount) || 0;
      const paidAmount = parseFloat(invoiceData.paidAmount) || 0;
      const totalPayments = parseFloat(paymentData.totalAmount) || 0;
      const remainingBalance = totalValue - paidAmount;
      
      return {
        id: supplier.supplier_id,
        name: supplier.name_ar || supplier.name_en,
        status: supplier.is_active ? "نشط" : "موقوف",
        totalValue,
        totalPayments,
        remainingBalance
      };
    }));

    res.status(200).json({
      status: "success",
      data: paymentsData
    });
    });

// تقرير طلبيات الموردين
  getSupplierOrdersReport = catchAsync(async (req, res, next) => {
    const { dateFrom, dateTo, category } = req.query;
    
    const where = {};
    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) {
        where.created_at[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        where.created_at[Op.lte] = new Date(dateTo);
      }
    }

    const suppliers = await Supplier.findAll({
      where,
      order: [["supplier_id", "DESC"]]
    });

    const ordersData = await Promise.all(suppliers.map(async (supplier) => {
      // حساب إجمالي الطلبيات من RFQs
      const orders = await RFQ.findAll({
        where: { selectedVendorId: supplier.supplier_id },
        attributes: [
          [RFQ.sequelize.fn('COUNT', RFQ.sequelize.col('id')), 'count'],
          [RFQ.sequelize.fn('SUM', RFQ.sequelize.col('finalPrice')), 'totalValue'],
          [RFQ.sequelize.fn('MAX', RFQ.sequelize.col('createdAt')), 'lastOrder']
        ],
        raw: true
      });

      // حساب إجمالي الفواتير كبديل
      const invoices = await SupplierInvoice.findAll({
        where: { supplier_id: supplier.supplier_id },
        attributes: [
          [SupplierInvoice.sequelize.fn('COUNT', SupplierInvoice.sequelize.col('id')), 'count'],
          [SupplierInvoice.sequelize.fn('SUM', SupplierInvoice.sequelize.col('totalAmount')), 'totalValue'],
          [SupplierInvoice.sequelize.fn('MAX', SupplierInvoice.sequelize.col('invoiceDate')), 'lastOrder']
        ],
        raw: true
      });

      const orderData = orders[0] || { count: 0, totalValue: 0, lastOrder: null };
      const invoiceData = invoices[0] || { count: 0, totalValue: 0, lastOrder: null };

      const totalOrders = parseInt(orderData.count) || parseInt(invoiceData.count) || 0;
      const totalValue = parseFloat(orderData.totalValue) || parseFloat(invoiceData.totalValue) || 0;
      const lastOrder = orderData.lastOrder || invoiceData.lastOrder;
      
      return {
        id: supplier.supplier_id,
        name: supplier.name_ar || supplier.name_en,
        category: category || "غير محدد",
        totalOrders,
        totalValue,
        lastOrder: lastOrder ? new Date(lastOrder).toISOString() : null
      };
    }));

    res.status(200).json({
      status: "success",
      data: ordersData
    });
  });

// تقرير شكاوى الموردين
  getSupplierComplaintsReport = catchAsync(async (req, res, next) => {
    const { dateFrom, dateTo, category } = req.query;
    
    const where = {};
    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) {
        where.created_at[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        where.created_at[Op.lte] = new Date(dateTo);
      }
    }

    const suppliers = await Supplier.findAll({
      where,
      order: [["supplier_id", "DESC"]]
    });
    
    const complaintsData = await Promise.all(suppliers.map(async (supplier) => {
      // حساب إجمالي الطلبيات
      const totalOrders = await RFQ.count({
        where: { selectedVendorId: supplier.supplier_id }
      });

      // حساب إجمالي الفواتير
      const totalInvoices = await SupplierInvoice.count({
        where: { supplier_id: supplier.supplier_id }
      });

      // حالياً لا توجد جداول شكاوى ومرتجعات، يمكن إضافتها لاحقاً
      const complaints = 0; // يمكن إضافة جدول شكاوى لاحقاً
      const returns = 0; // يمكن إضافة جدول مرتجعات لاحقاً
      
      return {
        id: supplier.supplier_id,
        name: supplier.name_ar || supplier.name_en,
        category: category || "غير محدد",
        totalOrders: totalOrders + totalInvoices,
        complaints,
        returns
      };
    }));

    res.status(200).json({
      status: "success",
      data: complaintsData
    });
  });

// تقرير مخاطر الموردين
  getSupplierRisksReport = catchAsync(async (req, res, next) => {
    const { dateFrom, dateTo } = req.query;
    
    const where = {};
    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) {
        where.created_at[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        where.created_at[Op.lte] = new Date(dateTo);
      }
    }

    const suppliers = await Supplier.findAll({
      where,
      order: [["supplier_id", "DESC"]]
    });

    const risksData = await Promise.all(suppliers.map(async (supplier) => {
      // حساب التقييم الحقيقي
      const ratings = await Quotation.findAll({
        where: { supplierId: supplier.supplier_id },
        attributes: [
          [Quotation.sequelize.fn('AVG', Quotation.sequelize.col('vendorRating')), 'avgRating']
        ],
        raw: true
      });

      // حساب آخر طلبية
      const lastOrder = await RFQ.findOne({
        where: { selectedVendorId: supplier.supplier_id },
        order: [['createdAt', 'DESC']],
        attributes: ['createdAt']
      });

      // حساب عدد الطلبيات
      const totalOrders = await RFQ.count({
        where: { selectedVendorId: supplier.supplier_id }
      });

      const rating = parseFloat(ratings[0]?.avgRating) || 3.5;
      const complaints = 0; // يمكن إضافة جدول شكاوى لاحقاً
      const onTimeDelivery = 85; // يمكن حسابها من البيانات الفعلية لاحقاً
      
      let status = "نشط";
      if (rating < 3 || complaints > 3 || onTimeDelivery < 70) {
        status = "عالي المخاطر";
      } else if (rating < 3.5 || complaints > 2) {
        status = "تحت المراقبة";
      }

      // تحديد حالة الخمول
      if (lastOrder) {
        const monthsAgo = new Date();
        monthsAgo.setMonth(monthsAgo.getMonth() - 3);
        if (new Date(lastOrder.createdAt) < monthsAgo) {
          status = "خامل";
        }
      } else if (totalOrders === 0) {
        status = "جديد";
      }
      
      return {
        id: supplier.supplier_id,
        name: supplier.name_ar || supplier.name_en,
        status,
        rating: Number(rating.toFixed(1)),
        complaints,
        onTimeDelivery,
        lastOrder: lastOrder ? lastOrder.createdAt.toISOString() : null
      };
    }));

    res.status(200).json({
      status: "success",
      data: risksData
    });
  });

  // تصدير التقرير
  exportSupplierReport = catchAsync(async (req, res, next) => {
    const { type, params, format } = req.body;
    
    // محاكاة تصدير التقرير
    const reportData = {
      type,
      params,
      format,
      generatedAt: new Date().toISOString(),
      status: "success"
    };
    
    res.status(200).json({
      status: "success",
      message: `تم تصدير التقرير بنجاح`,
      data: reportData
    });
  });

  // إضافة تقييم مورد
  addSupplierRating = catchAsync(async (req, res, next) => {
    const { supplierId, rating, comment, category } = req.body;
    
    if (!supplierId || !rating) {
      return next(new AppError("معرف المورد والتقييم مطلوبان", 400));
    }

    // التحقق من وجود المورد
    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      return next(new AppError("المورد غير موجود", 404));
    }

    // التحقق من صحة التقييم
    if (rating < 1 || rating > 5) {
      return next(new AppError("التقييم يجب أن يكون بين 1 و 5", 400));
    }
    
    // إضافة التقييم إلى قاعدة البيانات
    const ratingData = await SupplierRating.create({
      supplier_id: supplierId,
      rating: parseFloat(rating),
      comment: comment || null,
      category: category || 'quality',
      rated_by: req.user?.id || 1 // يمكن الحصول على معرف المستخدم من المصادقة
    });
    
    res.status(201).json({
      status: "success",
      message: "تم إضافة التقييم بنجاح",
      data: ratingData
    });
  });

  // تحديث تقييم مورد
  updateSupplierRating = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { rating, comment, category } = req.body;
    
    // البحث عن التقييم
    const existingRating = await SupplierRating.findByPk(id);
    if (!existingRating) {
      return next(new AppError("التقييم غير موجود", 404));
    }

    // التحقق من صحة التقييم
    if (rating && (rating < 1 || rating > 5)) {
      return next(new AppError("التقييم يجب أن يكون بين 1 و 5", 400));
    }
    
    // تحديث التقييم في قاعدة البيانات
    await existingRating.update({
      rating: rating ? parseFloat(rating) : existingRating.rating,
      comment: comment !== undefined ? comment : existingRating.comment,
      category: category || existingRating.category
    });
    
    res.status(200).json({
      status: "success",
      message: "تم تحديث التقييم بنجاح",
      data: existingRating
    });
  });

  // حذف تقييم مورد
  deleteSupplierRating = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    // البحث عن التقييم
    const existingRating = await SupplierRating.findByPk(id);
    if (!existingRating) {
      return next(new AppError("التقييم غير موجود", 404));
    }
    
    // حذف التقييم من قاعدة البيانات
    await existingRating.destroy();
    
    res.status(200).json({
      status: "success",
      message: "تم حذف التقييم بنجاح"
    });
  });

  // إضافة دفعة مورد
  addSupplierPayment = catchAsync(async (req, res, next) => {
    const { supplierId, amount, paymentMethod, description, paymentDate } = req.body;
    
    if (!supplierId || !amount) {
      return next(new AppError("معرف المورد والمبلغ مطلوبان", 400));
    }

    // التحقق من وجود المورد
    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      return next(new AppError("المورد غير موجود", 404));
    }

    // التحقق من صحة المبلغ
    if (parseFloat(amount) <= 0) {
      return next(new AppError("المبلغ يجب أن يكون أكبر من صفر", 400));
    }
    
    // إضافة الدفعة إلى قاعدة البيانات
    const paymentData = await SupplierPayment.create({
      supplierId: parseInt(supplierId),
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'bank_transfer',
      description: description || null,
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      status: 'completed',
      createdBy: req.user?.id || 1 // يمكن الحصول على معرف المستخدم من المصادقة
    });
    
    res.status(201).json({
      status: "success",
      message: "تم إضافة الدفعة بنجاح",
      data: paymentData
    });
  });

  // تحديث دفعة مورد
  updateSupplierPayment = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { amount, paymentMethod, description, paymentDate } = req.body;
    
    // البحث عن الدفعة
    const existingPayment = await SupplierPayment.findByPk(id);
    if (!existingPayment) {
      return next(new AppError("الدفعة غير موجودة", 404));
    }

    // التحقق من صحة المبلغ
    if (amount && parseFloat(amount) <= 0) {
      return next(new AppError("المبلغ يجب أن يكون أكبر من صفر", 400));
    }
    
    // تحديث الدفعة في قاعدة البيانات
    await existingPayment.update({
      amount: amount ? parseFloat(amount) : existingPayment.amount,
      paymentMethod: paymentMethod || existingPayment.paymentMethod,
      description: description !== undefined ? description : existingPayment.description,
      paymentDate: paymentDate || existingPayment.paymentDate,
      updatedBy: req.user?.id || 1
    });
    
    res.status(200).json({
      status: "success",
      message: "تم تحديث الدفعة بنجاح",
      data: existingPayment
    });
  });

  // حذف دفعة مورد
  deleteSupplierPayment = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    // البحث عن الدفعة
    const existingPayment = await SupplierPayment.findByPk(id);
    if (!existingPayment) {
      return next(new AppError("الدفعة غير موجودة", 404));
    }
    
    // حذف الدفعة من قاعدة البيانات
    await existingPayment.destroy();
    
    res.status(200).json({
      status: "success",
      message: "تم حذف الدفعة بنجاح"
    });
  });

  // الحصول على تفاصيل مورد
  getSupplierDetails = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return next(new AppError("المورد غير موجود", 404));
    }
    
    res.status(200).json({
      status: "success",
      data: supplier
    });
  });

  // الحصول على تقييمات مورد
  getSupplierRatings = catchAsync(async (req, res, next) => {
    const { supplierId } = req.query;
    
    const where = {};
    if (supplierId) {
      where.supplier_id = supplierId;
    }
    
    // الحصول على التقييمات من قاعدة البيانات
    const ratings = await SupplierRating.findAll({
      where,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['supplier_id', 'name_ar', 'name_en']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json({
      status: "success",
      data: ratings
    });
  });

  // الحصول على مدفوعات مورد
  getSupplierPayments = catchAsync(async (req, res, next) => {
    const { supplierId } = req.query;
    
    const where = {};
    if (supplierId) {
      where.supplierId = supplierId;
    }
    
    // الحصول على المدفوعات من قاعدة البيانات
    const payments = await SupplierPayment.findAll({
      where,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['supplier_id', 'name_ar', 'name_en']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      status: "success",
      data: payments
    });
  });

// تحديث حالة مورد
  updateSupplierStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return next(new AppError("المورد غير موجود", 404));
    }

    // تحديث حالة المورد
    await supplier.update({ 
      is_active: status === "نشط" || status === "متميز" 
    });

    res.status(200).json({
      status: "success",
      message: "تم تحديث حالة المورد بنجاح",
      data: supplier
    });
  });
}

module.exports = new SupplierReportsController();