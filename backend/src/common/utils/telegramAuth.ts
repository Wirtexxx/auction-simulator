import { parse, validate, deepSnakeToCamelObjKeys, type InitData } from "@tma.js/init-data-node";
import { env } from "./envConfig";

/**
 * Validates Telegram Mini App init data
 * @param initDataRaw - Raw init data string from Telegram
 * @returns Parsed and validated init data or null if validation fails
 */
export function validateTelegramInitData(initDataRaw: string): InitData | null {
	try {
		if (!env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN.length === 0) {
			throw new Error("TELEGRAM_BOT_TOKEN is not configured");
		}

		// Parse init data (returns snake_case)
		const parsedData = parse(initDataRaw);

		// Validate init data using Telegram Bot Token
		validate(initDataRaw, env.TELEGRAM_BOT_TOKEN);

		// Check if auth_date is not too old (optional: 24 hours)
		const authDate = parsedData.auth_date.getTime() / 1000; // Convert to Unix timestamp
		const currentTime = Math.floor(Date.now() / 1000);
		const maxAge = 24 * 60 * 60; // 24 hours in seconds

		if (currentTime - authDate > maxAge) {
			return null; // Init data is too old
		}

		// Convert snake_case to camelCase and return as InitData
		return deepSnakeToCamelObjKeys(parsedData) as unknown as InitData;
	} catch (error) {
		console.error("Telegram init data validation failed:", error);
		return null;
	}
}

