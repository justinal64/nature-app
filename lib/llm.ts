import * as FileSystem from 'expo-file-system/legacy';
import { initLlama, releaseAllLlama, type LlamaContext, type RNLlamaOAICompatibleMessage } from 'llama.rn';

import { CATALOG } from '@/constants/catalog';

// Llama 3.2 3B Instruct, Q4_K_M quantized — ~2 GB download, ~2.4 GB RAM on device.
// Swap MODEL_URL for the 1B variant (~770 MB) if you need lower memory usage:
// https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf
const MODEL_URL =
  'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf';
const MODEL_FILENAME = 'Llama-3.2-3B-Instruct-Q4_K_M.gguf';

export type LlmState =
  | 'not_downloaded'
  | 'downloading'
  | 'loading'
  | 'ready'
  | 'error';

let context: LlamaContext | null = null;

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
  if (context) return;
  context = await initLlama(
    { model: modelPath(), n_ctx: 2048, n_batch: 512, n_threads: 4 },
    onProgress,
  );
}

export async function unloadModel(): Promise<void> {
  await releaseAllLlama();
  context = null;
}

function buildSystemPrompt(speciesId?: string): string {
  const species = speciesId ? CATALOG.find((s) => s.id === speciesId) : null;
  const catalogContext = species
    ? `\n\nCurrent species context:\n- Common name: ${species.commonName}\n- Latin: ${species.latin}\n- Family: ${species.family}\n- Region: ${species.region}\n- Description: ${species.description}\n- Did you know: ${species.didYouKnow}\n- ID tips: ${species.idTips.join('; ')}`
    : '';

  return `You are a knowledgeable desert nature guide for the WildLens app. You help users identify and learn about desert plants and animals in the Sonoran, Mojave, Chihuahuan, and Great Basin deserts.

Answer questions concisely and accurately. Focus on identification, behavior, ecology, and safety. If asked about a dangerous species (venomous snake, scorpion), include safety advice. Keep responses to 2-4 sentences unless more detail is genuinely needed.${catalogContext}`;
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
