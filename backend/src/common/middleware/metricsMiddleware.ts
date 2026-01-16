import type { NextFunction, Request, Response } from "express";
import { metricsService } from "../metrics/metricsService";

/**
 * Middleware to collect HTTP metrics automatically
 * Measures request duration and counts requests
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
	const startTime = Date.now();

	// Get route path (normalize to remove IDs)
	const route = normalizeRoute(req.route?.path || req.path);

	// Override res.end to capture response time
	const originalEnd = res.end.bind(res);

	// Type assertion to handle Express Response.end overloads
	res.end = ((chunk?: unknown, encoding?: unknown, cb?: () => void): Response => {
		const duration = (Date.now() - startTime) / 1000; // Convert to seconds
		const statusCode = res.statusCode.toString();

		// Record request duration
		metricsService.httpRequestDurationSeconds.observe(
			{
				method: req.method,
				route,
				status_code: statusCode,
			},
			duration,
		);

		// Increment request counter
		metricsService.httpRequestTotal.inc({
			method: req.method,
			route,
			status_code: statusCode,
		});

		// Call original end with proper arguments based on Express Response.end signatures
		if (cb && encoding && typeof encoding === "string") {
			// end(chunk, encoding, cb)
			return originalEnd(chunk, encoding as BufferEncoding, cb);
		} else if (typeof encoding === "function") {
			// end(chunk, cb)
			return originalEnd(chunk, encoding as () => void);
		} else if (typeof chunk === "function") {
			// end(cb)
			return originalEnd(chunk as () => void);
		} else if (encoding && typeof encoding === "string") {
			// end(chunk, encoding)
			return originalEnd(chunk, encoding as BufferEncoding);
		} else if (chunk !== undefined) {
			// end(chunk)
			return originalEnd(chunk);
		} else {
			// end()
			return originalEnd();
		}
	}) as typeof res.end;

	next();
}

/**
 * Normalize route path to remove dynamic IDs
 * Example: /auctions/507f1f77bcf86cd799439011 -> /auctions/:id
 */
function normalizeRoute(path: string): string {
	// Replace MongoDB ObjectIds (24 hex characters) with :id
	const objectIdPattern = /\/[0-9a-fA-F]{24}/g;
	let normalized = path.replace(objectIdPattern, "/:id");

	// Replace numeric IDs with :id
	normalized = normalized.replace(/\/\d+/g, "/:id");

	// Replace multiple consecutive :id with single :id
	normalized = normalized.replace(/\/:id(\/:id)+/g, "/:id");

	return normalized || "/";
}

export default metricsMiddleware;
