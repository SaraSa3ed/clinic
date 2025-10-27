const express = require("express");
const ctrl = require("../controllers/doctorController");
const router = express.Router();

router.route("/")
  .get(ctrl.list)
  .post(ctrl.create);

router.route("/:id")
  .get(ctrl.get)
  .patch(ctrl.update)
  .delete(ctrl.remove);

// مسار للحصول على جدول الطبيب
router.get("/:doctor_id/schedule", ctrl.getSchedule);

module.exports = router;
