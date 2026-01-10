import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { validateTelegramInitData } from "@/common/utils/telegramAuth";
import type { User } from "./userModel";
import { type CreateUserData, UserRepository } from "./userRepository";

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
			// Validate Telegram init data
			const initData = validateTelegramInitData(initDataRaw);
			if (!initData || !initData.user) {
				return ServiceResponse.failure(
					"Invalid or expired Telegram init data",
					null as unknown as AuthResponse,
					StatusCodes.UNAUTHORIZED,
				);
			}

			const telegramUser = initData.user;

			// Check if user already exists by telegram_user_id (which is _id)
			let user = await this.userRepository.findByTelegramUserId(telegramUser.id);

			if (!user) {
				// Register new user - use telegram_user_id as _id
				const userData: CreateUserData = {
					_id: telegramUser.id, // _id equals telegram_user_id
					username: telegramUser.username || `user_${telegramUser.id}`,
					first_name: telegramUser.first_name,
					last_name: telegramUser.last_name,
					photo_url: telegramUser.photo_url,
					language_code: telegramUser.language_code,
					is_premium: telegramUser.is_premium || false,
					role: "user",
				};

				user = await this.userRepository.create(userData);
			} else {
				// Update user data from Telegram (in case it changed)
				// For now, we'll just use existing user, but you can add update logic here
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
