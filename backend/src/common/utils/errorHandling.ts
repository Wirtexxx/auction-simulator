/**
 * Error handling utilities for consistent error processing across services
 */

/**
 * Extract error message from unknown error type
 * @param error - Error object of unknown type
 * @param defaultMessage - Default message if error is not an Error instance
 * @returns Error message string
 */
export function getErrorMessage(error: unknown, defaultMessage: string = "An error occurred"): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	return defaultMessage;
}

/**
 * Extract error stack trace if available
 * @param error - Error object of unknown type
 * @returns Stack trace string or undefined
 */
export function getErrorStack(error: unknown): string | undefined {
	if (error instanceof Error) {
		return error.stack;
	}
	return undefined;
}
