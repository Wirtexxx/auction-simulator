import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { AuctionSchema } from "@/api-docs/modelSchemas";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authenticate } from "@/common/middleware/authenticate";
import { requireAdmin } from "@/common/middleware/requireAdmin";
import { validateRequest } from "@/common/utils/httpHandlers";
import { auctionController } from "./auctionController";
import { CreateAuctionSchema, GetAuctionSchema, GetAuctionsSchema, StartAuctionSchema, FinishAuctionSchema } from "./auctionModel";

export const auctionRegistry = new OpenAPIRegistry();
export const auctionRouter: Router = express.Router();

auctionRegistry.register("Auction", AuctionSchema);

auctionRegistry.registerPath({
	method: "post",
	path: "/auctions",
	tags: ["Auction"],
	security: [{ Bearer: [] }],
	request: {
		body: {
			content: {
				"application/json": {
					schema: CreateAuctionSchema.shape.body,
				},
			},
		},
	},
	responses: createApiResponse(AuctionSchema, "Auction created successfully", 201),
});

auctionRouter.post(
	"/",
	authenticate,
	requireAdmin,
	validateRequest(CreateAuctionSchema),
	auctionController.createAuction,
);

const GetAuctionsQuerySchema = z.object({
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
		.openapi({ param: { name: "limit", in: "query" }, description: "Limit number of results", example: "10" }),
	offset: z
		.string()
		.optional()
		.openapi({ param: { name: "offset", in: "query" }, description: "Offset for pagination", example: "0" }),
});

auctionRegistry.registerPath({
	method: "get",
	path: "/auctions",
	tags: ["Auction"],
	request: {
		query: GetAuctionsQuerySchema,
	},
	responses: createApiResponse(z.array(AuctionSchema), "List of auctions"),
});

auctionRouter.get("/", validateRequest(GetAuctionsSchema), auctionController.getAuctions);

auctionRegistry.registerPath({
	method: "get",
	path: "/auctions/{id}",
	tags: ["Auction"],
	request: {
		params: GetAuctionSchema.shape.params,
	},
	responses: createApiResponse(AuctionSchema, "Auction retrieved successfully"),
});

auctionRouter.get("/:id", validateRequest(GetAuctionSchema), auctionController.getAuction);

// Start auction endpoint
auctionRegistry.registerPath({
	method: "post",
	path: "/auctions/{id}/start",
	tags: ["Auction"],
	security: [{ Bearer: [] }],
	request: {
		params: StartAuctionSchema.shape.params,
	},
	responses: createApiResponse(AuctionSchema, "Auction started successfully"),
});

auctionRouter.post(
	"/:id/start",
	authenticate,
	requireAdmin,
	validateRequest(StartAuctionSchema),
	auctionController.startAuction,
);

// Finish auction endpoint
auctionRegistry.registerPath({
	method: "post",
	path: "/auctions/{id}/finish",
	tags: ["Auction"],
	security: [{ Bearer: [] }],
	request: {
		params: FinishAuctionSchema.shape.params,
	},
	responses: createApiResponse(AuctionSchema, "Auction finished successfully"),
});

auctionRouter.post(
	"/:id/finish",
	authenticate,
	requireAdmin,
	validateRequest(FinishAuctionSchema),
	auctionController.finishAuction,
);
