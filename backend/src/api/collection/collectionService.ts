import { StatusCodes } from "http-status-codes";
import { pino } from "pino";
import { GiftRepository } from "@/api/gift/giftRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { Collection } from "./collectionModel";
import { CollectionRepository, type CreateCollectionData, type GetCollectionsFilters } from "./collectionRepository";

const logger = pino({ name: "collectionService" });

export class CollectionService {
	private collectionRepository: CollectionRepository;
	private giftRepository: GiftRepository;

	constructor() {
		this.collectionRepository = new CollectionRepository();
		this.giftRepository = new GiftRepository();
	}

	async createCollection(data: {
		title: string;
		description?: string;
		total_amount: number;
		emoji: string;
	}): Promise<ServiceResponse<Collection>> {
		try {
			// Create collection
			const collectionData: CreateCollectionData = {
				title: data.title,
				description: data.description,
				total_amount: data.total_amount,
				minted_amount: 0,
			};

			const collection = await this.collectionRepository.create(collectionData);

			// Get the starting gift_id for this collection (should be 0 for new collection)
			// gift_id starts from 1 for each collection
			const startingGiftId = 0;

			// Automatically create gifts based on total_amount
			// Create gifts in parallel with pre-calculated gift_ids to avoid race conditions
			const giftPromises: Promise<boolean>[] = [];

			// Log emoji being used for gifts
			logger.info(
				{ emoji: data.emoji, collectionId: collection._id, totalAmount: data.total_amount },
				"Creating gifts with emoji",
			);

			for (let i = 0; i < data.total_amount; i++) {
				const giftId = startingGiftId + i + 1;
				giftPromises.push(
					this.giftRepository
						.create({
							emoji: data.emoji || "🎁", // Ensure emoji is always set
							collection_id: collection._id,
							gift_id: giftId,
						})
						.then(() => {
							return true;
						})
						.catch((error) => {
							// Log error but don't fail the entire operation
							console.error(`Failed to create gift ${i + 1} with gift_id ${giftId}:`, error);
							return false;
						}),
				);
			}

			// Wait for all gifts to be created
			const results = await Promise.all(giftPromises);
			const successCount = results.filter((success) => success === true).length;

			if (successCount < data.total_amount) {
				console.warn(`Only ${successCount} out of ${data.total_amount} gifts were created`);
			}

			// Update minted_amount to reflect actually created gifts
			const updatedCollection = await this.collectionRepository.updateMintedAmount(collection._id, successCount);

			if (!updatedCollection) {
				return ServiceResponse.failure(
					"Failed to update collection",
					null as unknown as Collection,
					StatusCodes.INTERNAL_SERVER_ERROR,
				);
			}

			return ServiceResponse.success(
				"Collection created successfully with gifts",
				updatedCollection,
				StatusCodes.CREATED,
			);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to create collection";
			return ServiceResponse.failure(errorMessage, null as unknown as Collection, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getCollectionById(id: string): Promise<ServiceResponse<Collection>> {
		const collection = await this.collectionRepository.findById(id);

		if (!collection) {
			return ServiceResponse.failure("Collection not found", null as unknown as Collection, StatusCodes.NOT_FOUND);
		}

		return ServiceResponse.success("Collection retrieved successfully", collection);
	}

	async getCollections(filters?: GetCollectionsFilters): Promise<ServiceResponse<Collection[]>> {
		try {
			const collections = await this.collectionRepository.findAll(filters);
			return ServiceResponse.success("Collections retrieved successfully", collections);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to retrieve collections";
			return ServiceResponse.failure(errorMessage, [] as Collection[], StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async deleteCollection(id: string): Promise<ServiceResponse<{ deletedGifts: number }>> {
		try {
			// Check if collection exists
			const collection = await this.collectionRepository.findById(id);
			if (!collection) {
				return ServiceResponse.failure(
					"Collection not found",
					null as unknown as { deletedGifts: number },
					StatusCodes.NOT_FOUND,
				);
			}

			// Delete all gifts associated with this collection
			const deletedGiftsCount = await this.giftRepository.deleteByCollectionId(id);

			// Delete the collection
			const deleted = await this.collectionRepository.delete(id);

			if (!deleted) {
				return ServiceResponse.failure(
					"Failed to delete collection",
					null as unknown as { deletedGifts: number },
					StatusCodes.INTERNAL_SERVER_ERROR,
				);
			}

			return ServiceResponse.success(
				`Collection and ${deletedGiftsCount} associated gift(s) deleted successfully`,
				{ deletedGifts: deletedGiftsCount },
				StatusCodes.OK,
			);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to delete collection";
			return ServiceResponse.failure(
				errorMessage,
				null as unknown as { deletedGifts: number },
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const collectionService = new CollectionService();
