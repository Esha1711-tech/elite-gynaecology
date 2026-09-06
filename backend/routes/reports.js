const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const User = require("../models/User");
const MedicalReport = require("../models/MedicalReport");
const Prescription = require("../models/Prescription");
const MedicalRecord = require("../models/MedicalRecord");
const { auth, authorize } = require("../middleware/auth");

const uploadDir = path.join(__dirname, "..", "uploads", "medical-reports");
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
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.mimetype)) return cb(new Error("Only JPG, PNG, WEBP or PDF medical reports are allowed."));
    cb(null, true);
  },
});

// Doctor dashboard statistics + recent data.
router.get("/", auth, authorize("doctor"), async (req, res) => {
  try {
    const doctorId = req.user.id;
    const [totalPatients, totalAppointments, pendingAppointments, confirmedAppointments, completedAppointments] = await Promise.all([
      User.countDocuments({ role: "patient", isActive: true }),
      Appointment.countDocuments({ doctor: doctorId }),
      Appointment.countDocuments({ doctor: doctorId, appointmentStatus: "pending" }),
      Appointment.countDocuments({ doctor: doctorId, appointmentStatus: "confirmed" }),
      Appointment.countDocuments({ doctor: doctorId, appointmentStatus: "completed" }),
    ]);

    const payments = await Payment.find({ doctor: doctorId, status: "Successful" });
    const totalRevenuePKR = payments.filter(p => p.currency === "PKR").reduce((s, p) => s + Number(p.amount || 0), 0);
    const totalRevenueUSD = payments.filter(p => p.currency === "USD").reduce((s, p) => s + Number(p.amount || 0), 0);

    const [recentAppointments, recentPayments, recentPrescriptions, recentReports] = await Promise.all([
      Appointment.find({ doctor: doctorId }).populate("patient", "name email phone country").populate("payment").sort({ createdAt: -1 }).limit(10),
      Payment.find({ doctor: doctorId }).populate("patient", "name email country").populate("appointment").sort({ createdAt: -1 }).limit(10),
      Prescription.find({ doctor: doctorId }).populate("patient", "name email country").sort({ createdAt: -1 }).limit(10),
      MedicalReport.find({ doctor: doctorId }).populate("patient", "name email country").sort({ createdAt: -1 }).limit(10),
    ]);

    res.json({
      success: true,
      stats: { totalPatients, totalAppointments, pendingAppointments, confirmedAppointments, completedAppointments, totalRevenuePKR, totalRevenueUSD },
      recentAppointments,
      recentPayments,
      recentPrescriptions,
      recentReports,
    });
  } catch (error) {
    console.error("Reports dashboard error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload a medical report. Both patient and doctor may upload.
router.post("/upload", auth, upload.single("report"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Report file is required." });

    const { patientId, appointmentId, title, description } = req.body;
    const patient = req.user.role === "patient" ? req.user.id : patientId;

    if (!patient || !title) return res.status(400).json({ success: false, message: "Patient and report title are required." });

    if (req.user.role === "doctor" && !patientId) return res.status(400).json({ success: false, message: "Doctor must select a patient." });

    const patientUser = await User.findOne({ _id: patient, role: "patient" });
    if (!patientUser) return res.status(404).json({ success: false, message: "Patient not found." });

    const report = await MedicalReport.create({
      patient,
      doctor: req.user.role === "doctor" ? req.user.id : undefined,
      appointment: appointmentId || undefined,
      title,
      description,
      fileUrl: `/uploads/medical-reports/${req.file.filename}`,
      fileName: req.file.originalname,
      uploadedByRole: req.user.role,
    });

    res.status(201).json({ success: true, message: "Medical report uploaded successfully.", report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/mine", auth, async (req, res) => {
  try {
    const query = req.user.role === "doctor" ? { doctor: req.user.id } : { patient: req.user.id };
    const reports = await MedicalReport.find(query)
      .populate("patient", "name email country")
      .populate("doctor", "name specialization")
      .populate("appointment", "appointmentDate appointmentTime")
      .sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/patient/:patientId", auth, async (req, res) => {
  try {
    if (req.user.role === "patient" && req.user.id.toString() !== req.params.patientId) return res.status(403).json({ success: false, message: "Access denied." });
    const reports = await MedicalReport.find({ patient: req.params.patientId })
      .populate("doctor", "name specialization")
      .populate("appointment", "appointmentDate appointmentTime")
      .sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
