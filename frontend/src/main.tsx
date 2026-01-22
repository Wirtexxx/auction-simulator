import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import {init} from "@tma.js/sdk";
import { initMockEnvironment, isMockModeEnabled } from "./lib/mockEnv";

document.documentElement.classList.add("dark");

if (import.meta.env.DEV) {
  import("eruda").then((m) => m.default.init()).catch(() => {});
}
async function initializeApp() {
    // Initialize mock environment first (if needed)
    await initMockEnvironment();
    
    // Only initialize Telegram SDK if not in mock mode
    // In mock mode, we use localStorage/URL fallback instead
    if (!isMockModeEnabled()) {
      init();
      console.log("✅ Telegram SDK initialized");
    } else {
      console.log("ℹ️ Mock mode enabled, skipping Telegram SDK initialization");
    }
  }

initializeApp().catch((err) => {
    console.error("⚠️ Failed to initialize app environment:", err);
  })
  .finally(() => {
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
