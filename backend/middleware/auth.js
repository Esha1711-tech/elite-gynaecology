const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // Primary authentication:
    // HttpOnly cookie
    let token = req.cookies?.auth_token;

    // Temporary Bearer fallback keeps Postman/API
    // testing compatible during migration.
    if (!token) {
      const authHeader =
        req.headers.authorization;

      if (
        authHeader &&
        authHeader.startsWith("Bearer ")
      ) {
        token =
          authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user =
      await User.findById(
        decoded.id
      ).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "User no longer exists.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive.",
      });
    }

    // Do not trust role stored in JWT alone.
    // Current database role is authoritative.

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      country: user.country,
    };

    return next();
  } catch (error) {
    if (
      error.name !==
        "JsonWebTokenError" &&
      error.name !==
        "TokenExpiredError"
    ) {
      console.error(
        "Auth middleware error:",
        error.message
      );
    }

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired authentication session.",
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    if (
      !roles.includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized for this action.",
      });
    }

    return next();
  };
};

module.exports = {
  auth,
  authorize,
};