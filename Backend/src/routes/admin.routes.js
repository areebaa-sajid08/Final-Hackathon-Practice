import express from "express";
import {
    createDoctor,
    activateUser,
    deactivateUser,
    getAllAppointments,
    getStats,
    getUsers
} from "../controllers/admin.controller.js";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(authenticateToken, requireRole("admin"));
router.get("/users", getUsers);
router.post("/doctors", upload.single("image"), createDoctor);
router.delete("/users/:id", deactivateUser);
router.patch("/users/:id/activate", activateUser);
router.get("/appointments", getAllAppointments);
router.get("/stats", getStats);

export default router;
