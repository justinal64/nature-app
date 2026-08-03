import * as FileSystem from 'expo-file-system/legacy';
import { initLlama, releaseAllLlama, type LlamaContext, type RNLlamaOAICompatibleMessage } from 'llama.rn';

import { CATALOG, getDangerInfo, getEcosystemRole, getSpeciesUses } from '@/constants/catalog';

// Llama 3.2 3B Instruct, Q4_K_M quantized — ~2 GB download, ~2.4 GB RAM on device.
// Swap MODEL_URL for the 1B variant (~770 MB) if you need lower memory usage:
// https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf
const MODEL_URL =
  'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf';
const MODEL_FILENAME = 'Llama-3.2-3B-Instruct-Q4_K_M.gguf';
const MODEL_SIZE_BYTES = 2_147_483_648; // ~2 GB, matches the gguf above

// Require headroom beyond the model's own size: the download writes to a
// temp location before the final file, and users need some free space left
// over afterward for photos/journal entries.
export async function hasEnoughStorageForModel(): Promise<boolean> {
  const free = await FileSystem.getFreeDiskStorageAsync();
  return free > MODEL_SIZE_BYTES * 1.5;
}

export type LlmState =
  | 'not_downloaded'
  | 'downloading'
  | 'loading'
  | 'ready'
  | 'error';

let context: LlamaContext | null = null;
// Which model is currently loaded into `context` — loadModel()/
// loadVisionModel() each need to know this rather than just checking
// `context` is non-null, since the two share the single context slot
// (only one on-device LLM loaded at a time; see unloadModel below).
let loadedVariant: 'text' | 'vision' | null = null;

function modelPath(): string {
  return `${FileSystem.documentDirectory ?? ''}${MODEL_FILENAME}`;
}

export async function getLlmState(): Promise<Omit<LlmState, 'downloading' | 'loading'>> {
  const info = await FileSystem.getInfoAsync(modelPath());
  return info.exists ? 'ready' : 'not_downloaded';
}

export async function downloadModel(
  onProgress: (pct: number) => void,
): Promise<void> {
  const path = modelPath();
  const cb = FileSystem.createDownloadResumable(
    MODEL_URL,
    path,
    {},
    ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
      if (totalBytesExpectedToWrite > 0) {
        onProgress(Math.round((totalBytesWritten / totalBytesExpectedToWrite) * 100));
      }
    },
  );
  await cb.downloadAsync();
}

export async function loadModel(onProgress?: (pct: number) => void): Promise<void> {
  if (context && loadedVariant === 'text') return;
  if (context) await unloadModel();
  context = await initLlama(
    { model: modelPath(), n_ctx: 2048, n_batch: 512, n_threads: 4 },
    onProgress,
  );
  loadedVariant = 'text';
}

export async function unloadModel(): Promise<void> {
  await releaseAllLlama();
  context = null;
  loadedVariant = null;
  multimodalReady = false;
}

// SmolVLM-500M-Instruct (ggml-org) — a small vision-language GGUF model
// built for on-device multimodal via llama.cpp's mtmd support, used only
// for photo-grounded questions (#24). Kept separate from the Llama 3.2 3B
// text-only model above rather than replacing it: swapping the general Q&A
// model for a much smaller VLM would noticeably regress general
// species-knowledge answers, and "general Q&A" vs "what's going on in this
// specific photo" are different enough sessions that only downloading the
// ~520 MB vision model when a user actually asks about a photo (instead of
// always carrying it, or replacing the already-shipped 2 GB text model) is
// the better tradeoff — LLaVA-class 7B models (~4 GB, per the issue's own
// suggestion) would make cold-start/heat/battery on a phone considerably
// worse for not much benefit at this app's scope.
const VISION_MODEL_URL =
  'https://huggingface.co/ggml-org/SmolVLM-500M-Instruct-GGUF/resolve/main/SmolVLM-500M-Instruct-Q8_0.gguf';
const VISION_MODEL_FILENAME = 'SmolVLM-500M-Instruct-Q8_0.gguf';
const VISION_MODEL_SIZE_BYTES = 436_800_000; // ~417 MB

const MMPROJ_URL =
  'https://huggingface.co/ggml-org/SmolVLM-500M-Instruct-GGUF/resolve/main/mmproj-SmolVLM-500M-Instruct-Q8_0.gguf';
const MMPROJ_FILENAME = 'mmproj-SmolVLM-500M-Instruct-Q8_0.gguf';
const MMPROJ_SIZE_BYTES = 108_800_000; // ~104 MB

const VISION_TOTAL_SIZE_BYTES = VISION_MODEL_SIZE_BYTES + MMPROJ_SIZE_BYTES;

export async function hasEnoughStorageForVisionModel(): Promise<boolean> {
  const free = await FileSystem.getFreeDiskStorageAsync();
  return free > VISION_TOTAL_SIZE_BYTES * 1.5;
}

function visionModelPath(): string {
  return `${FileSystem.documentDirectory ?? ''}${VISION_MODEL_FILENAME}`;
}

function mmprojPath(): string {
  return `${FileSystem.documentDirectory ?? ''}${MMPROJ_FILENAME}`;
}

export async function getVisionLlmState(): Promise<Omit<LlmState, 'downloading' | 'loading'>> {
  const [modelInfo, mmprojInfo] = await Promise.all([
    FileSystem.getInfoAsync(visionModelPath()),
    FileSystem.getInfoAsync(mmprojPath()),
  ]);
  return modelInfo.exists && mmprojInfo.exists ? 'ready' : 'not_downloaded';
}

