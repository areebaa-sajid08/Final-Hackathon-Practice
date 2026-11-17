import mongoose from "mongoose";
import appointmentModel from "../models/appointments.model.js";
import userModel from "../models/users.model.js";
import { isDoctorAvailable } from "../utils/availability.js";

function parseAppointmentDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null;
    }

    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        return null;
    }
    if (value < new Date().toISOString().slice(0, 10)) {
        return null;
    }
    return date;
}

export async function createAppointment(req, res) {
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body || {};
    if (!mongoose.isValidObjectId(doctorId)) {
        return res.status(400).json({ message: "A valid doctorId is required" });
    }
    const parsedDate = parseAppointmentDate(appointmentDate);
    if (!parsedDate) {
        return res.status(400).json({ message: "Appointment date must be a valid date that is not in the past" });
    }
    if (typeof appointmentTime !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(appointmentTime)) {
        return res.status(400).json({ message: "Appointment time must use 24-hour HH:mm format" });
    }
    if (typeof reason !== "string" || !reason.trim() || reason.trim().length > 1000) {
        return res.status(400).json({ message: "Reason is required and must be 1000 characters or fewer" });
    }

    const doctor = await userModel.findOne({
        _id: doctorId,
        role: "doctor",
        isActive: true
    }).select("_id availability");
    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
    }
    if (!isDoctorAvailable(doctor.availability, appointmentDate, appointmentTime)) {
        return res.status(400).json({
            message: "The doctor is not available at the selected day and time"
        });
    }

    const appointment = await appointmentModel.create({
        patient: req.user.id,
        doctor: doctor.id,
        appointmentDate: parsedDate,
        appointmentTime,
        reason: reason.trim()
    });
    await appointment.populate({ path: "doctor", select: "name specialization experience availability" });
    return res.status(201).json({ message: "Appointment requested", appointment });
}

export async function getMyAppointments(req, res) {
    const appointments = await appointmentModel.find({ patient: req.user.id })
        .populate({ path: "doctor", select: "name specialization experience availability" })
        .sort({ appointmentDate: -1, appointmentTime: 1 });
    return res.status(200).json({ appointments });
}

export async function getDoctorAppointments(req, res) {
    const appointments = await appointmentModel.find({ doctor: req.user.id })
        .populate({ path: "patient", select: "name email" })
        .sort({ appointmentDate: 1, appointmentTime: 1 });
    return res.status(200).json({ appointments });
}

export async function updateAppointmentStatus(req, res) {
    const { status, rejectionReason } = req.body || {};
    if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Status must be approved or rejected" });
    }
    if (status === "rejected" && (
        typeof rejectionReason !== "string"
        || !rejectionReason.trim()
        || rejectionReason.trim().length > 1000
    )) {
        return res.status(400).json({ message: "A decline reason is required and must be 1000 characters or fewer" });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid appointment id" });
    }

    const update = status === "rejected"
        ? { $set: { status, rejectionReason: rejectionReason.trim() } }
        : { $set: { status }, $unset: { rejectionReason: 1 } };
    const appointment = await appointmentModel.findOneAndUpdate(
        { _id: req.params.id, doctor: req.user.id, status: "pending" },
        update,
        { new: true, runValidators: true }
    ).populate({ path: "patient", select: "name email" });

    if (!appointment) {
        const existing = await appointmentModel.findOne({
            _id: req.params.id,
            doctor: req.user.id
        }).select("_id");
        if (!existing) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        return res.status(409).json({ message: "Only pending appointments can be updated" });
    }
    return res.status(200).json({ message: `Appointment ${status}`, appointment });
}

export async function cancelAppointment(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid appointment id" });
    }

    const appointment = await appointmentModel.findOneAndUpdate(
        { _id: req.params.id, patient: req.user.id, status: "pending" },
        { $set: { status: "cancelled" } },
        { new: true, runValidators: true }
    ).populate({ path: "doctor", select: "name specialization experience" });

    if (!appointment) {
        const existing = await appointmentModel.findOne({
            _id: req.params.id,
            patient: req.user.id
        }).select("_id");
        if (!existing) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        return res.status(409).json({ message: "Only pending appointments can be cancelled" });
    }
    return res.status(200).json({ message: "Appointment cancelled", appointment });
}
