import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { UserSchema } from "@/api-docs/modelSchemas";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";
import { AuthResponseSchema, GetUserSchema, TelegramAuthSchema } from "./userModel";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

// Register User schema
userRegistry.register("User", UserSchema);

// POST /users/authenticate - Authenticate/Register using Telegram initData
userRegistry.registerPath({
	method: "post",
	path: "/users/authenticate",
	tags: ["User"],
	request: {
		body: {
			content: {
				"application/json": {
					schema: TelegramAuthSchema.shape.body,
				},
			},
		},
	},
	responses: createApiResponse(AuthResponseSchema, "Authentication successful"),
});

userRouter.post("/authenticate", validateRequest(TelegramAuthSchema), userController.authenticate);

// GET /users/{id} - Get user by ID
userRegistry.registerPath({
	method: "get",
	path: "/users/{id}",
	tags: ["User"],
	request: {
		params: GetUserSchema.shape.params,
	},
	responses: createApiResponse(UserSchema, "User retrieved successfully"),
});

userRouter.get("/:id", validateRequest(GetUserSchema), userController.getUser);
