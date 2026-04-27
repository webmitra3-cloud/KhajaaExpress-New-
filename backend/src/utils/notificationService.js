const Notification = require("../models/Notification");

const createNotification = async (io, { recipient, type = "general", title, message, link = "", metadata = {} }) => {
  if (!recipient || !title || !message) {
    return null;
  }

  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    link,
    metadata,
  });

  const populatedNotification = await Notification.findById(notification._id).populate("recipient", "name role");

  if (io) {
    io.to(String(recipient)).emit("notification:new", populatedNotification);
  }

  return populatedNotification;
};

const createNotifications = async (io, recipients, payload) => {
  const uniqueRecipients = Array.from(new Set((recipients || []).filter(Boolean).map((item) => String(item))));

  return Promise.all(
    uniqueRecipients.map((recipient) =>
      createNotification(io, {
        ...payload,
        recipient,
      })
    )
  );
};

module.exports = {
  createNotification,
  createNotifications,
};
