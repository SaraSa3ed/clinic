const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

// لا يوجد middleware مصادقة - النظام يعمل بدون تسجيل دخول

// مسارات إدارة الاشتراكات
router.route('/')
  .get(subscriptionController.getAllSubscriptions)
  .post(subscriptionController.createSubscription);

router.route('/stats')
  .get(subscriptionController.getSubscriptionStats);

router.route('/export')
  .get(subscriptionController.exportSubscriptions);

router.route('/customer/:customerId')
  .get(subscriptionController.getCustomerSubscriptions);

router.route('/:id')
  .get(subscriptionController.getSubscription)
  .patch(subscriptionController.updateSubscription)
  .delete(subscriptionController.deleteSubscription);

router.route('/:id/status')
  .patch(subscriptionController.toggleSubscriptionStatus);

module.exports = router;
