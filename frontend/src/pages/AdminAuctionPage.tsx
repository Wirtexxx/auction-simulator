import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { createAuction } from '../lib/api/auction';
import { getCollections, type Collection } from '../lib/api/collection';
import { Gavel, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';

export function AdminAuctionPage() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-[#17212b] text-[#f5f5f5] pb-20">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate('/app/admin')}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к админ панели
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Gavel className="w-8 h-8 text-[#5288c1]" />
          <h1 className="text-3xl font-bold">Создать аукцион</h1>
        </div>

        <div className="space-y-6">
          {/* Collection Selection */}
          <div className="space-y-2">
            <label className="text-[#708499] text-sm uppercase tracking-wide">
              Коллекция
            </label>
            {loadingCollections ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="w-4 h-4 animate-spin text-[#5288c1]" />
                <span className="text-[#708499]">Загрузка коллекций...</span>
              </div>
            ) : (
              <select
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                className="w-full bg-[#232e3c] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#5288c1] focus:border-transparent"
                disabled={loading}
              >
                <option value="">Выберите коллекцию</option>
                {collections.map((collection) => (
                  <option key={collection._id} value={collection._id}>
                    {collection.emoji ? `${collection.emoji} ` : ''}{collection.title}
                    {collection.description ? ` - ${collection.description}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Round Duration Input */}
          <div className="space-y-2">
            <label className="text-[#708499] text-sm uppercase tracking-wide">
              Длительность раунда (секунды)
            </label>
            <input
              type="number"
              value={roundDuration}
              onChange={(e) => setRoundDuration(e.target.value)}
              placeholder="Например, 300 (5 минут)"
              min="1"
              step="1"
              className="w-full bg-[#232e3c] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-[#f5f5f5] placeholder-[#708499] focus:outline-none focus:ring-2 focus:ring-[#5288c1] focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-[#708499]">
              Укажите длительность одного раунда аукциона в секундах
            </p>
          </div>

          {/* Gifts Per Round Input */}
          <div className="space-y-2">
            <label className="text-[#708499] text-sm uppercase tracking-wide">
              Подарков в раунде
            </label>
            <input
              type="number"
              value={giftsPerRound}
              onChange={(e) => setGiftsPerRound(e.target.value)}
              placeholder="Например, 5"
              min="1"
              step="1"
              className="w-full bg-[#232e3c] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-[#f5f5f5] placeholder-[#708499] focus:outline-none focus:ring-2 focus:ring-[#5288c1] focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-[#708499]">
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
            <div
              className={`flex items-center gap-2 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-900/30 border border-green-800 text-green-300'
                  : 'bg-red-900/30 border border-red-800 text-red-300'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <p className="text-sm">{message.text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

