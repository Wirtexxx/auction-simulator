import { StatusCodes } from "http-status-codes";
import { pino } from "pino";

import { ServiceResponse } from "@/common/models/serviceResponse";
import Gift from "@/models/Gift";
import Ownership from "@/models/Ownership";
import type { Round } from "./roundModel";
import { RoundRepository, type CreateRoundData, type GetRoundsFilters } from "./roundRepository";

const logger = pino({ name: "roundService" });

export class RoundService {
	private roundRepository: RoundRepository;

	constructor() {
		this.roundRepository = new RoundRepository();
	}

	async createRound(auctionId: string, collectionId: string, roundNumber: number, giftsPerRound: number, previousRoundGiftIds?: string[]): Promise<ServiceResponse<Round>> {
		try {
			// Get unsold gifts from previous round (if any)
			const unsoldGiftIds: string[] = previousRoundGiftIds || [];
			logger.info(
				{ auctionId, roundNumber, unsoldGiftIdsCount: unsoldGiftIds.length, giftsPerRound },
				"Creating round with unsold gifts from previous round",
			);

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
			// Logic: 
			// - If there are unsold gifts from previous round: add all unsold + gifts_per_round new ones
			// - If no unsold gifts (first round or all were sold): add up to gifts_per_round available gifts
			// Example 1: Previous round had 5 gifts, 2 sold, 3 unsold:
			//   - unsoldGiftIds = 3 gifts
			//   - We add gifts_per_round = 5 new gifts (if available)
			//   - Total = 3 + 5 = 8 gifts in new round
			// Example 2: First round, 10 total gifts, 6 already sold, 4 available:
			//   - unsoldGiftIds = [] (no previous round)
			//   - availableGifts = 4 gifts
			//   - We add min(gifts_per_round, available) = min(5, 4) = 4 gifts
			//   - Total = 4 gifts in round
			const giftIdsToUse: string[] = [...unsoldGiftIds];

			// If we have unsold gifts from previous round, add gifts_per_round new ones
			// Otherwise (first round or all sold), add up to gifts_per_round available gifts
			if (unsoldGiftIds.length > 0) {
				// Previous round had unsold gifts: add gifts_per_round new ones
				const newGifts = availableGifts.slice(0, giftsPerRound);
				giftIdsToUse.push(...newGifts.map((g) => g._id.toString()));
			} else {
				// First round or all were sold: add up to gifts_per_round available gifts
				const giftsToAdd = Math.min(giftsPerRound, availableGifts.length);
				const newGifts = availableGifts.slice(0, giftsToAdd);
				giftIdsToUse.push(...newGifts.map((g) => g._id.toString()));
			}

			logger.info(
				{ auctionId, roundNumber, totalGifts: giftIdsToUse.length, unsoldFromPrevious: unsoldGiftIds.length, newGifts: giftIdsToUse.length - unsoldGiftIds.length },
				"Round gifts prepared",
			);

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
			if (!round) {
				logger.warn({ auctionId }, "No active round found for auction");
				return ServiceResponse.success("No active round found", null);
			}
			return ServiceResponse.success("Current round retrieved successfully", round);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to retrieve current round";
			logger.error({ error, auctionId }, "Error retrieving current round");
			return ServiceResponse.failure(errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getRoundByAuctionAndNumber(auctionId: string, roundNumber: number): Promise<ServiceResponse<Round | null>> {
		try {
			const round = await this.roundRepository.findByAuctionAndRound(auctionId, roundNumber);
			return ServiceResponse.success("Round retrieved successfully", round);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to retrieve round";
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

	/**
	 * Close a round by auctionId and roundNumber
	 * Sets settling flag and triggers settlement
	 */
	async closeRound(auctionId: string, roundNumber: number): Promise<ServiceResponse<void>> {
		try {
			logger.info({ auctionId, roundNumber }, "Starting closeRound");

			// Import here to avoid circular dependency
			const { updateAuctionState } = await import("@/common/redis/auctionState");
			const { settlementService } = await import("@/services/settlementService");
			const { getAuctionWebSocketServer } = await import("@/websocket/auctionWebSocket");
			const wsTypes = await import("@/websocket/types");

			// Set settling flag to block new bids
			logger.info({ auctionId, roundNumber }, "Setting settling flag");
			await updateAuctionState(auctionId, { settling: true });

			// Get round by auction and number (not by status, as it may already be finished)
			// Use getRoundByAuctionAndNumber instead of getCurrentRound to get the specific round
			logger.info({ auctionId, roundNumber }, "Looking up round by auction and number");
			const roundResponse = await this.getRoundByAuctionAndNumber(auctionId, roundNumber);
			if (!roundResponse.success || !roundResponse.responseObject) {
				logger.error({ auctionId, roundNumber, error: roundResponse.message }, "Round not found for closeRound");
				return ServiceResponse.failure(
					`Round ${roundNumber} not found for auction ${auctionId}`,
					undefined,
					StatusCodes.NOT_FOUND,
				);
			}

			const round = roundResponse.responseObject;
			logger.info({ 
				auctionId, 
				roundNumber, 
				roundId: round._id, 
				status: round.status,
				giftsCount: round.gift_ids.length
			}, "Round found, finishing in MongoDB");

			// Finish round in MongoDB
			await this.finishRound(round._id);
			logger.info({ auctionId, roundNumber, roundId: round._id }, "Round finished in MongoDB");

			// Broadcast round_closed event
			const wsServer = getAuctionWebSocketServer();
			if (wsServer) {
				const event = {
					type: "round_closed" as const,
					data: {
						auctionId,
						roundNumber,
					},
				};
				wsServer.broadcastToAuction(auctionId, event);
				logger.info({ auctionId, roundNumber }, "Round_closed event broadcasted");
			} else {
				logger.warn({ auctionId, roundNumber }, "WebSocket server not available for round_closed event");
			}

			// Trigger settlement (async, don't wait)
			logger.info({ auctionId, roundNumber }, "Triggering settlement");
			settlementService.settleRound(auctionId, roundNumber).catch((error) => {
				logger.error({ 
					error, 
					auctionId, 
					roundNumber,
					errorMessage: error instanceof Error ? error.message : String(error)
				}, "Error in settlement after closeRound");
			});

			logger.info({ auctionId, roundNumber }, "Round closed successfully");
			return ServiceResponse.success("Round closed successfully", undefined);
		} catch (error) {
			logger.error({ 
				error, 
				auctionId, 
				roundNumber,
				errorMessage: error instanceof Error ? error.message : String(error),
				errorStack: error instanceof Error ? error.stack : undefined
			}, "Error in closeRound");
			const errorMessage = error instanceof Error ? error.message : "Failed to close round";
			return ServiceResponse.failure(errorMessage, undefined, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const roundService = new RoundService();

