import Auction from "@/models/Auction";
import type { Auction as AuctionType } from "./auctionModel";

export interface CreateAuctionData {
	collection_id: string;
	round_duration: number;
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

	private toAuctionType(auction: {
		_id: { toString: () => string };
		collection_id: { toString: () => string } | string;
		round_duration: number;
		status: "active" | "finished";
		created_at: Date;
	}): AuctionType {
		return {
			_id: auction._id.toString(),
			collection_id: typeof auction.collection_id === "string" ? auction.collection_id : auction.collection_id.toString(),
			round_duration: auction.round_duration,
			status: auction.status,
			created_at: auction.created_at,
		};
	}
}

