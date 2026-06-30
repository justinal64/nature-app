import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import type { TfliteModel } from 'react-native-fast-tflite';

import { CATALOG } from '@/constants/catalog';
import type { IdentifyResult } from '@/lib/identify';

const DOC_DIR = FileSystem.documentDirectory ?? '';
const MODELS_DIR = `${DOC_DIR}wildlens-models/`;
const MODEL_FILE = `${MODELS_DIR}species_id.tflite`;
const TAXONOMY_FILE = `${MODELS_DIR}taxonomy.json`;

// Source: https://github.com/inaturalist/model-files
// After downloading, place files at MODEL_FILE / TAXONOMY_FILE on-device.
export const MODEL_DOWNLOAD_URL =
  'https://github.com/inaturalist/model-files/releases/latest/download/small_inception_tf1.tflite';
export const TAXONOMY_DOWNLOAD_URL =
  'https://github.com/inaturalist/model-files/releases/latest/download/taxonomy.json';

let cachedModel: TfliteModel | null = null;
let loadAttempted = false;
let taxonomy: string[] = [];

const LOCAL_FALLBACK: IdentifyResult[] = (
  ['saguaro', 'gambels-quail', 'gopher-snake', 'gila-woodpecker', 'desert-tarantula'] as const
).map((id) => {
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

export async function isModelDownloaded(): Promise<boolean> {
  const info = await FileSystem.getInfoAsync(MODEL_FILE);
  return info.exists;
}

export async function downloadModel(
  onProgress?: (fraction: number) => void,
): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(MODELS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MODELS_DIR, { intermediates: true });
  }

  const dl = FileSystem.createDownloadResumable(
    MODEL_DOWNLOAD_URL,
    MODEL_FILE,
    {},
    (prog) => onProgress?.(prog.totalBytesWritten / prog.totalBytesExpectedToWrite),
  );
  await dl.downloadAsync();
  await FileSystem.downloadAsync(TAXONOMY_DOWNLOAD_URL, TAXONOMY_FILE);

  // Force reload on next inference call
  cachedModel = null;
  loadAttempted = false;
}

async function loadModel(): Promise<void> {
  if (loadAttempted) return;
  loadAttempted = true;
  try {
    const info = await FileSystem.getInfoAsync(MODEL_FILE);
    if (!info.exists) return;
    // Pass [] for CPU delegate — compatible with all models.
    // Switch to ['core-ml'] or ['metal'] if your model supports GPU acceleration.
    cachedModel = await loadTensorflowModel({ url: MODEL_FILE }, []);
    const raw = await FileSystem.readAsStringAsync(TAXONOMY_FILE);
    const parsed = JSON.parse(raw) as unknown;
    // Accept string[] (array of scientific names) or { labels: string[] }
    taxonomy = Array.isArray(parsed)
      ? (parsed as string[])
      : ((parsed as { labels: string[] }).labels ?? []);
  } catch {
    cachedModel = null;
  }
}

export async function identifyFromPhoto(photoUri: string): Promise<IdentifyResult[]> {
  await loadModel();
  if (!cachedModel || taxonomy.length === 0) return LOCAL_FALLBACK;

  try {
    // Resize to 224×224, get base64 JPEG
    const resized = await manipulateAsync(
      photoUri,
      [{ resize: { width: 224, height: 224 } }],
      { format: SaveFormat.JPEG, base64: true },
    );
    if (!resized.base64) return LOCAL_FALLBACK;

    // JPEG bytes → RGBA Uint8Array
    const buf = Buffer.from(resized.base64, 'base64');
    const { data, width, height } = jpeg.decode(buf, { useTArray: true });

    // RGBA → Float32 RGB normalized to [0, 1]
    const pixels = width * height;
    const input = new Float32Array(pixels * 3);
    for (let i = 0; i < pixels; i++) {
      input[i * 3]     = data[i * 4]     / 255;
      input[i * 3 + 1] = data[i * 4 + 1] / 255;
      input[i * 3 + 2] = data[i * 4 + 2] / 255;
    }

    // Run TFLite inference (input.buffer is the underlying ArrayBuffer)
    const [outputBuffer] = await cachedModel.run([input.buffer]);
    const scores = new Float32Array(outputBuffer);

    // Map top-10 predictions to catalog entries by scientific name
    const results: IdentifyResult[] = Array.from(scores)
      .map((score, i) => ({ score, i }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .flatMap(({ score, i }) => {
        const latin = taxonomy[i];
        if (!latin) return [];
        const sp = CATALOG.find((s) => s.latin.toLowerCase() === latin.toLowerCase());
        if (!sp) return [];
        return [
          {
            speciesId: sp.id,
            commonName: sp.commonName,
            latin: sp.latin,
            kind: sp.kind,
            confidence: Math.round(score * 100),
            isOffline: true,
          },
        ];
      });

    return results.length > 0 ? results : LOCAL_FALLBACK;
  } catch {
    return LOCAL_FALLBACK;
  }
}
