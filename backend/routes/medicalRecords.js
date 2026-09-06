const express = require("express");
const router = express.Router();
const MedicalRecord = require("../models/MedicalRecord");
const { auth, authorize } = require("../middleware/auth");

router.post("/", auth, authorize("doctor"), async (req, res) => {
  try {
    const { patient, appointment, diagnosis, symptoms, treatment, notes } = req.body;
    if (!patient || !diagnosis) return res.status(400).json({ success: false, message: "Patient and diagnosis are required." });
    const record = await MedicalRecord.create({ patient, appointment, doctor: req.user.id, diagnosis, symptoms, treatment, notes });
    res.status(201).json({ success: true, record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const query = req.user.role === "doctor" ? { doctor: req.user.id } : { patient: req.user.id };
    const records = await MedicalRecord.find(query)
      .populate("patient", "name email country")
      .populate("doctor", "name specialization")
      .populate("appointment", "appointmentDate appointmentTime")
      .sort({ createdAt: -1 });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/patient/:patientId", auth, async (req, res) => {
  try {
    if (req.user.role === "patient" && req.user.id.toString() !== req.params.patientId) return res.status(403).json({ success: false, message: "Access denied." });
    const records = await MedicalRecord.find({ patient: req.params.patientId })
      .populate("doctor", "name specialization")
      .populate("appointment", "appointmentDate appointmentTime")
      .sort({ createdAt: -1 });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
