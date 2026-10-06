const multer = require("multer");
const path = require("path");
const fs = require("fs");

const MAX_FILE_SIZE = 50 * 1024; // 50 KB

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];

const createUpload = (folderName) => {
  const uploadDir = path.join(
    __dirname,
    "..",
    "uploads",
    folderName
  );

  fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },

    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();

      const baseName = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9_-]/g, "_");

      cb(null, `${Date.now()}-${baseName}${ext}`);
    },
  });

  return multer({
    storage,

    limits: {
      fileSize: MAX_FILE_SIZE,
    },

    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();

      const validMime = ALLOWED_MIME_TYPES.includes(file.mimetype);
      const validExtension = ALLOWED_EXTENSIONS.includes(ext);

      if (!validMime || !validExtension) {
        const error = new Error(
          "Only JPG, JPEG and PNG files are allowed."
        );

        error.code = "INVALID_FILE_TYPE";

        return cb(error);
      }

      cb(null, true);
    },
  });
};

const paymentSlipUpload = createUpload("payment-slips");
const medicalReportUpload = createUpload("medical-reports");

// ==========================================
// BLOG FEATURED IMAGE UPLOAD
// ==========================================

const blogImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/blogs";

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const blogImageFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      ),
      false
    );
  }
};

const blogImageUpload = multer({
  storage: blogImageStorage,
  fileFilter: blogImageFilter,

  // 5 MB
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = {
  paymentSlipUpload,
  medicalReportUpload,
  blogImageUpload,
  MAX_FILE_SIZE,
};