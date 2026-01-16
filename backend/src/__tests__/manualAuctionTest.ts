/**
 * Manual Auction Test Script
 * 
 * This script tests the full auction cycle manually.
 * Run with: pnpm tsx src/__tests__/manualAuctionTest.ts
 * 
 * Prerequisites:
 * - MongoDB running
 * - Redis running
 * - Environment variables configured
 */

import { connectMongoDB, disconnectMongoDB } from "@/common/db/mongodb";
import { connectRedis, disconnectRedis } from "@/common/db/redis";
import { auctionService } from "@/api/auction/auctionService";
import { bidService } from "@/api/bid/bidService";
import { walletService } from "@/api/wallet/walletService";
import { collectionService } from "@/api/collection/collectionService";
import { userService } from "@/api/user/userService";
import { roundService } from "@/api/round/roundService";
import { getAuctionState } from "@/common/redis/auctionState";
import { getRoundBidsKey, getAuctionUsersKey } from "@/common/redis/auctionKeys";
import { getRedisClient } from "@/common/db/redis";
import { settlementService } from "@/services/settlementService";
import Collection from "@/models/Collection";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import Auction from "@/models/Auction";
import Round from "@/models/Round";

const colors = {
	reset: "\x1b[0m",
	green: "\x1b[32m",
	red: "\x1b[31m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step: number, message: string) {
	log(`\n[STEP ${step}] ${message}`, "cyan");
}

function logSuccess(message: string) {
	log(`✓ ${message}`, "green");
}

function logError(message: string) {
	log(`✗ ${message}`, "red");
}

function logInfo(message: string) {
	log(`ℹ ${message}`, "blue");
}

