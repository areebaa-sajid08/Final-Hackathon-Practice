import Icon from "./Icon.jsx";
import { doctorDisplayName } from "../lib/format.js";
import StatusBadge from "./StatusBadge.jsx";

function dateParts(value) {
    if (!value) return { full: "Date not set", month: "—", day: "—" };
    const datePart = String(value).slice(0, 10);
    const date = new Date(`${datePart}T00:00:00`);
    if (Number.isNaN(date.getTime())) return { full: datePart, month: "—", day: "—" };
    const parts = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).formatToParts(date);
    const getPart = type => parts.find(part => part.type === type)?.value || "";
    return {
        full: parts.map(part => part.value).join(""),
        month: getPart("month"),
        day: getPart("day")
    };
}

export default function AppointmentList({ appointments = [], role, onCancel, onStatus }) {
    if (appointments.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon"><Icon name="calendar" size={24} /></div>
                <h3>No appointments yet</h3>
                <p>Your appointment activity will appear here.</p>
            </div>
        );
    }

    return (
        <div className="appointment-list">
            {appointments.map(appointment => {
                const otherPerson = role === "doctor" ? appointment.patient : appointment.doctor;
                const name = otherPerson?.name || "Clinic account";
                const date = dateParts(appointment.appointmentDate);
                return (
                    <article className="appointment-row" key={appointment._id}>
                        <div className="appointment-date-tile">
                            <span>{date.month}</span>
                            <strong>{date.day}</strong>
                        </div>
                        <div className="appointment-main">
                            <div className="appointment-heading">
                                <h3>{role === "doctor" ? name : doctorDisplayName(name)}</h3>
                                <StatusBadge status={appointment.status} />
                            </div>
                            <p>{role === "doctor" ? appointment.patient?.email : otherPerson?.specialization}</p>
                            <div className="appointment-details">
                                <span><Icon name="clock" size={15} /> {appointment.appointmentTime}</span>
                                <span><Icon name="calendar" size={15} /> {date.full}</span>
                            </div>
                            {role === "patient" && appointment.cancellationReason ? (
                                <p className="appointment-cancellation">{appointment.cancellationReason}</p>
                            ) : appointment.reason ? (
                                <p className="appointment-reason">{appointment.reason}</p>
                            ) : null}
                        </div>
                        {role === "doctor" && appointment.status === "pending" && (
                            <div className="appointment-actions">
                                <button className="button button-quiet button-success" type="button" onClick={() => onStatus(appointment._id, "approved")} aria-label={`Approve appointment with ${name}`}>
                                    <Icon name="check" size={16} /> Approve
                                </button>
                                <button className="button button-quiet button-danger" type="button" onClick={() => onStatus(appointment._id, "rejected")} aria-label={`Reject appointment with ${name}`}>
                                    <Icon name="close" size={16} /> Decline
                                </button>
                            </div>
                        )}
                        {role === "patient" && appointment.status === "pending" && (
                            <button className="button button-quiet button-danger" type="button" onClick={() => onCancel(appointment._id)}>
                                Cancel
                            </button>
                        )}
                    </article>
                );
            })}
        </div>
    );
}
