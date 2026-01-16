import { pino } from "pino";
import { auctionService } from "@/api/auction/auctionService";
import { roundService } from "@/api/round/roundService";
import { getRedisClient } from "@/common/db/redis";
import { getAuctionUsersKey, getFrozenBalanceKey, getRoundBidsKey } from "@/common/redis/auctionKeys";
import { initializeAuctionState } from "@/common/redis/auctionState";

const logger = pino({ name: "recoveryService" });

export class RecoveryService {
	/**
	 * Recover active auctions from MongoDB and rebuild Redis state
	 */
	async recoverActiveAuctions(): Promise<void> {
		try {
			logger.info("Starting recovery of active auctions");

			const activeAuctionsResponse = await auctionService.getAuctions({ status: "active" });
			if (!activeAuctionsResponse.success || !activeAuctionsResponse.responseObject) {
				logger.info("No active auctions to recover");
				return;
			}

			const activeAuctions = activeAuctionsResponse.responseObject;

			for (const auction of activeAuctions) {
				try {
					await this.recoverAuction(auction._id);
				} catch (error) {
					logger.error({ error, auctionId: auction._id }, "Error recovering auction");
				}
			}

			logger.info({ count: activeAuctions.length }, "Recovery completed");
		} catch (error) {
			logger.error({ error }, "Error during recovery");
			throw error;
		}
	}

	/**
	 * Recover a single auction
	 */
	private async recoverAuction(auctionId: string): Promise<void> {
		const _redis = getRedisClient();

		try {
			// Get auction from MongoDB
			const auctionResponse = await auctionService.getAuctionById(auctionId);
			if (!auctionResponse.success || !auctionResponse.responseObject) {
				logger.warn({ auctionId }, "Auction not found in MongoDB, skipping recovery");
				return;
			}

			const auction = auctionResponse.responseObject;

			// Get current round
			const currentRoundResponse = await roundService.getCurrentRound(auctionId);
			if (!currentRoundResponse.success || !currentRoundResponse.responseObject) {
				logger.warn({ auctionId }, "Current round not found, initializing new state");
				// Initialize state for round 1
				await initializeAuctionState(auctionId, auction.current_round_number, auction.round_duration);
				return;
			}

			const currentRound = currentRoundResponse.responseObject;
			const roundNumber = currentRound.round_number;

			// Calculate round end timestamp
			const roundStartTime = currentRound.started_at.getTime();
			const roundEndTs = roundStartTime + auction.round_duration * 1000;
			const now = Date.now();

			// If round hasn't expired, restore state and timer
			if (roundEndTs > now) {
				// Initialize Redis state
				await initializeAuctionState(auctionId, roundNumber, auction.round_duration);

				// Rebuild frozen balances from bids in Redis (if they exist)
				await this.rebuildFrozenBalances(auctionId, roundNumber);

				logger.info({ auctionId, roundNumber, roundEndTs, now }, "Auction state recovered");
			} else {
				// Round has expired, but state might not be settled
				// Check if round is already settled
				const { getRoundSettledKey } = await import("@/common/redis/auctionKeys");
				const { getRedisClient } = await import("@/common/db/redis");
				const redis = getRedisClient();
				const settledKey = getRoundSettledKey(auctionId, roundNumber);
				const isSettled = await redis.get(settledKey);

				if (!isSettled) {
					// Round expired but not settled - trigger settlement
					logger.info({ auctionId, roundNumber }, "Round expired but not settled, triggering settlement");
					const { settlementService } = await import("@/services/settlementService");
					// Trigger settlement asynchronously
					settlementService.settleRound(auctionId, roundNumber).catch((error) => {
						logger.error({ error, auctionId, roundNumber }, "Error settling expired round during recovery");
					});
				} else {
					logger.info(
						{ auctionId, roundNumber },
						"Round expired and already settled, initializing state for next round",
					);
					// Round is settled, initialize state for current round (nextRound will handle transition)
					await initializeAuctionState(auctionId, roundNumber, auction.round_duration);
				}
			}
		} catch (error) {
			logger.error({ error, auctionId }, "Error recovering auction");
			throw error;
		}
	}

