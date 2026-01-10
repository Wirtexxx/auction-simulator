import { parse, validate, deepSnakeToCamelObjKeys, type InitData } from "@tma.js/init-data-node";
import { env } from "./envConfig";

const MAX_INIT_DATA_AGE = 24 * 60 * 60; // 24 hours in seconds

function parseInitDataWithoutValidation(initDataRaw: string): InitData | null {
	const params = new URLSearchParams(initDataRaw);
	const userStr = params.get("user");
	const authDateStr = params.get("auth_date");
	
	if (!userStr || !authDateStr) {
		return null;
	}

	const user = JSON.parse(decodeURIComponent(userStr));
	const authDate = new Date(parseInt(authDateStr, 10) * 1000);
	
	const authDateUnix = parseInt(authDateStr, 10);
	const currentTime = Math.floor(Date.now() / 1000);

	if (currentTime - authDateUnix > MAX_INIT_DATA_AGE) {
		return null;
	}

	const mockInitData = {
		auth_date: authDate,
		user: user,
		query_id: params.get("query_id") || undefined,
		hash: params.get("hash") || undefined,
	};

	return deepSnakeToCamelObjKeys(mockInitData) as unknown as InitData;
}

function validateInitDataAge(parsedData: ReturnType<typeof parse>): boolean {
	const authDate = parsedData.auth_date.getTime() / 1000;
	const currentTime = Math.floor(Date.now() / 1000);
	return currentTime - authDate <= MAX_INIT_DATA_AGE;
}

export function validateTelegramInitData(initDataRaw: string): InitData | null {
	try {
		// In development mode without bot token, use simple parsing
		if (!env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN.length === 0) {
			if (env.isDevelopment) {
				console.warn("⚠️  TELEGRAM_BOT_TOKEN is not configured. Skipping validation in development mode.");
				const result = parseInitDataWithoutValidation(initDataRaw);
				if (env.isDevelopment) {
					console.log("✅ Parsed init data without validation:", {
						hasUser: !!result?.user,
						userId: result?.user?.id,
					});
				}
				return result;
			}
			console.error("TELEGRAM_BOT_TOKEN is not configured");
			return null;
		}

		// In production or with bot token, try full validation first
		// But in dev mode, if validation fails, fallback to simple parsing
		if (env.isDevelopment) {
			try {
				const parsedData = parse(initDataRaw);
				validate(initDataRaw, env.TELEGRAM_BOT_TOKEN);

				if (!validateInitDataAge(parsedData)) {
					console.error("❌ Init data expired");
					return null;
				}

				return deepSnakeToCamelObjKeys(parsedData) as unknown as InitData;
			} catch (parseError) {
				// In dev mode, if full validation fails, fallback to simple parsing
				console.warn("⚠️  Full validation failed, falling back to simple parsing for mock data");
				return parseInitDataWithoutValidation(initDataRaw);
			}
		}

		// In production, use strict validation
		const parsedData = parse(initDataRaw);
		validate(initDataRaw, env.TELEGRAM_BOT_TOKEN);

		if (!validateInitDataAge(parsedData)) {
			return null;
		}

		return deepSnakeToCamelObjKeys(parsedData) as unknown as InitData;
	} catch (error) {
		if (env.isDevelopment) {
			console.error("❌ Telegram init data validation failed:", error);
			if (error instanceof Error) {
				console.error("Error message:", error.message);
			}
		}
		return null;
	}
}

