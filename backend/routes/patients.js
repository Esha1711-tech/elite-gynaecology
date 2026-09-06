const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const MedicalRecord = require("../models/MedicalRecord");
const MedicalReport = require("../models/MedicalReport");
const { auth, authorize } = require("../middleware/auth");

router.get("/", auth, authorize("doctor"), async (req, res) => {
  try {
    const { search } = req.query;
    const query = { role: "patient" };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    const patients = await User.find(query).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id/history", auth, authorize("doctor"), async (req, res) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: "patient" }).select("-password");
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found." });

    const [appointments, prescriptions, reports, records] = await Promise.all([
      Appointment.find({ patient: patient._id }).populate("doctor", "name specialization qualification").populate("payment").sort({ appointmentDate: -1 }),
      Prescription.find({ patient: patient._id }).populate("doctor", "name specialization qualification").sort({ createdAt: -1 }),
      MedicalReport.find({ patient: patient._id }).populate("doctor", "name specialization").sort({ createdAt: -1 }),
      MedicalRecord.find({ patient: patient._id }).populate("doctor", "name specialization").sort({ createdAt: -1 }),
    ]);

    res.json({ success: true, patient, appointments, prescriptions, reports, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    if (req.user.role === "patient" && req.user.id.toString() !== req.params.id) return res.status(403).json({ success: false, message: "Access denied." });
    const patient = await User.findOne({ _id: req.params.id, role: "patient" }).select("-password");
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found." });
    res.json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
