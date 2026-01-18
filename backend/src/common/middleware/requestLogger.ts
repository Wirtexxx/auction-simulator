import { randomUUID } from "node:crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import pino from "pino";
import pinoHttp from "pino-http";

import { env } from "@/common/utils/envConfig";
import type { AuthenticatedRequest } from "@/common/middleware/authenticate";

// Logger instance
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
	formatters: env.isProduction
		? {
				level: (label) => ({ level: label }),
		  }
		: undefined,
	timestamp: env.isProduction ? pino.stdTimeFunctions.isoTime : undefined,
});

// Determine log level based on status code
const getLogLevel = (status: number) => {
	if (status >= StatusCodes.INTERNAL_SERVER_ERROR) return "error";
	if (status >= StatusCodes.BAD_REQUEST) return "warn";
	return "info";
};

// Add request ID
const addRequestId = (req: Request, res: Response, next: NextFunction) => {
	const existingId = req.headers["x-request-id"] as string;
	const requestId = existingId || randomUUID();

	req.headers["x-request-id"] = requestId;
	res.setHeader("X-Request-Id", requestId);

	next();
};

// Track response time and size
const trackResponseMetrics = (req: Request, res: Response, next: NextFunction) => {
	const startTime = Date.now();
	const originalSend = res.send.bind(res);

	res.send = function (body: any) {
		const responseTime = Date.now() - startTime;
		const responseSize = typeof body === "string" ? Buffer.byteLength(body, "utf8") : 0;

		res.locals = res.locals || {};
		res.locals.responseTime = responseTime;
		res.locals.responseSize = responseSize;

		return originalSend(body);
	};

	next();
};

// Capture response body (only for dev)
const captureResponseBody = (_req: Request, res: Response, next: NextFunction) => {
	if (!env.isProduction) {
		const originalSend = res.send.bind(res);
		res.send = function (body: any) {
			res.locals = res.locals || {};
			res.locals.responseBody = body;
			return originalSend(body);
		};
	}
	next();
};

// Pino HTTP logger
const httpLogger = pinoHttp({
	logger,
	genReqId: (req) => req.headers["x-request-id"] as string,
	customLogLevel: (_req, res) => getLogLevel(res.statusCode),
	customSuccessMessage: (req) => `${req.method} ${req.url} completed`,
	customErrorMessage: (_req, res) => `Request failed with status code: ${res.statusCode}`,
	serializers: {
		req: (req: Request) => {
			const authReq = req as AuthenticatedRequest;
			const serialized: Record<string, unknown> = {
				method: req.method,
				url: req.url,
				path: req.path,
				id: req.headers["x-request-id"] || undefined,
				ip: req.ip || req.socket?.remoteAddress || "unknown",
			};

			// Add headers
			if (req.headers) {
				serialized.userAgent = req.headers["user-agent"];
				serialized.referer = req.headers.referer || req.headers.referrer;
				serialized.origin = req.headers.origin;
				serialized.hasAuth = !!req.headers.authorization;
			}

			// Add query
			if (req.query && Object.keys(req.query).length > 0) {
				serialized.query = req.query;
			}

			// Add sanitized body
			if (req.body && Object.keys(req.body).length > 0) {
				const bodyCopy = { ...req.body };
				delete bodyCopy.password;
				delete bodyCopy.token;
				serialized.body = bodyCopy;
			}

			// Add user info
			if (authReq.user) {
				serialized.user = { id: authReq.user._id, role: authReq.user.role };
			}

			return serialized;
		},
		res: (res: Response) => {
			const serialized: Record<string, unknown> = {
				statusCode: res.statusCode,
			};
			if (res.locals) {
				if (res.locals.responseTime !== undefined) serialized.responseTime = `${res.locals.responseTime}ms`;
				if (res.locals.responseSize !== undefined) serialized.responseSize = `${res.locals.responseSize} bytes`;
			}
			return serialized;
		},
	},
	customProps: (_req: Request, res: Response) => {
		const props: Record<string, unknown> = {};
		if (env.isProduction && res.locals) {
			if (res.locals.responseTime !== undefined) props.responseTime = res.locals.responseTime;
			if (res.locals.responseSize !== undefined) props.responseSize = res.locals.responseSize;
		}
		return props;
	},
});

// Export middleware array
const requestLoggerMiddleware: RequestHandler[] = [
	addRequestId,
	trackResponseMetrics,
	captureResponseBody,
	httpLogger,
];

export default requestLoggerMiddleware;
