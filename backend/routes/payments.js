const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const validateImageFile = require(
  "../middleware/validateImageFile"
);
const Payment = require(
  "../models/Payment"
);

const Appointment = require(
  "../models/Appointment"
);

const {
  auth,
  authorize,
} = require("../middleware/auth");

const isValidId = (value) =>
  mongoose.Types.ObjectId.isValid(
    value
  );

// =====================================================
// GET PAYMENTS
// Doctor -> own
// Patient -> own
// =====================================================

router.get(
  "/",
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

      const payments =
        await Payment.find(query)
          .populate(
            "patient",
            "name email country"
          )
          .populate(
            "doctor",
            "name specialization"
          )
          .populate(
            "appointment"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.json({
        success: true,
        payments,
      });
    } catch (error) {
      console.error(
        "Get payments error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to load payments.",
        });
    }
  }
);

// =====================================================
// SECURE PAYMENT SLIP
// =====================================================

router.get(
  "/:id/slip",
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
              "Invalid payment ID.",
          });
      }

      const payment =
        await Payment.findById(
          req.params.id
        );

      if (!payment) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Payment not found.",
          });
      }

      // ===============================================
      // OWNERSHIP
      // ===============================================

      const isPatient =
        req.user.role ===
          "patient" &&
        payment.patient
          .toString() ===
          req.user.id.toString();

      const isDoctor =
        req.user.role ===
          "doctor" &&
        payment.doctor
          .toString() ===
          req.user.id.toString();

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
          payment.slipUrl
        );

      const filePath =
        path.join(
          __dirname,
          "..",
          "uploads",
          "payment-slips",
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
              "Payment slip file not found.",
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
        "Secure payment slip access error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to open payment slip.",
        });
    }
  }
);

// =====================================================
// GET SINGLE PAYMENT
// =====================================================

router.get(
  "/:id",
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
              "Invalid payment ID.",
          });
      }

      const payment =
        await Payment.findById(
          req.params.id
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
            "appointment"
          );

      if (!payment) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Payment not found.",
          });
      }

      const isPatient =
        req.user.role ===
          "patient" &&
        payment.patient?._id
          .toString() ===
          req.user.id.toString();

      const isDoctor =
        req.user.role ===
          "doctor" &&
        payment.doctor?._id
          .toString() ===
          req.user.id.toString();

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

      return res.json({
        success: true,
        payment,
      });
    } catch (error) {
      console.error(
        "Get payment error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to load payment.",
        });
    }
  }
);

// =====================================================
// VERIFY PAYMENT
// DOCTOR ONLY
// =====================================================

router.patch(
  "/:id/verify",
  auth,
  authorize("doctor"),

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
              "Invalid payment ID.",
          });
      }

      const {
        status,
        providerTransactionId,
        notes,
      } = req.body;

      if (
        ![
          "Successful",
          "Failed",
        ].includes(status)
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Status must be Successful or Failed.",
          });
      }

      // ===============================================
      // PAYMENT MUST BELONG TO DOCTOR
      // ===============================================

      const payment =
        await Payment.findOne({
          _id: req.params.id,
          doctor: req.user.id,
        });

      if (!payment) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Payment not found.",
          });
      }

      // ===============================================
      // PREVENT CHANGING FINAL SUCCESSFUL PAYMENT
      // ===============================================

      if (
        payment.status ===
          "Successful" &&
        status === "Failed"
      ) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "A successful payment cannot be changed to failed.",
          });
      }

      // ===============================================
      // VERIFY APPOINTMENT RELATIONSHIP
      // BEFORE CHANGING PAYMENT
      // ===============================================

      const appointment =
        await Appointment.findOne({
          _id:
            payment.appointment,

          doctor:
            req.user.id,

          patient:
            payment.patient,
        });

      if (!appointment) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "Payment is not linked to a valid appointment.",
          });
      }

      // ===============================================
      // SAFE OPTIONAL VALUES
      // ===============================================

      if (
        providerTransactionId !==
        undefined
      ) {
        payment.providerTransactionId =
          String(
            providerTransactionId
          )
            .trim()
            .slice(0, 200);
      }

      if (
        notes !== undefined
      ) {
        payment.notes =
          String(notes)
            .trim()
            .slice(0, 2000);
      }

      payment.status =
        status;

      payment.verifiedAt =
        new Date();

      payment.paidAt =
        status ===
        "Successful"
          ? new Date()
          : null;

      // ===============================================
      // APPOINTMENT PAYMENT STATUS
      // ===============================================

      appointment.paymentStatus =
        status ===
        "Successful"
          ? "paid"
          : "failed";

      if (
        status === "Failed"
      ) {
        appointment.appointmentStatus =
          "rejected";
      }

      // Save both after relationship
      // validation succeeded.

      await Promise.all([
        payment.save(),
        appointment.save(),
      ]);

      const updated =
        await Payment.findById(
          payment._id
        )
          .populate(
            "patient",
            "name email country"
          )
          .populate(
            "appointment"
          )
          .lean();

      return res.json({
        success: true,

        message:
          `Payment ${status.toLowerCase()}.`,

        payment: updated,
      });
    } catch (error) {
      console.error(
        "Verify payment error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to update payment.",
        });
    }
  }
);

module.exports = router;