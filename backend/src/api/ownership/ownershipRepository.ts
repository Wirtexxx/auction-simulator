import Ownership from "@/models/Ownership";
import type { Ownership as OwnershipType } from "./ownershipModel";

export interface GetOwnershipsFilters {
	owner_id?: number;
	gift_id?: string;
	limit?: number;
	offset?: number;
}

export interface CreateOwnershipData {
	owner_id: number;
	gift_id: string;
	acquired_price: number;
}

export class OwnershipRepository {
	async create(data: CreateOwnershipData): Promise<OwnershipType> {
		const ownership = new Ownership({
			owner_id: data.owner_id,
			gift_id: data.gift_id,
			acquired_price: data.acquired_price,
			acquired_at: new Date(),
		});
		await ownership.save();
		return this.toOwnershipType(ownership);
	}

	async findById(id: string): Promise<OwnershipType | null> {
		const ownership = await Ownership.findById(id);
		return ownership ? this.toOwnershipType(ownership) : null;
	}

	async findAll(filters?: GetOwnershipsFilters): Promise<OwnershipType[]> {
		const query: Record<string, unknown> = {};

		if (filters?.owner_id) {
			query.owner_id = filters.owner_id;
		}

		if (filters?.gift_id) {
			query.gift_id = filters.gift_id;
		}

		const ownerships = await Ownership.find(query)
			.limit(filters?.limit || 100)
			.skip(filters?.offset || 0)
			.sort({ acquired_at: -1 });

		return ownerships.map((ownership) => this.toOwnershipType(ownership));
	}

	private toOwnershipType(ownership: {
		_id: { toString: () => string };
		gift_id: { toString: () => string } | string;
		owner_id: number;
		acquired_price: number;
		acquired_at: Date;
	}): OwnershipType {
		return {
			_id: ownership._id.toString(),
			gift_id: typeof ownership.gift_id === "string" ? ownership.gift_id : ownership.gift_id.toString(),
			owner_id: ownership.owner_id,
			acquired_price: ownership.acquired_price,
			acquired_at: ownership.acquired_at,
		};
	}
}
