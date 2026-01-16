import type { Request, Response } from "express";

import { ownershipService } from "./ownershipService";

export const ownershipController = {
	getOwnership: async (req: Request, res: Response) => {
		const { id } = req.params;
		const serviceResponse = await ownershipService.getOwnershipById(id);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	},

	getOwnerships: async (req: Request, res: Response) => {
		const { owner_id, gift_id, limit, offset } = req.query;
		const filters = {
			owner_id: owner_id ? Number(owner_id) : undefined,
			gift_id: gift_id as string | undefined,
			limit: limit ? Number(limit) : undefined,
			offset: offset ? Number(offset) : undefined,
		};
		const serviceResponse = await ownershipService.getOwnerships(filters);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	},
};
