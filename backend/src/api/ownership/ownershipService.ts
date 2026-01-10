import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import type { Ownership } from "./ownershipModel";
import { OwnershipRepository, type GetOwnershipsFilters } from "./ownershipRepository";

export class OwnershipService {
	private ownershipRepository: OwnershipRepository;

	constructor() {
		this.ownershipRepository = new OwnershipRepository();
	}

	async getOwnershipById(id: string): Promise<ServiceResponse<Ownership>> {
		const ownership = await this.ownershipRepository.findById(id);

		if (!ownership) {
			return ServiceResponse.failure("Ownership not found", null as unknown as Ownership, StatusCodes.NOT_FOUND);
		}

		return ServiceResponse.success("Ownership retrieved successfully", ownership);
	}

	async getOwnerships(filters?: GetOwnershipsFilters): Promise<ServiceResponse<Ownership[]>> {
		try {
			const ownerships = await this.ownershipRepository.findAll(filters);
			return ServiceResponse.success("Ownerships retrieved successfully", ownerships);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to retrieve ownerships";
			return ServiceResponse.failure(errorMessage, [] as Ownership[], StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const ownershipService = new OwnershipService();

