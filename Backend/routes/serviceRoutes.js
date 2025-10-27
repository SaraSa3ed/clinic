const express = require("express");
const serviceController = require("../controllers/serviceController");
const protect = require("../middlewares/protectionMiddleware");

const router = express.Router();

// Public routes
router.get("/", serviceController.getAllServices);
router.get("/active", serviceController.getActiveServices);
router.get("/branch/:branchId", serviceController.getServicesByBranch);
router.get("/:id", serviceController.getServiceById);
router.post("/:id/calculate-price", serviceController.calculateServicePrice);

// Protected routes
router.post("/", serviceController.createService);
router.put("/:id", serviceController.updateService);
router.delete("/:id", serviceController.deleteService);

module.exports = router;
