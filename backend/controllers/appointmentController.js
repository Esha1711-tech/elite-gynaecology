const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const User = require("../models/User");

const NATIONAL_FEE = Number(process.env.CONSULTATION_FEE_PKR || 3000);
const INTERNATIONAL_FEE = Number(process.env.CONSULTATION_FEE_USD || 50);

const getDoctor = async () => {
  return User.findOne({ role: "doctor", isActive: true }).select("-password");
};

exports.bookAppointment = async (req, res) => {
  try {
    const { appointmentDate, appointmentTime, reason, country, notes, consultationType, paymentMethod } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Payment slip is required. Please upload your payment slip before submitting the appointment." });
    }

    if (!appointmentDate || !appointmentTime || !reason || !country || !paymentMethod) {
      return res.status(400).json({ success: false, message: "Appointment date, time, reason, country and payment method are required." });
    }

    const doctor = await getDoctor();
    if (!doctor) return res.status(500).json({ success: false, message: "No active doctor is configured." });

    const patient = await User.findById(req.user.id).select("-password");
    if (!patient || patient.role !== "patient") {
      return res.status(403).json({ success: false, message: "Only patients can book appointments." });
    }

    const normalizedCountry = String(country).trim();
    const isPakistan = normalizedCountry.toLowerCase() === "pakistan";
    const currency = isPakistan ? "PKR" : "USD";
    const consultationFee = isPakistan ? NATIONAL_FEE : INTERNATIONAL_FEE;

    const allowedMethods = isPakistan ? ["Easypaisa", "JazzCash"] : ["Payoneer"];
    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: isPakistan ? "Pakistani patients can pay through Easypaisa or JazzCash." : "International patients can pay through Payoneer.",
      });
    }

    const date = new Date(appointmentDate);
    if (Number.isNaN(date.getTime()) || date < new Date(new Date().setHours(0, 0, 0, 0))) {
      return res.status(400).json({ success: false, message: "Please select a valid future appointment date." });
    }

    const existing = await Appointment.findOne({
      doctor: doctor._id,
      appointmentDate: date,
      appointmentTime,
      appointmentStatus: { $nin: ["cancelled", "rejected"] },
    });

    if (existing) return res.status(409).json({ success: false, message: "This time slot is already booked." });

    const slipUrl = `/uploads/payment-slips/${req.file.filename}`;

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      appointmentDate: date,
      appointmentTime,
      consultationType: consultationType || "online",
      reason,
      country: normalizedCountry,
      currency,
      consultationFee,
      paymentMethod,
      paymentStatus: "pending",
      appointmentStatus: "pending",
      notes,
    });

    const payment = await Payment.create({
      appointment: appointment._id,
      patient: patient._id,
      doctor: doctor._id,
      amount: consultationFee,
      currency,
      method: paymentMethod,
      slipUrl,
      status: "Pending",
    });

    appointment.payment = payment._id;
    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate("patient", "name email phone country")
      .populate("doctor", "name email specialization qualification")
      .populate("payment");

    return res.status(201).json({
      success: true,
      message: "Appointment submitted with payment slip. The doctor will verify the payment and confirm your appointment.",
      appointment: populated,
    });
  } catch (error) {
    console.error("Book appointment error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const query = req.user.role === "doctor" ? { doctor: req.user.id } : { patient: req.user.id };

    const appointments = await Appointment.find(query)
      .populate("patient", "name email phone country dateOfBirth gender address")
      .populate("doctor", "name email phone specialization qualification licenseNumber country")
      .populate("payment")
      .sort({ appointmentDate: -1, createdAt: -1 });

    res.json({ success: true, appointments });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["confirmed", "completed", "rejected", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: "Invalid appointment status." });

    const appointment = await Appointment.findOne({ _id: req.params.id, doctor: req.user.id }).populate("payment");
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found." });

    if (status === "confirmed") {
      if (!appointment.payment || appointment.payment.status !== "Successful") {
        return res.status(400).json({ success: false, message: "Payment must be verified successfully before confirming the appointment." });
      }
      appointment.paymentStatus = "paid";
    }

    appointment.appointmentStatus = status;
    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate("patient", "name email phone country")
      .populate("doctor", "name specialization qualification")
      .populate("payment");

    res.json({ success: true, message: `Appointment ${status}.`, appointment: updated });
  } catch (error) {
    console.error("Update appointment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
