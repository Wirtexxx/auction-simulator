import { getAuthToken } from "../authStorage";
import { API_URL, handleApiError, parseErrorResponse } from "./config";
import type { ServiceResponse } from "./types";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions {
    method?: HttpMethod;
    body?: unknown;
    requiresAuth?: boolean;
    params?: Record<string, string | number | undefined>;
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<ServiceResponse<T>> {
    const {
        method = "GET",
        body,
        requiresAuth = false,
        params,
    } = options;

    const emptyResponse = {} as T;

    if (requiresAuth) {
        const token = getAuthToken();
        if (!token) {
            return {
                success: false,
                message: "Not authenticated",
                responseObject: emptyResponse,
                statusCode: 401,
            };
        }
    }

    try {
        const url = buildUrl(endpoint, params);
        const headers = buildHeaders(requiresAuth);

        const fetchOptions: RequestInit = {
            method,
            headers,
        };

        if (body && method !== "GET") {
            fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            const errorData = await parseErrorResponse(response);
            return {
                success: false,
                message: errorData.message || `Server error: ${response.status}`,
                responseObject: emptyResponse,
                statusCode: response.status,
            };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return handleApiError(
            error,
            `Failed to ${method.toLowerCase()} ${endpoint}`,
            emptyResponse
        );
    }
}

function buildUrl(endpoint: string, params?: Record<string, string | number | undefined>): string {
    const baseUrl = `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    
    if (!params) {
        return baseUrl;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

function buildHeaders(requiresAuth: boolean): HeadersInit {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (requiresAuth) {
        const token = getAuthToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    return headers;
}

