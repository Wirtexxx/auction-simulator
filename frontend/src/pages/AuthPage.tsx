import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authenticate } from "../lib/api/auth";
import { getTelegramInitData } from "../lib/telegramUtils";
import { saveAuth } from "../lib/authStorage";

export function AuthPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuth = async () => {
            try {
                setLoading(true);
                setError(null);

                // Small delay to ensure mock environment is initialized
                await new Promise((resolve) => setTimeout(resolve, 50));

                const initDataRaw = getTelegramInitData();
                const response = await authenticate(initDataRaw);

                if (response.success && response.responseObject) {
                    saveAuth(
                        response.responseObject.token,
                        response.responseObject.user
                    );
                    navigate("/app/auction");
                } else {
                    setError(response.message || "Authentication failed");
                }
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "An unexpected error occurred";
                setError(errorMessage);
                if (import.meta.env.DEV) {
                    console.error("Authentication error:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        handleAuth();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center h-screen bg-[#17212b]">
            <div className="bg-[#232e3c] rounded-lg shadow-xl p-8 max-w-md w-full mx-4 border border-[rgba(255,255,255,0.1)]">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-[#f5f5f5] mb-2">
                        Welcome
                    </h1>
                    <p className="text-[#708499] mb-8">
                        Authenticating with Telegram...
                    </p>

                    {loading && (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5288c1] mb-4"></div>
                            <p className="text-sm text-[#708499]">
                                Please wait...
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-[#ec3942]/20 border border-[#ec3942]/50 rounded-lg p-4 mb-4">
                            <p className="text-[#ec3942] text-sm">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-2 text-sm text-[#ec3942] hover:text-[#ec3942]/80 underline"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <p className="text-sm text-[#708499]">
                            If you're testing, add{" "}
                            <code className="bg-[#17212b] px-2 py-1 rounded text-[#f5f5f5]">
                                ?mock=true
                            </code>{" "}
                            to the URL
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
