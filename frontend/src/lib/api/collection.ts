import { getAuthToken } from "../authStorage";
import { API_URL, handleApiError, parseErrorResponse } from "./config";
import type {
    Collection,
    CreateCollectionData,
    ServiceResponse,
} from "./types";

export async function createCollection(
    data: CreateCollectionData
): Promise<ServiceResponse<Collection>> {
    try {
        const token = getAuthToken();
        if (!token) {
            return {
                success: false,
                message: "Not authenticated",
                responseObject: {} as Collection,
                statusCode: 401,
            };
        }

        const response = await fetch(`${API_URL}/collections`, {
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
                responseObject: {} as Collection,
                statusCode: response.status,
            };
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        return handleApiError(
            error,
            "Failed to create collection",
            {} as Collection
        );
    }
}

export async function getCollections(
    limit?: number,
    offset?: number
): Promise<ServiceResponse<Collection[]>> {
    try {
        const params = new URLSearchParams();
        if (limit !== undefined) {
            params.append("limit", limit.toString());
        }
        if (offset !== undefined) {
            params.append("offset", offset.toString());
        }

        const queryString = params.toString();
        const url = `${API_URL}/collections${
            queryString ? `?${queryString}` : ""
        }`;

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
                responseObject: [] as Collection[],
                statusCode: response.status,
            };
        }

        const responseData = await response.json();
        const collections: Collection[] = responseData.responseObject || [];

        // Fetch emoji for each collection from first gift
        const collectionsWithEmoji = await Promise.all(
            collections.map(async (collection) => {
                try {
                    const giftResponse = await fetch(
                        `${API_URL}/gifts?collection_id=${collection._id}&limit=1`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    if (giftResponse.ok) {
                        const giftData = await giftResponse.json();
                        if (
                            giftData.responseObject &&
                            giftData.responseObject.length > 0
                        ) {
                            return {
                                ...collection,
                                emoji: giftData.responseObject[0].emoji,
                            };
                        }
                    }
                } catch {
                    // If we can't get emoji, use default
                }
                return {
                    ...collection,
                    emoji: "🎁", // Default emoji
                };
            })
        );

        return {
            ...responseData,
            responseObject: collectionsWithEmoji,
        };
    } catch (error) {
        return handleApiError(
            error,
            "Failed to get collections",
            [] as Collection[]
        );
    }
}

export async function getCollectionById(
    id: string
): Promise<ServiceResponse<Collection>> {
    try {
        const response = await fetch(`${API_URL}/collections/${id}`, {
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
                responseObject: {} as Collection,
                statusCode: response.status,
            };
        }

        const responseData = await response.json();
        
        // Fetch emoji from first gift
        try {
            const giftResponse = await fetch(
                `${API_URL}/gifts?collection_id=${id}&limit=1`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (giftResponse.ok) {
                const giftData = await giftResponse.json();
                if (
                    giftData.responseObject &&
                    giftData.responseObject.length > 0
                ) {
                    return {
                        ...responseData,
                        responseObject: {
                            ...responseData.responseObject,
                            emoji: giftData.responseObject[0].emoji,
                        },
                    };
                }
            }
        } catch {
            // If we can't get emoji, use default
        }

        return {
            ...responseData,
            responseObject: {
                ...responseData.responseObject,
                emoji: "🎁",
            },
        };
    } catch (error) {
        return handleApiError(
            error,
            "Failed to get collection",
            {} as Collection
        );
    }
}

export interface DeleteCollectionResponse {
    deletedGifts: number;
}

export async function deleteCollection(
    id: string
): Promise<ServiceResponse<DeleteCollectionResponse>> {
    try {
        const token = getAuthToken();
        if (!token) {
            return {
                success: false,
                message: "Not authenticated",
                responseObject: {} as DeleteCollectionResponse,
                statusCode: 401,
            };
        }

        const response = await fetch(`${API_URL}/collections/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await parseErrorResponse(response);
            return {
                success: false,
                message:
                    errorData.message || `Server error: ${response.status}`,
                responseObject: {} as DeleteCollectionResponse,
                statusCode: response.status,
            };
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        return handleApiError(
            error,
            "Failed to delete collection",
            {} as DeleteCollectionResponse
        );
    }
}

