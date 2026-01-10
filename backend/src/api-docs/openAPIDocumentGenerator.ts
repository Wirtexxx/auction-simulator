import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import { auctionRegistry } from "@/api/auction/auctionRouter";
import { collectionRegistry } from "@/api/collection/collectionRouter";
import { giftRegistry } from "@/api/gift/giftRouter";
import { healthCheckRegistry } from "@/api/healthCheck/healthCheckRouter";
import { ownershipRegistry } from "@/api/ownership/ownershipRouter";
import { userRegistry } from "@/api/user/userRouter";
import { walletRegistry } from "@/api/wallet/walletRouter";
import { modelRegistry } from "./modelRegistry";

export type OpenAPIDocument = ReturnType<OpenApiGeneratorV3["generateDocument"]>;

export function generateOpenAPIDocument(): OpenAPIDocument {
	const registry = new OpenAPIRegistry([
		healthCheckRegistry,
		userRegistry,
		giftRegistry,
		collectionRegistry,
		ownershipRegistry,
		auctionRegistry,
		walletRegistry,
		modelRegistry,
	]);
	const generator = new OpenApiGeneratorV3(registry.definitions);

	const document = generator.generateDocument({
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "Swagger API",
		},
		externalDocs: {
			description: "View the raw OpenAPI Specification in JSON format",
			url: "/swagger.json",
		},
	});

	return {
		...document,
		components: {
			...document.components,
			securitySchemes: {
				Bearer: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
					description: "JWT token obtained from /users/authenticate endpoint",
				},
			},
		},
	};
}
