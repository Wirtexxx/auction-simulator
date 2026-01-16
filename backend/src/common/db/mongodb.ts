import mongoose from "mongoose";
import { pino } from "pino";
import { env } from "@/common/utils/envConfig";

const logger = pino({ name: "mongodb" });

let isConnected = false;

export async function connectMongoDB(): Promise<void> {
	if (isConnected) {
		logger.info("MongoDB already connected");
		return;
	}

	try {
		const mongoUri = env.MONGO_URI;

		if (!mongoUri) {
			throw new Error("MONGO_URI is not defined");
		}

		await mongoose.connect(mongoUri, {
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
		});

		isConnected = true;
		logger.info("✅ MongoDB connected successfully");

		mongoose.connection.on("error", (error) => {
			logger.error({ error }, "MongoDB connection error");
			isConnected = false;
		});

		mongoose.connection.on("disconnected", () => {
			logger.warn("MongoDB disconnected");
			isConnected = false;
		});

		mongoose.connection.on("reconnected", () => {
			logger.info("MongoDB reconnected");
			isConnected = true;
		});
	} catch (error) {
		logger.error({ error }, "Failed to connect to MongoDB");
		isConnected = false;
		throw error;
	}
}

export async function disconnectMongoDB(): Promise<void> {
	if (!isConnected) {
		return;
	}

	try {
		await mongoose.disconnect();
		isConnected = false;
		logger.info("MongoDB disconnected");
	} catch (error) {
		logger.error({ error }, "Error disconnecting from MongoDB");
		throw error;
	}
}

export function getMongoConnectionStatus(): boolean {
	return isConnected && mongoose.connection.readyState === 1;
}
