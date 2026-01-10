import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
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
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-8">Управление балансом</h2>

        <Card>
          <CardHeader>
            <CardTitle>Изменение баланса пользователя</CardTitle>
            <CardDescription>Введите ID пользователя и новый баланс</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User ID Input */}
            <div className="space-y-2">
              <Label htmlFor="userId">ID пользователя</Label>
              <div className="flex gap-2">
                <Input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Введите ID пользователя"
                  disabled={loading}
                  className="flex-1"
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
                <Label>Текущий баланс</Label>
                <p className="text-2xl font-semibold">
                  {currentWallet.balance.toFixed(2)}
                </p>
              </div>
            )}

            {/* Balance Input */}
            <div className="space-y-2">
              <Label htmlFor="balance">Новый баланс</Label>
              <Input
                id="balance"
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="Введите новый баланс"
                min="0"
                step="0.01"
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Обновление...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Обновить баланс
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

