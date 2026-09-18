const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const crypto = require("crypto");

// =====================================================
// CONSTANTS
// =====================================================

const AUTH_COOKIE_NAME = "auth_token";
const AUTH_COOKIE_MAX_AGE = 3 * 60 * 60 * 1000; // 3 hours

// =====================================================
// HELPERS
// =====================================================

const normalizeEmail = (email) => {
  return String(email || "").trim().toLowerCase();
};
const {
  sendPasswordResetEmail,
} = require("../utils/email");

const cleanText = (value, maxLength = 255) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  return String(value).trim().slice(0, maxLength);
};

const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    {
      id,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "3h",
    }
  );
};

const getCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
};

const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...getCookieOptions(),
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie(
    AUTH_COOKIE_NAME,
    getCookieOptions()
  );
};

const internalServerError = (res) => {
  return res.status(500).json({
    success: false,
    message: "Unable to process the request.",
  });
};

// =====================================================
// PATIENT REGISTRATION
// =====================================================

exports.registerPatient = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      country,
      address,
    } = req.body || {};

    const normalizedEmail = normalizeEmail(email);

    const cleanedName = cleanText(name, 100);
    const cleanedPhone = cleanText(phone, 30);
    const cleanedCountry =
      cleanText(country, 100) || "Pakistan";
    const cleanedAddress = cleanText(address, 500);

    // ---------------------------------------------
    // Required fields
    // ---------------------------------------------

    if (
      !cleanedName ||
      !normalizedEmail ||
      !password ||
      !cleanedPhone
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password and phone are required.",
      });
    }

    // ---------------------------------------------
    // Basic email validation
    // ---------------------------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(normalizedEmail) ||
      normalizedEmail.length > 254
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // ---------------------------------------------
    // Existing user
    // ---------------------------------------------

    const existingUser = await User.findOne({
      email: normalizedEmail,
    })
      .select("_id")
      .lean();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account already exists with this email.",
      });
    }

    // ---------------------------------------------
    // Create patient
    // Password strength/hashing should remain
    // enforced by the User model.
    // ---------------------------------------------

    const patient = await User.create({
      name: cleanedName,
      email: normalizedEmail,
      password,
      phone: cleanedPhone,

      // Never accept role from frontend
      role: "patient",

      dateOfBirth,
      gender: cleanText(gender, 30),
      bloodGroup: cleanText(bloodGroup, 10),
      country: cleanedCountry,
      address: cleanedAddress,
    });

    // ---------------------------------------------
    // Create authenticated session
    // ---------------------------------------------

    const token = generateToken(
      patient._id,
      patient.role
    );

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message:
        "Patient account created successfully.",

      user: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        role: patient.role,
        country: patient.country,
      },
    });
  } catch (error) {
    console.error(
      "Patient registration error:",
      error
    );

    // Handle duplicate email race condition
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An account already exists with this email.",
      });
    }

    // Mongoose validation errors are safe to
    // represent generically without leaking internals.
    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message:
          "Please check the registration information and try again.",
      });
    }

    return internalServerError(res);
  }
};

// =====================================================
// DOCTOR REGISTRATION
// =====================================================

exports.registerDoctor = async (_req, res) => {
  // This clinic uses one system-managed doctor/admin.
  // Public doctor account creation is intentionally
  // disabled.

  return res.status(403).json({
    success: false,
    message:
      "Doctor registration is disabled. This clinic has one administrator/doctor account configured by the system.",
  });
};

// =====================================================
// LOGIN
// =====================================================

exports.login = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
    } = req.body || {};

    const normalizedEmail = normalizeEmail(email);
    const normalizedRole = cleanText(role, 20);

    if (
      !normalizedEmail ||
      !password ||
      !normalizedRole
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email, password and role are required.",
      });
    }

    if (
      !["patient", "doctor"].includes(
        normalizedRole
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    // ---------------------------------------------
    // Find account
    // ---------------------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
      role: normalizedRole,
    }).select("+password");

    // Same response whether account/password/role
    // is incorrect to reduce account enumeration.
    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email, password or role.",
      });
    }

    // ---------------------------------------------
    // Password check
    // ---------------------------------------------

    const isMatch =
      await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email, password or role.",
      });
    }

    // ---------------------------------------------
    // Active account
    // ---------------------------------------------

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "This account is currently unavailable.",
      });
    }

    // ---------------------------------------------
    // Create session
    // ---------------------------------------------

    const token = generateToken(
      user._id,
      user.role
    );

    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Login successful.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        country: user.country,

        ...(user.role === "doctor"
          ? {
              specialization:
                user.specialization,
              qualification:
                user.qualification,
            }
          : {}),
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return internalServerError(res);
  }
};

// =====================================================
// LOGOUT
// =====================================================

exports.logout = async (_req, res) => {
  try {
    clearAuthCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return internalServerError(res);
  }
};

// =====================================================
// GET CURRENT USER
// =====================================================

exports.getMe = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    const user = await User.findOne({
      _id: req.user.id,
      isActive: true,
    })
      .select(
        "name email phone role country dateOfBirth gender bloodGroup address specialization qualification isActive createdAt updatedAt"
      )
      .lean();

    if (!user) {
      clearAuthCookie(res);

      return res.status(401).json({
        success: false,
        message:
          "Authentication session is no longer valid.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error
    );

    return internalServerError(res);
  }
};

