import { useCallback, useEffect, useState } from 'react';

import { getSightings, Sighting } from '@/lib/sightings';

export function useSightings(userId: string | undefined) {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setSightings([]);
      setLoading(false);
      return;
    }
    const data = await getSightings(userId);
    setSightings(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  return { sightings, loading, refresh: load };
}
