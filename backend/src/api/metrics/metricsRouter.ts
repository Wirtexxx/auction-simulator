import { type Router as ExpressRouter, Router } from "express";
import { getMetrics } from "./metricsController";

const metricsRouter: ExpressRouter = Router();

/**
 * @route GET /metrics
 * @desc Get Prometheus metrics
 * @access Public (can be protected in production)
 */
metricsRouter.get("/", getMetrics);

export { metricsRouter };
