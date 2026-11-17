import Icon from "./Icon.jsx";
import { doctorDisplayName } from "../lib/format.js";

function initials(name = "") {
    return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

export default function DoctorCard({ doctor, onBook }) {
    return (
        <article className="doctor-card">
            <div className="doctor-card-top">
                <div className="doctor-avatar">{initials(doctor.name)}</div>
                <span className={`availability ${doctor.isActive === false ? "availability-unavailable" : ""}`}>
                    <span /> {doctor.isActive === false ? "Not Available" : "Active profile"}
                </span>
            </div>
            <div className="doctor-card-copy">
                <h3>{doctorDisplayName(doctor.name)}</h3>
                <p className="doctor-specialty">{doctor.specialization || "General practitioner"}</p>
            </div>
            <div className="doctor-meta">
                <span><Icon name="activity" size={16} /> {doctor.experience ?? 0} years experience</span>
            </div>
            <button
                className="button button-outline button-wide"
                type="button"
                disabled={doctor.isActive === false}
                onClick={() => onBook(doctor)}
            >
                {doctor.isActive === false ? "Not Available" : <>Book a visit <Icon name="arrow" size={16} /></>}
            </button>
        </article>
    );
}
