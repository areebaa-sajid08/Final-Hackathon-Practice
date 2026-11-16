import { useState } from "react";
import { api } from "../lib/api.js";
import { doctorDisplayName } from "../lib/format.js";
import Icon from "./Icon.jsx";

function localDateString() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export default function BookingModal({ doctor, onClose, onBooked }) {
    const [form, setForm] = useState({ appointmentDate: "", appointmentTime: "", reason: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    async function submit(event) {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
            const result = await api.post("/appointments", {
                doctorId: doctor._id,
                ...form
            });
            onBooked(result);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
            <section className="booking-modal modal-panel" role="dialog" aria-modal="true" aria-labelledby="booking-title">
                <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close dialog">
                    <Icon name="close" />
                </button>
                <div className="modal-brand-mark"><Icon name="calendar" size={22} /></div>
                <p className="eyebrow">REQUEST A VISIT</p>
                <h2 id="booking-title">Book with {doctorDisplayName(doctor.name)}</h2>
                <p className="muted modal-intro">{doctor.specialization} · {doctor.experience ?? 0} years experience</p>
                <form className="form-stack" onSubmit={submit}>
                    <div className="field-pair">
                        <label className="field">
                            <span>Date</span>
                            <input type="date" min={localDateString()} value={form.appointmentDate} onChange={event => setForm(current => ({ ...current, appointmentDate: event.target.value }))} required />
                        </label>
                        <label className="field">
                            <span>Time</span>
                            <input type="time" value={form.appointmentTime} onChange={event => setForm(current => ({ ...current, appointmentTime: event.target.value }))} required />
                        </label>
                    </div>
                    <label className="field">
                        <span>Reason for visit</span>
                        <textarea value={form.reason} onChange={event => setForm(current => ({ ...current, reason: event.target.value }))} required maxLength={1000} rows={3} placeholder="What would you like the doctor to know?" />
                    </label>
                    <p className="helper-text">Your request is pending until the doctor reviews it.</p>
                    {error && <p className="form-error" role="alert">{error}</p>}
                    <button className="button button-primary button-wide" type="submit" disabled={busy}>
                        {busy ? "Sending request…" : "Request appointment"}
                        {!busy && <Icon name="arrow" size={17} />}
                    </button>
                </form>
            </section>
        </div>
    );
}
