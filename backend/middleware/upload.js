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

module.exports = {
  paymentSlipUpload,
  medicalReportUpload,
  MAX_FILE_SIZE,
};