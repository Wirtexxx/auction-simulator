import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { OwnershipSchema } from "@/api-docs/modelSchemas";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { ownershipController } from "./ownershipController";
import { GetOwnershipSchema, GetOwnershipsSchema } from "./ownershipModel";

export const ownershipRegistry = new OpenAPIRegistry();
export const ownershipRouter: Router = express.Router();

// Register Ownership schema
ownershipRegistry.register("Ownership", OwnershipSchema);

// GET /ownerships - Get all ownerships
const GetOwnershipsQuerySchema = z.object({
	owner_id: z
		.string()
		.optional()
		.openapi({ param: { name: "owner_id", in: "query" }, description: "Filter by owner ID", example: "1" }),
	gift_id: z
		.string()
		.optional()
		.openapi({
			param: { name: "gift_id", in: "query" },
			description: "Filter by gift ID",
			example: "507f1f77bcf86cd799439012",
		}),
	limit: z
		.string()
		.optional()
		.openapi({ param: { name: "limit", in: "query" }, description: "Limit number of results", example: "10" }),
	offset: z
		.string()
		.optional()
		.openapi({ param: { name: "offset", in: "query" }, description: "Offset for pagination", example: "0" }),
});

ownershipRegistry.registerPath({
	method: "get",
	path: "/ownerships",
	tags: ["Ownership"],
	request: {
		query: GetOwnershipsQuerySchema,
	},
	responses: createApiResponse(z.array(OwnershipSchema), "List of ownerships"),
});

ownershipRouter.get("/", validateRequest(GetOwnershipsSchema), ownershipController.getOwnerships);

// GET /ownerships/{id} - Get ownership by ID
ownershipRegistry.registerPath({
	method: "get",
	path: "/ownerships/{id}",
	tags: ["Ownership"],
	request: {
		params: GetOwnershipSchema.shape.params,
	},
	responses: createApiResponse(OwnershipSchema, "Ownership retrieved successfully"),
});

ownershipRouter.get("/:id", validateRequest(GetOwnershipSchema), ownershipController.getOwnership);
