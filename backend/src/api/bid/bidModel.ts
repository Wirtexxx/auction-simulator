import { z } from "zod";

export interface Bid {
	userId: number;
	auctionId: string;
	roundNumber: number;
	amount: number;
	timestamp: number;
}

export const PlaceBidSchema = z.object({
	auctionId: z.string().min(1),
	amount: z.number().positive(),
});


