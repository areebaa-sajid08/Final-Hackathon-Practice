import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true
        },
        type: {
            type: String,
            enum: ["appointment_requested", "appointment_approved", "appointment_declined", "appointment_completed"],
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1200
        },
        readAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, readAt: 1 });

const notificationModel = mongoose.model("Notification", notificationSchema);
export default notificationModel;
