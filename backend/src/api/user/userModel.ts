import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { UserSchema } from "@/api-docs/modelSchemas";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

// User type from modelSchemas
export type User = z.infer<typeof UserSchema>;

// Register/Login Schema (using Telegram initData)
export const TelegramAuthSchema = z
	.object({
		body: z.object({
			initData: z
				.string()
				.min(1)
				.openapi({
					description: "Telegram Mini App init data (raw string from tgWebAppData)",
					example: "query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A279058397...&hash=...",
				}),
		}),
	})
	.openapi({ title: "TelegramAuth" });

// Auth Response Schema
export const AuthResponseSchema = z
	.object({
		user: UserSchema,
		token: z.string().openapi({ description: "JWT authentication token" }),
	})
	.openapi({ title: "AuthResponse" });

// Get User Schema
export const GetUserSchema = z
	.object({
		params: z.object({
			id: commonValidations.id,
		}),
	})
	.openapi({ title: "GetUser" });
