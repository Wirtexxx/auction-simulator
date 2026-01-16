import type { ErrorRequestHandler, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { pino } from "pino";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";

const logger = pino({ name: "errorHandler" });

const unexpectedRequest: RequestHandler = (_req, res) => {
	const serviceResponse = ServiceResponse.failure("Not Found", null, StatusCodes.NOT_FOUND);
	res.status(serviceResponse.statusCode).send(serviceResponse);
};

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	// Log error with full details (server-side only)
	logger.error(
		{
			error: err,
			message: err.message,
			stack: err.stack,
			url: req.url,
			method: req.method,
			ip: req.ip,
		},
		"Request error",
	);

	// Don't expose internal error details to client
	// Only show detailed errors in development
	if (env.isDevelopment) {
		const serviceResponse = ServiceResponse.failure(
			err.message || "Internal server error",
			null,
			err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
		);
		res.status(serviceResponse.statusCode).send(serviceResponse);
		return;
	}

	// In production, return generic error messages
	let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
	let message = "An error occurred";

	// Handle specific error types
	if (err.statusCode) {
		statusCode = err.statusCode;
		message = err.message || "An error occurred";
	} else if (err.name === "ValidationError") {
		statusCode = StatusCodes.BAD_REQUEST;
		message = "Invalid input data";
	} else if (err.name === "CastError") {
		statusCode = StatusCodes.BAD_REQUEST;
		message = "Invalid data format";
	} else if (err.name === "MongoServerError" || err.name === "MongoError") {
		// Don't expose MongoDB errors
		statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
		message = "Database error occurred";
	} else if (err.name === "JsonWebTokenError") {
		statusCode = StatusCodes.UNAUTHORIZED;
		message = "Invalid authentication token";
	} else if (err.name === "TokenExpiredError") {
		statusCode = StatusCodes.UNAUTHORIZED;
		message = "Authentication token expired";
	}

	const serviceResponse = ServiceResponse.failure(message, null, statusCode);
	res.status(serviceResponse.statusCode).send(serviceResponse);
};

export default (): [RequestHandler, ErrorRequestHandler] => [unexpectedRequest, errorHandler];
