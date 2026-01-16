import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCollections } from "../lib/api/collection";
import type { Collection } from "../lib/api/types";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Gift, Loader2, CheckCircle } from "lucide-react";

export function CollectionsPage() {
    const navigate = useNavigate();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getCollections();
                if (response.success && response.responseObject) {
                    setCollections(response.responseObject);
                } else {
                    setError(
                        response.message || "Не удалось загрузить коллекции"
                    );
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Произошла ошибка"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pb-20">
                <div className="container mx-auto px-4 py-8">
                    <h2 className="text-3xl font-bold mb-8">Коллекции</h2>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pb-20">
                <div className="container mx-auto px-4 py-8">
                    <h2 className="text-3xl font-bold mb-8">Коллекции</h2>
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
                <h2 className="text-3xl font-bold mb-8">Коллекции</h2>

                {collections.length === 0 ? (
                    <div className="text-center py-12">
                        <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">
                            Коллекции пока не созданы
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collections.map((collection) => (
                            <Card
                                key={collection._id}
                                onClick={() =>
                                    navigate(
                                        `/app/collections/${collection._id}`
                                    )
                                }
                                className="cursor-pointer hover:border-primary transition-all"
                            >
                                <CardHeader>
                                    {collection.emoji && (
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-primary/30">
                                                <span className="text-4xl">
                                                    {collection.emoji}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <CardTitle className="text-center">
                                        {collection.title}
                                    </CardTitle>
                                    {collection.is_sold && (
                                        <div className="flex items-center justify-center gap-2 mt-2 px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-sm font-semibold">
                                            <CheckCircle className="w-4 h-4" />
                                            Продано
                                        </div>
                                    )}
                                    {collection.description && (
                                        <CardDescription className="text-center line-clamp-2">
                                            {collection.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Всего подарков:
                                        </span>
                                        <span className="text-sm font-semibold">
                                            {collection.total_amount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Создано:
                                        </span>
                                        <span className="text-sm font-semibold text-primary">
                                            {collection.minted_amount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Дата:
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(
                                                collection.created_at
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
            </div>
        </div>
    );
}
