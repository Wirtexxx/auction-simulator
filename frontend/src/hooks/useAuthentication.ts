import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticate } from "../lib/api/auth";
import { saveAuth } from "../lib/authStorage";
import { waitForMockEnvironment } from "../lib/mockEnv";

interface UseAuthenticationOptions {
  getInitDataRaw: () => string | undefined;
  mode: "mock" | "telegram";
}

export function useAuthentication({ getInitDataRaw, mode }: UseAuthenticationOptions) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        if (import.meta.env.DEV) {
          console.log(`🔍 AuthPage (${mode === "mock" ? "Mock" : "Telegram"}): Starting authentication...`);
        }

        await waitForMockEnvironment();

        const initDataRaw = getInitDataRaw();

        if (!initDataRaw) {
          const errorMessage =
            mode === "mock"
              ? "Telegram init data not available in mock mode. Make sure VITE_MOCK_TELEGRAM=true is set."
              : "Telegram init data not available. Please open this app from Telegram Mini App.";
          throw new Error(errorMessage);
        }

        if (import.meta.env.DEV) {
          console.log(`✅ AuthPage (${mode === "mock" ? "Mock" : "Telegram"}): initDataRaw available, calling authenticate...`);
        }

        const response = await authenticate(initDataRaw);

        if (!response.success || !response.responseObject) {
          throw new Error(response.message || "Authentication failed");
        }

        saveAuth(response.responseObject.token, response.responseObject.user);

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
  }, [navigate, getInitDataRaw, mode]);

  return { loading, error };
}
