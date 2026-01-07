import { connectMongoDB, disconnectMongoDB } from "@/common/db/mongodb";
import { connectRedis, disconnectRedis } from "@/common/db/redis";
import { env } from "@/common/utils/envConfig";
import { app, logger } from "@/server";

async function startServer() {
	try {
		// Connect to databases
		await connectMongoDB();
		await connectRedis();

		// Start server
		const server = app.listen(env.PORT, () => {
			const { NODE_ENV, HOST, PORT } = env;
			logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
		});

		const onCloseSignal = async () => {
			logger.info("sigint received, shutting down");
			server.close(async () => {
				logger.info("server closed");
				try {
					await disconnectMongoDB();
					await disconnectRedis();
					logger.info("Databases disconnected");
					process.exit(0);
				} catch (error) {
					logger.error({ error }, "Error during shutdown");
					process.exit(1);
				}
			});
			setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
		};

		process.on("SIGINT", onCloseSignal);
		process.on("SIGTERM", onCloseSignal);
	} catch (error) {
		logger.error({ error }, "Failed to start server");
		process.exit(1);
	}
}

startServer();
