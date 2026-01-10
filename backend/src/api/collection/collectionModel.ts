import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import type { CollectionSchema } from "@/api-docs/modelSchemas";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

// Collection type from modelSchemas
export type Collection = z.infer<typeof CollectionSchema>;

// Create Collection Schema
export const CreateCollectionSchema = z
	.object({
		body: z.object({
			title: z.string().min(1).openapi({ description: "Collection title", example: "Summer Collection" }),
			description: z
				.string()
				.optional()
				.openapi({ description: "Collection description", example: "A beautiful summer collection" }),
			total_amount: z
				.number()
				.int()
				.positive()
				.openapi({ description: "Total number of gifts to create", example: 100 }),
			emoji: z.string().min(1).openapi({ description: "Emoji for all gifts in collection", example: "🎁" }),
		}),
	})
	.openapi({ title: "CreateCollection" });

// Get Collection Schema
export const GetCollectionSchema = z
	.object({
		params: z.object({
			id: commonValidations.id,
		}),
	})
	.openapi({ title: "GetCollection" });

// Get Collections List Schema (optional query params)
export const GetCollectionsSchema = z
	.object({
		query: z
			.object({
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
	.openapi({ title: "GetCollections" });

// Delete Collection Schema
export const DeleteCollectionSchema = z
	.object({
		params: z.object({
			id: commonValidations.id,
		}),
	})
	.openapi({ title: "DeleteCollection" });
