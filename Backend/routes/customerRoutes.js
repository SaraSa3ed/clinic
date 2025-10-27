const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const { dynamicUpload } = require("../middlewares/fileUpload");

// GET /api/v1/customers
router.get("/", customerController.list);

// GET /api/v1/customers/:id
router.get("/:id", customerController.getById);

// POST /api/v1/customers
router.post(
  "/",
  dynamicUpload(["personalPhoto", "nationalIdImage"]),
  customerController.create
);

// PUT /api/v1/customers/:id
router.put(
  "/:id",
  dynamicUpload(["personalPhoto", "nationalIdImage"]),
  customerController.update
);

// DELETE /api/v1/customers/:id
router.delete("/:id", customerController.remove);

module.exports = router;


