import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";

/**
 * MongoDB ObjectId Validation Middleware
 *
 * Validates that MongoDB ObjectIds in route parameters are valid.
 * Prevents path traversal and injection attacks.
 */
export const objectIdValidation = (req: Request, res: Response, next: NextFunction): void => {
	// MongoDB ObjectId regex: 24 hex characters
	const objectIdRegex = /^[0-9a-fA-F]{24}$/;

	// Check all route parameters
	for (const key in req.params) {
		if (Object.hasOwn(req.params, key)) {
			const value = req.params[key];

			// If parameter name suggests it's an ID (id, _id, collection_id, etc.)
			if (typeof value === "string" && (key.toLowerCase().includes("id") || key.toLowerCase().endsWith("id"))) {
				// Check if it looks like a MongoDB ObjectId
				if (value.length === 24 && !objectIdRegex.test(value)) {
					const serviceResponse = ServiceResponse.failure(
						`Invalid ${key}: must be a valid MongoDB ObjectId`,
						null,
						StatusCodes.BAD_REQUEST,
					);
					res.status(serviceResponse.statusCode).send(serviceResponse);
					return;
				}

				// Additional check: prevent path traversal attempts
				if (value.includes("..") || value.includes("/") || value.includes("\\")) {
					const serviceResponse = ServiceResponse.failure(
						`Invalid ${key}: path traversal detected`,
						null,
						StatusCodes.BAD_REQUEST,
					);
					res.status(serviceResponse.statusCode).send(serviceResponse);
					return;
				}
			}
		}
	}

	next();
};
