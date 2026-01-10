import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import Collection from "@/models/Collection";
import type { Auction } from "./auctionModel";
import { AuctionRepository, type CreateAuctionData, type GetAuctionsFilters } from "./auctionRepository";

export class AuctionService {
	private auctionRepository: AuctionRepository;

	constructor() {
		this.auctionRepository = new AuctionRepository();
	}

	async createAuction(data: { collection_id: string; round_duration: number }): Promise<ServiceResponse<Auction>> {
		try {
			const collection = await Collection.findById(data.collection_id);
			if (!collection) {
				return ServiceResponse.failure("Collection not found", null as unknown as Auction, StatusCodes.NOT_FOUND);
			}

			const auctionData: CreateAuctionData = {
				collection_id: data.collection_id,
				round_duration: data.round_duration,
				status: "active",
			};

			const auction = await this.auctionRepository.create(auctionData);
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

