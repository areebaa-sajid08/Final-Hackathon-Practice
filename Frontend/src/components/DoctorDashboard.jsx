import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import AppointmentList from "./AppointmentList.jsx";
import DeclineReasonModal from "./DeclineReasonModal.jsx";
import Icon from "./Icon.jsx";
import LoadingIndicator from "./LoadingIndicator.jsx";
import ProfileAvatar from "./ProfileAvatar.jsx";

function StatCard({ icon, label, value, tone }) {
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

export default function DoctorDashboard({ user }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [decliningAppointment, setDecliningAppointment] = useState(null);

    useEffect(() => {
        let current = true;
        api.get("/appointments/doctor")
            .then(result => {
                if (!current) return;
                setAppointments(result.appointments);
                setError("");
            })
            .catch(requestError => { if (current) setError(requestError.message); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
    }, []);

    async function setStatus(id, status) {
        if (status === "rejected") {
            setDecliningAppointment(appointments.find(appointment => appointment._id === id) || null);
            return;
        }
        setActionError("");
        try {
            const result = await api.patch(`/appointments/${id}/status`, { status });
            setAppointments(current => current.map(appointment => (
                appointment._id === id ? result.appointment : appointment
            )));
        } catch (requestError) {
            setActionError(requestError.message);
        }
    }

    async function declineAppointment(rejectionReason) {
        const result = await api.patch(
            `/appointments/${decliningAppointment._id}/status`,
            { status: "rejected", rejectionReason }
        );
        setAppointments(current => current.map(appointment => (
            appointment._id === decliningAppointment._id ? result.appointment : appointment
        )));
        setDecliningAppointment(null);
    }

    const pending = appointments.filter(item => item.status === "pending").length;
    const approved = appointments.filter(item => item.status === "approved").length;

    return (
        <div className="grid gap-7">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">Doctor portal</p>
                    <h1 className="text-3xl font-black tracking-tight text-emerald-950 dark:text-slate-100 sm:text-4xl">Welcome, Dr. {user.name}</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{user.specialization || "Your appointment desk"}</p>
                </div>
                <div className="inline-flex items-center gap-2 self-start rounded-2xl border border-white bg-white/75 px-4 py-3 text-xs font-bold text-emerald-800 shadow-lg shadow-emerald-950/5 dark:border-white/10 dark:bg-slate-900/80 dark:text-emerald-200">
                    <ProfileAvatar name={user.name} imageUrl={user.profileImage} size="table" /> Doctor account
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard icon="calendar" label="Total requests" value={loading ? "—" : appointments.length} tone="emerald" />
                <StatCard icon="clock" label="Need your review" value={loading ? "—" : pending} tone="amber" />
                <StatCard icon="check" label="Approved visits" value={loading ? "—" : approved} tone="blue" />
            </div>
            <section className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xl shadow-emerald-950/5 backdrop-blur dark:border-white/10 dark:bg-slate-900/80 sm:p-7">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-extrabold text-emerald-950 dark:text-slate-100">Appointment requests</h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Review patients and update pending requests.</p>
                    </div>
                    <span className="inline-flex items-center gap-2 self-start rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200"><Icon name="activity" size={15} /> {pending} pending</span>
                </div>
                {error && <p className="mb-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-200" role="alert">{error}</p>}
                {actionError && <p className="mb-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-200" role="alert">{actionError}</p>}
                {loading ? <div className="grid min-h-40 place-items-center"><LoadingIndicator /></div> : (
                    <AppointmentList appointments={appointments} role="doctor" onStatus={setStatus} />
                )}
            </section>
            {decliningAppointment && (
                <DeclineReasonModal
                    patientName={decliningAppointment.patient?.name}
                    onClose={() => setDecliningAppointment(null)}
                    onSubmit={declineAppointment}
                />
            )}
        </div>
    );
}
