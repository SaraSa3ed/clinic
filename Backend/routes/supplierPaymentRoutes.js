const express = require("express");
const router = express.Router();
const supplierPaymentController = require("../controllers/supplierPaymentController");
const authMiddleware = require("../middlewares/protectionMiddleware");

// تطبيق middleware المصادقة على جميع المسارات
router.use(authMiddleware);

// استخدام الدوال الصحيحة من controller
router.post("/", supplierPaymentController.addSupplierPayment);
router.put("/:id", supplierPaymentController.updateSupplierPayment);
router.delete("/:id", supplierPaymentController.deleteSupplierPayment);
router.get("/:supplierId/payments", supplierPaymentController.getSupplierPayments);
router.get("/:supplierId/payments/summary", supplierPaymentController.getSupplierPaymentSummary);

module.exports = router;


