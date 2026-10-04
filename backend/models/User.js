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

    /*
     * Email is required only when the user has portal access.
     *
     * Online/self-registered patients:
     * portalAccess = true  -> email required
     *
     * Doctor-created walk-in patients:
     * portalAccess = false -> email optional
     */
    email: {
      type: String,
      lowercase: true,
      trim: true,
      maxlength: 254,

      required: [
        function () {
          return this.portalAccess !== false;
        },
        "Email is required.",
      ],

      validate: {
        validator(value) {
          if (!value) return true;

          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            value
          );
        },

        message:
          "Please provide a valid email address.",
      },
    },

    /*
     * Password follows the same rule.
     *
     * Walk-in patients do not need login credentials.
     */
    password: {
      type: String,
      select: false,

      required: [
        function () {
          return this.portalAccess !== false;
        },
        "Password is required.",
      ],

      minlength: [
        8,
        "Password must be at least 8 characters.",
      ],

      maxlength: [
        128,
        "Password is too long.",
      ],

      validate: {
        validator(value) {
          if (!value) return true;

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
      required: [
        true,
        "Phone number is required.",
      ],
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

    /*
     * Controls whether this patient can log in.
     *
     * Existing/online users automatically get true.
     * Doctor-created walk-in patients get false.
     */
    portalAccess: {
      type: Boolean,
      default: true,
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
      enum: [
        "male",
        "female",
        "other",
      ],
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

    passwordResetToken: {
      type: String,
      select: false,
      default: undefined,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
      default: undefined,
    },

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
      /*
       * Walk-in patients have no password.
       * Nothing needs to be hashed.
       */
      if (
        !this.isModified("password") ||
        !this.password
      ) {
        return next();
      }

      this.password = await bcrypt.hash(
        this.password,
        12
      );

      if (!this.isNew) {
        this.passwordChangedAt =
          new Date(
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

    const changedTimestamp =
      Math.floor(
        this.passwordChangedAt.getTime() /
          1000
      );

    return (
      changedTimestamp > jwtIssuedAt
    );
  };

// =====================================================
// DATABASE INDEXES
// =====================================================

userSchema.index({
  role: 1,
  isActive: 1,
  createdAt: -1,
});

userSchema.index({
  role: 1,
  createdAt: -1,
});

/*
 * Email must stay unique when an email exists.
 * Multiple walk-in patients may have no email.
 */
userSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

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

module.exports =
  mongoose.models.User ||
  mongoose.model(
    "User",
    userSchema
  );