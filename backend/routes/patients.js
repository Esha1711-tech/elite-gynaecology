const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const User = require("../models/User");
const Appointment = require("../models/Appointment");
const MedicalRecord = require("../models/MedicalRecord");
const Prescription = require("../models/Prescription");
const Payment = require("../models/Payment");
const MedicalReport = require("../models/MedicalReport");

const {
  auth,
  authorize,
} = require("../middleware/auth");

// =====================================================
// HELPERS
// =====================================================

const cleanText = (value = "") => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const normalizeEmail = (value = "") => {
  return cleanText(value)
    .toLowerCase()
    .trim();
};

const validObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(
    id
  );
};

const patientPublicFields =
  "-password -resetPasswordToken -resetPasswordExpires -__v";

// =====================================================
// GET PATIENTS
// Doctor only
// =====================================================

router.get(
  "/",
  auth,
  authorize("doctor"),
  async (req, res) => {
    try {
      const page = Math.max(
        Number.parseInt(
          req.query.page,
          10
        ) || 1,
        1
      );

      const limit = Math.min(
        Math.max(
          Number.parseInt(
            req.query.limit,
            10
          ) || 10,
          1
        ),
        100
      );

      const skip =
        (page - 1) * limit;

      const search =
        cleanText(
          req.query.search || ""
        );

      const filter = {
        role: "patient",
      };

      if (search) {
        const escapedSearch =
          search.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );

        filter.$or = [
          {
            name: {
              $regex:
                escapedSearch,
              $options: "i",
            },
          },
          {
            email: {
              $regex:
                escapedSearch,
              $options: "i",
            },
          },
          {
            phone: {
              $regex:
                escapedSearch,
              $options: "i",
            },
          },
        ];
      }

      const [
        patients,
        total,
      ] = await Promise.all([
        User.find(filter)
          .select(
            patientPublicFields
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit),

        User.countDocuments(
          filter
        ),
      ]);

      return res.json({
        success: true,

        patients,

        pagination: {
          page,
          limit,
          total,
          pages:
            Math.ceil(
              total / limit
            ) || 1,
        },
      });
    } catch (error) {
      console.error(
        "Get patients error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to load patients.",
        });
    }
  }
);

// =====================================================
// CREATE PATIENT
// Doctor manually creates walk-in patient
// =====================================================

router.post(
  "/",
  auth,
  authorize("doctor"),

  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        country,
        dateOfBirth,
        gender,
        address,
      } = req.body;

      const cleanName =
        cleanText(name);

      const cleanEmail =
        normalizeEmail(email);

      const cleanPhone =
        cleanText(phone);

      const cleanCountry =
        cleanText(country);

      const cleanGender =
        cleanText(gender);

      const cleanAddress =
        cleanText(address);

      // ---------------------------------------------
      // REQUIRED WALK-IN INFORMATION
      // ---------------------------------------------

      if (!cleanName) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Patient name is required.",
          });
      }

      if (!cleanPhone) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Patient phone number is required.",
          });
      }

      // ---------------------------------------------
      // OPTIONAL EMAIL
      // ---------------------------------------------

      if (cleanEmail) {
        const existingUser =
          await User.findOne({
            email: cleanEmail,
          });

        if (existingUser) {
          return res
            .status(409)
            .json({
              success: false,
              message:
                "A user with this email already exists.",
            });
        }
      }

      // ---------------------------------------------
      // DATE OF BIRTH
      // ---------------------------------------------

      let parsedDateOfBirth;

      if (dateOfBirth) {
        const parsedDate =
          new Date(dateOfBirth);

        if (
          Number.isNaN(
            parsedDate.getTime()
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Invalid date of birth.",
            });
        }

        parsedDateOfBirth =
          parsedDate;
      }

      // ---------------------------------------------
      // CREATE WALK-IN PATIENT
      // ---------------------------------------------

      const patientData = {
        name: cleanName,
        phone: cleanPhone,

        role: "patient",

        /*
         * Walk-in patient has a medical record
         * but does not have login access.
         */
        portalAccess: false,
      };

      if (cleanEmail) {
        patientData.email =
          cleanEmail;
      }

      if (cleanCountry) {
        patientData.country =
          cleanCountry;
      }

      if (parsedDateOfBirth) {
        patientData.dateOfBirth =
          parsedDateOfBirth;
      }

      if (cleanGender) {
        patientData.gender =
          cleanGender;
      }

      if (cleanAddress) {
        patientData.address =
          cleanAddress;
      }

      const patient =
        await User.create(
          patientData
        );

      const safePatient =
        await User.findById(
          patient._id
        ).select(
          patientPublicFields
        );

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Walk-in patient created successfully.",

          patient:
            safePatient,
        });
    } catch (error) {
      console.error(
        "Create patient error:",
        error
      );

      if (
        error?.code === 11000
      ) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "A user with this email already exists.",
          });
      }

      if (
        error?.name ===
        "ValidationError"
      ) {
        const firstError =
          Object.values(
            error.errors || {}
          )[0];

        return res
          .status(400)
          .json({
            success: false,

            message:
              firstError?.message ||
              "Invalid patient information.",
          });
      }

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to create patient.",
        });
    }
  }
);

