import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import Collection from "@/models/Collection";
import type { Gift } from "./giftModel";
import { type CreateGiftData, type GetGiftsFilters, GiftRepository } from "./giftRepository";

export class GiftService {
	private giftRepository: GiftRepository;

	constructor() {
		this.giftRepository = new GiftRepository();
	}

	async createGift(data: { emoji: string; collection_id: string }): Promise<ServiceResponse<Gift>> {
		// Validate collection exists
		const collection = await Collection.findById(data.collection_id);
		if (!collection) {
			return ServiceResponse.failure("Collection not found", null as unknown as Gift, StatusCodes.NOT_FOUND);
		}

		// Generate next gift_id for this collection
		const maxGiftId = await this.giftRepository.getMaxGiftId(data.collection_id);
		const nextGiftId = maxGiftId + 1;

		// Create gift
		const giftData: CreateGiftData = {
			emoji: data.emoji,
			collection_id: data.collection_id,
			gift_id: nextGiftId,
		};

		try {
			const gift = await this.giftRepository.create(giftData);
			return ServiceResponse.success("Gift created successfully", gift, StatusCodes.CREATED);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to create gift";
			return ServiceResponse.failure(errorMessage, null as unknown as Gift, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getGiftById(id: string): Promise<ServiceResponse<Gift>> {
		const gift = await this.giftRepository.findById(id);

		if (!gift) {
			return ServiceResponse.failure("Gift not found", null as unknown as Gift, StatusCodes.NOT_FOUND);
		}

		return ServiceResponse.success("Gift retrieved successfully", gift);
	}

	async getGifts(filters?: GetGiftsFilters): Promise<ServiceResponse<Gift[]>> {
		try {
			const gifts = await this.giftRepository.findAll(filters);
			return ServiceResponse.success("Gifts retrieved successfully", gifts);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to retrieve gifts";
			return ServiceResponse.failure(errorMessage, [] as Gift[], StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const giftService = new GiftService();
