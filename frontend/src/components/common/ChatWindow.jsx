import { useEffect, useMemo, useState } from "react";
import { formatDate } from "../../utils/formatters";
import EmptyState from "./EmptyState";

const ChatWindow = ({
  conversations,
  activeConversation,
  messages,
  onSelectConversation,
  onSend,
  currentUserId,
  loading,
}) => {
  const [text, setText] = useState("");

  useEffect(() => {
    setText("");
  }, [activeConversation?.conversationKey]);

  const title = useMemo(() => {
    if (!activeConversation) {
      return "Select a conversation";
    }

    return activeConversation.restaurantName || activeConversation.receiverName || "Conversation";
  }, [activeConversation]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!text.trim() || !activeConversation) {
      return;
    }

    await onSend(text.trim());
    setText("");
  };

  return (
    <div className="chat-layout card user-chat-layout-pro">
      <div className="chat-sidebar user-chat-sidebar-pro">
        <div className="user-chat-sidebar-head">
          <h3>Conversations</h3>
          <small>{conversations.length}</small>
        </div>
        <div className="chat-conversation-list">
          {conversations.length ? (
            conversations.map((conversation) => (
              <button
                key={conversation.conversationKey}
                type="button"
                className={`chat-conversation-item user-chat-thread-pro ${
                  activeConversation?.conversationKey === conversation.conversationKey ? "active" : ""
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <strong>{conversation.restaurantName || conversation.receiverName || "Conversation"}</strong>
                <span>{conversation.text || conversation.lastMessage || "Open chat"}</span>
              </button>
            ))
          ) : (
            <p className="muted-text">No conversations yet.</p>
          )}
        </div>
      </div>

      <div className="chat-panel user-chat-panel-pro">
        <div className="chat-header user-chat-header-pro">
          <h3>{title}</h3>
        </div>

        <div className="chat-messages user-chat-messages-pro">
          {!activeConversation ? (
            <EmptyState title="No active chat" description="Start a conversation from a restaurant or order page." />
          ) : loading ? (
            <p className="muted-text">Loading messages...</p>
          ) : messages.length ? (
            messages.map((message) => (
              <div
                key={message._id}
                className={`chat-bubble ${String(message.sender?._id || message.sender) === String(currentUserId) ? "mine" : "theirs"}`}
              >
                <p>{message.text}</p>
                <small>{formatDate(message.createdAt)}</small>
              </div>
            ))
          ) : (
            <p className="muted-text">No messages yet. Start the conversation below.</p>
          )}
        </div>

        <form className="chat-form user-chat-form-pro" onSubmit={handleSubmit}>
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Type your message"
            disabled={!activeConversation}
          />
          <button type="submit" className="button" disabled={!activeConversation || !text.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;