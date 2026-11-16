import mongoose from "mongoose";
import cartModel from "../models/carts.model.js";
import productModel from "../models/products.model.js";

// Cart ko product details ke sath frontend-friendly shape mai return karta hai
async function buildCartResponse(userId) {
    const cart = await cartModel
        .findOne({ user: userId })
        .populate("items.product", "name desc image")

    // agar koi product delete ho chuka ho to populate null deta hai, usy hata do
    const items = (cart?.items || []).filter(item => item.product)

    return {
        items,
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0)
    }
}

async function addToCart(req, res) {
    try {
        const { productId, quantity = 1 } = req.body
        const qty = Number(quantity)

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: "Valid productId is required" })
        }
        if (!Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({ message: "Quantity must be a whole number of 1 or more" })
        }

        const product = await productModel.findById(productId)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        let cart = await cartModel.findOne({ user: req.user.id })
        if (!cart) {
            cart = new cartModel({ user: req.user.id, items: [] })
        }

        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        )
        if (existingItem) {
            existingItem.quantity += qty
        } else {
            cart.items.push({ product: productId, quantity: qty })
        }
        await cart.save()

        res.status(200).json({
            message: "Product added to cart",
            cart: await buildCartResponse(req.user.id)
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

async function getCart(req, res) {
    try {
        res.status(200).json({
            cart: await buildCartResponse(req.user.id)
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

async function updateCartItem(req, res) {
    try {
        const { productId, quantity } = req.body
        const qty = Number(quantity)

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: "Valid productId is required" })
        }
        if (!Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({ message: "Quantity must be a whole number of 1 or more" })
        }

        const cart = await cartModel.findOne({ user: req.user.id })
        const item = cart?.items.find(i => i.product.toString() === productId)
        if (!item) {
            return res.status(404).json({ message: "Item not found in cart" })
        }

        item.quantity = qty
        await cart.save()

        res.status(200).json({
            message: "Cart updated",
            cart: await buildCartResponse(req.user.id)
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

async function removeFromCart(req, res) {
    try {
        const { productId } = req.params

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: "Valid productId is required" })
        }

        await cartModel.updateOne(
            { user: req.user.id },
            { $pull: { items: { product: productId } } }
        )

        res.status(200).json({
            message: "Item removed from cart",
            cart: await buildCartResponse(req.user.id)
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

async function clearCart(req, res) {
    try {
        await cartModel.updateOne(
            { user: req.user.id },
            { $set: { items: [] } }
        )

        res.status(200).json({
            message: "Cart cleared",
            cart: await buildCartResponse(req.user.id)
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export { addToCart, getCart, updateCartItem, removeFromCart, clearCart }
