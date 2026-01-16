import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { init, backButton } from "@tma.js/sdk";

// Initialize SDK once
let sdkInitialized = false;

function initializeSDK() {
    if (!sdkInitialized && typeof window !== "undefined") {
        try {
            init();
            sdkInitialized = true;
            if (import.meta.env.DEV) {
                console.log("✅ Telegram SDK initialized");
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                console.warn("⚠️ Failed to initialize Telegram SDK:", error);
            }
        }
    }
}

/**
 * Hook to manage Telegram Mini App Back Button
 * Automatically shows/hides the button based on navigation history
 * and handles back navigation when clicked
 */
export function useTelegramBackButton() {
    const location = useLocation();
    const navigate = useNavigate();
    const isMountedRef = useRef(false);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        // Initialize SDK on first mount
        initializeSDK();

        // Mount back button on first render
        if (!isMountedRef.current) {
            try {
                backButton.mount();
                isMountedRef.current = true;
                if (import.meta.env.DEV) {
                    console.log("✅ Back button mounted");
                }
            } catch (error) {
                if (import.meta.env.DEV) {
                    console.warn("⚠️ Failed to mount back button:", error);
                }
            }
        }

        // Set up click handler
        const handleBackClick = () => {
            // Use React Router's navigate to go back
            navigate(-1);
        };

        // Subscribe to back button clicks
        // onClick returns an unsubscribe function
        try {
            const unsubscribe = backButton.onClick(handleBackClick);
            unsubscribeRef.current = unsubscribe;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.warn("⚠️ Failed to subscribe to back button:", error);
            }
        }

        // Cleanup on unmount
        return () => {
            if (unsubscribeRef.current) {
                try {
                    unsubscribeRef.current();
                } catch {
                    // Ignore cleanup errors
                }
            }
        };
    }, [navigate]);

    // Update button visibility when location changes
    useEffect(() => {
        // Determine if back button should be visible
        // Show button if:
        // 1. Not on auth page
        // 2. Not on main auction page (root of app)
        const shouldShow =
            location.pathname !== "/auth" &&
            location.pathname !== "/app/auction" &&
            location.pathname !== "/app";

        try {
            if (shouldShow) {
                backButton.show();
            } else {
                backButton.hide();
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                console.warn("⚠️ Failed to update back button visibility:", error);
            }
        }
    }, [location.pathname]);
}

