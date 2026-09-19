require("dotenv").config();

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");

const app = express();

// =====================================================
// ENVIRONMENT
// =====================================================

const PORT = Number(process.env.PORT) || 5000;

const isProduction =
  process.env.NODE_ENV === "production";

// =====================================================
// REQUIRED ENV VARIABLES
// =====================================================

if (!process.env.MONGODB_URI) {
  console.error(
    "MONGODB_URI is missing from environment variables."
  );
  process.exit(1);
}

// =====================================================
// PROXY CONFIGURATION
// =====================================================

if (isProduction) {
  app.set("trust proxy", 1);
}

// =====================================================
// SECURITY HEADERS
// =====================================================

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  process.env.FRONTEND_URL,
  !isProduction
    ? "http://localhost:5173"
    : null,
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const error = new Error(
      "Origin not allowed by CORS."
    );

    error.status = 403;
    return callback(error);
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

app.use(cors(corsOptions));

// Explicit browser preflight handling
app.options("*", cors(corsOptions));

// =====================================================
// BODY PARSING
// =====================================================

app.use(cookieParser());

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

// =====================================================
// CSRF / ORIGIN PROTECTION
// =====================================================

const csrfOriginProtection = (req, res, next) => {
  if (
    ["GET", "HEAD", "OPTIONS"].includes(req.method)
  ) {
    return next();
  }

  const origin = req.get("Origin");

  if (origin) {
    if (!allowedOrigins.includes(origin)) {
      return res.status(403).json({
        success: false,
        message: "Request origin is not allowed.",
      });
    }

    return next();
  }

  return next();
};

app.use(csrfOriginProtection);

// =====================================================
// RATE LIMITING
// =====================================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 300,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 10,

  standardHeaders: true,
  legacyHeaders: false,

  skipSuccessfulRequests: true,

  message: {
    success: false,
    message:
      "Too many login attempts. Please try again later.",
  },
});

app.use(
  "/api/auth/login",
  authLimiter
);

app.use(
  "/api",
  apiLimiter
);

// =====================================================
// IMPORTANT — PRIVATE UPLOADS
// =====================================================

// DO NOT expose uploads publicly.
// Medical reports/payment slips should only be accessed
// through authenticated secure-file endpoints.

// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
  "/api/health",
  (_req, res) => {
    const databaseConnected =
      mongoose.connection.readyState === 1;

    return res
      .status(databaseConnected ? 200 : 503)
      .json({
        status:
          databaseConnected
            ? "OK"
            : "DEGRADED",

        database:
          databaseConnected
            ? "connected"
            : "disconnected",

        timestamp:
          new Date().toISOString(),
      });
  }
);

// =====================================================
// ROUTES
// =====================================================

app.use(
  "/api/auth",
  require("./routes/auth")
);

app.use(
  "/api/appointments",
  require("./routes/appointments")
);

app.use(
  "/api/payments",
  require("./routes/payments")
);

app.use(
  "/api/patients",
  require("./routes/patients")
);

app.use(
  "/api/medical-records",
  require("./routes/medicalRecords")
);

app.use(
  "/api/prescriptions",
  require("./routes/prescriptions")
);

app.use(
  "/api/notifications",
  require("./routes/notifications")
);

app.use(
  "/api/reports",
  require("./routes/reports")
);

app.use(
  "/api/blog",
  require("./routes/blog")
);

app.use(
  "/api/website-settings",
  require("./routes/websiteSettings")
);

// =====================================================
// API 404
// =====================================================

app.use(
  "/api",
  (req, res) => {
    return res.status(404).json({
      success: false,
      message: "API route not found.",
    });
  }
);

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

// eslint-disable-next-line no-unused-vars
app.use(
  (err, req, res, next) => {
    console.error(
      `${req.method} ${req.originalUrl}`,
      err
    );

    // FILE SIZE
    if (
      err instanceof multer.MulterError &&
      err.code === "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "File size must not exceed 50 KB.",
      });
    }

    // FILE TYPE
    if (
      err.code === "INVALID_FILE_TYPE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only JPG, JPEG and PNG files are allowed.",
      });
    }

    // OTHER MULTER ERRORS
    if (
      err instanceof multer.MulterError
    ) {
      return res.status(400).json({
        success: false,
        message:
          "File upload failed.",
      });
    }

    // INVALID MONGODB ID
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID.",
      });
    }

    // MONGOOSE VALIDATION
    if (
      err.name === "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid data provided.",
      });
    }

    // DUPLICATE DATABASE VALUE
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A record with this information already exists.",
      });
    }

    // GENERAL ERROR
    const status =
      Number.isInteger(err.status) &&
      err.status >= 400 &&
      err.status < 600
        ? err.status
        : 500;

    return res.status(status).json({
      success: false,

      message:
        status === 500 && isProduction
          ? "Something went wrong."
          : err.message ||
            "Something went wrong.",
    });
  }
);

// =====================================================
// DATABASE + SERVER STARTUP
// =====================================================

const startServer = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 10000,
      }
    );

    console.log("MongoDB Connected");

    console.log(
      "Database:",
      mongoose.connection.name
    );

    app.listen(
      PORT,
      () => {
        console.log(
          `Server running on port ${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();

// =====================================================
// DATABASE EVENTS
// =====================================================

mongoose.connection.on(
  "error",
  (error) => {
    console.error(
      "MongoDB runtime error:",
      error.message
    );
  }
);

mongoose.connection.on(
  "disconnected",
  () => {
    console.warn(
      "MongoDB disconnected."
    );
  }
);

// =====================================================
// PROCESS SAFETY
// =====================================================

process.on(
  "unhandledRejection",
  (error) => {
    console.error(
      "Unhandled promise rejection:",
      error
    );
  }
);

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "Uncaught exception:",
      error
    );

    process.exit(1);
  }
);