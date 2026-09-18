const express = require("express");
const { auth, authorize } = require("../middleware/auth");
const { paymentSlipUpload } = require("../middleware/upload");
const validateImageFile = require(
  "../middleware/validateImageFile"
);

const {
  getAppointments,
  bookAppointment,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

const router = express.Router();

// Get appointments
router.get("/", auth, getAppointments);

// Book appointment + upload payment slip
router.post(
  "/",
  auth,
  authorize("patient"),
  paymentSlipUpload.single("paymentSlip"),
  validateImageFile,
  bookAppointment
);

// Update appointment status
router.patch(
  "/:id/status",
  auth,
  authorize("doctor"),
  updateAppointmentStatus
);

module.exports = router;