const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Appointment = require("../models/Appointment");
const { auth, authorize } = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const query = req.user.role === "doctor" ? { doctor: req.user.id } : { patient: req.user.id };
    const payments = await Payment.find(query)
      .populate("patient", "name email country")
      .populate("doctor", "name specialization")
      .populate("appointment")
      .sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("patient", "name email country")
      .populate("doctor", "name specialization")
      .populate("appointment");
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found." });
    if (req.user.role === "patient" && payment.patient._id.toString() !== req.user.id.toString()) return res.status(403).json({ success: false, message: "Access denied." });
    if (req.user.role === "doctor" && payment.doctor._id.toString() !== req.user.id.toString()) return res.status(403).json({ success: false, message: "Access denied." });
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Doctor verifies uploaded payment slip.
router.patch("/:id/verify", auth, authorize("doctor"), async (req, res) => {
  try {
    const { status, providerTransactionId, notes } = req.body;
    if (!["Successful", "Failed"].includes(status)) return res.status(400).json({ success: false, message: "Status must be Successful or Failed." });

    const payment = await Payment.findOne({ _id: req.params.id, doctor: req.user.id });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found." });

    payment.status = status;
    payment.providerTransactionId = providerTransactionId || payment.providerTransactionId;
    payment.notes = notes || payment.notes;
    payment.verifiedAt = new Date();
    payment.paidAt = status === "Successful" ? new Date() : null;
    await payment.save();

    const appointment = await Appointment.findById(payment.appointment);
    if (appointment) {
      appointment.paymentStatus = status === "Successful" ? "paid" : "failed";
      if (status === "Failed") appointment.appointmentStatus = "rejected";
      await appointment.save();
    }

    const updated = await Payment.findById(payment._id).populate("patient", "name email country").populate("appointment");
    res.json({ success: true, message: `Payment ${status.toLowerCase()}.`, payment: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
