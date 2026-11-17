export const DOCTOR_UNAVAILABLE_CANCELLATION_REASON =
    "Cancelled because the doctor is not available at this time.";

export const CLINIC_TIME_ZONE = process.env.CLINIC_TIME_ZONE || "Asia/Karachi";

export function getClinicDateTime(now = new Date(), timeZone = CLINIC_TIME_ZONE) {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
    }).formatToParts(now);
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));

    return {
        date: `${values.year}-${values.month}-${values.day}`,
        time: `${values.hour}:${values.minute}:${values.second}`
    };
}

export function getReactivatedAppointmentStatus(
    appointmentDate,
    appointmentTime,
    now = new Date(),
    timeZone = CLINIC_TIME_ZONE
) {
    const date = new Date(appointmentDate).toISOString().slice(0, 10);
    const current = getClinicDateTime(now, timeZone);
    return date < current.date || (date === current.date && `${appointmentTime}:00` < current.time)
        ? "expired"
        : "pending";
}
