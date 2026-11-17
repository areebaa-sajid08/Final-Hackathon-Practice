import mongoose from "mongoose";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const defaultAvailableDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const availabilitySchema = new mongoose.Schema(
    {
        availableDays: {
            type: [{ type: String, enum: weekdays }],
            default: defaultAvailableDays,
            validate: {
                validator: days => days.length > 0,
                message: "A doctor must be available at least one day a week"
            }
        },
        startTime: {
            type: String,
            default: "09:00",
            match: /^(?:[01]\d|2[0-3]):[0-5]\d$/
        },
        endTime: {
            type: String,
            default: "17:00",
            match: /^(?:[01]\d|2[0-3]):[0-5]\d$/,
            validate: {
                validator(value) {
                    return !this.startTime || value > this.startTime;
                },
                message: "End time must be later than start time"
            }
        }
    },
    { _id: false }
);

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
        availability: {
            type: availabilitySchema,
            default() {
                return this.role === "doctor" ? {} : undefined;
            },
            required() {
                return this.role === "doctor";
            }
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
