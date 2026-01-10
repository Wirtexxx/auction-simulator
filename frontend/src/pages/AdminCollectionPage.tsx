import { useState } from 'react';
import { Button } from '../components/ui/button';
import { createCollection } from '../lib/api/collection';
import { Gift, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function AdminCollectionPage() {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [emoji, setEmoji] = useState<string>('🎁');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreateCollection = async () => {
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Введите название коллекции' });
      return;
    }

    if (!emoji.trim()) {
      setMessage({ type: 'error', text: 'Введите эмодзи для подарков' });
      return;
    }

    const totalAmountValue = parseInt(totalAmount);
    if (isNaN(totalAmountValue) || totalAmountValue <= 0) {
      setMessage({ type: 'error', text: 'Введите корректное количество подарков (положительное число)' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await createCollection({
        title: title.trim(),
        description: description.trim() || undefined,
        total_amount: totalAmountValue,
        emoji: emoji.trim(),
      });

      if (response.success && response.responseObject) {
        setMessage({ 
          type: 'success', 
          text: `Коллекция "${response.responseObject.title}" успешно создана! Создано ${response.responseObject.minted_amount} подарков.` 
        });
        // Reset form
        setTitle('');
        setDescription('');
        setTotalAmount('');
        setEmoji('🎁');
      } else {
        setMessage({ type: 'error', text: response.message || 'Ошибка при создании коллекции' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Ошибка при создании коллекции',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#17212b] text-[#f5f5f5] pb-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Создать коллекцию подарков</h1>

        <div className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-[#708499] text-sm uppercase tracking-wide">
              Название коллекции *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Летняя коллекция"
              className="w-full bg-[#232e3c] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-[#f5f5f5] placeholder-[#708499] focus:outline-none focus:ring-2 focus:ring-[#5288c1] focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-[#708499] text-sm uppercase tracking-wide">
              Описание (необязательно)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание коллекции..."
              rows={3}
              className="w-full bg-[#232e3c] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-[#f5f5f5] placeholder-[#708499] focus:outline-none focus:ring-2 focus:ring-[#5288c1] focus:border-transparent resize-none"
              disabled={loading}
            />
          </div>

          {/* Total Amount Input */}
          <div className="space-y-2">
            <label className="text-[#708499] text-sm uppercase tracking-wide">
              Количество подарков *
            </label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Например: 100"
              min="1"
              step="1"
              className="w-full bg-[#232e3c] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-[#f5f5f5] placeholder-[#708499] focus:outline-none focus:ring-2 focus:ring-[#5288c1] focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-[#708499]">
              Будет создано указанное количество подарков с одинаковым эмодзи
            </p>
          </div>

          {/* Emoji Input */}
          <div className="space-y-2">
            <label className="text-[#708499] text-sm uppercase tracking-wide">
              Эмодзи для подарков *
            </label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="🎁"
              maxLength={2}
              className="w-full bg-[#232e3c] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-[#f5f5f5] placeholder-[#708499] focus:outline-none focus:ring-2 focus:ring-[#5288c1] focus:border-transparent text-2xl text-center"
              disabled={loading}
            />
            <p className="text-xs text-[#708499]">
              Все подарки в коллекции будут иметь этот эмодзи
            </p>
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreateCollection}
            disabled={loading || !title.trim() || !emoji.trim() || !totalAmount}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Создание...
              </>
            ) : (
              <>
                <Gift className="w-4 h-4" />
                Создать коллекцию
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

