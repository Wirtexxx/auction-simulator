import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// User Schema
export const UserSchema = z
	.object({
		_id: z.number().openapi({ description: "User ID (Telegram user ID)", example: 279058397 }),
		username: z.string().openapi({ description: "Username", example: "john_doe" }),
		first_name: z.string().openapi({ description: "First name", example: "John" }),
		last_name: z.string().nullable().optional().openapi({ description: "Last name", example: "Doe" }),
		photo_url: z
			.string()
			.nullable()
			.optional()
			.openapi({ description: "User photo URL", example: "https://example.com/photo.jpg" }),
		language_code: z.string().nullable().optional().openapi({ description: "Language code", example: "en" }),
		is_premium: z.boolean().openapi({ description: "Is Telegram Premium", example: false }),
		role: z.enum(["user", "admin"]).openapi({ description: "User role", example: "user" }),
		created_at: z.date().openapi({ description: "Creation timestamp", example: "2024-01-01T00:00:00.000Z" }),
	})
	.openapi({ title: "User", description: "User model" });

// Wallet Schema
export const WalletSchema = z
	.object({
		_id: z.number().openapi({ description: "Wallet ID (same as User ID)", example: 1 }),
		balance: z.number().openapi({ description: "Wallet balance", example: 1000.5 }),
	})
	.openapi({ title: "Wallet", description: "Wallet model" });

// Collection Schema
export const CollectionSchema = z
	.object({
		_id: z.string().openapi({ description: "Collection MongoDB ObjectId", example: "507f1f77bcf86cd799439011" }),
		title: z.string().openapi({ description: "Collection title", example: "Summer Collection" }),
		description: z
			.string()
			.nullable()
			.optional()
			.openapi({ description: "Collection description", example: "A beautiful summer collection" }),
		total_amount: z.number().openapi({ description: "Total amount of items in collection", example: 100 }),
		minted_amount: z.number().openapi({ description: "Number of minted items", example: 50 }),
		created_at: z.date().openapi({ description: "Creation timestamp", example: "2024-01-01T00:00:00.000Z" }),
	})
	.openapi({ title: "Collection", description: "Collection model" });

// Gift Schema
export const GiftSchema = z
	.object({
		_id: z.string().openapi({ description: "Gift MongoDB ObjectId", example: "507f1f77bcf86cd799439012" }),
		gift_id: z.number().openapi({ description: "Gift integer ID for display", example: 12345 }),
		emoji: z.string().openapi({ description: "Gift emoji", example: "🎁" }),
		collection_id: z
			.string()
			.openapi({ description: "Collection MongoDB ObjectId", example: "507f1f77bcf86cd799439011" }),
	})
	.openapi({ title: "Gift", description: "Gift model" });

// Auction Schema
export const AuctionSchema = z
	.object({
		_id: z.string().openapi({ description: "Auction MongoDB ObjectId", example: "507f1f77bcf86cd799439013" }),
		collection_id: z
			.string()
			.openapi({ description: "Collection MongoDB ObjectId", example: "507f1f77bcf86cd799439011" }),
		round_duration: z.number().openapi({ description: "Round duration in seconds", example: 300 }),
		gifts_per_round: z.number().openapi({ description: "Number of gifts per round", example: 5 }),
		current_round_number: z.number().openapi({ description: "Current round number", example: 1 }),
		current_round_started_at: z
			.date()
			.nullable()
			.optional()
			.openapi({ description: "Current round start timestamp", example: "2024-01-01T00:00:00.000Z" }),
		status: z.enum(["active", "finished"]).openapi({ description: "Auction status", example: "active" }),
		created_at: z.date().openapi({ description: "Creation timestamp", example: "2024-01-01T00:00:00.000Z" }),
	})
	.openapi({ title: "Auction", description: "Auction model" });

// Ownership Schema
export const OwnershipSchema = z
	.object({
		_id: z.string().openapi({ description: "Ownership MongoDB ObjectId", example: "507f1f77bcf86cd799439014" }),
		gift_id: z.string().openapi({ description: "Gift MongoDB ObjectId", example: "507f1f77bcf86cd799439012" }),
		owner_id: z.number().openapi({ description: "Owner user ID", example: 1 }),
		acquired_price: z.number().openapi({ description: "Price at which gift was acquired", example: 99.99 }),
		acquired_at: z.date().openapi({ description: "Acquisition timestamp", example: "2024-01-01T00:00:00.000Z" }),
	})
	.openapi({ title: "Ownership", description: "Ownership model" });

// Round Schema
export const RoundSchema = z
	.object({
		_id: z.string().openapi({ description: "Round MongoDB ObjectId", example: "507f1f77bcf86cd799439015" }),
		auction_id: z
			.string()
			.openapi({ description: "Auction MongoDB ObjectId", example: "507f1f77bcf86cd799439013" }),
		round_number: z.number().openapi({ description: "Round number", example: 1 }),
		gift_ids: z.array(z.string()).openapi({ description: "Array of gift IDs in this round", example: ["507f1f77bcf86cd799439011"] }),
		started_at: z.date().openapi({ description: "Round start timestamp", example: "2024-01-01T00:00:00.000Z" }),
		ended_at: z
			.date()
			.nullable()
			.optional()
			.openapi({ description: "Round end timestamp", example: "2024-01-01T00:05:00.000Z" }),
		status: z.enum(["active", "finished"]).openapi({ description: "Round status", example: "active" }),
	})
	.openapi({ title: "Round", description: "Round model" });
