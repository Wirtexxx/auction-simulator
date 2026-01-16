import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export const RoundSchema = z
	.object({
		_id: z.string().openapi({ description: "Round MongoDB ObjectId", example: "507f1f77bcf86cd799439014" }),
		auction_id: z.string().openapi({ description: "Auction MongoDB ObjectId", example: "507f1f77bcf86cd799439013" }),
		round_number: z.number().openapi({ description: "Round number", example: 1 }),
		gift_ids: z
			.array(z.string())
			.openapi({ description: "Array of gift IDs in this round", example: ["507f1f77bcf86cd799439011"] }),
		started_at: z.date().openapi({ description: "Round start timestamp", example: "2024-01-01T00:00:00.000Z" }),
		ended_at: z
			.date()
			.nullable()
			.optional()
			.openapi({ description: "Round end timestamp", example: "2024-01-01T00:05:00.000Z" }),
		status: z.enum(["active", "finished"]).openapi({ description: "Round status", example: "active" }),
	})
	.openapi({ title: "Round", description: "Round model" });

export type Round = z.infer<typeof RoundSchema>;

export const GetRoundSchema = z
	.object({
		params: z.object({
			id: commonValidations.mongoId,
		}),
	})
	.openapi({ title: "GetRound" });

export const GetRoundsSchema = z
	.object({
		query: z
			.object({
				auction_id: z
					.string()
					.optional()
					.openapi({ param: { name: "auction_id", in: "query" }, description: "Filter by auction ID" }),
				status: z
					.enum(["active", "finished"])
					.optional()
					.openapi({ param: { name: "status", in: "query" }, description: "Filter by status" }),
				round_number: z
					.string()
					.optional()
					.refine((data) => !data || !Number.isNaN(Number(data)), "Round number must be a numeric value")
					.transform((data) => (data ? Number(data) : undefined))
					.openapi({ param: { name: "round_number", in: "query" }, description: "Filter by round number" }),
			})
			.optional(),
	})
	.openapi({ title: "GetRounds" });
