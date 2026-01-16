import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
	{
		_id: {
			type: Number,
			required: true,
		},
		balance: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	{
		_id: true,
		timestamps: false,
	},
);

walletSchema.index({ _id: 1 });

export default mongoose.model("Wallet", walletSchema);
