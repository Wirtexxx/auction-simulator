import mongoose from "mongoose";
import { pino } from "pino";
import Round from "@/models/Round";
import type { Round as RoundType } from "./roundModel";

const logger = pino({ name: "roundRepository" });

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
		try {
			// Explicitly convert string to ObjectId
			let auctionObjectId: mongoose.Types.ObjectId;
			try {
				auctionObjectId = new mongoose.Types.ObjectId(data.auction_id);
			} catch (error) {
				logger.error({ auctionId: data.auction_id, error }, "Invalid auctionId format, cannot convert to ObjectId");
				throw new Error(`Invalid auction_id format: ${data.auction_id}`);
			}

			// Convert gift_ids to ObjectIds
			const giftObjectIds = data.gift_ids.map(id => {
				try {
					return new mongoose.Types.ObjectId(id);
				} catch (error) {
					logger.error({ giftId: id, error }, "Invalid giftId format");
					throw new Error(`Invalid gift_id format: ${id}`);
				}
			});

			logger.info({ 
				auctionId: data.auction_id, 
				roundNumber: data.round_number, 
				giftsCount: giftObjectIds.length,
				status: data.status || "active"
			}, "Creating round");

			const round = new Round({
				auction_id: auctionObjectId,
				round_number: data.round_number,
				gift_ids: giftObjectIds,
				status: data.status || "active",
			});
			
			await round.save();
			
			logger.info({ 
				auctionId: data.auction_id, 
				roundNumber: data.round_number, 
				roundId: round._id.toString(), 
				status: round.status,
				giftsCount: round.gift_ids.length
			}, "Round created successfully");
			
			return this.toRoundType(round);
		} catch (error) {
			logger.error({ error, auctionId: data.auction_id, roundNumber: data.round_number }, "Error creating round");
			throw error;
		}
	}

	async findById(id: string): Promise<RoundType | null> {
		const round = await Round.findById(id);
		return round ? this.toRoundType(round) : null;
	}

	async findByAuctionAndRound(auctionId: string, roundNumber: number): Promise<RoundType | null> {
		try {
			// Explicitly convert string to ObjectId to ensure proper matching
			let auctionObjectId: mongoose.Types.ObjectId;
			try {
				auctionObjectId = new mongoose.Types.ObjectId(auctionId);
			} catch (error) {
				logger.error({ auctionId, roundNumber, error }, "Invalid auctionId format, cannot convert to ObjectId");
				return null;
			}

			logger.info({ auctionId, roundNumber, auctionObjectId: auctionObjectId.toString() }, "Searching for round by auction and number");

			const round = await Round.findOne({ 
				auction_id: auctionObjectId, 
				round_number: roundNumber 
			});

			if (!round) {
				// Log for debugging - check all rounds for this auction
				const allRounds = await Round.find({ auction_id: auctionObjectId }).select("round_number status auction_id _id");
				logger.warn(
					{ 
						auctionId, 
						roundNumber, 
						existingRounds: allRounds.map(r => ({ 
							round_number: r.round_number, 
							status: r.status,
							auction_id: r.auction_id?.toString(),
							_id: r._id.toString()
						}))
					}, 
					"Round not found for auction. Listing all existing rounds for this auction"
				);
				return null;
			}

			logger.info({ auctionId, roundNumber, roundId: round._id.toString(), status: round.status }, "Round found successfully");
			return this.toRoundType(round);
		} catch (error) {
			logger.error({ error, auctionId, roundNumber }, "Error in findByAuctionAndRound");
			return null;
		}
	}

	async findCurrentRound(auctionId: string): Promise<RoundType | null> {
		try {
			// Explicitly convert string to ObjectId
			let auctionObjectId: mongoose.Types.ObjectId;
			try {
				auctionObjectId = new mongoose.Types.ObjectId(auctionId);
			} catch (error) {
				logger.error({ auctionId, error }, "Invalid auctionId format, cannot convert to ObjectId");
				return null;
			}

			const round = await Round.findOne({ 
				auction_id: auctionObjectId, 
				status: "active" 
			}).sort({ round_number: -1 });
			
			if (round) {
				logger.info({ auctionId, roundNumber: round.round_number, roundId: round._id.toString() }, "Current active round found");
			} else {
				logger.warn({ auctionId }, "No active round found for auction");
			}
			
			return round ? this.toRoundType(round) : null;
		} catch (error) {
			logger.error({ error, auctionId }, "Error in findCurrentRound");
			return null;
		}
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

