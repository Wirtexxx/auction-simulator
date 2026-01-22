import type { Request, Response } from "express";

import { roundService } from "./roundService";

export const roundController = {
	getRound: async (req: Request, res: Response) => {
		const { id } = req.params;
		const serviceResponse = await roundService.getRoundById(id);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	},

	getRounds: async (req: Request, res: Response) => {
		const { auction_id, status, round_number } = req.query;
		const filters = {
			auction_id: auction_id as string | undefined,
			status: status as "active" | "finished" | undefined,
			round_number: round_number ? Number(round_number) : undefined,
		};
		const serviceResponse = await roundService.getRounds(filters);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	},

	getCurrentRound: async (req: Request, res: Response) => {
		const { auction_id } = req.query;
		const serviceResponse = await roundService.getCurrentRound(auction_id as string);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	},
};
