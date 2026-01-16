import { Card, CardContent } from "./ui/card";
import { Clock, Gift, Users, TrendingUp } from "lucide-react";
import { useCountdown, formatCountdown } from "../hooks/useCountdown";
import type { Auction } from "../lib/api/auction";

interface AuctionStatusCardProps {
    auction: Auction;
    currentRoundEndTs?: number;
    currentRoundNumber?: number;
    currentRoundGiftsCount?: number;
    totalGifts?: number;
    totalBids?: number;
    isSettling?: boolean;
}

export function AuctionStatusCard({
    auction,
    currentRoundEndTs,
    currentRoundNumber,
    currentRoundGiftsCount,
    totalGifts,
    totalBids = 0,
    isSettling = false,
}: AuctionStatusCardProps) {
    const displayRoundNumber = currentRoundNumber ?? auction.current_round_number;
    const isOverRound = displayRoundNumber > (auction.total_rounds || 0);
    const remaining = useCountdown(
        currentRoundEndTs || null,
        {
            enabled: auction.status === "active" && !isSettling && !!currentRoundEndTs,
        }
    );

    const calculateRoundEndTs = () => {
        if (auction.current_round_started_at) {
            const startTime = new Date(auction.current_round_started_at).getTime();
            return startTime + auction.round_duration * 1000;
        }
        return null;
    };

    const roundEndTs = currentRoundEndTs || calculateRoundEndTs();

    return (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <CardContent className="p-6 space-y-4">
                {isOverRound && (
                    <div className="mb-4 p-4 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-lg text-center">
                        <div className="text-xl font-bold text-yellow-600 mb-1">
                            ⚠️ OVER ROUND
                        </div>
                        <div className="text-sm text-yellow-700">
                            Дополнительный раунд для продажи оставшихся подарков
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <span className="text-sm text-muted-foreground">Раунд #{displayRoundNumber}</span>
                    </div>
                    {auction.status === "active" && (
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                isSettling
                                    ? "bg-yellow-500/20 text-yellow-600"
                                    : "bg-green-500/20 text-green-600"
                            }`}
                        >
                            {isSettling ? "Завершение..." : "Активен"}
                        </span>
                    )}
                </div>

                {auction.status === "active" && roundEndTs && !isSettling && (
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary font-mono mb-1">
                            {formatCountdown(remaining)}
                        </div>
                        <div className="text-xs text-muted-foreground">до закрытия раунда</div>
                    </div>
                )}

                {isSettling && (
                    <div className="text-center">
                        <div className="text-lg font-semibold text-yellow-600 mb-1">
                            Раунд закрывается...
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Определение победителей
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border/50">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-primary mb-1">
                            <Gift className="w-4 h-4" />
                            <span className="text-lg font-bold">
                                {currentRoundGiftsCount !== undefined ? currentRoundGiftsCount : auction.gifts_per_round}
                            </span>
                        </div>
                        <div className="text-xs text-muted-foreground">в раунде</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-primary mb-1">
                            <Gift className="w-4 h-4" />
                            <span className="text-lg font-bold">{totalGifts ?? "—"}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">всего</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-primary mb-1">
                            <Users className="w-4 h-4" />
                            <span className="text-lg font-bold">{totalBids}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">ставок</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-primary mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-lg font-bold">
                                {displayRoundNumber}/{auction.total_rounds || "?"}
                                {isOverRound && <span className="text-yellow-600 ml-1">+</span>}
                            </span>
                        </div>
                        <div className="text-xs text-muted-foreground">раунд</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
