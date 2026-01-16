import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import {
	AuctionSchema,
	CollectionSchema,
	GiftSchema,
	OwnershipSchema,
	RoundSchema,
	UserSchema,
	WalletSchema,
} from "./modelSchemas";

export const modelRegistry = new OpenAPIRegistry();

// Register all model schemas
modelRegistry.register("User", UserSchema);
modelRegistry.register("Wallet", WalletSchema);
modelRegistry.register("Collection", CollectionSchema);
modelRegistry.register("Gift", GiftSchema);
modelRegistry.register("Auction", AuctionSchema);
modelRegistry.register("Ownership", OwnershipSchema);
modelRegistry.register("Round", RoundSchema);
