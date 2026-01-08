import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
	{
		collection_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Collection",
			required: true,
		},
		round_duration: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			enum: ["active", "finished"],
			required: true,
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

auctionSchema.index({ collection_id: 1 });
auctionSchema.index({ status: 1 });

export default mongoose.model("Auction", auctionSchema);

