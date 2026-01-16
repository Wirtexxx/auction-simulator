import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { GiftSchema } from "@/api-docs/modelSchemas";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authenticate } from "@/common/middleware/authenticate";
import { requireAdmin } from "@/common/middleware/requireAdmin";
import { validateRequest } from "@/common/utils/httpHandlers";
import { giftController } from "./giftController";
import { CreateGiftSchema, GetGiftSchema, GetGiftsSchema } from "./giftModel";

export const giftRegistry = new OpenAPIRegistry();
export const giftRouter: Router = express.Router();

// Register Gift schema
giftRegistry.register("Gift", GiftSchema);

// POST /gifts - Create gift
giftRegistry.registerPath({
	method: "post",
	path: "/gifts",
	tags: ["Gift"],
	security: [{ Bearer: [] }],
	request: {
		body: {
			content: {
				"application/json": {
					schema: CreateGiftSchema.shape.body,
				},
			},
		},
	},
	responses: createApiResponse(GiftSchema, "Gift created successfully", 201),
});

giftRouter.post("/", authenticate, requireAdmin, validateRequest(CreateGiftSchema), giftController.createGift);

// GET /gifts - Get all gifts
const GetGiftsQuerySchema = z.object({
	collection_id: z
		.string()
		.optional()
		.openapi({ param: { name: "collection_id", in: "query" }, description: "Filter by collection ID" }),
	limit: z
		.string()
		.optional()
		.openapi({ param: { name: "limit", in: "query" }, description: "Limit number of results", example: "10" }),
	offset: z
		.string()
		.optional()
		.openapi({ param: { name: "offset", in: "query" }, description: "Offset for pagination", example: "0" }),
});

giftRegistry.registerPath({
	method: "get",
	path: "/gifts",
	tags: ["Gift"],
	request: {
		query: GetGiftsQuerySchema,
	},
	responses: createApiResponse(z.array(GiftSchema), "List of gifts"),
});

giftRouter.get("/", validateRequest(GetGiftsSchema), giftController.getGifts);

// GET /gifts/{id} - Get gift by ID
giftRegistry.registerPath({
	method: "get",
	path: "/gifts/{id}",
	tags: ["Gift"],
	request: {
		params: GetGiftSchema.shape.params,
	},
	responses: createApiResponse(GiftSchema, "Gift retrieved successfully"),
});

giftRouter.get("/:id", validateRequest(GetGiftSchema), giftController.getGift);
