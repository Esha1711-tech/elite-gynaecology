const fs = require("fs");

const deleteFile = (filePath) => {
  if (!filePath) return;

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(
      "Failed to remove invalid upload:",
      error
    );
  }
};

const validateImageFile = (req, res, next) => {
  try {
    // Some routes may treat file as optional.
    if (!req.file) {
      return next();
    }

    const filePath = req.file.path;

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({
        success: false,
        message: "Uploaded file could not be processed.",
      });
    }

    /*
     * We only need the first 8 bytes:
     *
     * JPEG:
     * FF D8 FF
     *
     * PNG:
     * 89 50 4E 47 0D 0A 1A 0A
     */
    const fd = fs.openSync(filePath, "r");
    const buffer = Buffer.alloc(8);

    const bytesRead = fs.readSync(
      fd,
      buffer,
      0,
      8,
      0
    );

    fs.closeSync(fd);

    if (bytesRead < 3) {
      deleteFile(filePath);

      return res.status(400).json({
        success: false,
        message: "Invalid image file.",
      });
    }

    // ==========================================
    // JPEG SIGNATURE
    // ==========================================

    const isJPEG =
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;

    // ==========================================
    // PNG SIGNATURE
    // ==========================================

    const isPNG =
      bytesRead >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a;

    if (!isJPEG && !isPNG) {
      deleteFile(filePath);

      return res.status(400).json({
        success: false,
        message:
          "Invalid file content. Only genuine JPG, JPEG and PNG images are allowed.",
      });
    }

    // ==========================================
    // MIME MUST MATCH ACTUAL CONTENT
    // ==========================================

    const expectedMime = isJPEG
      ? "image/jpeg"
      : "image/png";

    if (req.file.mimetype !== expectedMime) {
      deleteFile(filePath);

      return res.status(400).json({
        success: false,
        message:
          "File type does not match its actual content.",
      });
    }

    req.file.detectedMimeType = expectedMime;

    return next();
  } catch (error) {
    console.error(
      "Image signature validation error:",
      error
    );

    if (req.file?.path) {
      deleteFile(req.file.path);
    }

    return res.status(400).json({
      success: false,
      message: "Unable to validate uploaded image.",
    });
  }
};

module.exports = validateImageFile;