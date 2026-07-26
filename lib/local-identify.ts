import * as Location from 'expo-location';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import type { TfliteModel } from 'react-native-fast-tflite';

import { CATALOG, getRegionForCoords } from '@/constants/catalog';
import type { IdentifyResult } from '@/lib/identify';

// WildLens ships two regional classifiers (MobileNetV3Small, INT8-quantized,
// each trained over that region's catalog species — see
// scripts/train_classifier.ipynb). Both are small enough (well under 1 MB
// each) to bundle directly in the app binary rather than downloaded at
// runtime. Southwest (SW) covers the original Sonoran/Mojave/Chihuahuan/Great
// Basin catalog; Southeast (SE) is the newer regional pack. Which one runs is
// picked at identify-time by the user's location (see detectModelVariant
// below) — this mirrors how Merlin ships regional bird packs.
type ModelVariant = 'SW' | 'SE';

const MODEL_ASSETS: Record<ModelVariant, number> = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SW: require('../assets/models/species_id_sw.tflite'),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  SE: require('../assets/models/species_id_se.tflite'),
};
// Flat arrays: output index → catalog species id (see species_labels_*.json).
const SPECIES_LABELS: Record<ModelVariant, string[]> = {
  SW: require('../assets/models/species_labels_sw.json'),
  SE: require('../assets/models/species_labels_se.json'),
};

const cachedModels: Partial<Record<ModelVariant, TfliteModel | null>> = {};
const loadAttempted: Partial<Record<ModelVariant, boolean>> = {};

const LOCAL_FALLBACK_IDS: Record<ModelVariant, readonly string[]> = {
  SW: ['saguaro', 'gambels-quail', 'gopher-snake', 'gila-woodpecker', 'desert-tarantula'],
  SE: ['cardinal', 'carolina-wren', 'american-bald-eagle', 'copperhead', 'eastern-cottontail'],
};

function localFallback(variant: ModelVariant): IdentifyResult[] {
  return LOCAL_FALLBACK_IDS[variant].flatMap((id) => {
    const sp = CATALOG.find((s) => s.id === id);
    if (!sp) return [];
    return [
      {
        speciesId: sp.id,
        commonName: sp.commonName,
        latin: sp.latin,
        kind: sp.kind,
        confidence: 0,
        isOffline: true,
      },
    ];
  });
}

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

// Picks SW vs SE without prompting for location permission — if it hasn't
// already been granted elsewhere in the app (e.g. the guide screen's "Near
// me" filter), we just fall back to SW rather than interrupt the identify
// flow with a permission dialog. A cached/last-known fix is used so this
// never blocks on a fresh GPS request.
async function detectModelVariant(): Promise<ModelVariant> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return 'SW';
    const pos =
      (await Location.getLastKnownPositionAsync()) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    if (!pos) return 'SW';
    const region = getRegionForCoords(pos.coords.latitude, pos.coords.longitude);
    return region === 'SOUTHEAST' ? 'SE' : 'SW';
  } catch {
    return 'SW';
  }
}

async function loadModel(variant: ModelVariant): Promise<TfliteModel | null> {
  if (loadAttempted[variant]) return cachedModels[variant] ?? null;
  loadAttempted[variant] = true;
  try {
    // Pass [] for CPU delegate — compatible with all models.
    // Switch to ['core-ml'] or ['metal'] if the model supports GPU acceleration.
    cachedModels[variant] = await loadTensorflowModel(MODEL_ASSETS[variant], []);
  } catch {
    cachedModels[variant] = null;
  }
  return cachedModels[variant] ?? null;
}

// base64 → bytes without Node's Buffer (undefined in Hermes). See issue #21.
function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function identifyFromPhoto(photoUri: string): Promise<IdentifyResult[]> {
  const variant = await detectModelVariant();
  const model = await loadModel(variant);
  const fallback = localFallback(variant);
  if (!model) return fallback;

  try {
    // Derive the expected input size/type from the model rather than
    // hardcoding — the iNat models have changed input dims across releases.
    const inputSpec = model.inputs[0];
    const shape = inputSpec.shape; // typically [1, H, W, 3]
    const h = shape.length >= 3 ? shape[shape.length - 3] : 224;
    const w = shape.length >= 3 ? shape[shape.length - 2] : 224;
    const wantsUint8 = inputSpec.dataType === 'uint8';

    const resized = await manipulateAsync(
      photoUri,
      [{ resize: { width: w, height: h } }],
      { format: SaveFormat.JPEG, base64: true },
    );
    if (!resized.base64) return fallback;

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

    const [outputBuffer] = await model.run([inputBuffer]);
    const outSpec = model.outputs[0];
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
        // (species_labels_*.json) — no scientific-name indirection needed.
        const speciesId = SPECIES_LABELS[variant][i];
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

    return results.length > 0 ? results : fallback;
  } catch {
    return fallback;
  }
}
