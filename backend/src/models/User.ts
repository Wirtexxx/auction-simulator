import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        _id: {
            type: Number,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        photo_url: {
            type: String,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            required: true,
        },
        created_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: true,
        timestamps: false,
    }
);

export default mongoose.model("User", userSchema);
