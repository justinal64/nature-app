import * as FileSystem from 'expo-file-system/legacy';

import type { Species } from '@/constants/catalog';
import { hasNetwork } from '@/lib/network';

export type ReferenceAudioResult = {
  localUri: string;
  recordist: string;
  license: string;
  sourceUrl: string;
};

const CACHE_DIR = `${FileSystem.cacheDirectory ?? ''}species-audio/`;

// Reference clips only make sense for species that actually vocalize in a
// field-guide-recognizable way — matches issue #44's scope (birds primarily,
// some insects), not the whole catalog.
export function speciesHasReferenceAudio(species: Species): boolean {
  return species.kind === 'bird' || species.kind === 'insect';
}

async function ensureCacheDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

// xeno-canto API v3 requires a free per-account API key (v2, which didn't,
// was shut down). See https://xeno-canto.org/explore/api — register an
// account, verify the email, grab the key from the account page, and set it
// as EXPO_PUBLIC_XENO_CANTO_API_KEY (see .env.example). Without a key this
// feature just always reports "unavailable" — same as being offline — it
// never breaks anything else.
type XenoCantoRecording = {
  id: string;
  rec: string; // recordist name
  lic: string; // license URL, protocol-relative
  file: string; // direct audio file URL, protocol-relative
  length: string; // "0:07"
  q: string; // quality rating A (best) through E
};

function parseLengthSeconds(length: string): number {
  const [m, s] = length.split(':').map(Number);
  return (m || 0) * 60 + (s || 0);
}

function withHttps(url: string): string {
  return url.startsWith('//') ? `https:${url}` : url;
}

// Downloads (and caches to disk) a single short reference recording for a
// species from xeno-canto. This is deliberately lazy/on-demand — called only
// when the user taps play on the species detail page, never on page load —
// so it never becomes a network dependency in the guide/identify hot path.
// Once cached, subsequent plays for the same species are fully offline.
export async function fetchReferenceAudio(species: Species): Promise<ReferenceAudioResult | null> {
  await ensureCacheDir();
  const audioPath = `${CACHE_DIR}${species.id}.mp3`;
  const metaPath = `${CACHE_DIR}${species.id}.json`;

  const cached = await FileSystem.getInfoAsync(audioPath);
  if (cached.exists) {
    const metaRaw = await FileSystem.readAsStringAsync(metaPath).catch(() => null);
    if (metaRaw) {
      const meta = JSON.parse(metaRaw) as Omit<ReferenceAudioResult, 'localUri'>;
      return { ...meta, localUri: audioPath };
    }
  }

  const apiKey = process.env.EXPO_PUBLIC_XENO_CANTO_API_KEY;
  if (!apiKey) return null;
  if (!(await hasNetwork())) return null;

  const [genus, ...rest] = species.latin.split(' ');
  const epithet = rest.join(' ');
  const query = encodeURIComponent(`gen:${genus} sp:${epithet}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`https://xeno-canto.org/api/3/recordings?query=${query}&key=${apiKey}`, {
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { recordings?: XenoCantoRecording[] };
    const recordings = json.recordings ?? [];
    if (recordings.length === 0) return null;

    // Prefer well-rated, short clips — a quick field-guide-style preview,
    // not a full-length archival recording.
    const rated = recordings.filter((r) => r.q === 'A' || r.q === 'B');
    const pool = rated.length > 0 ? rated : recordings;
    const inRange = pool
      .filter((r) => {
        const secs = parseLengthSeconds(r.length);
        return secs >= 2 && secs <= 30;
      })
      .sort((a, b) => parseLengthSeconds(a.length) - parseLengthSeconds(b.length));
    const pick = inRange[0] ?? pool[0];
    if (!pick?.file) return null;

    const download = await FileSystem.downloadAsync(withHttps(pick.file), audioPath);
    if (download.status !== 200) return null;

    const meta: Omit<ReferenceAudioResult, 'localUri'> = {
      recordist: pick.rec || 'Unknown',
      license: withHttps(pick.lic),
      sourceUrl: `https://xeno-canto.org/${pick.id}`,
    };
    await FileSystem.writeAsStringAsync(metaPath, JSON.stringify(meta));
    return { ...meta, localUri: audioPath };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
