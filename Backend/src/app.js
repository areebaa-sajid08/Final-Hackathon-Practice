import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import adminRoutes from "./routes/admin.routes.js";
import appointmentRoutes from "./routes/appointments.routes.js";
import authRoutes from "./routes/auth.routes.js";
import doctorRoutes from "./routes/doctors.routes.js";

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        const error = new Error("Origin is not allowed by CORS");
        error.statusCode = 403;
        return callback(error);
    },
    credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));
app.use((error, _req, res, _next) => {
    if (error.statusCode === 403) {
        return res.status(403).json({ message: error.message });
    }
    if (error.code === 11000) {
        return res.status(409).json({ message: "A record with those details already exists" });
    }
    if (error.name === "ValidationError" || error.name === "CastError" || error instanceof SyntaxError) {
        return res.status(400).json({ message: error.message });
    }

    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
});

export default app;
