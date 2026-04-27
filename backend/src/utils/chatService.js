const Message = require("../models/Message");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const { buildConversationKey } = require("./conversation");

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const saveChatMessage = async ({ senderId, receiverId, text }) => {
  if (!text || !text.trim()) {
    throw createHttpError(400, "Message text is required");
  }

  const [sender, receiver] = await Promise.all([
    User.findById(senderId),
    User.findById(receiverId),
  ]);

  if (!sender || !receiver) {
    throw createHttpError(404, "Chat participant not found");
  }

  if (sender.role === "admin" || receiver.role === "admin") {
    throw createHttpError(400, "Admin chat is not enabled");
  }

  let userId;
  let vendorUserId;

  if (sender.role === "user" && receiver.role === "vendor") {
    userId = sender._id;
    vendorUserId = receiver._id;
  } else if (sender.role === "vendor" && receiver.role === "user") {
    userId = receiver._id;
    vendorUserId = sender._id;
  } else {
    throw createHttpError(400, "Chat is only allowed between users and vendors");
  }

  const vendor = await Vendor.findOne({ user: vendorUserId });

  if (!vendor || vendor.approvalStatus !== "approved") {
    throw createHttpError(400, "Vendor chat is unavailable");
  }

  const conversationKey = buildConversationKey(userId, vendorUserId);

  const message = await Message.create({
    conversationKey,
    user: userId,
    vendor: vendor._id,
    sender: sender._id,
    receiver: receiver._id,
    senderRole: sender.role,
    text: text.trim(),
  });

  return Message.findById(message._id)
    .populate("sender", "name role")
    .populate("receiver", "name role")
    .populate({
      path: "vendor",
      select: "restaurantName user",
      populate: {
        path: "user",
        select: "name",
      },
    });
};

const emitChatMessage = (io, messageDoc) => {
  if (!io || !messageDoc) {
    return;
  }

  const message = typeof messageDoc.toObject === "function" ? messageDoc.toObject() : messageDoc;
  const senderId = String(message.sender?._id || message.sender);
  const receiverId = String(message.receiver?._id || message.receiver);

  io.to(senderId).emit("chat:message", message);
  io.to(receiverId).emit("chat:message", message);
  io.to(message.conversationKey).emit("chat:message", message);
};

module.exports = {
  saveChatMessage,
  emitChatMessage,
};
