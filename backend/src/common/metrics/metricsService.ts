import { Registry, Counter, Histogram, Gauge } from "prom-client";

/**
 * Prometheus metrics service
 * Centralized registry for all application metrics
 */
class MetricsService {
	private registry: Registry;

	// Business metrics - Counters
	public readonly auctionCreatedTotal: Counter<string>;
	public readonly auctionFinishedTotal: Counter<string>;
	public readonly bidPlacedTotal: Counter<string>;
	public readonly bidAmountSum: Counter<string>;
	public readonly roundSettledTotal: Counter<string>;
	public readonly winnersTotal: Counter<string>;
	public readonly giftsDistributedTotal: Counter<string>;

	// Performance metrics - Histograms
	public readonly settlementDurationSeconds: Histogram<string>;
	public readonly bidProcessingDurationSeconds: Histogram<string>;
	public readonly httpRequestDurationSeconds: Histogram<string>;
	public readonly databaseQueryDurationSeconds: Histogram<string>;
	public readonly redisOperationDurationSeconds: Histogram<string>;

	// State metrics - Gauges
	public readonly auctionActiveCount: Gauge<string>;
	public readonly roundActiveCount: Gauge<string>;
	public readonly frozenBalanceTotal: Gauge<string>;

	// HTTP metrics - Counter
	public readonly httpRequestTotal: Counter<string>;

	constructor() {
		this.registry = new Registry();

		// Set default labels (application name, version, etc.)
		this.registry.setDefaultLabels({
			app: "auction-simulator",
		});

		// Business metrics - Counters
		this.auctionCreatedTotal = new Counter({
			name: "auction_created_total",
			help: "Total number of auctions created",
			registers: [this.registry],
		});

		this.auctionFinishedTotal = new Counter({
			name: "auction_finished_total",
			help: "Total number of auctions finished",
			registers: [this.registry],
		});

		this.bidPlacedTotal = new Counter({
			name: "bid_placed_total",
			help: "Total number of bids placed",
			registers: [this.registry],
		});

		this.bidAmountSum = new Counter({
			name: "bid_amount_sum",
			help: "Total sum of all bid amounts",
			registers: [this.registry],
		});

		this.roundSettledTotal = new Counter({
			name: "round_settled_total",
			help: "Total number of rounds settled",
			registers: [this.registry],
		});

		this.winnersTotal = new Counter({
			name: "winners_total",
			help: "Total number of winners across all rounds",
			registers: [this.registry],
		});

		this.giftsDistributedTotal = new Counter({
			name: "gifts_distributed_total",
			help: "Total number of gifts distributed to winners",
			registers: [this.registry],
		});

		// Performance metrics - Histograms
		this.settlementDurationSeconds = new Histogram({
			name: "settlement_duration_seconds",
			help: "Duration of settlement processing in seconds",
			buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
			registers: [this.registry],
		});

		this.bidProcessingDurationSeconds = new Histogram({
			name: "bid_processing_duration_seconds",
			help: "Duration of bid processing in seconds",
			buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
			registers: [this.registry],
		});

		this.httpRequestDurationSeconds = new Histogram({
			name: "http_request_duration_seconds",
			help: "Duration of HTTP requests in seconds",
			labelNames: ["method", "route", "status_code"],
			buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
			registers: [this.registry],
		});

		this.databaseQueryDurationSeconds = new Histogram({
			name: "database_query_duration_seconds",
			help: "Duration of database queries in seconds",
			labelNames: ["operation", "collection"],
			buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
			registers: [this.registry],
		});

		this.redisOperationDurationSeconds = new Histogram({
			name: "redis_operation_duration_seconds",
			help: "Duration of Redis operations in seconds",
			labelNames: ["operation"],
			buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
			registers: [this.registry],
		});

		// State metrics - Gauges
		this.auctionActiveCount = new Gauge({
			name: "auction_active_count",
			help: "Current number of active auctions",
			registers: [this.registry],
		});

		this.roundActiveCount = new Gauge({
			name: "round_active_count",
			help: "Current number of active rounds",
			registers: [this.registry],
		});

		this.frozenBalanceTotal = new Gauge({
			name: "frozen_balance_total",
			help: "Total amount of frozen balances across all users",
			registers: [this.registry],
		});

		// HTTP metrics - Counter
		this.httpRequestTotal = new Counter({
			name: "http_request_total",
			help: "Total number of HTTP requests",
			labelNames: ["method", "route", "status_code"],
			registers: [this.registry],
		});
	}

	/**
	 * Get the Prometheus registry
	 */
	getRegistry(): Registry {
		return this.registry;
	}

	/**
	 * Get metrics in Prometheus format
	 */
	async getMetrics(): Promise<string> {
		return this.registry.metrics();
	}

	/**
	 * Reset all metrics (useful for testing)
	 */
	async reset(): Promise<void> {
		await this.registry.resetMetrics();
	}
}

// Export singleton instance
export const metricsService = new MetricsService();
