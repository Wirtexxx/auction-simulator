import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import Gift from "@/models/Gift";
import Ownership from "@/models/Ownership";
import type { Round } from "./roundModel";
import { RoundRepository, type CreateRoundData, type GetRoundsFilters } from "./roundRepository";

export class RoundService {
	private roundRepository: RoundRepository;

	constructor() {
		this.roundRepository = new RoundRepository();
	}

	async createRound(auctionId: string, collectionId: string, roundNumber: number, giftsPerRound: number, previousRoundGiftIds?: string[]): Promise<ServiceResponse<Round>> {
		try {
			// Get unsold gifts from previous round (if any)
			const unsoldGiftIds: string[] = previousRoundGiftIds || [];

			// Get all gifts from the collection
			const allGifts = await Gift.find({ collection_id: collectionId }).select("_id");

			// Get all sold gift IDs (have ownership)
			const soldGifts = await Ownership.find({}).select("gift_id");
			const soldGiftIds = new Set(soldGifts.map((o) => o.gift_id.toString()));

			// Filter out sold gifts and previous round gifts
			const availableGifts = allGifts.filter(
				(gift) => !soldGiftIds.has(gift._id.toString()) && !unsoldGiftIds.includes(gift._id.toString())
			);

			// Combine unsold from previous round + new available gifts
			const giftIdsToUse: string[] = [...unsoldGiftIds];

			// Add new gifts up to gifts_per_round
			const remainingSlots = giftsPerRound - giftIdsToUse.length;
			if (remainingSlots > 0) {
				const newGifts = availableGifts.slice(0, remainingSlots);
				giftIdsToUse.push(...newGifts.map((g) => g._id.toString()));
			}

			if (giftIdsToUse.length === 0) {
				return ServiceResponse.failure("No available gifts for this round", null as unknown as Round, StatusCodes.BAD_REQUEST);
			}

			const roundData: CreateRoundData = {
				auction_id: auctionId,
				round_number: roundNumber,
				gift_ids: giftIdsToUse,
				status: "active",
			};

			const round = await this.roundRepository.create(roundData);
			return ServiceResponse.success("Round created successfully", round, StatusCodes.CREATED);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to create round";
			return ServiceResponse.failure(errorMessage, null as unknown as Round, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getRoundById(id: string): Promise<ServiceResponse<Round>> {
		const round = await this.roundRepository.findById(id);

		if (!round) {
			return ServiceResponse.failure("Round not found", null as unknown as Round, StatusCodes.NOT_FOUND);
		}

		return ServiceResponse.success("Round retrieved successfully", round);
	}

	async getRounds(filters?: GetRoundsFilters): Promise<ServiceResponse<Round[]>> {
		try {
			const rounds = await this.roundRepository.findAll(filters);
			return ServiceResponse.success("Rounds retrieved successfully", rounds);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to retrieve rounds";
			return ServiceResponse.failure(errorMessage, [] as Round[], StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getCurrentRound(auctionId: string): Promise<ServiceResponse<Round | null>> {
		try {
			const round = await this.roundRepository.findCurrentRound(auctionId);
			return ServiceResponse.success("Current round retrieved successfully", round);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to retrieve current round";
			return ServiceResponse.failure(errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async finishRound(roundId: string): Promise<ServiceResponse<Round>> {
		try {
			await this.roundRepository.finishRound(roundId);
			const round = await this.roundRepository.findById(roundId);
			if (!round) {
				return ServiceResponse.failure("Round not found", null as unknown as Round, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success("Round finished successfully", round);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to finish round";
			return ServiceResponse.failure(errorMessage, null as unknown as Round, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getUnsoldGiftsFromRound(roundId: string): Promise<string[]> {
		try {
			const round = await this.roundRepository.findById(roundId);
			if (!round) {
				return [];
			}

			// Get all sold gift IDs for this round
			const soldGifts = await Ownership.find({
				gift_id: { $in: round.gift_ids },
			}).select("gift_id");

			const soldGiftIds = new Set(soldGifts.map((o) => o.gift_id.toString()));

			// Return gift IDs that were not sold
			return round.gift_ids.filter((giftId) => !soldGiftIds.has(giftId));
		} catch (error) {
			return [];
		}
	}
}

export const roundService = new RoundService();

