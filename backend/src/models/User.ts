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
		first_name: {
			type: String,
			required: true,
		},
		last_name: {
			type: String,
		},
		photo_url: {
			type: String,
		},
		language_code: {
			type: String,
		},
		is_premium: {
			type: Boolean,
			default: false,
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			required: true,
			default: "user",
		},
		created_at: {
			type: Date,
			default: Date.now,
		},
	},
	{
		_id: true,
		timestamps: false,
	},
);

export default mongoose.model("User", userSchema);
