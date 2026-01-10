import { API_URL, handleApiError, parseErrorResponse } from "./config";
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
    try {
        const url = `${API_URL}/ownerships?gift_id=${giftId}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await parseErrorResponse(response);
            return {
                success: false,
                message:
                    errorData.message || `Server error: ${response.status}`,
                responseObject: [] as Ownership[],
                statusCode: response.status,
            };
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        return handleApiError(
            error,
            "Failed to get ownerships",
            [] as Ownership[]
        );
    }
}

export async function getOwnershipsByOwnerId(
    ownerId: number,
    limit?: number,
    offset?: number
): Promise<ServiceResponse<Ownership[]>> {
    try {
        const params = new URLSearchParams();
        params.append("owner_id", ownerId.toString());
        if (limit !== undefined) {
            params.append("limit", limit.toString());
        }
        if (offset !== undefined) {
            params.append("offset", offset.toString());
        }

        const url = `${API_URL}/ownerships?${params.toString()}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await parseErrorResponse(response);
            return {
                success: false,
                message:
                    errorData.message || `Server error: ${response.status}`,
                responseObject: [] as Ownership[],
                statusCode: response.status,
            };
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        return handleApiError(
            error,
            "Failed to get ownerships by owner ID",
            [] as Ownership[]
        );
    }
}

