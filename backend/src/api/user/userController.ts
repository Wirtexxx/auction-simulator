import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { type AuthResponse, userService } from "./userService";

export const userController = {
	authenticate: async (req: Request, res: Response) => {
		let { initData } = req.body;

		if (typeof initData !== "string") {
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
		if (initData.startsWith('"') && initData.endsWith('"')) {
			try {
				const parsed = JSON.parse(initData);
				if (typeof parsed === "string") {
					initData = parsed;
				}
			} catch {
				// If JSON parsing fails, use as is
			}
		}

		const serviceResponse = await userService.authenticateWithTelegram(initData);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	},

	getUser: async (req: Request, res: Response) => {
		const { id } = req.params;
		const serviceResponse = await userService.getUserById(Number(id));
		res.status(serviceResponse.statusCode).send(serviceResponse);
	},
};
