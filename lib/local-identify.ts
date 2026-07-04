import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import type { TfliteModel } from 'react-native-fast-tflite';

import { CATALOG } from '@/constants/catalog';
import type { IdentifyResult } from '@/lib/identify';

// Our own WildLens classifier (MobileNetV3Small, INT8-quantized, trained over
// the catalog species — see scripts/train_classifier.ipynb). At ~0.6 MB it's
// bundled in the app binary rather than downloaded at runtime.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const MODEL_ASSET = require('../assets/models/species_id.tflite');
// Flat array: output index → catalog species id (see species_labels.json).
const SPECIES_LABELS: string[] = require('../assets/models/species_labels.json');

let cachedModel: TfliteModel | null = null;
let loadAttempted = false;

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

// The classifier is bundled in the binary now (require()'d above), so there's
// nothing left to fetch at runtime. These are kept as no-ops purely so
// ModelInitContext/Profile don't need to change: they immediately report the
// model as present/ready.
export async function isModelDownloaded(): Promise<boolean> {
  return true;
}

export async function downloadModel(
  onProgress?: (fraction: number) => void,
): Promise<void> {
  onProgress?.(1);
}

async function loadModel(): Promise<void> {
  if (loadAttempted) return;
  loadAttempted = true;
  try {
    // Pass [] for CPU delegate — compatible with all models.
    // Switch to ['core-ml'] or ['metal'] if the model supports GPU acceleration.
    cachedModel = await loadTensorflowModel(MODEL_ASSET, []);
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
  if (!cachedModel) return LOCAL_FALLBACK;

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
        // Our own model's output index maps directly to a catalog species id
        // (species_labels.json) — no scientific-name indirection needed.
        const speciesId = SPECIES_LABELS[i];
        if (!speciesId) return [];
        const sp = CATALOG.find((s) => s.id === speciesId);
        if (!sp) return [];
        return [
          {
            speciesId: sp.id,
            commonName: sp.commonName,
            latin: sp.latin,
            kind: sp.kind,
            confidence: Math.round(Math.min(1, score / scale) * 100),
            isOffline: false,
          },
        ];
      });

    return results.length > 0 ? results : LOCAL_FALLBACK;
  } catch {
    return LOCAL_FALLBACK;
  }
}
