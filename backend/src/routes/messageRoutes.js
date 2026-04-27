const express = require("express");
const {
  createMessage,
  getConversations,
  getMessagesByConversation,
} = require("../controllers/messageController");
const { authorize, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/conversations", protect, authorize("user", "vendor"), getConversations);
router.get("/:conversationKey", protect, authorize("user", "vendor"), getMessagesByConversation);
router.post("/", protect, authorize("user", "vendor"), createMessage);

module.exports = router;
