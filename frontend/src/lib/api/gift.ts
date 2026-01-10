import { API_URL, handleApiError, parseErrorResponse } from "./config";
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
    try {
        const params = new URLSearchParams();
        params.append("collection_id", collectionId);
        params.append("limit", limit.toString());
        params.append("offset", offset.toString());

        const url = `${API_URL}/gifts?${params.toString()}`;

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
                responseObject: [] as Gift[],
                statusCode: response.status,
            };
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        return handleApiError(
            error,
            "Failed to get gifts",
            [] as Gift[]
        );
    }
}

export async function getGiftById(
    id: string
): Promise<ServiceResponse<Gift>> {
    try {
        const response = await fetch(`${API_URL}/gifts/${id}`, {
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
                responseObject: {} as Gift,
                statusCode: response.status,
            };
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        return handleApiError(
            error,
            "Failed to get gift",
            {} as Gift
        );
    }
}

