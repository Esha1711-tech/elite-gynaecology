const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const User = require("../models/User");
const MedicalReport = require("../models/MedicalReport");
const Prescription = require("../models/Prescription");

const { auth, authorize } = require("../middleware/auth");
const { medicalReportUpload } = require("../middleware/upload");
const validateImageFile = require(
  "../middleware/validateImageFile"
);

const isValidId = (value) =>
  mongoose.Types.ObjectId.isValid(value);

const removeUploadedReport = (file) => {
  if (!file?.path) return;

  try {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  } catch (error) {
    console.error(
      "Unable to remove uploaded medical report:",
      error
    );
  }
};

// =====================================================
// DOCTOR DASHBOARD
// =====================================================

router.get(
  "/",
  auth,
  authorize("doctor"),
  async (req, res) => {
    try {
      const doctorId = req.user.id;

      const [
        totalPatients,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
      ] = await Promise.all([
        User.countDocuments({
          role: "patient",
          isActive: true,
        }),

        Appointment.countDocuments({
          doctor: doctorId,
        }),

        Appointment.countDocuments({
          doctor: doctorId,
          appointmentStatus: "pending",
        }),

        Appointment.countDocuments({
          doctor: doctorId,
          appointmentStatus: "confirmed",
        }),

        Appointment.countDocuments({
          doctor: doctorId,
          appointmentStatus: "completed",
        }),
      ]);

      // ===============================================
      // REVENUE
      // ===============================================

      const doctorObjectId =
        new mongoose.Types.ObjectId(
          String(doctorId)
        );

      const revenueData =
        await Payment.aggregate([
          {
            $match: {
              doctor: doctorObjectId,
              status: "Successful",
            },
          },
          {
            $group: {
              _id: "$currency",
              total: {
                $sum: "$amount",
              },
            },
          },
        ]);

      let totalRevenuePKR = 0;
      let totalRevenueUSD = 0;

      revenueData.forEach((item) => {
        if (item._id === "PKR") {
          totalRevenuePKR =
            item.total;
        }

        if (item._id === "USD") {
          totalRevenueUSD =
            item.total;
        }
      });

      // ===============================================
      // RECENT DATA
      // ===============================================

      const [
        recentAppointments,
        recentPayments,
        recentPrescriptions,
        recentReports,
      ] = await Promise.all([
        Appointment.find({
          doctor: doctorId,
        })
          .populate(
            "patient",
            "name email phone country"
          )
          .populate("payment")
          .sort({
            createdAt: -1,
          })
          .limit(10)
          .lean(),

        Payment.find({
          doctor: doctorId,
        })
          .populate(
            "patient",
            "name email country"
          )
          .populate("appointment")
          .sort({
            createdAt: -1,
          })
          .limit(10)
          .lean(),

        Prescription.find({
          doctor: doctorId,
        })
          .populate(
            "patient",
            "name email country"
          )
          .sort({
            createdAt: -1,
          })
          .limit(10)
          .lean(),

        MedicalReport.find({
          doctor: doctorId,
        })
          .populate(
            "patient",
            "name email country"
          )
          .sort({
            createdAt: -1,
          })
          .limit(10)
          .lean(),
      ]);

      return res.json({
        success: true,

        stats: {
          totalPatients,
          totalAppointments,
          pendingAppointments,
          confirmedAppointments,
          completedAppointments,
          totalRevenuePKR,
          totalRevenueUSD,
        },

        recentAppointments,
        recentPayments,
        recentPrescriptions,
        recentReports,
      });
    } catch (error) {
      console.error(
        "Reports dashboard error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load dashboard data.",
      });
    }
  }
);

// =====================================================
// PAGINATED DOCTOR APPOINTMENTS
// =====================================================

