import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { TelegramUpdate } from "./telegramBotModel";
import { telegramBotService } from "./telegramBotService";

export const telegramBotController = {
	/**
	 * Handle webhook updates from Telegram
	 */
	webhook: async (req: Request, res: Response): Promise<void> => {
		try {
			const update = req.body as TelegramUpdate;

			// Process update asynchronously (don't wait for it)
			telegramBotService.processUpdate(update).catch((error) => {
				console.error("Error processing Telegram update:", error);
			});

			// Always return 200 OK to Telegram
			// Telegram will retry if we return an error
			res.status(StatusCodes.OK).json({ ok: true });
		} catch (error) {
			console.error("Error in webhook handler:", error);
			// Still return 200 to prevent Telegram from retrying
			res.status(StatusCodes.OK).json({ ok: true });
		}
	},
};
