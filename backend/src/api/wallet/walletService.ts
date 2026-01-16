import { StatusCodes } from "http-status-codes";
import { pino } from "pino";
import { getRedisClient } from "@/common/db/redis";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { getAuctionFrozenKeysPattern, getFrozenBalanceKey } from "@/common/redis/auctionKeys";
import User from "@/models/User";
import type { Wallet } from "./walletModel";
import { type CreateWalletData, WalletRepository } from "./walletRepository";

const logger = pino({ name: "walletService" });

export class WalletService {
	private walletRepository: WalletRepository;

	constructor() {
		this.walletRepository = new WalletRepository();
	}

	async createWallet(data: { user_id: number; balance?: number }): Promise<ServiceResponse<Wallet>> {
		try {
			const user = await User.findById(data.user_id);
			if (!user) {
				return ServiceResponse.failure("User not found", null as unknown as Wallet, StatusCodes.NOT_FOUND);
			}

			const existingWallet = await this.walletRepository.findById(data.user_id);
			if (existingWallet) {
				return ServiceResponse.failure(
					"Wallet already exists for this user",
					null as unknown as Wallet,
					StatusCodes.CONFLICT,
				);
			}

			const walletData: CreateWalletData = {
				_id: data.user_id,
				balance: data.balance || 0,
			};

			const wallet = await this.walletRepository.create(walletData);
			return ServiceResponse.success("Wallet created successfully", wallet, StatusCodes.CREATED);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to create wallet";
			return ServiceResponse.failure(errorMessage, null as unknown as Wallet, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getWalletById(id: number): Promise<ServiceResponse<Wallet>> {
		const wallet = await this.walletRepository.findById(id);

		if (!wallet) {
			return ServiceResponse.failure("Wallet not found", null as unknown as Wallet, StatusCodes.NOT_FOUND);
		}

		// Get frozen balance and available balance
		const totalFrozen = await this.getTotalFrozenBalance(id);
		const availableBalance = Math.max(0, wallet.balance - totalFrozen);

		// Return wallet with additional balance information
		return ServiceResponse.success("Wallet retrieved successfully", {
			...wallet,
			frozen_balance: totalFrozen,
			available_balance: availableBalance,
		});
	}

	async updateWalletBalance(id: number, balance: number): Promise<ServiceResponse<Wallet>> {
		try {
			const wallet = await this.walletRepository.findById(id);
			if (!wallet) {
				return ServiceResponse.failure("Wallet not found", null as unknown as Wallet, StatusCodes.NOT_FOUND);
			}

			const updatedWallet = await this.walletRepository.updateBalance(id, balance);
			if (!updatedWallet) {
				return ServiceResponse.failure(
					"Failed to update wallet balance",
					null as unknown as Wallet,
					StatusCodes.INTERNAL_SERVER_ERROR,
				);
			}

			return ServiceResponse.success("Wallet balance updated successfully", updatedWallet);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to update wallet balance";
			return ServiceResponse.failure(errorMessage, null as unknown as Wallet, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Get available balance (total balance minus all frozen amounts)
	 */
	async getAvailableBalance(userId: number): Promise<number> {
		try {
			const wallet = await this.walletRepository.findById(userId);
			if (!wallet) {
				return 0;
			}

			const totalFrozen = await this.getTotalFrozenBalance(userId);
			return Math.max(0, wallet.balance - totalFrozen);
		} catch (error) {
			logger.error({ error, userId }, "Error getting available balance");
			return 0;
		}
	}

	/**
	 * Get total frozen balance across all auctions
	 */
	async getTotalFrozenBalance(userId: number): Promise<number> {
		const redis = getRedisClient();
		const pattern = `user:${userId}:frozen:*`;

		try {
			const keys = await redis.keys(pattern);
			if (keys.length === 0) {
				return 0;
			}

			const values = await redis.mget(...keys);
			const total = values.reduce((sum, val) => {
				const amount = parseFloat(val || "0");
				return sum + (Number.isNaN(amount) ? 0 : amount);
			}, 0);

			return total;
		} catch (error) {
			logger.error({ error, userId }, "Error getting total frozen balance");
			return 0;
		}
	}

	/**
	 * Freeze balance for a specific auction
	 * Stores frozen amount in Redis: user:{userId}:frozen:{auctionId} = amount
	 */
	async freezeBalance(userId: number, amount: number, auctionId: string): Promise<boolean> {
		const redis = getRedisClient();
		const key = getFrozenBalanceKey(userId, auctionId);

		try {
			// Check available balance
			const available = await this.getAvailableBalance(userId);
			if (available < amount) {
				logger.warn({ userId, amount, available, auctionId }, "Insufficient available balance for freeze");
				return false;
			}

			// Set frozen amount (overwrites if exists)
			await redis.set(key, amount.toString());
			logger.info({ userId, amount, auctionId }, "Balance frozen");
			return true;
		} catch (error) {
			logger.error({ error, userId, amount, auctionId }, "Error freezing balance");
			return false;
		}
	}

	/**
	 * Unfreeze balance for a specific auction
	 * Removes frozen amount from Redis
	 */
	async unfreezeBalance(userId: number, amount: number, auctionId: string): Promise<void> {
		const redis = getRedisClient();
		const key = getFrozenBalanceKey(userId, auctionId);

		try {
			await redis.del(key);
			logger.info({ userId, amount, auctionId }, "Balance unfrozen");
		} catch (error) {
			logger.error({ error, userId, amount, auctionId }, "Error unfreezing balance");
		}
	}

	/**
	 * Deduct balance (final charge for winners)
	 * Removes frozen amount and deducts from wallet balance
	 */
	async deductBalance(userId: number, amount: number, auctionId: string): Promise<boolean> {
		try {
			const wallet = await this.walletRepository.findById(userId);
			if (!wallet) {
				logger.warn({ userId }, "Wallet not found for deduction");
				return false;
			}

			// Remove frozen amount
			await this.unfreezeBalance(userId, amount, auctionId);

			// Deduct from balance
			const newBalance = wallet.balance - amount;
			if (newBalance < 0) {
				logger.error({ userId, amount, currentBalance: wallet.balance }, "Balance would be negative");
				return false;
			}

			const updatedWallet = await this.walletRepository.updateBalance(userId, newBalance);
			if (!updatedWallet) {
				logger.error({ userId }, "Failed to update balance after deduction");
				return false;
			}

			logger.info({ userId, amount, auctionId, newBalance }, "Balance deducted");
			return true;
		} catch (error) {
			logger.error({ error, userId, amount, auctionId }, "Error deducting balance");
			return false;
		}
	}

	/**
	 * Get frozen balance for a specific auction
	 */
	async getFrozenBalance(userId: number, auctionId: string): Promise<number> {
		const redis = getRedisClient();
		const key = getFrozenBalanceKey(userId, auctionId);

		try {
			const value = await redis.get(key);
			const amount = parseFloat(value || "0");
			return Number.isNaN(amount) ? 0 : amount;
		} catch (error) {
			logger.error({ error, userId, auctionId }, "Error getting frozen balance");
			return 0;
		}
	}

	/**
	 * Unfreeze all balances for an auction (used when auction finishes)
	 */
	async unfreezeAllForAuction(auctionId: string): Promise<void> {
		const redis = getRedisClient();
		const pattern = getAuctionFrozenKeysPattern(auctionId);

		try {
			const keys = await redis.keys(pattern);
			if (keys.length > 0) {
				await redis.del(...keys);
				logger.info({ auctionId, unfrozenCount: keys.length }, "All frozen balances unfrozen for auction");
			}
		} catch (error) {
			logger.error({ error, auctionId }, "Error unfreezing all balances for auction");
		}
	}
}

export const walletService = new WalletService();
