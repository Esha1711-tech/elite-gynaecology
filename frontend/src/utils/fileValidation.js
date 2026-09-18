export const validateUploadFile = (file) => {
  const allowedExtensions = [
    "jpg",
    "jpeg",
    "png",
  ];

  const maxSize = 50 * 1024; // 30 KB

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      message:
        "Only JPG, JPEG, PNG files are allowed.",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      message: "File size must not exceed 50 KB.",
    };
  }

  return {
    valid: true,
  };
};