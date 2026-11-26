import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import adminRoutes from "./routes/admin.routes.js";
import appointmentRoutes from "./routes/appointments.routes.js";
import authRoutes from "./routes/auth.routes.js";
import doctorRoutes from "./routes/doctors.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";

const app = express();
const defaultOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://final-hackathon-practice-q631.vercel.app"
];
const allowedOrigins = new Set([
    ...defaultOrigins,
    ...(process.env.CORS_ORIGINS || "")
        .split(",")
        .map(origin => origin.trim())
        .filter(Boolean)
]);

app.use(helmet());
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
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
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));
app.use((error, _req, res, _next) => {
    if (error.name === "MulterError") {
        return res.status(400).json({
            message: error.code === "LIMIT_FILE_SIZE"
                ? "Profile image must be 5 MB or smaller"
                : "Invalid image upload"
        });
    }
    if (error.statusCode === 403) {
        return res.status(403).json({ message: error.message });
    }
    if (error.message === "MONGODB_URI must be set") {
        return res.status(503).json({ message: "Clinic database is not configured" });
    }
    if (error.name === "MongooseServerSelectionError" || error.name === "MongoNetworkError") {
        console.error("MongoDB is unavailable:", error.message);
        return res.status(503).json({ message: "Clinic database is unavailable" });
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
