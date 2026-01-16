import { pino } from "pino";
import { auctionService } from "@/api/auction/auctionService";
import { roundService } from "@/api/round/roundService";
import { initializeAuctionState, addRoundTimer } from "@/common/redis/auctionState";
import { getRoundBidsKey, getAuctionUsersKey, getFrozenBalanceKey } from "@/common/redis/auctionKeys";
import { getRedisClient } from "@/common/db/redis";
import { bidService } from "@/api/bid/bidService";
import { walletService } from "@/api/wallet/walletService";

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
		const redis = getRedisClient();

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

				logger.info(
					{ auctionId, roundNumber, roundEndTs, now },
					"Auction state recovered",
				);
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
					logger.info(
						{ auctionId, roundNumber },
						"Round expired but not settled, triggering settlement",
					);
					const { settlementService } = await import("@/services/settlementService");
					// Trigger settlement asynchronously
					settlementService.settleRound(auctionId, roundNumber).catch((error) => {
						logger.error(
							{ error, auctionId, roundNumber },
							"Error settling expired round during recovery",
						);
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
	 * This is needed because frozen balances are stored per auction
	 */
	private async rebuildFrozenBalances(auctionId: string, roundNumber: number): Promise<void> {
		const redis = getRedisClient();
		const bidsKey = getRoundBidsKey(auctionId, roundNumber);

		try {
			// Get all bids from Redis
			const bids = await redis.zrange(bidsKey, 0, -1, "WITHSCORES");

			for (let i = 0; i < bids.length; i += 2) {
				const member = bids[i] as string;
				const [userIdStr, , amountStr] = member.split(":");
				const userId = parseInt(userIdStr || "0", 10);
				const amount = parseFloat(amountStr || "0");

				if (userId && amount > 0) {
					// Restore frozen balance
					const frozenKey = getFrozenBalanceKey(userId, auctionId);
					await redis.set(frozenKey, amount.toString());

					// Add user to auction users set
					const usersKey = getAuctionUsersKey(auctionId);
					await redis.sadd(usersKey, userId.toString());
				}
			}

			logger.info({ auctionId, roundNumber, bidCount: bids.length / 2 }, "Frozen balances rebuilt");
		} catch (error) {
			logger.error({ error, auctionId, roundNumber }, "Error rebuilding frozen balances");
		}
	}
}

export const recoveryService = new RecoveryService();


