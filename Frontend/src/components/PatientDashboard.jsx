import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import AppointmentList from "./AppointmentList.jsx";
import Icon from "./Icon.jsx";
import NotificationCenter from "./NotificationCenter.jsx";

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
        <div className="dashboard-page">
            <div className="page-title-row">
                <div>
                    <p className="eyebrow">PATIENT PORTAL</p>
                    <h1>Good to see you, {user.name?.split(" ")[0] || "there"}</h1>
                    <p className="muted">Your health visits, all in one place.</p>
                </div>
                <button className="button button-primary" type="button" onClick={onBrowseDoctors}>
                    <Icon name="plus" size={18} /> Book a visit
                </button>
            </div>

            <div className="stat-grid">
                <div className="stat-card"><div className="stat-icon mint"><Icon name="calendar" /></div><div><span>Total visits</span><strong>{loading ? "—" : appointments.length}</strong></div></div>
                <div className="stat-card"><div className="stat-icon amber"><Icon name="clock" /></div><div><span>Awaiting review</span><strong>{loading ? "—" : pending}</strong></div></div>
                <div className="stat-card"><div className="stat-icon blue"><Icon name="check" /></div><div><span>Confirmed</span><strong>{loading ? "—" : confirmed}</strong></div></div>
            </div>

            <div className="content-card notification-feed-card">
                <NotificationCenter inline />
            </div>

            <section className="content-card">
                <div className="content-card-heading">
                    <div><h2>Your appointments</h2><p className="muted">Track requests and visit details.</p></div>
                    <button className="text-button" type="button" onClick={onBrowseDoctors}>Find a doctor <Icon name="arrow" size={16} /></button>
                </div>
                {error && <p className="form-error" role="alert">{error}</p>}
                {actionError && <p className="form-error" role="alert">{actionError}</p>}
                {loading ? <div className="loading-state"><span className="spinner" /> Loading appointments…</div> : (
                    <AppointmentList appointments={appointments} role="patient" onCancel={cancelAppointment} />
                )}
            </section>
        </div>
    );
}
