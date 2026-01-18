import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useRawInitData, useLaunchParams } from "@tma.js/sdk-react";
import { retrieveLaunchParams } from "@tma.js/sdk";
import { authenticate } from "../lib/api/auth";
import { saveAuth } from "../lib/authStorage";
import { waitForMockEnvironment } from "../lib/mockEnv";

export function AuthPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const initDataRaw = useRawInitData();
  const launchParams = useLaunchParams();

  // Fallback: try to get initDataRaw from retrieveLaunchParams if useRawInitData returns undefined
  const getInitDataRaw = useCallback((): string | undefined => {
    if (initDataRaw && typeof initDataRaw === "string") {
      return initDataRaw;
    }
    
    // Try to get from launchParams
    if (launchParams?.initDataRaw && typeof launchParams.initDataRaw === "string") {
      return launchParams.initDataRaw;
    }

    // Try to get directly from retrieveLaunchParams (synchronous fallback)
    try {
      const params = retrieveLaunchParams();
      if (params.initDataRaw && typeof params.initDataRaw === "string") {
        return params.initDataRaw;
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn("⚠️ Failed to retrieve launch params:", e);
      }
    }

    return undefined;
  }, [initDataRaw, launchParams]);

  useEffect(() => {
    (async () => {
      try {
        if (import.meta.env.DEV) {
          console.log("🔍 AuthPage: Starting authentication...");
          console.log("🔍 AuthPage: initDataRaw from useRawInitData():", initDataRaw ? `${initDataRaw.substring(0, 100)}...` : "undefined");
          console.log("🔍 AuthPage: launchParams:", launchParams);
        }

        await waitForMockEnvironment();

        if (import.meta.env.DEV) {
          console.log("🔍 AuthPage: Mock environment ready");
        }

        // Get initDataRaw with fallback
        const finalInitDataRaw = getInitDataRaw();

        if (import.meta.env.DEV) {
          console.log("🔍 AuthPage: finalInitDataRaw:", finalInitDataRaw ? `${finalInitDataRaw.substring(0, 100)}...` : "undefined");
        }

        // Wait for initDataRaw to be available
        if (!finalInitDataRaw) {
          if (import.meta.env.DEV) {
            console.warn("⚠️ AuthPage: initDataRaw is undefined, trying fallback...");
          }
          // In mock mode, try to get from localStorage as fallback
          if (import.meta.env.DEV) {
            const urlParams = new URLSearchParams(window.location.search);
            const isMock = urlParams.get("mock") === "true" || import.meta.env.VITE_MOCK_TELEGRAM === "true";
            if (isMock) {
              if (import.meta.env.DEV) {
                console.log("🔍 AuthPage: Mock mode detected, checking localStorage...");
              }
              const stored = localStorage.getItem("tma-js-sdk-launch-params");
              if (stored) {
                try {
                  const data = JSON.parse(stored);
                  if (data.tgWebAppData && typeof data.tgWebAppData === "string") {
                    if (import.meta.env.DEV) {
                      console.log("✅ AuthPage: Found initData in localStorage, authenticating...");
                    }
                    const response = await authenticate(data.tgWebAppData);
                    if (response.success && response.responseObject) {
                      saveAuth(
                        response.responseObject.token,
                        response.responseObject.user
                      );
                      navigate("/app/auction", { replace: true });
                      return;
                    }
                  }
                } catch (e) {
                  if (import.meta.env.DEV) {
                    console.error("❌ AuthPage: Error parsing localStorage data:", e);
                  }
                  // Fall through to error
                }
              } else {
                if (import.meta.env.DEV) {
                  console.warn("⚠️ AuthPage: localStorage is empty");
                }
              }
            }
          }
          throw new Error("Telegram init data not available. Please open this app from Telegram Mini App.");
        }

        if (import.meta.env.DEV) {
          console.log("✅ AuthPage: initDataRaw available, calling authenticate...");
          console.log("📤 AuthPage: Sending initData (length):", finalInitDataRaw.length);
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
  }, [navigate, initDataRaw, launchParams, getInitDataRaw]);

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
