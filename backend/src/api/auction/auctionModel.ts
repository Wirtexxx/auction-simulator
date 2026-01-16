import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { AuctionSchema } from "@/api-docs/modelSchemas";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type Auction = z.infer<typeof AuctionSchema>;

export const CreateAuctionSchema = z
	.object({
		body: z.object({
			collection_id: z
				.string()
				.min(1)
				.openapi({ description: "Collection MongoDB ObjectId", example: "507f1f77bcf86cd799439011" }),
			round_duration: z
				.number()
				.int()
				.positive()
				.openapi({ description: "Round duration in seconds", example: 300 }),
			gifts_per_round: z
				.number()
				.int()
				.positive()
				.openapi({ description: "Number of gifts per round", example: 5 }),
		}),
	})
	.openapi({ title: "CreateAuction" });

export const GetAuctionSchema = z
	.object({
		params: z.object({
			id: commonValidations.mongoId,
		}),
	})
	.openapi({ title: "GetAuction" });

export const GetAuctionsSchema = z
	.object({
		query: z
			.object({
				collection_id: z
					.string()
					.optional()
					.openapi({ param: { name: "collection_id", in: "query" }, description: "Filter by collection ID" }),
				status: z
					.enum(["active", "finished"])
					.optional()
					.openapi({ param: { name: "status", in: "query" }, description: "Filter by status" }),
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
	.openapi({ title: "GetAuctions" });

export const StartAuctionSchema = z
	.object({
		params: z.object({
			id: commonValidations.mongoId,
		}),
	})
	.openapi({ title: "StartAuction" });

export const FinishAuctionSchema = z
	.object({
		params: z.object({
			id: commonValidations.mongoId,
		}),
	})
	.openapi({ title: "FinishAuction" });


