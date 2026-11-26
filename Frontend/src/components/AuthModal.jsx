import { useState } from "react";
import { api } from "../lib/api.js";
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
        <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
            <section className="auth-modal modal-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title">
                <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close dialog">
                    <Icon name="close" />
                </button>
                <div className="modal-brand-mark"><Icon name="heart" size={22} /></div>
                <p className="eyebrow">{mode === "login" ? "WELCOME BACK" : "GET STARTED"}</p>
                <h2 id="auth-title">{mode === "login" ? "Sign in to your account" : "Create your patient account"}</h2>
                <p className="muted modal-intro">
                    {mode === "login"
                        ? "Your care team is just a moment away."
                        : "Book visits and keep your appointments in one place."}
                </p>
                <form className="form-stack" onSubmit={submit}>
                    {mode === "register" && (
                        <label className="field">
                            <span>Full name</span>
                            <input name="name" autoComplete="name" value={form.name} onChange={updateField} required maxLength={100} placeholder="Your name" />
                        </label>
                    )}
                    <label className="field">
                        <span>Email address</span>
                        <input name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} required placeholder="you@example.com" />
                    </label>
                    <label className="field">
                        <span>Password</span>
                        <PasswordInput name="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={updateField} required minLength={8} maxLength={128} placeholder="At least 8 characters" />
                    </label>
                    {error && <p className="form-error" role="alert">{error}</p>}
                    <button className="button button-primary button-wide" type="submit" disabled={busy}>
                        {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
                        {!busy && <Icon name="arrow" size={17} />}
                    </button>
                </form>
                <p className="switch-auth">
                    {mode === "login" ? "New to Carewell?" : "Already have an account?"}
                    <button type="button" onClick={() => { setError(""); setMode(mode === "login" ? "register" : "login"); }}>
                        {mode === "login" ? "Create an account" : "Sign in"}
                    </button>
                </p>
            </section>
        </div>
    );
}
