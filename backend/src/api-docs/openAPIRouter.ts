import express, { type Request, type Response, type Router } from "express";
import swaggerUi from "swagger-ui-express";

import { generateOpenAPIDocument } from "@/api-docs/openAPIDocumentGenerator";

export const openAPIRouter: Router = express.Router();

// Lazy load OpenAPI document to catch errors during initialization
let openAPIDocument: ReturnType<typeof generateOpenAPIDocument> | null = null;

function getOpenAPIDocument() {
	if (!openAPIDocument) {
		try {
			openAPIDocument = generateOpenAPIDocument();
		} catch (error) {
			console.error("❌ Failed to generate OpenAPI document:", error);
			if (error instanceof Error) {
				console.error("Error message:", error.message);
				console.error("Error stack:", error.stack);
			}
			throw error;
		}
	}
	return openAPIDocument;
}

openAPIRouter.get("/swagger.json", (_req: Request, res: Response) => {
	try {
		const document = getOpenAPIDocument();
		res.setHeader("Content-Type", "application/json");
		res.send(document);
	} catch (error) {
		res.status(500).json({
			error: "Failed to generate OpenAPI document",
			message: error instanceof Error ? error.message : String(error),
		});
	}
});

openAPIRouter.use(
	"/",
	swaggerUi.serve,
	swaggerUi.setup(
		getOpenAPIDocument(),
		{
			customCss: ".swagger-ui .topbar { display: none }",
			customSiteTitle: "Auction Simulator API",
			swaggerOptions: {
				persistAuthorization: true,
			},
		},
	),
);
