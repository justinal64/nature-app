import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Sighting } from '@/lib/sightings';

// "Bioblitzes" (#38) as a local-only feature: real bioblitzes (City Nature
// Challenge etc.) are inherently multi-user/coordinated — same backend
// #34/#35 would need, which contradicts this app's single-user,
// offline-first architecture (CLAUDE.md). This is the personal analog: a
// time-boxed goal to log as many species as possible in a window, scored
// entirely from the user's own already-local sightings — no server, no
// leaderboard.
export type Challenge = {
  id: string;
  userId: string;
  name: string;
  startDate: string; // ISO date (yyyy-mm-dd)
  endDate: string; // ISO date (yyyy-mm-dd), inclusive
  targetSpecies?: number;
  createdAt: string; // ISO 8601
};

export type ChallengeStatus = 'upcoming' | 'active' | 'ended';

const KEY = (uid: string) => `challenges:${uid}`;

export async function getChallenges(userId: string): Promise<Challenge[]> {
  const raw = await AsyncStorage.getItem(KEY(userId));
  return raw ? (JSON.parse(raw) as Challenge[]) : [];
}

export async function createChallenge(
  userId: string,
  input: { name: string; startDate: string; endDate: string; targetSpecies?: number },
): Promise<Challenge> {
  const all = await getChallenges(userId);
  const record: Challenge = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    userId,
    name: input.name.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
    targetSpecies: input.targetSpecies,
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEY(userId), JSON.stringify([record, ...all]));
  return record;
}

export async function deleteChallenge(userId: string, challengeId: string): Promise<void> {
  const all = await getChallenges(userId);
  await AsyncStorage.setItem(KEY(userId), JSON.stringify(all.filter((c) => c.id !== challengeId)));
}

export function getChallengeStatus(challenge: Challenge, now = new Date()): ChallengeStatus {
  const today = now.toISOString().slice(0, 10);
  if (today < challenge.startDate) return 'upcoming';
  if (today > challenge.endDate) return 'ended';
  return 'active';
}

// Species logged within the challenge's inclusive date window. Computed
// on the fly from the user's existing sightings rather than tracked
// separately — the sightings themselves are the source of truth.
export function getChallengeSpecies(challenge: Challenge, sightings: Sighting[]): Set<string> {
  const species = new Set<string>();
  for (const s of sightings) {
    const day = s.capturedAt.slice(0, 10);
    if (day >= challenge.startDate && day <= challenge.endDate) {
      species.add(s.speciesId);
    }
  }
  return species;
}
