import AsyncStorage from '@react-native-async-storage/async-storage';

import { addSighting, deleteSighting, getSightings } from '@/lib/sightings';

beforeEach(() => {
  AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('getSightings', () => {
  it('returns empty array when no data stored', async () => {
    const result = await getSightings('user1');
    expect(result).toEqual([]);
  });
});

describe('addSighting', () => {
  it('generates a unique id and stores the sighting', async () => {
    const sighting = await addSighting({
      userId: 'user1',
      speciesId: 'saguaro',
      commonName: 'Saguaro',
      latinName: 'Carnegiea gigantea',
      kind: 'cactus',
      capturedAt: '2026-06-27T10:00:00.000Z',
    });

    expect(sighting.id).toBeTruthy();
    const all = await getSightings('user1');
    expect(all).toHaveLength(1);
    expect(all[0].speciesId).toBe('saguaro');
  });

  it('prepends new sightings so most recent comes first', async () => {
    await addSighting({
      userId: 'user1', speciesId: 'saguaro', commonName: 'Saguaro',
      latinName: 'Carnegiea gigantea', kind: 'cactus', capturedAt: '2026-06-27T10:00:00.000Z',
    });
    await addSighting({
      userId: 'user1', speciesId: 'roadrunner', commonName: 'Greater Roadrunner',
      latinName: 'Geococcyx californianus', kind: 'bird', capturedAt: '2026-06-27T11:00:00.000Z',
    });

    const all = await getSightings('user1');
    expect(all[0].speciesId).toBe('roadrunner');
    expect(all[1].speciesId).toBe('saguaro');
  });

  it('isolates data per user', async () => {
    await addSighting({
      userId: 'user1', speciesId: 'saguaro', commonName: 'Saguaro',
      latinName: 'Carnegiea gigantea', kind: 'cactus', capturedAt: '2026-06-27T10:00:00.000Z',
    });

    const user2 = await getSightings('user2');
    expect(user2).toHaveLength(0);
  });
});

describe('deleteSighting', () => {
  it('removes only the specified sighting', async () => {
    const s1 = await addSighting({
      userId: 'user1', speciesId: 'saguaro', commonName: 'Saguaro',
      latinName: 'Carnegiea gigantea', kind: 'cactus', capturedAt: '2026-06-27T10:00:00.000Z',
    });
    await addSighting({
      userId: 'user1', speciesId: 'roadrunner', commonName: 'Greater Roadrunner',
      latinName: 'Geococcyx californianus', kind: 'bird', capturedAt: '2026-06-27T11:00:00.000Z',
    });

    await deleteSighting('user1', s1.id);
    const remaining = await getSightings('user1');
    expect(remaining).toHaveLength(1);
    expect(remaining[0].speciesId).toBe('roadrunner');
  });
});
