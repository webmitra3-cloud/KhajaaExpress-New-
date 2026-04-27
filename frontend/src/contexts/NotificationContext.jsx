import { createContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/client";
import { useAuth } from "../hooks/useAuth";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!token) {
      setNotifications([]);
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !user?._id) {
      setNotifications([]);
      return;
    }

    fetchNotifications();
  }, [token, user?._id]);

  useEffect(() => {
    if (!token || !user?._id) {
      return undefined;
    }

    const socket = io(socketUrl, {
      auth: { token },
    });

    const handleNotification = (notification) => {
      setNotifications((current) => {
        const filtered = current.filter((item) => item._id !== notification._id);
        return [notification, ...filtered];
      });
    };

    socket.on("notification:new", handleNotification);

    return () => {
      socket.off("notification:new", handleNotification);
      socket.disconnect();
    };
  }, [token, user?._id]);

  const markAsRead = async (notificationId) => {
    await api.patch(`/notifications/${notificationId}/read`);
    setNotifications((current) =>
      current.map((notification) =>
        notification._id === notificationId
          ? {
              ...notification,
              isRead: true,
              readAt: notification.readAt || new Date().toISOString(),
            }
          : notification
      )
    );
  };

  const markAllAsRead = async () => {
    await api.patch("/notifications/read-all");
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
        readAt: notification.readAt || new Date().toISOString(),
      }))
    );
  };

  const value = useMemo(
    () => ({
      notifications,
      loading,
      unreadCount: notifications.filter((item) => !item.isRead).length,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
    }),
    [loading, notifications]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
