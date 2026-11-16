import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import AppointmentList from "./AppointmentList.jsx";
import Icon from "./Icon.jsx";

export default function DoctorDashboard({ user }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");

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

    const pending = appointments.filter(item => item.status === "pending").length;
    const approved = appointments.filter(item => item.status === "approved").length;

    return (
        <div className="dashboard-page">
            <div className="page-title-row">
                <div>
                    <p className="eyebrow">DOCTOR PORTAL</p>
                    <h1>Welcome, Dr. {user.name}</h1>
                    <p className="muted">{user.specialization || "Your appointment desk"}</p>
                </div>
                <div className="profile-chip"><span className="profile-avatar"><Icon name="doctor" size={19} /></span><span>Doctor account</span></div>
            </div>
            <div className="stat-grid">
                <div className="stat-card"><div className="stat-icon mint"><Icon name="calendar" /></div><div><span>Total requests</span><strong>{loading ? "—" : appointments.length}</strong></div></div>
                <div className="stat-card"><div className="stat-icon amber"><Icon name="clock" /></div><div><span>Need your review</span><strong>{loading ? "—" : pending}</strong></div></div>
                <div className="stat-card"><div className="stat-icon blue"><Icon name="check" /></div><div><span>Approved visits</span><strong>{loading ? "—" : approved}</strong></div></div>
            </div>
            <section className="content-card">
                <div className="content-card-heading">
                    <div><h2>Appointment requests</h2><p className="muted">Review patients and update pending requests.</p></div>
                    <span className="subtle-count"><Icon name="activity" size={15} /> {pending} pending</span>
                </div>
                {error && <p className="form-error" role="alert">{error}</p>}
                {actionError && <p className="form-error" role="alert">{actionError}</p>}
                {loading ? <div className="loading-state"><span className="spinner" /> Loading appointments…</div> : (
                    <AppointmentList appointments={appointments} role="doctor" onStatus={setStatus} />
                )}
            </section>
        </div>
    );
}
