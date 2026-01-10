import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCollections, deleteCollection, type Collection } from '../lib/api/collection';
import { Gift, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';

export function AdminCollectionsPage() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCollections();
      if (response.success && response.responseObject) {
        setCollections(response.responseObject);
      } else {
        setError(response.message || 'Не удалось загрузить коллекции');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }

    try {
      setDeletingId(id);
      const response = await deleteCollection(id);
      if (response.success) {
        // Remove collection from list
        setCollections((prev) => prev.filter((c) => c._id !== id));
        setConfirmDelete(null);
      } else {
        setError(response.message || 'Не удалось удалить коллекцию');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#17212b] text-[#f5f5f5] pb-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Управление коллекциями</h1>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#5288c1]" />
          </div>
        </div>
      </div>
    );
  }

  if (error && collections.length === 0) {
    return (
      <div className="min-h-screen bg-[#17212b] text-[#f5f5f5] pb-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Управление коллекциями</h1>
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
        <h1 className="text-3xl font-bold mb-8">Управление коллекциями</h1>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {collections.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-[#708499] mx-auto mb-4" />
            <p className="text-[#708499] text-lg">Коллекции пока не созданы</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div
                key={collection._id}
                className="bg-[#232e3c] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 hover:border-[#5288c1] transition-all"
              >
                {/* Emoji Header */}
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-[#17212b] flex items-center justify-center border-2 border-[#5288c1]/30">
                    <span className="text-4xl">
                      {collection.emoji || '🎁'}
                    </span>
                  </div>
                </div>

                {/* Title and Description */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-[#f5f5f5] mb-2">
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p className="text-sm text-[#708499] line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-3 pt-4 border-t border-[rgba(255,255,255,0.1)] mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#708499]">Всего подарков:</span>
                    <span className="text-sm font-semibold text-[#f5f5f5]">
                      {collection.total_amount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#708499]">Создано:</span>
                    <span className="text-sm font-semibold text-[#5288c1]">
                      {collection.minted_amount}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/app/collections/${collection._id}`)}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    Просмотр
                  </Button>
                  <Button
                    onClick={() => handleDelete(collection._id)}
                    disabled={deletingId === collection._id}
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                  >
                    {deletingId === collection._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : confirmDelete === collection._id ? (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Подтвердить
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Удалить
                      </>
                    )}
                  </Button>
                </div>

                {confirmDelete === collection._id && (
                  <p className="text-xs text-[#708499] mt-2 text-center">
                    Нажмите еще раз для подтверждения
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

