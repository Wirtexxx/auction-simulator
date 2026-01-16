import { pino } from "pino";
import { getRedisClient } from "@/common/db/redis";
import {
	getRoundBidsKey,
	getRoundSettledKey,
} from "@/common/redis/auctionKeys";
import { updateAuctionState } from "@/common/redis/auctionState";
import { walletService } from "@/api/wallet/walletService";
import { getAuctionWebSocketServer } from "@/websocket/auctionWebSocket";
import type { RoundSettledEvent } from "@/websocket/types";

const logger = pino({ name: "settlementService" });

interface Winner {
	userId: number;
	amount: number;
	timestamp: number;
}

export class SettlementService {
	/**
	 * Settle a round: determine winners, process payments
	 */
	async settleRound(auctionId: string, roundNumber: number): Promise<void> {
		const redis = getRedisClient();
		const settledKey = getRoundSettledKey(auctionId, roundNumber);

		try {
			// 1. Check idempotency: if already settled, skip
			const alreadySettled = await redis.get(settledKey);
			if (alreadySettled) {
				logger.info(
					{ auctionId, roundNumber },
					"Round already settled, skipping",
				);
				return;
			}

			logger.info({ auctionId, roundNumber }, "Starting round settlement");

			// 2. Get auction to determine gifts_per_round
			const { auctionService } = await import("@/api/auction/auctionService");
			const auctionResponse = await auctionService.getAuctionById(auctionId);
			if (!auctionResponse.success || !auctionResponse.responseObject) {
				logger.error({ auctionId }, "Auction not found for settlement");
				return;
			}

			const auction = auctionResponse.responseObject;
			
			// Get the actual round to determine how many gifts are in this round
			const { roundService } = await import("@/api/round/roundService");
			const roundResponse = await roundService.getRoundByAuctionAndNumber(auctionId, roundNumber);
			if (!roundResponse.success || !roundResponse.responseObject) {
				logger.error({ auctionId, roundNumber }, "Round not found for settlement");
				return;
			}
			const round = roundResponse.responseObject;
			// Use actual number of gifts in the round (may be more than gifts_per_round if unsold gifts were carried over)
			const giftsInRound = round.gift_ids.length;
			const giftsPerRound = auction.gifts_per_round; // Keep for logging

			logger.info(
				{ auctionId, roundNumber, giftsInRound, giftsPerRound },
				"Using actual gifts count from round (may include unsold from previous round)",
			);

			// 3. Get all bids from Redis ZSET
			const bidsKey = getRoundBidsKey(auctionId, roundNumber);
			const bids = await redis.zrevrange(bidsKey, 0, -1, "WITHSCORES");

			if (bids.length === 0) {
				logger.info({ auctionId, roundNumber }, "No bids in round, skipping settlement");
				// Mark as settled anyway
				await redis.set(settledKey, "1");
				await this.cleanupRound(auctionId, roundNumber);
				
				// Clear settling flag before moving to next round
				await updateAuctionState(auctionId, { settling: false });
				
				// Move to next round (all gifts from this round will be unsold and transferred)
				try {
					const { auctionService } = await import("@/api/auction/auctionService");
					await auctionService.nextRound(auctionId);
					logger.info({ auctionId, roundNumber }, "Moved to next round after empty settlement");
				} catch (error) {
					logger.error({ error, auctionId, roundNumber }, "Error moving to next round after empty settlement");
					// Don't throw - settlement is complete
				}
				return;
			}

			// 4. Parse bids and keep only the latest bid per user
			// Map to store latest bid per user (highest timestamp)
			const userBidsMap = new Map<number, Winner>();

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

			// 5. Determine winners (top N based on actual gifts in round)
			const winners = parsedBids.slice(0, giftsInRound);
			const losers = parsedBids.slice(giftsInRound);

			logger.info(
				{
					auctionId,
					roundNumber,
					totalBids: parsedBids.length,
					winners: winners.length,
					losers: losers.length,
				},
				"Winners and losers determined",
			);

			// 6. Process financial transactions
			await this.processWinners(auctionId, roundNumber, winners);
			await this.processLosers(auctionId, losers);

			// 7. Mark as settled (idempotency)
			await redis.set(settledKey, "1");

			// 8. Broadcast settlement event
			const wsServer = getAuctionWebSocketServer();
			if (wsServer) {
				const event: RoundSettledEvent = {
					type: "round_settled",
					data: {
						auctionId,
						roundNumber,
						winners: winners.map((w) => ({
							userId: w.userId,
							amount: w.amount,
						})),
					},
				};
				wsServer.broadcastToAuction(auctionId, event);
			}

			// 9. Cleanup and move to next round
			await this.cleanupRound(auctionId, roundNumber);
			
			// Clear settling flag before moving to next round
			await updateAuctionState(auctionId, { settling: false });
			
			// Move to next round (or finish auction)
			try {
				logger.info({ auctionId, roundNumber }, "Calling nextRound after settlement");
				await auctionService.nextRound(auctionId);
				logger.info({ auctionId, roundNumber }, "Round settlement completed and moved to next round");
			} catch (error) {
				logger.error({ 
					error, 
					auctionId, 
					roundNumber,
					errorMessage: error instanceof Error ? error.message : String(error),
					errorStack: error instanceof Error ? error.stack : undefined
				}, "Error moving to next round after settlement - this is critical, auction may be stuck");
				// Don't throw - settlement is complete, but log the error for investigation
				// The auction state might be inconsistent, but we don't want to fail the entire settlement
			}

			logger.info({ auctionId, roundNumber }, "Round settlement completed");
		} catch (error) {
			logger.error({ error, auctionId, roundNumber }, "Error during settlement");
			throw error;
		}
	}

