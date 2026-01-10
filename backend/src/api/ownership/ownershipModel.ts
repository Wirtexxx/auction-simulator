import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { OwnershipSchema } from "@/api-docs/modelSchemas";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

// Ownership type from modelSchemas
export type Ownership = z.infer<typeof OwnershipSchema>;

// Get Ownership Schema
export const GetOwnershipSchema = z
	.object({
		params: z.object({
			id: commonValidations.id,
		}),
	})
	.openapi({ title: "GetOwnership" });

// Get Ownerships List Schema (optional query params)
export const GetOwnershipsSchema = z
	.object({
		query: z
			.object({
				owner_id: z
					.string()
					.optional()
					.refine((data) => !data || !Number.isNaN(Number(data)), "owner_id must be a numeric value")
					.transform((data) => (data ? Number(data) : undefined))
					.openapi({ param: { name: "owner_id", in: "query" }, description: "Filter by owner ID", example: "1" }),
				gift_id: z
					.string()
					.optional()
					.openapi({ param: { name: "gift_id", in: "query" }, description: "Filter by gift ID", example: "507f1f77bcf86cd799439012" }),
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
	.openapi({ title: "GetOwnerships" });