// =====================================================
// FORGOT PASSWORD
// =====================================================

exports.forgotPassword = async (req, res) => {
  const genericResponse = {
    success: true,
    message:
      "If an account exists with the provided information, a password reset link has been sent.",
  };

  try {
    const email = String(
      req.body?.email || ""
    )
      .trim()
      .toLowerCase();

    const role = String(
      req.body?.role || ""
    )
      .trim()
      .toLowerCase();

    if (
      !email ||
      !["patient", "doctor"].includes(role)
    ) {
      return res.status(200).json(
        genericResponse
      );
    }

    const user = await User.findOne({
      email,
      role,
      isActive: true,
    }).select(
      "+passwordResetToken +passwordResetExpires"
    );

    // Do not reveal whether account exists.
    if (!user) {
      return res.status(200).json(
        genericResponse
      );
    }

    // Generate unpredictable 32-byte token.
    const resetToken =
      crypto.randomBytes(32).toString("hex");

    // Store ONLY SHA-256 hash in MongoDB.
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;

    user.passwordResetExpires =
      new Date(Date.now() + 15 * 60 * 1000);

    await user.save({
      validateBeforeSave: false,
    });

    const frontendUrl =
      process.env.FRONTEND_URL;

    if (!frontendUrl) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save({
        validateBeforeSave: false,
      });

      console.error(
        "Forgot password error: FRONTEND_URL is not configured."
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to process the password reset request.",
      });
    }

    const resetUrl =
      `${frontendUrl.replace(/\/$/, "")}` +
      `/reset-password/${resetToken}`;

    const emailSent =
      await sendPasswordResetEmail(
        user,
        resetUrl
      );

    // If email failed, remove unusable token.
    if (!emailSent) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save({
        validateBeforeSave: false,
      });

      console.error(
        "Password reset email could not be sent."
      );

      // Keep response generic to avoid
      // account enumeration.
      return res.status(200).json(
        genericResponse
      );
    }

    return res.status(200).json(
      genericResponse
    );
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to process the password reset request.",
    });
  }
};

// =====================================================
// RESET PASSWORD
// =====================================================

exports.resetPassword = async (
  req,
  res
) => {
  try {
    const token = String(
      req.params?.token || ""
    ).trim();

    const password =
      req.body?.password;

    const confirmPassword =
      req.body?.confirmPassword;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Reset token and new password are required.",
      });
    }

    if (
      confirmPassword !== undefined &&
      password !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Passwords do not match.",
      });
    }

    // Same policy as User model.
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/;

    if (
      typeof password !== "string" ||
      !strongPassword.test(password)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be 8-128 characters and contain at least one uppercase letter, one lowercase letter, one number and one special character.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,

      passwordResetExpires: {
        $gt: new Date(),
      },

      isActive: true,
    }).select(
      "+password +passwordResetToken +passwordResetExpires +passwordChangedAt"
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Password reset link is invalid or has expired.",
      });
    }

    // Assign plain password.
    // User model pre-save hook hashes it.
    user.password = password;

    // Single-use token.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // Remove any auth cookie from this browser.
    clearAuthCookie(res);

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please login with your new password.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message:
          "The new password does not meet the required security rules.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to reset the password.",
    });
  }
};
// =====================================================
// GET SINGLE DOCTOR
// =====================================================

exports.getDoctor = async (req, res) => {
  try {
    const doctorId = req.params?.id;

    if (
      !doctorId ||
      !mongoose.Types.ObjectId.isValid(
        doctorId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID.",
      });
    }

    const doctor = await User.findOne({
      _id: doctorId,
      role: "doctor",
      isActive: true,
    })
      .select(
        "_id name specialization qualification country"
      )
      .lean();

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error(
      "Get doctor error:",
      error
    );

    return internalServerError(res);
  }
};

// =====================================================
// GET ACTIVE DOCTORS
// =====================================================

exports.getDoctors = async (req, res) => {
  try {
    const { specialization, country, search } = req.query;

    const query = {
      role: "doctor",
      isActive: true,
    };

    const escapeRegex = (value) =>
      String(value).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    if (specialization) {
      query.specialization = new RegExp(
        escapeRegex(specialization),
        "i"
      );
    }

    if (country) {
      query.country = new RegExp(
        escapeRegex(country),
        "i"
      );
    }

    if (search) {
      const safeSearch = new RegExp(
        escapeRegex(search),
        "i"
      );

      query.$or = [
        { name: safeSearch },
        { specialization: safeSearch },
        { qualification: safeSearch },
      ];
    }

    const doctors = await User.find(query)
      .select(
        "_id name specialization qualification country"
      )
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Get doctors error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve doctors.",
    });
  }
};

// =====================================================
// GET SINGLE DOCTOR
// =====================================================

exports.getDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    if (
      !mongoose.Types.ObjectId.isValid(doctorId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID.",
      });
    }

    const doctor = await User.findOne({
      _id: doctorId,
      role: "doctor",
      isActive: true,
    })
      .select(
        "_id name specialization qualification country"
      )
      .lean();

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Get doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve doctor.",
    });
  }
};