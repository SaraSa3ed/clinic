const express = require("express");
const router = express.Router();
const supplierRatingController = require("../controllers/supplierRatingController");
const authMiddleware = require("../middlewares/protectionMiddleware");

// تطبيق middleware المصادقة على جميع المسارات
router.use(authMiddleware);

// مسارات التقييمات
router.post("/", supplierRatingController.addSupplierRating);
router.put("/:id", supplierRatingController.updateSupplierRating);
router.delete("/:id", supplierRatingController.deleteSupplierRating);
router.get("/:supplierId/ratings", supplierRatingController.getSupplierRatings);
router.get("/:supplierId/ratings/average", supplierRatingController.getSupplierAverageRating);

module.exports = router;
