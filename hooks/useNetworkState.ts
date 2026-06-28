import * as Network from 'expo-network';
import { useEffect, useState } from 'react';

export function useNetworkState() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const state = await Network.getNetworkStateAsync();
        if (!cancelled) setIsConnected(state.isConnected ?? true);
      } catch {
        // Fail open — assume connected rather than false alarming offline
      }
    }

    check();
    const interval = setInterval(check, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { isConnected };
}
