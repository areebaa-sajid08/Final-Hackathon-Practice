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
        <div className={`relative ${inline ? "w-full" : ""}`}>
            {!inline && (
                <button
                    className="relative grid size-11 place-items-center rounded-2xl border border-white/70 bg-white/80 text-emerald-900 shadow-lg shadow-emerald-950/5 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/80 dark:text-emerald-200"
                    type="button"
                    aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
                    aria-expanded={open}
                    onClick={() => setOpen(current => !current)}
                >
                    <Icon name="bell" size={19} />
                    {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-rose-600 px-1 text-[9px] font-black text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
                </button>
            )}
            {(open || inline) && (
                <section
                        className={`z-30 overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-2xl shadow-emerald-950/15 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 ${inline ? "w-full" : "absolute right-0 mt-3 w-[min(390px,calc(100vw-2rem))]"}`}
                    aria-label="Notifications"
                >
                    <header className="flex items-center justify-between gap-3 border-b border-emerald-950/5 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-4 dark:border-white/10 dark:from-emerald-950 dark:via-slate-900 dark:to-teal-950 sm:p-5">
                        <div className="flex items-center gap-3">
                            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-900/20"><Icon name="bell" size={18} /></span>
                            <span>
                                <h2 className="font-bold text-emerald-950 dark:text-slate-100">Notifications</h2>
                                <p className="mt-0.5 text-xs text-emerald-900/55 dark:text-emerald-200/60">{unreadCount ? `${unreadCount} unread` : "You're all caught up"}</p>
                            </span>
                        </div>
                        {unreadCount > 0 && (
                            <button className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-900/10 bg-white px-3 py-2 text-[11px] font-bold text-emerald-800 transition hover:bg-emerald-50 dark:border-white/10 dark:bg-slate-800 dark:text-emerald-200 dark:hover:bg-slate-700" type="button" onClick={markAllRead}>
                                <Icon name="check" size={14} /> Mark all read
                            </button>
                        )}
                    </header>
                    {error && <p className="bg-rose-50 px-4 py-3 text-xs text-rose-700" role="alert">{error}</p>}
                    {loading ? (
                        <div className="grid min-h-32 place-items-center p-6"><LoadingIndicator /></div>
                    ) : notifications.length === 0 ? (
                        <div className="grid min-h-40 justify-items-center content-center gap-2 p-6 text-center">
                            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Icon name="bell" size={20} /></span>
                            <strong className="text-sm text-emerald-950 dark:text-slate-100">Nothing to catch up on</strong>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Appointment updates will appear here.</span>
                        </div>
                    ) : (
                        <div className="grid max-h-96 gap-2 overflow-y-auto p-3">
                            {notifications.map(notification => (
                                <button
                                    className={`grid w-full grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-3 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/5 dark:hover:shadow-black/20 ${notification.readAt ? "border-slate-100 bg-white dark:border-white/10 dark:bg-slate-900" : "border-emerald-100 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/50"}`}
                                    key={notification._id}
                                    type="button"
                                    onClick={() => openNotification(notification)}
                                >
                                    <span className={`grid size-10 place-items-center rounded-xl ${notification.type === "appointment_declined" ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : notification.type === "appointment_approved" ? "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"}`}>
                                        <Icon name={getNotificationIcon(notification.type)} size={16} />
                                    </span>
                                    <span className="grid min-w-0 gap-1.5">
                                        <span className="flex items-center justify-between gap-2 text-xs font-bold text-emerald-950 dark:text-slate-100">
                                            {notification.title}
                                            {!notification.readAt && <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-[8px] tracking-wide text-white">NEW</span>}
                                        </span>
                                        <span className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{notification.message}</span>
                                        <span className="text-[10px] text-slate-400">{formatCreatedAt(notification.createdAt)}</span>
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
