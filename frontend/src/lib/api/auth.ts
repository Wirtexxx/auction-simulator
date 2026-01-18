import { apiRequest } from "./client";
import type { AuthResponse, ServiceResponse } from "./types";

export async function authenticate(
  initData: string
): Promise<ServiceResponse<AuthResponse>> {
  return apiRequest<AuthResponse>("/users/authenticate", {
    method: "POST",
    body: { initData },
  });
}
