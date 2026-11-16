import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        role: {
            type: String,
            enum: ["admin", "doctor", "patient"],
            default: "patient",
            required: true
        },
        specialization: {
            type: String,
            required() {
                return this.role === "doctor";
            },
            trim: true,
            maxlength: 100
        },
        experience: {
            type: Number,
            required() {
                return this.role === "doctor";
            },
            min: 0,
            max: 80
        },
        isActive: {
            type: Boolean,
            default: true,
            required: true
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform(_document, result) {
                delete result.password;
                delete result.__v;
                return result;
            }
        }
    }
);

userSchema.index({ role: 1, isActive: 1, name: 1 });

const userModel = mongoose.model("User", userSchema);
export default userModel;
