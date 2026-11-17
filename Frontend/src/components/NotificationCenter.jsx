import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import Icon from "./Icon.jsx";

function formatCreatedAt(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleString();
}

export default function NotificationCenter({ onOpenAppointments }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let current = true;
        let fetching = false;

        async function loadNotifications() {
            if (fetching) return;
            fetching = true;
            try {
                const result = await api.get("/notifications");
                if (!current) return;
                setNotifications(result.notifications);
                setUnreadCount(result.unreadCount);
                setError("");
            } catch (requestError) {
                if (current) setError(requestError.message);
            } finally {
                fetching = false;
                if (current) setLoading(false);
            }
        }

        loadNotifications();
        const interval = window.setInterval(loadNotifications, 30000);
        return () => {
            current = false;
            window.clearInterval(interval);
        };
    }, []);

    async function openNotification(notification) {
        if (!notification.readAt) {
            setError("");
            try {
                const result = await api.patch(`/notifications/${notification._id}/read`, {});
                setNotifications(current => current.map(item => (
                    item._id === notification._id ? result.notification : item
                )));
                setUnreadCount(current => Math.max(0, current - 1));
            } catch (requestError) {
                setError(requestError.message);
                return;
            }
        }
        setOpen(false);
        onOpenAppointments();
    }

    async function markAllRead() {
        setError("");
        try {
            await api.patch("/notifications/read-all", {});
            const readAt = new Date().toISOString();
            setNotifications(current => current.map(notification => ({ ...notification, readAt })));
            setUnreadCount(0);
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    return (
        <div className="notification-center">
            <button
                className="notification-trigger"
                type="button"
                aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
                aria-expanded={open}
                onClick={() => setOpen(current => !current)}
            >
                <Icon name="bell" size={19} />
                {unreadCount > 0 && <span className="notification-count">{unreadCount > 99 ? "99+" : unreadCount}</span>}
            </button>
            {open && (
                <section className="notification-panel" aria-label="Notifications">
                    <header className="notification-panel-header">
                        <div>
                            <h2>Notifications</h2>
                            <p>{unreadCount ? `${unreadCount} unread` : "You're all caught up"}</p>
                        </div>
                        {unreadCount > 0 && (
                            <button className="text-button" type="button" onClick={markAllRead}>Mark all read</button>
                        )}
                    </header>
                    {error && <p className="notification-error" role="alert">{error}</p>}
                    {loading ? (
                        <p className="notification-empty">Loading notifications…</p>
                    ) : notifications.length === 0 ? (
                        <p className="notification-empty">Appointment updates will appear here.</p>
                    ) : (
                        <div className="notification-list">
                            {notifications.map(notification => (
                                <button
                                    className={`notification-item ${notification.readAt ? "" : "unread"}`}
                                    key={notification._id}
                                    type="button"
                                    onClick={() => openNotification(notification)}
                                >
                                    <span className="notification-item-heading">
                                        <strong>{notification.title}</strong>
                                        {!notification.readAt && <span className="notification-unread-dot" />}
                                    </span>
                                    <span className="notification-message">{notification.message}</span>
                                    <span className="notification-date">{formatCreatedAt(notification.createdAt)}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
