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
  photoUri?: string;    // legacy: single photo (still read for backward compat)
  photoUris?: string[]; // new: ordered photo array; use this going forward
  capturedAt: string; // ISO 8601
  observationType?: ObservationType;
  notes?: string;
  location?: { lat: number; lng: number };
  locationObscured?: boolean; // true when GPS snapped to ~0.2° grid for sensitive species
  // iNaturalist-style annotations
  sex?: Sex;
  lifeStage?: LifeStage;
  activity?: Activity;   // animals only
  phenology?: Phenology; // plants only
  dataQualityFlags?: DataQualityFlags;
};

// Species whose GPS location is automatically obscured to a ~0.2° grid (~22 km)
// to protect sensitive populations from targeted collection or disturbance.
const SENSITIVE_SPECIES = new Set([
  'saguaro',           // protected under AZ law; illegal to relocate without permit
  'organ-pipe',        // Organ Pipe Cactus National Monument core species
  'desert-tortoise',   // VU; collection from wild is federally protected
  'mohave-ground-squirrel', // VU; Mojave Desert only
  'monarch-butterfly', // EN; roost site disclosure can attract disturbance
  'aplomado-falcon',   // endangered raptor; nest site secrecy is critical
  'joshua-tree',       // EN (western); legally protected in California
  'sonoran-coral-snake', // rare; endemic range makes specific sites sensitive
  'colorado-river-toad', // collected for venom; location disclosure harmful
  'burrowing-owl',     // population declining; nest colony sites sensitive
  'golden-eagle',      // nest sites protected under BGEPA
  'ferruginous-hawk',  // declining; nest sites sensitive
]);

// Snaps coordinates to a 0.2° grid, matching iNaturalist's obscuring algorithm.
// The result is the SW corner of the 0.2° cell — precise to ~22 km.
export function obscureLocation(loc: { lat: number; lng: number }): { lat: number; lng: number } {
  const GRID = 0.2;
  return {
    lat: Math.floor(loc.lat / GRID) * GRID,
    lng: Math.floor(loc.lng / GRID) * GRID,
  };
}

export function isSensitiveSpecies(speciesId: string): boolean {
  return SENSITIVE_SPECIES.has(speciesId);
}

export type DataQualityFlags = {
  evidencePresent?: boolean;   // photo/sound clearly shows the organism
  dateAccurate?: boolean;      // date was set intentionally, not auto-now
  locationAccurate?: boolean;  // GPS position was confirmed correct
  wildOrganism?: boolean;      // wild, not captive/cultivated/planted
};

export type QualityGrade = 'casual' | 'needs_id' | 'research';

// Mirrors iNaturalist's quality grade system, adapted for single-user offline use:
// - casual: no GPS location recorded (can't place the observation)
// - needs_id: location present but no photo attached
// - research: location + photo = strongest evidence a solo observer can provide
export function getQualityGrade(s: Pick<Sighting, 'location' | 'photoUri' | 'photoUris'>): QualityGrade {
  if (!s.location) return 'casual';
  const hasPhoto = (s.photoUris?.length ?? 0) > 0 || !!s.photoUri;
  if (!hasPhoto) return 'needs_id';
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
  let { location, ...rest } = sighting;
  let locationObscured = false;
  if (location && isSensitiveSpecies(sighting.speciesId)) {
    location = obscureLocation(location);
    locationObscured = true;
  }
  const record: Sighting = { ...rest, location, locationObscured: locationObscured || undefined, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` };
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
  patch: Partial<Pick<Sighting, 'notes' | 'sex' | 'lifeStage' | 'activity' | 'phenology' | 'photoUris' | 'dataQualityFlags'>>,
): Promise<void> {
  const all = await getSightings(userId);
  await AsyncStorage.setItem(
    KEY(userId),
    JSON.stringify(all.map((s) => (s.id === sightingId ? { ...s, ...patch } : s))),
  );
}
