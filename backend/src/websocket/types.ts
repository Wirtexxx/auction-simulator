/**
 * WebSocket event types for auction real-time communication
 */

export interface WebSocketMessage {
	type: string;
	data?: unknown;
	error?: string;
}

export interface BidMessage {
	type: "bid";
	data: {
		auctionId: string;
		amount: number;
	};
}

export interface SubscribeMessage {
	type: "subscribe";
	data: {
		auctionId: string;
	};
}

export interface UnsubscribeMessage {
	type: "unsubscribe";
	data: {
		auctionId: string;
	};
}

export interface BidPlacedEvent {
	type: "bid_placed";
	data: {
		auctionId: string;
		userId: number;
		amount: number;
		timestamp: number;
	};
}

export interface RoundStartedEvent {
	type: "round_started";
	data: {
		auctionId: string;
		roundNumber: number;
		roundEndTs: number;
	};
}

export interface RoundClosedEvent {
	type: "round_closed";
	data: {
		auctionId: string;
		roundNumber: number;
	};
}

export interface RoundSettledEvent {
	type: "round_settled";
	data: {
		auctionId: string;
		roundNumber: number;
		winners: Array<{
			userId: number;
			amount: number;
		}>;
	};
}

export interface AuctionFinishedEvent {
	type: "auction_finished";
	data: {
		auctionId: string;
	};
}

export interface ErrorEvent {
	type: "error";
	error: string;
	message?: string;
}

export type WebSocketEvent =
	| BidPlacedEvent
	| RoundStartedEvent
	| RoundClosedEvent
	| RoundSettledEvent
	| AuctionFinishedEvent
	| ErrorEvent;
