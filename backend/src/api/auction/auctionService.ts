import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import Collection from "@/models/Collection";
import type { Auction } from "./auctionModel";
import { AuctionRepository, type CreateAuctionData, type GetAuctionsFilters } from "./auctionRepository";
import { roundService } from "../round/roundService";

export class AuctionService {
	private auctionRepository: AuctionRepository;

	constructor() {
		this.auctionRepository = new AuctionRepository();
	}

	async createAuction(data: { collection_id: string; round_duration: number; gifts_per_round: number }): Promise<ServiceResponse<Auction>> {
		try {
			const collection = await Collection.findById(data.collection_id);
			if (!collection) {
				return ServiceResponse.failure("Collection not found", null as unknown as Auction, StatusCodes.NOT_FOUND);
			}

			// Finish all active auctions (max 1 active auction allowed)
			const activeAuctions = await this.auctionRepository.findActiveAuctions();
			if (activeAuctions.length > 0) {
				// Finish all active auctions
				await this.auctionRepository.finishAllActiveAuctions();
				
				// Finish all active rounds for these auctions
				for (const activeAuction of activeAuctions) {
					const currentRound = await roundService.getCurrentRound(activeAuction._id);
					if (currentRound.success && currentRound.responseObject) {
						await roundService.finishRound(currentRound.responseObject._id);
					}
				}
			}

			const auctionData: CreateAuctionData = {
				collection_id: data.collection_id,
				round_duration: data.round_duration,
				gifts_per_round: data.gifts_per_round,
				status: "active",
			};

			const auction = await this.auctionRepository.create(auctionData);

			// Create first round for the auction
			const roundResponse = await roundService.createRound(
				auction._id,
				data.collection_id,
				1,
				data.gifts_per_round
			);

			if (!roundResponse.success) {
				// Log error but don't fail auction creation
				console.error("Failed to create first round:", roundResponse.message);
			}

			return ServiceResponse.success("Auction created successfully", auction, StatusCodes.CREATED);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to create auction";
			return ServiceResponse.failure(errorMessage, null as unknown as Auction, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getAuctionById(id: string): Promise<ServiceResponse<Auction>> {
		const auction = await this.auctionRepository.findById(id);

		if (!auction) {
			return ServiceResponse.failure("Auction not found", null as unknown as Auction, StatusCodes.NOT_FOUND);
		}

		return ServiceResponse.success("Auction retrieved successfully", auction);
	}

	async getAuctions(filters?: GetAuctionsFilters): Promise<ServiceResponse<Auction[]>> {
		try {
			const auctions = await this.auctionRepository.findAll(filters);
			return ServiceResponse.success("Auctions retrieved successfully", auctions);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to retrieve auctions";
			return ServiceResponse.failure(errorMessage, [] as Auction[], StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const auctionService = new AuctionService();


