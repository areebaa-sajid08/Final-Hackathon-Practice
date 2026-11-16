import mongoose from "mongoose";
import connectDB from "../db/db.js";
import userModel from "../models/users.model.js";

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getDoctors(req, res) {
    await connectDB();
    const filter = { role: "doctor", isActive: true };
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const specialization = typeof req.query.specialization === "string"
        ? req.query.specialization.trim()
        : "";

    if (search.length > 100 || specialization.length > 100) {
        return res.status(400).json({ message: "Search filters must be 100 characters or fewer" });
    }
    if (search) {
        const expression = new RegExp(escapeRegex(search), "i");
        filter.$or = [{ name: expression }, { specialization: expression }];
    }
    if (specialization) {
        filter.specialization = new RegExp(`^${escapeRegex(specialization)}$`, "i");
    }

    const doctors = await userModel.find(filter)
        .select("_id name specialization experience")
        .sort({ name: 1 });
    return res.status(200).json({ doctors });
}

export async function getDoctorById(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid doctor id" });
    }

    await connectDB();
    const doctor = await userModel.findOne({
        _id: req.params.id,
        role: "doctor",
        isActive: true
    }).select("_id name specialization experience");

    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
    }
    return res.status(200).json({ doctor });
}
