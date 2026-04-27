import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../../api/client";
import ChatWindow from "../../components/common/ChatWindow";
import { useAuth } from "../../hooks/useAuth";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const createPreview = (message, currentUserId) => {
  const senderId = String(message.sender?._id || message.sender);
  const isMine = senderId === String(currentUserId);
  const otherPerson = isMine ? message.receiver : message.sender;

  return {
    conversationKey: message.conversationKey,
    receiverId: otherPerson?._id || otherPerson,
    receiverName: otherPerson?.name,
    restaurantName: otherPerson?.name,
    text: message.text,
  };
};

const upsertConversation = (items, nextItem) => {
  const filtered = items.filter((item) => item.conversationKey !== nextItem.conversationKey);
  return [nextItem, ...filtered];
};

const VendorChatPage = () => {
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
    <div>
      <div className="page-header">
        <div>
          <h1>Vendor Chat</h1>
          <p className="muted-text">Reply to customers in real time and review older messages.</p>
        </div>
      </div>

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

export default VendorChatPage;
