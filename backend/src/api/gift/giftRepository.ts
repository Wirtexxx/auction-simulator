import Gift from "@/models/Gift";
import type { Gift as GiftType } from "./giftModel";

export interface CreateGiftData {
	emoji: string;
	collection_id: string;
	gift_id: number;
}

export interface GetGiftsFilters {
	collection_id?: string;
	limit?: number;
	offset?: number;
}

export class GiftRepository {
	async create(data: CreateGiftData): Promise<GiftType> {
		const gift = new Gift(data);
		await gift.save();
		return this.toGiftType(gift);
	}

	async findById(id: string): Promise<GiftType | null> {
		const gift = await Gift.findById(id);
		return gift ? this.toGiftType(gift) : null;
	}

	async findByGiftId(collection_id: string, gift_id: number): Promise<GiftType | null> {
		const gift = await Gift.findOne({ collection_id, gift_id });
		return gift ? this.toGiftType(gift) : null;
	}

	async findAll(filters?: GetGiftsFilters): Promise<GiftType[]> {
		const query: Record<string, unknown> = {};

		if (filters?.collection_id) {
			query.collection_id = filters.collection_id;
		}

		const gifts = await Gift.find(query)
			.limit(filters?.limit || 100)
			.skip(filters?.offset || 0)
			.sort({ gift_id: -1 });

		return gifts.map((gift) => this.toGiftType(gift));
	}

	async getMaxGiftId(collection_id: string): Promise<number> {
		const result = await Gift.findOne({ collection_id }).sort({ gift_id: -1 }).select("gift_id");
		return result?.gift_id || 0;
	}

	async deleteByCollectionId(collection_id: string): Promise<number> {
		const result = await Gift.deleteMany({ collection_id });
		return result.deletedCount || 0;
	}

	private toGiftType(gift: {
		_id: { toString: () => string };
		gift_id: number;
		emoji: string;
		collection_id: { toString: () => string } | string;
	}): GiftType {
		return {
			_id: gift._id.toString(),
			gift_id: gift.gift_id,
			emoji: gift.emoji,
			collection_id: typeof gift.collection_id === "string" ? gift.collection_id : gift.collection_id.toString(),
		};
	}
}
