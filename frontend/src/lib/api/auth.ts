import { apiRequest } from "./client";
import type { AuthResponse, ServiceResponse } from "./types";

export async function authenticate(
    initData: string
): Promise<ServiceResponse<AuthResponse>> {
    if (import.meta.env.DEV) {
        console.log(
            "📤 Sending init data to backend:",
            initData.substring(0, 100) + "..."
        );
    }

    return apiRequest<AuthResponse>("/users/authenticate", {
        method: "POST",
        body: { initData },
    });
}

