import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { getAuctionById, type Auction } from "../lib/api/auction";
import { getWallet } from "../lib/api/wallet";
import { getCollectionById } from "../lib/api/collection";
import { getCurrentRound, type Round } from "../lib/api/round";
import { getRoundBids } from "../lib/api/bid";
import { getUser } from "../lib/authStorage";
import { useAuctionWebSocket, type BidPlacedEvent, type RoundStartedEvent, type RoundSettledEvent, type ErrorEvent } from "../hooks/useAuctionWebSocket";
import type { BidDisplay } from "./AuctionBidsList";
import {
    Dialog,
    DialogContent,
    DialogClose,
} from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, X, CheckCircle } from "lucide-react";
import { Slider } from "./ui/slider";
import { AuctionBidsList } from "./AuctionBidsList";
import { AuctionStatusCard } from "./AuctionStatusCard";

interface PlaceBidDialogProps {
    auctionId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}


const SLIDER_CONSTANTS = {
    MIN_PERCENT: 0,
    MAX_PERCENT: 100,
    MID_POINT: 50,
    STEP: 0.5,
} as const;

const BID_RANGES = {
    MIN: 10000,
    MAX: 100000,
} as const;

const COLOR_RANGES = {
    GREEN: { r: 34, g: 197, b: 94 },
    RED: { r: 239, g: 68, b: 68 },
    HOVER_DARKEN: 20,
} as const;

const THUMB_SIZE = {
    MIN: 20,
    MAX: 28,
} as const;

const DEFAULT_VALUES = {
    CURRENT_BID: 100,
    MIN_BID: 100,
    REMAINING_TIME: 0,
    REMAINING_ITEMS: 0,
    SLIDER_VALUE: 50,
} as const;

const calculateRemainingTime = (auction: Auction): number => {
    if (auction.status !== "active" || !auction.current_round_started_at) {
        return 0;
    }
    const roundStartTime = new Date(auction.current_round_started_at).getTime();
    const endTime = roundStartTime + auction.round_duration * 1000;
    return Math.max(0, Math.floor((endTime - Date.now()) / 1000));
};


