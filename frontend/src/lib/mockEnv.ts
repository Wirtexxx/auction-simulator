import { emitEvent, isTMA, mockTelegramEnv } from "@tma.js/sdk";

export async function initMockEnvironment() {
    if (typeof window === "undefined") {
        return;
    }

    // Only mock in development mode
    if (!import.meta.env.DEV) {
        return;
    }

    // Check if we should mock (via URL parameter or env variable)
    const urlParams = new URLSearchParams(window.location.search);
    const shouldMock =
        urlParams.get("mock") === "true" ||
        import.meta.env.VITE_MOCK_TELEGRAM === "true";

    if (!shouldMock) {
        return;
    }

    // Check if we're already in Telegram environment
    // isTMA('complete') checks if we're in a complete Telegram Mini App environment
    const isInTelegram = await isTMA("complete");
    if (isInTelegram) {
        if (import.meta.env.DEV) {
            console.log(
                "🎭 Real Telegram WebApp detected, skipping mock initialization"
            );
        }
        return;
    }

    if (import.meta.env.DEV) {
        console.log("🎭 Initializing mock Telegram environment...");
    }

    const themeParams = {
        accent_text_color: "#6ab2f2",
        bg_color: "#17212b",
        button_color: "#5288c1",
        button_text_color: "#ffffff",
        destructive_text_color: "#ec3942",
        header_bg_color: "#17212b",
        hint_color: "#708499",
        link_color: "#6ab3f3",
        secondary_bg_color: "#232e3c",
        section_bg_color: "#17212b",
        section_header_text_color: "#6ab3f3",
        subtitle_text_color: "#708499",
        text_color: "#f5f5f5",
    } as const;

    const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;

    const authDate = Math.floor(Date.now() / 1000);
    const user = {
        id: 279058397,
        first_name: "Test",
        last_name: "User",
        username: "testuser",
        language_code: "en",
        is_premium: false,
    };

    try {
        // Create init data string (as it would come from Telegram)
        const initDataParams = new URLSearchParams([
            ["auth_date", authDate.toString()],
            [
                "hash",
                "c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2",
            ],
            ["query_id", "AAHdF6IQAAAAAN0XohDhrOrc"],
            ["user", JSON.stringify(user)],
        ]);
        const initDataString = initDataParams.toString();

        // Create launch params exactly as in official template
        // https://github.com/Telegram-Mini-Apps/reactjs-template/blob/master/src/mockEnv.ts
        // Note: The template uses URLSearchParams, but we need to ensure proper format
        const launchParams = new URLSearchParams([
            // Theme parameters - must be JSON string
            ["tgWebAppThemeParams", JSON.stringify(themeParams)],
            // Init data - this is the raw init data string (query string format)
            ["tgWebAppData", initDataString],
            ["tgWebAppVersion", "9.1"],
            ["tgWebAppPlatform", "web"],
        ]);

        if (import.meta.env.DEV) {
            console.log("📦 Launch params string:", launchParams.toString());
            console.log("📦 Init data string:", initDataString);
        }

        // Store launch params in URL and localStorage so retrieveLaunchParams can find them
        const currentUrl = new URL(window.location.href);
        launchParams.forEach((value, key) => {
            currentUrl.searchParams.set(key, value);
        });
        window.history.replaceState({}, "", currentUrl.toString());

        // Also store in localStorage as fallback
        const storageKey = "tma-js-sdk-launch-params";
        const launchParamsData: Record<string, string> = {};
        launchParams.forEach((value, key) => {
            launchParamsData[key] = value;
        });
        localStorage.setItem(storageKey, JSON.stringify(launchParamsData));

        // Now try mockTelegramEnv - it should read from URL or localStorage
        try {
            mockTelegramEnv({
                onEvent(e) {
                    // Handle Telegram Mini Apps events
                    // https://docs.telegram-mini-apps.com/platform/methods
                    if (e.name === "web_app_request_theme") {
                        return emitEvent("theme_changed", {
                            theme_params: themeParams,
                        });
                    }
                    if (e.name === "web_app_request_viewport") {
                        return emitEvent("viewport_changed", {
                            height: window.innerHeight,
                            width: window.innerWidth,
                            is_expanded: true,
                            is_state_stable: true,
                        });
                    }
                    if (e.name === "web_app_request_content_safe_area") {
                        return emitEvent("content_safe_area_changed", noInsets);
                    }
                    if (e.name === "web_app_request_safe_area") {
                        return emitEvent("safe_area_changed", noInsets);
                    }
                },
                launchParams: launchParams,
            });
        } catch (mockError) {
            // If mockTelegramEnv fails, localStorage should work for retrieveLaunchParams
            if (import.meta.env.DEV) {
                console.warn(
                    "⚠️ mockTelegramEnv failed, but launch params are stored in URL and localStorage:",
                    mockError
                );
            }
        }

        if (import.meta.env.DEV) {
            console.info(
                "⚠️ As long as the current environment was not considered as the Telegram-based one, it was mocked. Take a note, that you should not do it in production and current behavior is only specific to the development process. Environment mocking is also applied only in development mode."
            );
            console.log("✅ Mock Telegram environment initialized");
        }
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error(
                "❌ Failed to initialize mock Telegram environment:",
                error
            );
        }
    }
}
