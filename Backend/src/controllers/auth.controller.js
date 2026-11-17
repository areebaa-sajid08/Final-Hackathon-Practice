import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "../db/db.js";
import userModel from "../models/users.model.js";

const publicUserFields = "_id name email role specialization experience isActive createdAt";

function createToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

function setAuthCookie(res, token) {
    const production = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
        httpOnly: true,
        secure: production,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
}

export async function registerUser(req, res) {
    const { name, email, password, role } = req.body || {};
    if (role !== undefined && role !== "patient") {
        return res.status(400).json({ message: "Public registration is only available for patients" });
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

    await connectDB();
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await userModel.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: "patient"
    });
    const token = createToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
        message: "Patient registered successfully",
        token,
        user: await userModel.findById(user.id).select(publicUserFields)
    });
}

export async function getLoginStatus(user, password) {
    if (!user || !await bcrypt.compare(password, user.password)) {
        return "invalid";
    }
    return user.isActive ? "active" : "deactivated";
}

export async function loginUser(req, res) {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ message: "Email and password are required" });
    }

    await connectDB();
    const user = await userModel.findOne({ email: email.trim().toLowerCase() })
        .select("+password");
    const loginStatus = await getLoginStatus(user, password);
    if (loginStatus === "invalid") {
        return res.status(401).json({ message: "Invalid email or password" });
    }
    if (loginStatus === "deactivated") {
        return res.status(403).json({ message: "Admin deactivated you!" });
    }

    const token = createToken(user);
    setAuthCookie(res, token);
    return res.status(200).json({
        message: "Logged in successfully",
        token,
        user: await userModel.findById(user.id).select(publicUserFields)
    });
}

export async function logoutUser(_req, res) {
    const production = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
        httpOnly: true,
        secure: production,
        sameSite: "lax"
    });
    return res.status(200).json({ message: "Logged out successfully" });
}

export async function getCurrentUser(req, res) {
    const user = await userModel.findById(req.user.id).select(publicUserFields);
    return res.status(200).json({ user });
}
