import { useCallback, useEffect, useState } from 'react';

import { getFavorites } from '@/lib/favorites';

export function useFavorites(userId: string | undefined) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) { setFavoriteIds([]); setLoading(false); return; }
    const ids = await getFavorites(userId);
    setFavoriteIds(ids);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  return { favoriteIds, loading, refresh: load };
}
