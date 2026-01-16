import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import { auctionRouter } from "@/api/auction/auctionRouter";
import { bidRouter } from "@/api/bid/bidRouter";
import { collectionRouter } from "@/api/collection/collectionRouter";
import { giftRouter } from "@/api/gift/giftRouter";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { metricsRouter } from "@/api/metrics/metricsRouter";
import { ownershipRouter } from "@/api/ownership/ownershipRouter";
import { roundRouter } from "@/api/round/roundRouter";
import { telegramBotRouter } from "@/api/telegramBot/telegramBotRouter";
import { userRouter } from "@/api/user/userRouter";
import { walletRouter } from "@/api/wallet/walletRouter";
import { openAPIRouter } from "@/api-docs/openAPIRouter";
import errorHandler from "@/common/middleware/errorHandler";
import { inputSanitization } from "@/common/middleware/inputSanitization";
import metricsMiddleware from "@/common/middleware/metricsMiddleware";
import { nosqlInjectionProtection } from "@/common/middleware/nosqlInjectionProtection";
import { objectIdValidation } from "@/common/middleware/objectIdValidation";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Security: Enhanced Helmet configuration
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Swagger UI
				scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for Swagger UI
				imgSrc: ["'self'", "data:", "https:"],
			},
		},
		crossOriginEmbedderPolicy: false, // Disable for API
		crossOriginResourcePolicy: { policy: "cross-origin" },
		hsts: {
			maxAge: 31536000, // 1 year
			includeSubDomains: true,
			preload: true,
		},
		xssFilter: true,
		noSniff: true,
		frameguard: { action: "deny" },
	}),
);

// CORS configuration
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// Body parsing with size limits to prevent DoS attacks
// Limit JSON payload to 10MB
app.use(express.json({ limit: "10mb" }));
// Limit URL-encoded payload to 10MB
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security: NoSQL injection protection (before body parsing validation)
app.use(nosqlInjectionProtection);

// Security: Input sanitization
app.use(inputSanitization);

// Security: ObjectId validation for route parameters
app.use(objectIdValidation);

// Rate limiting
app.use(rateLimiter);

// Metrics middleware (before request logger to measure all requests)
app.use(metricsMiddleware);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/metrics", metricsRouter); // Prometheus metrics endpoint
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
