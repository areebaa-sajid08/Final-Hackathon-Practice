import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import uploadFile from "../../services/storage.service.js";
import appointmentModel from "../models/appointments.model.js";
import userModel from "../models/users.model.js";
import { DOCTOR_UNAVAILABLE_CANCELLATION_REASON, getReactivatedAppointmentStatus } from "../utils/appointment-recovery.js";
import { DEFAULT_DOCTOR_AVAILABILITY, WEEKDAYS } from "../utils/availability.js";
import { getSupportedImageExtension } from "../utils/image-validation.js";

const userFields = "_id name email role specialization experience profileImage availability isActive createdAt";

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pagination(query) {
    const page = Number.parseInt(query.page, 10) || 1;
    const limit = Number.parseInt(query.limit, 10) || 50;
    if (page < 1 || limit < 1 || limit > 100) {
        return null;
    }
    return { page, limit, skip: (page - 1) * limit };
}

export async function getUsers(req, res) {
    const paging = pagination(req.query);
    if (!paging) {
        return res.status(400).json({ message: "Page must be positive and limit must be between 1 and 100" });
    }

    const filter = {};
    if (req.query.role) {
        if (!["admin", "doctor", "patient"].includes(req.query.role)) {
            return res.status(400).json({ message: "Invalid user role filter" });
        }
        filter.role = req.query.role;
    }
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    if (search.length > 100) {
        return res.status(400).json({ message: "Search must be 100 characters or fewer" });
    }
    if (search) {
        const expression = new RegExp(escapeRegex(search), "i");
        filter.$or = [{ name: expression }, { email: expression }];
    }

    const [users, total] = await Promise.all([
        userModel.find(filter).select(userFields).sort({ createdAt: -1 })
            .skip(paging.skip).limit(paging.limit),
        userModel.countDocuments(filter)
    ]);
    return res.status(200).json({
        users,
        pagination: { page: paging.page, limit: paging.limit, total }
    });
}

export async function createDoctor(req, res) {
    const { name, email, password, specialization, experience } = req.body || {};
    let { availability: requestedAvailability } = req.body || {};
    if (typeof requestedAvailability === "string") {
        try {
            requestedAvailability = JSON.parse(requestedAvailability);
        } catch {
            return res.status(400).json({ message: "Availability must be valid JSON" });
        }
    }
    const imageExtension = req.file ? getSupportedImageExtension(req.file) : null;
    if (req.file && !imageExtension) {
        return res.status(400).json({ message: "Profile image must be a valid JPEG, PNG, or WebP image" });
    }
    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ message: "Name is required" });
    }
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ message: "A valid email is required" });
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
        return res.status(400).json({ message: "Password must be between 8 and 128 characters" });
    }
    if (typeof specialization !== "string" || !specialization.trim()) {
        return res.status(400).json({ message: "Specialization is required" });
    }
    const years = Number(experience);
    if (!Number.isFinite(years) || years < 0 || years > 80) {
        return res.status(400).json({ message: "Experience must be a number from 0 to 80" });
    }
    if (requestedAvailability !== undefined && (
        !requestedAvailability
        || typeof requestedAvailability !== "object"
        || Array.isArray(requestedAvailability)
    )) {
        return res.status(400).json({ message: "Availability must include availableDays, startTime, and endTime" });
    }

    const availability = requestedAvailability || DEFAULT_DOCTOR_AVAILABILITY;
    const availableDays = availability.availableDays ?? DEFAULT_DOCTOR_AVAILABILITY.availableDays;
    const startTime = availability.startTime ?? DEFAULT_DOCTOR_AVAILABILITY.startTime;
    const endTime = availability.endTime ?? DEFAULT_DOCTOR_AVAILABILITY.endTime;
    const validTime = value => typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
    if (
        !Array.isArray(availableDays)
        || availableDays.length === 0
        || availableDays.some(day => !WEEKDAYS.includes(day))
        || new Set(availableDays).size !== availableDays.length
        || !validTime(startTime)
        || !validTime(endTime)
        || startTime >= endTime
    ) {
        return res.status(400).json({
            message: "Choose at least one valid weekday and an end time later than the start time"
        });
    }

    const profileImage = req.file
        ? (await uploadFile(req.file.buffer, `doctor-profile${imageExtension}`, "doctors")).url
        : undefined;
    const doctor = await userModel.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: await bcrypt.hash(password, 12),
        role: "doctor",
        specialization: specialization.trim(),
        experience: years,
        profileImage,
        availability: { availableDays, startTime, endTime }
    });
    return res.status(201).json({
        message: "Doctor account created",
        doctor: await userModel.findById(doctor.id).select(userFields)
    });
}

