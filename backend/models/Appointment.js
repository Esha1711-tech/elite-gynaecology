const mongoose = require("mongoose");

const appointmentSchema =
  new mongoose.Schema(
    {
      patient: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: true,
      },

      doctor: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: true,
      },

      appointmentDate: {
        type: Date,
        required: true,
      },

      appointmentTime: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
      },

      consultationType: {
        type: String,
        enum: [
          "online",
          "in-person",
        ],
        default: "online",
      },

      reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000,
      },

      country: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      currency: {
        type: String,
        enum: ["PKR", "USD"],
        required: true,
      },

      consultationFee: {
        type: Number,
        required: true,
        min: 0,
      },

      paymentMethod: {
        type: String,
        enum: [
          "Easypaisa",
          "JazzCash",
          "Payoneer",
        ],
        required: true,
      },

      payment: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "Payment",
      },

      paymentStatus: {
        type: String,
        enum: [
          "pending",
          "paid",
          "failed",
          "refunded",
        ],
        default: "pending",
      },

      appointmentStatus: {
        type: String,
        enum: [
          "pending",
          "confirmed",
          "completed",
          "cancelled",
          "rejected",
        ],
        default: "pending",
      },

      notes: {
        type: String,
        trim: true,
        maxlength: 5000,
        default: "",
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

// =====================================================
// UNIQUE ACTIVE TIME SLOT
// =====================================================

// Cancelled/rejected appointment frees the slot.

appointmentSchema.index(
  {
    doctor: 1,
    appointmentDate: 1,
    appointmentTime: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      appointmentStatus: {
        $in: [
          "pending",
          "confirmed",
          "completed",
        ],
      },
    },

    name:
      "unique_active_doctor_slot",
  }
);

// =====================================================
// QUERY INDEXES
// =====================================================

appointmentSchema.index({
  patient: 1,
  createdAt: -1,
});

appointmentSchema.index({
  doctor: 1,
  appointmentStatus: 1,
  createdAt: -1,
});

// =====================================================
// MODEL
// =====================================================

module.exports =
  mongoose.models.Appointment ||
  mongoose.model(
    "Appointment",
    appointmentSchema
  );