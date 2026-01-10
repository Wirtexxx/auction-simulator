import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { CollectionSchema } from "@/api-docs/modelSchemas";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authenticate } from "@/common/middleware/authenticate";
import { requireAdmin } from "@/common/middleware/requireAdmin";
import { validateRequest } from "@/common/utils/httpHandlers";
import { collectionController } from "./collectionController";
import {
	CreateCollectionSchema,
	DeleteCollectionSchema,
	GetCollectionSchema,
	GetCollectionsSchema,
} from "./collectionModel";

export const collectionRegistry = new OpenAPIRegistry();
export const collectionRouter: Router = express.Router();

// Register Collection schema
collectionRegistry.register("Collection", CollectionSchema);

// POST /collections - Create collection
collectionRegistry.registerPath({
	method: "post",
	path: "/collections",
	tags: ["Collection"],
	security: [{ Bearer: [] }],
	request: {
		body: {
			content: {
				"application/json": {
					schema: CreateCollectionSchema.shape.body,
				},
			},
		},
	},
	responses: createApiResponse(CollectionSchema, "Collection created successfully with gifts", 201),
});

collectionRouter.post(
	"/",
	authenticate,
	requireAdmin,
	validateRequest(CreateCollectionSchema),
	collectionController.createCollection,
);

// GET /collections - Get all collections
const GetCollectionsQuerySchema = z.object({
	limit: z
		.string()
		.optional()
		.openapi({ param: { name: "limit", in: "query" }, description: "Limit number of results", example: "10" }),
	offset: z
		.string()
		.optional()
		.openapi({ param: { name: "offset", in: "query" }, description: "Offset for pagination", example: "0" }),
});

collectionRegistry.registerPath({
	method: "get",
	path: "/collections",
	tags: ["Collection"],
	request: {
		query: GetCollectionsQuerySchema,
	},
	responses: createApiResponse(z.array(CollectionSchema), "List of collections"),
});

collectionRouter.get("/", validateRequest(GetCollectionsSchema), collectionController.getCollections);

// GET /collections/{id} - Get collection by ID
collectionRegistry.registerPath({
	method: "get",
	path: "/collections/{id}",
	tags: ["Collection"],
	request: {
		params: GetCollectionSchema.shape.params,
	},
	responses: createApiResponse(CollectionSchema, "Collection retrieved successfully"),
});

collectionRouter.get("/:id", validateRequest(GetCollectionSchema), collectionController.getCollection);

// DELETE /collections/{id} - Delete collection and all associated gifts
const DeleteCollectionResponseSchema = z.object({
	deletedGifts: z.number().openapi({ description: "Number of deleted gifts" }),
});

collectionRegistry.registerPath({
	method: "delete",
	path: "/collections/{id}",
	tags: ["Collection"],
	security: [{ Bearer: [] }],
	request: {
		params: DeleteCollectionSchema.shape.params,
	},
	responses: createApiResponse(DeleteCollectionResponseSchema, "Collection and associated gifts deleted successfully"),
});

collectionRouter.delete(
	"/:id",
	authenticate,
	requireAdmin,
	validateRequest(DeleteCollectionSchema),
	collectionController.deleteCollection,
);
