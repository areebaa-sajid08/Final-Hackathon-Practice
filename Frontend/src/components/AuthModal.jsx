import { useState } from "react";
import { api } from "../lib/api.js";
import Brand from "./Brand.jsx";
import Icon from "./Icon.jsx";
import PasswordInput from "./PasswordInput.jsx";

export default function AuthModal({ mode: initialMode = "login", onClose, onSuccess }) {
    const [mode, setMode] = useState(initialMode);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    function updateField(event) {
        setForm(current => ({ ...current, [event.target.name]: event.target.value }));
    }

    async function submit(event) {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
            const result = await api.post(`/auth/${mode === "register" ? "register" : "login"}`, {
                ...(mode === "register" ? { name: form.name.trim() } : {}),
                email: form.email.trim(),
                password: form.password
            });
            onSuccess(result);
        } catch (requestError) {
            setError(requestError.status === 403 && requestError.message.startsWith("Admin deactivated you!")
                ? "Admin deactivated you!"
                : requestError.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-emerald-950/55 p-4 backdrop-blur-md" onMouseDown={event => event.target === event.currentTarget && onClose()}>
            <section className="relative my-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-white via-white to-emerald-50 p-6 shadow-2xl shadow-emerald-950/30 sm:p-9" role="dialog" aria-modal="true" aria-labelledby="auth-title">
                <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-teal-200/40 blur-3xl" />
                <button className="absolute right-4 top-4 grid size-10 place-items-center rounded-xl text-slate-500 transition hover:rotate-90 hover:bg-emerald-100 hover:text-emerald-900" type="button" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button>
                <div className="relative">
                    <Brand />
                    <p className="mb-2 mt-8 text-[10px] font-black uppercase tracking-[0.22em] text-teal-700">{mode === "login" ? "Welcome back" : "Get started"}</p>
                    <h2 id="auth-title" className="text-2xl font-black tracking-tight text-emerald-950">{mode === "login" ? "Sign in to your account" : "Create your patient account"}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{mode === "login" ? "Your care team is just a moment away." : "Book visits and keep your appointments in one place."}</p>
                    <form className="mt-7 grid gap-4" onSubmit={submit}>
                        {mode === "register" && (
                            <label className="grid gap-2 text-xs font-bold text-emerald-950">
                                Full name
                                <input className="rounded-xl border border-emerald-950/10 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" name="name" autoComplete="name" value={form.name} onChange={updateField} required maxLength={100} placeholder="Your name" />
                            </label>
                        )}
                        <label className="grid gap-2 text-xs font-bold text-emerald-950">
                            Email address
                            <input className="rounded-xl border border-emerald-950/10 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} required placeholder="you@example.com" />
                        </label>
                        <label className="grid gap-2 text-xs font-bold text-emerald-950">
                            Password
                            <PasswordInput name="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={updateField} required minLength={8} maxLength={128} placeholder="At least 8 characters" />
                        </label>
                        {error && <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs leading-relaxed text-rose-700" role="alert">{error}</p>}
                        <button className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={busy}>
                            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
                            {!busy && <Icon name="arrow" size={17} />}
                        </button>
                    </form>
                    <p className="mt-6 text-center text-xs text-slate-500">
                        {mode === "login" ? "New to Carewell?" : "Already have an account?"}
                        <button className="ml-1 font-bold text-teal-700 hover:text-emerald-900" type="button" onClick={() => { setError(""); setMode(mode === "login" ? "register" : "login"); }}>
                            {mode === "login" ? "Create an account" : "Sign in"}
                        </button>
                    </p>
                </div>
            </section>
        </div>
    );
}
