// Re-export all types
export type {
    AuthResponse,
    Collection,
    CreateCollectionData,
    ServiceResponse,
    Wallet,
} from "./types";

// Re-export all functions
export { authenticate } from "./auth";
export { createAuction, getAuctions, type Auction, type CreateAuctionData } from "./auction";
export { createCollection, deleteCollection, getCollectionById, getCollections } from "./collection";
export { getGiftById, getGifts, type Gift } from "./gift";
export { getOwnershipsByGiftId, getOwnershipsByOwnerId, type Ownership } from "./ownership";
export { getWallet, updateWalletBalance } from "./wallet";

