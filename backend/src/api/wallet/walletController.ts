import type { Request, Response } from "express";

import { walletService } from "./walletService";

export const walletController = {
	createWallet: async (req: Request, res: Response) => {
		const { user_id, balance } = req.body;
		const serviceResponse = await walletService.createWallet({ user_id, balance });
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	},

	getWallet: async (req: Request, res: Response) => {
		const { id } = req.params;
		const serviceResponse = await walletService.getWalletById(Number(id));
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	},

	updateWalletBalance: async (req: Request, res: Response) => {
		const { id } = req.params;
		const { balance } = req.body;
		const serviceResponse = await walletService.updateWalletBalance(Number(id), balance);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	},
};


