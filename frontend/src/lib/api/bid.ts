import { apiRequest } from "./client";
import type { ServiceResponse } from "./types";

export interface Bid {
    userId: number;
    auctionId: string;
    roundNumber: number;
    amount: number;
    timestamp: number;
}

export async function getRoundBids(
    auctionId: string,
    roundNumber: number
): Promise<ServiceResponse<Bid[]>> {
    return apiRequest<Bid[]>("/bids", {
        method: "GET",
        params: {
            auction_id: auctionId,
            round_number: roundNumber.toString(),
        },
    });
}
