import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { auctionService } from "@/api/auction/auctionService";
import { collectionService } from "@/api/collection/collectionService";
import { walletService } from "@/api/wallet/walletService";
import { connectMongoDB, disconnectMongoDB } from "@/common/db/mongodb";
import { connectRedis, disconnectRedis, getRedisClient } from "@/common/db/redis";
import { getAuctionUsersKey, getFrozenBalanceKey, getRoundBidsKey } from "@/common/redis/auctionKeys";
import Auction from "@/models/Auction";
import Collection from "@/models/Collection";
import Round from "@/models/Round";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import { bidService } from "../bidService";

describe("BidService Tests", () => {
	let testCollectionId: string;
	let testUserId: number;
	let testAuctionId: string;
	let redis: ReturnType<typeof getRedisClient>;

	beforeAll(async () => {
		await connectMongoDB();
		await connectRedis();
		redis = getRedisClient();

		// Create test collection
		const collectionResponse = await collectionService.createCollection({
			title: "Test Collection",
			total_amount: 5,
			emoji: "🎁",
		});

		if (collectionResponse.success && collectionResponse.responseObject) {
			testCollectionId = collectionResponse.responseObject._id;
		}

		// Create test user
		const user = await User.create({
			_id: 9999,
			username: "testuser",
			first_name: "Test",
			role: "user",
		});

		testUserId = user._id;

		// Create wallet
		await Wallet.create({
			_id: testUserId,
			balance: 1000,
		});
	});

	afterAll(async () => {
		await Collection.deleteMany({ title: "Test Collection" });
		await User.deleteMany({ _id: testUserId });
		await Wallet.deleteMany({ _id: testUserId });
		await Auction.deleteMany({});
		await Round.deleteMany({});

		const keys = await redis.keys("*");
		if (keys.length > 0) await redis.del(...keys);

		await disconnectMongoDB();
		await disconnectRedis();
	});

	beforeEach(async () => {
		// Clean Redis
		const keys = await redis.keys("*");
		if (keys.length > 0) await redis.del(...keys);

		// Clean MongoDB
		await Auction.deleteMany({});
		await Round.deleteMany({});
	});

	it("should place bid successfully", async () => {
		// Create auction
		const auctionResponse = await auctionService.createAuction({
			collection_id: testCollectionId,
			round_duration: 60,
			gifts_per_round: 2,
		});

		expect(auctionResponse.success).toBe(true);
		if (!auctionResponse.responseObject) return;

		testAuctionId = auctionResponse.responseObject._id;

		// Place bid
		const bidResponse = await bidService.placeBid(testAuctionId, testUserId, 100);

		expect(bidResponse.success).toBe(true);
		expect(bidResponse.responseObject).toBeDefined();
		if (!bidResponse.responseObject) return;

		expect(bidResponse.responseObject.userId).toBe(testUserId);
		expect(bidResponse.responseObject.amount).toBe(100);
		expect(bidResponse.responseObject.roundNumber).toBe(1);

		// Verify in Redis
		const usersKey = getAuctionUsersKey(testAuctionId);
		const users = await redis.smembers(usersKey);
		expect(users).toContain(testUserId.toString());

		const bidsKey = getRoundBidsKey(testAuctionId, 1);
		const bids = await redis.zrevrange(bidsKey, 0, -1);
		expect(bids.length).toBeGreaterThan(0);

		const frozenKey = getFrozenBalanceKey(testUserId, testAuctionId);
		const frozen = await redis.get(frozenKey);
		expect(frozen).toBe("100");

		// Verify available balance
		const available = await walletService.getAvailableBalance(testUserId);
		expect(available).toBe(900); // 1000 - 100
	});

	it("should prevent duplicate bids", async () => {
		// Create auction
		const auctionResponse = await auctionService.createAuction({
			collection_id: testCollectionId,
			round_duration: 60,
			gifts_per_round: 2,
		});

		if (!auctionResponse.responseObject) return;
		const auctionId = auctionResponse.responseObject._id;

		// Place first bid
		const bid1 = await bidService.placeBid(auctionId, testUserId, 100);
		expect(bid1.success).toBe(true);

		// Try to place second bid
		const bid2 = await bidService.placeBid(auctionId, testUserId, 200);
		expect(bid2.success).toBe(false);
		expect(bid2.message).toContain("already placed");
	});

	it("should check if user has bid", async () => {
		// Create auction
		const auctionResponse = await auctionService.createAuction({
			collection_id: testCollectionId,
			round_duration: 60,
			gifts_per_round: 2,
		});

		if (!auctionResponse.responseObject) return;
		const auctionId = auctionResponse.responseObject._id;

		// Check before bid
		let hasBid = await bidService.hasUserBid(auctionId, testUserId);
		expect(hasBid).toBe(false);

		// Place bid
		await bidService.placeBid(auctionId, testUserId, 100);

		// Check after bid
		hasBid = await bidService.hasUserBid(auctionId, testUserId);
		expect(hasBid).toBe(true);
	});

	it("should get user bid", async () => {
		// Create auction
		const auctionResponse = await auctionService.createAuction({
			collection_id: testCollectionId,
			round_duration: 60,
			gifts_per_round: 2,
		});

		if (!auctionResponse.responseObject) return;
		const auctionId = auctionResponse.responseObject._id;

		// Place bid
		const bidResponse = await bidService.placeBid(auctionId, testUserId, 150);
		expect(bidResponse.success).toBe(true);

		// Get user bid
		const userBid = await bidService.getUserBid(auctionId, testUserId, 1);
		expect(userBid).toBeDefined();
		expect(userBid?.userId).toBe(testUserId);
		expect(userBid?.amount).toBe(150);
	});
});
