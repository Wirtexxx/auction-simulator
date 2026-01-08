import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		total_amount: {
			type: Number,
			required: true,
		},
		minted_amount: {
			type: Number,
			required: true,
			default: 0,
		},
		created_at: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: false,
	}
);

export default mongoose.model("Collection", collectionSchema);

