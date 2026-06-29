import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const PREF_KEY = 'prefs:scientificNames';

type DisplayPrefsCtx = {
  preferScientific: boolean;
  toggleNameDisplay: () => void;
  /** Returns latin name if preferScientific, otherwise commonName */
  displayName: (sp: { commonName: string; latin: string }) => string;
};

const Ctx = createContext<DisplayPrefsCtx>({
  preferScientific: false,
  toggleNameDisplay: () => {},
  displayName: (sp) => sp.commonName,
});

export function DisplayPrefsProvider({ children }: { children: React.ReactNode }) {
  const [preferScientific, setPreferScientific] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PREF_KEY).then((v) => { if (v === '1') setPreferScientific(true); }).catch(() => {});
  }, []);

  const toggleNameDisplay = useCallback(() => {
    setPreferScientific((prev) => {
      const next = !prev;
      AsyncStorage.setItem(PREF_KEY, next ? '1' : '0').catch(() => {});
      return next;
    });
  }, []);

  const displayName = useCallback(
    (sp: { commonName: string; latin: string }) => preferScientific ? sp.latin : sp.commonName,
    [preferScientific],
  );

  return <Ctx.Provider value={{ preferScientific, toggleNameDisplay, displayName }}>{children}</Ctx.Provider>;
}

export function useDisplayPrefs() {
  return useContext(Ctx);
}
