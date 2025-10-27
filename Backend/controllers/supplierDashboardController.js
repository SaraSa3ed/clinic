const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const suppliersRepository = require("../Model/repository/suppliersRepository");
const { Op } = require("sequelize");
const { 
  suppliersSchema,
  SupplierInvoice, 
  SupplierPayment, 
  SupplierRating 
} = require("../Model/index");
const SupplierContract = require("../Model/schema/supplierContractSchema");

class SupplierDashboardController {
  // جلب إحصائيات الموردين
  getSupplierStats = catchAsync(async (req, res, next) => {
    try {
      console.log("Getting supplier stats...");
      
      // جلب إجمالي الموردين
      const totalSuppliers = await suppliersRepository.count();
      console.log("Total suppliers:", totalSuppliers);
      
      // جلب الموردين النشطين
      const activeSuppliers = await suppliersRepository.count({ 
        where: { isActive: true } 
      });
      console.log("Active suppliers:", activeSuppliers);
      
      // حساب معدل النمو (مقارنة بالشهر السابق)
      const currentDate = new Date();
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const currentMonthSuppliers = await suppliersRepository.count({
        where: {
          created_at: {
            [Op.gte]: startOfCurrentMonth
          }
        }
      });
      
      const lastMonthSuppliers = await suppliersRepository.count({
        where: {
          created_at: {
            [Op.gte]: lastMonth,
            [Op.lt]: startOfCurrentMonth
          }
        }
      });
      
      const growthRate = lastMonthSuppliers > 0 
        ? Math.round(((currentMonthSuppliers - lastMonthSuppliers) / lastMonthSuppliers) * 100)
        : currentMonthSuppliers > 0 ? 100 : 0;
      
      // حساب معدل نمو الموردين النشطين
      const lastMonthActiveSuppliers = await suppliersRepository.count({
        where: {
          is_active: true,
          created_at: {
            [Op.gte]: lastMonth,
            [Op.lt]: startOfCurrentMonth
          }
        }
      });
      
      const currentMonthActiveSuppliers = await suppliersRepository.count({
        where: {
          is_active: true,
          created_at: {
            [Op.gte]: startOfCurrentMonth
          }
        }
      });
      
      const activeGrowthRate = lastMonthActiveSuppliers > 0 
        ? Math.round(((currentMonthActiveSuppliers - lastMonthActiveSuppliers) / lastMonthActiveSuppliers) * 100)
        : currentMonthActiveSuppliers > 0 ? 100 : 0;
      
      // حساب إجمالي المشتريات من جدول الفواتير
      const currentMonthPurchases = await SupplierInvoice.sum('totalAmount', {
        where: {
          invoiceDate: {
            [Op.gte]: startOfCurrentMonth
          },
          status: {
            [Op.notIn]: ['ملغي']
          }
        }
      }) || 0;
      
      const lastMonthPurchases = await SupplierInvoice.sum('totalAmount', {
        where: {
          invoiceDate: {
            [Op.gte]: lastMonth,
            [Op.lt]: startOfCurrentMonth
          },
          status: {
            [Op.notIn]: ['ملغي']
          }
        }
      }) || 0;
      
      const purchasesGrowthRate = lastMonthPurchases > 0 
        ? Math.round(((currentMonthPurchases - lastMonthPurchases) / lastMonthPurchases) * 100)
        : currentMonthPurchases > 0 ? 100 : 0;
      
      // حساب الطلبات المعلقة من جدول الفواتير
      const pendingRequests = await SupplierInvoice.count({
        where: {
          approvalStatus: 'في_انتظار',
          status: {
            [Op.notIn]: ['ملغي', 'مدفوع']
          }
        }
      });
      
      // حساب المناطق المغطاة من عناوين الموردين
      const suppliers = await suppliersSchema.findAll({
        where: { is_active: true },
        attributes: ['address_ar', 'address_en']
      });
      
      const regions = new Set();
      suppliers.forEach(supplier => {
        if (supplier.address_ar) {
          const address = supplier.address_ar.split(',')[0]?.trim();
          if (address) regions.add(address);
        }
        if (supplier.address_en) {
          const address = supplier.address_en.split(',')[0]?.trim();
          if (address) regions.add(address);
        }
      });
      
      const coveredRegions = regions.size || 1;

      const stats = {
        totalSuppliers,
        activeSuppliers,
        totalPurchases: Math.round(currentMonthPurchases),
        pendingRequests,
        growthRate,
        activeGrowthRate,
        purchasesGrowthRate,
        coveredRegions
      };

      console.log("Stats calculated:", stats);

      res.status(200).json({
        status: "success",
        data: stats
      });
    } catch (error) {
      console.error("Error getting supplier stats:", error);
      return next(new AppError(`Error getting supplier statistics: ${error.message}`, 500));
    }
  });

