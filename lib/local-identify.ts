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

// Source: https://github.com/inaturalist/model-files (release v25.01.15).
// The vision model outputs a 507-class vector indexed by `leaf_class_id`;
// taxonomy.json maps each leaf_class_id to a scientific name.
const MODEL_RELEASE = 'v25.01.15';
const MODEL_BASE = `https://github.com/inaturalist/model-files/releases/download/${MODEL_RELEASE}`;
export const MODEL_DOWNLOAD_URL = `${MODEL_BASE}/INatVision_Small_2_fact256_8bit.tflite`;
export const TAXONOMY_DOWNLOAD_URL = `${MODEL_BASE}/taxonomy.json`;

let cachedModel: TfliteModel | null = null;
let loadAttempted = false;
let downloadInProgress = false;
// Indexed by leaf_class_id → scientific name (the model's output vector order).
let leafNames: string[] = [];

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
  if (downloadInProgress) return;
  downloadInProgress = true;
  try {
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
  } finally {
    downloadInProgress = false;
  }
}

type TaxonRow = { leaf_class_id: number | null; name: string };

async function loadModel(): Promise<void> {
  if (loadAttempted) return;
  loadAttempted = true;
  try {
    const info = await FileSystem.getInfoAsync(MODEL_FILE);
    if (!info.exists) return;
    // Pass [] for CPU delegate — compatible with all models.
    // Switch to ['core-ml'] or ['metal'] if the model supports GPU acceleration.
    cachedModel = await loadTensorflowModel({ url: MODEL_FILE }, []);

    // taxonomy.json is an array of taxon rows. Only leaf taxa carry a
    // leaf_class_id, which is the index into the model's output vector.
    const raw = await FileSystem.readAsStringAsync(TAXONOMY_FILE);
    const rows = JSON.parse(raw) as TaxonRow[];
    const names: string[] = [];
    for (const row of rows) {
      if (row.leaf_class_id != null) names[row.leaf_class_id] = row.name;
    }
    leafNames = names;
  } catch {
    cachedModel = null;
  }
}

// base64 → bytes without Node's Buffer (undefined in Hermes). See issue #21.
function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function identifyFromPhoto(photoUri: string): Promise<IdentifyResult[]> {
  await loadModel();
  if (!cachedModel || leafNames.length === 0) return LOCAL_FALLBACK;

  try {
    // Derive the expected input size/type from the model rather than
    // hardcoding — the iNat models have changed input dims across releases.
    const inputSpec = cachedModel.inputs[0];
    const shape = inputSpec.shape; // typically [1, H, W, 3]
    const h = shape.length >= 3 ? shape[shape.length - 3] : 224;
    const w = shape.length >= 3 ? shape[shape.length - 2] : 224;
    const wantsUint8 = inputSpec.dataType === 'uint8';

    const resized = await manipulateAsync(
      photoUri,
      [{ resize: { width: w, height: h } }],
      { format: SaveFormat.JPEG, base64: true },
    );
    if (!resized.base64) return LOCAL_FALLBACK;

    const { data, width, height } = jpeg.decode(base64ToBytes(resized.base64), {
      useTArray: true,
    });
    const pixels = width * height;

    // RGBA → model input tensor (drop alpha). Quantized models take raw uint8
    // bytes; float models take RGB normalized to [0, 1].
    let inputBuffer: ArrayBuffer;
    if (wantsUint8) {
      const buf = new Uint8Array(pixels * 3);
      for (let i = 0; i < pixels; i++) {
        buf[i * 3] = data[i * 4];
        buf[i * 3 + 1] = data[i * 4 + 1];
        buf[i * 3 + 2] = data[i * 4 + 2];
      }
      inputBuffer = buf.buffer;
    } else {
      const buf = new Float32Array(pixels * 3);
      for (let i = 0; i < pixels; i++) {
        buf[i * 3] = data[i * 4] / 255;
        buf[i * 3 + 1] = data[i * 4 + 1] / 255;
        buf[i * 3 + 2] = data[i * 4 + 2] / 255;
      }
      inputBuffer = buf.buffer;
    }

    const [outputBuffer] = await cachedModel.run([inputBuffer]);
    const outSpec = cachedModel.outputs[0];
    const scores =
      outSpec.dataType === 'uint8'
        ? new Uint8Array(outputBuffer)
        : new Float32Array(outputBuffer);
    // Normalize to a 0-1 confidence for display. For a quantized (uint8)
    // output this is an approximation of the softmax probability.
    const scale = outSpec.dataType === 'uint8' ? 255 : 1;

    const results: IdentifyResult[] = Array.from(scores)
      .map((score, i) => ({ score, i }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .flatMap(({ score, i }) => {
        const latin = leafNames[i];
        if (!latin) return [];
        const sp = CATALOG.find((s) => s.latin.toLowerCase() === latin.toLowerCase());
        if (!sp) return [];
        return [
          {
            speciesId: sp.id,
            commonName: sp.commonName,
            latin: sp.latin,
            kind: sp.kind,
            confidence: Math.round(Math.min(1, score / scale) * 100),
            isOffline: true,
          },
        ];
      });

    return results.length > 0 ? results : LOCAL_FALLBACK;
  } catch {
    return LOCAL_FALLBACK;
  }
}
