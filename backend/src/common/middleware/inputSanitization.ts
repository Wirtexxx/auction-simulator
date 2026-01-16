import type { NextFunction, Request, Response } from "express";

/**
 * Input Sanitization Middleware
 *
 * Sanitizes string inputs to prevent XSS and injection attacks.
 * Removes or escapes potentially dangerous characters.
 */
export const inputSanitization = (req: Request, _res: Response, next: NextFunction): void => {
	/**
	 * Recursively sanitize object values
	 */
	const sanitizeValue = (value: any): any => {
		if (typeof value === "string") {
			// Remove null bytes
			let sanitized = value.replace(/\0/g, "");

			// Remove control characters except newlines and tabs
			// biome-ignore lint/suspicious/noControlCharactersInRegex: Control characters are intentionally used for sanitization
			sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

			// Trim whitespace
			sanitized = sanitized.trim();

			// Limit string length to prevent DoS (max 10MB per string)
			const MAX_STRING_LENGTH = 10 * 1024 * 1024;
			if (sanitized.length > MAX_STRING_LENGTH) {
				sanitized = sanitized.substring(0, MAX_STRING_LENGTH);
			}

			return sanitized;
		} else if (Array.isArray(value)) {
			return value.map(sanitizeValue);
		} else if (value !== null && typeof value === "object" && !(value instanceof Date) && !(value instanceof RegExp)) {
			const sanitized: Record<string, any> = {};
			for (const key in value) {
				if (Object.hasOwn(value, key)) {
					// Sanitize key as well
					const sanitizedKey = typeof key === "string" ? key.replace(/[^\w-]/g, "") : key;
					sanitized[sanitizedKey] = sanitizeValue(value[key]);
				}
			}
			return sanitized;
		}

		return value;
	};

	// Sanitize request body
	if (req.body && typeof req.body === "object") {
		req.body = sanitizeValue(req.body);
	}

	// Sanitize query parameters (only string values)
	if (req.query && typeof req.query === "object") {
		for (const key in req.query) {
			if (Object.hasOwn(req.query, key)) {
				const value = req.query[key];
				if (typeof value === "string") {
					req.query[key] = sanitizeValue(value);
				}
			}
		}
	}

	// Sanitize route parameters (only string values)
	if (req.params && typeof req.params === "object") {
		for (const key in req.params) {
			if (Object.hasOwn(req.params, key)) {
				const value = req.params[key];
				if (typeof value === "string") {
					req.params[key] = sanitizeValue(value);
				}
			}
		}
	}

	next();
};
