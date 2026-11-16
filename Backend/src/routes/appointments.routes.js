import express from "express";
import {
    cancelAppointment,
    createAppointment,
    getDoctorAppointments,
    getMyAppointments,
    updateAppointmentStatus
} from "../controllers/appointments.controller.js";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);
router.post("/", requireRole("patient"), createAppointment);
router.get("/my", requireRole("patient"), getMyAppointments);
router.get("/doctor", requireRole("doctor"), getDoctorAppointments);
router.patch("/:id/status", requireRole("doctor"), updateAppointmentStatus);
router.patch("/:id/cancel", requireRole("patient"), cancelAppointment);

export default router;
