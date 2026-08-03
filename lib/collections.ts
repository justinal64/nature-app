import AsyncStorage from '@react-native-async-storage/async-storage';

// "Projects" (#37) as a local-only feature: this app is single-user and
// offline-first (see CLAUDE.md), so there's no shared/collaborative
// collection the way iNaturalist's Projects work — this is a personal
// collection of the user's own sightings, tagged locally, same storage
// shape as lib/sightings.ts (one JSON array per user in AsyncStorage).
export type Collection = {
  id: string;
  userId: string;
  name: string;
  createdAt: string; // ISO 8601
  sightingIds: string[];
};

const KEY = (uid: string) => `collections:${uid}`;

export async function getCollections(userId: string): Promise<Collection[]> {
  const raw = await AsyncStorage.getItem(KEY(userId));
  return raw ? (JSON.parse(raw) as Collection[]) : [];
}

export async function getCollectionById(userId: string, collectionId: string): Promise<Collection | undefined> {
  const all = await getCollections(userId);
  return all.find((c) => c.id === collectionId);
}

export async function createCollection(userId: string, name: string): Promise<Collection> {
  const all = await getCollections(userId);
  const record: Collection = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    userId,
    name: name.trim(),
    createdAt: new Date().toISOString(),
    sightingIds: [],
  };
  await AsyncStorage.setItem(KEY(userId), JSON.stringify([record, ...all]));
  return record;
}

export async function renameCollection(userId: string, collectionId: string, name: string): Promise<void> {
  const all = await getCollections(userId);
  const updated = all.map((c) => (c.id === collectionId ? { ...c, name: name.trim() } : c));
  await AsyncStorage.setItem(KEY(userId), JSON.stringify(updated));
}

export async function deleteCollection(userId: string, collectionId: string): Promise<void> {
  const all = await getCollections(userId);
  await AsyncStorage.setItem(KEY(userId), JSON.stringify(all.filter((c) => c.id !== collectionId)));
}

export async function toggleSightingInCollection(
  userId: string,
  collectionId: string,
  sightingId: string,
): Promise<Collection[]> {
  const all = await getCollections(userId);
  const updated = all.map((c) => {
    if (c.id !== collectionId) return c;
    const has = c.sightingIds.includes(sightingId);
    return {
      ...c,
      sightingIds: has ? c.sightingIds.filter((id) => id !== sightingId) : [...c.sightingIds, sightingId],
    };
  });
  await AsyncStorage.setItem(KEY(userId), JSON.stringify(updated));
  return updated;
}
