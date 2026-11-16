import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import appointmentModel from "../models/appointments.model.js";
import userModel from "../models/users.model.js";

const userFields = "_id name email role specialization experience isActive createdAt";

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

    const doctor = await userModel.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: await bcrypt.hash(password, 12),
        role: "doctor",
        specialization: specialization.trim(),
        experience: years
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
    const user = await userModel.findOneAndUpdate(
        { _id: req.params.id, role: { $in: ["doctor", "patient"] }, isActive: true },
        { $set: { isActive: false } },
        { new: true, runValidators: true }
    ).select(userFields);

    if (!user) {
        return res.status(404).json({ message: "Active doctor or patient not found" });
    }
    return res.status(200).json({ message: "User deactivated", user });
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
        if (!["pending", "approved", "rejected", "cancelled"].includes(req.query.status)) {
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
        cancelled: 0
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
