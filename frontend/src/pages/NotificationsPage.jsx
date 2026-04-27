import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useNotifications } from "../hooks/useNotifications";
import { formatDate } from "../utils/formatters";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications, loading, unreadCount, markAllAsRead, markAsRead } = useNotifications();

  const handleOpen = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id);
      } catch (error) {
        console.error(error);
      }
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading notifications..." />;
  }

  if (!notifications.length) {
    return <EmptyState title="No notifications yet" description="Order updates, reviews, approvals, and payment alerts will appear here." />;
  }

  return (
    <div className="list-stack">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="muted-text">Important updates from orders, payments, reviews, and approvals.</p>
        </div>
        <button type="button" className="button button-secondary" onClick={markAllAsRead} disabled={!unreadCount}>
          Mark all as read
        </button>
      </div>

      <div className="grid gap-4">
        {notifications.map((notification) => (
          <button
            key={notification._id}
            type="button"
            onClick={() => handleOpen(notification)}
            className={`flex w-full items-start gap-4 rounded-3xl border px-5 py-4 text-left transition ${
              notification.isRead ? "border-slate-200 bg-white" : "border-saffron-200 bg-saffron-50/70"
            }`}
          >
            <span
              className={`mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
                notification.isRead ? "bg-slate-100 text-slate-500" : "bg-charcoal-900 text-white"
              }`}
            >
              <Bell className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="flex flex-wrap items-center gap-3">
                <strong className="text-charcoal-900">{notification.title}</strong>
                {!notification.isRead ? <span className="subtle-pill pill-warning">New</span> : null}
              </span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">{notification.message}</span>
              <span className="mt-3 block text-xs uppercase tracking-[0.2em] text-slate-400">{formatDate(notification.createdAt)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
