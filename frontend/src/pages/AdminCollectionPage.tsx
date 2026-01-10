import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
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
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-8">Создать коллекцию подарков</h2>

        <Card>
          <CardHeader>
            <CardTitle>Параметры коллекции</CardTitle>
            <CardDescription>Заполните все обязательные поля для создания новой коллекции</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title">Название коллекции *</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Летняя коллекция"
                disabled={loading}
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <Label htmlFor="description">Описание (необязательно)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание коллекции..."
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Total Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Количество подарков *</Label>
              <Input
                id="amount"
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="Например: 100"
                min="1"
                step="1"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Будет создано указанное количество подарков с одинаковым эмодзи
              </p>
            </div>

            {/* Emoji Input */}
            <div className="space-y-2">
              <Label htmlFor="emoji">Эмодзи для подарков *</Label>
              <Input
                id="emoji"
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="🎁"
                maxLength={2}
                className="text-2xl text-center"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Создать коллекцию
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

