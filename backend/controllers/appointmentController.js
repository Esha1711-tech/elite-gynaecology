const fs = require("fs");

const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const User = require("../models/User");

const NATIONAL_FEE =
  Number(process.env.CONSULTATION_FEE_PKR) || 3000;

const INTERNATIONAL_FEE =
  Number(process.env.CONSULTATION_FEE_USD) || 50;

// =====================================================
// HELPERS
// =====================================================

const getDoctor = async () => {
  return User.findOne({
    role: "doctor",
    isActive: true,
  }).select("_id name");
};

const removeUploadedFile = (file) => {
  if (!file?.path) return;

  try {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  } catch (error) {
    console.error(
      "Unable to remove uploaded payment slip:",
      error
    );
  }
};

// =====================================================
// BOOK APPOINTMENT
// =====================================================

exports.bookAppointment = async (req, res) => {
  let session;

  try {
    const {
      appointmentDate,
      appointmentTime,
      reason,
      country,
      notes,
      consultationType,
      paymentMethod,
    } = req.body;

    // -------------------------------------------------
    // PAYMENT SLIP
    // -------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Payment slip is required. Please upload your payment slip before submitting the appointment.",
      });
    }

    // -------------------------------------------------
    // REQUIRED FIELDS
    // -------------------------------------------------

    if (
      !appointmentDate ||
      !appointmentTime?.trim() ||
      !reason?.trim() ||
      !country?.trim() ||
      !paymentMethod
    ) {
      removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message:
          "Appointment date, time, reason, country and payment method are required.",
      });
    }

    // -------------------------------------------------
    // DOCTOR
    // -------------------------------------------------

    const doctor = await getDoctor();

    if (!doctor) {
      removeUploadedFile(req.file);

      return res.status(503).json({
        success: false,
        message:
          "No active doctor is configured.",
      });
    }

    // -------------------------------------------------
    // PATIENT
    // -------------------------------------------------

    const patient = await User.findOne({
      _id: req.user.id,
      role: "patient",
      isActive: true,
    }).select("_id");

    if (!patient) {
      removeUploadedFile(req.file);

      return res.status(403).json({
        success: false,
        message:
          "Only active patients can book appointments.",
      });
    }

    // -------------------------------------------------
    // COUNTRY + FEE
    // -------------------------------------------------

    const normalizedCountry = String(
      country
    )
      .trim()
      .slice(0, 100);

    const isPakistan =
      normalizedCountry.toLowerCase() ===
      "pakistan";

    const currency = isPakistan
      ? "PKR"
      : "USD";

    const consultationFee = isPakistan
      ? NATIONAL_FEE
      : INTERNATIONAL_FEE;

    if (
      !Number.isFinite(consultationFee) ||
      consultationFee < 0
    ) {
      removeUploadedFile(req.file);

      return res.status(500).json({
        success: false,
        message:
          "Consultation fee is not configured correctly.",
      });
    }

    // -------------------------------------------------
    // PAYMENT METHOD
    // -------------------------------------------------

    const allowedMethods = isPakistan
      ? ["Easypaisa", "JazzCash"]
      : ["Payoneer"];

    if (
      !allowedMethods.includes(paymentMethod)
    ) {
      removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message: isPakistan
          ? "Pakistani patients can pay through Easypaisa or JazzCash."
          : "International patients can pay through Payoneer.",
      });
    }

    // -------------------------------------------------
    // DATE
    // -------------------------------------------------

    const date =
      new Date(appointmentDate);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (
      Number.isNaN(date.getTime()) ||
      date < today
    ) {
      removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message:
          "Please select a valid future appointment date.",
      });
    }

    // -------------------------------------------------
    // SAFE INPUT
    // -------------------------------------------------

    const safeTime = String(
      appointmentTime
    )
      .trim()
      .slice(0, 50);

    const safeReason = String(reason)
      .trim()
      .slice(0, 2000);

    const safeNotes =
      typeof notes === "string"
        ? notes.trim().slice(0, 5000)
        : "";

    if (
      consultationType &&
      ![
        "online",
        "in-person",
      ].includes(consultationType)
    ) {
      removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message:
          "Invalid consultation type.",
      });
    }

    // =================================================
    // DATABASE TRANSACTION
    // =================================================

    session =
      await Appointment.startSession();

    session.startTransaction();

    // -------------------------------------------------
    // APPOINTMENT
    // -------------------------------------------------

    const appointmentDocs =
      await Appointment.create(
        [
          {
            patient: patient._id,
            doctor: doctor._id,

            appointmentDate: date,
            appointmentTime: safeTime,

            consultationType:
              consultationType ||
              "online",

            reason: safeReason,

            country:
              normalizedCountry,

            currency,
            consultationFee,
            paymentMethod,

            paymentStatus:
              "pending",

            appointmentStatus:
              "pending",

            notes: safeNotes,
          },
        ],
        {
          session,
        }
      );

    const appointment =
      appointmentDocs[0];

    // -------------------------------------------------
    // PAYMENT
    // -------------------------------------------------

    const paymentDocs =
      await Payment.create(
        [
          {
            appointment:
              appointment._id,

            patient:
              patient._id,

            doctor:
              doctor._id,

            amount:
              consultationFee,

            currency,

            method:
              paymentMethod,

            slipUrl:
              `/uploads/payment-slips/${req.file.filename}`,

            status:
              "Pending",
          },
        ],
        {
          session,
        }
      );

    // -------------------------------------------------
    // LINK PAYMENT
    // -------------------------------------------------

    appointment.payment =
      paymentDocs[0]._id;

    await appointment.save({
      session,
    });

    // -------------------------------------------------
    // COMMIT
    // -------------------------------------------------

    await session.commitTransaction();

    const populated =
      await Appointment.findById(
        appointment._id
      )
        .populate(
          "patient",
          "name email phone country"
        )
        .populate(
          "doctor",
          "name email specialization qualification"
        )
        .populate("payment")
        .lean();

    return res.status(201).json({
      success: true,

      message:
        "Appointment submitted with payment slip. The doctor will verify the payment and confirm your appointment.",

      appointment: populated,
    });
  } catch (error) {
    // -------------------------------------------------
    // ROLLBACK
    // -------------------------------------------------

    if (session?.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error(
          "Appointment transaction rollback error:",
          abortError
        );
      }
    }

    removeUploadedFile(req.file);

    // Duplicate active slot
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This time slot is already booked.",
      });
    }

    console.error(
      "Book appointment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to book appointment.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// =====================================================
// GET APPOINTMENTS
// =====================================================

exports.getAppointments = async (
  req,
  res
) => {
  try {
    const query =
      req.user.role === "doctor"
        ? {
            doctor: req.user.id,
          }
        : {
            patient: req.user.id,
          };

    const appointments =
      await Appointment.find(query)
        .populate(
          "patient",
          "name email phone country dateOfBirth gender address"
        )
        .populate(
          "doctor",
          "name email phone specialization qualification licenseNumber country"
        )
        .populate("payment")
        .sort({
          appointmentDate: -1,
          createdAt: -1,
        })
        .lean();

    return res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error(
      "Get appointments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load appointments.",
    });
  }
};