	/**
	 * Process winners: deduct balance and assign gifts
	 */
	private async processWinners(auctionId: string, roundNumber: number, winners: Winner[]): Promise<void> {
		// Get round by number (not by status, as it may be finished)
		const { roundService } = await import("@/api/round/roundService");
		const roundResponse = await roundService.getRoundByAuctionAndNumber(auctionId, roundNumber);
		
		if (!roundResponse.success || !roundResponse.responseObject) {
			logger.error({ auctionId, roundNumber }, "Failed to get round for gift assignment");
			return;
		}

		const round = roundResponse.responseObject;
		const giftIds = round.gift_ids || [];

		if (giftIds.length < winners.length) {
			logger.warn(
				{ auctionId, roundNumber, giftCount: giftIds.length, winnerCount: winners.length },
				"Not enough gifts for all winners",
			);
		}

		logger.info(
			{ auctionId, roundNumber, winnersCount: winners.length, giftsCount: giftIds.length },
			"Processing winners and assigning gifts",
		);

		// Get ownership service
		const { ownershipService } = await import("@/api/ownership/ownershipService");

		for (let i = 0; i < winners.length; i++) {
			const winner = winners[i];
			const giftId = giftIds[i];

			if (!giftId) {
				logger.error(
					{ userId: winner.userId, auctionId, roundNumber, index: i, winnersCount: winners.length, giftsCount: giftIds.length },
					"No gift available for winner",
				);
				continue;
			}

			logger.info(
				{ userId: winner.userId, giftId, amount: winner.amount, auctionId, roundNumber, index: i },
				"Processing winner",
			);

			try {
				// 1. Deduct balance
				const success = await walletService.deductBalance(
					winner.userId,
					winner.amount,
					auctionId,
				);

				if (!success) {
					logger.error(
						{ userId: winner.userId, amount: winner.amount, auctionId },
						"Failed to deduct winner balance, skipping gift assignment",
					);
					continue;
				}

				logger.info(
					{ userId: winner.userId, amount: winner.amount, auctionId },
					"Winner balance deducted successfully",
				);

				// 2. Create ownership
				const ownershipResponse = await ownershipService.createOwnership({
					owner_id: winner.userId,
					gift_id: giftId,
					acquired_price: winner.amount,
				});

				if (ownershipResponse.success) {
					logger.info(
						{ userId: winner.userId, giftId, amount: winner.amount, auctionId, roundNumber },
						"Gift ownership created successfully for winner",
					);
				} else {
					logger.error(
						{ userId: winner.userId, giftId, amount: winner.amount, auctionId, roundNumber, error: ownershipResponse.message },
						"Failed to create gift ownership for winner",
					);
				}
			} catch (error) {
				logger.error(
					{ error, userId: winner.userId, giftId, amount: winner.amount, auctionId },
					"Error processing winner",
				);
			}
		}
	}

	/**
	 * Process losers: unfreeze balance (return frozen funds)
	 */
	private async processLosers(auctionId: string, losers: Winner[]): Promise<void> {
		for (const loser of losers) {
			try {
				await walletService.unfreezeBalance(loser.userId, loser.amount, auctionId);

				logger.info(
					{ userId: loser.userId, amount: loser.amount, auctionId },
					"Loser balance unfrozen",
				);
			} catch (error) {
				logger.error(
					{ error, userId: loser.userId, amount: loser.amount, auctionId },
					"Error unfreezing loser balance",
				);
			}
		}
	}

	/**
	 * Cleanup Redis after settlement
	 */
	private async cleanupRound(auctionId: string, roundNumber: number): Promise<void> {
		const redis = getRedisClient();
		const bidsKey = getRoundBidsKey(auctionId, roundNumber);

		try {
			// Delete bids ZSET
			await redis.del(bidsKey);

			logger.info({ auctionId, roundNumber }, "Round bids cleaned up");
		} catch (error) {
			logger.error({ error, auctionId, roundNumber }, "Error cleaning up round");
		}
	}

}

export const settlementService = new SettlementService();

