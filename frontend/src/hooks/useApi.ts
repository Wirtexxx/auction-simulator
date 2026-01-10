import { useState, useCallback, useRef } from "react";
import type { ServiceResponse } from "../lib/api/types";

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
}

export function useApi<T>(
    apiFunction: () => Promise<ServiceResponse<T>>,
    options: UseApiOptions<T> = {}
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fetchingRef = useRef(false);

    const execute = useCallback(async () => {
        if (fetchingRef.current) return;

        fetchingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const response = await apiFunction();
            
            if (response.success && response.responseObject) {
                setData(response.responseObject);
                options.onSuccess?.(response.responseObject);
            } else {
                const errorMessage = response.message || "An error occurred";
                setError(errorMessage);
                options.onError?.(errorMessage);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
            setError(errorMessage);
            options.onError?.(errorMessage);
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, [apiFunction, options]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
        fetchingRef.current = false;
    }, []);

    return { data, loading, error, execute, reset };
}

