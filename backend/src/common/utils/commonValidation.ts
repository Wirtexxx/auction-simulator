import { z } from "zod";

export const commonValidations = {
	id: z
		.string()
		.refine((data) => !Number.isNaN(Number(data)), "ID must be a numeric value")
		.transform(Number)
		.refine((num) => num > 0, "ID must be a positive number"),
	mongoId: z
		.string()
		.min(1, "ID is required")
		.regex(/^[0-9a-fA-F]{24}$/, "ID must be a valid MongoDB ObjectId"),
	// ... other common validations
};
