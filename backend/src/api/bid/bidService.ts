import { StatusCodes } from "http-status-codes";
import { getRedisClient } from "@/common/db/redis";
import { pino } from "pino";
import {
	getAuctionUsersKey,
	getRoundBidsKey,
	getFrozenBalanceKey,
} from "@/common/redis/auctionKeys";
import { getAuctionState, isRoundActive } from "@/common/redis/auctionState";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { walletService } from "../wallet/walletService";
import { auctionService } from "../auction/auctionService";
import { getAuctionWebSocketServer } from "@/websocket/auctionWebSocket";
import type { BidPlacedEvent } from "@/websocket/types";
import type { Bid } from "./bidModel";

const logger = pino({ name: "bidService" });

// Anti-sniping: block bids in the last N seconds before round ends
const ANTI_SNIPING_SECONDS = 10;

export class BidService {
	/**
	 * Place a bid for a user in an auction
	 * Atomic operation: SADD for lock, ZADD for bid, freeze balance
	 */
	async placeBid(
		auctionId: string,
		userId: number,
		amount: number,
	): Promise<ServiceResponse<Bid>> {
		const redis = getRedisClient();
		let oldFrozenAmount = 0; // Track old frozen amount for rollback

		try {
			// 1. Validate auction exists and is active
			const auctionResponse = await auctionService.getAuctionById(auctionId);
			if (!auctionResponse.success || !auctionResponse.responseObject) {
				return ServiceResponse.failure(
					"Auction not found",
					null as unknown as Bid,
					StatusCodes.NOT_FOUND,
				);
			}

			const auction = auctionResponse.responseObject;

			if (auction.status !== "active") {
				return ServiceResponse.failure(
					"Auction is not active",
					null as unknown as Bid,
					StatusCodes.BAD_REQUEST,
				);
			}

			// 2. Check if round is active (not settling)
			const isActive = await isRoundActive(auctionId);
			if (!isActive) {
				return ServiceResponse.failure(
					"Round is not accepting bids (settling or finished)",
					null as unknown as Bid,
					StatusCodes.BAD_REQUEST,
				);
			}

			// 3. Get current round number
			const state = await getAuctionState(auctionId);
			if (!state) {
				return ServiceResponse.failure(
					"Auction state not found",
					null as unknown as Bid,
					StatusCodes.INTERNAL_SERVER_ERROR,
				);
			}

			// 4. Anti-sniping check: block bids in the last N seconds before round ends
			const now = Date.now();
			const timeUntilEnd = state.round_end_ts - now;
			const antiSnipingMs = ANTI_SNIPING_SECONDS * 1000;

			if (timeUntilEnd < antiSnipingMs) {
				const secondsRemaining = Math.ceil(timeUntilEnd / 1000);
				logger.warn(
					{ userId, auctionId, roundNumber: state.round, timeUntilEnd, secondsRemaining },
					"Bid rejected: anti-sniping period active",
				);
				return ServiceResponse.failure(
					`Bids are not accepted in the last ${ANTI_SNIPING_SECONDS} seconds of the round. ${secondsRemaining > 0 ? `Round ends in ${secondsRemaining} second${secondsRemaining !== 1 ? 's' : ''}.` : 'Round has ended.'}`,
					null as unknown as Bid,
					StatusCodes.BAD_REQUEST,
				);
			}

			const roundNumber = state.round;
			const bidsKey = getRoundBidsKey(auctionId, roundNumber);

			// 5. Check if user has existing bid in this round
			// If yes, we need to unfreeze old amount and remove old bid
			const existingBid = await this.getUserBid(auctionId, userId, roundNumber);

			if (existingBid) {
				oldFrozenAmount = existingBid.amount;
				// Unfreeze old balance
				await walletService.unfreezeBalance(userId, oldFrozenAmount, auctionId);
				
				// Remove old bid from ZSET (find and remove all bids from this user in this round)
				const allBids = await redis.zrange(bidsKey, 0, -1, "WITHSCORES");
				for (let i = 0; i < allBids.length; i += 2) {
					const member = allBids[i] as string;
					const [bidUserId] = member.split(":");
					if (parseInt(bidUserId || "0", 10) === userId) {
						await redis.zrem(bidsKey, member);
					}
				}
			}

			// 6. Check available balance (considering old frozen amount that was just unfrozen)
			const availableBalance = await walletService.getAvailableBalance(userId);
			if (availableBalance < amount) {
				// If we unfroze old amount, we need to refreeze it
				if (oldFrozenAmount > 0) {
					await walletService.freezeBalance(userId, oldFrozenAmount, auctionId);
				}
				return ServiceResponse.failure(
					"Insufficient available balance",
					null as unknown as Bid,
					StatusCodes.BAD_REQUEST,
				);
			}

			// 7. Freeze new balance
			const frozen = await walletService.freezeBalance(userId, amount, auctionId);
			if (!frozen) {
				// If we unfroze old amount, we need to refreeze it
				if (oldFrozenAmount > 0) {
					await walletService.freezeBalance(userId, oldFrozenAmount, auctionId);
				}
				return ServiceResponse.failure(
					"Failed to freeze balance",
					null as unknown as Bid,
					StatusCodes.INTERNAL_SERVER_ERROR,
				);
			}

			// 8. Add new bid to Redis ZSET
			// Score: amount (for DESC sorting via ZREVRANGE)
			// Member: {userId}:{timestamp}:{amount} (for tie-breaking by timestamp ASC)
			const timestamp = Date.now();
			const member = `${userId}:${timestamp}:${amount}`;

			// ZREVRANGE sorts DESC by score, so we use positive amount
			await redis.zadd(bidsKey, amount, member);

			// 9. Add user to auction users set (if not already there)
			const usersKey = getAuctionUsersKey(auctionId);
			await redis.sadd(usersKey, userId.toString());

			const bid: Bid = {
				userId,
				auctionId,
				roundNumber,
				amount,
				timestamp,
			};

			// Calculate time remaining for logging
			const timeRemaining = state.round_end_ts - timestamp;
			const secondsRemaining = Math.ceil(timeRemaining / 1000);

			logger.info(
				{ 
					userId, 
					auctionId, 
					roundNumber, 
					amount,
					timeRemaining,
					secondsRemaining,
					antiSnipingActive: timeRemaining < antiSnipingMs
				},
				"Bid placed successfully",
			);

			// 10. Broadcast bid_placed event
			const wsServer = getAuctionWebSocketServer();
			if (wsServer) {
				const event: BidPlacedEvent = {
					type: "bid_placed",
					data: {
						auctionId,
						userId,
						amount,
						timestamp,
					},
				};
				wsServer.broadcastToAuction(auctionId, event);
			}

			return ServiceResponse.success("Bid placed successfully", bid, StatusCodes.CREATED);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to place bid";
			logger.error({ error, userId, auctionId, amount }, "Error placing bid");

			// Rollback: try to restore old frozen balance if we unfroze it
			try {
				if (oldFrozenAmount > 0) {
					await walletService.freezeBalance(userId, oldFrozenAmount, auctionId);
					logger.info({ userId, auctionId, oldFrozenAmount }, "Restored old frozen balance after error");
				}
			} catch (rollbackError) {
				logger.error({ rollbackError, userId, auctionId, oldFrozenAmount }, "Error restoring old frozen balance");
			}

			return ServiceResponse.failure(
				errorMessage,
				null as unknown as Bid,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	/**
	 * Check if user has placed a bid in auction
	 */
	async hasUserBid(auctionId: string, userId: number): Promise<boolean> {
		const redis = getRedisClient();
		const usersKey = getAuctionUsersKey(auctionId);
		const exists = await redis.sismember(usersKey, userId.toString());
		return exists === 1;
	}

	/**
	 * Get user's latest bid for a round
	 * Returns the most recent bid (highest timestamp) if user has multiple bids
	 */
	async getUserBid(auctionId: string, userId: number, roundNumber: number): Promise<Bid | null> {
		const redis = getRedisClient();
		const bidsKey = getRoundBidsKey(auctionId, roundNumber);

		// Get all bids and find user's bids
		const bids = await redis.zrange(bidsKey, 0, -1, "WITHSCORES");
		let latestBid: Bid | null = null;
		let latestTimestamp = 0;

		for (let i = 0; i < bids.length; i += 2) {
			const member = bids[i] as string;
			const [bidUserId, timestampStr, amountStr] = member.split(":");

			if (parseInt(bidUserId || "0", 10) === userId) {
				const timestamp = parseInt(timestampStr || "0", 10);
				// Keep the latest bid (highest timestamp)
				if (timestamp > latestTimestamp) {
					latestTimestamp = timestamp;
					latestBid = {
						userId,
						auctionId,
						roundNumber,
						amount: parseFloat(amountStr || "0"),
						timestamp,
					};
				}
			}
		}

		return latestBid;
	}

	/**
	 * Get all bids for a round (sorted by amount DESC, then timestamp ASC)
	 * Returns only the latest bid per user (if user has multiple bids, only the most recent one)
	 */
	async getRoundBids(auctionId: string, roundNumber: number): Promise<Bid[]> {
		const redis = getRedisClient();
		const bidsKey = getRoundBidsKey(auctionId, roundNumber);

		// Get all bids sorted by score DESC (amount)
		const bids = await redis.zrevrange(bidsKey, 0, -1, "WITHSCORES");

		// Map to store latest bid per user
		const userBidsMap = new Map<number, Bid>();

		for (let i = 0; i < bids.length; i += 2) {
			const member = bids[i] as string;
			const score = parseFloat(bids[i + 1] as string);

			const [userIdStr, timestampStr, amountStr] = member.split(":");
			const userId = parseInt(userIdStr || "0", 10);
			const timestamp = parseInt(timestampStr || "0", 10);
			const amount = parseFloat(amountStr || "0");

			if (userId && amount > 0) {
				const existingBid = userBidsMap.get(userId);
				// Keep only the latest bid (highest timestamp) for each user
				if (!existingBid || timestamp > existingBid.timestamp) {
					userBidsMap.set(userId, {
						userId,
						auctionId,
						roundNumber,
						amount,
						timestamp,
					});
				}
			}
		}

		// Convert map to array and sort: first by amount DESC, then by timestamp ASC (earlier wins)
		const parsedBids = Array.from(userBidsMap.values());
		parsedBids.sort((a, b) => {
			if (b.amount !== a.amount) {
				return b.amount - a.amount; // DESC by amount
			}
			return a.timestamp - b.timestamp; // ASC by timestamp (earlier is better)
		});

		return parsedBids;
	}
}

export const bidService = new BidService();


