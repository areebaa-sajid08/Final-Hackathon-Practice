import express from "express";
import {createProduct, getAllProducts } from "../controllers/product.controller.js";
const router = express.Router();
import { authenticateToken } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

router.post("/create", authenticateToken,upload.single("image"),createProduct);

router.get("/", getAllProducts);

export default router;