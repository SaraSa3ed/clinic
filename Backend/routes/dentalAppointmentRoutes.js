const express = require("express");
const ctrl = require("../controllers/dentalAppointmentController");
const router = express.Router();

router.route("/")
  .get(ctrl.list)
  .post(ctrl.create);

router.route("/:id")
  .get(ctrl.get)
  .patch(ctrl.update)
  .delete(ctrl.remove);

// مسار للتحقق من توفر الطبيب
router.post("/check-availability", ctrl.checkAvailability);

// مسار لتقرير مواعيد اليوم
router.get("/reports/daily", ctrl.getDailyReport);

// مسار للحصول على تاريخ المريض
router.get("/patient-history/:patient_phone", ctrl.getPatientHistory);

module.exports = router;
