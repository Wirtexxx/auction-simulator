import Auction from "@/models/Auction";
import type { Auction as AuctionType } from "./auctionModel";

export interface CreateAuctionData {
	collection_id: string;
	round_duration: number;
	gifts_per_round: number;
	total_rounds?: number;
	status?: "active" | "finished";
}

export interface GetAuctionsFilters {
	collection_id?: string;
	status?: "active" | "finished";
	limit?: number;
	offset?: number;
}

export class AuctionRepository {
	async create(data: CreateAuctionData): Promise<AuctionType> {
		const auction = new Auction({
			collection_id: data.collection_id,
			round_duration: data.round_duration,
			gifts_per_round: data.gifts_per_round,
			total_rounds: data.total_rounds || 0,
			current_round_number: 1,
			current_round_started_at: new Date(),
			status: data.status || "active",
		});
		await auction.save();
		return this.toAuctionType(auction);
	}

	async findById(id: string): Promise<AuctionType | null> {
		const auction = await Auction.findById(id);
		return auction ? this.toAuctionType(auction) : null;
	}

	async findAll(filters?: GetAuctionsFilters): Promise<AuctionType[]> {
		const query: Record<string, unknown> = {};

		if (filters?.collection_id) {
			query.collection_id = filters.collection_id;
		}

		if (filters?.status) {
			query.status = filters.status;
		}

		const auctions = await Auction.find(query)
			.limit(filters?.limit || 100)
			.skip(filters?.offset || 0)
			.sort({ created_at: -1 });

		return auctions.map((auction) => this.toAuctionType(auction));
	}

	async updateCurrentRound(auctionId: string, roundNumber: number, startedAt: Date): Promise<void> {
		await Auction.findByIdAndUpdate(auctionId, {
			current_round_number: roundNumber,
			current_round_started_at: startedAt,
		});
	}

	async findActiveAuctions(): Promise<AuctionType[]> {
		const auctions = await Auction.find({ status: "active" });
		return auctions.map((auction) => this.toAuctionType(auction));
	}

	async finishAuction(auctionId: string): Promise<void> {
		await Auction.findByIdAndUpdate(auctionId, {
			status: "finished",
		});
	}

	async updateTotalRounds(auctionId: string, totalRounds: number): Promise<void> {
		await Auction.findByIdAndUpdate(auctionId, {
			total_rounds: totalRounds,
		});
	}

	async finishAllActiveAuctions(): Promise<number> {
		const result = await Auction.updateMany(
			{ status: "active" },
			{ status: "finished" }
		);
		return result.modifiedCount || 0;
	}

	private toAuctionType(auction: {
		_id: { toString: () => string };
		collection_id: { toString: () => string } | string;
		round_duration: number;
		gifts_per_round: number;
		current_round_number: number;
		current_round_started_at?: Date | null;
		total_rounds?: number;
		status: "active" | "finished";
		created_at: Date;
	}): AuctionType {
		return {
			_id: auction._id.toString(),
			collection_id: typeof auction.collection_id === "string" ? auction.collection_id : auction.collection_id.toString(),
			round_duration: auction.round_duration,
			gifts_per_round: auction.gifts_per_round,
			current_round_number: auction.current_round_number,
			current_round_started_at: auction.current_round_started_at || null,
			total_rounds: auction.total_rounds || 0,
			status: auction.status,
			created_at: auction.created_at,
		};
	}
}


