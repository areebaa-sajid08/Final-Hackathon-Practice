import jwt from "jsonwebtoken";
import userModel from "../models/users.model.js";

export async function authenticateToken(req, res, next) {
    const bearerToken = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    const token = req.cookies?.token || bearerToken;

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(payload.id).select("_id role isActive");
        if (!user || !user.isActive) {
            return res.status(401).json({ message: "Account is unavailable" });
        }

        req.user = { id: user.id, role: user.role };
        return next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        return next(error);
    }
}

export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "You do not have permission to access this resource" });
        }
        return next();
    };
}
