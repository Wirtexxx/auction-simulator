import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import User from "@/models/User";
import type { Wallet } from "./walletModel";
import { WalletRepository, type CreateWalletData } from "./walletRepository";

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

		return ServiceResponse.success("Wallet retrieved successfully", wallet);
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
}

export const walletService = new WalletService();

