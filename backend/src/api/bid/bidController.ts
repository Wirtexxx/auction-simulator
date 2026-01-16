import type { Request, Response } from "express";
import { bidService } from "./bidService";

export const bidController = {
	getRoundBids: async (req: Request, res: Response) => {
		const { auction_id, round_number } = req.query;

		if (!auction_id || !round_number) {
			return res.status(400).send({
				success: false,
				message: "auction_id and round_number are required",
				responseObject: [],
				statusCode: 400,
			});
		}

		const roundNumber = parseInt(round_number as string, 10);
		if (isNaN(roundNumber)) {
			return res.status(400).send({
				success: false,
				message: "round_number must be a valid number",
				responseObject: [],
				statusCode: 400,
			});
		}

		try {
			const bids = await bidService.getRoundBids(auction_id as string, roundNumber);
			return res.status(200).send({
				success: true,
				message: "Bids retrieved successfully",
				responseObject: bids,
				statusCode: 200,
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to retrieve bids";
			return res.status(500).send({
				success: false,
				message: errorMessage,
				responseObject: [],
				statusCode: 500,
			});
		}
	},
};
