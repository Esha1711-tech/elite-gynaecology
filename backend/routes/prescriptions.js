const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Prescription = require(
  "../models/Prescription"
);

const Appointment = require(
  "../models/Appointment"
);

const User = require(
  "../models/User"
);

const {
  auth,
  authorize,
} = require("../middleware/auth");

// =====================================================
// HELPERS
// =====================================================

const isValidId = (value) =>
  mongoose.Types.ObjectId.isValid(
    value
  );

const cleanText = (
  value,
  max = 5000
) =>
  typeof value === "string"
    ? value.trim().slice(0, max)
    : "";

// =====================================================
// CREATE PRESCRIPTION
// =====================================================

router.post(
  "/",
  auth,
  authorize("doctor"),

  async (req, res) => {
    try {
      const {
        patient,
        appointment,
        diagnosis,
        medicines,
        doctorNotes,
        recommendations,
        followUpDate,
      } = req.body;

      if (
        !patient ||
        !diagnosis?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Patient and diagnosis are required.",
        });
      }

      if (
        !isValidId(patient) ||
        (appointment &&
          !isValidId(appointment))
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid patient or appointment ID.",
        });
      }

      // ---------------------------------------------
      // PATIENT
      // ---------------------------------------------

      const patientUser =
        await User.findOne({
          _id: patient,
          role: "patient",
          isActive: true,
        }).select("_id");

      if (!patientUser) {
        return res.status(404).json({
          success: false,
          message:
            "Patient not found.",
        });
      }

      // ---------------------------------------------
      // APPOINTMENT RELATIONSHIP
      // ---------------------------------------------

      if (appointment) {
        const linkedAppointment =
          await Appointment.findOne({
            _id: appointment,
            patient,
            doctor: req.user.id,
          }).select("_id");

        if (!linkedAppointment) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "Appointment does not belong to this patient and doctor.",
            });
        }
      }

      // ---------------------------------------------
      // MEDICINES
      // ---------------------------------------------

      const safeMedicines =
        Array.isArray(medicines)
          ? medicines
              .slice(0, 50)
              .map(
                (medicine) => ({
                  name:
                    cleanText(
                      medicine?.name,
                      200
                    ),

                  dosage:
                    cleanText(
                      medicine?.dosage,
                      200
                    ),

                  frequency:
                    cleanText(
                      medicine?.frequency,
                      200
                    ),

                  duration:
                    cleanText(
                      medicine?.duration,
                      200
                    ),

                  instructions:
                    cleanText(
                      medicine?.instructions,
                      1000
                    ),
                })
              )
          : [];

      const invalidMedicine =
        safeMedicines.some(
          (medicine) =>
            !medicine.name ||
            !medicine.dosage ||
            !medicine.frequency ||
            !medicine.duration
        );

      if (invalidMedicine) {
        return res.status(400).json({
          success: false,

          message:
            "Each medicine requires name, dosage, frequency and duration.",
        });
      }

      // ---------------------------------------------
      // FOLLOW-UP DATE
      // ---------------------------------------------

      let safeFollowUpDate;

      if (followUpDate) {
        safeFollowUpDate =
          new Date(followUpDate);

        if (
          Number.isNaN(
            safeFollowUpDate.getTime()
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Invalid follow-up date.",
            });
        }
      }

      // ---------------------------------------------
      // CREATE
      // ---------------------------------------------

      const prescription =
        await Prescription.create({
          patient,

          appointment:
            appointment ||
            undefined,

          doctor:
            req.user.id,

          diagnosis:
            cleanText(
              diagnosis,
              2000
            ),

          medicines:
            safeMedicines,

          doctorNotes:
            cleanText(
              doctorNotes,
              5000
            ),

          recommendations:
            cleanText(
              recommendations,
              5000
            ),

          followUpDate:
            safeFollowUpDate,
        });

      return res.status(201).json({
        success: true,
        prescription,
      });
    } catch (error) {
      console.error(
        "Create prescription error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create prescription.",
      });
    }
  }
);

// =====================================================
// GET CURRENT USER PRESCRIPTIONS
// =====================================================

router.get(
  "/",
  auth,

  async (req, res) => {
    try {
      const query =
        req.user.role === "doctor"
          ? {
              doctor:
                req.user.id,
            }
          : {
              patient:
                req.user.id,
            };

      const prescriptions =
        await Prescription.find(
          query
        )
          .populate(
            "patient",
            "name email phone country"
          )
          .populate(
            "doctor",
            "name specialization qualification"
          )
          .populate(
            "appointment",
            "appointmentDate appointmentTime"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.json({
        success: true,
        prescriptions,
      });
    } catch (error) {
      console.error(
        "Get prescriptions error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load prescriptions.",
      });
    }
  }
);

// =====================================================
// GET PATIENT PRESCRIPTIONS
// =====================================================

router.get(
  "/patient/:patientId",
  auth,

  async (req, res) => {
    try {
      const { patientId } =
        req.params;

      if (!isValidId(patientId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid patient ID.",
        });
      }

      if (
        req.user.role ===
          "patient" &&
        req.user.id.toString() !==
          patientId
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied.",
        });
      }

      const query =
        req.user.role === "doctor"
          ? {
              patient:
                patientId,

              doctor:
                req.user.id,
            }
          : {
              patient:
                req.user.id,
            };

      const prescriptions =
        await Prescription.find(
          query
        )
          .populate(
            "doctor",
            "name specialization qualification"
          )
          .populate(
            "appointment",
            "appointmentDate appointmentTime"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.json({
        success: true,
        prescriptions,
      });
    } catch (error) {
      console.error(
        "Patient prescriptions error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load prescriptions.",
      });
    }
  }
);

module.exports = router;