import { getAuthToken } from "../authStorage";
import { API_URL, handleApiError, parseErrorResponse } from "./config";
import type { ServiceResponse, Wallet } from "./types";

export async function getWallet(
    userId: number
): Promise<ServiceResponse<Wallet>> {
    try {
        const token = getAuthToken();
        if (!token) {
            return {
                success: false,
                message: "Not authenticated",
                responseObject: {} as Wallet,
                statusCode: 401,
            };
        }

        const response = await fetch(`${API_URL}/wallets/${userId}`, {
            method: "GET",
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
                responseObject: {} as Wallet,
                statusCode: response.status,
            };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return handleApiError(
            error,
            "Failed to get wallet",
            {} as Wallet
        );
    }
}

export async function updateWalletBalance(
    userId: number,
    balance: number
): Promise<ServiceResponse<Wallet>> {
    try {
        const token = getAuthToken();
        if (!token) {
            return {
                success: false,
                message: "Not authenticated",
                responseObject: {} as Wallet,
                statusCode: 401,
            };
        }

        const response = await fetch(`${API_URL}/wallets/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ balance }),
        });

        if (!response.ok) {
            const errorData = await parseErrorResponse(response);
            return {
                success: false,
                message:
                    errorData.message || `Server error: ${response.status}`,
                responseObject: {} as Wallet,
                statusCode: response.status,
            };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return handleApiError(
            error,
            "Failed to update wallet balance",
            {} as Wallet
        );
    }
}

