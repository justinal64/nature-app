import { useCallback, useEffect, useState } from 'react';

import { getJournalPosts, JournalPost } from '@/lib/journal-posts';

export function useJournalPosts(userId: string | undefined) {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setPosts([]);
      setLoading(false);
      return;
    }
    const data = await getJournalPosts(userId);
    setPosts(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  return { posts, loading, refresh: load };
}
