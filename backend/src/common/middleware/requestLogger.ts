import { randomUUID } from "node:crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import pino from "pino";
import pinoHttp from "pino-http";

import { env } from "@/common/utils/envConfig";
import type { AuthenticatedRequest } from "@/common/middleware/authenticate";

const logger = pino({
	level: env.isProduction ? "info" : "debug",
	transport: env.isProduction
		? undefined
		: {
				target: "pino-pretty",
				options: {
					colorize: true,
					translateTime: "HH:MM:ss Z",
					ignore: "pid,hostname",
				},
			},
	// Production: structured JSON logging
	...(env.isProduction && {
		formatters: {
			level: (label) => {
				return { level: label };
			},
		},
		timestamp: pino.stdTimeFunctions.isoTime,
	}),
});

const getLogLevel = (status: number) => {
	if (status >= StatusCodes.INTERNAL_SERVER_ERROR) return "error";
	if (status >= StatusCodes.BAD_REQUEST) return "warn";
	return "info";
};

const addRequestId = (req: Request, res: Response, next: NextFunction) => {
	const existingId = req.headers["x-request-id"] as string;
	const requestId = existingId || randomUUID();

	// Set for downstream use
	req.headers["x-request-id"] = requestId;
	res.setHeader("X-Request-Id", requestId);

	next();
};

// Track response time and size
const trackResponseMetrics = (req: Request, res: Response, next: NextFunction) => {
	const startTime = Date.now();
	const originalSend = res.send;

	res.send = function (body) {
		const responseTime = Date.now() - startTime;
		const responseSize = typeof body === "string" ? Buffer.byteLength(body, "utf8") : 0;

		// Store metrics in res.locals for logging
		res.locals.responseTime = responseTime;
		res.locals.responseSize = responseSize;

		return originalSend.call(this, body);
	};

	next();
};

const httpLogger = pinoHttp({
	logger,
	genReqId: (req) => req.headers["x-request-id"] as string,
	customLogLevel: (_req, res) => getLogLevel(res.statusCode),
	customSuccessMessage: (req) => `${req.method} ${req.url} completed`,
	customErrorMessage: (_req, res) => `Request failed with status code: ${res.statusCode}`,
	serializers: {
		req: (req) => {
			const serialized: Record<string, unknown> = {
				method: req.method,
				url: req.url,
				path: req.path,
				id: req.id,
			};

			// Production: add comprehensive request information
			if (env.isProduction) {
				// IP address (respects trust proxy)
				serialized.ip = req.ip || req.socket.remoteAddress || "unknown";
				serialized.remoteAddress = req.socket.remoteAddress;

				// Headers
				serialized.userAgent = req.get("user-agent") || undefined;
				serialized.referer = req.get("referer") || undefined;
				serialized.origin = req.get("origin") || undefined;

				// Query parameters
				if (req.query && Object.keys(req.query).length > 0) {
					serialized.query = req.query;
				}

				// User information (if authenticated)
				const authReq = req as AuthenticatedRequest;
				if (authReq.user) {
					serialized.user = {
						id: authReq.user._id,
						role: authReq.user.role,
					};
				}

				// Request body (sanitized for sensitive data)
				if (req.body && Object.keys(req.body).length > 0) {
					const sanitizedBody = { ...req.body };
					// Remove sensitive fields
					if (sanitizedBody.password) delete sanitizedBody.password;
					if (sanitizedBody.token) delete sanitizedBody.token;
					if (sanitizedBody.initData && typeof sanitizedBody.initData === "string") {
						// Log only initData length, not the full content
						sanitizedBody.initData = `[REDACTED: ${sanitizedBody.initData.length} chars]`;
					}
					serialized.body = sanitizedBody;
				}

				// Authorization header (only presence, not the token itself)
				if (req.headers.authorization) {
					serialized.hasAuth = true;
					const authHeader = req.headers.authorization;
					if (authHeader.startsWith("Bearer ")) {
						const token = authHeader.substring(7);
						serialized.authTokenLength = token.length;
					}
				}
			} else {
				// Development: more detailed logging
				if (req.body && Object.keys(req.body).length > 0) {
					serialized.body = req.body;
				}

				if (req.headers.authorization) {
					serialized.auth = req.headers.authorization;
				}

				if (req.query && Object.keys(req.query).length > 0) {
					serialized.query = req.query;
				}

				const authReq = req as AuthenticatedRequest;
				if (authReq.user) {
					serialized.user = {
						id: authReq.user._id,
						role: authReq.user.role,
					};
				}
			}

			return serialized;
		},
		res: (res) => {
			const serialized: Record<string, unknown> = {
				statusCode: res.statusCode,
			};

			// Production: add response metrics
			if (env.isProduction && res.locals) {
				if (res.locals.responseTime !== undefined) {
					serialized.responseTime = `${res.locals.responseTime}ms`;
				}
				if (res.locals.responseSize !== undefined) {
					serialized.responseSize = `${res.locals.responseSize} bytes`;
				}
			}

			return serialized;
		},
	},
	// Custom attributes for production logging
	customProps: (req: Request, res: Response) => {
		if (!env.isProduction) {
			return {};
		}

		const props: Record<string, unknown> = {
			timestamp: new Date().toISOString(),
		};

		// Add response time if available
		if (res.locals.responseTime !== undefined) {
			props.responseTime = res.locals.responseTime;
		}

		// Add response size if available
		if (res.locals.responseSize !== undefined) {
			props.responseSize = res.locals.responseSize;
		}

		return props;
	},
});

const captureResponseBody = (_req: Request, res: Response, next: NextFunction) => {
	if (!env.isProduction) {
		const originalSend = res.send;
		res.send = function (body) {
			res.locals.responseBody = body;
			return originalSend.call(this, body);
		};
	}
	next();
};

const requestLoggerMiddleware: RequestHandler[] = [
	addRequestId,
	trackResponseMetrics,
	captureResponseBody,
	httpLogger,
];

export default requestLoggerMiddleware;
