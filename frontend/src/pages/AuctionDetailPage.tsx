import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuctionById } from "../lib/api/auction";
import { getCollectionById } from "../lib/api/collection";
import { getRoundBids } from "../lib/api/bid";
import { getCurrentRound, type Round } from "../lib/api/round";
import { useAuctionWebSocket, type BidPlacedEvent, type RoundStartedEvent, type RoundClosedEvent, type RoundSettledEvent } from "../hooks/useAuctionWebSocket";
import { getUser } from "../lib/authStorage";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { AuctionStatusCard } from "../components/AuctionStatusCard";
import { AuctionBidsList, type BidDisplay } from "../components/AuctionBidsList";
import { PlaceBidDialog } from "../components/PlaceBidDialog";
import { Loader2, ArrowLeft, Gavel } from "lucide-react";
import { useApi } from "../hooks/useApi";

export function AuctionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = getUser();
    const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
    const [bids, setBids] = useState<BidDisplay[]>([]);
    const [roundEndTs, setRoundEndTs] = useState<number | null>(null);
    const [isSettling, setIsSettling] = useState(false);
    // Track current round number from WebSocket (more reliable than auction data)
    const [currentRoundNumber, setCurrentRoundNumber] = useState<number | null>(null);
    const [currentRound, setCurrentRound] = useState<Round | null>(null);

    // Memoize API functions to prevent recreation on every render
    const fetchAuctionFn = useMemo(
        () => () => {
            if (!id) return null;
            return getAuctionById(id);
        },
        [id]
    );

    const {
        data: auction,
        loading: auctionLoading,
        error: auctionError,
        execute: fetchAuction,
    } = useApi(fetchAuctionFn, {
        autoExecute: true,
        enabled: !!id,
    });

    const collectionId = auction?.responseObject?.collection_id;
    const fetchCollectionFn = useMemo(
        () => () => {
            if (!collectionId) return null;
            return getCollectionById(collectionId);
        },
        [collectionId]
    );

    const {
        data: collection,
    } = useApi(fetchCollectionFn, {
        autoExecute: true,
        enabled: !!collectionId,
    });

    // Memoize fetchAuction callback to prevent infinite loops
    const handleFetchAuction = useCallback(() => {
        if (id && !auctionLoading) {
            fetchAuction();
        }
    }, [id, fetchAuction, auctionLoading]);

    // Memoize WebSocket callbacks to prevent reconnections
    const handleBidPlaced = useCallback((event: BidPlacedEvent) => {
        const newBid: BidDisplay = {
            userId: event.data.userId,
            amount: event.data.amount,
            timestamp: event.data.timestamp,
            username: event.data.userId === user?._id 
                ? `${user.first_name} ${user.last_name || ""}`.trim() 
                : undefined,
        };
        setBids((prev) => {
            const exists = prev.some(
                (b) => b.userId === event.data.userId && b.timestamp === event.data.timestamp
            );
            if (exists) {
                return prev;
            }
            return [...prev, newBid];
        });
    }, [user]);

    const handleRoundStarted = useCallback((event: RoundStartedEvent) => {
        console.log("AuctionDetailPage: round_started event", event);
        // Use roundEndTs and roundNumber from WebSocket event (calculated on backend)
        setRoundEndTs(event.data.roundEndTs);
        setCurrentRoundNumber(event.data.roundNumber);
        setIsSettling(false);
        setBids([]);
        // Reset loaded round ref to allow loading bids for new round
        loadedRoundRef.current = null;
        // Fetch updated auction data and current round
        // Add small delay to ensure MongoDB is updated
        setTimeout(() => {
            handleFetchAuction();
            // Fetch current round to get gift_ids
            if (id) {
                getCurrentRound(id).then((response) => {
                    if (response.success && response.responseObject) {
                        setCurrentRound(response.responseObject);
                    }
                }).catch((error) => {
                    console.error("Error loading current round:", error);
                });
            }
        }, 100);
    }, [handleFetchAuction, id]);

    const handleRoundClosed = useCallback(() => {
        setIsSettling(true);
    }, []);

    const handleRoundSettled = useCallback((event: RoundSettledEvent) => {
        setIsSettling(false);
        setBids((prev) =>
            prev.map((bid) => ({
                ...bid,
                isWinner: event.data.winners.some(
                    (w) => w.userId === bid.userId && w.amount === bid.amount
                ),
            }))
        );
    }, []);

    const handleAuctionFinished = useCallback(() => {
        handleFetchAuction();
    }, [handleFetchAuction]);

    // WebSocket for real-time updates
    const wsEnabled = !!id && !!auction?.responseObject && auction.responseObject.status === "active";
    const { isConnected: wsConnected, error: wsError } = useAuctionWebSocket({
        auctionId: id || null,
        enabled: wsEnabled,
        onBidPlaced: handleBidPlaced,
        onRoundStarted: handleRoundStarted,
        onRoundClosed: handleRoundClosed,
        onRoundSettled: handleRoundSettled,
        onAuctionFinished: handleAuctionFinished,
    });

    // Debug WebSocket connection (only log on changes)
    useEffect(() => {
        if (wsEnabled && wsConnected) {
            // Only log successful connection, not every state change
        }
    }, [wsEnabled, wsConnected]);

    // Initialize round number and end time from auction data
    // This runs when auction data is loaded or changes
    useEffect(() => {
        if (auction?.responseObject && auction.responseObject.status === "active") {
            const auctionRoundNumber = auction.responseObject.current_round_number;
            const auctionRoundStartedAt = auction.responseObject.current_round_started_at;
            const auctionRoundDuration = auction.responseObject.round_duration;
            
            console.log("AuctionDetailPage: Initializing from auction data", {
                roundNumber: auctionRoundNumber,
                roundStartedAt: auctionRoundStartedAt,
                roundDuration: auctionRoundDuration,
            });
            
            // Update round number from auction data
            if (auctionRoundNumber !== undefined && auctionRoundNumber !== null) {
                setCurrentRoundNumber((prev) => {
                    // Always update from auction data (it's the source of truth)
                    if (prev !== auctionRoundNumber) {
                        console.log(`AuctionDetailPage: Setting round number to ${auctionRoundNumber} (was ${prev})`);
                        return auctionRoundNumber;
                    }
                    return prev;
                });
            }
            
            // Calculate roundEndTs from auction data
            if (auctionRoundStartedAt && auctionRoundDuration) {
                const startTime = new Date(auctionRoundStartedAt).getTime();
                const calculatedEndTime = startTime + auctionRoundDuration * 1000;
                
                console.log("AuctionDetailPage: Calculating roundEndTs", {
                    startTime,
                    calculatedEndTime,
                    currentRoundEndTs: roundEndTs,
                });
                
                setRoundEndTs((prev) => {
                    // Always update from auction data if we don't have a value or if significantly different
                    if (!prev || Math.abs(prev - calculatedEndTime) > 1000) {
                        console.log(`AuctionDetailPage: Setting roundEndTs to ${calculatedEndTime} (was ${prev})`);
                        return calculatedEndTime;
                    }
                    return prev;
                });
            }

            // Fetch current round to get gift_ids
            if (id && auction.responseObject.status === "active") {
                getCurrentRound(id).then((response) => {
                    if (response.success && response.responseObject) {
                        setCurrentRound(response.responseObject);
                    }
                }).catch((error) => {
                    console.error("Error loading current round:", error);
                });
            }
        }
    }, [
        auction?.responseObject?.current_round_number,
        auction?.responseObject?.current_round_started_at,
        auction?.responseObject?.round_duration,
        auction?.responseObject?.status,
        id,
    ]);

    // Track loaded round to prevent re-fetching
    const loadedRoundRef = useRef<number | null>(null);
    const loadingBidsRef = useRef(false);

    // Load existing bids when auction and round are loaded (only once per round)
    // Note: New bids come via WebSocket, this is only for initial load
    useEffect(() => {
        const loadBids = async () => {
            if (!id || !auction?.responseObject || auction.responseObject.status !== "active") {
                return;
            }

            const roundNumber = auction.responseObject.current_round_number;
            if (!roundNumber) {
                return;
            }

            // Skip if already loaded for this round or currently loading
            if (loadedRoundRef.current === roundNumber || loadingBidsRef.current) {
                return;
            }

            loadingBidsRef.current = true;
            try {
                const response = await getRoundBids(id, roundNumber);
                if (response.success && response.responseObject) {
                    const currentUser = getUser(); // Get user inside function to avoid dependency
                    const bidDisplays: BidDisplay[] = response.responseObject.map((bid) => ({
                        userId: bid.userId,
                        amount: bid.amount,
                        timestamp: bid.timestamp,
                        username: bid.userId === currentUser?._id 
                            ? `${currentUser.first_name} ${currentUser.last_name || ""}`.trim() 
                            : undefined,
                    }));
                    setBids(bidDisplays);
                    loadedRoundRef.current = roundNumber;
                }
            } catch (error) {
                // Silently fail - bids will come via WebSocket anyway
                console.error("Error loading bids:", error);
            } finally {
                loadingBidsRef.current = false;
            }
        };

        // Only load if we have all required data
        if (id && auction?.responseObject?.current_round_number && auction.responseObject.status === "active") {
            loadBids();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, auction?.responseObject?.current_round_number]);

    if (auctionLoading) {
        return (
            <div className="min-h-screen pb-20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (auctionError || !auction?.responseObject) {
        return (
            <div className="min-h-screen pb-20">
                <div className="container mx-auto px-4 py-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/app/auction")}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Назад
                    </Button>
                    <Alert variant="destructive">
                        <AlertDescription>
                            {auctionError || "Аукцион не найден"}
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    const auctionData = auction.responseObject;

    return (
        <div className="min-h-screen pb-20">
            <div className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/app/auction")}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад к списку
                </Button>

                {collection?.responseObject && (
                    <Card className="mb-6">
                        <CardHeader>
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-primary/30">
                                    <span className="text-5xl">
                                        {collection.responseObject.emoji || "🎁"}
                                    </span>
                                </div>
                            </div>
                            <CardTitle className="text-center text-2xl">
                                {collection.responseObject.title}
                            </CardTitle>
                            {collection.responseObject.description && (
                                <p className="text-center text-muted-foreground mt-2">
                                    {collection.responseObject.description}
                                </p>
                            )}
                        </CardHeader>
                    </Card>
                )}

                {auctionData.status === "active" && (
                    <>
                        <AuctionStatusCard
                            auction={{
                                ...auctionData,
                                // Use round number from state if available, otherwise from auction data
                                current_round_number: currentRoundNumber !== null ? currentRoundNumber : auctionData.current_round_number,
                            }}
                            currentRoundEndTs={roundEndTs !== null ? roundEndTs : undefined}
                            currentRoundNumber={currentRoundNumber !== null ? currentRoundNumber : auctionData.current_round_number}
                            currentRoundGiftsCount={currentRound?.gift_ids?.length}
                            totalGifts={collection?.responseObject?.total_amount}
                            totalBids={bids.length}
                            isSettling={isSettling}
                        />

                        <div className="mt-6">
                            <AuctionBidsList
                                bids={bids}
                                giftsPerRound={auctionData.gifts_per_round}
                                currentUserId={user?._id}
                            />
                        </div>

                        <div className="mt-6">
                            <Button
                                onClick={() => setIsBidDialogOpen(true)}
                                className="w-full"
                                size="lg"
                                disabled={isSettling}
                            >
                                <Gavel className="w-5 h-5 mr-2" />
                                Разместить ставку
                            </Button>
                        </div>
                    </>
                )}

                {auctionData.status === "finished" && (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <Gavel className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Аукцион завершен</h3>
                            <p className="text-muted-foreground">
                                Все раунды завершены
                            </p>
                        </CardContent>
                    </Card>
                )}

                <PlaceBidDialog
                    auctionId={id || null}
                    open={isBidDialogOpen}
                    onOpenChange={setIsBidDialogOpen}
                />
            </div>
        </div>
    );
}
