import { API_URL, handleApiError, parseErrorResponse } from "./config";
import type { AuthResponse, ServiceResponse } from "./types";

export async function authenticate(
    initData: string
): Promise<ServiceResponse<AuthResponse>> {
    try {
        if (import.meta.env.DEV) {
            console.log(
                "📤 Sending init data to backend:",
                initData.substring(0, 100) + "..."
            );
        }

        const response = await fetch(`${API_URL}/users/authenticate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ initData }),
        });

        if (!response.ok) {
            const errorData = await parseErrorResponse(response);
            return {
                success: false,
                message:
                    errorData.message || `Server error: ${response.status}`,
                responseObject: {} as AuthResponse,
                statusCode: response.status,
            };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return handleApiError(
            error,
            "Failed to authenticate",
            {} as AuthResponse
        );
    }
}

