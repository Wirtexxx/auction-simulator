import { getAuthToken } from "../authStorage";
import { API_URL, handleApiError, parseErrorResponse } from "./config";
import type { ServiceResponse } from "./types";

export interface Auction {
    _id: string;
    collection_id: string;
    round_duration: number;
    gifts_per_round: number;
    current_round_number: number;
    current_round_started_at: string | null;
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
    try {
        const token = getAuthToken();
        if (!token) {
            return {
                success: false,
                message: "Not authenticated",
                responseObject: {} as Auction,
                statusCode: 401,
            };
        }

        const response = await fetch(`${API_URL}/auctions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await parseErrorResponse(response);
            return {
                success: false,
                message:
                    errorData.message || `Server error: ${response.status}`,
                responseObject: {} as Auction,
                statusCode: response.status,
            };
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        return handleApiError(
            error,
            "Failed to create auction",
            {} as Auction
        );
    }
}

export async function getAuctions(
    collectionId?: string,
    status?: "active" | "finished",
    limit?: number,
    offset?: number
): Promise<ServiceResponse<Auction[]>> {
    try {
        const params = new URLSearchParams();
        if (collectionId) {
            params.append("collection_id", collectionId);
        }
        if (status) {
            params.append("status", status);
        }
        if (limit !== undefined) {
            params.append("limit", limit.toString());
        }
        if (offset !== undefined) {
            params.append("offset", offset.toString());
        }

        const queryString = params.toString();
        const url = `${API_URL}/auctions${queryString ? `?${queryString}` : ""}`;

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
                responseObject: [] as Auction[],
                statusCode: response.status,
            };
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        return handleApiError(
            error,
            "Failed to get auctions",
            [] as Auction[]
        );
    }
}

