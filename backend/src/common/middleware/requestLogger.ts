import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import pino from "pino";
import pinoHttp from "pino-http";

import { env } from "@/common/utils/envConfig";

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
				id: req.id,
			};

			if (req.body && Object.keys(req.body).length > 0) {
				serialized.body = req.body;
			}

			if (req.headers.authorization) {
				serialized.auth = req.headers.authorization;
			}

			return serialized;
		},
		res: (res) => ({
			statusCode: res.statusCode,
		}),
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

export default [addRequestId, captureResponseBody, httpLogger];
