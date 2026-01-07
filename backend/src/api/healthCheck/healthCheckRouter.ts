import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Request, type Response, type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { getMongoConnectionStatus } from "@/common/db/mongodb";
import { getRedisConnectionStatus } from "@/common/db/redis";
import { ServiceResponse } from "@/common/models/serviceResponse";

export const healthCheckRegistry = new OpenAPIRegistry();

const HealthCheckSchema = z.object({
	status: z.string(),
	mongodb: z.boolean(),
	redis: z.boolean(),
	timestamp: z.string(),
});

healthCheckRegistry.registerPath({
	method: "get",
	path: "/health-check",
	tags: ["Health Check"],
	responses: createApiResponse(HealthCheckSchema, "Service health status"),
});

export const healthCheckRouter: Router = express.Router();

healthCheckRouter.get("/", (_req: Request, res: Response) => {
	const mongodbStatus = getMongoConnectionStatus();
	const redisStatus = getRedisConnectionStatus();
	const isHealthy = mongodbStatus && redisStatus;

	const healthData = {
		status: isHealthy ? "healthy" : "degraded",
		mongodb: mongodbStatus,
		redis: redisStatus,
		timestamp: new Date().toISOString(),
	};

	const serviceResponse = isHealthy
		? ServiceResponse.success("Service is healthy", healthData)
		: ServiceResponse.failure("Service is degraded", healthData);

	res.status(serviceResponse.statusCode).send(serviceResponse);
});
