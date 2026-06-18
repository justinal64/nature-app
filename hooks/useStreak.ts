import { useEffect, useState } from 'react';

import { getStreak } from '@/lib/streak';

export function useStreak(userId: string | undefined) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!userId) { setStreak(0); return; }
    getStreak(userId).then(setStreak);
  }, [userId]);

  return streak;
}