export async function downloadVisionModel(onProgress: (pct: number) => void): Promise<void> {
  let modelWritten = 0;
  let mmprojWritten = 0;
  const report = () => {
    const pct = Math.round(((modelWritten + mmprojWritten) / VISION_TOTAL_SIZE_BYTES) * 100);
    onProgress(Math.min(100, pct));
  };

  const modelCb = FileSystem.createDownloadResumable(
    VISION_MODEL_URL,
    visionModelPath(),
    {},
    ({ totalBytesWritten }) => {
      modelWritten = totalBytesWritten;
      report();
    },
  );
  await modelCb.downloadAsync();

  const mmprojCb = FileSystem.createDownloadResumable(
    MMPROJ_URL,
    mmprojPath(),
    {},
    ({ totalBytesWritten }) => {
      mmprojWritten = totalBytesWritten;
      report();
    },
  );
  await mmprojCb.downloadAsync();
}

let multimodalReady = false;

export async function loadVisionModel(onProgress?: (pct: number) => void): Promise<void> {
  if (context && loadedVariant === 'vision' && multimodalReady) return;
  if (context) await unloadModel();
  context = await initLlama(
    { model: visionModelPath(), n_ctx: 2048, n_batch: 512, n_threads: 4 },
    onProgress,
  );
  loadedVariant = 'vision';
  const ok = await context.initMultimodal({ path: mmprojPath(), use_gpu: true });
  if (!ok) {
    await unloadModel();
    throw new Error('Failed to initialize multimodal support');
  }
  multimodalReady = true;
}

function buildSystemPrompt(speciesId?: string): string {
  const species = speciesId ? CATALOG.find((s) => s.id === speciesId) : null;

  let catalogContext = '';
  if (species) {
    const danger = getDangerInfo(species.id);
    const ecosystem = getEcosystemRole(species.id);
    const uses = getSpeciesUses(species.id);

    catalogContext = `\n\nCurrent species context:
- Common name: ${species.commonName}
- Latin: ${species.latin}`;
    if (species.family) catalogContext += `\n- Family: ${species.family}`;
    if (species.region) catalogContext += `\n- Region: ${species.region}`;
    if (species.description) catalogContext += `\n- Description: ${species.description}`;
    if (species.didYouKnow) catalogContext += `\n- Did you know: ${species.didYouKnow}`;
    if (species.idTips?.length) catalogContext += `\n- ID tips: ${species.idTips.join('; ')}`;

    if (danger) {
      catalogContext += `\n- DANGER LEVEL: ${danger.level.toUpperCase()} — ${danger.summary}`;
      if (danger.firstAid) catalogContext += `\n- First aid: ${danger.firstAid}`;
    }
    if (ecosystem) {
      catalogContext += `\n- Ecosystem role: ${ecosystem}`;
    }
    if (uses?.length) {
      catalogContext += `\n- Human uses: ${uses.map((u) => `[${u.category}] ${u.description}`).join(' | ')}`;
    }
  }

  const safetyNote = speciesId && getDangerInfo(speciesId)
    ? ' This species is dangerous — always lead your answer with the safety information when the user asks if it is safe or what to do if encountered.'
    : '';

  return `You are a knowledgeable desert nature guide for the WildLens app. You help users identify and learn about desert plants and animals in the Sonoran, Mojave, Chihuahuan, and Great Basin deserts.

Answer questions concisely and accurately. Focus on identification, behavior, ecology, and safety. Keep responses to 2–4 sentences unless more detail is genuinely needed.${safetyNote}${catalogContext}`;
}

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export async function chat(
  messages: ChatMessage[],
  speciesId: string | undefined,
  onToken: (token: string) => void,
): Promise<string> {
  if (!context) throw new Error('Model not loaded');

  const oaiMessages: RNLlamaOAICompatibleMessage[] = [
    { role: 'system', content: buildSystemPrompt(speciesId) },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  let full = '';
  const result = await context.completion(
    { messages: oaiMessages, n_predict: 512, temperature: 0.7, top_p: 0.9 },
    (data) => {
      onToken(data.token);
      full += data.token;
    },
  );

  return result.text ?? full;
}

// Same shape as chat() but grounds the answer in an actual photo — for
// "why does this one look different," visible injuries, unusual color
// morphs, etc. Requires loadVisionModel() to have run first. The image is
// attached fresh to the latest user turn on every call (not just the
// first) rather than relying on the native context to remember it across
// calls, since this app always reconstructs the full message array per
// completion() call — simpler and correct, at the cost of re-encoding the
// image each turn (SmolVLM-500M is small enough this stays fast).
export async function chatWithImage(
  messages: ChatMessage[],
  speciesId: string | undefined,
  imageUri: string,
  onToken: (token: string) => void,
): Promise<string> {
  if (!context || !multimodalReady) throw new Error('Vision model not loaded');

  const priorMessages = messages.slice(0, -1);
  const lastUser = messages[messages.length - 1];

  const oaiMessages: RNLlamaOAICompatibleMessage[] = [
    { role: 'system', content: buildSystemPrompt(speciesId) },
    ...priorMessages.map((m) => ({ role: m.role, content: m.content })),
    {
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: imageUri } },
        { type: 'text', text: lastUser?.content ?? '' },
      ],
    },
  ];

  let full = '';
  const result = await context.completion(
    { messages: oaiMessages, n_predict: 512, temperature: 0.7, top_p: 0.9 },
    (data) => {
      onToken(data.token);
      full += data.token;
    },
  );

  return result.text ?? full;
}
