import mongoose from "mongoose";

const roundSchema = new mongoose.Schema(
	{
		auction_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Auction",
			required: true,
		},
		round_number: {
			type: Number,
			required: true,
		},
		gift_ids: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Gift",
				required: true,
			},
		],
		started_at: {
			type: Date,
			default: Date.now,
		},
		ended_at: {
			type: Date,
		},
		status: {
			type: String,
			enum: ["active", "finished"],
			default: "active",
		},
	},
	{
		timestamps: false,
	},
);

roundSchema.index({ auction_id: 1, round_number: 1 }, { unique: true });
roundSchema.index({ auction_id: 1 });
roundSchema.index({ status: 1 });

export default mongoose.model("Round", roundSchema);

