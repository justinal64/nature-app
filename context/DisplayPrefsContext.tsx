import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const PREF_KEY = 'prefs:scientificNames';
const JUNIOR_KEY = 'prefs:juniorMode';

type DisplayPrefsCtx = {
  preferScientific: boolean;
  toggleNameDisplay: () => void;
  /** Returns latin name if preferScientific, otherwise commonName */
  displayName: (sp: { commonName: string; latin: string }) => string;
  juniorMode: boolean;
  toggleJuniorMode: () => void;
};

const Ctx = createContext<DisplayPrefsCtx>({
  preferScientific: false,
  toggleNameDisplay: () => {},
  displayName: (sp) => sp.commonName,
  juniorMode: false,
  toggleJuniorMode: () => {},
});

export function DisplayPrefsProvider({ children }: { children: React.ReactNode }) {
  const [preferScientific, setPreferScientific] = useState(false);
  const [juniorMode, setJuniorMode] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet([PREF_KEY, JUNIOR_KEY]).then((pairs) => {
      if (pairs[0][1] === '1') setPreferScientific(true);
      if (pairs[1][1] === '1') setJuniorMode(true);
    }).catch(() => {});
  }, []);

  const toggleNameDisplay = useCallback(() => {
    setPreferScientific((prev) => {
      const next = !prev;
      AsyncStorage.setItem(PREF_KEY, next ? '1' : '0').catch(() => {});
      return next;
    });
  }, []);

  const toggleJuniorMode = useCallback(() => {
    setJuniorMode((prev) => {
      const next = !prev;
      AsyncStorage.setItem(JUNIOR_KEY, next ? '1' : '0').catch(() => {});
      return next;
    });
  }, []);

  const displayName = useCallback(
    (sp: { commonName: string; latin: string }) => preferScientific ? sp.latin : sp.commonName,
    [preferScientific],
  );

  return (
    <Ctx.Provider value={{ preferScientific, toggleNameDisplay, displayName, juniorMode, toggleJuniorMode }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDisplayPrefs() {
  return useContext(Ctx);
}