  // جلب أفضل الموردين
  getTopSuppliers = catchAsync(async (req, res, next) => {
    try {
      console.log("Controller: Getting top suppliers...");
      const limit = parseInt(req.query.limit) || 10;
      console.log("Controller: Limit requested:", limit);
      
      // جلب الموردين النشطين
      const suppliers = await suppliersSchema.findAll({
        where: { is_active: true },
        attributes: ['supplier_id', 'name_ar', 'name_en', 'category', 'is_active', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: limit * 2 // جلب ضعف العدد لتصفية أفضلهم
      });
      
      console.log("Controller: Found suppliers:", suppliers.length);
      
      // حساب البيانات الحقيقية لكل مورد
      const suppliersWithData = await Promise.all(suppliers.map(async (supplier) => {
        const supplierData = supplier.toJSON ? supplier.toJSON() : supplier;
        const supplierId = supplierData.supplier_id || supplierData.id;
        
        // حساب متوسط التقييم من جدول التقييمات
        const avgRating = await SupplierRating.findOne({
          where: { supplier_id: supplierId },
          attributes: [
            [SupplierInvoice.sequelize.fn('AVG', SupplierInvoice.sequelize.col('rating')), 'avgRating']
          ],
          raw: true
        });
        
        // حساب إجمالي المبالغ من جدول الفواتير
        const totalAmount = await SupplierInvoice.sum('totalAmount', {
          where: {
            supplier_id: supplierId,
            status: {
              [Op.notIn]: ['ملغي']
            }
          }
        }) || 0;
        
        // حساب عدد الفواتير
        const invoiceCount = await SupplierInvoice.count({
          where: {
            supplier_id: supplierId,
            status: {
              [Op.notIn]: ['ملغي']
            }
          }
        });
        
        // حساب معدل التسليم في الوقت المحدد
        const onTimeDeliveries = await SupplierInvoice.count({
          where: {
            supplier_id: supplierId,
            deliveryDate: {
              [Op.not]: null
            },
            [Op.and]: [
              SupplierInvoice.sequelize.where(
                SupplierInvoice.sequelize.col('deliveryDate'),
                '<=',
                SupplierInvoice.sequelize.col('dueDate')
              )
            ]
          }
        });
        
        const onTimeRate = invoiceCount > 0 ? (onTimeDeliveries / invoiceCount) * 100 : 0;
        
        return {
          ...supplierData,
          id: supplierId,
          supplierRating: avgRating?.avgRating ? parseFloat(avgRating.avgRating).toFixed(1) : (invoiceCount > 0 ? 4.0 : 3.5),
          totalAmount: Math.round(totalAmount),
          supplierCategory: supplierData.category || 'عام',
          status: supplierData.is_active ? 'نشط' : 'غير نشط',
          invoiceCount,
          onTimeRate: Math.round(onTimeRate),
          score: (parseFloat(avgRating?.avgRating || 3.5) * 0.4) + ((onTimeRate / 100) * 0.3) + ((totalAmount / 1000000) * 0.3)
        };
      }));
      
      // ترتيب حسب النتيجة الإجمالية والحد بالعدد المطلوب
      const topSuppliers = suppliersWithData
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ score, ...supplier }) => supplier); // إزالة الـ score من النتيجة النهائية
      
      console.log("Controller: Top suppliers processed:", topSuppliers.length);
      
      res.status(200).json({
        status: "success",
        data: topSuppliers
      });
    } catch (error) {
      console.error("Controller: Error getting top suppliers:", error);
      console.error("Controller: Error stack:", error.stack);
      
      // إرسال استجابة خطأ مفصلة
      res.status(500).json({
        status: "error",
        message: `Error getting top suppliers: ${error.message}`,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // جلب نشاط الموردين
  getSupplierActivity = catchAsync(async (req, res, next) => {
    try {
      console.log("Getting supplier activity...");
      const days = parseInt(req.query.days) || 30;
      const supplierId = req.query.supplierId;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const whereClause = {
        createdAt: {
          [Op.gte]: startDate
        }
      };
      
      if (supplierId) {
        whereClause.supplier_id = supplierId;
      }
      
      // جلب أنشطة الفواتير
      const invoiceActivities = await SupplierInvoice.findAll({
        where: whereClause,
        attributes: ['id', 'invoiceNumber', 'supplier_id', 'status', 'totalAmount', 'createdAt'],
        include: [{
          model: suppliersSchema,
          as: 'supplier',
          attributes: ['name_ar', 'name_en']
        }],
        order: [['createdAt', 'DESC']],
        limit: 10
      });
      
      // جلب أنشطة المدفوعات
      const paymentActivities = await SupplierPayment.findAll({
        where: {
          createdAt: {
            [Op.gte]: startDate
          },
          ...(supplierId ? { supplier_id: supplierId } : {})
        },
        attributes: ['id', 'amount', 'paymentMethod', 'supplier_id', 'createdAt'],
        include: [{
          model: suppliersSchema,
          as: 'supplier',
          attributes: ['name_ar', 'name_en']
        }],
        order: [['createdAt', 'DESC']],
        limit: 10
      });
      
      // جلب أنشطة التقييمات
      const ratingActivities = await SupplierRating.findAll({
        where: {
          createdAt: {
            [Op.gte]: startDate
          },
          ...(supplierId ? { supplier_id: supplierId } : {})
        },
        attributes: ['id', 'rating', 'category', 'supplier_id', 'createdAt'],
        include: [{
          model: suppliersSchema,
          as: 'supplier',
          attributes: ['name_ar', 'name_en']
        }],
        order: [['createdAt', 'DESC']],
        limit: 10
      });
      
      // دمج وتنسيق الأنشطة
      const getTimeAgo = (date) => {
        const now = new Date();
        const diffInMs = now - new Date(date);
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
        if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
        if (diffInDays === 1) return 'منذ يوم واحد';
        return `منذ ${diffInDays} يوم`;
      };
      
      const activities = [
        ...invoiceActivities.map(inv => ({
          id: `invoice-${inv.id}`,
          description: `فاتورة جديدة: ${inv.invoiceNumber} - ${inv.supplier?.name_ar || 'مورد'} - ${Math.round(inv.totalAmount)} ج.م`,
          timeAgo: getTimeAgo(inv.createdAt),
          type: 'فاتورة',
          status: inv.status
        })),
        ...paymentActivities.map(pay => ({
          id: `payment-${pay.id}`,
          description: `دفعة: ${Math.round(pay.amount)} ج.م - ${pay.supplier?.name_ar || 'مورد'} - ${pay.paymentMethod}`,
          timeAgo: getTimeAgo(pay.createdAt),
          type: 'دفعة'
        })),
        ...ratingActivities.map(rat => ({
          id: `rating-${rat.id}`,
          description: `تقييم: ${rat.rating}/5 - ${rat.supplier?.name_ar || 'مورد'} - ${rat.category}`,
          timeAgo: getTimeAgo(rat.createdAt),
          type: 'تقييم'
        }))
      ];
      
      // ترتيب حسب التاريخ
      activities.sort((a, b) => {
        const dateA = invoiceActivities.find(inv => `invoice-${inv.id}` === a.id)?.createdAt ||
                     paymentActivities.find(pay => `payment-${pay.id}` === a.id)?.createdAt ||
                     ratingActivities.find(rat => `rating-${rat.id}` === a.id)?.createdAt;
        const dateB = invoiceActivities.find(inv => `invoice-${inv.id}` === b.id)?.createdAt ||
                     paymentActivities.find(pay => `payment-${pay.id}` === b.id)?.createdAt ||
                     ratingActivities.find(rat => `rating-${rat.id}` === b.id)?.createdAt;
        return new Date(dateB) - new Date(dateA);
      });
      
      console.log("Activities found:", activities.length);
      
      res.status(200).json({
        status: "success",
        data: activities.slice(0, 15) // أخذ أحدث 15 نشاط
      });
    } catch (error) {
      console.error("Error getting supplier activity:", error);
      return next(new AppError(`Error getting supplier activity: ${error.message}`, 500));
    }
  });

  // جلب مؤشرات الأداء
  getSupplierPerformance = catchAsync(async (req, res, next) => {
    try {
      console.log("Getting supplier performance...");
      const period = req.query.period || 'month';
      const category = req.query.category;
      const region = req.query.region;
      
      // تحديد الفترة الزمنية
      const now = new Date();
      let startDate;
      
      switch(period) {
        case 'week':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      // شروط البحث
      const invoiceWhere = {
        invoiceDate: {
          [Op.gte]: startDate
        },
        status: {
          [Op.notIn]: ['ملغي']
        }
      };
      
      // حساب معدل التسليم في الوقت المحدد
      const totalDeliveries = await SupplierInvoice.count({
        where: {
          ...invoiceWhere,
          deliveryDate: {
            [Op.not]: null
          },
          dueDate: {
            [Op.not]: null
          }
        }
      });
      
      const onTimeDeliveries = await SupplierInvoice.count({
        where: {
          ...invoiceWhere,
          deliveryDate: {
            [Op.not]: null
          },
          dueDate: {
            [Op.not]: null
          },
          [Op.and]: [
            SupplierInvoice.sequelize.where(
              SupplierInvoice.sequelize.col('deliveryDate'),
              '<=',
              SupplierInvoice.sequelize.col('dueDate')
            )
          ]
        }
      });
      
      const onTimeDeliveryRate = totalDeliveries > 0 
        ? Math.round((onTimeDeliveries / totalDeliveries) * 100) 
        : 0;
      
      // حساب متوسط التقييم من جدول التقييمات
      const ratingWhere = {
        createdAt: {
          [Op.gte]: startDate
        }
      };
      
      const avgRatingResult = await SupplierRating.findOne({
        where: ratingWhere,
        attributes: [
          [SupplierRating.sequelize.fn('AVG', SupplierRating.sequelize.col('rating')), 'avgRating']
        ],
        raw: true
      });
      
      const averageRating = avgRatingResult?.avgRating 
        ? parseFloat(avgRatingResult.avgRating).toFixed(1) 
        : 0;
      
      // حساب معدل جودة المنتجات من تقييمات الجودة
      const qualityRatings = await SupplierRating.findAll({
        where: {
          ...ratingWhere,
          category: 'quality'
        },
        attributes: ['rating']
      });
      
      let qualityRate = 0;
      if (qualityRatings.length > 0) {
        const totalQualityRating = qualityRatings.reduce((sum, r) => sum + parseFloat(r.rating), 0);
        qualityRate = Math.round((totalQualityRating / qualityRatings.length) * 20); // تحويل من 5 إلى 100
      }
      
      // حساب معدل الاستجابة (من حالة الفواتير)
      const totalInvoices = await SupplierInvoice.count({
        where: invoiceWhere
      });
      
      const processedInvoices = await SupplierInvoice.count({
        where: {
          ...invoiceWhere,
          status: {
            [Op.in]: ['مؤكد', 'مدفوع', 'مستلم']
          }
        }
      });
      
      const responseRate = totalInvoices > 0 
        ? Math.round((processedInvoices / totalInvoices) * 100) 
        : 0;
      
      // حساب معدل الإلغاء
      const cancelledInvoices = await SupplierInvoice.count({
        where: {
          invoiceDate: {
            [Op.gte]: startDate
          },
          status: 'ملغي'
        }
      });
      
      const totalWithCancelled = totalInvoices + cancelledInvoices;
      const cancellationRate = totalWithCancelled > 0 
        ? Math.round((cancelledInvoices / totalWithCancelled) * 100) 
        : 0;

      const performance = {
        onTimeDelivery: onTimeDeliveryRate,
        averageRating: parseFloat(averageRating),
        qualityRate: qualityRate,
        responseRate: responseRate,
        cancellationRate: cancellationRate,
        totalDeliveries: totalDeliveries,
        totalInvoices: totalInvoices
      };
      
      console.log("Performance calculated:", performance);
      
      res.status(200).json({
        status: "success",
        data: performance
      });
    } catch (error) {
      console.error("Error getting supplier performance:", error);
      return next(new AppError(`Error getting supplier performance: ${error.message}`, 500));
    }
  });

  // جلب التنبيهات
  getSupplierAlerts = catchAsync(async (req, res, next) => {
    try {
      console.log("Getting supplier alerts...");
      
      const alerts = [];
      const now = new Date();
      
      // 1. تنبيهات الفواتير المتأخرة
      const overdueInvoices = await SupplierInvoice.findAll({
        where: {
          dueDate: {
            [Op.lt]: now
          },
          remainingAmount: {
            [Op.gt]: 0
          },
          status: {
            [Op.notIn]: ['ملغي', 'مدفوع']
          }
        },
        include: [{
          model: suppliersSchema,
          as: 'supplier',
          attributes: ['name_ar', 'name_en']
        }],
        order: [['dueDate', 'ASC']],
        limit: 10
      });
      
      overdueInvoices.forEach(invoice => {
        const daysOverdue = Math.ceil((now - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24));
        alerts.push({
          id: `overdue-${invoice.id}`,
          title: "فاتورة متأخرة",
          message: `فاتورة ${invoice.invoiceNumber} للمورد ${invoice.supplier?.name_ar || 'غير محدد'} متأخرة ${daysOverdue} يوم - المبلغ المتبقي: ${Math.round(invoice.remainingAmount)} ج.م`,
          type: "error",
          priority: daysOverdue > 30 ? "high" : "medium",
          invoiceId: invoice.id,
          supplierId: invoice.supplier_id,
          daysOverdue: daysOverdue
        });
      });
      
      // 2. تنبيهات الفواتير المعلقة للموافقة
      const pendingInvoices = await SupplierInvoice.findAll({
        where: {
          approvalStatus: 'في_انتظار',
          status: {
            [Op.notIn]: ['ملغي']
          }
        },
        include: [{
          model: suppliersSchema,
          as: 'supplier',
          attributes: ['name_ar', 'name_en']
        }],
        order: [['createdAt', 'ASC']],
        limit: 10
      });
      
      pendingInvoices.forEach(invoice => {
        const daysWaiting = Math.ceil((now - new Date(invoice.createdAt)) / (1000 * 60 * 60 * 24));
        alerts.push({
          id: `pending-${invoice.id}`,
          title: "فاتورة في انتظار الموافقة",
          message: `فاتورة ${invoice.invoiceNumber} للمورد ${invoice.supplier?.name_ar || 'غير محدد'} في انتظار الموافقة منذ ${daysWaiting} يوم - المبلغ: ${Math.round(invoice.totalAmount)} ج.م`,
          type: "warning",
          priority: daysWaiting > 3 ? "high" : "medium",
          invoiceId: invoice.id,
          supplierId: invoice.supplier_id
        });
      });
      
      // 3. تنبيهات التقييمات المنخفضة
      const lowRatings = await SupplierRating.findAll({
        where: {
          rating: {
            [Op.lt]: 3
          },
          createdAt: {
            [Op.gte]: new Date(now.getFullYear(), now.getMonth() - 1, 1) // آخر شهر
          }
        },
        include: [{
          model: suppliersSchema,
          as: 'supplier',
          attributes: ['name_ar', 'name_en']
        }],
        order: [['createdAt', 'DESC']],
        limit: 5
      });
      
      lowRatings.forEach(rating => {
        alerts.push({
          id: `rating-${rating.id}`,
          title: "تقييم منخفض",
          message: `المورد ${rating.supplier?.name_ar || 'غير محدد'} حصل على تقييم ${rating.rating}/5 في فئة ${rating.category}`,
          type: "error",
          priority: rating.rating < 2 ? "high" : "medium",
          supplierId: rating.supplier_id,
          ratingId: rating.id
        });
      });
      
      // 4. تنبيهات الفواتير التي تقترب من تاريخ الاستحقاق
      const upcomingDue = new Date(now);
      upcomingDue.setDate(upcomingDue.getDate() + 7); // خلال 7 أيام
      
      const soonDueInvoices = await SupplierInvoice.findAll({
        where: {
          dueDate: {
            [Op.between]: [now, upcomingDue]
          },
          remainingAmount: {
            [Op.gt]: 0
          },
          status: {
            [Op.notIn]: ['ملغي', 'مدفوع']
          }
        },
        include: [{
          model: suppliersSchema,
          as: 'supplier',
          attributes: ['name_ar', 'name_en']
        }],
        order: [['dueDate', 'ASC']],
        limit: 5
      });
      
      soonDueInvoices.forEach(invoice => {
        const daysUntilDue = Math.ceil((new Date(invoice.dueDate) - now) / (1000 * 60 * 60 * 24));
        alerts.push({
          id: `soon-due-${invoice.id}`,
          title: "فاتورة تقترب من موعد الاستحقاق",
          message: `فاتورة ${invoice.invoiceNumber} للمورد ${invoice.supplier?.name_ar || 'غير محدد'} تستحق خلال ${daysUntilDue} يوم - المبلغ: ${Math.round(invoice.remainingAmount)} ج.م`,
          type: "info",
          priority: "low",
          invoiceId: invoice.id,
          supplierId: invoice.supplier_id
        });
      });
      
      // ترتيب حسب الأولوية والتاريخ
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      
      console.log("Alerts found:", alerts.length);
      
      res.status(200).json({
        status: "success",
        data: alerts
      });
    } catch (error) {
      console.error("Error getting supplier alerts:", error);
      return next(new AppError(`Error getting supplier alerts: ${error.message}`, 500));
    }
  });

  // جلب العقود النشطة
  getActiveContracts = catchAsync(async (req, res, next) => {
    try {
      console.log("Getting active contracts...");
      const status = req.query.status || 'ساري';
      const supplierId = req.query.supplierId;
      const expiryDate = req.query.expiryDate;
      
      const whereClause = {
        status: status
      };
      
      if (supplierId) {
        whereClause.supplier_id = supplierId;
      }
      
      // إذا كان هناك تاريخ انتهاء محدد، نبحث عن العقود التي تنتهي قبل هذا التاريخ
      if (expiryDate) {
        whereClause.end_date = {
          [Op.lte]: new Date(expiryDate)
        };
      }
      
      // جلب العقود النشطة من قاعدة البيانات
      const contracts = await SupplierContract.findAll({
        where: whereClause,
        order: [['end_date', 'ASC']],
        limit: 50
      });
      
      // تنسيق البيانات
      const formattedContracts = contracts.map(contract => {
        const contractData = contract.toJSON ? contract.toJSON() : contract;
        const now = new Date();
        const endDate = new Date(contractData.end_date);
        const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        
        return {
          id: contractData.contract_id,
          supplierName: contractData.supplier_name || 'غير محدد',
          contractNumber: contractData.contract_number,
          startDate: contractData.start_date,
          endDate: contractData.end_date,
          value: Math.round(contractData.contract_value || 0),
          status: contractData.status,
          contractType: contractData.contract_type,
          paymentTerms: contractData.payment_terms,
          daysUntilExpiry: daysUntilExpiry,
          isExpiringSoon: daysUntilExpiry <= 30 && daysUntilExpiry > 0,
          isExpired: daysUntilExpiry < 0
        };
      });
      
      console.log("Contracts found:", formattedContracts.length);
      
      res.status(200).json({
        status: "success",
        data: formattedContracts
      });
    } catch (error) {
      console.error("Error getting active contracts:", error);
      return next(new AppError(`Error getting active contracts: ${error.message}`, 500));
    }
  });

  // جلب المدفوعات
  getSupplierPayments = catchAsync(async (req, res, next) => {
    try {
      console.log("Getting supplier payments...");
      const status = req.query.status;
      const supplierId = req.query.supplierId;
      const dateFrom = req.query.dateFrom;
      const dateTo = req.query.dateTo;
      
      const whereClause = {};
      
      if (status) {
        // تحويل الحالات العربية إلى الإنجليزية
        const statusMap = {
          'معلق': 'pending',
          'مكتمل': 'completed',
          'ملغي': 'cancelled'
        };
        whereClause.status = statusMap[status] || status;
      }
      
      if (supplierId) {
        whereClause.supplier_id = supplierId;
      }
      
      if (dateFrom || dateTo) {
        whereClause.paymentDate = {};
        if (dateFrom) {
          whereClause.paymentDate[Op.gte] = new Date(dateFrom);
        }
        if (dateTo) {
          whereClause.paymentDate[Op.lte] = new Date(dateTo);
        }
      }
      
      // جلب المدفوعات من قاعدة البيانات
      const payments = await SupplierPayment.findAll({
        where: whereClause,
        include: [
          {
            model: suppliersSchema,
            as: 'supplier',
            attributes: ['name_ar', 'name_en']
          },
          {
            model: SupplierInvoice,
            as: 'invoice',
            attributes: ['invoiceNumber', 'dueDate'],
            required: false
          }
        ],
        order: [['paymentDate', 'DESC']],
        limit: 100
      });
      
      // تنسيق البيانات
      const formattedPayments = payments.map(payment => {
        const paymentData = payment.toJSON ? payment.toJSON() : payment;
        
        // تحويل الحالات من الإنجليزية إلى العربية
        const statusMapReverse = {
          'pending': 'معلق',
          'completed': 'مكتمل',
          'cancelled': 'ملغي'
        };
        
        return {
          id: paymentData.id,
          supplierName: paymentData.supplier?.name_ar || 'غير محدد',
          invoiceNumber: paymentData.invoice?.invoiceNumber || 'غير محدد',
          amount: Math.round(paymentData.amount || 0),
          paymentDate: paymentData.paymentDate,
          dueDate: paymentData.invoice?.dueDate || null,
          status: statusMapReverse[paymentData.status] || paymentData.status,
          paymentMethod: paymentData.paymentMethod,
          referenceNumber: paymentData.referenceNumber,
          description: paymentData.description
        };
      });
      
      console.log("Payments found:", formattedPayments.length);
      
      res.status(200).json({
        status: "success",
        data: formattedPayments
      });
    } catch (error) {
      console.error("Error getting supplier payments:", error);
      return next(new AppError(`Error getting supplier payments: ${error.message}`, 500));
    }
  });

  // تصدير بيانات الموردين
  exportSuppliers = catchAsync(async (req, res, next) => {
    try {
      console.log("Exporting suppliers...");
      const { format = 'xlsx', includeStats = false } = req.body;
      
      // جلب جميع الموردين
      const suppliers = await suppliersRepository.findAll();
      
      // إنشاء ملف CSV بسيط
      let csvContent = 'ID,Name Arabic,Name English,Email,Phone,Status\n';
      
      suppliers.forEach(supplier => {
        csvContent += `${supplier.id},${supplier.name_ar || ''},${supplier.name_en || ''},${supplier.email || ''},${supplier.phone || ''},${supplier.isActive ? 'نشط' : 'غير نشط'}\n`;
      });
      
      console.log("CSV generated for", suppliers.length, "suppliers");
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=suppliers_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
      
    } catch (error) {
      console.error("Error exporting suppliers:", error);
      return next(new AppError(`Error exporting suppliers: ${error.message}`, 500));
    }
  });
}

module.exports = new SupplierDashboardController();
