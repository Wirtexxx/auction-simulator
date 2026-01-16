import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { parse } from "url";
import jwt from "jsonwebtoken";
import { pino } from "pino";
import { env } from "@/common/utils/envConfig";
import User from "@/models/User";
import type {
	BidMessage,
	SubscribeMessage,
	UnsubscribeMessage,
	WebSocketEvent,
	ErrorEvent,
} from "./types";
import { bidService } from "@/api/bid/bidService";

const logger = pino({ name: "auctionWebSocket" });

interface AuthenticatedWebSocket extends WebSocket {
	userId?: number;
	subscribedAuctions?: Set<string>;
	isAlive?: boolean;
}

export class AuctionWebSocketServer {
	private wss: WebSocketServer;
	private clients: Map<number, Set<AuthenticatedWebSocket>> = new Map(); // userId -> Set of connections
	private auctionSubscribers: Map<string, Set<AuthenticatedWebSocket>> = new Map(); // auctionId -> Set of connections

	constructor(server: any) {
		this.wss = new WebSocketServer({
			server,
			path: "/ws/auction",
		});

		this.setupWebSocket();
		logger.info("Auction WebSocket server initialized");
	}

	private setupWebSocket(): void {
		this.wss.on("connection", async (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
			ws.isAlive = true;
			ws.subscribedAuctions = new Set();

			// Handle ping/pong for keepalive
			ws.on("pong", () => {
				ws.isAlive = true;
			});

			// Authenticate connection
			const authenticated = await this.authenticateConnection(ws, req);
			if (!authenticated) {
				ws.close(1008, "Authentication failed");
				return;
			}

			logger.info({ userId: ws.userId }, "WebSocket client connected");

			// Handle messages
			ws.on("message", async (data: Buffer) => {
				try {
					const message = JSON.parse(data.toString());
					await this.handleMessage(ws, message);
				} catch (error) {
					logger.error({ error }, "Error handling WebSocket message");
					this.sendError(ws, "Invalid message format");
				}
			});

			// Handle disconnect
			ws.on("close", () => {
				this.handleDisconnect(ws);
			});

			// Handle errors
			ws.on("error", (error) => {
				logger.error({ error, userId: ws.userId }, "WebSocket error");
			});
		});

		// Keepalive ping interval
		const interval = setInterval(() => {
			this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
				if (!ws.isAlive) {
					ws.terminate();
					return;
				}
				ws.isAlive = false;
				ws.ping();
			});
		}, 30000); // 30 seconds

		this.wss.on("close", () => {
			clearInterval(interval);
		});
	}

	private async authenticateConnection(
		ws: AuthenticatedWebSocket,
		req: IncomingMessage,
	): Promise<boolean> {
		try {
			const parsedUrl = parse(req.url || "", true);
			const token = parsedUrl.query.token as string;

			if (!token) {
				logger.warn("WebSocket connection without token");
				return false;
			}

			const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number };
			const user = await User.findById(decoded.userId);

			if (!user) {
				logger.warn({ userId: decoded.userId }, "User not found for WebSocket connection");
				return false;
			}

			ws.userId = user._id;

			// Add to clients map
			if (!this.clients.has(user._id)) {
				this.clients.set(user._id, new Set());
			}
			this.clients.get(user._id)!.add(ws);

			return true;
		} catch (error) {
			logger.error({ error }, "WebSocket authentication failed");
			return false;
		}
	}

	private async handleMessage(ws: AuthenticatedWebSocket, message: unknown): Promise<void> {
		if (!ws.userId) {
			this.sendError(ws, "Not authenticated");
			return;
		}

		if (typeof message !== "object" || message === null || !("type" in message)) {
			this.sendError(ws, "Invalid message format");
			return;
		}

		const msg = message as { type: string; data?: unknown };

		switch (msg.type) {
			case "bid":
				await this.handleBid(ws, msg as BidMessage);
				break;
			case "subscribe":
				this.handleSubscribe(ws, msg as SubscribeMessage);
				break;
			case "unsubscribe":
				this.handleUnsubscribe(ws, msg as UnsubscribeMessage);
				break;
			default:
				this.sendError(ws, `Unknown message type: ${msg.type}`);
		}
	}

	private async handleBid(ws: AuthenticatedWebSocket, message: BidMessage): Promise<void> {
		if (!ws.userId) {
			this.sendError(ws, "Not authenticated");
			return;
		}

		if (!message.data?.auctionId || !message.data?.amount) {
			this.sendError(ws, "Missing auctionId or amount in bid message");
			return;
		}

		try {
			const bidResponse = await bidService.placeBid(
				message.data.auctionId,
				ws.userId,
				message.data.amount,
			);

			if (!bidResponse.success) {
				this.sendError(ws, bidResponse.message);
			}
			// Success is broadcasted via WebSocket in BidService
		} catch (error) {
			logger.error({ error, userId: ws.userId }, "Error handling bid message");
			this.sendError(ws, "Failed to process bid");
		}
	}

	private handleSubscribe(ws: AuthenticatedWebSocket, message: SubscribeMessage): void {
		if (!message.data?.auctionId) {
			this.sendError(ws, "Missing auctionId in subscribe message");
			return;
		}

		const auctionId = message.data.auctionId;

		if (!this.auctionSubscribers.has(auctionId)) {
			this.auctionSubscribers.set(auctionId, new Set());
		}

		this.auctionSubscribers.get(auctionId)!.add(ws);
		ws.subscribedAuctions!.add(auctionId);

		logger.info({ userId: ws.userId, auctionId }, "Client subscribed to auction");
	}

	private handleUnsubscribe(ws: AuthenticatedWebSocket, message: UnsubscribeMessage): void {
		if (!message.data?.auctionId) {
			this.sendError(ws, "Missing auctionId in unsubscribe message");
			return;
		}

		const auctionId = message.data.auctionId;

		this.auctionSubscribers.get(auctionId)?.delete(ws);
		ws.subscribedAuctions?.delete(auctionId);

		logger.info({ userId: ws.userId, auctionId }, "Client unsubscribed from auction");
	}

	private handleDisconnect(ws: AuthenticatedWebSocket): void {
		if (ws.userId) {
			// Remove from clients map
			const userConnections = this.clients.get(ws.userId);
			if (userConnections) {
				userConnections.delete(ws);
				if (userConnections.size === 0) {
					this.clients.delete(ws.userId);
				}
			}

			// Remove from all auction subscribers
			ws.subscribedAuctions?.forEach((auctionId) => {
				this.auctionSubscribers.get(auctionId)?.delete(ws);
			});

			logger.info({ userId: ws.userId }, "WebSocket client disconnected");
		}
	}

	/**
	 * Broadcast event to all subscribers of an auction
	 */
	public broadcastToAuction(auctionId: string, event: WebSocketEvent): void {
		const subscribers = this.auctionSubscribers.get(auctionId);
		if (!subscribers) {
			return;
		}

		const message = JSON.stringify(event);
		let sentCount = 0;

		subscribers.forEach((ws) => {
			if (ws.readyState === WebSocket.OPEN) {
				try {
					ws.send(message);
					sentCount++;
				} catch (error) {
					logger.error({ error }, "Error sending WebSocket message");
				}
			}
		});

		logger.info(
			{ auctionId, eventType: event.type, sentCount, totalSubscribers: subscribers.size },
			"Broadcasted event to auction subscribers",
		);
	}

	/**
	 * Send event to specific user
	 */
	public sendToUser(userId: number, event: WebSocketEvent): void {
		const connections = this.clients.get(userId);
		if (!connections) {
			return;
		}

		const message = JSON.stringify(event);

		connections.forEach((ws) => {
			if (ws.readyState === WebSocket.OPEN) {
				try {
					ws.send(message);
				} catch (error) {
					logger.error({ error }, "Error sending WebSocket message to user");
				}
			}
		});
	}

	private sendError(ws: AuthenticatedWebSocket, error: string, message?: string): void {
		const errorEvent: ErrorEvent = {
			type: "error",
			error,
			message,
		};

		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(errorEvent));
		}
	}
}

// Singleton instance
let auctionWebSocketServer: AuctionWebSocketServer | null = null;

export function initializeAuctionWebSocket(server: any): AuctionWebSocketServer {
	if (!auctionWebSocketServer) {
		auctionWebSocketServer = new AuctionWebSocketServer(server);
	}
	return auctionWebSocketServer;
}

export function getAuctionWebSocketServer(): AuctionWebSocketServer | null {
	return auctionWebSocketServer;
}

