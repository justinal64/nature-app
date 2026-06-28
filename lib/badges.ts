import type { SpeciesKind } from '@/lib/sightings';
import type { Sighting } from '@/lib/sightings';

export type Badge = {
  id: string;
  name: string;
  description: string;
  kind: SpeciesKind;
  check: (sightings: Sighting[], streak: number) => boolean;
};

export const ALL_BADGES: Badge[] = [
  // ─── First steps ─────────────────────────────────────────────────────────────
  {
    id: 'first-find',
    name: 'First Find',
    description: 'Log your first sighting',
    kind: 'cactus',
    check: (s) => s.length >= 1,
  },
  {
    id: 'first-photo',
    name: 'Shutterbug',
    description: 'Save a sighting with a photo',
    kind: 'bird',
    check: (s) => s.some((x) => !!x.photoUri),
  },
  {
    id: 'first-note',
    name: 'Field Notes',
    description: 'Add a note to a sighting',
    kind: 'insect',
    check: (s) => s.some((x) => !!x.notes),
  },
  {
    id: 'first-pin',
    name: 'Map Maker',
    description: 'Pin a sighting on the map',
    kind: 'snake',
    check: (s) => s.some((x) => !!x.location),
  },

  // ─── Species count ────────────────────────────────────────────────────────────
  {
    id: 'species-5',
    name: 'Budding Naturalist',
    description: 'Identify 5 unique species',
    kind: 'cactus',
    check: (s) => new Set(s.map((x) => x.speciesId)).size >= 5,
  },
  {
    id: 'species-10',
    name: 'Desert Explorer',
    description: 'Identify 10 unique species',
    kind: 'bird',
    check: (s) => new Set(s.map((x) => x.speciesId)).size >= 10,
  },
  {
    id: 'species-25',
    name: 'Field Scientist',
    description: 'Identify 25 unique species',
    kind: 'insect',
    check: (s) => new Set(s.map((x) => x.speciesId)).size >= 25,
  },
  {
    id: 'species-50',
    name: 'Desert Sage',
    description: 'Identify 50 unique species',
    kind: 'snake',
    check: (s) => new Set(s.map((x) => x.speciesId)).size >= 50,
  },

  // ─── Streak milestones ────────────────────────────────────────────────────────
  {
    id: 'streak-3',
    name: '3-Day Streak',
    description: 'Log a sighting 3 days in a row',
    kind: 'bird',
    check: (_, streak) => streak >= 3,
  },
  {
    id: 'streak-7',
    name: 'Week in the Wild',
    description: 'Log a sighting 7 days in a row',
    kind: 'cactus',
    check: (_, streak) => streak >= 7,
  },
  {
    id: 'streak-14',
    name: 'Fortnight',
    description: 'Log a sighting 14 days in a row',
    kind: 'bird',
    check: (_, streak) => streak >= 14,
  },
  {
    id: 'streak-30',
    name: 'Month in the Wild',
    description: 'Log a sighting 30 days in a row',
    kind: 'snake',
    check: (_, streak) => streak >= 30,
  },

  // ─── Category collectors ──────────────────────────────────────────────────────
  {
    id: 'birder',
    name: 'Birder',
    description: 'Log 5 different bird species',
    kind: 'bird',
    check: (s) => new Set(s.filter((x) => x.kind === 'bird').map((x) => x.speciesId)).size >= 5,
  },
  {
    id: 'cactus-crew',
    name: 'Cactus Crew',
    description: 'Log 5 different plant species',
    kind: 'cactus',
    check: (s) => new Set(s.filter((x) => x.kind === 'cactus').map((x) => x.speciesId)).size >= 5,
  },
  {
    id: 'bug-hunter',
    name: 'Bug Hunter',
    description: 'Log 3 different insect species',
    kind: 'insect',
    check: (s) => new Set(s.filter((x) => x.kind === 'insect').map((x) => x.speciesId)).size >= 3,
  },
  {
    id: 'herp-fan',
    name: 'Herp Fan',
    description: 'Log 3 different snake or reptile species',
    kind: 'snake',
    check: (s) => new Set(s.filter((x) => x.kind === 'snake').map((x) => x.speciesId)).size >= 3,
  },
];

export function getEarnedBadges(sightings: Sighting[], streak: number): Badge[] {
  return ALL_BADGES.filter((b) => b.check(sightings, streak));
}
