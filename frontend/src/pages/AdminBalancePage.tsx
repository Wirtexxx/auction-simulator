import { useState } from 'react';
import { Button } from '../components/ui/button';
import { updateWalletBalance, getWallet } from '../lib/api/wallet';
import { Wallet, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function AdminBalancePage() {
  const [userId, setUserId] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentWallet, setCurrentWallet] = useState<{ userId: number; balance: number } | null>(null);

  const handleGetWallet = async () => {
    if (!userId || isNaN(Number(userId))) {
      setMessage({ type: 'error', text: 'Введите корректный ID пользователя' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setCurrentWallet(null);

    try {
      const response = await getWallet(Number(userId));
      if (response.success && response.responseObject) {
        setCurrentWallet({
          userId: response.responseObject._id,
          balance: response.responseObject.balance,
        });
        setBalance(response.responseObject.balance.toString());
        setMessage({ type: 'success', text: 'Баланс загружен' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Кошелек не найден' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Ошибка при загрузке баланса',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalance = async () => {
    if (!userId || isNaN(Number(userId))) {
      setMessage({ type: 'error', text: 'Введите корректный ID пользователя' });
      return;
    }

    const balanceValue = parseFloat(balance);
    if (isNaN(balanceValue) || balanceValue < 0) {
      setMessage({ type: 'error', text: 'Введите корректный баланс (неотрицательное число)' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await updateWalletBalance(Number(userId), balanceValue);
      if (response.success && response.responseObject) {
        setCurrentWallet({
          userId: response.responseObject._id,
          balance: response.responseObject.balance,
        });
        setMessage({ type: 'success', text: 'Баланс успешно обновлен' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Ошибка при обновлении баланса' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Ошибка при обновлении баланса',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#17212b] text-[#f5f5f5] pb-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Управление балансом</h1>

        <div className="space-y-6">
          {/* User ID Input */}
          <div className="space-y-2">
            <label className="text-[#708499] text-sm uppercase tracking-wide">
              ID пользователя
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Введите ID пользователя"
                className="flex-1 bg-[#232e3c] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-[#f5f5f5] placeholder-[#708499] focus:outline-none focus:ring-2 focus:ring-[#5288c1] focus:border-transparent"
                disabled={loading}
              />
              <Button
                onClick={handleGetWallet}
                disabled={loading || !userId}
                variant="outline"
                className="whitespace-nowrap"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4" />
                )}
                Загрузить
              </Button>
            </div>
          </div>

          {/* Current Balance Display */}
          {currentWallet && (
            <div className="space-y-2">
              <p className="text-[#708499] text-sm uppercase tracking-wide">
                Текущий баланс
              </p>
              <p className="text-[#f5f5f5] text-2xl font-semibold">
                {currentWallet.balance.toFixed(2)}
              </p>
            </div>
          )}

          {/* Balance Input */}
          <div className="space-y-2">
            <label className="text-[#708499] text-sm uppercase tracking-wide">
              Новый баланс
            </label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="Введите новый баланс"
              min="0"
              step="0.01"
              className="w-full bg-[#232e3c] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-[#f5f5f5] placeholder-[#708499] focus:outline-none focus:ring-2 focus:ring-[#5288c1] focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Update Button */}
          <Button
            onClick={handleUpdateBalance}
            disabled={loading || !userId || !balance}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Обновление...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Обновить баланс
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

