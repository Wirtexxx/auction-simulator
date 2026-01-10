export interface ServiceResponse<T> {
    success: boolean;
    message: string;
    responseObject: T;
    statusCode: number;
}

export interface AuthResponse {
    user: {
        _id: number;
        username: string;
        first_name: string;
        last_name?: string;
        photo_url?: string;
        language_code?: string;
        is_premium?: boolean;
        role: string;
    };
    token: string;
}

export interface Wallet {
    _id: number;
    balance: number;
}

export interface Collection {
    _id: string;
    title: string;
    description?: string;
    total_amount: number;
    minted_amount: number;
    created_at: string;
    emoji?: string; // Emoji from first gift in collection
}

export interface CreateCollectionData {
    title: string;
    description?: string;
    total_amount: number;
    emoji: string;
}

