import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";

import { WalletSchema } from "@/api-docs/modelSchemas";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authenticate } from "@/common/middleware/authenticate";
import { requireAdmin } from "@/common/middleware/requireAdmin";
import { validateRequest } from "@/common/utils/httpHandlers";
import { walletController } from "./walletController";
import { CreateWalletSchema, GetWalletSchema, UpdateWalletBalanceSchema } from "./walletModel";

export const walletRegistry = new OpenAPIRegistry();
export const walletRouter: Router = express.Router();

walletRegistry.register("Wallet", WalletSchema);

walletRegistry.registerPath({
	method: "post",
	path: "/wallets",
	tags: ["Wallet"],
	security: [{ Bearer: [] }],
	request: {
		body: {
			content: {
				"application/json": {
					schema: CreateWalletSchema.shape.body,
				},
			},
		},
	},
	responses: createApiResponse(WalletSchema, "Wallet created successfully", 201),
});

walletRouter.post("/", authenticate, requireAdmin, validateRequest(CreateWalletSchema), walletController.createWallet);

walletRegistry.registerPath({
	method: "get",
	path: "/wallets/{id}",
	tags: ["Wallet"],
	request: {
		params: GetWalletSchema.shape.params,
	},
	responses: createApiResponse(WalletSchema, "Wallet retrieved successfully"),
});

walletRouter.get("/:id", validateRequest(GetWalletSchema), walletController.getWallet);

walletRegistry.registerPath({
	method: "put",
	path: "/wallets/{id}",
	tags: ["Wallet"],
	security: [{ Bearer: [] }],
	request: {
		params: UpdateWalletBalanceSchema.shape.params,
		body: {
			content: {
				"application/json": {
					schema: UpdateWalletBalanceSchema.shape.body,
				},
			},
		},
	},
	responses: createApiResponse(WalletSchema, "Wallet balance updated successfully"),
});

walletRouter.put(
	"/:id",
	authenticate,
	requireAdmin,
	validateRequest(UpdateWalletBalanceSchema),
	walletController.updateWalletBalance,
);
