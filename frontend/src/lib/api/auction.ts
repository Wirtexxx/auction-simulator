import { apiRequest } from "./client";
import type { ServiceResponse } from "./types";

export interface Auction {
    _id: string;
    collection_id: string;
    round_duration: number;
    gifts_per_round: number;
    current_round_number: number;
    current_round_started_at: string | null;
    total_rounds?: number;
    status: "active" | "finished";
    created_at: string;
}

export interface CreateAuctionData {
    collection_id: string;
    round_duration: number;
    gifts_per_round: number;
}

export async function createAuction(
    data: CreateAuctionData
): Promise<ServiceResponse<Auction>> {
    return apiRequest<Auction>("/auctions", {
        method: "POST",
        body: data,
        requiresAuth: true,
    });
}

export async function getAuctionById(
    id: string
): Promise<ServiceResponse<Auction>> {
    return apiRequest<Auction>(`/auctions/${id}`, {
        method: "GET",
    });
}

export async function getAuctions(
    collectionId?: string,
    status?: "active" | "finished",
    limit?: number,
    offset?: number
): Promise<ServiceResponse<Auction[]>> {
    return apiRequest<Auction[]>("/auctions", {
        method: "GET",
        params: {
            collection_id: collectionId,
            status,
            limit,
            offset,
        },
    });
}

