import AsyncStorage from '@react-native-async-storage/async-storage';

import { getStreak, updateStreak } from '@/lib/streak';

beforeEach(() => {
  AsyncStorage.clear();
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

function setNow(isoDate: string) {
  jest.setSystemTime(new Date(isoDate));
}

describe('updateStreak', () => {
  it('starts at 1 for a new user', async () => {
    setNow('2026-06-27T10:00:00Z');
    const count = await updateStreak('user1');
    expect(count).toBe(1);
  });

  it('is idempotent when called twice on the same day', async () => {
    setNow('2026-06-27T08:00:00Z');
    await updateStreak('user1');
    setNow('2026-06-27T20:00:00Z');
    const count = await updateStreak('user1');
    expect(count).toBe(1);
  });

  it('increments the streak on consecutive days', async () => {
    setNow('2026-06-26T10:00:00Z');
    await updateStreak('user1');
    setNow('2026-06-27T10:00:00Z');
    const count = await updateStreak('user1');
    expect(count).toBe(2);
  });

  it('resets the streak after a missed day', async () => {
    setNow('2026-06-25T10:00:00Z');
    await updateStreak('user1');
    setNow('2026-06-27T10:00:00Z'); // skipped the 26th
    const count = await updateStreak('user1');
    expect(count).toBe(1);
  });
});

describe('getStreak', () => {
  it('returns 0 before any login', async () => {
    const count = await getStreak('user1');
    expect(count).toBe(0);
  });

  it('returns the current streak count', async () => {
    setNow('2026-06-26T10:00:00Z');
    await updateStreak('user1');
    setNow('2026-06-27T10:00:00Z');
    await updateStreak('user1');
    const count = await getStreak('user1');
    expect(count).toBe(2);
  });
});