const cubicEaseInOut = (t: number): number => {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const inverseCubicEase = (t: number): number => {
    return t < 0.5
        ? Math.cbrt(t / 4)
        : 1 - Math.cbrt((1 - t) / 4);
};

export function PlaceBidDialog({ auctionId, open, onOpenChange }: PlaceBidDialogProps) {
    const user = getUser();
    
    const [auction, setAuction] = useState<Auction | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentBid, setCurrentBid] = useState<number>(DEFAULT_VALUES.CURRENT_BID);
    const [minBid, setMinBid] = useState<number>(DEFAULT_VALUES.MIN_BID);
    const [sliderValue, setSliderValue] = useState<number>(DEFAULT_VALUES.SLIDER_VALUE);
    const [bids, setBids] = useState<BidDisplay[]>([]);
    const [isEditingBid, setIsEditingBid] = useState(false);
    const [editBidValue, setEditBidValue] = useState("");
    const [availableBalance, setAvailableBalance] = useState(0);
    const [isSettling, setIsSettling] = useState(false);
    const [roundEndTs, setRoundEndTs] = useState<number | null>(null);
    const [placingBid, setPlacingBid] = useState(false);
    const [currentRound, setCurrentRound] = useState<Round | null>(null);
    const [collection, setCollection] = useState<any>(null);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const fetchingRef = useRef(false);
    const auctionRef = useRef<Auction | null>(null);
    const bidInputRef = useRef<HTMLInputElement>(null);

    // Define fetchAvailableBalance first, before it's used in other callbacks
    const fetchAvailableBalance = useCallback(async () => {
        if (!user?._id) return;
        try {
            const response = await getWallet(user._id);
            if (response.success && response.responseObject) {
                // Use available_balance if provided, otherwise fallback to balance
                const available = response.responseObject.available_balance ?? response.responseObject.balance;
                setAvailableBalance(available);
            }
        } catch (err) {
            console.error("Error fetching balance:", err);
        }
    }, [user?._id]);

    // Memoize WebSocket callbacks to prevent reconnections
    const handleBidPlaced = useCallback((event: BidPlacedEvent) => {
        const newBid: BidDisplay = {
            userId: event.data.userId,
            amount: event.data.amount,
            timestamp: event.data.timestamp,
            username: event.data.userId === user?._id ? `${user.first_name} ${user.last_name || ""}`.trim() : undefined,
        };
        setBids((prev) => {
            // Check if bid already exists (same timestamp)
            const exists = prev.some(
                (b) => b.userId === event.data.userId && b.timestamp === event.data.timestamp
            );
            if (exists) return prev;
            
            // If user already has a bid, replace it with the new one (latest bid wins)
            // Otherwise, add the new bid
            const userBidIndex = prev.findIndex((b) => b.userId === event.data.userId);
            if (userBidIndex >= 0) {
                // Replace existing bid with new one
                const updated = [...prev];
                updated[userBidIndex] = newBid;
                return updated;
            }
            
            return [...prev, newBid];
        });
        if (event.data.userId === user?._id) {
            // User can place multiple bids, so we don't set hasUserBid to true
            // Instead, we just update the balance
            setPlacingBid(false);
            // Fetch updated balance from server to get accurate frozen balance
            // Small delay to ensure backend has processed the freeze
            setTimeout(() => {
                fetchAvailableBalance();
            }, 500);
        }
    }, [user, fetchAvailableBalance]);

    const handleRoundStarted = useCallback((event: RoundStartedEvent) => {
        setRoundEndTs(event.data.roundEndTs);
        setIsSettling(false);
        setBids([]); // Clear bids for new round
        setAuction((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                current_round_number: event.data.roundNumber,
                current_round_started_at: new Date(event.data.roundEndTs - (prev.round_duration * 1000)).toISOString(),
            };
        });
        // Fetch current round to get gift_ids
        if (auctionId) {
            getCurrentRound(auctionId).then((response) => {
                if (response.success && response.responseObject) {
                    setCurrentRound(response.responseObject);
                }
            }).catch((error) => {
                console.error("Error loading current round:", error);
            });
            
            // Fetch bids for new round
            getRoundBids(auctionId, event.data.roundNumber).then((response) => {
                if (response.success && response.responseObject) {
                    const bidsData: BidDisplay[] = response.responseObject.map((bid) => ({
                        userId: bid.userId,
                        amount: bid.amount,
                        timestamp: bid.timestamp,
                    }));
                    setBids(bidsData);
                }
            }).catch((error) => {
                console.error("Error loading bids:", error);
            });
        }
    }, [auctionId]);

    const handleRoundClosed = useCallback(() => {
        setIsSettling(true);
    }, []);

    const handleRoundSettled = useCallback((event: RoundSettledEvent) => {
        setIsSettling(false);
        // Mark winners
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
        setAuction((prev) => {
            if (!prev) return prev;
            return { ...prev, status: "finished" };
        });
    }, []);

    const handleError = useCallback((event: ErrorEvent) => {
        const errorMessage = event.error || event.message || "WebSocket error";
        setError(errorMessage);
        setPlacingBid(false);
        
        // If error is about already placed bid, update hasUserBid state by refetching bids
        if (errorMessage.toLowerCase().includes("already placed a bid") || 
            errorMessage.toLowerCase().includes("уже сделал ставку")) {
            if (auctionId && currentRound) {
                getRoundBids(auctionId, currentRound.round_number).then((response) => {
                    if (response.success && response.responseObject) {
                        const bidsData: BidDisplay[] = response.responseObject.map((bid) => ({
                            userId: bid.userId,
                            amount: bid.amount,
                            timestamp: bid.timestamp,
                        }));
                        setBids(bidsData);
                    }
                }).catch((error) => {
                    console.error("Error loading bids after error:", error);
                });
            }
        }
    }, [auctionId, currentRound]);

    // WebSocket connection
    const { isConnected, sendBid, error: wsError } = useAuctionWebSocket({
        auctionId: auctionId || null,
        enabled: open && !!auctionId,
        onBidPlaced: handleBidPlaced,
        onRoundStarted: handleRoundStarted,
        onRoundClosed: handleRoundClosed,
        onRoundSettled: handleRoundSettled,
        onAuctionFinished: handleAuctionFinished,
        onError: handleError,
    });

    const getSliderColor = useCallback((percent: number): string => {
        const { GREEN, RED } = COLOR_RANGES;
        const r = Math.round(GREEN.r + (RED.r - GREEN.r) * (percent / 100));
        const g = Math.round(GREEN.g - (GREEN.g - RED.g) * (percent / 100));
        const b = Math.round(GREEN.b - (GREEN.b - RED.b) * (percent / 100));
        return `rgb(${r}, ${g}, ${b})`;
    }, []);

    const getSliderColorWithOpacity = useCallback((percent: number, opacity: number = 0.2): string => {
        const color = getSliderColor(percent);
        const rgb = color.match(/\d+/g);
        if (rgb) {
            return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
        }
        return color;
    }, [getSliderColor]);

    const getSliderHoverColor = useCallback((percent: number): string => {
        const color = getSliderColor(percent);
        const rgb = color.match(/\d+/g);
        if (rgb) {
            const { HOVER_DARKEN } = COLOR_RANGES;
            return `rgb(${Math.max(0, parseInt(rgb[0]) - HOVER_DARKEN)}, ${Math.max(0, parseInt(rgb[1]) - HOVER_DARKEN)}, ${Math.max(0, parseInt(rgb[2]) - HOVER_DARKEN)})`;
        }
        return color;
    }, [getSliderColor]);

    const getThumbSize = useCallback((percent: number): number => {
        return THUMB_SIZE.MIN + (percent / 100) * (THUMB_SIZE.MAX - THUMB_SIZE.MIN);
    }, []);

    const sliderToBid = useCallback((sliderPercent: number): number => {
        const { MID_POINT } = SLIDER_CONSTANTS;
        const { MIN, MAX } = BID_RANGES;

        if (sliderPercent <= MID_POINT) {
            const normalized = sliderPercent / MID_POINT;
            const eased = cubicEaseInOut(normalized);
            const range = MIN - minBid;
            return Math.round(minBid + range * eased);
        } else {
            const normalized = (sliderPercent - MID_POINT) / MID_POINT;
            const eased = cubicEaseInOut(normalized);
            const range = MAX - MIN;
            return Math.round(MIN + range * eased);
        }
    }, [minBid]);

    const bidToSlider = useCallback((bid: number): number => {
        const { MID_POINT } = SLIDER_CONSTANTS;
        const { MIN, MAX } = BID_RANGES;

        if (bid <= MIN) {
            const range = MIN - minBid;
            if (range === 0) return 0;
            const progress = (bid - minBid) / range;
            const eased = inverseCubicEase(progress);
            return Math.max(0, Math.min(MID_POINT, eased * MID_POINT));
        } else {
            const range = MAX - MIN;
            const progress = (bid - MIN) / range;
            const eased = inverseCubicEase(progress);
            return Math.max(MID_POINT, Math.min(100, MID_POINT + eased * MID_POINT));
        }
    }, [minBid]);

    const sliderColor = useMemo(() => getSliderColor(sliderValue), [sliderValue, getSliderColor]);
    const sliderColorWithOpacity = useMemo(() => getSliderColorWithOpacity(sliderValue, 0.2), [sliderValue, getSliderColorWithOpacity]);
    const thumbSize = useMemo(() => getThumbSize(sliderValue), [sliderValue, getThumbSize]);

    useEffect(() => {
        if (open && auctionId && !fetchingRef.current) {
            fetchingRef.current = true;
            fetchAuction();
            fetchAvailableBalance();
        } else if (!open) {
            fetchingRef.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, auctionId, fetchAvailableBalance]); // fetchAuction is stable, no need in deps

    // Fetch current round, collection, and bids when auction is loaded
    useEffect(() => {
        if (auction && auction.status === "active" && auctionId) {
            // Fetch current round
            getCurrentRound(auctionId).then((response) => {
                if (response.success && response.responseObject) {
                    setCurrentRound(response.responseObject);
                }
            }).catch((error) => {
                console.error("Error loading current round:", error);
            });

            // Fetch collection
            getCollectionById(auction.collection_id).then((response) => {
                if (response.success && response.responseObject) {
                    setCollection(response.responseObject);
                }
            }).catch((error) => {
                console.error("Error loading collection:", error);
            });

            // Fetch bids for current round
            const roundNumber = auction.current_round_number;
            if (roundNumber) {
                getRoundBids(auctionId, roundNumber).then((response) => {
                    if (response.success && response.responseObject) {
                        const bidsData: BidDisplay[] = response.responseObject.map((bid) => ({
                            userId: bid.userId,
                            amount: bid.amount,
                            timestamp: bid.timestamp,
                        }));
                        setBids(bidsData);
                    }
                }).catch((error) => {
                    console.error("Error loading bids:", error);
                });
            }
        }
    }, [auction, auctionId]);

    useEffect(() => {
        if (auction) {
            auctionRef.current = auction;
            // Calculate round end time
            if (auction.current_round_started_at) {
                const startTime = new Date(auction.current_round_started_at).getTime();
                const endTime = startTime + auction.round_duration * 1000;
                setRoundEndTs(endTime);
            }
            // Set min bid (can be based on auction rules)
            setMinBid(100); // Default minimum
        }
    }, [auction]);

    useEffect(() => {
        if (!open) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            // Reset state when dialog closes
            setBids([]);
            setIsSettling(false);
            return;
        }

        intervalRef.current = setInterval(() => {
            // Timer is handled by AuctionStatusCard component
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [open, roundEndTs]);

    useEffect(() => {
        if (currentBid >= minBid && minBid > 0) {
            const calculatedSlider = bidToSlider(currentBid);
            setSliderValue(calculatedSlider);
        }
    }, [minBid, currentBid, bidToSlider]);

    useEffect(() => {
        if (isEditingBid && bidInputRef.current) {
            bidInputRef.current.focus();
            bidInputRef.current.select();
        }
    }, [isEditingBid]);

    const fetchAuction = useCallback(async () => {
        if (!auctionId) return;

        try {
            setLoading(true);
            setError(null);
            const response = await getAuctionById(auctionId);
            
            if (response.success && response.responseObject) {
                setAuction(response.responseObject);
            } else {
                setError(response.message || "Не удалось загрузить аукцион");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Произошла ошибка");
        } finally {
            setLoading(false);
        }
    }, [auctionId]);

    const handleBidChange = useCallback((value: number[]) => {
        const sliderPercent = value[0];
        setSliderValue(sliderPercent);
        const newBid = sliderToBid(sliderPercent);
        if (newBid >= minBid) {
            setCurrentBid(newBid);
        }
    }, [minBid, sliderToBid]);

    const handleBidClick = useCallback(() => {
        setIsEditingBid(true);
        setEditBidValue(currentBid.toString());
    }, [currentBid]);

    const handleBidInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        setEditBidValue(value);
    }, []);

    const handleBidInputSubmit = useCallback(() => {
        const numValue = parseInt(editBidValue);
        const { MAX } = BID_RANGES;
        if (!isNaN(numValue) && numValue >= minBid && numValue <= MAX) {
            setCurrentBid(numValue);
            const newSliderValue = bidToSlider(numValue);
            setSliderValue(newSliderValue);
        }
        setIsEditingBid(false);
        setEditBidValue("");
    }, [editBidValue, minBid, bidToSlider]);

    const handleBidInputBlur = useCallback(() => {
        handleBidInputSubmit();
    }, [handleBidInputSubmit]);

    const handleBidInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleBidInputSubmit();
        } else if (e.key === "Escape") {
            setIsEditingBid(false);
            setEditBidValue("");
        }
    }, [handleBidInputSubmit]);

    // Check if user has already placed a bid in this auction
    const hasUserBid = useMemo(() => {
        if (!user?._id || bids.length === 0) {
            return false;
        }
        return bids.some((bid) => bid.userId === user._id);
    }, [bids, user?._id]);

    // Check if user is in top (winners list)
    const isUserInTop = useMemo(() => {
        if (!user?._id || !auction || bids.length === 0) {
            return false;
        }

        const giftsPerRound = auction.gifts_per_round || 0;
        if (giftsPerRound === 0) {
            return false;
        }

        // Keep only the latest bid per user
        const userBidsMap = new Map<number, BidDisplay>();
        for (const bid of bids) {
            const existingBid = userBidsMap.get(bid.userId);
            if (!existingBid || bid.timestamp > existingBid.timestamp) {
                userBidsMap.set(bid.userId, bid);
            }
        }

        // Sort: top by amount (DESC), then by timestamp (ASC - earlier = better)
        const uniqueBids = Array.from(userBidsMap.values());
        const sortedBids = uniqueBids.sort((a, b) => {
            if (b.amount !== a.amount) {
                return b.amount - a.amount;
            }
            return a.timestamp - b.timestamp;
        });

        // Check if current user is in top N
        const topBids = sortedBids.slice(0, giftsPerRound);
        return topBids.some((bid) => bid.userId === user._id);
    }, [bids, user?._id, auction]);

    const handlePlaceBid = useCallback(() => {
        if (!auctionId || !user?._id) {
            setError("Необходима авторизация");
            return;
        }

        if (hasUserBid) {
            setError("Вы уже сделали ставку в этом аукционе. Одна ставка на пользователя на весь аукцион.");
            return;
        }

        if (isUserInTop) {
            setError("Вы уже находитесь в топе. Невозможно разместить новую ставку.");
            return;
        }

        if (currentBid < minBid) {
            setError(`Минимальная ставка: ${minBid}`);
            return;
        }

        if (currentBid > availableBalance) {
            setError("Недостаточно средств");
            return;
        }

        if (isSettling) {
            setError("Раунд закрывается, новые ставки не принимаются");
            return;
        }

        if (!isConnected) {
            setError("Нет подключения к серверу");
            return;
        }

        setPlacingBid(true);
        setError(null);

        const success = sendBid(currentBid);
        if (!success) {
            setPlacingBid(false);
            setError("Не удалось отправить ставку");
        }
    }, [auctionId, user, currentBid, minBid, availableBalance, isSettling, isConnected, hasUserBid, isUserInTop, sendBid]);

    const handleButtonMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.backgroundColor = getSliderHoverColor(sliderValue);
    }, [sliderValue, getSliderHoverColor]);

    const handleButtonMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.backgroundColor = sliderColor;
    }, [sliderColor]);

    const renderBidDisplay = () => {
        const commonStyles = {
            backgroundColor: sliderColorWithOpacity,
            color: sliderColor,
            borderColor: sliderColor,
        };

        if (isEditingBid) {
            return (
                <div className="px-6 py-3 rounded-full border-2 transition-colors duration-200" style={commonStyles}>
                    <input
                        ref={bidInputRef}
                        type="text"
                        value={editBidValue}
                        onChange={handleBidInputChange}
                        onBlur={handleBidInputBlur}
                        onKeyDown={handleBidInputKeyDown}
                        className="text-2xl font-bold bg-transparent border-none outline-none w-32 text-center"
                        style={{ color: sliderColor }}
                    />
                </div>
            );
        }

        return (
            <div
                className="px-6 py-3 rounded-full border-2 transition-colors duration-200 cursor-pointer hover:opacity-80"
                onClick={handleBidClick}
                style={commonStyles}
            >
                <span className="text-2xl font-bold">⭐ {currentBid.toLocaleString()}</span>
            </div>
        );
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-full sm:max-w-full p-0 gap-0 h-[75vh] overflow-y-auto relative">
                <div className="sticky top-0 z-10 bg-background border-b border-border/50 pt-3 pb-2 px-4 flex justify-end">
                    <DialogClose asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded hover:bg-muted"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </DialogClose>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 px-4">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : error || !auction ? (
                        <div className="p-4">
                            <Alert variant="destructive">
                                <AlertDescription>{error || "Аукцион не найден"}</AlertDescription>
                            </Alert>
                        </div>
                    ) : auction.status !== "active" ? (
                        <div className="p-4">
                            <Alert>
                                <AlertDescription>Этот аукцион завершен</AlertDescription>
                            </Alert>
                        </div>
                    ) : (
                        <div className="space-y-6 p-4 pb-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-center">
                                    {renderBidDisplay()}
                                </div>

                                <div className="space-y-3">
                                    <div className="px-2">
                                        <Slider
                                            value={[sliderValue]}
                                            onValueChange={handleBidChange}
                                            min={SLIDER_CONSTANTS.MIN_PERCENT}
                                            max={SLIDER_CONSTANTS.MAX_PERCENT}
                                            step={SLIDER_CONSTANTS.STEP}
                                            className="w-full"
                                            trackColor={sliderColor}
                                            thumbSize={thumbSize}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>Мин: ⭐ {minBid.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <AuctionStatusCard
                                auction={auction}
                                currentRoundEndTs={roundEndTs || undefined}
                                currentRoundNumber={auction?.current_round_number}
                                currentRoundGiftsCount={currentRound?.gift_ids?.length}
                                totalGifts={collection?.total_amount}
                                totalBids={bids.length}
                                isSettling={isSettling}
                            />

                            {wsError && (
                                <Alert variant="destructive">
                                    <AlertDescription>{wsError}</AlertDescription>
                                </Alert>
                            )}

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}


                            <Card className="py-0">
                                <CardContent className="p-4">
                                    <div className="text-xs text-muted-foreground mb-3">YOUR BID WILL BE</div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                                                {user?.first_name?.[0] || "U"}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold">
                                                    {user?.first_name} {user?.last_name || ""}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    @{user?.username || "user"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-base font-bold text-primary">
                                            ⭐ {currentBid.toLocaleString()}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <AuctionBidsList
                                bids={bids}
                                giftsPerRound={auction.gifts_per_round}
                                currentUserId={user?._id}
                            />

                            <div className="sticky bottom-0 left-0 right-0 pt-4 pb-4 bg-background">
                                <div className="mb-2 text-xs text-muted-foreground text-center">
                                    Доступно: ⭐ {availableBalance.toLocaleString()}
                                </div>
                                <Button
                                    onClick={handlePlaceBid}
                                    disabled={isSettling || placingBid || !isConnected || currentBid > availableBalance || hasUserBid || isUserInTop}
                                    className="w-full h-12 text-lg font-semibold text-white transition-all duration-200 disabled:opacity-50"
                                    size="lg"
                                    style={{
                                        backgroundColor: sliderColor,
                                        boxShadow: `0 10px 15px -3px ${getSliderColorWithOpacity(sliderValue, 0.3)}, 0 4px 6px -2px ${getSliderColorWithOpacity(sliderValue, 0.2)}`,
                                    }}
                                    onMouseEnter={handleButtonMouseEnter}
                                    onMouseLeave={handleButtonMouseLeave}
                                >
                                    {placingBid ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Отправка...
                                        </>
                                    ) : isSettling ? (
                                        "Раунд закрывается"
                                    ) : !isConnected ? (
                                        "Подключение..."
                                    ) : hasUserBid ? (
                                        "Вы уже сделали ставку"
                                    ) : isUserInTop ? (
                                        "Вы уже в топе"
                                    ) : (
                                        `Разместить ставку ⭐ ${currentBid.toLocaleString()}`
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
