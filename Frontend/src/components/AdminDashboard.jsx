import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { doctorDisplayName } from "../lib/format.js";
import Icon from "./Icon.jsx";
import LoadingIndicator from "./LoadingIndicator.jsx";
import StatusBadge from "./StatusBadge.jsx";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const emptyDoctor = {
    name: "",
    email: "",
    password: "",
    specialization: "",
    experience: "",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    startTime: "09:00",
    endTime: "17:00"
};

function displayDate(value) {
    if (!value) return "—";
    const datePart = String(value).slice(0, 10);
    const date = new Date(`${datePart}T00:00:00`);
    return Number.isNaN(date.getTime())
        ? datePart
        : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export default function AdminDashboard({ user, section }) {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showDoctorForm, setShowDoctorForm] = useState(false);
    const [doctorForm, setDoctorForm] = useState(emptyDoctor);
    const [busy, setBusy] = useState(false);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        let current = true;
        async function load() {
            setLoading(true);
            setError("");
            try {
                if (section === "overview") {
                    const result = await api.get("/admin/stats");
                    if (current) setStats(result.stats);
                } else if (section === "users") {
                    const params = new URLSearchParams({ page: "1", limit: "50" });
                    if (search.trim()) params.set("search", search.trim());
                    const result = await api.get(`/admin/users?${params}`);
                    if (current) setUsers(result.users);
                } else {
                    const params = new URLSearchParams({ page: "1", limit: "50" });
                    if (search.trim()) params.set("search", search.trim());
                    if (statusFilter) params.set("status", statusFilter);
                    const result = await api.get(`/admin/appointments?${params}`);
                    if (current) setAppointments(result.appointments);
                }
            } catch (requestError) {
                if (current) setError(requestError.message);
            } finally {
                if (current) setLoading(false);
            }
        }
        const timer = window.setTimeout(load, section === "overview" ? 0 : 240);
        return () => {
            current = false;
            window.clearTimeout(timer);
        };
    }, [section, search, statusFilter, refresh]);

    async function createDoctor(event) {
        event.preventDefault();
        if (doctorForm.availableDays.length === 0) {
            setError("Select at least one available day.");
            return;
        }
        if (doctorForm.startTime >= doctorForm.endTime) {
            setError("The end time must be later than the start time.");
            return;
        }
        setBusy(true);
        setError("");
        setMessage("");
        try {
            await api.post("/admin/doctors", {
                ...doctorForm,
                experience: Number(doctorForm.experience),
                availability: {
                    availableDays: doctorForm.availableDays,
                    startTime: doctorForm.startTime,
                    endTime: doctorForm.endTime
                }
            });
            setDoctorForm(emptyDoctor);
            setShowDoctorForm(false);
            setMessage("Doctor account created.");
            setRefresh(value => value + 1);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setBusy(false);
        }
    }

    async function updateUserStatus(person) {
        const activating = !person.isActive;
        if (!activating && !window.confirm(`Deactivate ${person.name}'s account? Existing appointment history will be kept.`)) return;
        setError("");
        setMessage("");
        try {
            if (activating) {
                const result = await api.patch(`/admin/users/${person._id}/activate`, {});
                const recovery = result.appointmentRecovery;
                setMessage(person.role === "doctor" && recovery
                    ? `Doctor activated. ${recovery.pending} future appointments returned to pending; ${recovery.expired} past appointments marked expired.`
                    : "Account activated.");
            } else {
                await api.delete(`/admin/users/${person._id}`);
                setMessage(person.role === "doctor"
                    ? "Doctor deactivated. Pending and approved appointments were cancelled."
                    : "Account deactivated.");
            }
            setRefresh(value => value + 1);
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    const title = section === "users" ? "People" : section === "appointments" ? "Appointments" : "Clinic overview";
    const appointmentCounts = stats?.appointmentsByStatus || {};

    return (
        <div className="dashboard-page">
            <div className="page-title-row">
                <div>
                    <p className="eyebrow">ADMINISTRATION</p>
                    <h1>{title}</h1>
                    <p className="muted">Manage the clinic and keep care moving.</p>
                </div>
                {section === "users" && (
                    <button className="button button-primary" type="button" onClick={() => setShowDoctorForm(value => !value)}>
                        <Icon name="plus" size={18} /> Add doctor
                    </button>
                )}
            </div>

            {message && <div className="success-banner"><Icon name="check" size={17} /> {message}</div>}
            {error && <p className="form-error" role="alert">{error}</p>}

            {section === "overview" && (
                <div className="admin-overview">
                    <div className="stat-grid">
                        <div className="stat-card"><div className="stat-icon mint"><Icon name="users" /></div><div><span>Patients</span><strong>{loading ? "—" : stats?.patients ?? 0}</strong></div></div>
                        <div className="stat-card"><div className="stat-icon blue"><Icon name="doctor" /></div><div><span>Doctors</span><strong>{loading ? "—" : stats?.doctors ?? 0}</strong></div></div>
                        <div className="stat-card"><div className="stat-icon amber"><Icon name="calendar" /></div><div><span>Appointments</span><strong>{loading ? "—" : stats?.appointments ?? 0}</strong></div></div>
                    </div>
                    <section className="content-card">
                        <div className="content-card-heading"><div><h2>Appointment status</h2><p className="muted">Current totals across the clinic.</p></div></div>
                        {loading ? <div className="loading-state"><LoadingIndicator message="Loading clinic stats…" /></div> : (
                            <div className="status-summary">
                                {["pending", "approved", "rejected", "cancelled", "expired"].map(status => (
                                    <div className="status-summary-item" key={status}><StatusBadge status={status} /><strong>{appointmentCounts[status] || 0}</strong></div>
                                ))}
                            </div>
                        )}
                    </section>
                    <div className="admin-welcome-card">
                        <div className="admin-welcome-icon"><Icon name="shield" size={24} /></div>
                        <div><h2>Welcome, {user.name}</h2><p>Doctor accounts are created by admins. Patient and doctor access is protected by role-based permissions.</p></div>
                    </div>
                </div>
            )}

            {section === "users" && (
                <>
                    {showDoctorForm && (
                        <section className="content-card create-doctor-card">
                            <div className="content-card-heading"><div><h2>New doctor account</h2><p className="muted">The doctor can sign in with these credentials.</p></div><button className="icon-button" type="button" onClick={() => setShowDoctorForm(false)} aria-label="Close doctor form"><Icon name="close" /></button></div>
                            <form className="doctor-form-grid" onSubmit={createDoctor}>
                                <label className="field"><span>Full name</span><input value={doctorForm.name} onChange={event => setDoctorForm(current => ({ ...current, name: event.target.value }))} required maxLength={100} /></label>
                                <label className="field"><span>Email</span><input type="email" value={doctorForm.email} onChange={event => setDoctorForm(current => ({ ...current, email: event.target.value }))} required /></label>
                                <label className="field"><span>Temporary password</span><input type="password" value={doctorForm.password} onChange={event => setDoctorForm(current => ({ ...current, password: event.target.value }))} required minLength={8} maxLength={128} /></label>
                                <label className="field"><span>Specialization</span><input value={doctorForm.specialization} onChange={event => setDoctorForm(current => ({ ...current, specialization: event.target.value }))} required maxLength={100} placeholder="e.g. Cardiology" /></label>
                                <label className="field"><span>Years of experience</span><input type="number" min="0" max="80" step="1" value={doctorForm.experience} onChange={event => setDoctorForm(current => ({ ...current, experience: event.target.value }))} required /></label>
                                <fieldset className="field days-field">
                                    <legend>Available days</legend>
                                    <div className="weekday-options">
                                        {weekdays.map(day => (
                                            <label className="weekday-option" key={day}>
                                                <input
                                                    type="checkbox"
                                                    checked={doctorForm.availableDays.includes(day)}
                                                    onChange={() => setDoctorForm(current => ({
                                                        ...current,
                                                        availableDays: current.availableDays.includes(day)
                                                            ? current.availableDays.filter(item => item !== day)
                                                            : [...current.availableDays, day]
                                                    }))}
                                                />
                                                <span>{day.slice(0, 3)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                                <label className="field"><span>Start time</span><input type="time" value={doctorForm.startTime} onChange={event => setDoctorForm(current => ({ ...current, startTime: event.target.value }))} required /></label>
                                <label className="field"><span>End time</span><input type="time" value={doctorForm.endTime} onChange={event => setDoctorForm(current => ({ ...current, endTime: event.target.value }))} required /></label>
                                <button className="button button-primary form-submit" type="submit" disabled={busy}>{busy ? "Creating…" : "Create doctor"}</button>
                            </form>
                        </section>
                    )}
                    <section className="content-card">
                        <div className="content-card-heading">
                            <div><h2>Registered users</h2><p className="muted">Search patients and doctors, or deactivate an account.</p></div>
                            <form className="search-field admin-search" onSubmit={event => event.preventDefault()}>
                                <Icon name="search" size={17} />
                                <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name or email" aria-label="Search users" />
                            </form>
                        </div>
                        {loading ? <div className="loading-state"><LoadingIndicator message="Loading people…" /></div> : users.length ? (
                            <div className="table-scroll"><table className="data-table">
                                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Account</th><th /></tr></thead>
                                <tbody>{users.map(person => (
                                    <tr key={person._id}>
                                        <td><strong>{person.name}</strong>{person.specialization && <small>{person.specialization}</small>}</td>
                                        <td>{person.email}</td>
                                        <td><span className={`role-chip role-${person.role}`}>{person.role}</span></td>
                                        <td><span className={`account-state ${person.isActive ? "is-active" : "is-inactive"}`}>{person.isActive ? "Active" : "Inactive"}</span></td>
                                        <td>{person.role !== "admin" && (
                                            <button
                                                className={`text-button ${person.isActive ? "text-danger" : ""}`}
                                                type="button"
                                                onClick={() => updateUserStatus(person)}
                                            >
                                                {person.isActive ? "Deactivate" : "Activate"}
                                            </button>
                                        )}</td>
                                    </tr>
                                ))}</tbody>
                            </table></div>
                        ) : !error ? <div className="empty-state"><h3>No matching users</h3><p>Try a different search.</p></div> : null}
                    </section>
                </>
            )}

            {section === "appointments" && (
                <section className="content-card">
                    <div className="content-card-heading admin-appointments-heading">
                        <div><h2>All appointments</h2><p className="muted">Search by patient or filter by status.</p></div>
                        <div className="admin-filter-row">
                            <label className="search-field admin-search"><Icon name="search" size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Patient name" aria-label="Search by patient name" /></label>
                            <select className="select-field" value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label="Filter appointments by status">
                                <option value="">All statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                    </div>
                    {loading ? <div className="loading-state"><LoadingIndicator message="Loading appointments…" /></div> : appointments.length ? (
                        <div className="table-scroll"><table className="data-table">
                            <thead><tr><th>Patient</th><th>Doctor</th><th>Date & time</th><th>Reason</th><th>Status</th></tr></thead>
                            <tbody>{appointments.map(appointment => (
                                <tr key={appointment._id}>
                                    <td><strong>{appointment.patient?.name || "Unavailable"}</strong><small>{appointment.patient?.email}</small></td>
                                    <td><strong>{appointment.doctor?.name ? doctorDisplayName(appointment.doctor.name) : "Unavailable"}</strong><small>{appointment.doctor?.specialization}</small></td>
                                    <td>{displayDate(appointment.appointmentDate)}<small>{appointment.appointmentTime}</small></td>
                                    <td className="reason-cell">
                                        {appointment.reason}
                                        {appointment.cancellationReason && <small className="admin-cancellation-note">{appointment.cancellationReason}</small>}
                                        {appointment.rejectionReason && <small className="admin-decline-note">Declined: {appointment.rejectionReason}</small>}
                                    </td>
                                    <td><StatusBadge status={appointment.status} /></td>
                                </tr>
                            ))}</tbody>
                        </table></div>
                    ) : !error ? <div className="empty-state"><h3>No appointments found</h3><p>There are no records matching these filters.</p></div> : null}
                </section>
            )}
        </div>
    );
}
