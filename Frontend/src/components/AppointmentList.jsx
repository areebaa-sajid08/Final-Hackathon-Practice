import Icon from "./Icon.jsx";
import { doctorDisplayName } from "../lib/format.js";
import StatusBadge from "./StatusBadge.jsx";

function dateParts(value) {
    if (!value) return { full: "Date not set", month: "—", day: "—" };
    const datePart = String(value).slice(0, 10);
    const date = new Date(`${datePart}T00:00:00`);
    if (Number.isNaN(date.getTime())) return { full: datePart, month: "—", day: "—" };
    const parts = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).formatToParts(date);
    const getPart = type => parts.find(part => part.type === type)?.value || "";
    return {
        full: parts.map(part => part.value).join(""),
        month: getPart("month"),
        day: getPart("day")
    };
}

export default function AppointmentList({ appointments = [], role, onCancel, onStatus }) {
    if (appointments.length === 0) {
        return (
            <div className="grid justify-items-center gap-2 rounded-3xl border border-dashed border-emerald-900/15 bg-emerald-50/40 px-5 py-12 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-white text-emerald-700 shadow-lg shadow-emerald-950/5"><Icon name="calendar" size={24} /></span>
                <h3 className="mt-2 text-base font-bold text-emerald-950">No appointments yet</h3>
                <p className="text-sm text-slate-500">Your appointment activity will appear here.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-3">
            {appointments.map(appointment => {
                const otherPerson = role === "doctor" ? appointment.patient : appointment.doctor;
                const name = otherPerson?.name || "Clinic account";
                const date = dateParts(appointment.appointmentDate);
                return (
                    <article className="group grid gap-4 rounded-3xl border border-emerald-950/5 bg-white/80 p-4 shadow-lg shadow-emerald-950/[0.03] transition hover:-translate-y-0.5 hover:shadow-xl sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:items-center sm:p-5" key={appointment._id}>
                        <div className="grid size-14 content-center justify-items-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-800">
                            <span className="text-[9px] font-bold uppercase tracking-wider">{date.month}</span>
                            <strong className="text-xl leading-none">{date.day}</strong>
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-bold text-emerald-950">{role === "doctor" ? name : doctorDisplayName(name)}</h3>
                                <StatusBadge status={appointment.status} />
                            </div>
                            <p className="mt-1 truncate text-xs text-slate-500">{role === "doctor" ? appointment.patient?.email : otherPerson?.specialization}</p>
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-500">
                                <span className="inline-flex items-center gap-1.5"><Icon name="clock" size={14} /> {appointment.appointmentTime}</span>
                                <span className="inline-flex items-center gap-1.5"><Icon name="calendar" size={14} /> {date.full}</span>
                            </div>
                            {role === "patient" && appointment.cancellationReason ? (
                                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">{appointment.cancellationReason}</p>
                            ) : role === "patient" && appointment.status === "rejected" && appointment.rejectionReason ? (
                                <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-900"><strong>Reason for decline:</strong> {appointment.rejectionReason}</p>
                            ) : appointment.reason ? (
                                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">{appointment.reason}</p>
                            ) : null}
                        </div>
                        {role === "doctor" && appointment.status === "pending" && (
                            <div className="flex gap-2 sm:flex-col">
                                <button className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800" type="button" onClick={() => onStatus(appointment._id, "approved")} aria-label={`Approve appointment with ${name}`}>
                                    <Icon name="check" size={15} /> Approve
                                </button>
                                <button className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100" type="button" onClick={() => onStatus(appointment._id, "rejected")} aria-label={`Reject appointment with ${name}`}>
                                    <Icon name="close" size={15} /> Decline
                                </button>
                            </div>
                        )}
                        {role === "patient" && appointment.status === "pending" && (
                            <button className="rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-50 sm:justify-self-end" type="button" onClick={() => onCancel(appointment._id)}>Cancel request</button>
                        )}
                    </article>
                );
            })}
        </div>
    );
}
