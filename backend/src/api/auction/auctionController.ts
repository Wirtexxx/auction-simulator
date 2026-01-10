import type { Request, Response } from "express";

import { auctionService } from "./auctionService";

export const auctionController = {
	createAuction: async (req: Request, res: Response) => {
		const { collection_id, round_duration } = req.body;
		const serviceResponse = await auctionService.createAuction({ collection_id, round_duration });
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	},

	getAuction: async (req: Request, res: Response) => {
		const { id } = req.params;
		const serviceResponse = await auctionService.getAuctionById(id);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	},

	getAuctions: async (req: Request, res: Response) => {
		const { collection_id, status, limit, offset } = req.query;
		const filters = {
			collection_id: collection_id as string | undefined,
			status: status as "active" | "finished" | undefined,
			limit: limit ? Number(limit) : undefined,
			offset: offset ? Number(offset) : undefined,
		};
		const serviceResponse = await auctionService.getAuctions(filters);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	},
};