router.get(
  "/appointments",
  auth,
  authorize("doctor"),
  async (req, res) => {
    try {
      const doctorId =
        req.user.id;

      const page = Math.max(
        parseInt(
          req.query.page,
          10
        ) || 1,
        1
      );

      const limit = Math.min(
        Math.max(
          parseInt(
            req.query.limit,
            10
          ) || 10,
          1
        ),
        50
      );

      const skip =
        (page - 1) * limit;

      const query = {
        doctor: doctorId,
      };

      const [
        appointments,
        totalAppointments,
      ] = await Promise.all([
        Appointment.find(query)
          .populate(
            "patient",
            "name email phone country"
          )
          .populate("payment")
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Appointment.countDocuments(
          query
        ),
      ]);

      const totalPages =
        Math.max(
          Math.ceil(
            totalAppointments /
              limit
          ),
          1
        );

      return res.json({
        success: true,

        appointments,

        pagination: {
          currentPage: page,
          totalPages,
          totalAppointments,
          limit,

          hasNextPage:
            page < totalPages,

          hasPreviousPage:
            page > 1,
        },
      });
    } catch (error) {
      console.error(
        "Paginated appointments error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load appointments.",
      });
    }
  }
);

// =====================================================
// UPLOAD MEDICAL REPORT
// Patient + Doctor
// =====================================================

router.post(
  "/upload",
  auth,
  medicalReportUpload.single(
    "report",
    validateImageFile,
  ),

  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Report file is required.",
          });
      }

      const {
        patientId,
        appointmentId,
        title,
        description,
      } = req.body;

      // Patient can never choose
      // another patient's ID.

      const patient =
        req.user.role ===
        "patient"
          ? req.user.id
          : patientId;

      if (
        !patient ||
        !title?.trim()
      ) {
        removeUploadedReport(
          req.file
        );

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Patient and report title are required.",
          });
      }

      if (!isValidId(patient)) {
        removeUploadedReport(
          req.file
        );

        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid patient ID.",
          });
      }

      // Doctor must explicitly
      // select a patient.

      if (
        req.user.role ===
          "doctor" &&
        !patientId
      ) {
        removeUploadedReport(
          req.file
        );

        return res
          .status(400)
          .json({
            success: false,
            message:
              "Doctor must select a patient.",
          });
      }

      // ===============================================
      // VERIFY PATIENT
      // ===============================================

      const patientUser =
        await User.findOne({
          _id: patient,
          role: "patient",
          isActive: true,
        }).select("_id");

      if (!patientUser) {
        removeUploadedReport(
          req.file
        );

        return res
          .status(404)
          .json({
            success: false,
            message:
              "Patient not found.",
          });
      }

      // ===============================================
      // VERIFY APPOINTMENT RELATIONSHIP
      // ===============================================

      let linkedAppointment =
        null;

      if (appointmentId) {
        if (
          !isValidId(
            appointmentId
          )
        ) {
          removeUploadedReport(
            req.file
          );

          return res
            .status(400)
            .json({
              success: false,
              message:
                "Invalid appointment ID.",
            });
        }

        const appointmentQuery =
          {
            _id: appointmentId,
            patient,
          };

        if (
          req.user.role ===
          "doctor"
        ) {
          appointmentQuery.doctor =
            req.user.id;
        }

        linkedAppointment =
          await Appointment.findOne(
            appointmentQuery
          ).select(
            "_id doctor patient"
          );

        if (
          !linkedAppointment
        ) {
          removeUploadedReport(
            req.file
          );

          return res
            .status(400)
            .json({
              success: false,

              message:
                "Appointment does not belong to the selected patient.",
            });
        }
      }

      // ===============================================
      // CREATE REPORT
      // ===============================================

      const report =
        await MedicalReport.create({
          patient,

          doctor:
            req.user.role ===
            "doctor"
              ? req.user.id
              : undefined,

          appointment:
            appointmentId ||
            undefined,

          title: title
            .trim()
            .slice(0, 300),

          description:
            typeof description ===
            "string"
              ? description
                  .trim()
                  .slice(
                    0,
                    5000
                  )
              : "",

          fileUrl:
            `/uploads/medical-reports/${req.file.filename}`,

          fileName:
            req.file.originalname,

          uploadedByRole:
            req.user.role,
        });

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Medical report uploaded successfully.",

          report,
        });
    } catch (error) {
      console.error(
        "Medical report upload error:",
        error
      );

      removeUploadedReport(
        req.file
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to upload medical report.",
        });
    }
  }
);

