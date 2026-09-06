const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["PKR", "USD"], required: true },
    method: { type: String, enum: ["Easypaisa", "JazzCash", "Payoneer"], required: true },
    slipUrl: { type: String, required: true },
    providerTransactionId: { type: String, default: "" },
    status: { type: String, enum: ["Pending", "Successful", "Failed", "Refunded"], default: "Pending" },
    paidAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
