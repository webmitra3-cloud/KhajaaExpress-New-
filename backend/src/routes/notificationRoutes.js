const express = require("express");
const {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} = require("../controllers/notificationController");
const { authorize, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("user", "vendor", "admin"));

router.get("/", getNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch("/:id/read", markNotificationRead);

module.exports = router;
