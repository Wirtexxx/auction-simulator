import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCollectionById } from '../lib/api/collection';
import { getGifts, type Gift } from '../lib/api/gift';
import { getOwnershipsByGiftId, type Ownership } from '../lib/api/ownership';
import { ArrowLeft, Loader2, User } from 'lucide-react';
import { Button } from '../components/ui/button';

interface GiftWithOwnership extends Gift {
    ownership?: Ownership;
}

export function CollectionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [collection, setCollection] = useState<any>(null);
    const [gifts, setGifts] = useState<GiftWithOwnership[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const limit = 10;

    const loadGifts = useCallback(async (currentOffset: number) => {
        if (!id) return;

        try {
            const giftsResponse = await getGifts(id, limit, currentOffset);
            if (giftsResponse.success && giftsResponse.responseObject) {
                const newGifts = giftsResponse.responseObject;
                
                // Fetch ownership for each gift
                const giftsWithOwnership = await Promise.all(
                    newGifts.map(async (gift) => {
                        const ownershipResponse = await getOwnershipsByGiftId(gift._id);
                        if (ownershipResponse.success && ownershipResponse.responseObject && ownershipResponse.responseObject.length > 0) {
                            return {
                                ...gift,
                                ownership: ownershipResponse.responseObject[0], // Get first owner
                            };
                        }
                        return gift;
                    })
                );

                if (currentOffset === 0) {
                    setGifts(giftsWithOwnership);
                } else {
                    setGifts((prev) => [...prev, ...giftsWithOwnership]);
                }

                setHasMore(newGifts.length === limit);
                setOffset(currentOffset + newGifts.length);
            } else {
                setError(giftsResponse.message || 'Не удалось загрузить подарки');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
        }
    }, [id, limit]);

    useEffect(() => {
        if (!id) return;

        const fetchCollection = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch collection details
                const collectionResponse = await getCollectionById(id);
                if (collectionResponse.success && collectionResponse.responseObject) {
                    setCollection(collectionResponse.responseObject);
                } else {
                    setError(collectionResponse.message || 'Коллекция не найдена');
                    setLoading(false);
                    return;
                }

                // Fetch first batch of gifts
                await loadGifts(0);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Произошла ошибка');
            } finally {
                setLoading(false);
            }
        };

        fetchCollection();
    }, [id, loadGifts]);

    const loadMore = async () => {
        if (loadingMore || !hasMore) return;
        
        setLoadingMore(true);
        await loadGifts(offset);
        setLoadingMore(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#17212b] text-[#f5f5f5] pb-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#5288c1]" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !collection) {
        return (
            <div className="min-h-screen bg-[#17212b] text-[#f5f5f5] pb-20">
                <div className="container mx-auto px-4 py-8">
                    <Button
                        onClick={() => navigate('/app/collections')}
                        variant="ghost"
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Назад к коллекциям
                    </Button>
                    <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
                        <p className="text-red-300">{error || 'Коллекция не найдена'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#17212b] text-[#f5f5f5] pb-20">
            <div className="container mx-auto px-4 py-8">
                <Button
                    onClick={() => navigate('/app/collections')}
                    variant="ghost"
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад к коллекциям
                </Button>

                {/* Collection Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-24 h-24 rounded-full bg-[#232e3c] flex items-center justify-center border-2 border-[#5288c1]/30">
                            <span className="text-5xl">
                                {collection.emoji || '🎁'}
                            </span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-center mb-2">
                        {collection.title}
                    </h1>
                    {collection.description && (
                        <p className="text-center text-[#708499] mb-4">
                            {collection.description}
                        </p>
                    )}
                    <div className="flex justify-center gap-4 text-sm text-[#708499]">
                        <span>Всего: {collection.total_amount}</span>
                        <span>•</span>
                        <span>Создано: {collection.minted_amount}</span>
                    </div>
                </div>

                {/* Gifts List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Подарки</h2>
                    
                    {gifts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-[#708499]">Подарки не найдены</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {gifts.map((gift) => (
                                    <div
                                        key={gift._id}
                                        className="bg-[#232e3c] border border-[rgba(255,255,255,0.1)] rounded-lg p-4 hover:border-[#5288c1] transition-colors"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-lg bg-[#17212b] flex items-center justify-center">
                                                <span className="text-2xl">{gift.emoji}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-[#f5f5f5]">
                                                    Подарок #{gift.gift_id}
                                                </p>
                                            </div>
                                        </div>

                                        {gift.ownership ? (
                                            <div className="pt-3 border-t border-[rgba(255,255,255,0.1)]">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <User className="w-4 h-4 text-[#5288c1]" />
                                                    <span className="text-[#708499]">Владелец:</span>
                                                    <span className="text-[#f5f5f5] font-medium">
                                                        ID {gift.ownership.owner_id}
                                                    </span>
                                                </div>
                                                <div className="mt-2 text-sm">
                                                    <span className="text-[#708499]">Цена:</span>
                                                    <span className="text-[#5288c1] font-medium ml-2">
                                                        {gift.ownership.acquired_price.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="pt-3 border-t border-[rgba(255,255,255,0.1)]">
                                                <p className="text-sm text-[#708499]">Не продано</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {hasMore && (
                                <div className="flex justify-center mt-6">
                                    <Button
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        variant="outline"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Загрузка...
                                            </>
                                        ) : (
                                            'Загрузить еще'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

