import { StatusCodes } from "http-status-codes";
import { pino } from "pino";
import { getRedisClient } from "@/common/db/redis";
import { metricsService } from "@/common/metrics/metricsService";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { getErrorMessage, getErrorStack } from "@/common/utils/errorHandling";
import { getAuctionKeysPattern, getRoundBidsKey } from "@/common/redis/auctionKeys";
import {
	initializeAuctionState,
	initializeAuctionStateWithTime,
	updateAuctionState,
} from "@/common/redis/auctionState";
import Collection from "@/models/Collection";
import Ownership from "@/models/Ownership";
import { getAuctionWebSocketServer } from "@/websocket/auctionWebSocket";
import type { AuctionFinishedEvent, RoundStartedEvent } from "@/websocket/types";
import { roundService } from "../round/roundService";
import { walletService } from "../wallet/walletService";
import type { Auction } from "./auctionModel";
import { AuctionRepository, type CreateAuctionData, type GetAuctionsFilters } from "./auctionRepository";

const logger = pino({ name: "auctionService" });

export class AuctionService {
	private auctionRepository: AuctionRepository;

	constructor() {
		this.auctionRepository = new AuctionRepository();
	}

	async createAuction(data: {
		collection_id: string;
		round_duration: number;
		gifts_per_round: number;
	}): Promise<ServiceResponse<Auction>> {
		try {
			const collection = await Collection.findById(data.collection_id);
			if (!collection) {
				return ServiceResponse.failure("Collection not found", null as unknown as Auction, StatusCodes.NOT_FOUND);
			}

			// Check if collection is already sold
			if (collection.is_sold) {
				return ServiceResponse.failure(
					"Collection is already sold and cannot be used for a new auction",
					null as unknown as Auction,
					StatusCodes.BAD_REQUEST,
				);
			}

			// Check if there's already an auction for this collection (active or finished)
			const existingAuctions = await this.auctionRepository.findAll({ collection_id: data.collection_id });
			if (existingAuctions.length > 0) {
				return ServiceResponse.failure(
					"An auction for this collection already exists. Collections can only be used once.",
					null as unknown as Auction,
					StatusCodes.BAD_REQUEST,
				);
			}

			// Finish all active auctions (max 1 active auction allowed)
			const activeAuctions = await this.auctionRepository.findActiveAuctions();
			if (activeAuctions.length > 0) {
				// Import updateAuctionState for Redis synchronization
				const { updateAuctionState } = await import("@/common/redis/auctionState");
				const redis = getRedisClient();

				// Finish all active auctions in MongoDB
				await this.auctionRepository.finishAllActiveAuctions();

				// Synchronize Redis state for all finished auctions
				for (const activeAuction of activeAuctions) {
					try {
						// Update Redis status to "finished"
						await updateAuctionState(activeAuction._id, { status: "finished" });

						// Cleanup Redis keys for this auction
						const pattern = getAuctionKeysPattern(activeAuction._id);
						const keys = await redis.keys(pattern);
						if (keys.length > 0) {
							await redis.del(...keys);
						}

						logger.info({ auctionId: activeAuction._id }, "Finished active auction and synchronized Redis state");
					} catch (error) {
						logger.error(
							{ error, auctionId: activeAuction._id },
							"Error synchronizing Redis state when finishing active auction",
						);
						// Continue with other auctions even if one fails
					}
				}

				// Finish all active rounds for these auctions
				for (const activeAuction of activeAuctions) {
					const currentRound = await roundService.getCurrentRound(activeAuction._id);
					if (currentRound.success && currentRound.responseObject) {
						await roundService.finishRound(currentRound.responseObject._id);
					}
				}
			}

			// Calculate total_rounds based on collection total_amount and gifts_per_round
			const totalRounds = Math.ceil(collection.total_amount / data.gifts_per_round);

			const auctionData: CreateAuctionData = {
				collection_id: data.collection_id,
				round_duration: data.round_duration,
				gifts_per_round: data.gifts_per_round,
				total_rounds: totalRounds,
				// Create auction as "finished" initially - start() will change to "active" after Redis initialization
				// This prevents state inconsistency where MongoDB has "active" but Redis has no state
				status: "finished",
			};

			const auction = await this.auctionRepository.create(auctionData);

			// Start the auction (initialize Redis state and set status to "active")
			await this.start(auction._id);

			// Update metrics
			metricsService.auctionCreatedTotal.inc();
			const activeCount = await this.auctionRepository.findActiveAuctions();
			metricsService.auctionActiveCount.set(activeCount.length);

			return ServiceResponse.success("Auction created successfully", auction, StatusCodes.CREATED);
		} catch (error) {
			const errorMessage = getErrorMessage(error, "Failed to create auction");
			logger.error({ error, stack: getErrorStack(error) }, "Error creating auction");
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
			const errorMessage = getErrorMessage(error, "Failed to retrieve auctions");
			logger.error({ error, stack: getErrorStack(error) }, "Error retrieving auctions");
			return ServiceResponse.failure(errorMessage, [] as Auction[], StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Create the first round for an auction
	 * @private
	 */
	private async createFirstRound(auctionId: string, auction: Auction) {
		logger.info(
			{ auctionId, collectionId: auction.collection_id, roundNumber: 1, giftsPerRound: auction.gifts_per_round },
			"Creating first round in MongoDB",
		);

		const roundResponse = await roundService.createRound(
			auctionId,
			auction.collection_id,
			1,
			auction.gifts_per_round,
		);

		if (!roundResponse.success || !roundResponse.responseObject) {
			logger.error(
				{ auctionId, error: roundResponse.message },
				"Failed to create first round - cannot start auction without a round",
			);
			// Clean up auction if round creation failed
			await this.auctionRepository.finishAuction(auctionId);
			throw new Error(`Failed to create first round: ${roundResponse.message}`);
		}

		const createdRound = roundResponse.responseObject;

		// Verify round_number is correct
		if (createdRound.round_number !== 1) {
			logger.error(
				{ auctionId, expectedRoundNumber: 1, actualRoundNumber: createdRound.round_number },
				"Round number mismatch - created round has wrong number",
			);
			throw new Error(`Round number mismatch: expected 1, got ${createdRound.round_number}`);
		}

		logger.info(
			{
				auctionId,
				roundId: createdRound._id,
				roundNumber: createdRound.round_number,
				giftsCount: createdRound.gift_ids.length,
			},
			"First round created successfully",
		);

		return createdRound;
	}

	/**
	 * Initialize Redis state for an auction and broadcast round_started event
	 * @private
	 */
	private async initializeAuctionRedisState(
		auctionId: string,
		auction: Auction,
		createdRound: { _id: string; round_number: number },
	): Promise<void> {
		// Clean up any existing Redis keys for this auction before initializing
		// This ensures no stale data (like settling: true) remains from previous auctions
		const redis = getRedisClient();
		const pattern = getAuctionKeysPattern(auctionId);
		const existingKeys = await redis.keys(pattern);
		if (existingKeys.length > 0) {
			logger.info({ auctionId, keysCount: existingKeys.length }, "Cleaning up existing Redis keys before initialization");
			await redis.del(...existingKeys);
		}

		// Initialize Redis state for first round AFTER round is created
		logger.info({ auctionId, roundNumber: createdRound.round_number }, "Initializing Redis state for first round");
		await initializeAuctionState(auctionId, createdRound.round_number, auction.round_duration);

		// Verify Redis state was created
		const { getAuctionState, updateAuctionState } = await import("@/common/redis/auctionState");
		const state = await getAuctionState(auctionId);
		if (!state) {
			logger.error({ auctionId }, "Redis state not initialized after createRound");
			throw new Error("Failed to initialize Redis state");
		}

		// Explicitly ensure settling flag is false (in case of any race condition or stale data)
		if (state.settling === true) {
			logger.warn({ auctionId }, "Settling flag was true after initialization, fixing it");
			await updateAuctionState(auctionId, { settling: false });
			// Re-fetch state to verify
			const updatedState = await getAuctionState(auctionId);
			if (updatedState && updatedState.settling === false) {
				logger.info({ auctionId }, "Settling flag successfully set to false");
			} else {
				logger.error({ auctionId }, "Failed to set settling flag to false");
				throw new Error("Failed to set settling flag to false");
			}
		}

		logger.info(
			{ auctionId, roundNumber: state.round, roundEndTs: state.round_end_ts, settling: state.settling },
			"Redis state initialized successfully",
		);

		// Broadcast round_started event
		const wsServer = getAuctionWebSocketServer();
		if (wsServer) {
			const event: RoundStartedEvent = {
				type: "round_started",
				data: {
					auctionId,
					roundNumber: createdRound.round_number,
					roundEndTs: state.round_end_ts,
				},
			};
			wsServer.broadcastToAuction(auctionId, event);
			logger.info({ auctionId, roundNumber: createdRound.round_number }, "Round_started event broadcasted");
		}
	}

	/**
	 * Recover auction state when MongoDB shows "active" but Redis has no state
	 * @private
	 */
	private async recoverAuctionState(auctionId: string, auction: Auction): Promise<boolean> {
		const { getAuctionState } = await import("@/common/redis/auctionState");
		
		logger.warn(
			{ auctionId },
			"State inconsistency detected: auction is active in MongoDB but has no Redis state. Attempting recovery...",
		);

		try {
			// Get current round from MongoDB
			const currentRoundResponse = await roundService.getCurrentRound(auctionId);

			if (currentRoundResponse.success && currentRoundResponse.responseObject) {
				const currentRound = currentRoundResponse.responseObject;
				const roundNumber = currentRound.round_number;

				// Calculate round end timestamp
				const roundStartTime = currentRound.started_at.getTime();
				const roundEndTs = roundStartTime + auction.round_duration * 1000;
				const now = Date.now();

				// Initialize Redis state for the current round
				if (roundEndTs > now) {
					// Round hasn't expired, restore state with original end time
					logger.info(
						{ auctionId, roundNumber, roundEndTs, now },
						"Recovering auction state: round is still active",
					);
					await initializeAuctionStateWithTime(auctionId, roundNumber, roundEndTs);
				} else {
					// Round has expired, initialize for current round (settlement will be handled separately)
					logger.info(
						{ auctionId, roundNumber, roundEndTs, now },
						"Recovering auction state: round has expired, initializing for current round",
					);
					await initializeAuctionState(auctionId, roundNumber, auction.round_duration);
				}

				// Verify recovery was successful
				const recoveredState = await getAuctionState(auctionId);
				if (recoveredState) {
					logger.info({ auctionId, roundNumber }, "Auction state successfully recovered from MongoDB data");
					return true;
				} else {
					logger.error({ auctionId }, "Recovery failed: Redis state not initialized after recovery attempt");
					throw new Error("Failed to recover auction state: Redis initialization failed");
				}
			} else {
				// No round found, initialize for current round number
				logger.info(
					{ auctionId, currentRoundNumber: auction.current_round_number },
					"Recovering auction state: no round found, initializing for current round number",
				);
				await initializeAuctionState(auctionId, auction.current_round_number, auction.round_duration);

				const recoveredState = await getAuctionState(auctionId);
				if (recoveredState) {
					logger.info({ auctionId, roundNumber: auction.current_round_number }, "Auction state recovered (no round found)");
					return true;
				} else {
					throw new Error("Failed to recover auction state: Redis initialization failed");
				}
			}
		} catch (recoveryError) {
			logger.error(
				{ error: recoveryError, auctionId },
				"Recovery failed: unable to restore Redis state from MongoDB data",
			);
			throw new Error(
				`Auction is marked as active in MongoDB but has no Redis state. Recovery attempt failed: ${recoveryError instanceof Error ? recoveryError.message : String(recoveryError)}`,
			);
		}
	}

	/**
	 * Start an auction: initialize Redis state and create first round
	 */
	async start(auctionId: string): Promise<void> {
		try {
			const auction = await this.auctionRepository.findById(auctionId);
			if (!auction) {
				logger.error({ auctionId }, "Auction not found for start");
				throw new Error(`Auction ${auctionId} not found`);
			}

			// Check if auction is already active in MongoDB
			if (auction.status === "active") {
				logger.warn({ auctionId, status: auction.status }, "Auction is already active in MongoDB");
				// Check Redis state to determine if this is a state inconsistency
				const { getAuctionState } = await import("@/common/redis/auctionState");
				const redisState = await getAuctionState(auctionId);
				if (!redisState) {
					// Attempt to recover state inconsistency
					await this.recoverAuctionState(auctionId, auction);
					return; // Recovery successful, exit early
				}
				// Redis state exists, auction is truly active
				throw new Error("Auction is already active");
			}

			// Import auction state functions once at the start
			const { getAuctionState, updateAuctionState } = await import("@/common/redis/auctionState");

			// Check if auction state is already initialized in Redis (means auction was already started)
			const existingState = await getAuctionState(auctionId);
			if (existingState) {
				logger.warn({ auctionId }, "Auction state already exists in Redis - auction was already started");
				throw new Error("Auction is already active");
			}

		// Create first round and initialize Redis state
		const createdRound = await this.createFirstRound(auctionId, auction);
		await this.initializeAuctionRedisState(auctionId, auction, createdRound);

		// Set auction status to "active" in MongoDB after successful initialization
		await this.auctionRepository.updateStatus(auctionId, "active");
		logger.info({ auctionId, roundId: createdRound._id }, "Auction started successfully");
		} catch (error) {
			logger.error(
				{ error, auctionId, stack: getErrorStack(error) },
				"Error starting auction",
			);
			throw error;
		}
	}

	/**
	 * Finish an auction: set status to finished, return frozen funds, cleanup Redis
	 */
	async finish(auctionId: string): Promise<void> {
		try {
			// Get auction to get collection_id
			const auction = await this.auctionRepository.findById(auctionId);
			if (!auction) {
				logger.error({ auctionId }, "Auction not found when finishing");
				throw new Error(`Auction ${auctionId} not found`);
			}

			// Check if auction is already finished
			if (auction.status === "finished") {
				logger.warn({ auctionId }, "Auction is already finished");
				throw new Error("Auction is already finished");
			}

			// Update MongoDB status first
			await this.auctionRepository.finishAuction(auctionId);

			// Mark collection as sold
			const { CollectionRepository } = await import("@/api/collection/collectionRepository");
			const collectionRepo = new CollectionRepository();
			await collectionRepo.markAsSold(auction.collection_id);
			logger.info({ auctionId, collectionId: auction.collection_id }, "Collection marked as sold");

			// Update Redis state to keep MongoDB and Redis in sync
			// If this fails, MongoDB is already "finished", but Redis cleanup will happen anyway
			try {
				await updateAuctionState(auctionId, { status: "finished" });
			} catch (error) {
				logger.error(
					{ error, auctionId },
					"Failed to update Redis status to finished, but MongoDB is already finished - continuing with cleanup",
				);
				// Continue with cleanup even if Redis update fails
			}

			// Return all frozen balances for this auction
			await walletService.unfreezeAllForAuction(auctionId);

			// Cleanup all Redis keys for this auction
			const redis = getRedisClient();
			const pattern = getAuctionKeysPattern(auctionId);
			const keys = await redis.keys(pattern);
			if (keys.length > 0) {
				await redis.del(...keys);
			}

			// Broadcast auction_finished event
			const wsServer = getAuctionWebSocketServer();
			if (wsServer) {
				const event: AuctionFinishedEvent = {
					type: "auction_finished",
					data: {
						auctionId,
					},
				};
				wsServer.broadcastToAuction(auctionId, event);
			}

			// Update metrics
			metricsService.auctionFinishedTotal.inc();
			const activeCount = await this.auctionRepository.findActiveAuctions();
			metricsService.auctionActiveCount.set(activeCount.length);

			logger.info({ auctionId }, "Auction finished");
		} catch (error) {
			logger.error({ error, auctionId }, "Error finishing auction");
			throw error;
		}
	}

	/**
	 * Check if auction should finish (no more available gifts)
	 */
	async shouldFinish(auctionId: string): Promise<boolean> {
		try {
			const auction = await this.auctionRepository.findById(auctionId);
			if (!auction) {
				logger.warn({ auctionId }, "Auction not found in shouldFinish, returning true");
				return true;
			}

			// Get collection
			const collection = await Collection.findById(auction.collection_id);
			if (!collection) {
				logger.warn(
					{ auctionId, collectionId: auction.collection_id },
					"Collection not found in shouldFinish, returning true",
				);
				return true;
			}

			// Get all gifts from collection
			const Gift = await import("@/models/Gift").then((m) => m.default);
			const allGifts = await Gift.find({ collection_id: auction.collection_id }).select("_id");
			const allGiftIds = new Set(allGifts.map((g) => g._id.toString()));

			// Get all sold gifts for this collection
			const soldGifts = await Ownership.find({
				gift_id: { $in: Array.from(allGiftIds) },
			}).select("gift_id");
			const soldGiftIds = new Set(soldGifts.map((o) => o.gift_id.toString()));

			// Check if there are any unsold gifts
			const unsoldGifts = Array.from(allGiftIds).filter((id) => !soldGiftIds.has(id));

			logger.info(
				{ auctionId, totalGifts: allGiftIds.size, soldGifts: soldGiftIds.size, unsoldGifts: unsoldGifts.length },
				"Checking if auction should finish",
			);

			// If no unsold gifts, auction should finish
			return unsoldGifts.length === 0;
		} catch (error) {
			logger.error({ error, auctionId }, "Error checking if auction should finish");
			return false;
		}
	}

	/**
	 * Move to next round or finish auction if no gifts available
	 */
	async nextRound(auctionId: string): Promise<void> {
		try {
			logger.info({ auctionId }, "Starting nextRound");

			// Get auction to check current round number vs total_rounds
			const auction = await this.auctionRepository.findById(auctionId);
			if (!auction) {
				logger.error({ auctionId }, "Auction not found for nextRound");
				throw new Error(`Auction ${auctionId} not found`);
			}

			const currentRoundNumber = auction.current_round_number;
			const totalRounds = auction.total_rounds || 0;
			const isOverRound = currentRoundNumber >= totalRounds;

			logger.info(
				{ auctionId, currentRoundNumber, totalRounds, isOverRound },
				"Checking if auction should continue (overrounds logic: auction continues until all gifts are sold)",
			);

			// Check if auction should finish (based on unsold gifts, NOT total_rounds)
			// This allows overrounds - auction continues beyond total_rounds until all gifts are sold
			const shouldFinish = await this.shouldFinish(auctionId);
			if (shouldFinish) {
				logger.info({ auctionId, currentRoundNumber, totalRounds }, "No more gifts available, finishing auction");
				await this.finish(auctionId);
				// Don't clear settling flag - auction is finished, all Redis keys will be cleaned up
				return;
			}

			if (isOverRound) {
				logger.info(
					{ auctionId, currentRoundNumber, totalRounds },
					"OVER ROUND: Creating additional round beyond total_rounds because unsold gifts remain",
				);
			}

			logger.info(
				{ auctionId, currentRoundNumber, totalRounds, isOverRound },
				"Auction should continue, creating next round",
			);

			// Validate current_round_number
			if (!currentRoundNumber || currentRoundNumber < 1) {
				logger.error({ auctionId, currentRoundNumber }, "Invalid current_round_number");
				throw new Error(`Invalid current_round_number: ${currentRoundNumber}`);
			}

			// Get current round by round number (not by status, as it may be finished)
			// Use the round number from auction, which is the round that just finished
			logger.info({ auctionId, currentRoundNumber }, "Getting current round by number");

			const currentRoundResponse = await roundService.getRoundByAuctionAndNumber(auctionId, currentRoundNumber);
			if (!currentRoundResponse.success || !currentRoundResponse.responseObject) {
				logger.error(
					{ auctionId, currentRoundNumber, error: currentRoundResponse.message },
					"Current round not found by number",
				);
				throw new Error(`Current round ${currentRoundNumber} not found for auction ${auctionId}`);
			}

			const currentRound = currentRoundResponse.responseObject;

			// Validate that the found round has the correct round_number
			if (currentRound.round_number !== currentRoundNumber) {
				logger.error(
					{ auctionId, expectedRoundNumber: currentRoundNumber, actualRoundNumber: currentRound.round_number },
					"Round number mismatch in found round",
				);
				throw new Error(`Round number mismatch: expected ${currentRoundNumber}, got ${currentRound.round_number}`);
			}
			const unsoldGifts = await roundService.getUnsoldGiftsFromRound(currentRound._id);

			logger.info(
				{
					auctionId,
					currentRoundNumber: auction.current_round_number,
					unsoldGiftsCount: unsoldGifts.length,
					giftsPerRound: auction.gifts_per_round,
				},
				"Moving to next round with unsold gifts",
			);

			// Calculate next round number
			const nextRoundNumber = auction.current_round_number + 1;
			const now = new Date();
			const nowMs = now.getTime();

			logger.info({ auctionId, nextRoundNumber }, "Updating auction to next round number");

			// Update MongoDB
			await this.auctionRepository.updateCurrentRound(auctionId, nextRoundNumber, now);

			logger.info({ auctionId, nextRoundNumber, unsoldGiftsCount: unsoldGifts.length }, "Creating next round");

			// Create next round with unsold gifts from previous round
			// This will combine unsold gifts + new gifts to reach gifts_per_round
			const roundResponse = await roundService.createRound(
				auctionId,
				auction.collection_id,
				nextRoundNumber,
				auction.gifts_per_round,
				unsoldGifts,
			);

			if (!roundResponse.success || !roundResponse.responseObject) {
				logger.error(
					{ auctionId, roundNumber: nextRoundNumber, error: roundResponse.message },
					"Failed to create next round",
				);
				// If we can't create next round, finish auction
				await this.finish(auctionId);
				// Don't clear settling flag - auction is finished, all Redis keys will be cleaned up
				throw new Error(`Failed to create next round: ${roundResponse.message}`);
			}

			const createdRound = roundResponse.responseObject;

			// Validate that the created round has the correct round_number
			if (createdRound.round_number !== nextRoundNumber) {
				logger.error(
					{ auctionId, expectedRoundNumber: nextRoundNumber, actualRoundNumber: createdRound.round_number },
					"Created round has wrong round_number",
				);
				throw new Error(`Round number mismatch: expected ${nextRoundNumber}, got ${createdRound.round_number}`);
			}

			// Validate that the round has at least one gift
			if (!createdRound.gift_ids || createdRound.gift_ids.length === 0) {
				logger.error(
					{ auctionId, roundNumber: nextRoundNumber, roundId: createdRound._id },
					"Created round has no gifts",
				);
				throw new Error(`Round ${nextRoundNumber} has no gifts`);
			}

			logger.info(
				{
					auctionId,
					nextRoundNumber,
					roundId: createdRound._id,
					giftsCount: createdRound.gift_ids.length,
				},
				"Next round created and validated, initializing Redis state",
			);

			// Initialize Redis state for new round with synchronized time
			// Use the same timestamp as MongoDB to ensure consistency
			const roundEndTs = nowMs + auction.round_duration * 1000;
			await initializeAuctionStateWithTime(auctionId, nextRoundNumber, roundEndTs);

			// Validate that Redis state was initialized correctly
			const redisState = await import("@/common/redis/auctionState").then((m) => m.getAuctionState(auctionId));
			if (!redisState || redisState.round !== nextRoundNumber) {
				logger.error(
					{ auctionId, expectedRound: nextRoundNumber, actualRound: redisState?.round },
					"Redis state not initialized correctly",
				);
				throw new Error(
					`Redis state initialization failed: expected round ${nextRoundNumber}, got ${redisState?.round}`,
				);
			}

			// Copy bids from previous round to new round
			// According to TZ: one bid per user per auction, bids should be available in all rounds
			const redis = getRedisClient();
			const previousBidsKey = getRoundBidsKey(auctionId, currentRoundNumber);
			const newBidsKey = getRoundBidsKey(auctionId, nextRoundNumber);

			try {
				// Get all bids from previous round
				const previousBids = await redis.zrange(previousBidsKey, 0, -1, "WITHSCORES");

				if (previousBids.length > 0) {
					// Copy bids to new round using ZADD
					// previousBids is an array: [member1, score1, member2, score2, ...]
					for (let i = 0; i < previousBids.length; i += 2) {
						const member = previousBids[i] as string;
						const score = parseFloat(previousBids[i + 1] as string);
						await redis.zadd(newBidsKey, score, member);
					}

					const bidsCount = previousBids.length / 2;
					logger.info(
						{
							auctionId,
							fromRound: currentRoundNumber,
							toRound: nextRoundNumber,
							bidsCount,
						},
						"Copied bids from previous round to new round",
					);
				} else {
					logger.info(
						{
							auctionId,
							fromRound: currentRoundNumber,
							toRound: nextRoundNumber,
						},
						"No bids to copy from previous round",
					);
				}
			} catch (error) {
				logger.error(
					{
						error,
						auctionId,
						fromRound: currentRoundNumber,
						toRound: nextRoundNumber,
					},
					"Error copying bids from previous round",
				);
				// Don't throw - this is not critical, auction can continue without copying bids
				// But log the error for debugging
			}

			logger.info(
				{ auctionId, nextRoundNumber, roundEndTs },
				"Redis state initialized, broadcasting round_started event",
			);

			// Broadcast round_started event
			const wsServer = getAuctionWebSocketServer();
			if (wsServer) {
				const state = await import("@/common/redis/auctionState").then((m) => m.getAuctionState(auctionId));
				if (state) {
					const event: RoundStartedEvent = {
						type: "round_started",
						data: {
							auctionId,
							roundNumber: nextRoundNumber,
							roundEndTs: state.round_end_ts,
						},
					};
					wsServer.broadcastToAuction(auctionId, event);
					logger.info({ auctionId, nextRoundNumber }, "Round_started event broadcasted");
				} else {
					logger.warn({ auctionId, nextRoundNumber }, "Auction state not found in Redis after initialization");
				}
			} else {
				logger.warn({ auctionId, nextRoundNumber }, "WebSocket server not available");
			}

			// Clear settling flag after successful round initialization
			// This ensures the flag is only cleared when the new round is fully ready to accept bids
			// Check that auction is still active before clearing flag (in case finish() was called)
			const { updateAuctionState, getAuctionState } = await import("@/common/redis/auctionState");
			const currentState = await getAuctionState(auctionId);
			if (currentState && currentState.status === "active") {
				await updateAuctionState(auctionId, { settling: false });
				logger.info({ auctionId, roundNumber: nextRoundNumber }, "Settling flag cleared, new round ready to accept bids");
			} else {
				logger.warn({ auctionId, roundNumber: nextRoundNumber, status: currentState?.status }, "Auction is not active, skipping settling flag clear");
			}

			logger.info({ auctionId, roundNumber: nextRoundNumber }, "Successfully moved to next round");
		} catch (error) {
			logger.error(
				{ error, auctionId, stack: getErrorStack(error) },
				"Error moving to next round",
			);
			// Re-throw to let caller know about the error
			// Note: settling flag remains true if nextRound() fails, preventing new bids until issue is resolved
			throw error;
		}
	}
}

export const auctionService = new AuctionService();
