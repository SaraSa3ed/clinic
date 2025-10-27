const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const expenseCategoryController = require('../controllers/expenseCategoryController');
const protect = require('../middlewares/protectionMiddleware');

// تطبيق المصادقة على جميع المسارات
router.use(protect);

// مسارات المصروفات
router
  .route('/')
  .get(expenseController.getAllExpenses)
  .post(expenseController.createExpense);

router
  .route('/statistics')
  .get(expenseController.getExpenseStatistics);

router
  .route('/export')
  .get(expenseController.exportExpenses);

router
  .route('/:id')
  .get(expenseController.getExpense)
  .put(expenseController.updateExpense)
  .delete(expenseController.deleteExpense);

router
  .route('/:id/status')
  .put(expenseController.updateExpenseStatus);

// مسارات فئات المصروفات
router
  .route('/categories')
  .get(expenseCategoryController.getAllCategories)
  .post(expenseCategoryController.createCategory);

router
  .route('/categories/with-statistics')
  .get(expenseCategoryController.getCategoriesWithStatistics);

router
  .route('/categories/order')
  .put(expenseCategoryController.updateCategoryOrder);

router
  .route('/categories/:id')
  .get(expenseCategoryController.getCategory)
  .put(expenseCategoryController.updateCategory)
  .delete(expenseCategoryController.deleteCategory);

router
  .route('/categories/:id/statistics')
  .get(expenseCategoryController.getCategoryStatistics);

module.exports = router;
