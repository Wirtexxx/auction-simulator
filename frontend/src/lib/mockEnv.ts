import { isTMA, mockTelegramEnv } from "@tma.js/sdk";

let mockEnvironmentInitialized = false;
let mockEnvironmentPromise: Promise<void> | null = null;

export function setMockEnvironmentPromise(promise: Promise<void>): void {
  mockEnvironmentPromise = promise;
}

export function isMockEnvironmentReady(): boolean {
  return mockEnvironmentInitialized;
}

export function isMockModeEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const urlMockEnabled = urlParams.get("mock") === "true";
  const envMockEnabled = import.meta.env.VITE_MOCK_TELEGRAM === "true";
  const envMockDisabled = import.meta.env.VITE_MOCK_TELEGRAM === "false";
  
  return !envMockDisabled && (urlMockEnabled || envMockEnabled);
}

export function waitForMockEnvironment(): Promise<void> {
  if (mockEnvironmentInitialized) return Promise.resolve();
  if (mockEnvironmentPromise) return mockEnvironmentPromise;

  if (!import.meta.env.DEV) return Promise.resolve();

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (mockEnvironmentInitialized) {
        clearInterval(interval);
        resolve();
      }
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      resolve();
    }, 2000);
  });
}

export async function initMockEnvironment() {
  try {
    if (typeof window === "undefined" || !import.meta.env.DEV) {
      mockEnvironmentInitialized = true;
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const urlMockEnabled = urlParams.get("mock") === "true";
    const envMockEnabled = import.meta.env.VITE_MOCK_TELEGRAM === "true";
    const envMockDisabled = import.meta.env.VITE_MOCK_TELEGRAM === "false";

    if (envMockDisabled || !(urlMockEnabled || envMockEnabled)) {
      if (import.meta.env.DEV) {
        console.log("ℹ️ Mock Telegram environment disabled or not enabled");
      }
      mockEnvironmentInitialized = true;
      return;
    }

    if (import.meta.env.DEV) {
      console.log("🔧 Initializing mock Telegram environment...");
    }

    const isInTelegram = await isTMA("complete");
    if (isInTelegram) {
      if (import.meta.env.DEV) {
        console.log("ℹ️ Running inside Telegram, skipping mock initialization");
      }
      mockEnvironmentInitialized = true;
      return;
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

    const authDate = Math.floor(Date.now() / 1000);
    const user = {
      id: 123456,
      first_name: "Test",
      last_name: "User",
      username: "testuser",
      language_code: "en",
      is_premium: false,
    };

    const initDataString = new URLSearchParams([
      ["auth_date", authDate.toString()],
      ["hash", "dummyhashfortesting1234567890"],
      ["user", JSON.stringify(user)],
    ]).toString();

    const launchParams = new URLSearchParams([
      ["tgWebAppThemeParams", JSON.stringify(themeParams)],
      ["tgWebAppData", initDataString],
      ["tgWebAppVersion", "9.1"],
      ["tgWebAppPlatform", "web"],
    ]);

    // Сохраняем в URL - SDK читает из window.location.search
    // Важно: устанавливаем параметры синхронно до вызова init()
    const url = new URL(window.location.href);
    launchParams.forEach((value, key) => url.searchParams.set(key, value));
    window.history.replaceState({}, "", url.toString());

    // Сохраняем в localStorage для retrieveLaunchParams
    // SDK и наш telegramUtils.ts ожидают JSON объект, не query string
    // Формат должен быть объектом с ключами как в URL params
    const launchParamsObj = Object.fromEntries(launchParams.entries());
    localStorage.setItem("tma-js-sdk-launch-params", JSON.stringify(launchParamsObj));

    // Пытаемся использовать mockTelegramEnv для правильной инициализации SDK
    // Если это не сработает, SDK будет использовать URL/localStorage как fallback
    try {
      // mockTelegramEnv ожидает launchParams как строку query string (с префиксом "?")
      const launchParamsString = `?${launchParams.toString()}`;
      mockTelegramEnv({
        launchParams: launchParamsString,
      });
      if (import.meta.env.DEV) {
        console.log("✅ mockTelegramEnv initialized successfully");
      }
    } catch (err) {
      // Если mockTelegramEnv не сработает, SDK будет использовать URL/localStorage
      if (import.meta.env.DEV) {
        console.warn("⚠️ mockTelegramEnv failed, SDK will use URL/localStorage fallback:", err);
      }
    }

    if (import.meta.env.DEV) {
      console.log("✅ Mock Telegram environment initialized");
      console.log("📍 Launch params set in URL:", url.search);
      console.log("💾 Launch params stored in localStorage:", JSON.stringify(launchParamsObj).substring(0, 100) + "...");
    }

    mockEnvironmentInitialized = true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to initialize mock Telegram environment:", errorMessage);
    // Still mark as initialized to prevent infinite retries
    mockEnvironmentInitialized = true;
    // Re-throw to let caller handle if needed
    throw error;
  }
}
