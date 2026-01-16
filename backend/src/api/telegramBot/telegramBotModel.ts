import { z } from "zod";

// Telegram Update schema (simplified version of Telegram Bot API Update object)
export const TelegramUpdateSchema = z.object({
	update_id: z.number(),
	message: z
		.object({
			message_id: z.number(),
			from: z.object({
				id: z.number(),
				is_bot: z.boolean().optional(),
				first_name: z.string(),
				last_name: z.string().optional(),
				username: z.string().optional(),
				language_code: z.string().optional(),
			}),
			chat: z.object({
				id: z.number(),
				type: z.string(),
				first_name: z.string().optional(),
				last_name: z.string().optional(),
				username: z.string().optional(),
			}),
			date: z.number(),
			text: z.string().optional(),
		})
		.optional(),
	edited_message: z.any().optional(),
	channel_post: z.any().optional(),
	edited_channel_post: z.any().optional(),
});

export type TelegramUpdate = z.infer<typeof TelegramUpdateSchema>;

// Webhook request schema
export const TelegramWebhookSchema = z.object({
	body: TelegramUpdateSchema,
});
