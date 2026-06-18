import AsyncStorage from '@react-native-async-storage/async-storage';

type StreakData = { lastLogin: string; count: number };

const KEY = (uid: string) => `streak:${uid}`;

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function updateStreak(userId: string): Promise<number> {
  const raw = await AsyncStorage.getItem(KEY(userId));
  const today = toDateStr(new Date());

  if (!raw) {
    await AsyncStorage.setItem(KEY(userId), JSON.stringify({ lastLogin: today, count: 1 }));
    return 1;
  }

  const data = JSON.parse(raw) as StreakData;
  if (data.lastLogin === today) return data.count;

  const yesterday = toDateStr(new Date(Date.now() - 86_400_000));
  const count = data.lastLogin === yesterday ? data.count + 1 : 1;
  await AsyncStorage.setItem(KEY(userId), JSON.stringify({ lastLogin: today, count }));
  return count;
}

export async function getStreak(userId: string): Promise<number> {
  const raw = await AsyncStorage.getItem(KEY(userId));
  if (!raw) return 0;
  return (JSON.parse(raw) as StreakData).count;
}
