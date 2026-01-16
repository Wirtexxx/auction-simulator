import { useEffect, useRef, useState, useCallback } from "react";
import { getAuthToken } from "../lib/authStorage";
import { API_URL } from "../lib/api/config";

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

export type AuctionWebSocketEvent =
    | BidPlacedEvent
    | RoundStartedEvent
    | RoundClosedEvent
    | RoundSettledEvent
    | AuctionFinishedEvent
    | ErrorEvent;

interface UseAuctionWebSocketOptions {
    auctionId: string | null;
    enabled?: boolean;
    onBidPlaced?: (event: BidPlacedEvent) => void;
    onRoundStarted?: (event: RoundStartedEvent) => void;
    onRoundClosed?: (event: RoundClosedEvent) => void;
    onRoundSettled?: (event: RoundSettledEvent) => void;
    onAuctionFinished?: (event: AuctionFinishedEvent) => void;
    onError?: (event: ErrorEvent) => void;
}

export function useAuctionWebSocket(options: UseAuctionWebSocketOptions) {
    const {
        auctionId,
        enabled = true,
        onBidPlaced,
        onRoundStarted,
        onRoundClosed,
        onRoundSettled,
        onAuctionFinished,
        onError,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const currentAuctionIdRef = useRef<string | null>(null);
    const isConnectingRef = useRef(false);
    const callbacksRef = useRef({
        onBidPlaced,
        onRoundStarted,
        onRoundClosed,
        onRoundSettled,
        onAuctionFinished,
        onError,
    });
    const enabledRef = useRef(enabled);
    const auctionIdRef = useRef(auctionId);
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 3000;

    // Update refs when values change
    useEffect(() => {
        enabledRef.current = enabled;
        auctionIdRef.current = auctionId;
    }, [enabled, auctionId]);

    // Update callbacks ref when they change (but don't trigger reconnect)
    useEffect(() => {
        callbacksRef.current = {
            onBidPlaced,
            onRoundStarted,
            onRoundClosed,
            onRoundSettled,
            onAuctionFinished,
            onError,
        };
    }, [onBidPlaced, onRoundStarted, onRoundClosed, onRoundSettled, onAuctionFinished, onError]);

    const connect = useCallback(() => {
        // Use refs to get current values
        const currentEnabled = enabledRef.current;
        const currentAuctionId = auctionIdRef.current;

        if (!currentEnabled || !currentAuctionId) {
            return;
        }

        // Don't reconnect if already connected to the same auction
        if (wsRef.current?.readyState === WebSocket.OPEN && currentAuctionIdRef.current === currentAuctionId) {
            return;
        }

        // Don't connect if already connecting
        if (isConnectingRef.current) {
            return;
        }

        // Disconnect existing connection if auctionId changed or connection exists
        if (wsRef.current) {
            const wsState = wsRef.current.readyState;
            if (wsState === WebSocket.CONNECTING || wsState === WebSocket.OPEN) {
                wsRef.current.close();
            }
            wsRef.current = null;
        }

        isConnectingRef.current = true;
        const token = getAuthToken();
        if (!token) {
            setError("Authentication token not found");
            isConnectingRef.current = false;
            return;
        }

        // Get WebSocket URL from API URL
        // Convert http://localhost:8080 to ws://localhost:8080/ws/auction
        const wsProtocol = API_URL.startsWith("https") ? "wss" : "ws";
        const wsHost = API_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
        const wsUrl = `${wsProtocol}://${wsHost}/ws/auction?token=${token}`;

        try {
            const ws = new WebSocket(wsUrl);
            currentAuctionIdRef.current = currentAuctionId;

            ws.onopen = () => {
                isConnectingRef.current = false;
                setIsConnected(true);
                setError(null);
                reconnectAttemptsRef.current = 0;

                // Subscribe to auction
                try {
                    ws.send(
                        JSON.stringify({
                            type: "subscribe",
                            data: { auctionId: currentAuctionId },
                        })
                    );
                } catch (err) {
                    console.error("Error sending subscribe message:", err);
                }
            };

            ws.onmessage = (event) => {
                try {
                    const message: AuctionWebSocketEvent = JSON.parse(event.data);
                    const callbacks = callbacksRef.current;

                    switch (message.type) {
                        case "bid_placed":
                            callbacks.onBidPlaced?.(message);
                            break;
                        case "round_started":
                            callbacks.onRoundStarted?.(message);
                            break;
                        case "round_closed":
                            callbacks.onRoundClosed?.(message);
                            break;
                        case "round_settled":
                            callbacks.onRoundSettled?.(message);
                            break;
                        case "auction_finished":
                            callbacks.onAuctionFinished?.(message);
                            break;
                        case "error":
                            setError(message.error || message.message || "Unknown error");
                            callbacks.onError?.(message);
                            break;
                    }
                } catch (err) {
                    console.error("Error parsing WebSocket message:", err);
                }
            };

            ws.onerror = (event) => {
                console.error("WebSocket error:", event);
                setError("WebSocket connection error");
            };

            ws.onclose = () => {
                isConnectingRef.current = false;
                setIsConnected(false);

                // Only attempt to reconnect if still enabled and auctionId matches
                const shouldReconnect = 
                    enabledRef.current && 
                    auctionIdRef.current && 
                    currentAuctionIdRef.current === auctionIdRef.current &&
                    reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS;

                if (shouldReconnect) {
                    reconnectAttemptsRef.current += 1;
                    reconnectTimeoutRef.current = setTimeout(() => {
                        // Check again before reconnecting
                        if (enabledRef.current && auctionIdRef.current === currentAuctionIdRef.current) {
                            connect();
                        }
                    }, RECONNECT_DELAY);
                } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
                    setError("Failed to reconnect to WebSocket");
                }
            };

            wsRef.current = ws;
        } catch (err) {
            isConnectingRef.current = false;
            setError(err instanceof Error ? err.message : "Failed to create WebSocket connection");
            currentAuctionIdRef.current = null;
        }
    }, []); // No dependencies - use refs instead

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        reconnectAttemptsRef.current = 0; // Reset reconnect attempts
        isConnectingRef.current = false;

        if (wsRef.current) {
            const ws = wsRef.current;
            wsRef.current = null; // Clear ref first to prevent reconnection

            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                // Unsubscribe before closing if connected
                if (ws.readyState === WebSocket.OPEN) {
                    try {
                        ws.send(
                            JSON.stringify({
                                type: "unsubscribe",
                                data: { auctionId: currentAuctionIdRef.current },
                            })
                        );
                    } catch {
                        // Ignore errors when closing
                    }
                }
                ws.close();
            }
        }
        currentAuctionIdRef.current = null;
        setIsConnected(false);
    }, []); // No dependencies needed

    const sendBid = useCallback(
        (amount: number) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                setError("WebSocket is not connected");
                return false;
            }

            if (!auctionId) {
                setError("Auction ID is required");
                return false;
            }

            try {
                wsRef.current.send(
                    JSON.stringify({
                        type: "bid",
                        data: {
                            auctionId,
                            amount,
                        },
                    })
                );
                return true;
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to send bid");
                return false;
            }
        },
        [auctionId]
    );

    useEffect(() => {
        // Only connect/disconnect when enabled or auctionId actually changes
        if (enabled && auctionId) {
            // Only connect if not already connected to this auction
            const ws = wsRef.current;
            const isAlreadyConnected = 
                ws?.readyState === WebSocket.OPEN && 
                currentAuctionIdRef.current === auctionId;
            
            if (!isAlreadyConnected && !isConnectingRef.current) {
                connect();
            }
        } else {
            // Only disconnect if we have an active connection
            if (wsRef.current) {
                disconnect();
            }
        }

        return () => {
            // Only disconnect on unmount if component is actually unmounting
            // Don't disconnect if just changing auctionId
            if (!enabled || !auctionId) {
                disconnect();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, auctionId]); // connect and disconnect are stable

    return {
        isConnected,
        error,
        sendBid,
        connect,
        disconnect,
    };
}
