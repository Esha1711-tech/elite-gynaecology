const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    frequency: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    instructions: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    diagnosis: { type: String, required: true, trim: true },
    medicines: { type: [medicineSchema], default: [] },
    doctorNotes: { type: String, trim: true, default: "" },
    recommendations: { type: String, trim: true, default: "" },
    followUpDate: { type: Date },
  },
  { timestamps: true }
);
prescriptionSchema.index({
  patient: 1,
  createdAt: -1,
});

prescriptionSchema.index({
  doctor: 1,
  createdAt: -1,
});

module.exports = mongoose.models.Prescription || mongoose.model("Prescription", prescriptionSchema);
