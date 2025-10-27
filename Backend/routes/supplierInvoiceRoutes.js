const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/supplierInvoiceController");

router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

// Dress intake endpoint (with optional file)
router.post("/dress-intake", ctrl.uploadMiddleware, ctrl.createDressIntake);

module.exports = router;


