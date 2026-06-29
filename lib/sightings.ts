import AsyncStorage from '@react-native-async-storage/async-storage';

export type SpeciesKind = 'cactus' | 'bird' | 'insect' | 'snake';

export type ObservationType =
  | 'organism'    // saw the animal/plant directly
  | 'track'       // footprints
  | 'scat'        // droppings
  | 'nest'        // nest, burrow, den
  | 'shed'        // shed skin or exoskeleton
  | 'sound'       // heard but not seen
  | 'other';

export type Sighting = {
  id: string;
  userId: string;
  speciesId: string;
  commonName: string;
  latinName: string;
  kind: SpeciesKind;
  photoUri?: string;
  capturedAt: string; // ISO 8601
  observationType?: ObservationType;
  notes?: string;
  location?: { lat: number; lng: number };
};

const KEY = (uid: string) => `sightings:${uid}`;

export async function getSightings(userId: string): Promise<Sighting[]> {
  const raw = await AsyncStorage.getItem(KEY(userId));
  return raw ? (JSON.parse(raw) as Sighting[]) : [];
}

export async function getSightingById(userId: string, sightingId: string): Promise<Sighting | undefined> {
  const all = await getSightings(userId);
  return all.find((s) => s.id === sightingId);
}

export async function addSighting(sighting: Omit<Sighting, 'id'>): Promise<Sighting> {
  const all = await getSightings(sighting.userId);
  const record: Sighting = { ...sighting, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` };
  await AsyncStorage.setItem(KEY(sighting.userId), JSON.stringify([record, ...all]));
  return record;
}

export async function deleteSighting(userId: string, sightingId: string): Promise<void> {
  const all = await getSightings(userId);
  await AsyncStorage.setItem(KEY(userId), JSON.stringify(all.filter((s) => s.id !== sightingId)));
}

export async function updateSighting(
  userId: string,
  sightingId: string,
  patch: Partial<Pick<Sighting, 'notes'>>,
): Promise<void> {
  const all = await getSightings(userId);
  await AsyncStorage.setItem(
    KEY(userId),
    JSON.stringify(all.map((s) => (s.id === sightingId ? { ...s, ...patch } : s))),
  );
}
