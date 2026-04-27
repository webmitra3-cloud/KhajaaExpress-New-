const Message = require("../models/Message");
const { emitChatMessage, saveChatMessage } = require("../utils/chatService");

const getConversations = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate("sender", "name role")
      .populate("receiver", "name role")
      .populate({
        path: "vendor",
        select: "restaurantName user",
        populate: {
          path: "user",
          select: "name",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    const seen = new Set();
    const conversations = [];

    for (const message of messages) {
      if (seen.has(message.conversationKey)) {
        continue;
      }

      seen.add(message.conversationKey);
      conversations.push(message);
    }

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

const getMessagesByConversation = async (req, res, next) => {
  try {
    const messages = await Message.find({
      conversationKey: req.params.conversationKey,
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate("sender", "name role")
      .populate("receiver", "name role")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

const createMessage = async (req, res, next) => {
  try {
    const { receiverId, text } = req.body;
    const message = await saveChatMessage({
      senderId: req.user._id,
      receiverId,
      text,
    });

    emitChatMessage(req.io, message);

    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getMessagesByConversation,
  createMessage,
};
