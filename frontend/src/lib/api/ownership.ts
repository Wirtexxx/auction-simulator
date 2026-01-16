import { apiRequest } from "./client";
import type { ServiceResponse } from "./types";

export interface Ownership {
    _id: string;
    gift_id: string;
    owner_id: number;
    acquired_price: number;
    acquired_at: string;
}

export async function getOwnershipsByGiftId(
    giftId: string
): Promise<ServiceResponse<Ownership[]>> {
    return apiRequest<Ownership[]>("/ownerships", {
        method: "GET",
        params: {
            gift_id: giftId,
        },
    });
}

export async function getOwnershipsByOwnerId(
    ownerId: number,
    limit?: number,
    offset?: number
): Promise<ServiceResponse<Ownership[]>> {
    return apiRequest<Ownership[]>("/ownerships", {
        method: "GET",
        params: {
            owner_id: ownerId,
            limit,
            offset,
        },
    });
}

