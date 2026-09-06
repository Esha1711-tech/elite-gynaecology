const Payment = require("../models/Payment");
const Appointment = require("../models/Appointment");

exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("patient", "name email phone country")
      .populate("doctor", "name specialization")
      .populate("appointment");
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found." });
    const owner = payment.patient?._id?.toString() === req.user.id.toString();
    const doctor = payment.doctor?._id?.toString() === req.user.id.toString();
    if (!owner && !doctor) return res.status(403).json({ success: false, message: "Access denied." });
    return res.json({ success: true, payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPayment = async (_req, res) => {
  return res.status(400).json({ success: false, message: "Payments are created together with an appointment and payment slip." });
};

exports.verifyPayment = async (req, res) => {
  try {
    if (req.user.role !== "doctor") return res.status(403).json({ success: false, message: "Only the doctor can verify payments." });
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
    return res.json({ success: true, message: `Payment ${status.toLowerCase()}.`, payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
