import mongoose from "mongoose";

const giftSchema = new mongoose.Schema(
    {
        gift_id: {
            type: Number,
            required: true,
            unique: true,
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
    }
);

giftSchema.index({ gift_id: 1 });
giftSchema.index({ collection_id: 1 });

export default mongoose.model("Gift", giftSchema);
