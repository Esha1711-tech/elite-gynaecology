const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =====================================================
// Generate JWT Token
// =====================================================

const generateToken = (id, role) => {
  return jwt.sign(
    {
      id,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    },
  );
};

// =====================================================
// Patient Registration
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
    } = req.body;

    // Required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and phone are required.",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account already exists with this email.",
      });
    }

    // Create patient
    const patient = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: "patient",
      dateOfBirth,
      gender,
      bloodGroup,
      country: country || "Pakistan",
      address,
    });

    const token = generateToken(patient._id, "patient");

    return res.status(201).json({
      success: true,
      message: "Patient account created successfully.",
      token,
      user: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        role: "patient",
        country: patient.country,
      },
    });
  } catch (error) {
    console.error("Patient registration error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// Doctor Registration
// =====================================================

exports.registerDoctor = async (_req, res) => {
  return res.status(403).json({
    success: false,
    message: "Doctor registration is disabled. This clinic has one administrator/doctor account configured by the system.",
  });
};

// =====================================================
// Login
// =====================================================

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password and role are required.",
      });
    }

    if (!["patient", "doctor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    // Find user by email AND role
    const user = await User.findOne({
      email: email.toLowerCase(),
      role,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email, password or role.",
      });
    }

    // Check active account
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email, password or role.",
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        country: user.country,
        specialization: user.specialization,
        qualification: user.qualification,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// Get Current User
// =====================================================

exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// Forgot Password
// =====================================================

exports.forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: "Email and role are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      role,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    const resetToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        purpose: "password-reset",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    // For now return token in development.
    // In production, send this token through email.
    return res.status(200).json({
      success: true,
      message: "Password reset request created.",
      resetToken:
        process.env.NODE_ENV === "production" ? undefined : resetToken,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// Get Doctors
// =====================================================

exports.getDoctors = async (req, res) => {
  try {
    const { specialization, country, search } = req.query;

    const query = {
      role: "doctor",
      isActive: true,
    };

    if (specialization) {
      query.specialization = new RegExp(specialization, "i");
    }

    if (country) {
      query.country = new RegExp(country, "i");
    }

    if (search) {
      query.$or = [
        {
          name: new RegExp(search, "i"),
        },
        {
          specialization: new RegExp(search, "i"),
        },
        {
          qualification: new RegExp(search, "i"),
        },
      ];
    }

    const doctors = await User.find(query)
      .select("-password")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Get doctors error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// Get Single Doctor
// =====================================================

exports.getDoctor = async (req, res) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      role: "doctor",
      isActive: true,
    }).select("-password");

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
      message: error.message,
    });
  }
};
