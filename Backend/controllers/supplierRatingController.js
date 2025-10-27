const { Op } = require('sequelize');
const SupplierRating = require('../Model/supplierRatingModel');
const Supplier = require('../Model/supplierModel');
const AppError = require('../utils/appError');

// إضافة تقييم مورد
const addSupplierRating = async (req, res, next) => {
  try {
    const { supplierId, rating, category, comment } = req.body;
    
    if (!supplierId || !rating) {
      return next(new AppError('معرف المورد والتقييم مطلوبان', 400));
    }

    // التحقق من وجود المورد
    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      return next(new AppError('المورد غير موجود', 404));
    }

    // التحقق من صحة التقييم
    if (rating < 1 || rating > 5) {
      return next(new AppError('التقييم يجب أن يكون بين 1 و 5', 400));
    }

    const newRating = await SupplierRating.create({
      supplierId,
      rating: parseFloat(rating),
      category: category || 'quality',
      comment: comment || null,
      createdBy: req.user?.id || 1
    });

    res.status(201).json({
      status: 'success',
      data: {
        rating: newRating
      }
    });
  } catch (error) {
    next(new AppError('خطأ في إضافة التقييم', 500));
  }
};

// تحديث تقييم مورد
const updateSupplierRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, category, comment } = req.body;

    const existingRating = await SupplierRating.findByPk(id);
    if (!existingRating) {
      return next(new AppError('التقييم غير موجود', 404));
    }

    // التحقق من صحة التقييم
    if (rating && (rating < 1 || rating > 5)) {
      return next(new AppError('التقييم يجب أن يكون بين 1 و 5', 400));
    }

    await existingRating.update({
      rating: rating ? parseFloat(rating) : existingRating.rating,
      category: category || existingRating.category,
      comment: comment !== undefined ? comment : existingRating.comment,
      updatedBy: req.user?.id || 1
    });

    res.status(200).json({
      status: 'success',
      data: {
        rating: existingRating
      }
    });
  } catch (error) {
    next(new AppError('خطأ في تحديث التقييم', 500));
  }
};

// حذف تقييم مورد
const deleteSupplierRating = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rating = await SupplierRating.findByPk(id);
    if (!rating) {
      return next(new AppError('التقييم غير موجود', 404));
    }

    await rating.destroy();

    res.status(200).json({
      status: 'success',
      message: 'تم حذف التقييم بنجاح'
    });
  } catch (error) {
    next(new AppError('خطأ في حذف التقييم', 500));
  }
};

// الحصول على تقييمات مورد
const getSupplierRatings = async (req, res, next) => {
  try {
    const { supplierId } = req.params;
    const { page = 1, limit = 10, category } = req.query;

    const whereClause = { supplierId };
    if (category) {
      whereClause.category = category;
    }

    const offset = (page - 1) * limit;

    const { count, rows: ratings } = await SupplierRating.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      status: 'success',
      data: {
        ratings,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(new AppError('خطأ في جلب التقييمات', 500));
  }
};

// الحصول على متوسط تقييم مورد
const getSupplierAverageRating = async (req, res, next) => {
  try {
    const { supplierId } = req.params;

    const ratings = await SupplierRating.findAll({
      where: { supplierId },
      attributes: ['rating', 'category']
    });

    if (ratings.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          averageRating: 0,
          totalRatings: 0,
          categoryRatings: {}
        }
      });
    }

    const averageRating = ratings.reduce((sum, rating) => sum + parseFloat(rating.rating), 0) / ratings.length;
    
    // حساب التقييمات حسب الفئة
    const categoryRatings = {};
    ratings.forEach(rating => {
      if (!categoryRatings[rating.category]) {
        categoryRatings[rating.category] = [];
      }
      categoryRatings[rating.category].push(parseFloat(rating.rating));
    });

    // حساب المتوسط لكل فئة
    Object.keys(categoryRatings).forEach(category => {
      const categoryAverage = categoryRatings[category].reduce((sum, rating) => sum + rating, 0) / categoryRatings[category].length;
      categoryRatings[category] = {
        average: categoryAverage,
        count: categoryRatings[category].length
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        averageRating,
        totalRatings: ratings.length,
        categoryRatings
      }
    });
  } catch (error) {
    next(new AppError('خطأ في جلب متوسط التقييم', 500));
  }
};

module.exports = {
  addSupplierRating,
  updateSupplierRating,
  deleteSupplierRating,
  getSupplierRatings,
  getSupplierAverageRating
};
