import { Audio } from 'expo-av';

import { CATALOG } from '@/constants/catalog';
import { isActiveNow } from '@/constants/catalog';
import type { Species } from '@/constants/catalog';

export type SoundIdResult = {
  species: Species;
  confidence: number;
  isOffline: boolean;
};

let recording: Audio.Recording | null = null;

export async function requestMicrophonePermission(): Promise<boolean> {
  const { status } = await Audio.requestPermissionsAsync();
  return status === 'granted';
}

export async function startRecording(): Promise<void> {
  await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
  const { recording: rec } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY,
  );
  recording = rec;
}

export async function stopRecording(): Promise<string | null> {
  if (!recording) return null;
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  recording = null;
  await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
  return uri ?? null;
}

// Calls the BirdNET Analyzer API when online.
// Returns null on network failure so callers fall back to offline mode.
async function callBirdNetApi(audioUri: string): Promise<SoundIdResult[] | null> {
  try {
    const body = new FormData();
    body.append('soundfile', { uri: audioUri, name: 'recording.m4a', type: 'audio/m4a' } as never);
    body.append('lat', '32.2');
    body.append('lon', '-110.9');
    body.append('week', String(Math.ceil((new Date().getMonth() + 1) * 4.33)));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch('https://birdnet.cornell.edu/api/v2/analyze', {
      method: 'POST',
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const json = await res.json() as { results?: { scientific_name: string; common_name: string; confidence: number }[] };
    if (!json.results) return null;

    return json.results.slice(0, 5).map((r) => {
      const match = CATALOG.find(
        (s) =>
          s.kind === 'bird' &&
          (s.latin.toLowerCase() === r.scientific_name.toLowerCase() ||
            s.commonName.toLowerCase() === r.common_name.toLowerCase()),
      );
      return {
        species: match ?? {
          id: r.scientific_name.toLowerCase().replace(/\s+/g, '-'),
          commonName: r.common_name,
          latin: r.scientific_name,
          family: 'Bird',
          kind: 'bird' as const,
          region: 'SONORAN' as const,
          description: '',
          didYouKnow: '',
          idTips: [],
          stats: [],
        },
        confidence: Math.round(r.confidence * 100),
        isOffline: false,
      };
    });
  } catch {
    return null;
  }
}

// Offline fallback: returns seasonal bird catalog entries as candidates.
function offlineBirdCandidates(): SoundIdResult[] {
  return CATALOG.filter((s) => s.kind === 'bird' && isActiveNow(s.id)).map((s) => ({
    species: s,
    confidence: 0,
    isOffline: true,
  }));
}

export async function identifyBirdSound(audioUri: string): Promise<SoundIdResult[]> {
  const apiResults = await callBirdNetApi(audioUri);
  if (apiResults && apiResults.length > 0) return apiResults;
  return offlineBirdCandidates();
}
