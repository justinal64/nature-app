import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { downloadModel, isModelDownloaded } from '@/lib/local-identify';
import { useAuth } from '@/context/AuthContext';

export type ModelStatus = 'idle' | 'downloading' | 'ready' | 'error';

type ModelInitContextType = {
  modelStatus: ModelStatus;
  modelProgress: number;
};

const ModelInitContext = createContext<ModelInitContextType>({
  modelStatus: 'idle',
  modelProgress: 0,
});

export function ModelInitProvider({ children }: { children: ReactNode }) {
  const { emailVerified } = useAuth();
  const [modelStatus, setModelStatus] = useState<ModelStatus>('idle');
  const [modelProgress, setModelProgress] = useState(0);

  useEffect(() => {
    if (!emailVerified) return;
    let cancelled = false;

    async function run() {
      try {
        const downloaded = await isModelDownloaded();
        if (cancelled) return;
        if (downloaded) {
          setModelStatus('ready');
          return;
        }
        setModelStatus('downloading');
        await downloadModel((fraction) => {
          if (!cancelled) setModelProgress(fraction);
        });
        if (!cancelled) {
          setModelStatus('ready');
          setModelProgress(1);
        }
      } catch {
        if (!cancelled) setModelStatus('error');
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [emailVerified]);

  return (
    <ModelInitContext.Provider value={{ modelStatus, modelProgress }}>
      {children}
    </ModelInitContext.Provider>
  );
}

export function useModelInit() {
  return useContext(ModelInitContext);
}
