import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { getAuctionById, type Auction } from "../lib/api/auction";
import { getUser } from "../lib/authStorage";
import {
    Dialog,
    DialogContent,
    DialogClose,
} from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, Clock, Send, X } from "lucide-react";
import { Slider } from "./ui/slider";

interface PlaceBidDialogProps {
    auctionId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface Winner {
    name: string;
    bid: number;
    avatar?: string;
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
    CURRENT_BID: 7200,
    MIN_BID: 4260,
    REMAINING_TIME: 3,
    REMAINING_ITEMS: 9900,
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

const formatCountdown = (seconds: number): string => {
    if (seconds <= 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
    const [currentBid, setCurrentBid] = useState(DEFAULT_VALUES.CURRENT_BID);
    const [minBid, setMinBid] = useState(DEFAULT_VALUES.MIN_BID);
    const [remainingTime, setRemainingTime] = useState(DEFAULT_VALUES.REMAINING_TIME);
    const [remainingItems, setRemainingItems] = useState(DEFAULT_VALUES.REMAINING_ITEMS);
    const [sliderValue, setSliderValue] = useState(DEFAULT_VALUES.SLIDER_VALUE);
    const [topWinners, setTopWinners] = useState<Winner[]>([
        { name: "Alicia Brown", bid: 9925 },
        { name: "Robert Stock", bid: 9000 },
    ]);
    const [isEditingBid, setIsEditingBid] = useState(false);
    const [editBidValue, setEditBidValue] = useState("");

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const fetchingRef = useRef(false);
    const auctionRef = useRef<Auction | null>(null);
    const bidInputRef = useRef<HTMLInputElement>(null);

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
            fetchAuction().finally(() => {
                fetchingRef.current = false;
            });
        }
    }, [open, auctionId]);

    useEffect(() => {
        if (auction) {
            auctionRef.current = auction;
        }
    }, [auction]);

    useEffect(() => {
        if (!open) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        intervalRef.current = setInterval(() => {
            const currentAuction = auctionRef.current;
            if (currentAuction) {
                const remaining = calculateRemainingTime(currentAuction);
                setRemainingTime(remaining);
            }
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [open]);

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
                const remaining = calculateRemainingTime(response.responseObject);
                setRemainingTime(remaining);
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

    const handlePlaceBid = useCallback(() => {
    }, []);

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

    const renderInfoCard = (icon: React.ReactNode, value: string | number, label: string) => (
        <Card className="py-0">
            <CardContent className="p-4 text-center">
                <div className="text-base font-bold text-primary flex items-center justify-center gap-1">
                    {icon}
                    {typeof value === "string" ? value : value.toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">{label}</div>
            </CardContent>
        </Card>
    );

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

                            <div className="grid grid-cols-3 gap-3">
                                {renderInfoCard(
                                    <span>⭐</span>,
                                    minBid,
                                    "min.bid"
                                )}
                                {renderInfoCard(
                                    <Clock className="h-3 w-3" />,
                                    formatCountdown(remainingTime),
                                    "next round"
                                )}
                                {renderInfoCard(
                                    <Send className="h-3 w-3" />,
                                    remainingItems,
                                    "left"
                                )}
                            </div>

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

                            <Card className="py-0">
                                <CardContent className="p-4">
                                    <div className="text-xs text-muted-foreground mb-3">TOP 3 WINNERS</div>
                                    <div className="space-y-3">
                                        {topWinners.map((winner, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <div
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                        index === 0
                                                            ? "bg-yellow-500 text-yellow-900"
                                                            : "bg-muted text-muted-foreground"
                                                    }`}
                                                >
                                                    {index + 1}
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    {winner.name[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-semibold truncate">{winner.name}</div>
                                                </div>
                                                <div className="text-xs font-bold text-primary">
                                                    ⭐ {winner.bid.toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="sticky bottom-0 left-0 right-0 pt-4 pb-4">
                                <Button
                                    onClick={handlePlaceBid}
                                    className="w-full h-12 text-lg font-semibold text-white transition-all duration-200"
                                    size="lg"
                                    style={{
                                        backgroundColor: sliderColor,
                                        boxShadow: `0 10px 15px -3px ${getSliderColorWithOpacity(sliderValue, 0.3)}, 0 4px 6px -2px ${getSliderColorWithOpacity(sliderValue, 0.2)}`,
                                    }}
                                    onMouseEnter={handleButtonMouseEnter}
                                    onMouseLeave={handleButtonMouseLeave}
                                >
                                    Разместить ставку ⭐ {currentBid.toLocaleString()}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
