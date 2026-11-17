export const WEEKDAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

export const DEFAULT_DOCTOR_AVAILABILITY = {
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    startTime: "09:00",
    endTime: "17:00"
};

export function isDoctorAvailable(availability, appointmentDate, appointmentTime) {
    const schedule = availability || DEFAULT_DOCTOR_AVAILABILITY;
    const date = new Date(`${appointmentDate}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
        return false;
    }

    const day = WEEKDAYS[date.getUTCDay()];
    const availableDays = schedule.availableDays || DEFAULT_DOCTOR_AVAILABILITY.availableDays;
    const startTime = schedule.startTime || DEFAULT_DOCTOR_AVAILABILITY.startTime;
    const endTime = schedule.endTime || DEFAULT_DOCTOR_AVAILABILITY.endTime;

    return availableDays.includes(day) && appointmentTime >= startTime && appointmentTime < endTime;
}
