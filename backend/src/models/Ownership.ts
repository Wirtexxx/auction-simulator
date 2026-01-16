import mongoose from "mongoose";

const ownershipSchema = new mongoose.Schema(
	{
		gift_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Gift",
			required: true,
		},
		owner_id: {
			type: Number,
			required: true,
		},
		acquired_price: {
			type: Number,
			required: true,
		},
		acquired_at: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: false,
	},
);

ownershipSchema.index({ gift_id: 1 });
ownershipSchema.index({ owner_id: 1 });

export default mongoose.model("Ownership", ownershipSchema);
