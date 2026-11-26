import { useState } from "react";
import { api } from "../lib/api.js";
import { doctorDisplayName } from "../lib/format.js";
import Icon from "./Icon.jsx";

function localDateString() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function slotIsAvailable(availability, dateValue, timeValue) {
    const date = new Date(`${dateValue}T00:00:00`);
    const day = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
    const days = availability?.availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const startTime = availability?.startTime || "09:00";
    const endTime = availability?.endTime || "17:00";
    return days.includes(day) && timeValue >= startTime && timeValue < endTime;
}

export default function BookingModal({ doctor, onClose, onBooked }) {
    const [form, setForm] = useState({ appointmentDate: "", appointmentTime: "", reason: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const availability = doctor.availability || {
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        startTime: "09:00",
        endTime: "17:00"
    };
    const slotAvailability = form.appointmentDate && form.appointmentTime
        ? slotIsAvailable(availability, form.appointmentDate, form.appointmentTime)
        : null;
    const availabilityDays = availability.availableDays.map(day => day.slice(0, 3)).join(", ");

    async function submit(event) {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
            const result = await api.post("/appointments", { doctorId: doctor._id, ...form });
            onBooked(result);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-emerald-950/55 p-4 backdrop-blur-md" onMouseDown={event => event.target === event.currentTarget && onClose()}>
            <section className="relative my-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-white via-white to-emerald-50 p-6 shadow-2xl shadow-emerald-950/30 sm:p-8" role="dialog" aria-modal="true" aria-labelledby="booking-title">
                <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-teal-200/40 blur-3xl" />
                <button className="absolute right-4 top-4 grid size-10 place-items-center rounded-xl text-slate-500 transition hover:rotate-90 hover:bg-emerald-100 hover:text-emerald-900" type="button" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button>
                <div className="relative">
                    <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-900/20"><Icon name="calendar" size={22} /></span>
                    <p className="mb-2 mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-teal-700">Request a visit</p>
                    <h2 id="booking-title" className="text-2xl font-black tracking-tight text-emerald-950">Book with {doctorDisplayName(doctor.name)}</h2>
                    <p className="mt-2 text-sm text-slate-500">{doctor.specialization} · {doctor.experience ?? 0} years experience</p>
                    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-emerald-900">
                        <Icon name="clock" size={17} className="mt-0.5 shrink-0" />
                        <span className="grid gap-1 text-xs"><strong>Office hours</strong><span className="text-emerald-900/70">{availabilityDays} · {availability.startTime}–{availability.endTime}</span></span>
                    </div>
                    <form className="mt-5 grid gap-4" onSubmit={submit}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="grid gap-2 text-xs font-bold text-emerald-950">
                                Date
                                <input className="min-w-0 rounded-xl border border-emerald-950/10 bg-white/80 px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" type="date" min={localDateString()} value={form.appointmentDate} onChange={event => setForm(current => ({ ...current, appointmentDate: event.target.value }))} required />
                            </label>
                            <label className="grid gap-2 text-xs font-bold text-emerald-950">
                                Time
                                <input className="min-w-0 rounded-xl border border-emerald-950/10 bg-white/80 px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" type="time" value={form.appointmentTime} onChange={event => setForm(current => ({ ...current, appointmentTime: event.target.value }))} required />
                            </label>
                        </div>
                        {slotAvailability !== null && (
                            <p className={`rounded-xl px-3 py-2.5 text-xs leading-relaxed ${slotAvailability ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`} role="status">
                                {slotAvailability
                                    ? "This doctor is available at the selected time."
                                    : "This doctor is not available on the selected day or time. Choose a time within their office hours."}
                            </p>
                        )}
                        <label className="grid gap-2 text-xs font-bold text-emerald-950">
                            Reason for visit
                            <textarea className="min-h-24 resize-y rounded-xl border border-emerald-950/10 bg-white/80 px-4 py-3 text-sm font-normal outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" value={form.reason} onChange={event => setForm(current => ({ ...current, reason: event.target.value }))} required maxLength={1000} rows={3} placeholder="What would you like the doctor to know?" />
                        </label>
                        <p className="text-xs text-slate-500">Your request is pending until the doctor reviews it.</p>
                        {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-xs text-rose-700" role="alert">{error}</p>}
                        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={busy || slotAvailability === false}>
                            {busy ? "Sending request…" : "Request appointment"}
                            {!busy && <Icon name="arrow" size={17} />}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
