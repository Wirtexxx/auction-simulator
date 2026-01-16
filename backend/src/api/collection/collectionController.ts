import type { Request, Response } from "express";

import { collectionService } from "./collectionService";

export const collectionController = {
	createCollection: async (req: Request, res: Response) => {
		const { title, description, total_amount, emoji } = req.body;
		
		// Log emoji to debug
		console.log("Creating collection with emoji:", emoji, "Length:", emoji?.length);
		
		const serviceResponse = await collectionService.createCollection({
			title,
			description,
			total_amount,
			emoji: emoji || "🎁", // Fallback to default if emoji is missing
		});
		res.status(serviceResponse.statusCode).send(serviceResponse);
	},

	getCollection: async (req: Request, res: Response) => {
		const { id } = req.params;
		const serviceResponse = await collectionService.getCollectionById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	},

	getCollections: async (req: Request, res: Response) => {
		const { limit, offset } = req.query;
		const filters = {
			limit: limit ? Number(limit) : undefined,
			offset: offset ? Number(offset) : undefined,
		};
		const serviceResponse = await collectionService.getCollections(filters);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	},

	deleteCollection: async (req: Request, res: Response) => {
		const { id } = req.params;
		const serviceResponse = await collectionService.deleteCollection(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	},
};
