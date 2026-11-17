import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import Icon from "./Icon.jsx";
import LoadingIndicator from "./LoadingIndicator.jsx";

function formatCreatedAt(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleString();
}

function getNotificationIcon(type) {
    if (type === "appointment_approved") return "check";
    if (type === "appointment_declined") return "close";
    return "calendar";
}

export default function NotificationCenter({ inline = false, onOpenAppointments }) {
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
        onOpenAppointments?.();
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
        <div className={`notification-center ${inline ? "notification-center-inline" : ""}`}>
            {!inline && (
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
            )}
            {(open || inline) && (
                <section
                    className={`notification-panel ${inline ? "notification-panel-inline" : ""}`}
                    aria-label="Notifications"
                >
                    <header className="notification-panel-header">
                        <div className="notification-heading">
                            <span className="notification-heading-icon"><Icon name="bell" size={18} /></span>
                            <span>
                                <h2>Notifications</h2>
                                <p>{unreadCount ? `${unreadCount} unread` : "You're all caught up"}</p>
                            </span>
                        </div>
                        {unreadCount > 0 && (
                            <button className="notification-mark-all" type="button" onClick={markAllRead}>
                                <Icon name="check" size={14} /> Mark all read
                            </button>
                        )}
                    </header>
                    {error && <p className="notification-error" role="alert">{error}</p>}
                    {loading ? (
                        <div className="notification-empty"><LoadingIndicator /></div>
                    ) : notifications.length === 0 ? (
                        <div className="notification-empty">
                            <span className="notification-empty-icon"><Icon name="bell" size={19} /></span>
                            <strong>Nothing to catch up on</strong>
                            <span>Appointment updates will appear here.</span>
                        </div>
                    ) : (
                        <div className="notification-list">
                            {notifications.map(notification => (
                                <button
                                    className={`notification-item ${notification.readAt ? "" : "unread"}`}
                                    key={notification._id}
                                    type="button"
                                    onClick={() => openNotification(notification)}
                                >
                                    <span className={`notification-type-icon ${notification.type}`}>
                                        <Icon name={getNotificationIcon(notification.type)} size={16} />
                                    </span>
                                    <span className="notification-item-content">
                                        <span className="notification-item-heading">
                                            <strong>{notification.title}</strong>
                                            {!notification.readAt && <span className="notification-new-label">NEW</span>}
                                        </span>
                                        <span className="notification-message">{notification.message}</span>
                                        <span className="notification-date">{formatCreatedAt(notification.createdAt)}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