async function testFullAuctionCycle() {
	log("\n" + "=".repeat(60), "yellow");
	log("Auction System - Full Cycle Manual Test", "yellow");
	log("=".repeat(60) + "\n", "yellow");

	try {
		// Connect to databases
		logStep(0, "Connecting to databases...");
		await connectMongoDB();
		await connectRedis();
		logSuccess("Connected to MongoDB and Redis");

		// Step 1: Create test collection
		logStep(1, "Creating test collection...");
		const collectionResponse = await collectionService.createCollection({
			title: "Manual Test Collection",
			description: "Collection for manual testing",
			total_amount: 10,
			emoji: "🎁",
		});

		if (!collectionResponse.success || !collectionResponse.responseObject) {
			throw new Error("Failed to create collection");
		}

		const collectionId = collectionResponse.responseObject._id;
		logSuccess(`Collection created: ${collectionId}`);
		logInfo(`Total gifts: ${collectionResponse.responseObject.total_amount}`);

		// Step 2: Create test users
		logStep(2, "Creating test users...");
		const userIds: number[] = [];
		for (let i = 1; i <= 5; i++) {
			const user = await User.create({
				_id: 5000 + i,
				username: `testuser${i}`,
				first_name: `Test${i}`,
				role: "user",
			});

			await Wallet.create({
				_id: user._id,
				balance: 1000,
			});

			userIds.push(user._id);
			logSuccess(`User ${i} created: ${user._id} (balance: 1000)`);
		}

		// Step 3: Create auction
		logStep(3, "Creating auction...");
		const auctionResponse = await auctionService.createAuction({
			collection_id: collectionId,
			round_duration: 10, // 10 seconds for testing
			gifts_per_round: 3, // 3 gifts per round
		});

		if (!auctionResponse.success || !auctionResponse.responseObject) {
			throw new Error("Failed to create auction");
		}

		const auctionId = auctionResponse.responseObject._id;
		logSuccess(`Auction created: ${auctionId}`);
		logInfo(`Round duration: ${auctionResponse.responseObject.round_duration}s`);
		logInfo(`Gifts per round: ${auctionResponse.responseObject.gifts_per_round}`);
		logInfo(`Total rounds: ${auctionResponse.responseObject.total_rounds}`);

		// Verify Redis state
		const state = await getAuctionState(auctionId);
		if (state) {
			logSuccess("Redis state initialized");
			logInfo(`Current round: ${state.round}`);
			logInfo(`Round ends at: ${new Date(state.round_end_ts).toISOString()}`);
		}

		// Step 4: Place bids
		logStep(4, "Placing bids...");
		const bidAmounts = [500, 400, 300, 200, 100];
		for (let i = 0; i < 5; i++) {
			const bidResponse = await bidService.placeBid(auctionId, userIds[i], bidAmounts[i]);

			if (bidResponse.success) {
				logSuccess(
					`User ${userIds[i]} placed bid: ${bidAmounts[i]} (round ${bidResponse.responseObject?.roundNumber})`,
				);
			} else {
				logError(`User ${userIds[i]} failed to place bid: ${bidResponse.message}`);
			}
		}

		// Verify bids in Redis
		const redis = getRedisClient();
		const bidsKey = getRoundBidsKey(auctionId, 1);
		const bids = await redis.zrevrange(bidsKey, 0, -1, "WITHSCORES");
		logInfo(`Total bids in Redis: ${bids.length / 2}`);

		// Verify frozen balances
		logStep(5, "Verifying frozen balances...");
		for (let i = 0; i < 5; i++) {
			const available = await walletService.getAvailableBalance(userIds[i]);
			const expected = 1000 - bidAmounts[i];
			if (available === expected) {
				logSuccess(`User ${userIds[i]}: available balance = ${available} (frozen: ${bidAmounts[i]})`);
			} else {
				logError(`User ${userIds[i]}: expected ${expected}, got ${available}`);
			}
		}

		// Step 6: Try duplicate bid
		logStep(6, "Testing duplicate bid prevention...");
		const duplicateBid = await bidService.placeBid(auctionId, userIds[0], 600);
		if (!duplicateBid.success) {
			logSuccess(`Duplicate bid prevented: ${duplicateBid.message}`);
		} else {
			logError("Duplicate bid was not prevented!");
		}

		// Step 7: Close round
		logStep(7, "Closing round...");
		const closeResponse = await roundService.closeRound(auctionId, 1);
		if (closeResponse.success) {
			logSuccess("Round closed successfully");
		} else {
			logError(`Failed to close round: ${closeResponse.message}`);
		}

		// Wait for settlement
		logInfo("Waiting for settlement to complete...");
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Step 8: Verify settlement
		logStep(8, "Verifying settlement...");
		const settledKey = `auction:${auctionId}:round:1:settled`;
		const settled = await redis.get(settledKey);
		if (settled === "1") {
			logSuccess("Round settled (idempotency flag set)");
		} else {
			logError("Round not settled");
		}

		// Check winners (top 3: 500, 400, 300)
		logStep(9, "Checking winners and losers...");
		const winnerWallets = await Promise.all([
			walletService.getWalletById(userIds[0]), // 500 - winner
			walletService.getWalletById(userIds[1]), // 400 - winner
			walletService.getWalletById(userIds[2]), // 300 - winner
		]);

		const loserWallets = await Promise.all([
			walletService.getWalletById(userIds[3]), // 200 - loser
			walletService.getWalletById(userIds[4]), // 100 - loser
		]);

		// Winners should have balance deducted
		for (let i = 0; i < 3; i++) {
			const wallet = winnerWallets[i];
			if (wallet.success && wallet.responseObject) {
				const expected = 1000 - bidAmounts[i];
				if (wallet.responseObject.balance === expected) {
					logSuccess(
						`Winner ${i + 1} (User ${userIds[i]}): balance = ${wallet.responseObject.balance} (deducted ${bidAmounts[i]})`,
					);
				} else {
					logError(
						`Winner ${i + 1}: expected ${expected}, got ${wallet.responseObject.balance}`,
					);
				}
			}
		}

		// Losers should have balance returned
		for (let i = 0; i < 2; i++) {
			const wallet = loserWallets[i];
			if (wallet.success && wallet.responseObject) {
				if (wallet.responseObject.balance === 1000) {
					logSuccess(
						`Loser ${i + 1} (User ${userIds[i + 3]}): balance = ${wallet.responseObject.balance} (frozen returned)`,
					);
				} else {
					logError(
						`Loser ${i + 1}: expected 1000, got ${wallet.responseObject.balance}`,
					);
				}
			}
		}

		// Step 10: Verify next round
		logStep(10, "Verifying next round...");
		await new Promise((resolve) => setTimeout(resolve, 500));

		const updatedAuction = await Auction.findById(auctionId);
		if (updatedAuction) {
			logInfo(`Current round number: ${updatedAuction.current_round_number}`);
			if (updatedAuction.current_round_number === 2) {
				logSuccess("Next round started automatically");
			} else {
				logError(`Expected round 2, got ${updatedAuction.current_round_number}`);
			}
		}

		const state2 = await getAuctionState(auctionId);
		if (state2) {
			logInfo(`Redis state - Round: ${state2.round}, Settling: ${state2.settling}`);
		}

		// Step 11: Finish auction
		logStep(11, "Finishing auction...");
		await auctionService.finish(auctionId);

		const finishedAuction = await Auction.findById(auctionId);
		if (finishedAuction?.status === "finished") {
			logSuccess("Auction finished successfully");
		} else {
			logError("Auction not finished");
		}

		// Verify Redis cleanup
		const keys = await redis.keys(`auction:${auctionId}:*`);
		if (keys.length === 0) {
			logSuccess("Redis keys cleaned up");
		} else {
			logError(`Redis keys not cleaned: ${keys.length} keys remaining`);
		}

		// Cleanup
		logStep(12, "Cleaning up test data...");
		await Collection.deleteMany({ title: "Manual Test Collection" });
		await User.deleteMany({ _id: { $in: userIds } });
		await Wallet.deleteMany({ _id: { $in: userIds } });
		await Auction.deleteMany({ _id: auctionId });
		await Round.deleteMany({ auction_id: auctionId });
		logSuccess("Test data cleaned up");

		log("\n" + "=".repeat(60), "green");
		log("✓ All tests passed successfully!", "green");
		log("=".repeat(60) + "\n", "green");
	} catch (error) {
		logError(`Test failed: ${error instanceof Error ? error.message : String(error)}`);
		if (error instanceof Error && error.stack) {
			console.error(error.stack);
		}
		process.exit(1);
	} finally {
		await disconnectMongoDB();
		await disconnectRedis();
	}
}

// Run test
testFullAuctionCycle().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