	/**
	 * Rebuild frozen balances from bids stored in Redis
	 * According to TZ: one bid per user per auction, bids are copied to each round
	 * We restore bids from current round, and ensure all users in SET have bids
	 */
	private async rebuildFrozenBalances(auctionId: string, roundNumber: number): Promise<void> {
		const redis = getRedisClient();
		const bidsKey = getRoundBidsKey(auctionId, roundNumber);
		const usersKey = getAuctionUsersKey(auctionId);

		try {
			// Get all users who have placed bids in this auction
			const userIds = await redis.smembers(usersKey);

			if (userIds.length === 0) {
				logger.info({ auctionId, roundNumber }, "No users found in auction users set, skipping frozen balance rebuild");
				return;
			}

			// Get all bids from current round
			const bids = await redis.zrange(bidsKey, 0, -1, "WITHSCORES");

			// Map to track which users have bids in current round
			const usersWithBids = new Set<number>();

			// Process bids from current round
			for (let i = 0; i < bids.length; i += 2) {
				const member = bids[i] as string;
				const [userIdStr, , amountStr] = member.split(":");
				const userId = parseInt(userIdStr || "0", 10);
				const amount = parseFloat(amountStr || "0");

				if (userId && amount > 0) {
					usersWithBids.add(userId);
					// Restore frozen balance
					const frozenKey = getFrozenBalanceKey(userId, auctionId);
					await redis.set(frozenKey, amount.toString());
				}
			}

			// Check if any users from SET don't have bids in current round
			// This can happen if server crashed before bids were copied to new round
			// Try to find bids in previous rounds
			const missingUsers: number[] = [];
			for (const userIdStr of userIds) {
				const userId = parseInt(userIdStr, 10);
				if (!usersWithBids.has(userId)) {
					missingUsers.push(userId);

					// Try to find bid in previous rounds (starting from current round - 1, going backwards)
					let foundBid = false;
					for (let prevRound = roundNumber - 1; prevRound >= 1 && !foundBid; prevRound--) {
						const prevBidsKey = getRoundBidsKey(auctionId, prevRound);
						const prevBids = await redis.zrange(prevBidsKey, 0, -1, "WITHSCORES");

						// Find user's bid in previous round
						for (let j = 0; j < prevBids.length; j += 2) {
							const member = prevBids[j] as string;
							const [bidUserIdStr, , amountStr] = member.split(":");
							const bidUserId = parseInt(bidUserIdStr || "0", 10);

							if (bidUserId === userId) {
								const amount = parseFloat(amountStr || "0");
								if (amount > 0) {
									// Copy bid to current round
									await redis.zadd(bidsKey, amount, member);
									// Restore frozen balance
									const frozenKey = getFrozenBalanceKey(userId, auctionId);
									await redis.set(frozenKey, amount.toString());
									usersWithBids.add(userId);
									foundBid = true;
									logger.info(
										{ auctionId, userId, fromRound: prevRound, toRound: roundNumber, amount },
										"Recovered bid from previous round",
									);
									break;
								}
							}
						}
					}

					if (!foundBid) {
						logger.warn({ auctionId, userId, roundNumber }, "User in auction users set but no bid found in any round");
					}
				}
			}

			const totalBids = await redis.zcard(bidsKey);
			logger.info(
				{
					auctionId,
					roundNumber,
					usersInSet: userIds.length,
					bidsInRound: totalBids,
					missingUsersRecovered: missingUsers.length - (userIds.length - usersWithBids.size),
				},
				"Frozen balances rebuilt",
			);
		} catch (error) {
			logger.error({ error, auctionId, roundNumber }, "Error rebuilding frozen balances");
		}
	}
}

export const recoveryService = new RecoveryService();
