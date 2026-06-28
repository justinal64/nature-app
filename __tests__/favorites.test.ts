import AsyncStorage from '@react-native-async-storage/async-storage';

import { getFavorites, isFavorited, toggleFavorite } from '@/lib/favorites';

beforeEach(() => {
  AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('isFavorited', () => {
  it('returns false when nothing is favorited', async () => {
    expect(await isFavorited('user1', 'saguaro')).toBe(false);
  });
});

describe('toggleFavorite', () => {
  it('adds a species and returns true', async () => {
    const result = await toggleFavorite('user1', 'saguaro');
    expect(result).toBe(true);
    expect(await isFavorited('user1', 'saguaro')).toBe(true);
  });

  it('removes a species on second toggle and returns false', async () => {
    await toggleFavorite('user1', 'saguaro');
    const result = await toggleFavorite('user1', 'saguaro');
    expect(result).toBe(false);
    expect(await isFavorited('user1', 'saguaro')).toBe(false);
  });

  it('isolates favorites per user', async () => {
    await toggleFavorite('user1', 'saguaro');
    expect(await isFavorited('user2', 'saguaro')).toBe(false);
  });
});

describe('getFavorites', () => {
  it('returns all favorited species ids', async () => {
    await toggleFavorite('user1', 'saguaro');
    await toggleFavorite('user1', 'roadrunner');
    const favs = await getFavorites('user1');
    expect(favs).toHaveLength(2);
    expect(favs).toContain('saguaro');
    expect(favs).toContain('roadrunner');
  });
});
