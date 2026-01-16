/**
 * Redis key-space design for auction runtime state
 * 
 * All keys follow the pattern: auction:{id}:{resource}
 * 
 * Key Types:
 * - HASH: auction:{id}:state - Auction runtime state
 * - SET: auction:{id}:users - Users who placed bids (atomic lock)
 * - ZSET: auction:{id}:round:{n}:bids - Bids for a specific round
 * - ZSET: auction:rounds:timeouts - Round timers (global)
 * - STRING: auction:{id}:round:{n}:settled - Settlement idempotency flag
 * - STRING: user:{userId}:frozen:{auctionId} - Frozen balance per user per auction
 */

/**
 * Get auction state key (HASH)
 * Stores: round (number), status (string), round_end_ts (number), settling (boolean)
 */
export function getAuctionStateKey(auctionId: string): string {
	return `auction:${auctionId}:state`;
}

/**
 * Get auction users key (SET)
 * Stores: user IDs who have placed bids (used as atomic lock)
 */
export function getAuctionUsersKey(auctionId: string): string {
	return `auction:${auctionId}:users`;
}

/**
 * Get round bids key (ZSET)
 * Score: bid amount (for sorting DESC)
 * Member: {userId}:{timestamp}:{amount} (for tie-breaking by timestamp ASC)
 */
export function getRoundBidsKey(auctionId: string, roundNumber: number): string {
	return `auction:${auctionId}:round:${roundNumber}:bids`;
}

/**
 * Get round settled key (STRING)
 * Value: "1" if round is settled (idempotency flag)
 */
export function getRoundSettledKey(auctionId: string, roundNumber: number): string {
	return `auction:${auctionId}:round:${roundNumber}:settled`;
}

/**
 * Get round timers key (ZSET) - GLOBAL
 * Score: round_end_ts (Unix timestamp in milliseconds)
 * Member: {auctionId}:{roundNumber}
 */
export function getRoundTimeoutsKey(): string {
	return `auction:rounds:timeouts`;
}

/**
 * Get frozen balance key (STRING)
 * Stores: frozen amount for a user in a specific auction
 */
export function getFrozenBalanceKey(userId: number, auctionId: string): string {
	return `user:${userId}:frozen:${auctionId}`;
}

/**
 * Get pattern for all auction keys (for cleanup)
 */
export function getAuctionKeysPattern(auctionId: string): string {
	return `auction:${auctionId}:*`;
}

/**
 * Get pattern for all frozen balance keys for a user
 */
export function getUserFrozenKeysPattern(userId: number): string {
	return `user:${userId}:frozen:*`;
}

/**
 * Get pattern for all frozen balance keys for an auction
 */
export function getAuctionFrozenKeysPattern(auctionId: string): string {
	return `user:*:frozen:${auctionId}`;
}


