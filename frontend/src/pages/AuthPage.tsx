import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRawInitData, useLaunchParams } from "@tma.js/sdk-react";
import { retrieveLaunchParams } from "@tma.js/sdk";
import { authenticate } from "../lib/api/auth";
import { saveAuth } from "../lib/authStorage";
import { waitForMockEnvironment, isMockModeEnabled } from "../lib/mockEnv";
import { getTelegramInitData } from "../lib/telegramUtils";

// Component for mock mode (doesn't use SDK hooks that fail)
function AuthPageMock() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        if (import.meta.env.DEV) {
          console.log("🔍 AuthPage (Mock): Starting authentication...");
        }

        await waitForMockEnvironment();

        // Get initData from localStorage/URL (mock mode)
        const initDataRaw = getTelegramInitData();

        if (!initDataRaw) {
          throw new Error("Telegram init data not available in mock mode. Make sure VITE_MOCK_TELEGRAM=true is set.");
        }

        if (import.meta.env.DEV) {
          console.log("✅ AuthPage (Mock): initDataRaw available, calling authenticate...");
        }

        const response = await authenticate(initDataRaw);

        if (!response.success || !response.responseObject) {
          throw new Error(response.message || "Authentication failed");
        }

        saveAuth(
          response.responseObject.token,
          response.responseObject.user
        );

        navigate("/app/auction", { replace: true });
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Authentication error");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  return <AuthPageUI loading={loading} error={error} />;
}

// Component for real Telegram mode (uses SDK hooks)
function AuthPageTelegram() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const initDataRaw = useRawInitData();
  const launchParams = useLaunchParams();

  useEffect(() => {
    (async () => {
      try {
        if (import.meta.env.DEV) {
          console.log("🔍 AuthPage (Telegram): Starting authentication...");
        }

        await waitForMockEnvironment();

        // Get initDataRaw with fallback
        let finalInitDataRaw: string | undefined = initDataRaw;

        if (!finalInitDataRaw && launchParams?.initDataRaw) {
          const launchParamsInitData = launchParams.initDataRaw;
          if (typeof launchParamsInitData === "string" && launchParamsInitData.length > 0) {
            finalInitDataRaw = launchParamsInitData;
          }
        }

        if (!finalInitDataRaw) {
          try {
            const params = retrieveLaunchParams();
            const paramsInitData = params.initDataRaw;
            if (typeof paramsInitData === "string" && paramsInitData.length > 0) {
              finalInitDataRaw = paramsInitData;
            }
          } catch (e) {
            if (import.meta.env.DEV) {
              console.warn("⚠️ Failed to retrieve launch params:", e);
            }
          }
        }

        if (!finalInitDataRaw) {
          throw new Error("Telegram init data not available. Please open this app from Telegram Mini App.");
        }

        if (import.meta.env.DEV) {
          console.log("✅ AuthPage (Telegram): initDataRaw available, calling authenticate...");
        }

        const response = await authenticate(finalInitDataRaw);

        if (!response.success || !response.responseObject) {
          throw new Error(response.message || "Authentication failed");
        }

        saveAuth(
          response.responseObject.token,
          response.responseObject.user
        );

        navigate("/app/auction", { replace: true });
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Authentication error");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, initDataRaw, launchParams]);

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
