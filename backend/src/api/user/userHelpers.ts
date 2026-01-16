import type { InitData } from "@tma.js/init-data-node";
import type { CreateUserData } from "./userRepository";

export function createUserDataFromTelegram(telegramUser: NonNullable<InitData["user"]>): CreateUserData {
	return {
		_id: telegramUser.id,
		username: telegramUser.username || `user_${telegramUser.id}`,
		first_name: telegramUser.first_name || `User ${telegramUser.id}`,
		last_name: telegramUser.last_name,
		photo_url: telegramUser.photo_url,
		language_code: telegramUser.language_code,
		is_premium: telegramUser.is_premium || false,
		role: "user",
	};
}
