import type { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import type { AuthenticatedRequest } from "./authenticate";

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
	if (!req.user) {
		const serviceResponse = ServiceResponse.failure("Authentication required", null, StatusCodes.UNAUTHORIZED);
		res.status(serviceResponse.statusCode).send(serviceResponse);
		return;
	}

	if (req.user.role !== "admin") {
		const serviceResponse = ServiceResponse.failure("Admin access required", null, StatusCodes.FORBIDDEN);
		res.status(serviceResponse.statusCode).send(serviceResponse);
		return;
	}

	next();
};
