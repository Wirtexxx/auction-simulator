import type { Request, Response } from "express";

import { giftService } from "./giftService";

export const giftController = {
	createGift: async (req: Request, res: Response) => {
		const { emoji, collection_id } = req.body;
		const serviceResponse = await giftService.createGift({ emoji, collection_id });
		res.status(serviceResponse.statusCode).send(serviceResponse);
	},

	getGift: async (req: Request, res: Response) => {
		const { id } = req.params;
		const serviceResponse = await giftService.getGiftById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	},

	getGifts: async (req: Request, res: Response) => {
		const { collection_id, limit, offset } = req.query;
		const filters = {
			collection_id: collection_id as string | undefined,
			limit: limit ? Number(limit) : undefined,
			offset: offset ? Number(offset) : undefined,
		};
		const serviceResponse = await giftService.getGifts(filters);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	},
};
