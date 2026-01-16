import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initMockEnvironment } from "./lib/mockEnv";

// Initialize mock Telegram environment if enabled
// Must be called before React renders to ensure mock data is available
initMockEnvironment().catch((error) => {
    if (import.meta.env.DEV) {
        console.error("Failed to initialize mock environment:", error);
    }
});

// Ensure dark theme is applied
document.documentElement.classList.add("dark");

// Initialize Eruda for debugging in dev mode (optional)
if (import.meta.env.DEV) {
    import("eruda")
        .then((eruda) => {
            eruda.default.init();
        })
        .catch(() => {
            // Eruda is optional, fail silently if not available
        });
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
