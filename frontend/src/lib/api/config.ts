export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export function handleApiError<T>(
    error: unknown,
    defaultMessage: string,
    emptyResponse: T
): { success: false; message: string; responseObject: T; statusCode: number } {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
        return {
            success: false,
            message: `Cannot connect to backend server at ${API_URL}. Please check if the server is running and CORS is configured correctly.`,
            responseObject: emptyResponse,
            statusCode: 0,
        };
    }

    return {
        success: false,
        message: error instanceof Error ? error.message : defaultMessage,
        responseObject: emptyResponse,
        statusCode: 0,
    };
}

export async function parseErrorResponse(
    response: Response
): Promise<{ message: string }> {
    const errorText = await response.text();
    try {
        return JSON.parse(errorText);
    } catch {
        return {
            message: errorText || `HTTP error! status: ${response.status}`,
        };
    }
}

