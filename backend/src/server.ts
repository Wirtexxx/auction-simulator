import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import { auctionRouter } from "@/api/auction/auctionRouter";
import { bidRouter } from "@/api/bid/bidRouter";
import { collectionRouter } from "@/api/collection/collectionRouter";
import { giftRouter } from "@/api/gift/giftRouter";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { ownershipRouter } from "@/api/ownership/ownershipRouter";
import { roundRouter } from "@/api/round/roundRouter";
import { userRouter } from "@/api/user/userRouter";
import { walletRouter } from "@/api/wallet/walletRouter";
import { telegramBotRouter } from "@/api/telegramBot/telegramBotRouter";
import { openAPIRouter } from "@/api-docs/openAPIRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/users", userRouter);
app.use("/gifts", giftRouter);
app.use("/collections", collectionRouter);
app.use("/ownerships", ownershipRouter);
app.use("/auctions", auctionRouter);
app.use("/rounds", roundRouter);
app.use("/bids", bidRouter);
app.use("/wallets", walletRouter);
app.use("/", telegramBotRouter); // Telegram webhook: POST /webhook/telegram

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
