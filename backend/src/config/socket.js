const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { emitChatMessage, saveChatMessage } = require("../utils/chatService");

const configureSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("_id name role");

      if (!user) {
        return next(new Error("Unauthorized"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(String(socket.user._id));

    socket.on("chat:join", (conversationKey) => {
      if (conversationKey) {
        socket.join(conversationKey);
      }
    });

    socket.on("chat:send", async (payload, callback) => {
      try {
        const message = await saveChatMessage({
          senderId: socket.user._id,
          receiverId: payload.receiverId,
          text: payload.text,
        });

        emitChatMessage(io, message);

        if (typeof callback === "function") {
          callback({ success: true, message });
        }
      } catch (error) {
        if (typeof callback === "function") {
          callback({
            success: false,
            message: error.message || "Unable to send message",
          });
        }
      }
    });
  });
};

module.exports = configureSocket;
