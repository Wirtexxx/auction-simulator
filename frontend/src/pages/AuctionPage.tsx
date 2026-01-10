import { useEffect, useState, useRef } from 'react';
import { getAuctions, type Auction } from '../lib/api/auction';
import { getCollectionById, type Collection } from '../lib/api/collection';
import { Gavel, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';

interface AuctionWithCollection extends Auction {
    collection?: Collection;
}

export function AuctionPage() {
  const [auctions, setAuctions] = useState<AuctionWithCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
        setError(auctionsResponse.message || 'Не удалось загрузить аукционы');
        setLoading(false);
        return;
      }

      const auctionsList = auctionsResponse.responseObject;

      // Fetch collection details for each auction
      const auctionsWithCollections = await Promise.all(
        auctionsList.map(async (auction) => {
          try {
            const collectionResponse = await getCollectionById(auction.collection_id);
            if (collectionResponse.success && collectionResponse.responseObject) {
              return {
                ...auction,
                collection: collectionResponse.responseObject,
              };
            }
            return auction;
          } catch (err) {
            console.error('Error fetching collection details:', err);
            return auction;
          }
        })
      );

      setAuctions(auctionsWithCollections);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return remainingSeconds > 0 ? `${minutes}м ${remainingSeconds}с` : `${minutes}м`;
    }
    return `${remainingSeconds}с`;
  };

  const getRemainingTime = (auction: Auction): number | null => {
    if (auction.status !== 'active' || !auction.current_round_started_at) {
      return null;
    }

    const roundStartTime = new Date(auction.current_round_started_at).getTime();
    const endTime = roundStartTime + (auction.round_duration * 1000);
    const remaining = Math.max(0, Math.floor((endTime - currentTime) / 1000));
    
    return remaining;
  };

  const formatCountdown = (seconds: number): string => {
    if (seconds <= 0) {
      return '00:00';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#17212b] text-[#f5f5f5] pb-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Аукцион</h1>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#5288c1]" />
          </div>
        </div>
      </div>
    );
  }

  if (error && auctions.length === 0) {
    return (
      <div className="min-h-screen bg-[#17212b] text-[#f5f5f5] pb-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Аукцион</h1>
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#17212b] text-[#f5f5f5] pb-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Аукцион</h1>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {auctions.length === 0 ? (
          <div className="text-center py-12">
            <Gavel className="w-16 h-16 text-[#708499] mx-auto mb-4" />
            <p className="text-[#708499] text-lg">Аукционы пока не созданы</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <div
                key={auction._id}
                className="bg-[#232e3c] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 hover:border-[#5288c1] transition-all"
              >
                {/* Collection Header */}
                {auction.collection && (
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-[#17212b] flex items-center justify-center border-2 border-[#5288c1]/30">
                      <span className="text-4xl">
                        {auction.collection.emoji || '🎁'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Collection Title */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-[#f5f5f5] mb-2">
                    {auction.collection?.title || 'Коллекция'}
                  </h3>
                  {auction.collection?.description && (
                    <p className="text-sm text-[#708499] line-clamp-2">
                      {auction.collection.description}
                    </p>
                  )}
                </div>

                {/* Auction Info */}
                <div className="space-y-3 pt-4 border-t border-[rgba(255,255,255,0.1)]">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#708499]">Статус:</span>
                    <div className="flex items-center gap-2">
                      {auction.status === 'active' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-semibold text-green-500">Активен</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-[#708499]" />
                          <span className="text-sm font-semibold text-[#708499]">Завершен</span>
                        </>
                      )}
                    </div>
                  </div>

                  {auction.status === 'active' && (() => {
                    const remaining = getRemainingTime(auction);
                    return remaining !== null && remaining > 0 ? (
                      <div className="flex justify-between items-center bg-[#17212b] rounded-lg p-3 border border-[#5288c1]/30">
                        <span className="text-sm text-[#708499]">Осталось времени:</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#5288c1] animate-pulse" />
                          <span className="text-lg font-bold text-[#5288c1] font-mono">
                            {formatCountdown(remaining)}
                          </span>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#708499]">Раунд:</span>
                    <span className="text-sm font-semibold text-[#f5f5f5]">
                      #{auction.current_round_number}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#708499]">Подарков в раунде:</span>
                    <span className="text-sm font-semibold text-[#5288c1]">
                      {auction.gifts_per_round}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#708499]">Длительность раунда:</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#5288c1]" />
                      <span className="text-sm font-semibold text-[#f5f5f5]">
                        {formatDuration(auction.round_duration)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#708499]">Дата создания:</span>
                    <span className="text-sm text-[#708499]">
                      {new Date(auction.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
