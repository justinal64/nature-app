import {
  CATALOG,
  ACTIVE_MONTHS,
  getSpeciesById,
  getCategoryCount,
  getRelatedSpecies,
  getActiveMonths,
} from '../constants/catalog';

describe('CATALOG integrity', () => {
  it('has at least 130 species', () => {
    expect(CATALOG.length).toBeGreaterThanOrEqual(130);
  });

  it('every species has a unique id', () => {
    const ids = CATALOG.map((s) => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(CATALOG.length);
  });

  it('every species id has an ACTIVE_MONTHS entry', () => {
    const missing = CATALOG.filter((s) => !(s.id in ACTIVE_MONTHS)).map((s) => s.id);
    expect(missing).toEqual([]);
  });

  it('every ACTIVE_MONTHS month is 1–12', () => {
    for (const [id, months] of Object.entries(ACTIVE_MONTHS)) {
      for (const m of months) {
        expect(m).toBeGreaterThanOrEqual(1);
        expect(m).toBeLessThanOrEqual(12);
      }
    }
  });

  it('every species has at least 1 idTip', () => {
    const bad = CATALOG.filter((s) => !s.idTips || s.idTips.length === 0).map((s) => s.id);
    expect(bad).toEqual([]);
  });

  it('every species has exactly 4 stats', () => {
    const bad = CATALOG.filter((s) => s.stats.length !== 4).map((s) => s.id);
    expect(bad).toEqual([]);
  });

  it('every species has a valid kind', () => {
    const valid = ['cactus', 'bird', 'insect', 'snake'];
    const bad = CATALOG.filter((s) => !valid.includes(s.kind)).map((s) => s.id);
    expect(bad).toEqual([]);
  });

  it('every species has a valid region', () => {
    const valid = ['SONORAN', 'MOJAVE', 'CHIHUAHUAN', 'GREAT_BASIN'];
    const bad = CATALOG.filter((s) => !valid.includes(s.region)).map((s) => s.id);
    expect(bad).toEqual([]);
  });
});

describe('getSpeciesById', () => {
  it('returns species for known id', () => {
    const sp = getSpeciesById('saguaro');
    expect(sp).toBeDefined();
    expect(sp?.commonName).toBe('Saguaro');
  });

  it('returns undefined for unknown id', () => {
    expect(getSpeciesById('not-a-real-species')).toBeUndefined();
  });
});

describe('getCategoryCount', () => {
  it('returns a positive count for each kind', () => {
    for (const kind of ['cactus', 'bird', 'insect', 'snake'] as const) {
      expect(getCategoryCount(kind)).toBeGreaterThan(0);
    }
  });

  it('counts sum to total catalog size', () => {
    const sum =
      getCategoryCount('cactus') +
      getCategoryCount('bird') +
      getCategoryCount('insect') +
      getCategoryCount('snake');
    expect(sum).toBe(CATALOG.length);
  });
});

describe('getRelatedSpecies', () => {
  it('never includes the species itself', () => {
    const saguaro = getSpeciesById('saguaro')!;
    const related = getRelatedSpecies(saguaro);
    expect(related.every((r) => r.id !== 'saguaro')).toBe(true);
  });

  it('returns at most the requested limit', () => {
    const sp = CATALOG[0];
    const related = getRelatedSpecies(sp, 3);
    expect(related.length).toBeLessThanOrEqual(3);
  });

  it('prefers same-kind species over cross-kind', () => {
    const bird = CATALOG.find((s) => s.kind === 'bird')!;
    const related = getRelatedSpecies(bird, 10);
    const sameKind = related.filter((r) => r.kind === 'bird').length;
    const otherKind = related.filter((r) => r.kind !== 'bird').length;
    // ranking puts same-kind first — so same-kind count should be >= cross-kind if both present
    expect(sameKind).toBeGreaterThanOrEqual(otherKind);
  });
});

describe('getActiveMonths', () => {
  it('returns array of month numbers for known species', () => {
    const months = getActiveMonths('saguaro');
    expect(Array.isArray(months)).toBe(true);
    expect(months.length).toBeGreaterThan(0);
  });

  it('returns ALL months (1–12) for year-round species', () => {
    // big-sagebrush is marked ALL
    const months = getActiveMonths('big-sagebrush');
    expect(months).toHaveLength(12);
  });

  it('returns non-empty array for unknown species (fallback)', () => {
    const months = getActiveMonths('totally-fake-species');
    expect(months.length).toBeGreaterThan(0);
  });
});
