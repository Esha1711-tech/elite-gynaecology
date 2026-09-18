const mongoose = require("mongoose");

const medicalReportSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    uploadedByRole: { type: String, enum: ["patient", "doctor"], required: true },
  },
  { timestamps: true }
);
medicalReportSchema.index({
  patient: 1,
  createdAt: -1,
});

medicalReportSchema.index({
  doctor: 1,
  createdAt: -1,
});

module.exports = mongoose.models.MedicalReport || mongoose.model("MedicalReport", medicalReportSchema);
