import Collection from "@/models/Collection";
import type { Collection as CollectionType } from "./collectionModel";

export interface CreateCollectionData {
	title: string;
	description?: string;
	total_amount: number;
	minted_amount?: number;
}

export interface GetCollectionsFilters {
	limit?: number;
	offset?: number;
}

export class CollectionRepository {
	async create(data: CreateCollectionData): Promise<CollectionType> {
		const collection = new Collection(data);
		await collection.save();
		return this.toCollectionType(collection);
	}

	async findById(id: string): Promise<CollectionType | null> {
		const collection = await Collection.findById(id);
		return collection ? this.toCollectionType(collection) : null;
	}

	async findAll(filters?: GetCollectionsFilters): Promise<CollectionType[]> {
		const collections = await Collection.find()
			.limit(filters?.limit || 100)
			.skip(filters?.offset || 0)
			.sort({ created_at: -1 });

		return collections.map((collection) => this.toCollectionType(collection));
	}

	async updateMintedAmount(id: string, minted_amount: number): Promise<CollectionType | null> {
		const collection = await Collection.findByIdAndUpdate(id, { minted_amount }, { new: true });
		return collection ? this.toCollectionType(collection) : null;
	}

	async delete(id: string): Promise<boolean> {
		const result = await Collection.findByIdAndDelete(id);
		return result !== null;
	}

	private toCollectionType(collection: {
		_id: { toString: () => string };
		title: string;
		description?: string | null;
		total_amount: number;
		minted_amount: number;
		created_at: Date;
	}): CollectionType {
		return {
			_id: collection._id.toString(),
			title: collection.title,
			description: collection.description || null,
			total_amount: collection.total_amount,
			minted_amount: collection.minted_amount,
			created_at: collection.created_at,
		};
	}
}
