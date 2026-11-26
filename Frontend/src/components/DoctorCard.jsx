import Icon from "./Icon.jsx";
import { doctorDisplayName } from "../lib/format.js";
import ProfileAvatar from "./ProfileAvatar.jsx";

function scheduleText(availability = {}) {
    const days = availability.availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const shortDays = days.map(day => day.slice(0, 3)).join(", ");
    const startTime = availability.startTime || "09:00";
    const endTime = availability.endTime || "17:00";
    return `${shortDays} · ${startTime}–${endTime}`;
}

export default function DoctorCard({ doctor, onBook }) {
    return (
        <article className="group relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-xl shadow-emerald-950/5 backdrop-blur transition duration-300 hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl hover:shadow-emerald-950/10 sm:p-6">
            <div className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 blur-2xl transition duration-500 group-hover:scale-150" />
            <div className="relative flex items-start justify-between gap-3">
                <div className="transition duration-300 group-hover:rotate-3 group-hover:scale-105"><ProfileAvatar name={doctor.name} imageUrl={doctor.profileImage} /></div>
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold ${doctor.isActive === false ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-800"}`}>
                    <span className={`size-1.5 rounded-full ${doctor.isActive === false ? "bg-rose-500" : "bg-emerald-500"}`} />
                    {doctor.isActive === false ? "Not available" : "Active profile"}
                </span>
            </div>
            <div className="relative mt-5">
                <h3 className="text-xl font-extrabold tracking-tight text-emerald-950">{doctorDisplayName(doctor.name)}</h3>
                <p className="mt-1 text-sm font-semibold text-teal-700">{doctor.specialization || "General practitioner"}</p>
            </div>
            <div className="relative mt-5 grid gap-3 border-y border-emerald-950/5 py-4 text-xs text-slate-600">
                <span className="flex items-center gap-2"><Icon name="activity" size={16} /> {doctor.experience ?? 0} years experience</span>
                <span className="flex items-start gap-2"><Icon name="clock" size={16} className="shrink-0 text-emerald-700" /> <span>{scheduleText(doctor.availability)}</span></span>
            </div>
            <button
                className="relative mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={doctor.isActive === false}
                onClick={() => onBook(doctor)}
            >
                {doctor.isActive === false ? "Not available" : <>Book a visit <Icon name="arrow" size={16} /></>}
            </button>
        </article>
    );
}
