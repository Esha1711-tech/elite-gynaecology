const express = require("express");

const {
  registerDoctor,
  registerPatient,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  getDoctors,
  getDoctor,
} = require("../controllers/authController");

const {
  auth,
} = require("../middleware/auth");

const router = express.Router();

// =====================================================
// AUTH
// =====================================================

// Patient registration
router.post(
  "/register/patient",
  registerPatient
);

// Doctor registration intentionally disabled
router.post(
  "/register/doctor",
  registerDoctor
);

// Login
router.post(
  "/login",
  login
);

// Logout
router.post(
  "/logout",
  logout
);

// Current authenticated user
router.get(
  "/me",
  auth,
  getMe
);

// =====================================================
// PASSWORD RECOVERY
// =====================================================

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password/:token",
  resetPassword
);

// =====================================================
// DOCTORS
// =====================================================

router.get(
  "/doctors",
  getDoctors
);

router.get(
  "/doctors/:id",
  getDoctor
);

module.exports = router;