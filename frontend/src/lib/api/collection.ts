import { apiRequest } from "./client";
import { getGifts } from "./gift";
import type {
    Collection,
    CreateCollectionData,
    ServiceResponse,
} from "./types";

async function getCollectionEmoji(collectionId: string): Promise<string> {
    try {
        const response = await getGifts(collectionId, 1, 0);
        if (response.success && response.responseObject.length > 0) {
            return response.responseObject[0].emoji;
        }
    } catch {
        // Ignore errors when fetching emoji, use default
    }
    return "🎁";
}

export async function createCollection(
    data: CreateCollectionData
): Promise<ServiceResponse<Collection>> {
    return apiRequest<Collection>("/collections", {
        method: "POST",
        body: data,
        requiresAuth: true,
    });
}

export async function getCollections(
    limit?: number,
    offset?: number
): Promise<ServiceResponse<Collection[]>> {
    const response = await apiRequest<Collection[]>("/collections", {
        method: "GET",
        params: {
            limit,
            offset,
        },
    });

    if (!response.success || !response.responseObject) {
        return response;
    }

    const collectionsWithEmoji = await Promise.all(
        response.responseObject.map(async (collection) => {
            const emoji = await getCollectionEmoji(collection._id);
            return { ...collection, emoji };
        })
    );

    return {
        ...response,
        responseObject: collectionsWithEmoji,
    };
}

export async function getCollectionById(
    id: string
): Promise<ServiceResponse<Collection>> {
    const response = await apiRequest<Collection>(`/collections/${id}`, {
        method: "GET",
    });

    if (!response.success || !response.responseObject) {
        return {
            ...response,
            responseObject: {
                ...response.responseObject,
                emoji: "🎁",
            } as Collection,
        };
    }

    const emoji = await getCollectionEmoji(id);
    return {
        ...response,
        responseObject: {
            ...response.responseObject,
            emoji,
        },
    };
}

export interface DeleteCollectionResponse {
    deletedGifts: number;
}

export async function deleteCollection(
    id: string
): Promise<ServiceResponse<DeleteCollectionResponse>> {
    return apiRequest<DeleteCollectionResponse>(`/collections/${id}`, {
        method: "DELETE",
        requiresAuth: true,
    });
}
