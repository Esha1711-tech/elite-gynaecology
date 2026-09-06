const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { auth, authorize } = require("../middleware/auth");
const {
  getAppointments,
  bookAppointment,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads", "payment-slips");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.mimetype)) return cb(new Error("Only JPG, PNG, WEBP or PDF payment slips are allowed."));
    cb(null, true);
  },
});

router.get("/", auth, getAppointments);
router.post("/", auth, authorize("patient"), upload.single("paymentSlip"), bookAppointment);
router.patch("/:id/status", auth, authorize("doctor"), updateAppointmentStatus);

module.exports = router;
