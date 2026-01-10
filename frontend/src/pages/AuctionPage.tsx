import { useEffect, useState, useRef } from "react";
import { getAuctions, type Auction } from "../lib/api/auction";
import { getCollectionById } from "../lib/api/collection";
import type { Collection } from "../lib/api/types";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { PlaceBidDialog } from "../components/PlaceBidDialog";
import { Gavel, Loader2, Clock, CheckCircle, XCircle } from "lucide-react";

interface AuctionWithCollection extends Auction {
    collection?: Collection;
}

export function AuctionPage() {
    const [auctions, setAuctions] = useState<AuctionWithCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
    const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        fetchAuctions();
    }, []);

    useEffect(() => {
        // Update current time every second for countdown
        intervalRef.current = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const fetchAuctions = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get all auctions (active and finished)
            const auctionsResponse = await getAuctions();
            if (!auctionsResponse.success || !auctionsResponse.responseObject) {
                setError(
                    auctionsResponse.message || "Не удалось загрузить аукционы"
                );
                setLoading(false);
                return;
            }

            const auctionsList = auctionsResponse.responseObject;

            // Fetch collection details for each auction
            const auctionsWithCollections = await Promise.all(
                auctionsList.map(async (auction) => {
                    try {
                        const collectionResponse = await getCollectionById(
                            auction.collection_id
                        );
                        if (
                            collectionResponse.success &&
                            collectionResponse.responseObject
                        ) {
                            return {
                                ...auction,
                                collection: collectionResponse.responseObject,
                            };
                        }
                        return auction;
                    } catch (err) {
                        console.error(
                            "Error fetching collection details:",
                            err
                        );
                        return auction;
                    }
                })
            );

            setAuctions(auctionsWithCollections);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Произошла ошибка");
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes > 0) {
            return remainingSeconds > 0
                ? `${minutes}м ${remainingSeconds}с`
                : `${minutes}м`;
        }
        return `${remainingSeconds}с`;
    };

    const getRemainingTime = (auction: Auction): number | null => {
        if (auction.status !== "active" || !auction.current_round_started_at) {
            return null;
        }

        const roundStartTime = new Date(
            auction.current_round_started_at
        ).getTime();
        const endTime = roundStartTime + auction.round_duration * 1000;
        const remaining = Math.max(
            0,
            Math.floor((endTime - currentTime) / 1000)
        );

        return remaining;
    };

    const formatCountdown = (seconds: number): string => {
        if (seconds <= 0) {
            return "00:00";
        }

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${minutes.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen pb-20">
                <div className="container mx-auto px-4 py-8">
                    <h2 className="text-3xl font-bold mb-8">Аукцион</h2>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    if (error && auctions.length === 0) {
        return (
            <div className="min-h-screen pb-20">
                <div className="container mx-auto px-4 py-8">
                    <h2 className="text-3xl font-bold mb-8">Аукцион</h2>
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold mb-8">Аукцион</h2>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {auctions.length === 0 ? (
                    <div className="text-center py-12">
                        <Gavel className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">
                            Аукционы пока не созданы
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {auctions.map((auction) => (
                            <Card
                                key={auction._id}
                                className="cursor-pointer hover:border-primary transition-all"
                                onClick={() => {
                                    if (auction.status === "active") {
                                        setSelectedAuctionId(auction._id);
                                        setIsBidDialogOpen(true);
                                    }
                                }}
                            >
                                <CardHeader>
                                    {auction.collection && (
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-primary/30">
                                                <span className="text-4xl">
                                                    {auction.collection.emoji ||
                                                        "🎁"}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <CardTitle className="text-center">
                                        {auction.collection?.title ||
                                            "Коллекция"}
                                    </CardTitle>
                                    {auction.collection?.description && (
                                        <CardDescription className="text-center line-clamp-2">
                                            {auction.collection.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Статус:
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {auction.status === "active" ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    <span className="text-sm font-semibold text-green-500">
                                                        Активен
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-semibold text-muted-foreground">
                                                        Завершен
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {auction.status === "active" &&
                                        (() => {
                                            const remaining =
                                                getRemainingTime(auction);
                                            return remaining !== null &&
                                                remaining > 0 ? (
                                                <div className="flex justify-between items-center bg-muted rounded-lg p-3 border border-primary/30">
                                                    <span className="text-sm text-muted-foreground">
                                                        Осталось времени:
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-primary animate-pulse" />
                                                        <span className="text-lg font-bold text-primary font-mono">
                                                            {formatCountdown(
                                                                remaining
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : null;
                                        })()}

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Раунд:
                                        </span>
                                        <span className="text-sm font-semibold">
                                            #{auction.current_round_number}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Подарков в раунде:
                                        </span>
                                        <span className="text-sm font-semibold text-primary">
                                            {auction.gifts_per_round}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Длительность раунда:
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-semibold">
                                                {formatDuration(
                                                    auction.round_duration
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Дата создания:
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(
                                                auction.created_at
                                            ).toLocaleDateString("ru-RU", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Place Bid Dialog */}
                <PlaceBidDialog
                    auctionId={selectedAuctionId}
                    open={isBidDialogOpen}
                    onOpenChange={(open) => {
                        setIsBidDialogOpen(open);
                        if (!open) {
                            setSelectedAuctionId(null);
                        }
                    }}
                />
            </div>
        </div>
    );
}
