import { useEffect, useState, useRef } from 'react';
import { getUser } from '../lib/authStorage';
import { getOwnershipsByOwnerId, type Ownership } from '../lib/api/ownership';
import { getGiftById, type Gift as GiftType } from '../lib/api/gift';
import { getCollectionById, type Collection } from '../lib/api/collection';
import { User, Shield, Crown, Gift, Loader2 } from 'lucide-react';

interface GiftWithDetails extends GiftType {
    collection?: Collection;
    ownership?: Ownership;
}

export function ProfilePage() {
  const user = getUser();
  const [inventory, setInventory] = useState<GiftWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);
  const userIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Prevent multiple simultaneous fetches
    if (!user || fetchingRef.current) {
      return;
    }

    // Only fetch if user ID changed
    if (userIdRef.current === user._id) {
      return;
    }

    userIdRef.current = user._id;
    fetchInventory();
  }, [user?._id]);

  const fetchInventory = async () => {
    if (!user || fetchingRef.current) return;

    fetchingRef.current = true;

    try {
      setLoading(true);
      setError(null);

      // Get user's ownerships
      const ownershipsResponse = await getOwnershipsByOwnerId(user._id);
      if (!ownershipsResponse.success || !ownershipsResponse.responseObject) {
        setError(ownershipsResponse.message || 'Не удалось загрузить инвентарь');
        setLoading(false);
        return;
      }

      const ownerships = ownershipsResponse.responseObject;

      // Fetch gift details for each ownership
      const giftsWithDetails = await Promise.all(
        ownerships.map(async (ownership) => {
          try {
            // Get gift details by gift_id (MongoDB ObjectId)
            const giftResponse = await getGiftById(ownership.gift_id);
            if (giftResponse.success && giftResponse.responseObject) {
              const gift = giftResponse.responseObject;
              
              // Get collection details
              let collection: Collection | undefined;
              try {
                const collectionResponse = await getCollectionById(gift.collection_id);
                if (collectionResponse.success && collectionResponse.responseObject) {
                  collection = collectionResponse.responseObject;
                }
              } catch {
                // Collection not found, skip
              }

              return {
                ...gift,
                collection,
                ownership,
              };
            }
            return null;
          } catch (err) {
            console.error('Error fetching gift details:', err);
            return null;
          }
        })
      );

      // Filter out null values
      const validGifts = giftsWithDetails.filter((gift): gift is GiftWithDetails => gift !== null);
      setInventory(validGifts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  if (!user) {
    return null;
  }

  const fullName = user.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user.first_name;

  return (
    <div className="min-h-screen bg-[#17212b] text-[#f5f5f5] pb-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Профиль</h1>
        
        {/* Photo Section */}
        <div className="flex flex-col items-center mb-8">
          {user.photo_url ? (
            <img
              src={user.photo_url}
              alt={fullName}
              className="w-32 h-32 rounded-full object-cover border-2 border-[#5288c1] mb-4"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-[#232e3c] flex items-center justify-center border-2 border-[#5288c1] mb-4">
              <User className="w-16 h-16 text-[#708499]" />
            </div>
          )}
          <h2 className="text-2xl font-semibold text-[#f5f5f5] mb-1">
            {fullName}
          </h2>
          {user.username && (
            <p className="text-[#708499] text-sm">@{user.username}</p>
          )}
        </div>

        {/* User Info Section */}
        <div className="space-y-6 mb-8">
          <div className="space-y-1">
            <p className="text-[#708499] text-xs uppercase tracking-wide mb-2">
              ID пользователя
            </p>
            <p className="text-[#f5f5f5] text-lg">{user._id}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[#708499] text-xs uppercase tracking-wide mb-2">
              Имя
            </p>
            <p className="text-[#f5f5f5] text-lg">{user.first_name}</p>
          </div>

          {user.last_name && (
            <div className="space-y-1">
              <p className="text-[#708499] text-xs uppercase tracking-wide mb-2">
                Фамилия
              </p>
              <p className="text-[#f5f5f5] text-lg">{user.last_name}</p>
            </div>
          )}

          {user.username && (
            <div className="space-y-1">
              <p className="text-[#708499] text-xs uppercase tracking-wide mb-2">
                Username
              </p>
              <p className="text-[#f5f5f5] text-lg">@{user.username}</p>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-[#708499] text-xs uppercase tracking-wide mb-2">
              Роль
            </p>
            <div className="flex items-center gap-2">
              {user.role === 'admin' ? (
                <Shield className="w-5 h-5 text-[#5288c1]" />
              ) : (
                <User className="w-5 h-5 text-[#708499]" />
              )}
              <p className="text-[#f5f5f5] text-lg capitalize">{user.role}</p>
            </div>
          </div>

          {user.is_premium && (
            <div className="space-y-1">
              <p className="text-[#708499] text-xs uppercase tracking-wide mb-2">
                Статус
              </p>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <p className="text-[#f5f5f5] text-lg">Telegram Premium</p>
              </div>
            </div>
          )}

          {user.language_code && (
            <div className="space-y-1">
              <p className="text-[#708499] text-xs uppercase tracking-wide mb-2">
                Язык
              </p>
              <p className="text-[#f5f5f5] text-lg uppercase">{user.language_code}</p>
            </div>
          )}
        </div>

        {/* Inventory Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-6 h-6 text-[#5288c1]" />
            <h2 className="text-2xl font-semibold">Инвентарь</h2>
            {inventory.length > 0 && (
              <span className="text-[#708499] text-sm">({inventory.length})</span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#5288c1]" />
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-12 bg-[#232e3c] rounded-lg border border-[rgba(255,255,255,0.1)]">
              <Gift className="w-16 h-16 text-[#708499] mx-auto mb-4" />
              <p className="text-[#708499] text-lg">У вас пока нет подарков</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.map((gift) => (
                <div
                  key={gift._id}
                  className="bg-[#232e3c] border border-[rgba(255,255,255,0.1)] rounded-lg p-4 hover:border-[#5288c1] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-[#17212b] flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{gift.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#f5f5f5] truncate">
                        {gift.collection?.title || 'Коллекция'}
                      </p>
                      <p className="text-sm text-[#708499]">
                        Подарок #{gift.gift_id}
                      </p>
                    </div>
                  </div>

                  {gift.ownership && (
                    <div className="pt-3 border-t border-[rgba(255,255,255,0.1)] space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#708499]">Цена покупки:</span>
                        <span className="text-[#5288c1] font-medium">
                          {gift.ownership.acquired_price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#708499]">Дата:</span>
                        <span className="text-[#708499]">
                          {new Date(gift.ownership.acquired_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
