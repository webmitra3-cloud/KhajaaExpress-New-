const buildConversationKey = (userId, vendorUserId) =>
  `${String(userId)}:${String(vendorUserId)}`;

module.exports = {
  buildConversationKey,
};
