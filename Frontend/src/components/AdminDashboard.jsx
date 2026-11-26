import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { doctorDisplayName } from "../lib/format.js";
import Icon from "./Icon.jsx";
import LoadingIndicator from "./LoadingIndicator.jsx";
import PasswordInput from "./PasswordInput.jsx";
import ProfileAvatar from "./ProfileAvatar.jsx";
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
const cardClass = "rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xl shadow-emerald-950/5 backdrop-blur sm:p-7";
const fieldClass = "w-full rounded-xl border border-emerald-950/10 bg-white/80 px-4 py-3 text-sm font-normal text-emerald-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

function displayDate(value) {
    if (!value) return "—";
    const datePart = String(value).slice(0, 10);
    const date = new Date(`${datePart}T00:00:00`);
    return Number.isNaN(date.getTime())
        ? datePart
        : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function StatCard({ icon, label, value, tone }) {
    const tones = {
        emerald: "from-emerald-500 to-teal-700",
        blue: "from-sky-500 to-indigo-600",
        amber: "from-amber-400 to-orange-500"
    };
    return (
        <article className="group rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xl shadow-emerald-950/5 transition duration-300 hover:-translate-y-1 hover:rotate-1 sm:p-6">
            <span className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${tones[tone]} text-white shadow-lg transition group-hover:rotate-6`}><Icon name={icon} /></span>
            <span className="mt-5 block text-xs font-semibold text-slate-500">{label}</span>
            <strong className="mt-1 block text-3xl font-black text-emerald-950">{value}</strong>
        </article>
    );
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
    const [doctorImage, setDoctorImage] = useState(null);
    const [doctorImagePreview, setDoctorImagePreview] = useState("");
    const [busy, setBusy] = useState(false);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        if (!doctorImagePreview) return undefined;
        return () => URL.revokeObjectURL(doctorImagePreview);
    }, [doctorImagePreview]);

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
            const formData = new FormData();
            formData.append("name", doctorForm.name);
            formData.append("email", doctorForm.email);
            formData.append("password", doctorForm.password);
            formData.append("specialization", doctorForm.specialization);
            formData.append("experience", String(Number(doctorForm.experience)));
            formData.append("availability", JSON.stringify({
                availableDays: doctorForm.availableDays,
                startTime: doctorForm.startTime,
                endTime: doctorForm.endTime
            }));
            if (doctorImage) formData.append("image", doctorImage);
            await api.postForm("/admin/doctors", formData);
            setDoctorForm(emptyDoctor);
            setDoctorImage(null);
            setDoctorImagePreview("");
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
        <div className="grid gap-7">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-teal-700">Administration</p>
                    <h1 className="text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">{title}</h1>
                    <p className="mt-2 text-sm text-slate-500">Manage the clinic and keep care moving.</p>
                </div>
                {section === "users" && (
                    <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-1" type="button" onClick={() => setShowDoctorForm(value => !value)}>
                        <Icon name="plus" size={18} /> Add doctor
                    </button>
                )}
            </div>

            {message && <div className="flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status"><Icon name="check" size={17} /> {message}</div>}
            {error && <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-700" role="alert">{error}</p>}

            {section === "overview" && (
                <div className="grid gap-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <StatCard icon="users" label="Patients" value={loading ? "—" : stats?.patients ?? 0} tone="emerald" />
                        <StatCard icon="doctor" label="Doctors" value={loading ? "—" : stats?.doctors ?? 0} tone="blue" />
                        <StatCard icon="calendar" label="Appointments" value={loading ? "—" : stats?.appointments ?? 0} tone="amber" />
                    </div>
                    <section className={cardClass}>
                        <div className="mb-5">
                            <h2 className="text-lg font-extrabold text-emerald-950">Appointment status</h2>
                            <p className="mt-1 text-xs text-slate-500">Current totals across the clinic.</p>
                        </div>
                        {loading ? <div className="grid min-h-32 place-items-center"><LoadingIndicator /></div> : (
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                                {["pending", "approved", "rejected", "cancelled", "expired"].map(status => (
                                    <div className="flex items-center justify-between gap-2 rounded-2xl border border-emerald-950/5 bg-emerald-50/30 p-3" key={status}><StatusBadge status={status} /><strong className="text-xl font-black text-emerald-950">{appointmentCounts[status] || 0}</strong></div>
                                ))}
                            </div>
                        )}
                    </section>
                    <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-950 p-6 text-white shadow-xl shadow-emerald-950/15 sm:p-8">
                        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/10"><Icon name="shield" size={24} /></span>
                        <div><h2 className="text-lg font-extrabold">Welcome, {user.name}</h2><p className="mt-1 text-xs leading-relaxed text-emerald-50/70">Doctor accounts are created by admins. Patient and doctor access is protected by role-based permissions.</p></div>
                    </div>
                </div>
            )}

            {section === "users" && (
                <>
                    {showDoctorForm && (
                        <section className={cardClass}>
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div><h2 className="text-lg font-extrabold text-emerald-950">New doctor account</h2><p className="mt-1 text-xs text-slate-500">The doctor can sign in with these credentials.</p></div>
                                <button className="grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-emerald-50" type="button" onClick={() => setShowDoctorForm(false)} aria-label="Close doctor form"><Icon name="close" /></button>
                            </div>
                            <form className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" onSubmit={createDoctor}>
                                <label className="grid gap-2 text-xs font-bold text-emerald-950">Full name<input className={fieldClass} value={doctorForm.name} onChange={event => setDoctorForm(current => ({ ...current, name: event.target.value }))} required maxLength={100} /></label>
                                <label className="grid gap-2 text-xs font-bold text-emerald-950">Email<input className={fieldClass} type="email" value={doctorForm.email} onChange={event => setDoctorForm(current => ({ ...current, email: event.target.value }))} required /></label>
                                <label className="grid gap-2 text-xs font-bold text-emerald-950">Temporary password<PasswordInput className="py-3" value={doctorForm.password} onChange={event => setDoctorForm(current => ({ ...current, password: event.target.value }))} required minLength={8} maxLength={128} autoComplete="new-password" /></label>
                                <label className="grid gap-2 text-xs font-bold text-emerald-950">Specialization<input className={fieldClass} value={doctorForm.specialization} onChange={event => setDoctorForm(current => ({ ...current, specialization: event.target.value }))} required maxLength={100} placeholder="e.g. Cardiology" /></label>
                                <label className="grid gap-2 text-xs font-bold text-emerald-950">Years of experience<input className={fieldClass} type="number" min="0" max="80" step="1" value={doctorForm.experience} onChange={event => setDoctorForm(current => ({ ...current, experience: event.target.value }))} required /></label>
                                <label className="grid gap-2 text-xs font-bold text-emerald-950 sm:col-span-2 xl:col-span-3">
                                    <span>Profile picture <span className="font-normal text-slate-400">(optional · JPG, PNG, or WebP · max 5 MB)</span></span>
                                    <span className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-emerald-900/20 bg-emerald-50/40 p-4 sm:flex-row sm:items-center">
                                        {doctorImagePreview
                                            ? <img className="size-20 shrink-0 rounded-2xl object-cover shadow-lg" src={doctorImagePreview} alt="Doctor profile preview" />
                                            : <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm"><Icon name="doctor" size={30} /></span>}
                                        <input
                                            className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-700 file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-white hover:file:bg-emerald-800"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={event => {
                                                const file = event.target.files?.[0] || null;
                                                if (file && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                                                    setDoctorImage(null);
                                                    setDoctorImagePreview("");
                                                    setError("Choose a JPEG, PNG, or WebP profile picture.");
                                                    event.target.value = "";
                                                    return;
                                                }
                                                if (file && file.size > 5 * 1024 * 1024) {
                                                    setDoctorImage(null);
                                                    setDoctorImagePreview("");
                                                    setError("Profile picture must be 5 MB or smaller.");
                                                    event.target.value = "";
                                                    return;
                                                }
                                                setError("");
                                                setDoctorImage(file);
                                                setDoctorImagePreview(file ? URL.createObjectURL(file) : "");
                                            }}
                                        />
                                        {doctorImage && <span className="break-all text-[11px] font-medium text-emerald-800">{doctorImage.name}</span>}
                                    </span>
                                </label>
                                <fieldset className="grid gap-2 text-xs font-bold text-emerald-950 sm:col-span-2 xl:col-span-3">
                                    <legend>Available days</legend>
                                    <div className="flex flex-wrap gap-2">
                                        {weekdays.map(day => (
                                            <label className="cursor-pointer" key={day}>
                                                <input className="peer sr-only" type="checkbox" checked={doctorForm.availableDays.includes(day)} onChange={() => setDoctorForm(current => ({
                                                    ...current,
                                                    availableDays: current.availableDays.includes(day)
                                                        ? current.availableDays.filter(item => item !== day)
                                                        : [...current.availableDays, day]
                                                }))} />
                                                <span className="block rounded-xl border border-emerald-950/10 px-3 py-2 text-[11px] font-semibold text-slate-600 transition peer-checked:border-emerald-700 peer-checked:bg-emerald-700 peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-emerald-500">{day.slice(0, 3)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                                <label className="grid gap-2 text-xs font-bold text-emerald-950">Start time<input className={fieldClass} type="time" value={doctorForm.startTime} onChange={event => setDoctorForm(current => ({ ...current, startTime: event.target.value }))} required /></label>
                                <label className="grid gap-2 text-xs font-bold text-emerald-950">End time<input className={fieldClass} type="time" value={doctorForm.endTime} onChange={event => setDoctorForm(current => ({ ...current, endTime: event.target.value }))} required /></label>
                                <button className="self-end rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 disabled:opacity-60" type="submit" disabled={busy}>{busy ? "Creating…" : "Create doctor"}</button>
                            </form>
                        </section>
                    )}
                    <section className={cardClass}>
                        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div><h2 className="text-lg font-extrabold text-emerald-950">Registered users</h2><p className="mt-1 text-xs text-slate-500">Search patients and doctors, or deactivate an account.</p></div>
                            <label className="flex w-full items-center gap-3 rounded-xl border border-emerald-950/10 bg-white px-3 py-2.5 text-emerald-800 lg:max-w-xs"><Icon name="search" size={17} /><input className="min-w-0 flex-1 bg-transparent text-xs outline-none" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name or email" aria-label="Search users" /></label>
                        </div>
                        {loading ? <div className="grid min-h-36 place-items-center"><LoadingIndicator /></div> : users.length ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[680px] border-collapse text-left text-xs">
                                    <thead className="text-[10px] uppercase tracking-wider text-slate-400"><tr>{["Name", "Email", "Role", "Account", ""].map(head => <th className="border-b border-emerald-950/5 px-3 py-3 font-bold" key={head || "actions"}>{head}</th>)}</tr></thead>
                                    <tbody>{users.map(person => (
                                        <tr className="transition hover:bg-emerald-50/40" key={person._id}>
                                            <td className="border-b border-emerald-950/5 px-3 py-4"><div className="flex items-center gap-3"><ProfileAvatar name={person.name} imageUrl={person.role === "doctor" ? person.profileImage : ""} size="table" /><span><strong className="text-emerald-950">{person.name}</strong>{person.specialization && <small className="mt-1 block text-slate-400">{person.specialization}</small>}</span></div></td>
                                            <td className="border-b border-emerald-950/5 px-3 py-4 text-slate-600">{person.email}</td>
                                            <td className="border-b border-emerald-950/5 px-3 py-4"><span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-bold capitalize text-teal-800">{person.role}</span></td>
                                            <td className="border-b border-emerald-950/5 px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${person.isActive ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>{person.isActive ? "Active" : "Inactive"}</span></td>
                                            <td className="border-b border-emerald-950/5 px-3 py-4">{person.role !== "admin" && <button className={`font-bold transition hover:underline ${person.isActive ? "text-rose-700" : "text-emerald-700"}`} type="button" onClick={() => updateUserStatus(person)}>{person.isActive ? "Deactivate" : "Activate"}</button>}</td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        ) : !error ? <div className="py-12 text-center"><h3 className="font-bold text-emerald-950">No matching users</h3><p className="mt-1 text-xs text-slate-500">Try a different search.</p></div> : null}
                    </section>
                </>
            )}

            {section === "appointments" && (
                <section className={cardClass}>
                    <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div><h2 className="text-lg font-extrabold text-emerald-950">All appointments</h2><p className="mt-1 text-xs text-slate-500">Search by patient or filter by status.</p></div>
                        <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
                            <label className="flex min-w-0 items-center gap-3 rounded-xl border border-emerald-950/10 bg-white px-3 py-2.5 text-emerald-800 sm:w-56"><Icon name="search" size={17} /><input className="min-w-0 flex-1 bg-transparent text-xs outline-none" value={search} onChange={event => setSearch(event.target.value)} placeholder="Patient name" aria-label="Search by patient name" /></label>
                            <select className={`${fieldClass} sm:w-44`} value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label="Filter appointments by status">
                                <option value="">All statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                    </div>
                    {loading ? <div className="grid min-h-36 place-items-center"><LoadingIndicator /></div> : appointments.length ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] border-collapse text-left text-xs">
                                <thead className="text-[10px] uppercase tracking-wider text-slate-400"><tr>{["Patient", "Doctor", "Date & time", "Reason", "Status"].map(head => <th className="border-b border-emerald-950/5 px-3 py-3 font-bold" key={head}>{head}</th>)}</tr></thead>
                                <tbody>{appointments.map(appointment => (
                                    <tr className="align-top transition hover:bg-emerald-50/40" key={appointment._id}>
                                        <td className="border-b border-emerald-950/5 px-3 py-4"><strong className="text-emerald-950">{appointment.patient?.name || "Unavailable"}</strong><small className="mt-1 block text-slate-400">{appointment.patient?.email}</small></td>
                                        <td className="border-b border-emerald-950/5 px-3 py-4"><strong className="text-emerald-950">{appointment.doctor?.name ? doctorDisplayName(appointment.doctor.name) : "Unavailable"}</strong><small className="mt-1 block text-slate-400">{appointment.doctor?.specialization}</small></td>
                                        <td className="whitespace-nowrap border-b border-emerald-950/5 px-3 py-4 text-slate-700">{displayDate(appointment.appointmentDate)}<small className="mt-1 block text-slate-400">{appointment.appointmentTime}</small></td>
                                        <td className="max-w-xs border-b border-emerald-950/5 px-3 py-4 leading-relaxed text-slate-600">{appointment.reason}{appointment.cancellationReason && <small className="mt-2 block text-amber-800">{appointment.cancellationReason}</small>}{appointment.rejectionReason && <small className="mt-2 block text-rose-700">Declined: {appointment.rejectionReason}</small>}</td>
                                        <td className="border-b border-emerald-950/5 px-3 py-4"><StatusBadge status={appointment.status} /></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    ) : !error ? <div className="py-12 text-center"><h3 className="font-bold text-emerald-950">No appointments found</h3><p className="mt-1 text-xs text-slate-500">There are no records matching these filters.</p></div> : null}
                </section>
            )}
        </div>
    );
}
