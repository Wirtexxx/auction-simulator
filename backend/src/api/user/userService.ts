import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { validateTelegramInitData } from "@/common/utils/telegramAuth";
import type { User } from "./userModel";
import { UserRepository } from "./userRepository";
import { createUserDataFromTelegram } from "./userHelpers";
import { walletService } from "../wallet/walletService";

export interface AuthResponse {
	user: User;
	token: string;
}

export class UserService {
	private userRepository: UserRepository;

	constructor() {
		this.userRepository = new UserRepository();
	}

	async authenticateWithTelegram(initDataRaw: string): Promise<ServiceResponse<AuthResponse>> {
		try {
			if (env.isDevelopment) {
				console.log("📥 Received init data:", initDataRaw.substring(0, 100) + "...");
			}

			// Validate Telegram init data
			const initData = validateTelegramInitData(initDataRaw);
			if (!initData || !initData.user) {
				if (env.isDevelopment) {
					console.error("❌ Init data validation failed:", {
						hasInitData: !!initData,
						hasUser: !!initData?.user,
						initDataRawLength: initDataRaw.length,
					});
				}
				return ServiceResponse.failure(
					"Invalid or expired Telegram init data",
					null as unknown as AuthResponse,
					StatusCodes.UNAUTHORIZED,
				);
			}

			const telegramUser = initData.user;

			if (!telegramUser.id) {
				return ServiceResponse.failure(
					"Invalid Telegram user data: missing user ID",
					null as unknown as AuthResponse,
					StatusCodes.UNAUTHORIZED,
				);
			}

			let user = await this.userRepository.findByTelegramUserId(telegramUser.id);

			if (!user) {
				const userData = createUserDataFromTelegram(telegramUser);
				user = await this.userRepository.create(userData);
			}

			// Ensure wallet exists for user (create if doesn't exist)
			const existingWallet = await walletService.getWalletById(user._id);
			if (!existingWallet.success) {
				const walletResponse = await walletService.createWallet({ user_id: user._id, balance: 0 });
				if (walletResponse.success) {
					if (env.isDevelopment) {
						console.log(`✅ Wallet created automatically for user ${user._id}`);
					}
				} else {
					if (env.isDevelopment) {
						console.error(`⚠️ Failed to create wallet for user ${user._id}:`, walletResponse.message);
					}
				}
			}

			// Generate JWT token
			const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, {
				expiresIn: "7d",
			});

			const authResponse: AuthResponse = {
				user,
				token,
			};

			return ServiceResponse.success("Authentication successful", authResponse);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to authenticate";
			return ServiceResponse.failure(errorMessage, null as unknown as AuthResponse, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getUserById(id: number): Promise<ServiceResponse<User>> {
		const user = await this.userRepository.findById(id);

		if (!user) {
			return ServiceResponse.failure("User not found", null as unknown as User, StatusCodes.NOT_FOUND);
		}

		return ServiceResponse.success("User retrieved successfully", user);
	}
}

export const userService = new UserService();
