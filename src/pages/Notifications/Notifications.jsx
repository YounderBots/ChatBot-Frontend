import { AlertTriangle, Bell, BellOff, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import APICall from "../../APICalls/APICall";
import "./Notifications.css";

const ICON_MAP = {
  escalation: AlertTriangle,
};

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

const PER_PAGE = 15;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/conversation/notifications?page=${page}&per_page=${PER_PAGE}`;
      if (filter === "unread") url += "&is_read=false";
      if (filter === "read") url += "&is_read=true";
      const data = await APICall.getT(url);
      setNotifications(data.notifications || []);
      setTotal(data.total || 0);
    } catch {
      setNotifications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await APICall.postT(`/conversation/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch { /* badge will self-correct on next poll */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await APICall.postT("/conversation/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch { /* ignore */ }
  };

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="notif-page">
      <div className="notif-header">
        <h4>Notifications</h4>
        <div className="notif-header-actions">
          <button
            className="notif-mark-all"
            onClick={handleMarkAllRead}
            disabled={!hasUnread}
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="notif-filter-tabs">
        {["all", "unread", "read"].map((f) => (
          <button
            key={f}
            className={`notif-filter-tab ${filter === f ? "active" : ""}`}
            onClick={() => { setFilter(f); setPage(1); }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="notif-loading">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="notif-empty">
          <BellOff size={48} />
          <p>{filter === "unread" ? "No unread notifications" : "No notifications yet"}</p>
        </div>
      ) : (
        <>
          <div className="notif-list">
            {notifications.map((n) => {
              const Icon = ICON_MAP[n.type] || Bell;
              const iconClass = n.type === "escalation" ? "notif-icon-escalation" : "notif-icon-default";
              return (
                <div
                  key={n.id}
                  className={`notif-item ${!n.is_read ? "unread" : ""}`}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                >
                  <div className={`notif-icon-wrap ${iconClass}`}>
                    <Icon size={20} />
                  </div>
                  <div className="notif-body">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-message">{n.message}</div>
                  </div>
                  <span className="notif-time">{timeAgo(n.created_at)}</span>
                  {!n.is_read && <span className="notif-dot" />}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="notif-pagination">
              <button
                className="notif-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={14} />
              </button>
              <span className="notif-page-info">
                {page} / {totalPages}
              </span>
              <button
                className="notif-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notifications;
