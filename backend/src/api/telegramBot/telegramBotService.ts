import { pino } from "pino";
import { env } from "@/common/utils/envConfig";
import type { TelegramUpdate } from "./telegramBotModel";

const logger = pino({ name: "telegramBotService" });

const TELEGRAM_API_URL = "https://api.telegram.org/bot";

export class TelegramBotService {
	private botToken: string;

	constructor() {
		this.botToken = env.TELEGRAM_BOT_TOKEN || "";
		if (!this.botToken) {
			logger.warn("TELEGRAM_BOT_TOKEN is not configured");
		}
	}

	/**
	 * Process incoming update from Telegram
	 */
	async processUpdate(update: TelegramUpdate): Promise<void> {
		try {
			const userId = update.message?.from?.id;
			const chatId = update.message?.chat?.id;
			const text = update.message?.text;
			const username = update.message?.from?.username || "unknown";
			const firstName = update.message?.from?.first_name || "User";

			// Log all updates with user id
			if (userId) {
				logger.info(`[${userId}] Received update from @${username} (${firstName})`);
			} else {
				logger.info("Received update without user id");
			}

			// Process commands
			if (text && text.startsWith("/")) {
				const command = text.split(" ")[0].toLowerCase();
				const args = text.split(" ").slice(1).join(" ");

				// Log command
				if (userId) {
					logger.info(`[${userId}] Command: ${command}${args ? ` with args: ${args}` : ""}`);
				}

				// Handle /start command
				if (command === "/start") {
					await this.handleStartCommand(chatId, userId, firstName, args);
				} else {
					// Unknown command
					if (userId) {
						logger.info(`[${userId}] Unknown command: ${command}`);
					}
					if (chatId) {
						// Sanitize command to prevent XSS
						const sanitizedCommand = this.sanitizeForTelegram(command);
						await this.sendMessage(chatId, `Неизвестная команда: ${sanitizedCommand}. Используйте /start для начала.`);
					} else {
						logger.warn("Cannot send message: chatId is undefined");
					}
				}
			} else if (text) {
				// Regular message (not a command)
				if (userId) {
					logger.info(`[${userId}] Message: ${text.substring(0, 50)}${text.length > 50 ? "..." : ""}`);
				}
			}
		} catch (error) {
			logger.error({ error, update }, "Error processing Telegram update");
		}
	}

	/**
	 * Handle /start command
	 */
	private async handleStartCommand(
		chatId: number | undefined,
		userId: number | undefined,
		firstName: string,
		args: string,
	): Promise<void> {
		if (!chatId || !userId) {
			logger.warn("Cannot handle /start command: missing chatId or userId");
			return;
		}

		// Log start command
		logger.info(`[${userId}] Command: /start${args ? ` with args: ${args}` : ""}`);

		// Prepare welcome message
		const welcomeMessage = `Привет, ${firstName}! 👋\n\nДобро пожаловать в систему аукционов!\n\nИспользуйте Mini App для участия в аукционах.`;

		// Send welcome message
		await this.sendMessage(chatId, welcomeMessage);
	}

	/**
	 * Sanitize text for Telegram (prevent XSS and injection)
	 */
	private sanitizeForTelegram(text: string): string {
		if (typeof text !== "string") {
			return "";
		}

		// Remove HTML tags and special characters that could be used for injection
		return text
			.replace(/[<>]/g, "") // Remove angle brackets
			.replace(/&/g, "&amp;") // Escape ampersand
			.replace(/"/g, "&quot;") // Escape quotes
			.replace(/'/g, "&#x27;") // Escape apostrophe
			.replace(/\//g, "&#x2F;") // Escape slash
			.substring(0, 4096); // Telegram message limit
	}

	/**
	 * Send message to Telegram chat
	 */
	async sendMessage(chatId: number, text: string): Promise<boolean> {
		// Sanitize message text to prevent XSS
		const sanitizedText = this.sanitizeForTelegram(text);
		if (!this.botToken) {
			logger.error("Cannot send message: TELEGRAM_BOT_TOKEN is not configured");
			return false;
		}

		try {
			const url = `${TELEGRAM_API_URL}${this.botToken}/sendMessage`;
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					chat_id: chatId,
					text: sanitizedText,
					parse_mode: "HTML",
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				logger.error(
					{ chatId, status: response.status, error: errorText },
					"Failed to send Telegram message",
				);
				return false;
			}

			logger.info({ chatId }, "Message sent successfully");
			return true;
		} catch (error) {
			logger.error({ error, chatId }, "Error sending Telegram message");
			return false;
		}
	}
}

export const telegramBotService = new TelegramBotService();
