import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import userModel from "../models/users.model.js";

async function seedAdmin() {
    const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new Error("Set MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before seeding");
    }
    if (ADMIN_PASSWORD.length < 8 || ADMIN_PASSWORD.length > 128) {
        throw new Error("ADMIN_PASSWORD must be between 8 and 128 characters");
    }

    await mongoose.connect(MONGODB_URI);
    const email = ADMIN_EMAIL.trim().toLowerCase();
    const existing = await userModel.findOne({ email }).select("_id role");
    if (existing) {
        if (existing.role !== "admin") {
            throw new Error("ADMIN_EMAIL is already used by a non-admin account");
        }
        console.log("Admin account already exists; no changes made");
        return;
    }

    await userModel.create({
        name: ADMIN_NAME.trim(),
        email,
        password: await bcrypt.hash(ADMIN_PASSWORD, 12),
        role: "admin"
    });
    console.log("Admin account created");
}

seedAdmin()
    .catch(error => {
        console.error("Could not seed admin account:", error.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
