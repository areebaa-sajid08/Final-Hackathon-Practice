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
                <span className="availability"><span /> Active profile</span>
            </div>
            <div className="doctor-card-copy">
                <h3>{doctorDisplayName(doctor.name)}</h3>
                <p className="doctor-specialty">{doctor.specialization || "General practitioner"}</p>
            </div>
            <div className="doctor-meta">
                <span><Icon name="activity" size={16} /> {doctor.experience ?? 0} years experience</span>
            </div>
            <button className="button button-outline button-wide" type="button" onClick={() => onBook(doctor)}>
                Book a visit <Icon name="arrow" size={16} />
            </button>
        </article>
    );
}
