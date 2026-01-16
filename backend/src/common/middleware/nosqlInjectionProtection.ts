import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";

/**
 * NoSQL Injection Protection Middleware
 * 
 * Protects against MongoDB operator injection attacks by sanitizing
 * request body, query parameters, and route parameters.
 * 
 * Blocks dangerous MongoDB operators:
 * - $where, $ne, $gt, $gte, $lt, $lte, $in, $nin, $exists, $regex, $or, $and, $nor, $not
 * - $expr, $jsonSchema, $text, $mod, $type, $size, $all, $elemMatch
 */
export const nosqlInjectionProtection = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	try {
		// Dangerous MongoDB operators to block
		const dangerousOperators = [
			"$where",
			"$ne",
			"$gt",
			"$gte",
			"$lt",
			"$lte",
			"$in",
			"$nin",
			"$exists",
			"$regex",
			"$or",
			"$and",
			"$nor",
			"$not",
			"$expr",
			"$jsonSchema",
			"$text",
			"$mod",
			"$type",
			"$size",
			"$all",
			"$elemMatch",
			"$geoWithin",
			"$geoIntersects",
			"$near",
			"$nearSphere",
		];

		/**
		 * Recursively check object for dangerous operators
		 */
		const checkForDangerousOperators = (obj: any, path: string = ""): string | null => {
			if (obj === null || obj === undefined) {
				return null;
			}

			// Check if obj is an object (not array, not Date, not RegExp)
			if (typeof obj === "object" && !Array.isArray(obj) && !(obj instanceof Date) && !(obj instanceof RegExp)) {
				for (const key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) {
						const currentPath = path ? `${path}.${key}` : key;

						// Check if key is a dangerous operator
						if (dangerousOperators.includes(key)) {
							return `Dangerous MongoDB operator detected: ${currentPath}`;
						}

						// Recursively check nested objects
						const nestedResult = checkForDangerousOperators(obj[key], currentPath);
						if (nestedResult) {
							return nestedResult;
						}
					}
				}
			} else if (Array.isArray(obj)) {
				// Check array elements
				for (let i = 0; i < obj.length; i++) {
					const arrayResult = checkForDangerousOperators(obj[i], `${path}[${i}]`);
					if (arrayResult) {
						return arrayResult;
					}
				}
			}

			return null;
		};

		// Check request body
		if (req.body && typeof req.body === "object") {
			const bodyError = checkForDangerousOperators(req.body, "body");
			if (bodyError) {
				const serviceResponse = ServiceResponse.failure(
					"Invalid request: potentially dangerous input detected",
					null,
					StatusCodes.BAD_REQUEST,
				);
				res.status(serviceResponse.statusCode).send(serviceResponse);
				return;
			}
		}

		// Check query parameters
		if (req.query && typeof req.query === "object") {
			const queryError = checkForDangerousOperators(req.query, "query");
			if (queryError) {
				const serviceResponse = ServiceResponse.failure(
					"Invalid request: potentially dangerous input detected",
					null,
					StatusCodes.BAD_REQUEST,
				);
				res.status(serviceResponse.statusCode).send(serviceResponse);
				return;
			}
		}

		// Check route parameters
		if (req.params && typeof req.params === "object") {
			const paramsError = checkForDangerousOperators(req.params, "params");
			if (paramsError) {
				const serviceResponse = ServiceResponse.failure(
					"Invalid request: potentially dangerous input detected",
					null,
					StatusCodes.BAD_REQUEST,
				);
				res.status(serviceResponse.statusCode).send(serviceResponse);
				return;
			}
		}

		next();
	} catch (error) {
		const serviceResponse = ServiceResponse.failure(
			"Request validation failed",
			null,
			StatusCodes.BAD_REQUEST,
		);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	}
};
