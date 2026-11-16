import express from "express";
import {
    createDoctor,
    deactivateUser,
    getAllAppointments,
    getStats,
    getUsers
} from "../controllers/admin.controller.js";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken, requireRole("admin"));
router.get("/users", getUsers);
router.post("/doctors", createDoctor);
router.delete("/users/:id", deactivateUser);
router.get("/appointments", getAllAppointments);
router.get("/stats", getStats);

export default router;
