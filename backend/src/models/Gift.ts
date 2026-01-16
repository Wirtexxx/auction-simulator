import mongoose from "mongoose";

const giftSchema = new mongoose.Schema(
	{
		gift_id: {
			type: Number,
			required: true,
		},
		emoji: {
			type: String,
			required: true,
		},
		collection_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Collection",
			required: true,
		},
	},
	{
		timestamps: false,
	},
);

// Compound unique index: gift_id must be unique within a collection
giftSchema.index({ collection_id: 1, gift_id: 1 }, { unique: true });
giftSchema.index({ collection_id: 1 });

export default mongoose.model("Gift", giftSchema);