// =====================================================
// UPDATE PATIENT
// Doctor edits patient profile
// =====================================================

router.patch(
  "/:id",
  auth,
  authorize("doctor"),
  async (req, res) => {
    try {
      const patientId =
        req.params.id;

      if (
        !validObjectId(
          patientId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid patient ID.",
          });
      }

      const patient =
        await User.findOne({
          _id: patientId,
          role: "patient",
        });

      if (!patient) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Patient not found.",
          });
      }

      const {
        name,
        email,
        phone,
        country,
        dateOfBirth,
        gender,
        address,
      } = req.body;

      if (
        name !== undefined
      ) {
        const cleanName =
          cleanText(name);

        if (!cleanName) {
          return res
            .status(400)
            .json({
              success:
                false,
              message:
                "Patient name cannot be empty.",
            });
        }

        patient.name =
          cleanName;
      }

      if (
        email !== undefined
      ) {
        const cleanEmail =
          normalizeEmail(
            email
          );

        if (!cleanEmail) {
          return res
            .status(400)
            .json({
              success:
                false,
              message:
                "Patient email cannot be empty.",
            });
        }

        const emailExists =
          await User.findOne({
            email:
              cleanEmail,
            _id: {
              $ne:
                patient._id,
            },
          });

        if (emailExists) {
          return res
            .status(409)
            .json({
              success:
                false,
              message:
                "Another user already uses this email.",
            });
        }

        patient.email =
          cleanEmail;
      }

      if (
        phone !== undefined
      ) {
        patient.phone =
          cleanText(phone);
      }

      if (
        country !==
        undefined
      ) {
        patient.country =
          cleanText(
            country
          );
      }

      if (
        gender !== undefined
      ) {
        patient.gender =
          cleanText(gender);
      }

      if (
        address !== undefined
      ) {
        patient.address =
          cleanText(address);
      }

      if (
        dateOfBirth !==
        undefined
      ) {
        if (!dateOfBirth) {
          patient.dateOfBirth =
            undefined;
        } else {
          const parsedDate =
            new Date(
              dateOfBirth
            );

          if (
            Number.isNaN(
              parsedDate.getTime()
            )
          ) {
            return res
              .status(400)
              .json({
                success:
                  false,
                message:
                  "Invalid date of birth.",
              });
          }

          patient.dateOfBirth =
            parsedDate;
        }
      }

      // Password is intentionally not updated here.
      // Patient editing from the dashboard updates
      // patient information only.

      await patient.save();

      const safePatient =
        await User.findById(
          patient._id
        ).select(
          patientPublicFields
        );

      return res.json({
        success: true,

        message:
          "Patient updated successfully.",

        patient:
          safePatient,
      });
    } catch (error) {
      console.error(
        "Update patient error:",
        error
      );

      if (
        error?.code ===
        11000
      ) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "Another user already uses this email.",
          });
      }

      if (
        error?.name ===
        "ValidationError"
      ) {
        const firstError =
          Object.values(
            error.errors || {}
          )[0];

        return res
          .status(400)
          .json({
            success: false,
            message:
              firstError
                ?.message ||
              "Invalid patient information.",
          });
      }

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to update patient.",
        });
    }
  }
);

// =====================================================
// GET PATIENT HISTORY
// Doctor only
// =====================================================

router.get(
  "/:id/history",
  auth,
  authorize("doctor"),
  async (req, res) => {
    try {
      const patientId =
        req.params.id;

      if (
        !validObjectId(
          patientId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid patient ID.",
          });
      }

      const patient =
        await User.findOne({
          _id: patientId,
          role: "patient",
        }).select(
          patientPublicFields
        );

      if (!patient) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Patient not found.",
          });
      }

      const [
        appointments,
        medicalRecords,
        prescriptions,
        payments,
        reports,
      ] = await Promise.all([
        Appointment.find({
          patientId,
        })
          .sort({
            createdAt: -1,
          })
          .catch(() => []),

        MedicalRecord.find({
          patientId,
        })
          .sort({
            createdAt: -1,
          })
          .catch(() => []),

        Prescription.find({
          patientId,
        })
          .sort({
            createdAt: -1,
          })
          .catch(() => []),

        Payment.find({
          patientId,
        })
          .sort({
            createdAt: -1,
          })
          .catch(() => []),

        MedicalReport.find({
          patientId,
        })
          .sort({
            createdAt: -1,
          })
          .catch(() => []),
      ]);

      return res.json({
        success: true,

        patient,

        history: {
          appointments,
          medicalRecords,
          prescriptions,
          payments,
          reports,
        },
      });
    } catch (error) {
      console.error(
        "Get patient history error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to load patient history.",
        });
    }
  }
);

module.exports = router;