export async function deactivateUser(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await userModel.findOne({
        _id: req.params.id,
        role: { $in: ["doctor", "patient"] }
    }).select(userFields);

    if (!user) {
        return res.status(404).json({ message: "Doctor or patient not found" });
    }

    if (user.isActive) {
        user.isActive = false;
        await user.save();
    }

    if (user.role === "doctor") {
        await appointmentModel.updateMany(
            { doctor: user._id, status: { $in: ["pending", "approved"] } },
            {
                $set: {
                    status: "cancelled",
                    cancellationReason: DOCTOR_UNAVAILABLE_CANCELLATION_REASON
                }
            }
        );
    }

    return res.status(200).json({ message: "User deactivated", user });
}

export async function activateUser(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await userModel.findOne({
        _id: req.params.id,
        role: { $in: ["doctor", "patient"] }
    }).select(userFields);

    if (!user) {
        return res.status(404).json({ message: "Doctor or patient not found" });
    }

    const appointmentRecovery = { pending: 0, expired: 0 };
    if (user.role === "doctor") {
        const deactivatedAppointments = await appointmentModel.find({
            doctor: user._id,
            status: "cancelled",
            cancellationReason: DOCTOR_UNAVAILABLE_CANCELLATION_REASON
        }).select("_id appointmentDate appointmentTime").lean();

        const appointmentIds = { pending: [], expired: [] };
        for (const appointment of deactivatedAppointments) {
            const status = getReactivatedAppointmentStatus(
                appointment.appointmentDate,
                appointment.appointmentTime
            );
            appointmentIds[status].push(appointment._id);
        }

        for (const status of ["pending", "expired"]) {
            const ids = appointmentIds[status];
            if (ids.length === 0) continue;

            const result = await appointmentModel.updateMany(
                {
                    _id: { $in: ids },
                    doctor: user._id,
                    status: "cancelled",
                    cancellationReason: DOCTOR_UNAVAILABLE_CANCELLATION_REASON
                },
                {
                    $set: { status },
                    $unset: { cancellationReason: 1 }
                }
            );
            appointmentRecovery[status] = result.modifiedCount;
        }
    }

    if (!user.isActive) {
        user.isActive = true;
        await user.save();
    }

    return res.status(200).json({
        message: "User activated",
        user,
        ...(user.role === "doctor" ? { appointmentRecovery } : {})
    });
}

export async function getAllAppointments(req, res) {
    const paging = pagination(req.query);
    if (!paging) {
        return res.status(400).json({ message: "Page must be positive and limit must be between 1 and 100" });
    }
    const filter = {};
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    if (search.length > 100) {
        return res.status(400).json({ message: "Search must be 100 characters or fewer" });
    }
    if (search) {
        const matchingPatients = await userModel.find({
            role: "patient",
            name: new RegExp(escapeRegex(search), "i")
        }).select("_id");
        filter.patient = { $in: matchingPatients.map(patient => patient.id) };
    }
    if (req.query.status) {
        if (!["pending", "approved", "completed", "rejected", "cancelled", "expired"].includes(req.query.status)) {
            return res.status(400).json({ message: "Invalid appointment status filter" });
        }
        filter.status = req.query.status;
    }

    const [appointments, total] = await Promise.all([
        appointmentModel.find(filter)
            .populate({ path: "patient", select: "name email" })
            .populate({ path: "doctor", select: "name email specialization experience" })
            .sort({ appointmentDate: -1, appointmentTime: 1 })
            .skip(paging.skip).limit(paging.limit),
        appointmentModel.countDocuments(filter)
    ]);
    return res.status(200).json({
        appointments,
        pagination: { page: paging.page, limit: paging.limit, total }
    });
}

export async function getStats(_req, res) {
    const [patients, doctors, appointmentCounts] = await Promise.all([
        userModel.countDocuments({ role: "patient", isActive: true }),
        userModel.countDocuments({ role: "doctor", isActive: true }),
        appointmentModel.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ])
    ]);
    const appointments = {
        total: appointmentCounts.reduce((sum, item) => sum + item.count, 0),
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
        expired: 0
    };
    for (const item of appointmentCounts) {
        appointments[item._id] = item.count;
    }
    return res.status(200).json({
        stats: {
            patients,
            doctors,
            appointments: appointments.total,
            appointmentsByStatus: appointments
        }
    });
}
