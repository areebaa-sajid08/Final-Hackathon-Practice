import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import AppointmentList from "./AppointmentList.jsx";
import Icon from "./Icon.jsx";
import LoadingIndicator from "./LoadingIndicator.jsx";
import NotificationCenter from "./NotificationCenter.jsx";

function StatCard({ icon, label, value, tone = "emerald" }) {
    const tones = {
        emerald: "from-emerald-500 to-teal-700",
        amber: "from-amber-400 to-orange-500",
        blue: "from-sky-500 to-indigo-600"
    };
    return (
        <article className="group rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xl shadow-emerald-950/5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:rotate-1 hover:shadow-2xl dark:border-white/10 dark:bg-slate-900/80 sm:p-6">
            <div className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${tones[tone]} text-white shadow-lg transition group-hover:rotate-6`}><Icon name={icon} size={21} /></div>
            <p className="mt-5 text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
            <strong className="mt-1 block text-3xl font-black tracking-tight text-emerald-950 dark:text-slate-100">{value}</strong>
        </article>
    );
}

export default function PatientDashboard({ user, refreshKey, onBrowseDoctors }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        let current = true;
        api.get("/appointments/my")
            .then(result => {
                if (!current) return;
                setAppointments(result.appointments);
                setError("");
            })
            .catch(requestError => { if (current) setError(requestError.message); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
    }, [refreshKey]);

    async function cancelAppointment(id) {
        setActionError("");
        try {
            const result = await api.patch(`/appointments/${id}/cancel`, {});
            setAppointments(current => current.map(appointment => (
                appointment._id === id ? result.appointment : appointment
            )));
        } catch (requestError) {
            setActionError(requestError.message);
        }
    }

    const pending = appointments.filter(item => item.status === "pending").length;
    const confirmed = appointments.filter(item => item.status === "approved").length;

    return (
        <div className="grid gap-7">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">Patient portal</p>
                    <h1 className="text-3xl font-black tracking-tight text-emerald-950 dark:text-slate-100 sm:text-4xl">Good to see you, {user.name?.split(" ")[0] || "there"}</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your health visits, all in one place.</p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-1 hover:shadow-xl" type="button" onClick={onBrowseDoctors}>
                    <Icon name="plus" size={18} /> Book a visit
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard icon="calendar" label="Total visits" value={loading ? "—" : appointments.length} />
                <StatCard icon="clock" label="Awaiting review" value={loading ? "—" : pending} tone="amber" />
                <StatCard icon="check" label="Confirmed" value={loading ? "—" : confirmed} tone="blue" />
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/80 shadow-xl shadow-emerald-950/5 backdrop-blur dark:border-white/10 dark:bg-slate-900/80">
                <NotificationCenter inline />
            </div>

            <section className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xl shadow-emerald-950/5 backdrop-blur dark:border-white/10 dark:bg-slate-900/80 sm:p-7">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-extrabold text-emerald-950 dark:text-slate-100">Your appointments</h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Track requests and visit details.</p>
                    </div>
                    <button className="inline-flex items-center gap-2 self-start text-xs font-bold text-teal-700 transition hover:gap-3 dark:text-teal-300" type="button" onClick={onBrowseDoctors}>Find a doctor <Icon name="arrow" size={15} /></button>
                </div>
                {error && <p className="mb-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-200" role="alert">{error}</p>}
                {actionError && <p className="mb-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-200" role="alert">{actionError}</p>}
                {loading ? <div className="grid min-h-40 place-items-center"><LoadingIndicator /></div> : (
                    <AppointmentList appointments={appointments} role="patient" onCancel={cancelAppointment} />
                )}
            </section>
        </div>
    );
}
