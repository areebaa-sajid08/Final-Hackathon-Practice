import express from "express";
import { addToCart, getCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cart.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
const router = express.Router();

// /api/cart/...  (sirf logged-in "user" role)
router.get("/", authenticateUser, getCart);
router.post("/add", authenticateUser, addToCart);
router.patch("/update", authenticateUser, updateCartItem);
router.delete("/remove/:productId", authenticateUser, removeFromCart);
router.delete("/clear", authenticateUser, clearCart);

export default router;
