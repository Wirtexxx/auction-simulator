import { useCallback } from "react";
import { useRawInitData, useLaunchParams } from "@tma.js/sdk-react";
import { retrieveLaunchParams } from "@tma.js/sdk";
import { isMockModeEnabled } from "../lib/mockEnv";
import { getTelegramInitData } from "../lib/telegramUtils";
import { useAuthentication } from "../hooks/useAuthentication";

// Get initDataRaw for mock mode
function getMockInitDataRaw(): string | undefined {
  return getTelegramInitData();
}

// Get initDataRaw for real Telegram mode
function getTelegramInitDataRaw(
  initDataRaw: string | undefined,
  launchParams: unknown
): string | undefined {
  // Try from useRawInitData hook first
  if (initDataRaw && typeof initDataRaw === "string" && initDataRaw.length > 0) {
    return initDataRaw;
  }

  // Try from useLaunchParams hook
  if (launchParams && typeof launchParams === "object" && launchParams !== null && "initDataRaw" in launchParams) {
    const launchParamsInitData = (launchParams as { initDataRaw?: unknown }).initDataRaw;
    if (typeof launchParamsInitData === "string" && launchParamsInitData.length > 0) {
      return launchParamsInitData;
    }
  }

  // Try from retrieveLaunchParams as fallback
  try {
    const params = retrieveLaunchParams();
    const paramsInitData = params.initDataRaw;
    if (typeof paramsInitData === "string" && paramsInitData.length > 0) {
      return paramsInitData;
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("⚠️ Failed to retrieve launch params:", e);
    }
  }

  return undefined;
}

// Component for mock mode (doesn't use SDK hooks that fail)
function AuthPageMock() {
  const getInitDataRaw = useCallback(() => getMockInitDataRaw(), []);
  const { loading, error } = useAuthentication({ getInitDataRaw, mode: "mock" });

  return <AuthPageUI loading={loading} error={error} />;
}

// Component for real Telegram mode (uses SDK hooks)
function AuthPageTelegram() {
  const initDataRaw = useRawInitData();
  const launchParams = useLaunchParams();

  const getInitDataRaw = useCallback(
    () => getTelegramInitDataRaw(initDataRaw, launchParams),
    [initDataRaw, launchParams]
  );

  const { loading, error } = useAuthentication({ getInitDataRaw, mode: "telegram" });

  return <AuthPageUI loading={loading} error={error} />;
}

// Shared UI component
function AuthPageUI({ loading, error }: { loading: boolean; error: string | null }) {
  return (
    <div className="flex items-center justify-center h-screen bg-[#17212b]">
      <div className="bg-[#232e3c] rounded-lg p-8 max-w-md w-full border border-[rgba(255,255,255,0.1)]">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#f5f5f5] mb-2">
            Welcome
          </h2>
          <p className="text-[#708499] mb-8">
            Authenticating with Telegram…
          </p>

          {loading && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5288c1] mb-4" />
              <p className="text-sm text-[#708499]">Please wait…</p>
            </div>
          )}

          {error && (
            <div className="bg-[#ec3942]/20 border border-[#ec3942]/50 rounded-lg p-4">
              <p className="text-[#ec3942] text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-[#ec3942] underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main exported component - conditionally renders based on mock mode
export function AuthPage() {
  const isMock = isMockModeEnabled();
  
  if (isMock) {
    return <AuthPageMock />;
  }
  
  return <AuthPageTelegram />;
}
