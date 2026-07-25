import AsyncStorage from '@react-native-async-storage/async-storage';

// Free-form journal entries, independent of any single species sighting —
// mirrors iNaturalist's "Journal posts" (trip reports, reflections), distinct
// from the structured per-species Sighting records in lib/sightings.ts.
export type JournalPost = {
  id: string;
  userId: string;
  title: string;
  body: string;
  photoUris?: string[];
  createdAt: string; // ISO 8601
};

const KEY = (uid: string) => `journal-posts:${uid}`;

export async function getJournalPosts(userId: string): Promise<JournalPost[]> {
  const raw = await AsyncStorage.getItem(KEY(userId));
  return raw ? (JSON.parse(raw) as JournalPost[]) : [];
}

export async function addJournalPost(post: Omit<JournalPost, 'id'>): Promise<JournalPost> {
  const all = await getJournalPosts(post.userId);
  const record: JournalPost = { ...post, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` };
  await AsyncStorage.setItem(KEY(post.userId), JSON.stringify([record, ...all]));
  return record;
}

export async function deleteJournalPost(userId: string, postId: string): Promise<void> {
  const all = await getJournalPosts(userId);
  await AsyncStorage.setItem(KEY(userId), JSON.stringify(all.filter((p) => p.id !== postId)));
}

export async function updateJournalPost(
  userId: string,
  postId: string,
  patch: Partial<Pick<JournalPost, 'title' | 'body' | 'photoUris'>>,
): Promise<void> {
  const all = await getJournalPosts(userId);
  const updated = all.map((p) => (p.id === postId ? { ...p, ...patch } : p));
  await AsyncStorage.setItem(KEY(userId), JSON.stringify(updated));
}
