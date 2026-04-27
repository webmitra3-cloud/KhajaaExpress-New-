import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import api from "../api/client";
import ChatWindow from "../components/common/ChatWindow";
import { useAuth } from "../hooks/useAuth";
import { buildConversationKey } from "../utils/routeHelpers";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const createPreview = (message, currentUserId) => {
  const senderId = String(message.sender?._id || message.sender);
  const isMine = senderId === String(currentUserId);
  const otherPerson = isMine ? message.receiver : message.sender;

  return {
    conversationKey: message.conversationKey,
    receiverId: otherPerson?._id || otherPerson,
    receiverName: otherPerson?.name || message.vendor?.restaurantName,
    restaurantName: message.vendor?.restaurantName || otherPerson?.name,
    text: message.text,
  };
};

const upsertConversation = (items, nextItem) => {
  const filtered = items.filter((item) => item.conversationKey !== nextItem.conversationKey);
  return [nextItem, ...filtered];
};

const UserChatPage = () => {
  const location = useLocation();
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get("/messages/conversations");
        const normalized = data.map((message) => createPreview(message, user?._id));
        setConversations(normalized);

        if (normalized.length) {
          setActiveConversation((current) => current || normalized[0]);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (user?._id) {
      fetchConversations();
    }
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id || !location.state?.receiverId) {
      return;
    }

    const starter = {
      conversationKey:
        location.state.conversationKey || buildConversationKey(user._id, location.state.receiverId),
      receiverId: location.state.receiverId,
      receiverName: location.state.receiverName || location.state.restaurantName,
      restaurantName: location.state.restaurantName || location.state.receiverName,
      text: "",
    };

    setConversations((current) => upsertConversation(current, starter));
    setActiveConversation(starter);
  }, [location.state, user?._id]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socket = io(socketUrl, {
      auth: { token },
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    const socket = socketRef.current;

    if (!socket) {
      return undefined;
    }

    const handleMessage = (message) => {
      const preview = createPreview(message, user?._id);
      setConversations((current) => upsertConversation(current, preview));

      if (message.conversationKey === activeConversation?.conversationKey) {
        setMessages((current) => {
          if (current.some((item) => item._id === message._id)) {
            return current;
          }

          return [...current, message];
        });
      }
    };

    socket.on("chat:message", handleMessage);

    return () => {
      socket.off("chat:message", handleMessage);
    };
  }, [activeConversation?.conversationKey, user?._id]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) {
        return;
      }

      setLoadingMessages(true);

      try {
        socketRef.current?.emit("chat:join", activeConversation.conversationKey);
        const { data } = await api.get(`/messages/${encodeURIComponent(activeConversation.conversationKey)}`);
        setMessages(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConversation]);

  const handleSend = async (text) => {
    if (!activeConversation) {
      return;
    }

    const socket = socketRef.current;

    if (socket) {
      await new Promise((resolve, reject) => {
        socket.emit(
          "chat:send",
          {
            receiverId: activeConversation.receiverId,
            text,
          },
          (response) => {
            if (response?.success) {
              resolve(response.message);
            } else {
              reject(new Error(response?.message || "Unable to send message"));
            }
          }
        );
      });
      return;
    }

    await api.post("/messages", {
      receiverId: activeConversation.receiverId,
      text,
    });
  };

  return (
    <div className="user-panel-stack">
      <section className="card user-panel-hero user-panel-hero-chat">
        <div className="user-panel-hero-main">
          <div>
            <span className="section-kicker">Messages</span>
            <h1>Chat</h1>
            <p className="muted-text">Talk to restaurants and keep your message history.</p>
          </div>
          <div className="user-summary-strip user-summary-strip-compact">
            <div className="user-summary-pill">
              <strong>{conversations.length}</strong>
              <span>Threads</span>
            </div>
            <div className="user-summary-pill">
              <strong>{activeConversation ? 1 : 0}</strong>
              <span>Open</span>
            </div>
          </div>
        </div>
      </section>

      <ChatWindow
        conversations={conversations}
        activeConversation={activeConversation}
        messages={messages}
        onSelectConversation={setActiveConversation}
        onSend={handleSend}
        currentUserId={user?._id}
        loading={loadingMessages}
      />
    </div>
  );
};

export default UserChatPage;