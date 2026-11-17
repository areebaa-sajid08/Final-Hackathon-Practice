import { useState } from "react";
import Icon from "./Icon.jsx";

export default function DeclineReasonModal({ patientName, onClose, onSubmit }) {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    async function submit(event) {
        event.preventDefault();
        const trimmedReason = reason.trim();
        if (!trimmedReason) {
            setError("Enter a reason so the patient understands why the request was declined.");
            return;
        }

        setBusy(true);
        setError("");
        try {
            await onSubmit(trimmedReason);
        } catch (requestError) {
            setError(requestError.message);
            setBusy(false);
        }
    }

    return (
        <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && !busy && onClose()}>
            <section className="modal-panel decline-modal" role="dialog" aria-modal="true" aria-labelledby="decline-title">
                <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close dialog" disabled={busy}>
                    <Icon name="close" />
                </button>
                <div className="modal-brand-mark decline-mark"><Icon name="close" size={21} /></div>
                <p className="eyebrow">DECLINE REQUEST</p>
                <h2 id="decline-title">Why are you declining?</h2>
                <p className="muted modal-intro">
                    Add a brief reason for {patientName || "the patient"}. They will be able to see it with this appointment.
                </p>
                <form className="form-stack" onSubmit={submit}>
                    <label className="field">
                        <span>Reason for declining</span>
                        <textarea
                            autoFocus
                            value={reason}
                            onChange={event => setReason(event.target.value)}
                            required
                            maxLength={1000}
                            rows={4}
                            placeholder="For example, I'm unavailable at this time. Please choose another slot."
                        />
                    </label>
                    <span className="helper-text">{reason.length}/1000 characters</span>
                    {error && <p className="form-error" role="alert">{error}</p>}
                    <div className="decline-actions">
                        <button className="button button-outline" type="button" onClick={onClose} disabled={busy}>Keep request</button>
                        <button className="button button-primary" type="submit" disabled={busy || !reason.trim()}>
                            {busy ? "Declining…" : "Decline appointment"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
