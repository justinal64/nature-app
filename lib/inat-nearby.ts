import { isSensitiveSpecies } from '@/lib/sightings';
import { hasNetwork } from '@/lib/network';

const TIMEOUT_MS = 6000;
export const RADIUS_KM = 50;

export type NearbyObservation = {
  id: number;
  observedOn: string | null; // ISO date, may be null if unspecified
  observerName: string;
  qualityGrade: string;
  uri: string;
};

type InatObservation = {
  id: number;
  observed_on: string | null;
  quality_grade: string;
  user?: { login?: string; name?: string };
  uri: string;
};

// Recent real iNaturalist observations of this species near the given
// coordinates — pure additive online enrichment, never blocking. Callers
// must treat an empty array as "don't render anything," not an error state.
export async function getNearbyObservations(
  latinName: string,
  coords: { lat: number; lng: number },
  speciesId?: string,
): Promise<NearbyObservation[]> {
  // Never send real coordinates for sensitive species, even to a read-only
  // public API — same rule the app already applies to obscuring locally
  // logged sightings (lib/sightings.ts).
  if (speciesId && isSensitiveSpecies(speciesId)) return [];
  if (!(await hasNetwork())) return [];

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const params = new URLSearchParams({
      lat: String(coords.lat),
      lng: String(coords.lng),
      radius: String(RADIUS_KM),
      taxon_name: latinName,
      per_page: '5',
      order_by: 'observed_on',
      photos: 'true',
    });

    const res = await fetch(`https://api.inaturalist.org/v1/observations?${params}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return [];

    const json: { results: InatObservation[] } = await res.json();
    return json.results.map((o) => ({
      id: o.id,
      observedOn: o.observed_on,
      observerName: o.user?.name || o.user?.login || 'iNaturalist user',
      qualityGrade: o.quality_grade,
      uri: o.uri,
    }));
  } catch {
    return [];
  }
}
