import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { metricsService } from "@/common/metrics/metricsService";

/**
 * Get Prometheus metrics
 * GET /metrics
 */
export async function getMetrics(_req: Request, res: Response): Promise<void> {
	try {
		const metrics = await metricsService.getMetrics();
		res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
		res.status(StatusCodes.OK).send(metrics);
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
			`Error generating metrics: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
