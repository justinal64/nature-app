import * as Network from 'expo-network';

import { CATALOG } from '@/constants/catalog';
import type { Species } from '@/constants/catalog';
import { identifyFromPhoto } from '@/lib/local-identify';

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

// iNaturalist's score_image endpoint requires an authenticated JWT. Supplied
// via env var until the on-device model replaces this path (see the Obsidian
// note "decision-identification-online-api"). Tokens are short-lived (~24h).
const INAT_API_TOKEN = process.env.EXPO_PUBLIC_INATURALIST_API_TOKEN ?? '';

async function hasNetwork(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    return Boolean(state.isConnected && state.isInternetReachable !== false);
  } catch {
    return true; // if we can't tell, let the request attempt and fail fast
  }
}

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

export type IdentifyOptions = { coords?: { lat: number; lng: number } | null };

export async function identifySpecies(
  imageUri: string,
  options: IdentifyOptions = {},
): Promise<IdentifyResult[]> {
  // No token or no network → skip the online round-trip and use on-device.
  if (!INAT_API_TOKEN || !(await hasNetwork())) {
    return identifyFromPhoto(imageUri);
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const body = new FormData();
    // iNat expects the file under the `image` field, not `file`.
    body.append('image', {
      uri: imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);
    if (options.coords) {
      body.append('lat', String(options.coords.lat));
      body.append('lng', String(options.coords.lng));
    }

    const res = await fetch(INAT_CV_URL, {
      method: 'POST',
      headers: { Authorization: INAT_API_TOKEN },
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
        confidence: Math.min(100, Math.round(r.combined_score)),
        isOffline: false,
      };
    });

    return mapped.length > 0 ? mapped : identifyFromPhoto(imageUri);
  } catch {
    return identifyFromPhoto(imageUri);
  }
}
