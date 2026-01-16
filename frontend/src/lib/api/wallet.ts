import { apiRequest } from "./client";
import type { ServiceResponse, Wallet } from "./types";

export async function getWallet(
    userId: number
): Promise<ServiceResponse<Wallet>> {
    return apiRequest<Wallet>(`/wallets/${userId}`, {
        method: "GET",
        requiresAuth: true,
    });
}

export async function updateWalletBalance(
    userId: number,
    balance: number
): Promise<ServiceResponse<Wallet>> {
    return apiRequest<Wallet>(`/wallets/${userId}`, {
        method: "PUT",
        body: { balance },
        requiresAuth: true,
    });
}

