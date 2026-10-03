const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");
const { auth } = require("../middleware/auth");

// =====================================================
// GET CURRENT USER NOTIFICATIONS
// =====================================================

router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json(notifications);
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
});

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// IMPORTANT:
// This route MUST stay above "/:id/read"
// =====================================================

router.patch(
  "/read-all",
  auth,
  async (req, res) => {
    try {
      const result =
        await Notification.updateMany(
          {
            recipientId: req.user.id,
            isRead: false,
          },
          {
            $set: {
              isRead: true,
            },
          }
        );

      return res.json({
        success: true,
        message:
          "All notifications marked as read",
        modifiedCount:
          result.modifiedCount || 0,
      });
    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );

      return res.status(500).json({
        message: error.message,
      });
    }
  }
);

// =====================================================
// MARK SINGLE NOTIFICATION AS READ
// =====================================================

router.patch(
  "/:id/read",
  auth,
  async (req, res) => {
    try {
      const notification =
        await Notification.findOneAndUpdate(
          {
            _id: req.params.id,
            recipientId: req.user.id,
          },
          {
            $set: {
              isRead: true,
            },
          },
          {
            new: true,
          }
        );

      if (!notification) {
        return res.status(404).json({
          message:
            "Notification not found",
        });
      }

      return res.json(notification);
    } catch (error) {
      console.error(
        "Mark notification error:",
        error
      );

      return res.status(500).json({
        message: error.message,
      });
    }
  }
);

module.exports = router;