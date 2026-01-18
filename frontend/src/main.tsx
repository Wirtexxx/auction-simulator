import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import {init } from "@tma.js/sdk";

document.documentElement.classList.add("dark");

if (import.meta.env.DEV) {
  import("eruda").then((m) => m.default.init()).catch(() => {});
}
async function initializeApp() {
    init();
    console.log("✅ Telegram SDK initialized");
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
