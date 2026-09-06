const express = require("express");

const {
  registerDoctor,
  registerPatient,
  login,
  getMe,
  forgotPassword,
  getDoctors,
  getDoctor,
} = require("../controllers/authController");

const { auth } = require("../middleware/auth");

const router = express.Router();

// =====================================================
// AUTH
// =====================================================

// Patient Registration
router.post("/register/patient", registerPatient);

// Doctor Registration
router.post("/register/doctor", registerDoctor);

// Login
router.post("/login", login);

// Current User
router.get("/me", auth, getMe);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// =====================================================
// DOCTORS
// =====================================================

// Get all doctors
router.get("/doctors", getDoctors);

// Get single doctor
router.get("/doctors/:id", getDoctor);

module.exports = router;
