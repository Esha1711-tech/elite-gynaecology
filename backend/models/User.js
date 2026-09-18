const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // =================================================
    // BASIC INFORMATION
    // =================================================

    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,

      validate: {
        validator(value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            value
          );
        },
        message:
          "Please provide a valid email address.",
      },
    },

    password: {
      type: String,
      required: [true, "Password is required."],
      select: false,
      minlength: [
        8,
        "Password must be at least 8 characters.",
      ],
      maxlength: [128, "Password is too long."],

      validate: {
        validator(value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/.test(
            value
          );
        },

        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.",
      },
    },

    phone: {
      type: String,
      required: [true, "Phone number is required."],
      trim: true,
      minlength: 7,
      maxlength: 20,

      validate: {
        validator(value) {
          return /^\+?[0-9\s()-]{7,20}$/.test(
            value
          );
        },

        message:
          "Please provide a valid phone number.",
      },
    },

    role: {
      type: String,
      enum: ["patient", "doctor"],
      default: "patient",
      required: true,
    },

    country: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "Pakistan",
    },

    dateOfBirth: {
      type: Date,

      validate: {
        validator(value) {
          if (!value) return true;

          return value <= new Date();
        },

        message:
          "Date of birth cannot be in the future.",
      },
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    profileImage: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // =================================================
    // DOCTOR INFORMATION
    // =================================================

    specialization: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    qualification: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    licenseNumber: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },

    // =================================================
    // PASSWORD RESET SECURITY
    // =================================================

    // SHA-256 hash of the reset token.
    // The raw reset token is NEVER stored in MongoDB.
    passwordResetToken: {
      type: String,
      select: false,
      default: undefined,
    },

    // Reset token is valid only until this time.
    passwordResetExpires: {
      type: Date,
      select: false,
      default: undefined,
    },

    // Used to invalidate JWT sessions that were created
    // before the password was changed/reset.
    passwordChangedAt: {
      type: Date,
      select: false,
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// =====================================================
// PASSWORD HASHING
// =====================================================

userSchema.pre(
  "save",
  async function (next) {
    try {
      if (!this.isModified("password")) {
        return next();
      }

      this.password = await bcrypt.hash(
        this.password,
        12
      );

      /*
       * When an existing user's password changes,
       * record when it happened.
       *
       * A tiny timestamp offset avoids edge cases where
       * JWT iat and passwordChangedAt occur in the same
       * second.
       *
       * Do NOT set this during initial registration.
       */
      if (!this.isNew) {
        this.passwordChangedAt = new Date(
          Date.now() - 1000
        );
      }

      return next();
    } catch (error) {
      return next(error);
    }
  }
);

// =====================================================
// PASSWORD COMPARISON
// =====================================================

userSchema.methods.comparePassword =
  async function (candidatePassword) {
    if (!this.password) {
      return false;
    }

    return bcrypt.compare(
      candidatePassword,
      this.password
    );
  };

// =====================================================
// CHECK WHETHER PASSWORD CHANGED AFTER JWT
// =====================================================

userSchema.methods.changedPasswordAfter =
  function (jwtIssuedAt) {
    if (!this.passwordChangedAt) {
      return false;
    }

    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );

    return changedTimestamp > jwtIssuedAt;
  };

// =====================================================
// DATABASE INDEXES
// =====================================================

// Doctor dashboard / active patient listing
userSchema.index({
  role: 1,
  isActive: 1,
  createdAt: -1,
});

// Patient listing
userSchema.index({
  role: 1,
  createdAt: -1,
});

// Fast lookup for password-reset tokens.
// Sparse because most users will not have a token.
userSchema.index(
  {
    passwordResetToken: 1,
  },
  {
    sparse: true,
  }
);

// =====================================================
// MODEL
// =====================================================

module.exports = mongoose.model(
  "User",
  userSchema
);