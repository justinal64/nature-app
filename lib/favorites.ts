import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = (uid: string) => `favorites:${uid}`;

async function getSet(userId: string): Promise<Set<string>> {
  const raw = await AsyncStorage.getItem(KEY(userId));
  return new Set(raw ? (JSON.parse(raw) as string[]) : []);
}

export async function getFavorites(userId: string): Promise<string[]> {
  return Array.from(await getSet(userId));
}

export async function isFavorited(userId: string, speciesId: string): Promise<boolean> {
  return (await getSet(userId)).has(speciesId);
}

export async function toggleFavorite(userId: string, speciesId: string): Promise<boolean> {
  const set = await getSet(userId);
  if (set.has(speciesId)) {
    set.delete(speciesId);
  } else {
    set.add(speciesId);
  }
  await AsyncStorage.setItem(KEY(userId), JSON.stringify(Array.from(set)));
  return set.has(speciesId);
}