// =====================================================
// GET CURRENT USER REPORTS
// =====================================================

router.get(
  "/mine",
  auth,

  async (req, res) => {
    try {
      const query =
        req.user.role ===
        "doctor"
          ? {
              doctor:
                req.user.id,
            }
          : {
              patient:
                req.user.id,
            };

      const reports =
        await MedicalReport.find(
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
        reports,
      });
    } catch (error) {
      console.error(
        "Get reports error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to load medical reports.",
        });
    }
  }
);

// =====================================================
// GET REPORTS FOR SPECIFIC PATIENT
// =====================================================

router.get(
  "/patient/:patientId",
  auth,

  async (req, res) => {
    try {
      if (
        !isValidId(
          req.params.patientId
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

      // Patient can only
      // request own reports.

      if (
        req.user.role ===
          "patient" &&
        req.user.id.toString() !==
          req.params.patientId
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "Access denied.",
          });
      }

      const reportQuery =
        req.user.role ===
        "doctor"
          ? {
              patient:
                req.params
                  .patientId,

              doctor:
                req.user.id,
            }
          : {
              patient:
                req.user.id,
            };

      const reports =
        await MedicalReport.find(
          reportQuery
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
        reports,
      });
    } catch (error) {
      console.error(
        "Patient reports error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to load patient reports.",
        });
    }
  }
);

// =====================================================
// SECURE VIEW / DOWNLOAD REPORT
// =====================================================

router.get(
  "/:id/file",
  auth,

  async (req, res) => {
    try {
      if (
        !isValidId(req.params.id)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid report ID.",
          });
      }

      const report =
        await MedicalReport.findById(
          req.params.id
        );

      if (!report) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Report not found.",
          });
      }

      // ===============================================
      // PATIENT AUTHORIZATION
      // ===============================================

      const isPatient =
        req.user.role ===
          "patient" &&
        report.patient.toString() ===
          req.user.id.toString();

      // ===============================================
      // DOCTOR AUTHORIZATION
      // ===============================================

      let isDoctor = false;

      if (
        req.user.role ===
        "doctor"
      ) {
        // Doctor-created report

        if (
          report.doctor &&
          report.doctor.toString() ===
            req.user.id.toString()
        ) {
          isDoctor = true;
        }

        // Patient-created report linked
        // to this doctor's appointment.

        else if (
          !report.doctor &&
          report.appointment
        ) {
          const appointment =
            await Appointment.exists({
              _id:
                report.appointment,

              patient:
                report.patient,

              doctor:
                req.user.id,
            });

          isDoctor =
            Boolean(appointment);
        }
      }

      if (
        !isPatient &&
        !isDoctor
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "Access denied.",
          });
      }

      // ===============================================
      // SAFE FILE PATH
      // ===============================================

      const fileName =
        path.basename(
          report.fileUrl
        );

      const filePath =
        path.join(
          __dirname,
          "..",
          "uploads",
          "medical-reports",
          fileName
        );

      if (
        !fs.existsSync(filePath)
      ) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Report file not found.",
          });
      }

      // ===============================================
      // SECURITY HEADERS
      // ===============================================

      res.setHeader(
        "X-Content-Type-Options",
        "nosniff"
      );

      res.setHeader(
        "Cache-Control",
        "private, no-store"
      );

      res.setHeader(
        "Content-Disposition",
        `inline; filename="${fileName.replace(
          /"/g,
          ""
        )}"`
      );

      return res.sendFile(
        filePath
      );
    } catch (error) {
      console.error(
        "Secure report access error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to open report.",
        });
    }
  }
);

module.exports = router;