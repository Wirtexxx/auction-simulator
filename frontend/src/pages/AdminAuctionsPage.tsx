import { useEffect, useState, useCallback } from "react";
import { getAuctions, startAuction, finishAuction, type Auction } from "../lib/api/auction";
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
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Gavel, Loader2, Clock, CheckCircle, XCircle, Play, Square, RefreshCw } from "lucide-react";

interface AuctionWithCollection extends Auction {
    collection?: Collection;
}

type StatusFilter = "all" | "active" | "finished";

export function AdminAuctionsPage() {
    const [auctions, setAuctions] = useState<AuctionWithCollection[]>([]);
    const [filteredAuctions, setFilteredAuctions] = useState<AuctionWithCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetchAuctions();
    }, []);

    const filterAuctions = useCallback(() => {
        if (statusFilter === "all") {
            setFilteredAuctions(auctions);
        } else {
            setFilteredAuctions(auctions.filter((auction) => auction.status === statusFilter));
        }
    }, [auctions, statusFilter]);

    useEffect(() => {
        filterAuctions();
    }, [filterAuctions]);

    const fetchAuctions = async () => {
        try {
            setLoading(true);
            setError(null);
            setMessage(null);

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

    const handleStartAuction = async (auctionId: string) => {
        try {
            setActionLoading(auctionId);
            setMessage(null);
            setError(null);

            const response = await startAuction(auctionId);
            if (response.success && response.responseObject) {
                setMessage({
                    type: "success",
                    text: "Аукцион успешно запущен",
                });
                // Update the auction in the list immediately
                setAuctions((prev) =>
                    prev.map((auction) =>
                        auction._id === auctionId
                            ? { ...auction, ...response.responseObject }
                            : auction
                    )
                );
                // Refresh auctions list to get latest data
                setTimeout(() => {
                    fetchAuctions();
                }, 500);
            } else {
                setMessage({
                    type: "error",
                    text: response.message || "Не удалось запустить аукцион",
                });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Произошла ошибка при запуске аукциона";
            setMessage({
                type: "error",
                text: errorMessage,
            });
            console.error("Error starting auction:", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleFinishAuction = async (auctionId: string) => {
        try {
            setActionLoading(auctionId);
            setMessage(null);
            setError(null);

            const response = await finishAuction(auctionId);
            if (response.success && response.responseObject) {
                setMessage({
                    type: "success",
                    text: "Аукцион успешно завершен",
                });
                // Update the auction in the list immediately
                setAuctions((prev) =>
                    prev.map((auction) =>
                        auction._id === auctionId
                            ? { ...auction, ...response.responseObject }
                            : auction
                    )
                );
                // Refresh auctions list to get latest data
                setTimeout(() => {
                    fetchAuctions();
                }, 500);
            } else {
                setMessage({
                    type: "error",
                    text: response.message || "Не удалось завершить аукцион",
                });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Произошла ошибка при завершении аукциона";
            setMessage({
                type: "error",
                text: errorMessage,
            });
            console.error("Error finishing auction:", err);
        } finally {
            setActionLoading(null);
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

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("ru-RU", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(date);
    };

    if (loading) {
        return (
            <div className="min-h-screen pb-20">
                <div className="container mx-auto px-4 py-8">
                    <h2 className="text-2xl font-bold mb-8">
                        Управление аукционами
                    </h2>
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
                    <h2 className="text-2xl font-bold mb-8">
                        Управление аукционами
                    </h2>
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
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">
                        Управление аукционами
                    </h2>
                    <Button
                        onClick={fetchAuctions}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Обновить
                    </Button>
                </div>

                {/* Filters and Messages */}
                <div className="mb-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium">Фильтр по статусу:</label>
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все</SelectItem>
                                <SelectItem value="active">Активные</SelectItem>
                                <SelectItem value="finished">Завершенные</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {message && (
                        <Alert variant={message.type === "error" ? "destructive" : "default"}>
                            {message.type === "success" ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <XCircle className="w-5 h-5" />
                            )}
                            <AlertDescription>{message.text}</AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                {filteredAuctions.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Gavel className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground text-lg">
                                {statusFilter === "all"
                                    ? "Аукционы пока не созданы"
                                    : statusFilter === "active"
                                    ? "Нет активных аукционов"
                                    : "Нет завершенных аукционов"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAuctions.map((auction) => {
                            const isActionLoading = actionLoading === auction._id;
                            const canStart = auction.status === "finished";
                            const canFinish = auction.status === "active";

                            return (
                                <Card
                                    key={auction._id}
                                    className="hover:border-primary transition-all"
                                >
                                    <CardHeader>
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-primary/30">
                                                <span className="text-4xl">
                                                    {auction.collection?.emoji || "🎁"}
                                                </span>
                                            </div>
                                        </div>
                                        <CardTitle className="text-center">
                                            {auction.collection?.title || "Коллекция"}
                                        </CardTitle>
                                        {auction.collection?.description && (
                                            <CardDescription className="text-center line-clamp-2">
                                                {auction.collection.description}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-center gap-2">
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
                                            <span className="text-sm font-semibold">
                                                {auction.gifts_per_round}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">
                                                Длительность раунда:
                                            </span>
                                            <span className="text-sm font-semibold flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDuration(auction.round_duration)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">
                                                Дата создания:
                                            </span>
                                            <span className="text-sm font-semibold">
                                                {formatDate(auction.created_at)}
                                            </span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="pt-3 border-t space-y-2">
                                            {canStart && (
                                                <Button
                                                    onClick={() => handleStartAuction(auction._id)}
                                                    disabled={isActionLoading}
                                                    className="w-full"
                                                    variant="default"
                                                    size="sm"
                                                >
                                                    {isActionLoading ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Запуск...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="w-4 h-4 mr-2" />
                                                            Запустить
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                            {canFinish && (
                                                <Button
                                                    onClick={() => handleFinishAuction(auction._id)}
                                                    disabled={isActionLoading}
                                                    className="w-full"
                                                    variant="destructive"
                                                    size="sm"
                                                >
                                                    {isActionLoading ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Завершение...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Square className="w-4 h-4 mr-2" />
                                                            Завершить
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
