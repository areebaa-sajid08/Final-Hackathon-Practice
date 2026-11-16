import express from "express";
import { getDoctorById, getDoctors } from "../controllers/doctors.controller.js";

const router = express.Router();

router.get("/", getDoctors);
router.get("/:id", getDoctorById);

export default router;
