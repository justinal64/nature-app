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

export type Sex = 'male' | 'female';
export type LifeStage = 'egg' | 'larva' | 'juvenile' | 'adult';
export type Activity = 'feeding' | 'perching' | 'flying' | 'nesting' | 'basking' | 'calling';
export type Phenology = 'vegetative' | 'flowering' | 'fruiting' | 'senescent';

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
  // iNaturalist-style annotations
  sex?: Sex;
  lifeStage?: LifeStage;
  activity?: Activity;   // animals only
  phenology?: Phenology; // plants only
};

export type QualityGrade = 'casual' | 'needs_id' | 'research';

// Mirrors iNaturalist's quality grade system, adapted for single-user offline use:
// - casual: no GPS location recorded (can't place the observation)
// - needs_id: location present but no photo attached
// - research: location + photo = strongest evidence a solo observer can provide
export function getQualityGrade(s: Pick<Sighting, 'location' | 'photoUri'>): QualityGrade {
  if (!s.location) return 'casual';
  if (!s.photoUri) return 'needs_id';
  return 'research';
}

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

// Returns an existing sighting if one with the same speciesId was logged within
// windowMs (default 24 h) at roughly the same location (within ~2 km if both
// have GPS, or same day/species if neither has GPS).
const DEG_PER_2KM = 0.018; // ~2 km
export async function findDuplicateSighting(
  userId: string,
  speciesId: string,
  capturedAt: Date,
  location?: { lat: number; lng: number },
  windowMs = 24 * 60 * 60 * 1000,
): Promise<Sighting | undefined> {
  const all = await getSightings(userId);
  return all.find((s) => {
    if (s.speciesId !== speciesId) return false;
    if (Math.abs(new Date(s.capturedAt).getTime() - capturedAt.getTime()) > windowMs) return false;
    if (location && s.location) {
      const dLat = Math.abs(s.location.lat - location.lat);
      const dLng = Math.abs(s.location.lng - location.lng);
      return dLat < DEG_PER_2KM && dLng < DEG_PER_2KM;
    }
    return true;
  });
}

export async function deleteSighting(userId: string, sightingId: string): Promise<void> {
  const all = await getSightings(userId);
  await AsyncStorage.setItem(KEY(userId), JSON.stringify(all.filter((s) => s.id !== sightingId)));
}

export async function updateSighting(
  userId: string,
  sightingId: string,
  patch: Partial<Pick<Sighting, 'notes' | 'sex' | 'lifeStage' | 'activity' | 'phenology'>>,
): Promise<void> {
  const all = await getSightings(userId);
  await AsyncStorage.setItem(
    KEY(userId),
    JSON.stringify(all.map((s) => (s.id === sightingId ? { ...s, ...patch } : s))),
  );
}
