import { useEffect, useState, useRef } from "react";

interface UseCountdownOptions {
    enabled?: boolean;
    onComplete?: () => void;
}

export function useCountdown(
    endTime: number | null,
    options: UseCountdownOptions = {}
) {
    const { enabled = true, onComplete } = options;
    const [remaining, setRemaining] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!enabled || !endTime) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setRemaining(0);
            return;
        }

        const updateCountdown = () => {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((endTime - now) / 1000));
            setRemaining(diff);

            if (diff === 0 && onComplete) {
                onComplete();
            }
        };

        updateCountdown();
        intervalRef.current = setInterval(updateCountdown, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [endTime, enabled, onComplete]);

    return remaining;
}

export function formatCountdown(seconds: number): string {
    if (seconds <= 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

