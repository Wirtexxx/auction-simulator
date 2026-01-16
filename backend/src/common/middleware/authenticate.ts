import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import User from "@/models/User";

export interface AuthenticatedRequest extends Request {
	user?: {
		_id: number;
		role: "user" | "admin";
	};
}

export const authenticate = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			const serviceResponse = ServiceResponse.failure(
				"Authorization token required",
				null,
				StatusCodes.UNAUTHORIZED,
			);
			res.status(serviceResponse.statusCode).send(serviceResponse);
			return;
		}

		const token = authHeader.substring(7);

		try {
			const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number };

			const user = await User.findById(decoded.userId);

			if (!user) {
				const serviceResponse = ServiceResponse.failure(
					"User not found",
					null,
					StatusCodes.UNAUTHORIZED,
				);
				res.status(serviceResponse.statusCode).send(serviceResponse);
				return;
			}

			req.user = {
				_id: user._id,
				role: user.role,
			};

			next();
		} catch (error) {
			const serviceResponse = ServiceResponse.failure(
				"Invalid or expired token",
				null,
				StatusCodes.UNAUTHORIZED,
			);
			res.status(serviceResponse.statusCode).send(serviceResponse);
		}
	} catch (error) {
		const serviceResponse = ServiceResponse.failure(
			"Authentication failed",
			null,
			StatusCodes.INTERNAL_SERVER_ERROR,
		);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	}
};


