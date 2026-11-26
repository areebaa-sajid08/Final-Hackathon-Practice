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
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-emerald-950/55 p-4 backdrop-blur-md" onMouseDown={event => event.target === event.currentTarget && !busy && onClose()}>
            <section className="relative my-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-white to-rose-50 p-6 shadow-2xl shadow-emerald-950/30 dark:border-white/10 dark:from-slate-900 dark:to-rose-950 sm:p-8" role="dialog" aria-modal="true" aria-labelledby="decline-title">
                <button className="absolute right-4 top-4 grid size-10 place-items-center rounded-xl text-slate-500 transition hover:rotate-90 hover:bg-rose-100 dark:text-slate-400 dark:hover:bg-rose-900/60" type="button" onClick={onClose} aria-label="Close dialog" disabled={busy}><Icon name="close" /></button>
                <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-lg shadow-rose-900/20"><Icon name="close" size={21} /></span>
                <p className="mb-2 mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-rose-700 dark:text-rose-300">Decline request</p>
                <h2 id="decline-title" className="text-2xl font-black tracking-tight text-emerald-950 dark:text-slate-100">Why are you declining?</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">Add a brief reason for {patientName || "the patient"}. They will be able to see it with this appointment.</p>
                <form className="mt-6 grid gap-3" onSubmit={submit}>
                    <label className="grid gap-2 text-xs font-bold text-emerald-950 dark:text-slate-200">
                        Reason for declining
                        <textarea
                            className="min-h-28 resize-y rounded-xl border border-emerald-950/10 bg-white/80 px-4 py-3 text-sm font-normal outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100"
                            autoFocus
                            value={reason}
                            onChange={event => setReason(event.target.value)}
                            required
                            maxLength={1000}
                            rows={4}
                            placeholder="For example, I'm unavailable at this time. Please choose another slot."
                        />
                    </label>
                    <span className="text-right text-[10px] text-slate-400">{reason.length}/1000 characters</span>
                    {error && <p className="rounded-xl bg-rose-100 px-4 py-3 text-xs text-rose-800 dark:bg-rose-950 dark:text-rose-200" role="alert">{error}</p>}
                    <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button className="rounded-xl border border-emerald-900/10 px-4 py-3 text-xs font-bold text-emerald-900 transition hover:bg-white dark:border-white/10 dark:text-emerald-200 dark:hover:bg-white/10" type="button" onClick={onClose} disabled={busy}>Keep request</button>
                        <button className="rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-rose-900/15 transition hover:-translate-y-0.5 disabled:opacity-60" type="submit" disabled={busy || !reason.trim()}>{busy ? "Declining…" : "Decline appointment"}</button>
                    </div>
                </form>
            </section>
        </div>
    );
}
