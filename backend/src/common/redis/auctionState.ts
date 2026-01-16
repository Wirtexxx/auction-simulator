import { pino } from "pino";
import { getRedisClient } from "@/common/db/redis";
import { getAuctionStateKey, getRoundTimeoutsKey } from "./auctionKeys";

const logger = pino({ name: "auctionState" });

export interface AuctionState {
	round: number;
	status: "active" | "finished";
	round_end_ts: number; // Unix timestamp in milliseconds
	settling: boolean;
}

/**
 * Initialize auction state in Redis
 * @param auctionId - Auction ID
 * @param roundNumber - Current round number
 * @param roundDuration - Round duration in seconds
 * @returns Promise<void>
 */
export async function initializeAuctionState(
	auctionId: string,
	roundNumber: number,
	roundDuration: number,
): Promise<void> {
	const now = Date.now();
	const roundEndTs = now + roundDuration * 1000;
	await initializeAuctionStateWithTime(auctionId, roundNumber, roundEndTs);
}

/**
 * Initialize auction state in Redis with specific round end timestamp
 * @param auctionId - Auction ID
 * @param roundNumber - Current round number
 * @param roundEndTs - Round end timestamp in milliseconds
 * @returns Promise<void>
 */
export async function initializeAuctionStateWithTime(
	auctionId: string,
	roundNumber: number,
	roundEndTs: number,
): Promise<void> {
	const redis = getRedisClient();
	const stateKey = getAuctionStateKey(auctionId);

	const state: AuctionState = {
		round: roundNumber,
		status: "active",
		round_end_ts: roundEndTs,
		settling: false,
	};

	await redis.hset(stateKey, {
		round: state.round.toString(),
		status: state.status,
		round_end_ts: state.round_end_ts.toString(),
		settling: state.settling ? "1" : "0",
	});

	// Add round timer to global timeouts ZSET
	const timeoutsKey = getRoundTimeoutsKey();
	await redis.zadd(timeoutsKey, roundEndTs, `${auctionId}:${roundNumber}`);

	logger.info({ auctionId, roundNumber, roundEndTs }, "Auction state initialized in Redis");
}

/**
 * Get auction state from Redis
 * @param auctionId - Auction ID
 * @returns Promise<AuctionState | null>
 */
export async function getAuctionState(auctionId: string): Promise<AuctionState | null> {
	const redis = getRedisClient();
	const stateKey = getAuctionStateKey(auctionId);

	const state = await redis.hgetall(stateKey);

	if (!state || Object.keys(state).length === 0) {
		return null;
	}

	return {
		round: parseInt(state.round || "0", 10),
		status: (state.status || "active") as "active" | "finished",
		round_end_ts: parseInt(state.round_end_ts || "0", 10),
		settling: state.settling === "1",
	};
}

/**
 * Update auction state atomically
 * @param auctionId - Auction ID
 * @param updates - Partial state updates
 * @returns Promise<void>
 */
export async function updateAuctionState(auctionId: string, updates: Partial<AuctionState>): Promise<void> {
	const redis = getRedisClient();
	const stateKey = getAuctionStateKey(auctionId);

	const updateData: Record<string, string> = {};

	if (updates.round !== undefined) {
		updateData.round = updates.round.toString();
	}

	if (updates.status !== undefined) {
		updateData.status = updates.status;
	}

	if (updates.round_end_ts !== undefined) {
		updateData.round_end_ts = updates.round_end_ts.toString();
	}

	if (updates.settling !== undefined) {
		updateData.settling = updates.settling ? "1" : "0";
	}

	if (Object.keys(updateData).length > 0) {
		await redis.hset(stateKey, updateData);
		logger.info({ auctionId, updates }, "Auction state updated");
	}
}

/**
 * Check if auction is in settling state
 * @param auctionId - Auction ID
 * @returns Promise<boolean>
 */
export async function isAuctionSettling(auctionId: string): Promise<boolean> {
	const state = await getAuctionState(auctionId);
	return state?.settling === true;
}

/**
 * Check if round is active (not settling and not finished)
 * @param auctionId - Auction ID
 * @returns Promise<boolean>
 */
export async function isRoundActive(auctionId: string): Promise<boolean> {
	const state = await getAuctionState(auctionId);
	if (!state) return false;
	return state.status === "active" && !state.settling;
}

/**
 * Add round timer to global timeouts
 * @param auctionId - Auction ID
 * @param roundNumber - Round number
 * @param roundEndTs - Round end timestamp in milliseconds
 * @returns Promise<void>
 */
export async function addRoundTimer(auctionId: string, roundNumber: number, roundEndTs: number): Promise<void> {
	const redis = getRedisClient();
	const timeoutsKey = getRoundTimeoutsKey();
	await redis.zadd(timeoutsKey, roundEndTs, `${auctionId}:${roundNumber}`);
	logger.info({ auctionId, roundNumber, roundEndTs }, "Round timer added to timeouts");
}

/**
 * Remove round timer from global timeouts
 * @param auctionId - Auction ID
 * @param roundNumber - Round number
 * @returns Promise<void>
 */
export async function removeRoundTimer(auctionId: string, roundNumber: number): Promise<void> {
	const redis = getRedisClient();
	const timeoutsKey = getRoundTimeoutsKey();
	await redis.zrem(timeoutsKey, `${auctionId}:${roundNumber}`);
	logger.info({ auctionId, roundNumber }, "Round timer removed from timeouts");
}

/**
 * Get expired round timers
 * @param currentTime - Current timestamp in milliseconds (default: Date.now())
 * @returns Promise<Array<{auctionId: string, roundNumber: number}>>
 */
export async function getExpiredRoundTimers(
	currentTime: number = Date.now(),
): Promise<Array<{ auctionId: string; roundNumber: number }>> {
	const redis = getRedisClient();
	const timeoutsKey = getRoundTimeoutsKey();

	// Get all timers with score <= currentTime
	const expired = await redis.zrangebyscore(timeoutsKey, 0, currentTime, "WITHSCORES");

	const result: Array<{ auctionId: string; roundNumber: number }> = [];

	for (let i = 0; i < expired.length; i += 2) {
		const member = expired[i] as string;
		const score = parseFloat(expired[i + 1] as string);
		const [auctionId, roundNumberStr] = member.split(":");
		const roundNumber = parseInt(roundNumberStr || "0", 10);

		if (auctionId && roundNumber) {
			result.push({ auctionId, roundNumber });
			logger.debug({ auctionId, roundNumber, expiredAt: score, currentTime }, "Found expired round timer");
		} else {
			logger.warn({ member, score }, "Invalid timer entry in Redis");
		}
	}

	if (result.length > 0) {
		logger.info({ expiredCount: result.length, currentTime }, "Found expired round timers");
	}

	return result;
}
