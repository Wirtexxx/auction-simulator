import { useEffect, useState, useRef } from 'react';
import { getUser } from '../lib/authStorage';
import { getOwnershipsByOwnerId, type Ownership } from '../lib/api/ownership';
import { getGiftById, type Gift as GiftType } from '../lib/api/gift';
import { getCollectionById } from '../lib/api/collection';
import type { Collection } from '../lib/api/types';
import { Card, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { User, Gift, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Профиль</h2>
        
        {/* Photo Section */}
        <div className="flex flex-col items-center mb-8">
          {user.photo_url ? (
            <img
              src={user.photo_url}
              alt={fullName}
              className="w-32 h-32 rounded-full object-cover border-2 border-primary mb-4"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-2 border-primary mb-4">
              <User className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          <h2 className="text-2xl font-semibold mb-1">
            {fullName}
          </h2>
          {user.username && (
            <p className="text-muted-foreground text-sm">@{user.username}</p>
          )}
        </div>

        {/* Inventory Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Инвентарь</h2>
            {inventory.length > 0 && (
              <span className="text-muted-foreground text-sm">({inventory.length})</span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : inventory.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">У вас пока нет подарков</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.map((gift) => (
                <Card key={gift._id} className="hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">{gift.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {gift.collection?.title || 'Коллекция'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Подарок #{gift.gift_id}
                        </p>
                      </div>
                    </div>

                    {gift.ownership && (
                      <div className="pt-3 border-t space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Цена покупки:</span>
                          <span className="text-primary font-medium">
                            {gift.ownership.acquired_price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Дата:</span>
                          <span className="text-muted-foreground">
                            {new Date(gift.ownership.acquired_at).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
