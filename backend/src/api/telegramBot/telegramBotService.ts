import { pino } from "pino";
import { env } from "@/common/utils/envConfig";
import { UserRepository } from "@/api/user/userRepository";
import type { TelegramUpdate } from "./telegramBotModel";

const logger = pino({ name: "telegramBotService" });

const TELEGRAM_API_URL = "https://api.telegram.org/bot";

export class TelegramBotService {
	private botToken: string;
	private userRepository: UserRepository;

	constructor() {
		this.botToken = env.TELEGRAM_BOT_TOKEN || "";
		this.userRepository = new UserRepository();
		if (!this.botToken) {
			logger.warn("TELEGRAM_BOT_TOKEN is not configured");
		}
	}

	/**
	 * Process incoming update from Telegram
	 */
	async processUpdate(update: TelegramUpdate): Promise<void> {
		try {
			// Handle callback_query (button clicks)
			if (update.callback_query) {
				await this.handleCallbackQuery(update.callback_query);
				return;
			}

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
			if (text?.startsWith("/")) {
				const command = text.split(" ")[0].toLowerCase();
				const args = text.split(" ").slice(1).join(" ");

				// Log command
				if (userId) {
					logger.info(`[${userId}] Command: ${command}${args ? ` with args: ${args}` : ""}`);
				}

				// Handle /start command
				if (command === "/start") {
					await this.handleStartCommand(chatId, userId, firstName, args);
				} else if (command === "/role") {
					await this.handleRoleCommand(chatId, userId);
				} else {
					// Unknown command
					if (userId) {
						logger.info(`[${userId}] Unknown command: ${command}`);
					}
					if (chatId) {
						// Don't sanitize command - it's safe (starts with / and contains no HTML)
						// Just escape any potential HTML in the message itself
						await this.sendMessage(chatId, `Неизвестная команда: ${command}. Используйте /start для начала.`, false);
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

		// Save or update chatId for user
		try {
			const user = await this.userRepository.findById(userId);
			if (user) {
				await this.userRepository.updateChatId(userId, chatId);
			}
		} catch (error) {
			logger.error({ error, userId, chatId }, "Failed to update user chatId");
		}

		// Prepare welcome message
		const welcomeMessage = `Привет, ${firstName}! 👋\n\nДобро пожаловать в систему аукционов!\n\nИспользуйте Mini App для участия в аукционах.`;

		// Send welcome message with Mini App button
		await this.sendMessageWithKeyboard(chatId, welcomeMessage);
	}

	/**
	 * Handle /role command
	 */
	private async handleRoleCommand(chatId: number | undefined, userId: number | undefined): Promise<void> {
		if (!chatId || !userId) {
			logger.warn("Cannot handle /role command: missing chatId or userId");
			return;
		}

		// Get current user role
		const user = await this.userRepository.findById(userId);
		const currentRole = user?.role || "user";

		const message = `Текущая роль: <b>${currentRole}</b>\n\nВыберите новую роль:`;

		// Create inline keyboard with role options
		const keyboard = {
			inline_keyboard: [
				[
					{
						text: "👤 Пользователь",
						callback_data: "role_user",
					},
					{
						text: "👑 Администратор",
						callback_data: "role_admin",
					},
				],
			],
		};

		await this.sendMessageWithKeyboard(chatId, message, keyboard);
	}

	/**
	 * Handle callback query (button clicks)
	 */
	private async handleCallbackQuery(callbackQuery: {
		id: string;
		from: { id: number; first_name: string };
		message?: { message_id: number; chat: { id: number } };
		data?: string;
	}): Promise<void> {
		const userId = callbackQuery.from.id;
		const chatId = callbackQuery.message?.chat.id;
		const data = callbackQuery.data;

		if (!chatId || !data) {
			logger.warn("Cannot handle callback query: missing chatId or data");
			return;
		}

		// Answer callback query to remove loading state
		await this.answerCallbackQuery(callbackQuery.id);

		// Handle role selection
		if (data.startsWith("role_")) {
			const newRole = data.replace("role_", "") as "user" | "admin";
			try {
				await this.userRepository.updateRole(userId, newRole);
				const roleName = newRole === "admin" ? "👑 Администратор" : "👤 Пользователь";
				await this.sendMessage(chatId, `✅ Роль успешно изменена на: ${roleName}`, true);
			} catch (error) {
				logger.error({ error, userId, newRole }, "Failed to update user role");
				await this.sendMessage(chatId, "❌ Ошибка при изменении роли. Попробуйте позже.", true);
			}
		}
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
	async sendMessage(chatId: number, text: string, useHtml: boolean = true): Promise<boolean> {
		if (!this.botToken) {
			logger.error("Cannot send message: TELEGRAM_BOT_TOKEN is not configured");
			return false;
		}

		try {
			const url = `${TELEGRAM_API_URL}${this.botToken}/sendMessage`;
			const messageBody: {
				chat_id: number;
				text: string;
				parse_mode?: string;
			} = {
				chat_id: chatId,
				text: useHtml ? this.sanitizeForTelegram(text) : text,
			};

			if (useHtml) {
				messageBody.parse_mode = "HTML";
			}

			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(messageBody),
			});

			if (!response.ok) {
				const errorText = await response.text();
				logger.error({ chatId, status: response.status, error: errorText }, "Failed to send Telegram message");
				return false;
			}

			logger.info({ chatId }, "Message sent successfully");
			return true;
		} catch (error) {
			logger.error({ error, chatId }, "Error sending Telegram message");
			return false;
		}
	}

	/**
	 * Send message with inline keyboard
	 */
	async sendMessageWithKeyboard(
		chatId: number,
		text: string,
		customKeyboard?: { inline_keyboard: Array<Array<{ text: string; callback_data?: string; web_app?: { url: string } }>> },
	): Promise<boolean> {
		if (!this.botToken) {
			logger.error("Cannot send message: TELEGRAM_BOT_TOKEN is not configured");
			return false;
		}

		try {
			const url = `${TELEGRAM_API_URL}${this.botToken}/sendMessage`;

			// Default keyboard with Mini App button
			const defaultKeyboard = {
				inline_keyboard: [
					[
						{
							text: "🚀 Открыть Mini App",
							web_app: {
								url: env.TELEGRAM_MINI_APP_URL || "https://t.me/your_bot/miniapp",
							},
						},
					],
				],
			};

			const keyboard = customKeyboard || defaultKeyboard;

			const messageBody: {
				chat_id: number;
				text: string;
				parse_mode?: string;
				reply_markup?: typeof keyboard;
			} = {
				chat_id: chatId,
				text: this.sanitizeForTelegram(text),
				parse_mode: "HTML",
				reply_markup: keyboard,
			};

			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(messageBody),
			});

			if (!response.ok) {
				const errorText = await response.text();
				logger.error({ chatId, status: response.status, error: errorText }, "Failed to send Telegram message with keyboard");
				return false;
			}

			logger.info({ chatId }, "Message with keyboard sent successfully");
			return true;
		} catch (error) {
			logger.error({ error, chatId }, "Error sending Telegram message with keyboard");
			return false;
		}
	}

	/**
	 * Answer callback query (remove loading state from button)
	 */
	private async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
		if (!this.botToken) {
			return;
		}

		try {
			const url = `${TELEGRAM_API_URL}${this.botToken}/answerCallbackQuery`;
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					callback_query_id: callbackQueryId,
					text: text,
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				logger.error({ callbackQueryId, status: response.status, error: errorText }, "Failed to answer callback query");
			}
		} catch (error) {
			logger.error({ error, callbackQueryId }, "Error answering callback query");
		}
	}

	/**
	 * Send notification to user by userId
	 */
	async sendNotification(userId: number, message: string): Promise<boolean> {
		try {
			// Get user's chatId from database
			const user = await this.userRepository.findById(userId);
			if (!user || !user.telegram_chat_id) {
				logger.warn({ userId }, "Cannot send notification: user not found or chatId not set");
				return false;
			}

			return await this.sendMessage(user.telegram_chat_id, message, true);
		} catch (error) {
			logger.error({ error, userId }, "Error sending notification");
			return false;
		}
	}
}

export const telegramBotService = new TelegramBotService();
