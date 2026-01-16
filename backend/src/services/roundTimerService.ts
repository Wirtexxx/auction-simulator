import { pino } from "pino";
import { roundService } from "@/api/round/roundService";
import { getExpiredRoundTimers, isAuctionSettling, removeRoundTimer } from "@/common/redis/auctionState";

const logger = pino({ name: "roundTimerService" });

export class RoundTimerService {
	private intervalId: NodeJS.Timeout | null = null;
	private isRunning = false;
	private readonly POLL_INTERVAL = 1000; // Check every second

	/**
	 * Start the timer worker process
	 */
	public start(): void {
		if (this.isRunning) {
			logger.warn("Round timer service is already running");
			return;
		}

		this.isRunning = true;
		logger.info("Round timer service started");

		this.intervalId = setInterval(async () => {
			await this.checkExpiredRounds();
		}, this.POLL_INTERVAL);
	}

	/**
	 * Stop the timer worker process
	 */
	public stop(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
		this.isRunning = false;
		logger.info("Round timer service stopped");
	}

	/**
	 * Check for expired rounds and close them
	 */
	private async checkExpiredRounds(): Promise<void> {
		try {
			const expired = await getExpiredRoundTimers();

			if (expired.length > 0) {
				logger.debug({ expiredCount: expired.length }, "Found expired round timers");
			}

			for (const { auctionId, roundNumber } of expired) {
				try {
					// Check if auction is already settling to avoid duplicate processing
					const isSettling = await isAuctionSettling(auctionId);
					if (isSettling) {
						logger.debug({ auctionId, roundNumber }, "Round is already settling, removing timer and skipping");
						// Remove timer if already settling to prevent repeated attempts
						await removeRoundTimer(auctionId, roundNumber);
						continue;
					}

					// Check if round exists before attempting to close
					logger.info({ auctionId, roundNumber }, "Round timer expired, checking if round exists");

					const roundResponse = await roundService.getRoundByAuctionAndNumber(auctionId, roundNumber);
					if (!roundResponse.success || !roundResponse.responseObject) {
						logger.error(
							{ auctionId, roundNumber, error: roundResponse.message },
							"Round not found for expired timer - removing timer to prevent infinite loops",
						);
						// Remove timer if round doesn't exist (likely already processed or deleted)
						await removeRoundTimer(auctionId, roundNumber);
						continue;
					}

					const round = roundResponse.responseObject;
					logger.info(
						{ auctionId, roundNumber, roundId: round._id, status: round.status },
						"Round found, attempting to close",
					);

					// Close the round (this will trigger settlement)
					const closeResponse = await roundService.closeRound(auctionId, roundNumber);

					// Remove timer ONLY after successful close
					if (closeResponse.success) {
						await removeRoundTimer(auctionId, roundNumber);
						logger.info({ auctionId, roundNumber }, "Round closed successfully, timer removed");
					} else {
						logger.error(
							{ auctionId, roundNumber, error: closeResponse.message },
							"Failed to close round - timer NOT removed to allow retry",
						);
						// Don't remove timer on failure - allow retry on next check
						// But add a small delay to prevent immediate retry
						// The timer will be checked again on next poll
					}
				} catch (error) {
					logger.error(
						{ error, auctionId, roundNumber, errorMessage: error instanceof Error ? error.message : String(error) },
						"Error processing expired round timer",
					);
					// On error, we still remove the timer to prevent infinite loops
					// But log the error for investigation
					try {
						await removeRoundTimer(auctionId, roundNumber);
						logger.warn({ auctionId, roundNumber }, "Timer removed after error to prevent infinite loops");
					} catch (removeError) {
						logger.error({ error: removeError, auctionId, roundNumber }, "Failed to remove timer after error");
					}
				}
			}
		} catch (error) {
			logger.error(
				{ error, errorMessage: error instanceof Error ? error.message : String(error) },
				"Error checking expired rounds",
			);
		}
	}
}

// Singleton instance
let roundTimerService: RoundTimerService | null = null;

export function getRoundTimerService(): RoundTimerService {
	if (!roundTimerService) {
		roundTimerService = new RoundTimerService();
	}
	return roundTimerService;
}
