import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import {
  connectINaturalist,
  disconnectINaturalist,
  getStoredUsername,
  isConnected,
} from '@/lib/inat-auth';

export type INatAuthStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

type INatAuthContextType = {
  status: INatAuthStatus;
  username: string | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

const INatAuthContext = createContext<INatAuthContextType | undefined>(undefined);

export function INatAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<INatAuthStatus>('disconnected');
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    isConnected().then(async (connected) => {
      if (!connected) return;
      setUsername(await getStoredUsername());
      setStatus('connected');
    });
  }, []);

  const connect = async () => {
    setStatus('connecting');
    setError(null);
    try {
      const result = await connectINaturalist();
      setUsername(result.username);
      setStatus('connected');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to iNaturalist.');
      setStatus('error');
    }
  };

  const disconnect = async () => {
    await disconnectINaturalist();
    setUsername(null);
    setError(null);
    setStatus('disconnected');
  };

  return (
    <INatAuthContext.Provider value={{ status, username, error, connect, disconnect }}>
      {children}
    </INatAuthContext.Provider>
  );
}

export function useINatAuth() {
  const context = useContext(INatAuthContext);
  if (context === undefined) {
    throw new Error('useINatAuth must be used within an INatAuthProvider');
  }
  return context;
}
