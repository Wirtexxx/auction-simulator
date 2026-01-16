import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import type { GiftSchema } from "@/api-docs/modelSchemas";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

// Gift type from modelSchemas
export type Gift = z.infer<typeof GiftSchema>;

// Create Gift Schema
export const CreateGiftSchema = z
	.object({
		body: z.object({
			emoji: z.string().min(1).openapi({ description: "Gift emoji", example: "🎁" }),
			collection_id: z
				.string()
				.min(1)
				.openapi({ description: "Collection MongoDB ObjectId", example: "507f1f77bcf86cd799439011" }),
		}),
	})
	.openapi({ title: "CreateGift" });

// Get Gift Schema
export const GetGiftSchema = z
	.object({
		params: z.object({
			id: commonValidations.mongoId,
		}),
	})
	.openapi({ title: "GetGift" });

// Get Gifts List Schema (optional query params)
export const GetGiftsSchema = z
	.object({
		query: z
			.object({
				collection_id: z
					.string()
					.optional()
					.openapi({ param: { name: "collection_id", in: "query" }, description: "Filter by collection ID" }),
				limit: z
					.string()
					.optional()
					.refine((data) => !data || !Number.isNaN(Number(data)), "Limit must be a numeric value")
					.transform((data) => (data ? Number(data) : undefined))
					.refine((num) => !num || num > 0, "Limit must be a positive number")
					.openapi({ param: { name: "limit", in: "query" }, description: "Limit number of results", example: "10" }),
				offset: z
					.string()
					.optional()
					.refine((data) => !data || !Number.isNaN(Number(data)), "Offset must be a numeric value")
					.transform((data) => (data ? Number(data) : undefined))
					.refine((num) => !num || num >= 0, "Offset must be a non-negative number")
					.openapi({ param: { name: "offset", in: "query" }, description: "Offset for pagination", example: "0" }),
			})
			.optional(),
	})
	.openapi({ title: "GetGifts" });
