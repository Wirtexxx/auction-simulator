import Round from "@/models/Round";
import type { Round as RoundType } from "./roundModel";

export interface CreateRoundData {
	auction_id: string;
	round_number: number;
	gift_ids: string[];
	status?: "active" | "finished";
}

export interface GetRoundsFilters {
	auction_id?: string;
	status?: "active" | "finished";
	round_number?: number;
}

export class RoundRepository {
	async create(data: CreateRoundData): Promise<RoundType> {
		const round = new Round({
			auction_id: data.auction_id,
			round_number: data.round_number,
			gift_ids: data.gift_ids,
			status: data.status || "active",
		});
		await round.save();
		return this.toRoundType(round);
	}

	async findById(id: string): Promise<RoundType | null> {
		const round = await Round.findById(id);
		return round ? this.toRoundType(round) : null;
	}

	async findByAuctionAndRound(auctionId: string, roundNumber: number): Promise<RoundType | null> {
		const round = await Round.findOne({ auction_id: auctionId, round_number: roundNumber });
		return round ? this.toRoundType(round) : null;
	}

	async findCurrentRound(auctionId: string): Promise<RoundType | null> {
		const round = await Round.findOne({ auction_id: auctionId, status: "active" }).sort({ round_number: -1 });
		return round ? this.toRoundType(round) : null;
	}

	async findAll(filters?: GetRoundsFilters): Promise<RoundType[]> {
		const query: Record<string, unknown> = {};

		if (filters?.auction_id) {
			query.auction_id = filters.auction_id;
		}

		if (filters?.status) {
			query.status = filters.status;
		}

		if (filters?.round_number !== undefined) {
			query.round_number = filters.round_number;
		}

		const rounds = await Round.find(query).sort({ round_number: 1 });

		return rounds.map((round) => this.toRoundType(round));
	}

	async finishRound(roundId: string): Promise<void> {
		await Round.findByIdAndUpdate(roundId, {
			status: "finished",
			ended_at: new Date(),
		});
	}

	async updateGiftIds(roundId: string, giftIds: string[]): Promise<void> {
		await Round.findByIdAndUpdate(roundId, {
			gift_ids: giftIds,
		});
	}

	private toRoundType(round: {
		_id: { toString: () => string };
		auction_id: { toString: () => string } | string;
		round_number: number;
		gift_ids: Array<{ toString: () => string } | string>;
		started_at: Date;
		ended_at?: Date | null;
		status: "active" | "finished";
	}): RoundType {
		return {
			_id: round._id.toString(),
			auction_id: typeof round.auction_id === "string" ? round.auction_id : round.auction_id.toString(),
			round_number: round.round_number,
			gift_ids: round.gift_ids.map((id) => (typeof id === "string" ? id : id.toString())),
			started_at: round.started_at,
			ended_at: round.ended_at || null,
			status: round.status,
		};
	}
}

