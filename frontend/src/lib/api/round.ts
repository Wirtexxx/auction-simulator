import { apiRequest } from "./client";
import type { ServiceResponse } from "./types";

export interface Round {
    _id: string;
    auction_id: string;
    round_number: number;
    gift_ids: string[];
    status: "active" | "finished";
    started_at: string;
    ended_at: string | null;
    created_at: string;
}

export interface GetRoundsFilters {
    auction_id?: string;
    status?: "active" | "finished";
    round_number?: number;
}

export async function getRounds(
    filters?: GetRoundsFilters
): Promise<ServiceResponse<Round[]>> {
    return apiRequest<Round[]>("/rounds", {
        method: "GET",
        params: {
            auction_id: filters?.auction_id,
            status: filters?.status,
            round_number: filters?.round_number,
        },
    });
}

export async function getCurrentRound(
    auctionId: string
): Promise<ServiceResponse<Round>> {
    return apiRequest<Round>("/rounds/current", {
        method: "GET",
        params: {
            auction_id: auctionId,
        },
    });
}

export async function getRoundById(
    id: string
): Promise<ServiceResponse<Round>> {
    return apiRequest<Round>(`/rounds/${id}`, {
        method: "GET",
    });
}
