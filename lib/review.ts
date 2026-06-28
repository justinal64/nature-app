import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

import { getSightings } from './sightings';

const REVIEW_KEY = 'review:requested';
const REVIEW_THRESHOLDS = [5, 50, 100];

export async function maybeRequestReview(userId: string): Promise<void> {
  try {
    const canRequest = await StoreReview.isAvailableAsync();
    if (!canRequest) return;

    const raw = await AsyncStorage.getItem(REVIEW_KEY);
    const requestedAt = raw ? (JSON.parse(raw) as number[]) : [];

    const all = await getSightings(userId);
    const count = all.length;

    const nextThreshold = REVIEW_THRESHOLDS.find((t) => count >= t && !requestedAt.includes(t));
    if (!nextThreshold) return;

    await AsyncStorage.setItem(REVIEW_KEY, JSON.stringify([...requestedAt, nextThreshold]));
    await StoreReview.requestReview();
  } catch {
    // Review prompt errors are non-fatal
  }
}
