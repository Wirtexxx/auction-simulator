import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { type AuthResponse, userService } from "./userService";

export const userController = {
	authenticate: async (req: Request, res: Response) => {
		let { initData } = req.body;

		// Validate that initData is provided
		if (!initData) {
			const serviceResponse = ServiceResponse.failure(
				"initData is required",
				null as unknown as AuthResponse,
				StatusCodes.BAD_REQUEST,
			);
			res.status(serviceResponse.statusCode).send(serviceResponse);
			return;
		}

		// Validate that initData is a string
		if (typeof initData !== "string") {
			if (env.isDevelopment) {
				console.error("❌ initData is not a string:", typeof initData, initData);
			}
			const serviceResponse = ServiceResponse.failure(
				"initData must be a string",
				null as unknown as AuthResponse,
				StatusCodes.BAD_REQUEST,
			);
			res.status(serviceResponse.statusCode).send(serviceResponse);
			return;
		}

		// Handle case where initData might be a JSON-encoded string
		// (double-encoded: string -> JSON string -> JSON string)
		// This can happen if the frontend sends the string wrapped in JSON
		if (initData.startsWith('"') && initData.endsWith('"')) {
			try {
				const parsed = JSON.parse(initData);
				if (typeof parsed === "string") {
					initData = parsed;
					if (env.isDevelopment) {
						console.log("🔧 Unwrapped JSON-encoded initData in controller");
					}
				}
			} catch {
				// If JSON parsing fails, use as is
			}
		}

		// Validate that initData is not empty
		if (initData.length === 0) {
			const serviceResponse = ServiceResponse.failure(
				"initData cannot be empty",
				null as unknown as AuthResponse,
				StatusCodes.BAD_REQUEST,
			);
			res.status(serviceResponse.statusCode).send(serviceResponse);
			return;
		}

		// Validate that initData contains required fields
		if (!initData.includes("user=") || !initData.includes("auth_date=")) {
			if (env.isDevelopment) {
				console.error("❌ initData missing required fields:", {
					hasUser: initData.includes("user="),
					hasAuthDate: initData.includes("auth_date="),
					length: initData.length,
					preview: initData.substring(0, 100),
				});
			}
			const serviceResponse = ServiceResponse.failure(
				"Invalid initData format: missing required fields",
				null as unknown as AuthResponse,
				StatusCodes.BAD_REQUEST,
			);
			res.status(serviceResponse.statusCode).send(serviceResponse);
			return;
		}

		const serviceResponse = await userService.authenticateWithTelegram(initData);
		
		if (env.isDevelopment && serviceResponse.success) {
			console.log("✅ Authentication response:", {
				statusCode: serviceResponse.statusCode,
				message: serviceResponse.message,
				hasUser: !!serviceResponse.responseObject?.user,
				hasToken: !!serviceResponse.responseObject?.token,
				userId: serviceResponse.responseObject?.user?._id,
				userRole: serviceResponse.responseObject?.user?.role,
			});
		}
		
		res.status(serviceResponse.statusCode).send(serviceResponse);
	},

	getUser: async (req: Request, res: Response) => {
		const { id } = req.params;
		const serviceResponse = await userService.getUserById(Number(id));
		res.status(serviceResponse.statusCode).send(serviceResponse);
	},
};
