const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const MedicalRecord = require(
  "../models/MedicalRecord"
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
// CREATE MEDICAL RECORD
// DOCTOR ONLY
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
        symptoms,
        treatment,
        notes,
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

      // ---------------------------------------------
      // OBJECT ID VALIDATION
      // ---------------------------------------------

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
      // PATIENT VALIDATION
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
      // APPOINTMENT OWNERSHIP
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
      // CREATE
      // ---------------------------------------------

      const record =
        await MedicalRecord.create({
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

          symptoms:
            cleanText(
              symptoms,
              5000
            ),

          treatment:
            cleanText(
              treatment,
              5000
            ),

          notes:
            cleanText(
              notes,
              5000
            ),
        });

      return res.status(201).json({
        success: true,
        record,
      });
    } catch (error) {
      console.error(
        "Create medical record error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create medical record.",
      });
    }
  }
);

// =====================================================
// GET CURRENT USER RECORDS
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

      const records =
        await MedicalRecord.find(
          query
        )
          .populate(
            "patient",
            "name email country"
          )
          .populate(
            "doctor",
            "name specialization"
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
        records,
      });
    } catch (error) {
      console.error(
        "Get medical records error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load medical records.",
      });
    }
  }
);

// =====================================================
// PATIENT HISTORY
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

      // Patient cannot request
      // another patient's records.

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

      const records =
        await MedicalRecord.find(
          query
        )
          .populate(
            "doctor",
            "name specialization"
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
        records,
      });
    } catch (error) {
      console.error(
        "Patient medical records error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load medical records.",
      });
    }
  }
);

module.exports = router;