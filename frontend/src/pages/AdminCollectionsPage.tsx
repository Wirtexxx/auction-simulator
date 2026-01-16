import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCollections, deleteCollection } from "../lib/api/collection";
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
import { Gift, Loader2, Trash2, AlertTriangle } from "lucide-react";

export function AdminCollectionsPage() {
    const navigate = useNavigate();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getCollections();
            if (response.success && response.responseObject) {
                setCollections(response.responseObject);
            } else {
                setError(response.message || "Не удалось загрузить коллекции");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Произошла ошибка");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirmDelete !== id) {
            setConfirmDelete(id);
            return;
        }

        try {
            setDeletingId(id);
            const response = await deleteCollection(id);
            if (response.success) {
                // Remove collection from list
                setCollections((prev) => prev.filter((c) => c._id !== id));
                setConfirmDelete(null);
            } else {
                setError(response.message || "Не удалось удалить коллекцию");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Произошла ошибка");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pb-20">
                <div className="container mx-auto px-4 py-8">
                    <h2 className="text-2xl font-bold mb-8">
                         Управление коллекциями
                     </h2>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    if (error && collections.length === 0) {
        return (
            <div className="min-h-screen pb-20">
                <div className="container mx-auto px-4 py-8">
                    <h2 className="text-2xl font-bold mb-8">
                         Управление коллекциями
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
                <h2 className="text-3xl font-bold mb-8">
                         Управление коллекциями
                     </h2>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {collections.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground text-lg">
                                Коллекции пока не созданы
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collections.map((collection) => (
                            <Card
                                key={collection._id}
                                className="hover:border-primary transition-all"
                            >
                                <CardHeader>
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-primary/30">
                                            <span className="text-4xl">
                                                {collection.emoji || "🎁"}
                                            </span>
                                        </div>
                                    </div>
                                    <CardTitle className="text-center">
                                        {collection.title}
                                    </CardTitle>
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

                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            onClick={() =>
                                                navigate(
                                                    `/app/collections/${collection._id}`
                                                )
                                            }
                                            variant="outline"
                                            className="flex-1"
                                            size="sm"
                                        >
                                            Просмотр
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                handleDelete(collection._id)
                                            }
                                            disabled={
                                                deletingId === collection._id
                                            }
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1"
                                        >
                                            {deletingId === collection._id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : confirmDelete ===
                                              collection._id ? (
                                                <>
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    Подтвердить
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Удалить
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {confirmDelete === collection._id && (
                                        <p className="text-xs text-muted-foreground mt-2 text-center">
                                            Нажмите еще раз для подтверждения
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
