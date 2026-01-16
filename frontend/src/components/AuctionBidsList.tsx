import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Trophy, Users } from "lucide-react";

export interface BidDisplay {
    userId: number;
    amount: number;
    timestamp: number;
    username?: string;
    isWinner?: boolean;
}

interface AuctionBidsListProps {
    bids: BidDisplay[];
    giftsPerRound: number;
    currentUserId?: number;
}

export function AuctionBidsList({ bids, giftsPerRound, currentUserId }: AuctionBidsListProps) {
    // Keep only the latest bid per user (if user has multiple bids, only the most recent one)
    const userBidsMap = new Map<number, BidDisplay>();
    for (const bid of bids) {
        const existingBid = userBidsMap.get(bid.userId);
        // Keep only the latest bid (highest timestamp) for each user
        if (!existingBid || bid.timestamp > existingBid.timestamp) {
            userBidsMap.set(bid.userId, bid);
        }
    }
    
    // Convert map to array and sort: top by amount, then by timestamp (earlier = better)
    const uniqueBids = Array.from(userBidsMap.values());
    const sortedBids = uniqueBids.sort((a, b) => {
        if (b.amount !== a.amount) {
            return b.amount - a.amount; // DESC by amount
        }
        return a.timestamp - b.timestamp; // ASC by timestamp (earlier = better)
    });

    // Mark winners (top N)
    const bidsWithWinners = sortedBids.map((bid, index) => ({
        ...bid,
        isWinner: index < giftsPerRound,
    }));

    const winners = bidsWithWinners.filter((b) => b.isWinner);
    const losers = bidsWithWinners.filter((b) => !b.isWinner);

    return (
        <div className="space-y-4">
            {winners.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Победители (топ {giftsPerRound})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {winners.map((bid, index) => (
                                <div
                                    key={`${bid.userId}-${bid.timestamp}`}
                                    className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                                        bid.userId === currentUserId
                                            ? "bg-primary/10 border-primary"
                                            : "bg-muted/50 border-muted"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                index === 0
                                                    ? "bg-yellow-500 text-yellow-900"
                                                    : index === 1
                                                    ? "bg-gray-400 text-gray-900"
                                                    : index === 2
                                                    ? "bg-orange-600 text-orange-100"
                                                    : "bg-muted text-muted-foreground"
                                            }`}
                                        >
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">
                                                {bid.username || `User ${bid.userId}`}
                                                {bid.userId === currentUserId && (
                                                    <span className="ml-2 text-xs text-primary">(Вы)</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(bid.timestamp).toLocaleTimeString("ru-RU")}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-base font-bold text-primary">
                                        ⭐ {bid.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {losers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5 text-muted-foreground" />
                            Остальные участники
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {losers.map((bid) => (
                                <div
                                    key={`${bid.userId}-${bid.timestamp}`}
                                    className={`flex items-center justify-between p-2 rounded-lg ${
                                        bid.userId === currentUserId
                                            ? "bg-muted border border-primary/30"
                                            : "bg-muted/30"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                            {bid.username?.[0] || "U"}
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium">
                                                {bid.username || `User ${bid.userId}`}
                                                {bid.userId === currentUserId && (
                                                    <span className="ml-1 text-primary">(Вы)</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold text-muted-foreground">
                                        ⭐ {bid.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {bids.length === 0 && (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        Ставок пока нет
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
