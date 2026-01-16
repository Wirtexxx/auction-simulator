import express, { type Router } from "express";
import { telegramBotController } from "./telegramBotController";

export const telegramBotRouter: Router = express.Router();

// POST /webhook/telegram - Telegram webhook endpoint
// Telegram will send updates to this endpoint
telegramBotRouter.post("/webhook/telegram", telegramBotController.webhook);

// Alternative: POST /webhook/telegram/:token - if you want to include token in URL
// telegramBotRouter.post("/webhook/telegram/:token", telegramBotController.webhook);
