import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import type { Auction } from "./auctionModel";
import { auctionService } from "./auctionService";

export const auctionController = {
	createAuction: async (req: Request, res: Response) => {
		const { collection_id, round_duration, gifts_per_round } = req.body;
		const serviceResponse = await auctionService.createAuction({ collection_id, round_duration, gifts_per_round });
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

	startAuction: async (req: Request, res: Response) => {
		const { id } = req.params;
		try {
			await auctionService.start(id);
			// Get updated auction to return
			const auctionResponse = await auctionService.getAuctionById(id);
			if (auctionResponse.success && auctionResponse.responseObject) {
				const serviceResponse = ServiceResponse.success(
					"Auction started successfully",
					auctionResponse.responseObject,
					StatusCodes.OK,
				);
				return res.status(serviceResponse.statusCode).send(serviceResponse);
			}
			const serviceResponse = ServiceResponse.success(
				"Auction started successfully",
				null as unknown as Auction,
				StatusCodes.OK,
			);
			return res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to start auction";
			const serviceResponse = ServiceResponse.failure(
				errorMessage,
				null as unknown as Auction,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
			return res.status(serviceResponse.statusCode).send(serviceResponse);
		}
	},

	finishAuction: async (req: Request, res: Response) => {
		const { id } = req.params;
		try {
			await auctionService.finish(id);
			// Get updated auction to return
			const auctionResponse = await auctionService.getAuctionById(id);
			if (auctionResponse.success && auctionResponse.responseObject) {
				const serviceResponse = ServiceResponse.success(
					"Auction finished successfully",
					auctionResponse.responseObject,
					StatusCodes.OK,
				);
				return res.status(serviceResponse.statusCode).send(serviceResponse);
			}
			const serviceResponse = ServiceResponse.success(
				"Auction finished successfully",
				null as unknown as Auction,
				StatusCodes.OK,
			);
			return res.status(serviceResponse.statusCode).send(serviceResponse);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to finish auction";
			const serviceResponse = ServiceResponse.failure(
				errorMessage,
				null as unknown as Auction,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
			return res.status(serviceResponse.statusCode).send(serviceResponse);
		}
	},
};
