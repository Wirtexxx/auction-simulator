import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import type { WalletSchema } from "@/api-docs/modelSchemas";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type Wallet = z.infer<typeof WalletSchema>;

export const CreateWalletSchema = z
	.object({
		body: z.object({
			user_id: z.number().int().positive().openapi({ description: "User ID (will be used as wallet _id)", example: 1 }),
			balance: z.number().nonnegative().default(0).openapi({ description: "Initial wallet balance", example: 0 }),
		}),
	})
	.openapi({ title: "CreateWallet" });

export const GetWalletSchema = z
	.object({
		params: z.object({
			id: commonValidations.id,
		}),
	})
	.openapi({ title: "GetWallet" });

export const UpdateWalletBalanceSchema = z
	.object({
		params: z.object({
			id: commonValidations.id,
		}),
		body: z.object({
			balance: z.number().nonnegative().openapi({ description: "New wallet balance", example: 1500.5 }),
		}),
	})
	.openapi({ title: "UpdateWalletBalance" });
