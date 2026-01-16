import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getAuctionById, type Auction } from "../lib/api/auction";
import { getUser } from "../lib/authStorage";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, Clock, Send } from "lucide-react";
import { Slider } from "../components/ui/slider";

export function PlaceBidPage() {
    const { id } = useParams<{ id: string }>();
    const user = getUser();
    const [auction, setAuction] = useState<Auction | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentBid, setCurrentBid] = useState(7200);
    const [minBid] = useState(4260);
    const [remainingTime, setRemainingTime] = useState(3);
    const [remainingItems] = useState(9900);
    const [topWinners] = useState<
        Array<{ name: string; bid: number; avatar?: string }>
    >([
        { name: "Alicia Brown", bid: 9925 },
        { name: "Robert Stock", bid: 9000 },
    ]);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const fetchingRef = useRef(false);
    const auctionRef = useRef<Auction | null>(null);

    const fetchAuction = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            const response = await getAuctionById(id);
            if (response.success && response.responseObject) {
                setAuction(response.responseObject);
                // Calculate remaining time
                if (
                    response.responseObject.status === "active" &&
                    response.responseObject.current_round_started_at
                ) {
                    const roundStartTime = new Date(
                        response.responseObject.current_round_started_at
                    ).getTime();
                    const endTime = roundStartTime + response.responseObject.round_duration * 1000;
                    const remaining = Math.max(
                        0,
                        Math.floor((endTime - Date.now()) / 1000)
                    );
                    setRemainingTime(remaining);
                }
            } else {
                setError(response.message || "Не удалось загрузить аукцион");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Произошла ошибка");
        } finally {
            setLoading(false);
        }
    };

    const formatCountdown = (seconds: number): string => {
        if (seconds <= 0) {
            return "00:00";
        }
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleBidChange = (value: number[]) => {
        const newBid = value[0];
        if (newBid >= minBid) {
            setCurrentBid(newBid);
        }
    };

    const handlePlaceBid = () => {
        // TODO: Implement bid placement
        console.log("Placing bid:", currentBid);
    };

    if (loading) {
        return (
            <div className="min-h-screen pb-20 bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !auction) {
        return (
            <div className="min-h-screen pb-20 bg-background">
                <div className="container mx-auto px-4 py-8">
                    <Alert variant="destructive">
                        <AlertDescription>
                            {error || "Аукцион не найден"}
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    if (auction.status !== "active") {
        return (
            <div className="min-h-screen pb-20 bg-background">
                <div className="container mx-auto px-4 py-8">
                    <Alert>
                        <AlertDescription>
                            Этот аукцион завершен
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 bg-background">
            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* Current Bid Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-center">
                        <div className="bg-green-500/20 text-green-500 px-6 py-3 rounded-full border-2 border-green-500">
                            <span className="text-2xl font-bold">⭐ {currentBid.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Bid Slider */}
                    <div className="space-y-3">
                        <div className="px-2">
                            <Slider
                                value={[currentBid]}
                                onValueChange={handleBidChange}
                                min={minBid}
                                max={100000}
                                step={10}
                                className="w-full"
                            />
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Мин: ⭐ {minBid.toLocaleString()}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentBid((prev) => Math.min(prev + 100, 100000))}
                                className="h-6 w-6 p-0"
                            >
                                +
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-3 gap-3">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-lg font-bold text-primary">
                                ⭐ {minBid.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                минимальная ставка
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-lg font-bold text-primary flex items-center justify-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatCountdown(remainingTime)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                до следующего раунда
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-lg font-bold text-primary flex items-center justify-center gap-1">
                                <Send className="h-4 w-4" />
                                {remainingItems.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                осталось
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Your Bid Section */}
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground mb-3">
                            ВАША СТАВКА БУДЕТ
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 flex-1">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold">
                                    {user?.first_name?.[0] || "U"}
                                </div>
                                <div>
                                    <div className="font-semibold">
                                        {user?.first_name} {user?.last_name || ""}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        @{user?.username || "user"}
                                    </div>
                                </div>
                            </div>
                            <div className="text-lg font-bold text-primary">
                                ⭐ {currentBid.toLocaleString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Top 3 Winners */}
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground mb-3">
                            ТОП 3 ПОБЕДИТЕЛЯ
                        </div>
                        <div className="space-y-3">
                            {topWinners.map((winner, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3"
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                            index === 0
                                                ? "bg-yellow-500 text-yellow-900"
                                                : "bg-muted text-muted-foreground"
                                        }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                        {winner.name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold truncate">
                                            {winner.name}
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-primary">
                                        ⭐ {winner.bid.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Place Bid Button with Liquid Glass Effect */}
                <div className="fixed bottom-0 left-0 right-0 z-50">
                    {/* Liquid Glass Blur Effect */}
                    <div 
                        className="absolute inset-0 backdrop-blur-xl bg-background/80 border-t border-border/50"
                        style={{
                            backdropFilter: 'blur(20px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            backgroundColor: 'rgba(23, 33, 43, 0.7)',
                        }}
                    />
                    {/* Button Container */}
                    <div className="relative px-4 py-4">
                        <Button
                            onClick={handlePlaceBid}
                            className="w-full h-12 text-lg font-semibold bg-green-500 hover:bg-green-600 shadow-lg"
                            size="lg"
                        >
                            Разместить ставку ⭐ {currentBid.toLocaleString()}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

