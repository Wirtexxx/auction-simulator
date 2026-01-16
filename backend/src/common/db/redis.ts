import Redis, { type RedisOptions } from "ioredis";
import { pino } from "pino";
import { env } from "@/common/utils/envConfig";

const logger = pino({ name: "redis" });

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
	if (redisClient) {
		return redisClient;
	}

	const config: RedisOptions = {
		host: env.REDIS_HOST,
		port: env.REDIS_PORT,
		retryStrategy: (times: number) => {
			const delay = Math.min(times * 50, 2000);
			return delay;
		},
		maxRetriesPerRequest: 3,
		lazyConnect: true,
	};

	if (env.REDIS_PASSWORD) {
		config.password = env.REDIS_PASSWORD;
	}

	redisClient = new Redis(config);

	redisClient.on("connect", () => {
		logger.info("Redis client connecting...");
	});

	redisClient.on("ready", () => {
		logger.info("✅ Redis client connected and ready");
	});

	redisClient.on("error", (error) => {
		logger.error({ error }, "Redis client error");
	});

	redisClient.on("close", () => {
		logger.warn("Redis client connection closed");
	});

	redisClient.on("reconnecting", () => {
		logger.info("Redis client reconnecting...");
	});

	return redisClient;
}

export async function connectRedis(): Promise<void> {
	const client = getRedisClient();

	try {
		await client.connect();
		logger.info("✅ Redis connected successfully");
	} catch (error) {
		logger.error({ error }, "Failed to connect to Redis");
		throw error;
	}
}

export async function disconnectRedis(): Promise<void> {
	if (redisClient) {
		try {
			await redisClient.quit();
			redisClient = null;
			logger.info("Redis disconnected");
		} catch (error) {
			logger.error({ error }, "Error disconnecting from Redis");
			throw error;
		}
	}
}

export function getRedisConnectionStatus(): boolean {
	return redisClient !== null && redisClient.status === "ready";
}
