import { apiRequest } from "./client";
import type { ServiceResponse } from "./types";

export interface Gift {
    _id: string;
    gift_id: number;
    emoji: string;
    collection_id: string;
}

export async function getGifts(
    collectionId: string,
    limit: number = 10,
    offset: number = 0
): Promise<ServiceResponse<Gift[]>> {
    return apiRequest<Gift[]>("/gifts", {
        method: "GET",
        params: {
            collection_id: collectionId,
            limit,
            offset,
        },
    });
}

export async function getGiftById(
    id: string
): Promise<ServiceResponse<Gift>> {
    return apiRequest<Gift>(`/gifts/${id}`, {
        method: "GET",
    });
}

