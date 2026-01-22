import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { RoundSchema } from "@/api-docs/modelSchemas";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { roundController } from "./roundController";
import { GetCurrentRoundSchema, GetRoundSchema, GetRoundsSchema } from "./roundModel";

export const roundRegistry = new OpenAPIRegistry();
export const roundRouter: Router = express.Router();

roundRegistry.register("Round", RoundSchema);

const GetRoundsQuerySchema = z.object({
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
		.openapi({ param: { name: "round_number", in: "query" }, description: "Filter by round number" }),
});

roundRegistry.registerPath({
	method: "get",
	path: "/rounds",
	tags: ["Round"],
	request: {
		query: GetRoundsQuerySchema,
	},
	responses: createApiResponse(z.array(RoundSchema), "List of rounds"),
});

roundRouter.get("/", validateRequest(GetRoundsSchema), roundController.getRounds);

roundRegistry.registerPath({
	method: "get",
	path: "/rounds/{id}",
	tags: ["Round"],
	request: {
		params: GetRoundSchema.shape.params,
	},
	responses: createApiResponse(RoundSchema, "Round retrieved successfully"),
});

// IMPORTANT: /current must be defined BEFORE /:id to avoid route conflicts
roundRegistry.registerPath({
	method: "get",
	path: "/rounds/current",
	tags: ["Round"],
	request: {
		query: GetCurrentRoundSchema.shape.query,
	},
	responses: createApiResponse(RoundSchema.nullable(), "Current round retrieved successfully"),
});

roundRouter.get("/current", validateRequest(GetCurrentRoundSchema), roundController.getCurrentRound);

roundRouter.get("/:id", validateRequest(GetRoundSchema), roundController.getRound);
