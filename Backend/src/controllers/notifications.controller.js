import mongoose from "mongoose";
import notificationModel from "../models/notifications.model.js";

export async function getMyNotifications(req, res) {
    const [notifications, unreadCount] = await Promise.all([
        notificationModel.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(30)
            .lean(),
        notificationModel.countDocuments({ recipient: req.user.id, readAt: null })
    ]);

    return res.status(200).json({ notifications, unreadCount });
}

export async function markNotificationRead(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid notification id" });
    }

    const notification = await notificationModel.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user.id },
        { $set: { readAt: new Date() } },
        { new: true, runValidators: true }
    );
    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ notification });
}

export async function markAllNotificationsRead(req, res) {
    const result = await notificationModel.updateMany(
        { recipient: req.user.id, readAt: null },
        { $set: { readAt: new Date() } }
    );
    return res.status(200).json({ updatedCount: result.modifiedCount });
}
