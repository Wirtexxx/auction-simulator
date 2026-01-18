import { emitEvent, isTMA, mockTelegramEnv } from "@tma.js/sdk";

let mockEnvironmentInitialized = false;
let mockEnvironmentPromise: Promise<void> | null = null;

export function setMockEnvironmentPromise(promise: Promise<void>): void {
  mockEnvironmentPromise = promise;
}

export function isMockEnvironmentReady(): boolean {
  return mockEnvironmentInitialized;
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
  if (typeof window === "undefined" || !import.meta.env.DEV) {
    mockEnvironmentInitialized = true;
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const urlMockEnabled = urlParams.get("mock") === "true";
  const envMockEnabled = import.meta.env.VITE_MOCK_TELEGRAM === "true";
  const envMockDisabled = import.meta.env.VITE_MOCK_TELEGRAM === "false";

  if (envMockDisabled || !(urlMockEnabled || envMockEnabled)) {
    mockEnvironmentInitialized = true;
    return;
  }

  const isInTelegram = await isTMA("complete");
  if (isInTelegram) {
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

  const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;

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

  // Сохраняем в URL
  const url = new URL(window.location.href);
  launchParams.forEach((value, key) => url.searchParams.set(key, value));
  window.history.replaceState({}, "", url.toString());

  // Сохраняем в localStorage для retrieveLaunchParams и useRawInitData
  // Формат должен быть совместим с @tma.js/sdk-react
  const launchParamsObj = Object.fromEntries(launchParams.entries());
  localStorage.setItem(
    "tma-js-sdk-launch-params",
    JSON.stringify(launchParamsObj)
  );

  // Также сохраняем initDataRaw напрямую для useRawInitData, если нужно
  // useRawInitData() должен получить его из retrieveLaunchParams().initDataRaw
  // который читает из tgWebAppData в launchParams

  try {
    mockTelegramEnv({
      launchParams,
      onEvent(e) {
        if (e.name === "web_app_request_theme") {
          return emitEvent("theme_changed", { theme_params: themeParams });
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
    });
  } catch (err) {
    console.warn("⚠️ mockTelegramEnv failed, fallback to URL/localStorage", err);
  } finally {
    mockEnvironmentInitialized = true;
  }
}
