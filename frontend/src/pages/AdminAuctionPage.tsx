import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { createAuction } from '../lib/api/auction';
import { getCollections } from '../lib/api/collection';
import type { Collection } from '../lib/api/types';
import { Gavel, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function AdminAuctionPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [roundDuration, setRoundDuration] = useState<string>('');
  const [giftsPerRound, setGiftsPerRound] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoadingCollections(true);
      const response = await getCollections();
      if (response.success && response.responseObject) {
        setCollections(response.responseObject);
      } else {
        setMessage({ type: 'error', text: response.message || 'Не удалось загрузить коллекции' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Произошла ошибка' });
    } finally {
      setLoadingCollections(false);
    }
  };

  const handleCreateAuction = async () => {
    if (!selectedCollectionId) {
      setMessage({ type: 'error', text: 'Выберите коллекцию' });
      return;
    }
    const duration = parseInt(roundDuration);
    if (isNaN(duration) || duration <= 0) {
      setMessage({ type: 'error', text: 'Длительность раунда должна быть положительным числом (в секундах)' });
      return;
    }
    const giftsPerRoundNum = parseInt(giftsPerRound);
    if (isNaN(giftsPerRoundNum) || giftsPerRoundNum <= 0) {
      setMessage({ type: 'error', text: 'Количество подарков в раунде должно быть положительным числом' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await createAuction({
        collection_id: selectedCollectionId,
        round_duration: duration,
        gifts_per_round: giftsPerRoundNum,
      });

      if (response.success && response.responseObject) {
        setMessage({
          type: 'success',
          text: `Аукцион успешно создан. Длительность раунда: ${duration} секунд. Подарков в раунде: ${giftsPerRoundNum}.`,
        });
        setSelectedCollectionId('');
        setRoundDuration('');
        setGiftsPerRound('');
      } else {
        setMessage({ type: 'error', text: response.message || 'Ошибка при создании аукциона' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Ошибка при создании аукциона',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Gavel className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Создать аукцион</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Параметры аукциона</CardTitle>
            <CardDescription>Заполните все поля для создания нового аукциона</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Collection Selection */}
            <div className="space-y-2">
              <Label htmlFor="collection">Коллекция</Label>
              {loadingCollections ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-muted-foreground">Загрузка коллекций...</span>
                </div>
              ) : (
                <Select
                  value={selectedCollectionId}
                  onValueChange={setSelectedCollectionId}
                  disabled={loading}
                >
                  <SelectTrigger id="collection" className="w-full">
                    <SelectValue placeholder="Выберите коллекцию" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections
                      .filter((collection) => !collection.is_sold)
                      .map((collection) => (
                        <SelectItem key={collection._id} value={collection._id}>
                          {collection.emoji ? `${collection.emoji} ` : ''}{collection.title}
                          {collection.description ? ` - ${collection.description}` : ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Round Duration Input */}
            <div className="space-y-2">
              <Label htmlFor="duration">Длительность раунда (секунды)</Label>
              <Input
                id="duration"
                type="number"
                value={roundDuration}
                onChange={(e) => setRoundDuration(e.target.value)}
                placeholder="Например, 300 (5 минут)"
                min="1"
                step="1"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Укажите длительность одного раунда аукциона в секундах
              </p>
            </div>

            {/* Gifts Per Round Input */}
            <div className="space-y-2">
              <Label htmlFor="gifts">Подарков в раунде</Label>
              <Input
                id="gifts"
                type="number"
                value={giftsPerRound}
                onChange={(e) => setGiftsPerRound(e.target.value)}
                placeholder="Например, 5"
                min="1"
                step="1"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Количество подарков, которые будут выставлены в одном раунде. Непроданные подарки переносятся на следующий раунд.
              </p>
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateAuction}
              disabled={loading || !selectedCollectionId || !roundDuration || !giftsPerRound}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Создать аукцион
                </>
              )}
            </Button>

            {/* Message Display */}
            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

