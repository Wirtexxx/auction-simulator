import { useState, useCallback, useRef, useEffect } from "react";
import type { ServiceResponse } from "../lib/api/types";

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    autoExecute?: boolean; // Auto-execute on mount
    enabled?: boolean; // Enable/disable auto-execute
}

export function useApi<T>(
    apiFunction: () => Promise<ServiceResponse<T>> | null,
    options: UseApiOptions<T> = {}
) {
    const { autoExecute = false, enabled = true, onSuccess, onError } = options;
    const [data, setData] = useState<ServiceResponse<T> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fetchingRef = useRef(false);
    const apiFunctionRef = useRef(apiFunction);

    // Update function ref when it changes
    useEffect(() => {
        apiFunctionRef.current = apiFunction;
    }, [apiFunction]);

    const execute = useCallback(async () => {
        if (fetchingRef.current) return;

        const fn = apiFunctionRef.current();
        if (!fn) {
            setData(null);
            return;
        }

        fetchingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const response = await fn;
            
            if (response.success && response.responseObject) {
                setData(response);
                onSuccess?.(response.responseObject);
            } else {
                const errorMessage = response.message || "An error occurred";
                setError(errorMessage);
                onError?.(errorMessage);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, [onSuccess, onError]);

    // Auto-execute on mount if enabled
    useEffect(() => {
        if (autoExecute && enabled && !fetchingRef.current && !data && !loading) {
            execute();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
        fetchingRef.current = false;
    }, []);

    return { data, loading, error, execute, reset };
}

