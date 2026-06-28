import { CATALOG } from '@/constants/catalog';
import type { Species } from '@/constants/catalog';

export type IdentifyResult = {
  speciesId: string | null;
  commonName: string;
  latin: string;
  kind: Species['kind'];
  confidence: number; // 0-100
  isOffline: boolean;
};

const INAT_CV_URL = 'https://api.inaturalist.org/v1/computervision/score_image';
const TIMEOUT_MS = 8000;

const byLatin = new Map(CATALOG.map((s) => [s.latin.toLowerCase(), s]));
const byName = new Map(CATALOG.map((s) => [s.commonName.toLowerCase(), s]));

function findInCatalog(latin: string, common?: string): Species | undefined {
  return byLatin.get(latin.toLowerCase()) ?? (common ? byName.get(common.toLowerCase()) : undefined);
}

function iconicTaxonToKind(iconicTaxon?: string): Species['kind'] {
  if (!iconicTaxon) return 'cactus';
  const t = iconicTaxon.toLowerCase();
  if (t === 'aves') return 'bird';
  if (t === 'insecta' || t === 'arachnida') return 'insect';
  if (t === 'reptilia') return 'snake';
  return 'cactus';
}

// Shown when network is unavailable — common Sonoran Desert species
export const OFFLINE_FALLBACK: IdentifyResult[] = [
  'saguaro',
  'gambels-quail',
  'gopher-snake',
  'gila-woodpecker',
  'desert-tarantula',
].map((id) => {
  const sp = CATALOG.find((s) => s.id === id)!;
  return {
    speciesId: sp.id,
    commonName: sp.commonName,
    latin: sp.latin,
    kind: sp.kind,
    confidence: 0,
    isOffline: true,
  };
});

type InatTaxon = {
  name: string;
  preferred_common_name?: string;
  iconic_taxon_name?: string;
};

type InatApiResult = {
  combined_score: number;
  taxon: InatTaxon;
};

export async function identifySpecies(imageUri: string): Promise<IdentifyResult[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const body = new FormData();
    body.append('file', {
      uri: imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);

    const res = await fetch(INAT_CV_URL, {
      method: 'POST',
      body,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`iNat ${res.status}`);

    const json: { results: InatApiResult[] } = await res.json();
    const mapped = json.results.slice(0, 8).map((r) => {
      const sp = findInCatalog(r.taxon.name, r.taxon.preferred_common_name);
      return {
        speciesId: sp?.id ?? null,
        commonName: sp?.commonName ?? r.taxon.preferred_common_name ?? r.taxon.name,
        latin: sp?.latin ?? r.taxon.name,
        kind: sp?.kind ?? iconicTaxonToKind(r.taxon.iconic_taxon_name),
        confidence: Math.round(r.combined_score * 100),
        isOffline: false,
      };
    });

    return mapped.length > 0 ? mapped : OFFLINE_FALLBACK;
  } catch {
    return OFFLINE_FALLBACK;
  }
}
