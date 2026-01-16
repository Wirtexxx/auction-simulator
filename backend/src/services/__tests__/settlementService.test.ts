import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { auctionService } from "@/api/auction/auctionService";
import { bidService } from "@/api/bid/bidService";
import { collectionService } from "@/api/collection/collectionService";
import { walletService } from "@/api/wallet/walletService";
import { connectMongoDB, disconnectMongoDB } from "@/common/db/mongodb";
import { connectRedis, disconnectRedis, getRedisClient } from "@/common/db/redis";
import { getRoundBidsKey, getRoundSettledKey } from "@/common/redis/auctionKeys";
import Auction from "@/models/Auction";
import Collection from "@/models/Collection";
import Round from "@/models/Round";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import { settlementService } from "../settlementService";

describe("SettlementService Tests", () => {
	let testCollectionId: string;
	const testUserIds: number[] = [];
	let testAuctionId: string;
	let redis: ReturnType<typeof getRedisClient>;

	beforeAll(async () => {
		await connectMongoDB();
		await connectRedis();
		redis = getRedisClient();

		// Create test collection
		const collectionResponse = await collectionService.createCollection({
			title: "Test Settlement Collection",
			total_amount: 10,
			emoji: "🎁",
		});

		if (collectionResponse.success && collectionResponse.responseObject) {
			testCollectionId = collectionResponse.responseObject._id;
		}

		// Create test users
		for (let i = 1; i <= 5; i++) {
			const user = await User.create({
				_id: 2000 + i,
				username: `settleuser${i}`,
				first_name: `Settle${i}`,
				role: "user",
			});

			testUserIds.push(user._id);

			await Wallet.create({
				_id: user._id,
				balance: 1000,
			});
		}
	});

	afterAll(async () => {
		await Collection.deleteMany({ title: "Test Settlement Collection" });
		await User.deleteMany({ _id: { $in: testUserIds } });
		await Wallet.deleteMany({ _id: { $in: testUserIds } });
		await Auction.deleteMany({});
		await Round.deleteMany({});

		const keys = await redis.keys("*");
		if (keys.length > 0) await redis.del(...keys);

		await disconnectMongoDB();
		await disconnectRedis();
	});

	beforeEach(async () => {
		const keys = await redis.keys("*");
		if (keys.length > 0) await redis.del(...keys);

		await Auction.deleteMany({});
		await Round.deleteMany({});
	});

	it("should settle round and determine winners correctly", async () => {
		// Create auction
		const auctionResponse = await auctionService.createAuction({
			collection_id: testCollectionId,
			round_duration: 60,
			gifts_per_round: 3, // Top 3 winners
		});

		expect(auctionResponse.success).toBe(true);
		if (!auctionResponse.responseObject) return;

		testAuctionId = auctionResponse.responseObject._id;

		// Place bids: 500, 400, 300, 200, 100
		const amounts = [500, 400, 300, 200, 100];
		for (let i = 0; i < 5; i++) {
			await bidService.placeBid(testAuctionId, testUserIds[i], amounts[i]);
		}

		// Settle round
		await settlementService.settleRound(testAuctionId, 1);

		// Verify settled flag
		const settledKey = getRoundSettledKey(testAuctionId, 1);
		const settled = await redis.get(settledKey);
		expect(settled).toBe("1");

		// Verify winners (top 3: 500, 400, 300) had balance deducted
		const winner1Wallet = await walletService.getWalletById(testUserIds[0]);
		const winner2Wallet = await walletService.getWalletById(testUserIds[1]);
		const winner3Wallet = await walletService.getWalletById(testUserIds[2]);

		if (winner1Wallet.success && winner1Wallet.responseObject) {
			expect(winner1Wallet.responseObject.balance).toBe(500); // 1000 - 500
		}

		if (winner2Wallet.success && winner2Wallet.responseObject) {
			expect(winner2Wallet.responseObject.balance).toBe(600); // 1000 - 400
		}

		if (winner3Wallet.success && winner3Wallet.responseObject) {
			expect(winner3Wallet.responseObject.balance).toBe(700); // 1000 - 300
		}

		// Verify losers (200, 100) had balance returned
		const loser1Wallet = await walletService.getWalletById(testUserIds[3]);
		const loser2Wallet = await walletService.getWalletById(testUserIds[4]);

		if (loser1Wallet.success && loser1Wallet.responseObject) {
			expect(loser1Wallet.responseObject.balance).toBe(1000); // Frozen returned
		}

		if (loser2Wallet.success && loser2Wallet.responseObject) {
			expect(loser2Wallet.responseObject.balance).toBe(1000); // Frozen returned
		}

		// Verify bids cleaned up
		const bidsKey = getRoundBidsKey(testAuctionId, 1);
		const bids = await redis.zrange(bidsKey, 0, -1);
		expect(bids.length).toBe(0);
	});

	it("should be idempotent (not settle twice)", async () => {
		// Create auction
		const auctionResponse = await auctionService.createAuction({
			collection_id: testCollectionId,
			round_duration: 60,
			gifts_per_round: 2,
		});

		if (!auctionResponse.responseObject) return;
		const auctionId = auctionResponse.responseObject._id;

		// Place bids
		await bidService.placeBid(auctionId, testUserIds[0], 100);
		await bidService.placeBid(auctionId, testUserIds[1], 200);

		// Get initial balance
		const initialBalance = await walletService.getWalletById(testUserIds[0]);
		const initialBalance1 =
			initialBalance.success && initialBalance.responseObject ? initialBalance.responseObject.balance : 0;

		// Settle first time
		await settlementService.settleRound(auctionId, 1);

		// Settle second time (should be skipped)
		await settlementService.settleRound(auctionId, 1);

		// Verify balance didn't change twice
		const finalBalance = await walletService.getWalletById(testUserIds[0]);
		const finalBalance1 = finalBalance.success && finalBalance.responseObject ? finalBalance.responseObject.balance : 0;

		// Balance should be deducted only once
		expect(finalBalance1).toBe(initialBalance1 - 100);
	});

	it("should handle empty bids (no bids in round)", async () => {
		// Create auction
		const auctionResponse = await auctionService.createAuction({
			collection_id: testCollectionId,
			round_duration: 60,
			gifts_per_round: 2,
		});

		if (!auctionResponse.responseObject) return;
		const auctionId = auctionResponse.responseObject._id;

		// Settle without bids
		await settlementService.settleRound(auctionId, 1);

		// Verify settled flag set
		const settledKey = getRoundSettledKey(auctionId, 1);
		const settled = await redis.get(settledKey);
		expect(settled).toBe("1");
	});
});
