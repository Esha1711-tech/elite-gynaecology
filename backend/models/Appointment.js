const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    consultationType: { type: String, enum: ["online", "in-person"], default: "online" },
    reason: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    currency: { type: String, enum: ["PKR", "USD"], required: true },
    consultationFee: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["Easypaisa", "JazzCash", "Payoneer"], required: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    appointmentStatus: { type: String, enum: ["pending", "confirmed", "completed", "cancelled", "rejected"], default: "pending" },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctor: 1, appointmentDate: 1, appointmentTime: 1 });

module.exports = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
