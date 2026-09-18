const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const MedicalRecord = require("../models/MedicalRecord");
const MedicalReport = require("../models/MedicalReport");

const { auth, authorize } = require("../middleware/auth");

// =====================================================
// GET PATIENTS
// Doctor only
// Search + Pagination
// =====================================================

router.get(
  "/",
  auth,
  authorize("doctor"),
  async (req, res) => {
    try {
      // -----------------------------------------------
      // PAGINATION
      // -----------------------------------------------

      const page = Math.max(
        parseInt(req.query.page, 10) || 1,
        1
      );

      const limit = Math.min(
        Math.max(
          parseInt(req.query.limit, 10) || 10,
          1
        ),
        50
      );

      const skip = (page - 1) * limit;

      // -----------------------------------------------
      // BASE QUERY
      // -----------------------------------------------

      const query = {
        role: "patient",
        isActive: true,
      };

      // -----------------------------------------------
      // SAFE SEARCH
      // -----------------------------------------------

      const search =
        typeof req.query.search === "string"
          ? req.query.search.trim()
          : "";

      if (search) {
        // Escape special RegExp characters
        const safeSearch = search.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        query.$or = [
          {
            name: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            email: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            phone: {
              $regex: safeSearch,
              $options: "i",
            },
          },
        ];
      }

      // -----------------------------------------------
      // FETCH DATA + COUNT IN PARALLEL
      // -----------------------------------------------

      const [patients, totalPatients] =
        await Promise.all([
          User.find(query)
            .select("-password")
            .sort({
              createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

          User.countDocuments(query),
        ]);

      const totalPages = Math.max(
        Math.ceil(totalPatients / limit),
        1
      );

      return res.json({
        success: true,

        patients,

        pagination: {
          currentPage: page,
          totalPages,
          totalPatients,
          limit,

          hasNextPage:
            page < totalPages,

          hasPreviousPage:
            page > 1,
        },
      });
    } catch (error) {
      console.error(
        "Get patients error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load patients.",
      });
    }
  }
);

// =====================================================
// GET PATIENT COMPLETE HISTORY
// Doctor only
// =====================================================

router.get(
  "/:id/history",
  auth,
  authorize("doctor"),
  async (req, res) => {
    try {
      const patient =
        await User.findOne({
          _id: req.params.id,
          role: "patient",
        })
          .select("-password")
          .lean();

      if (!patient) {
        return res.status(404).json({
          success: false,
          message:
            "Patient not found.",
        });
      }

      // Fetch history in parallel
      const [
        appointments,
        prescriptions,
        reports,
        records,
      ] = await Promise.all([
        Appointment.find({
          patient: patient._id,
        })
          .populate(
            "doctor",
            "name specialization qualification"
          )
          .populate("payment")
          .sort({
            appointmentDate: -1,
          })
          .lean(),

        Prescription.find({
          patient: patient._id,
        })
          .populate(
            "doctor",
            "name specialization qualification"
          )
          .sort({
            createdAt: -1,
          })
          .lean(),

        MedicalReport.find({
          patient: patient._id,
        })
          .populate(
            "doctor",
            "name specialization"
          )
          .sort({
            createdAt: -1,
          })
          .lean(),

        MedicalRecord.find({
          patient: patient._id,
        })
          .populate(
            "doctor",
            "name specialization"
          )
          .sort({
            createdAt: -1,
          })
          .lean(),
      ]);

      return res.json({
        success: true,

        patient,

        appointments,
        prescriptions,
        reports,
        records,
      });
    } catch (error) {
      console.error(
        "Patient history error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load patient history.",
      });
    }
  }
);

// =====================================================
// GET SINGLE PATIENT
// Doctor OR patient themselves
// =====================================================

router.get(
  "/:id",
  auth,
  async (req, res) => {
    try {
      if (
        req.user.role === "patient" &&
        req.user.id.toString() !==
          req.params.id
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied.",
        });
      }

      const patient =
        await User.findOne({
          _id: req.params.id,
          role: "patient",
        })
          .select("-password")
          .lean();

      if (!patient) {
        return res.status(404).json({
          success: false,
          message:
            "Patient not found.",
        });
      }

      return res.json({
        success: true,
        patient,
      });
    } catch (error) {
      console.error(
        "Get patient error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load patient.",
      });
    }
  }
);

module.exports = router;