// =====================================================
// UPDATE APPOINTMENT STATUS
// =====================================================

exports.updateAppointmentStatus =
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowed = [
        "confirmed",
        "completed",
        "rejected",
        "cancelled",
      ];

      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid appointment status.",
        });
      }

      const appointment =
        await Appointment.findOne({
          _id: req.params.id,
          doctor: req.user.id,
        }).populate("payment");

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message:
            "Appointment not found.",
        });
      }

      // ------------------------------------------------
      // PAYMENT REQUIRED BEFORE CONFIRMATION
      // ------------------------------------------------

      if (status === "confirmed") {
        if (
          !appointment.payment ||
          appointment.payment.status !==
            "Successful"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Payment must be verified successfully before confirming the appointment.",
          });
        }

        appointment.paymentStatus =
          "paid";
      }

      // ------------------------------------------------
      // COMPLETED APPOINTMENT IS FINAL
      // ------------------------------------------------

      if (
        appointment.appointmentStatus ===
          "completed" &&
        status !== "completed"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "A completed appointment cannot be moved to another status.",
        });
      }

      appointment.appointmentStatus =
        status;

      await appointment.save();

      const updated =
        await Appointment.findById(
          appointment._id
        )
          .populate(
            "patient",
            "name email phone country"
          )
          .populate(
            "doctor",
            "name specialization qualification"
          )
          .populate("payment")
          .lean();

      return res.json({
        success: true,
        message:
          `Appointment ${status}.`,
        appointment: updated,
      });
    } catch (error) {
      console.error(
        "Update appointment error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update appointment.",
      });
    }
  };