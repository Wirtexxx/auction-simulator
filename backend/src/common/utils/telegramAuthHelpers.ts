import { deepSnakeToCamelObjKeys, type InitData, parse, validate } from "@tma.js/init-data-node";
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
		// Handle case where initDataRaw might be a JSON-encoded string
		let initDataString = initDataRaw;
		if (initDataRaw.startsWith('"') && initDataRaw.endsWith('"')) {
			try {
				const parsed = JSON.parse(initDataRaw);
				if (typeof parsed === "string") {
					initDataString = parsed;
					if (env.isDevelopment) {
						console.log("🔧 Unwrapped JSON-encoded init data string");
					}
				}
			} catch {
				// If JSON parsing fails, use as is
			}
		}

		if (env.isDevelopment) {
			console.log("🔍 Processing init data:", {
				originalLength: initDataRaw.length,
				processedLength: initDataString.length,
				startsWithQuote: initDataRaw.startsWith('"'),
				firstChars: initDataString.substring(0, 50),
				hasUser: initDataString.includes('user='),
				hasAuthDate: initDataString.includes('auth_date='),
				hasHash: initDataString.includes('hash='),
			});
		}

		// In development mode without bot token, use simple parsing
		if (!env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN.length === 0) {
			if (env.isDevelopment) {
				console.warn("⚠️  TELEGRAM_BOT_TOKEN is not configured. Skipping hash validation in development mode.");
				console.warn("⚠️  Only checking auth_date expiration and required fields.");
				const result = parseInitDataWithoutValidation(initDataString);
				if (env.isDevelopment) {
					if (result) {
						// deepSnakeToCamelObjKeys converts auth_date to authDate, but InitData type uses auth_date
						// Check both to be safe
						const hasAuthDate = !!(result as unknown as { authDate?: Date; auth_date?: Date }).authDate || 
						                    !!(result as unknown as { authDate?: Date; auth_date?: Date }).auth_date;
						console.log("✅ Parsed init data without validation:", {
							hasUser: !!result?.user,
							userId: result?.user?.id,
							hasAuthDate: hasAuthDate,
							hasHash: !!result?.hash,
						});
					} else {
						console.error("❌ Failed to parse init data without validation");
						console.error("❌ Check if init data contains 'user' and 'auth_date' parameters");
					}
				}
				return result;
			}
			console.error("❌ TELEGRAM_BOT_TOKEN is not configured (required in production)");
			return null;
		}

		// In production or with bot token, try full validation first
		// But in dev mode, if validation fails, fallback to simple parsing
		if (env.isDevelopment) {
			try {
				const parsedData = parse(initDataString);
				validate(initDataString, env.TELEGRAM_BOT_TOKEN);

				if (!validateInitDataAge(parsedData)) {
					console.error("❌ Init data expired");
					return null;
				}

				return deepSnakeToCamelObjKeys(parsedData) as unknown as InitData;
			} catch (parseError) {
				// In dev mode, if full validation fails, fallback to simple parsing
				if (env.isDevelopment) {
					console.warn("⚠️  Full validation failed, falling back to simple parsing");
					if (parseError instanceof Error) {
						console.warn("⚠️  Parse error:", parseError.message);
						console.warn("⚠️  Error stack:", parseError.stack);
					}
					console.warn("⚠️  Init data string preview:", initDataString.substring(0, 200));
					console.warn("⚠️  This might indicate:");
					console.warn("    - Invalid hash (data was modified or converted from object)");
					console.warn("    - Wrong bot token");
					console.warn("    - Malformed init data string");
				}
				const fallbackResult = parseInitDataWithoutValidation(initDataString);
				if (fallbackResult) {
					if (env.isDevelopment) {
						console.log("✅ Fallback parsing successful (hash validation skipped)");
						console.warn("⚠️  WARNING: Hash was not validated - this should only happen in dev mode!");
					}
					return fallbackResult;
				}
				if (env.isDevelopment) {
					console.error("❌ Fallback parsing also failed");
					console.error("❌ Init data is invalid - missing required fields or expired");
				}
				return null;
			}
		}

		// In production, use strict validation
		try {
			const parsedData = parse(initDataString);
			validate(initDataString, env.TELEGRAM_BOT_TOKEN);

			if (!validateInitDataAge(parsedData)) {
				return null;
			}

			return deepSnakeToCamelObjKeys(parsedData) as unknown as InitData;
		} catch (parseError) {
			// If parse fails, it means the init data format is invalid
			// Log the error but don't expose details to client
			if (env.isDevelopment) {
				console.error("❌ Failed to parse init data in production mode:", parseError);
				if (parseError instanceof Error) {
					console.error("❌ Error message:", parseError.message);
				}
			}
			return null;
		}
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
