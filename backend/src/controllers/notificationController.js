const Notification = require("../models/Notification");

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(100);

    res.json({
      notifications,
      unreadCount: notifications.filter((item) => !item.isRead).length,
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      res.status(404);
      throw new Error("Notification not found");
    }

    notification.isRead = true;
    notification.readAt = notification.readAt || new Date();
    await notification.save();

    res.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    res.json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
