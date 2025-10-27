const express = require("express");
const router = express.Router();
const supplierReportsController = require("../controllers/supplierReportsController");
const { isLoggedIn } = require("../middlewares/isLoggedIn");

// تطبيق middleware المصادقة على جميع المسارات
router.use(isLoggedIn);

// تقارير الموردين الأساسية
router.get("/reports", supplierReportsController.getSupplierReports);
router.get("/stats", supplierReportsController.getSupplierReportStats);
router.get("/performance", supplierReportsController.getSupplierPerformanceReport);
router.get("/payments", supplierReportsController.getSupplierPaymentsReport);
router.get("/orders", supplierReportsController.getSupplierOrdersReport);
router.get("/complaints", supplierReportsController.getSupplierComplaintsReport);
router.get("/risks", supplierReportsController.getSupplierRisksReport);

// تصدير التقارير
router.post("/export", supplierReportsController.exportSupplierReport);

// تقييمات الموردين
router.post("/ratings", supplierReportsController.addSupplierRating);
router.put("/ratings/:id", supplierReportsController.updateSupplierRating);
router.delete("/ratings/:id", supplierReportsController.deleteSupplierRating);
router.get("/ratings", supplierReportsController.getSupplierRatings);

// مدفوعات الموردين
router.post("/payments", supplierReportsController.addSupplierPayment);
router.put("/payments/:id", supplierReportsController.updateSupplierPayment);
router.delete("/payments/:id", supplierReportsController.deleteSupplierPayment);
router.get("/payments", supplierReportsController.getSupplierPayments);

// تفاصيل الموردين
router.get("/suppliers/:id", supplierReportsController.getSupplierDetails);
router.put("/suppliers/:id/status", supplierReportsController.updateSupplierStatus);

module.exports = router;