// Phenology calendar for the desert Southwest (Sonoran, Mojave, Chihuahuan, Great Basin).
// Week numbers are ISO-style 1–52. Events that cross the year boundary (e.g. tortoise
// dormancy Nov–Mar) have startWeek > endWeek; helpers handle the wrap-around.

export type PhenologyEventType =
  | 'bloom'
  | 'fruiting'
  | 'arrival'
  | 'departure'
  | 'nesting'
  | 'active'
  | 'dormant'
  | 'mating'
  | 'birthing'
  | 'emergence'
  | 'special';

export type PhenologyCategory =
  | 'Plants'
  | 'Birds'
  | 'Reptiles'
  | 'Insects & Arachnids'
  | 'Mammals'
  | 'Special Events';

export type PhenologyEvent = {
  id: string;
  speciesId?: string;
  commonName: string;
  eventType: PhenologyEventType;
  category: PhenologyCategory;
  startWeek: number;
  peakWeek?: number;
  endWeek: number;
  note: string;
};

// ─── Week / month helpers ────────────────────────────────────────────────────

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Approximate week ranges for each month (1-indexed).
const MONTH_WEEK_RANGES: [number, number][] = [
  [1, 4],   // Jan
  [5, 8],   // Feb
  [9, 13],  // Mar
  [14, 17], // Apr
  [18, 21], // May
  [22, 26], // Jun
  [27, 30], // Jul
  [31, 35], // Aug
  [36, 39], // Sep
  [40, 44], // Oct
  [45, 48], // Nov
  [49, 52], // Dec
];

export function getWeekOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date.getTime() - start.getTime()) / 86_400_000 + start.getDay() + 1) / 7);
}

export function getCurrentMonth(): number {
  return new Date().getMonth(); // 0-indexed
}

function overlaps(s: number, e: number, rangeS: number, rangeE: number): boolean {
  if (s <= e) {
    return s <= rangeE && e >= rangeS;
  }
  // Wraps around year boundary (e.g. dormancy Oct–Mar)
  return s <= rangeE || e >= rangeS;
}

export function isEventActiveInMonth(event: PhenologyEvent, month: number): boolean {
  const [rangeS, rangeE] = MONTH_WEEK_RANGES[month];
  return overlaps(event.startWeek, event.endWeek, rangeS, rangeE);
}

export function getPhenologyForMonth(month: number): PhenologyEvent[] {
  return PHENOLOGY_EVENTS.filter((e) => isEventActiveInMonth(e, month));
}

export function getPhenologyCountPerMonth(): number[] {
  return MONTH_WEEK_RANGES.map((_, m) => getPhenologyForMonth(m).length);
}

// ─── Events ──────────────────────────────────────────────────────────────────

export const PHENOLOGY_EVENTS: PhenologyEvent[] = [
  // ── PLANTS ──────────────────────────────────────────────────────────────

  {
    id: 'utah-juniper-pollen',
    speciesId: 'utah-juniper',
    commonName: 'Utah Juniper',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 4, endWeek: 10,
    note: 'Heavy pollen release Jan–Mar. A major allergy trigger in the Great Basin and Colorado Plateau.',
  },
  {
    id: 'brittlebush-bloom',
    speciesId: 'brittlebush',
    commonName: 'Brittlebush',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 7, peakWeek: 12, endWeek: 18,
    note: 'One of the first desert shrubs to bloom. Covers bajadas in golden yellow Feb–May after winter rains.',
  },
  {
    id: 'globe-mallow-bloom-spring',
    speciesId: 'globe-mallow',
    commonName: 'Globe Mallow',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 8, peakWeek: 12, endWeek: 18,
    note: 'Brilliant orange-red blooms Feb–May in washes and roadsides. Blooms again after monsoon rains.',
  },
  {
    id: 'desert-five-spot-bloom',
    speciesId: 'desert-five-spot',
    commonName: 'Desert Five-Spot',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 9, peakWeek: 11, endWeek: 15,
    note: 'Ephemeral spring wildflower, blooms for just 3–6 weeks in March–April after El Niño rain years.',
  },
  {
    id: 'mexican-golden-poppy-bloom',
    speciesId: 'mexican-golden-poppy',
    commonName: 'Mexican Golden Poppy',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 9, peakWeek: 12, endWeek: 15,
    note: 'Arizona\'s state wildflower carpets hillsides in gold March–April. Peak bloom is rain-dependent.',
  },
  {
    id: 'desert-poppy-bloom',
    speciesId: 'desert-poppy',
    commonName: 'Desert Poppy',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 9, peakWeek: 12, endWeek: 16,
    note: 'Lemon-yellow blooms in sandy washes March–April. Often mixes with goldfields and phacelia.',
  },
  {
    id: 'mormon-tea-pollen',
    speciesId: 'mormon-tea',
    commonName: 'Mormon Tea',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 10, endWeek: 14,
    note: 'Male plants release yellow pollen in March. Female plants produce small papery cones.',
  },
  {
    id: 'desert-lavender-bloom',
    speciesId: 'desert-lavender',
    commonName: 'Desert Lavender',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 10, peakWeek: 13, endWeek: 20,
    note: 'Tiny purple flowers beloved by native bees. Blooms Mar–May, fragrance intensifies in heat.',
  },
  {
    id: 'creosote-bloom',
    speciesId: 'creosote-bush',
    commonName: 'Creosote Bush',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 11, peakWeek: 14, endWeek: 20,
    note: 'Yellow flowers bloom Mar–May then again after monsoon rains. The resinous scent is desert rain.',
  },
  {
    id: 'beavertail-bloom',
    speciesId: 'beavertail-cactus',
    commonName: 'Beavertail Cactus',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 11, peakWeek: 14, endWeek: 18,
    note: 'Brilliant magenta flowers in March–May. One of the most vibrant blooms in the Mojave.',
  },
  {
    id: 'mojave-yucca-bloom',
    speciesId: 'mojave-yucca',
    commonName: 'Mojave Yucca',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 12, peakWeek: 15, endWeek: 20,
    note: 'Tall cream-white flower stalks March–May. Pollinated exclusively by yucca moths — a co-evolutionary lock.',
  },
  {
    id: 'joshua-tree-bloom',
    speciesId: 'joshua-tree',
    commonName: 'Joshua Tree',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 9, peakWeek: 12, endWeek: 14,
    note: 'Blooms March–April but only after a cold winter followed by spring rain. Not every year.',
  },
  {
    id: 'ocotillo-bloom',
    speciesId: 'ocotillo',
    commonName: 'Ocotillo',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 13, peakWeek: 15, endWeek: 18,
    note: 'Scarlet wands bloom Mar–May, hummingbird magnets. Also blooms after any significant rain year-round.',
  },
  {
    id: 'pinyon-pine-pollen',
    speciesId: 'single-leaf-pinyon',
    commonName: 'Single-Leaf Pinyon',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 14, endWeek: 18,
    note: 'April pollen release coats everything in yellow dust. Pine nuts ripen in the cones by September.',
  },
  {
    id: 'prickly-pear-bloom',
    speciesId: 'prickly-pear',
    commonName: 'Prickly Pear',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 15, peakWeek: 17, endWeek: 20,
    note: 'Silky yellow, pink, or orange flowers April–May. Bees and beetles visit heavily.',
  },
  {
    id: 'blue-palo-verde-bloom',
    speciesId: 'blue-palo-verde',
    commonName: 'Blue Palo Verde',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 15, peakWeek: 16, endWeek: 19,
    note: 'Explodes in a cloud of yellow flowers April–May. One of the most dramatic desert blooms.',
  },
  {
    id: 'palo-verde-bloom',
    speciesId: 'palo-verde',
    commonName: 'Palo Verde',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 15, peakWeek: 17, endWeek: 20,
    note: 'Yellow flower show April–May. Green bark photosynthesizes year-round — leaves are optional.',
  },
  {
    id: 'cholla-bloom',
    speciesId: 'cholla',
    commonName: 'Cholla',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 17, peakWeek: 19, endWeek: 22,
    note: 'Magenta to greenish-yellow blooms April–May. Flower buds are highly nutritious — a traditional O\'odham food.',
  },
  {
    id: 'silver-cholla-bloom',
    speciesId: 'silver-cholla',
    commonName: 'Silver Cholla',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 16, endWeek: 20,
    note: 'Yellow-green blooms April–May, slightly earlier than teddy-bear cholla.',
  },
  {
    id: 'desert-marigold-bloom',
    speciesId: 'desert-marigold',
    commonName: 'Desert Marigold',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 15, peakWeek: 17, endWeek: 44,
    note: 'One of the longest-blooming desert wildflowers: April through November. Tolerates heat and drought.',
  },
  {
    id: 'ironwood-bloom',
    speciesId: 'ironwood',
    commonName: 'Desert Ironwood',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 19, peakWeek: 20, endWeek: 22,
    note: 'Lavender-purple flowers in May signal the peak of Sonoran spring. One of the last trees to bloom before summer heat.',
  },
  {
    id: 'saguaro-bloom',
    speciesId: 'saguaro',
    commonName: 'Saguaro',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 18, peakWeek: 20, endWeek: 23,
    note: 'White waxy flowers open at night and last one day. Pollinated by lesser long-nosed bats, doves, and bees. Arizona\'s state flower.',
  },
  {
    id: 'desert-willow-bloom',
    speciesId: 'desert-willow',
    commonName: 'Desert Willow',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 18, peakWeek: 22, endWeek: 36,
    note: 'Orchid-like pink-purple flowers May–September. A hummingbird favorite along desert washes.',
  },
  {
    id: 'sacred-datura-bloom',
    speciesId: 'sacred-datura',
    commonName: 'Sacred Datura',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 18, peakWeek: 28, endWeek: 40,
    note: 'Giant white trumpet flowers open at dusk and close by mid-morning. Pollinated exclusively by sphinx moths. TOXIC — all parts extremely dangerous.',
  },
  {
    id: 'desert-zinnia-bloom',
    speciesId: 'desert-zinnia',
    commonName: 'Desert Zinnia',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 18, peakWeek: 28, endWeek: 42,
    note: 'Cheerful white flowers with yellow centers bloom May–October. Thrives in rocky, dry soils.',
  },
  {
    id: 'organ-pipe-bloom',
    speciesId: 'organ-pipe',
    commonName: 'Organ Pipe Cactus',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 20, peakWeek: 23, endWeek: 26,
    note: 'Pale pink flowers open only at night May–June, pollinated by lesser long-nosed bats. Flowers close before sunrise.',
  },
  {
    id: 'sotol-bloom',
    speciesId: 'sotol',
    commonName: 'Sotol',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 22, peakWeek: 26, endWeek: 31,
    note: 'A single tall spike of white flowers June–August. Takes many years to bloom; a remarkable desert spectacle.',
  },
  {
    id: 'saguaro-fruit',
    speciesId: 'saguaro',
    commonName: 'Saguaro',
    eventType: 'fruiting',
    category: 'Plants',
    startWeek: 26, peakWeek: 28, endWeek: 30,
    note: 'Bright red fruits split open in July. The Tohono O\'odham harvest bahidaj with long poles — the harvest marks their new year.',
  },
  {
    id: 'barrel-cactus-bloom',
    speciesId: 'barrel-cactus',
    commonName: 'Barrel Cactus',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 27, peakWeek: 31, endWeek: 37,
    note: 'Orange-yellow crown of flowers July–September. One of the few cacti that blooms in summer heat.',
  },
  {
    id: 'globe-mallow-bloom-monsoon',
    speciesId: 'globe-mallow',
    commonName: 'Globe Mallow',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 28, endWeek: 36,
    note: 'Second bloom flush after monsoon rains in July–September. Roadside populations explode.',
  },
  {
    id: 'texas-ranger-bloom',
    speciesId: 'texas-ranger',
    commonName: 'Texas Ranger',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 28, peakWeek: 31, endWeek: 40,
    note: 'Purple flowers appear within days of significant rain — blooms reliably predict monsoon arrival. Called "barometer bush."',
  },
  {
    id: 'prickly-pear-fruit',
    speciesId: 'prickly-pear',
    commonName: 'Prickly Pear',
    eventType: 'fruiting',
    category: 'Plants',
    startWeek: 28, peakWeek: 31, endWeek: 35,
    note: 'Magenta tunas (fruits) ripen July–August. Eaten raw, made into juice, jam, and candy. Rich in vitamin C.',
  },
  {
    id: 'desert-puffball-fruiting',
    speciesId: 'desert-puffball',
    commonName: 'Desert Puffball',
    eventType: 'fruiting',
    category: 'Plants',
    startWeek: 28, peakWeek: 31, endWeek: 38,
    note: 'Appear after monsoon rains July–September. Edible when pure white inside — slice to verify before eating.',
  },
  {
    id: 'desert-inky-cap-fruiting',
    speciesId: 'desert-inky-cap',
    commonName: 'Desert Inky-Cap',
    eventType: 'fruiting',
    category: 'Plants',
    startWeek: 28, endWeek: 40,
    note: 'Erupts after monsoon rains, often in lawns and disturbed soil. Edible when young but toxic with alcohol.',
  },
  {
    id: 'four-wing-saltbush-bloom',
    speciesId: 'four-wing-saltbush',
    commonName: 'Four-Wing Saltbush',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 30, peakWeek: 35, endWeek: 40,
    note: 'Inconspicuous flowers July–October followed by papery winged fruits. Seeds were ground into flour by Navajo peoples.',
  },
  {
    id: 'big-sagebrush-bloom',
    speciesId: 'big-sagebrush',
    commonName: 'Big Sagebrush',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 31, peakWeek: 36, endWeek: 40,
    note: 'Tiny yellow flowers Aug–Oct. Releases iconic fragrance after rain. A major Great Basin pollen source in fall.',
  },
  {
    id: 'rabbitbrush-bloom',
    speciesId: 'rabbitbrush',
    commonName: 'Rabbitbrush',
    eventType: 'bloom',
    category: 'Plants',
    startWeek: 34, peakWeek: 38, endWeek: 42,
    note: 'Explosion of gold in Aug–Oct. One of the most important fall nectar sources for monarch butterflies passing through.',
  },
  {
    id: 'pinyon-pine-nuts',
    speciesId: 'single-leaf-pinyon',
    commonName: 'Single-Leaf Pinyon',
    eventType: 'fruiting',
    category: 'Plants',
    startWeek: 35, peakWeek: 38, endWeek: 42,
    note: 'Pine nuts ready to harvest Sep–Oct (good crop every 3–7 years). A staple food for Great Basin peoples for 10,000+ years.',
  },

  // ── BIRDS ───────────────────────────────────────────────────────────────

  {
    id: 'phainopepla-nesting',
    speciesId: 'phainopepla',
    commonName: 'Phainopepla',
    eventType: 'nesting',
    category: 'Birds',
    startWeek: 6, peakWeek: 10, endWeek: 14,
    note: 'Breeds in desert mistletoe in winter/spring, then migrates to coastal scrub for a second breeding season. Eats 1,000 mistletoe berries a day.',
  },
  {
    id: 'turkey-vulture-arrival',
    speciesId: 'turkey-vulture',
    commonName: 'Turkey Vulture',
    eventType: 'arrival',
    category: 'Birds',
    startWeek: 9, peakWeek: 11, endWeek: 12,
    note: 'Returns to the Southwest in March. Look for kettles of 50+ birds spiraling on thermals over desert ridges.',
  },
  {
    id: 'costas-hummingbird-peak',
    speciesId: 'costas-hummingbird',
    commonName: 'Costa\'s Hummingbird',
    eventType: 'nesting',
    category: 'Birds',
    startWeek: 9, peakWeek: 13, endWeek: 20,
    note: 'Nests earlier than other hummingbirds, completing breeding before summer heat. Males display a dramatic looping dive with a piercing whistle.',
  },
  {
    id: 'roadrunner-nesting',
    speciesId: 'roadrunner',
    commonName: 'Greater Roadrunner',
    eventType: 'nesting',
    category: 'Birds',
    startWeek: 11, peakWeek: 15, endWeek: 22,
    note: 'Nests March–May in cholla and palo verde. Males court females with prey offerings. Both parents incubate.',
  },
  {
    id: 'elf-owl-arrival',
    speciesId: 'elf-owl',
    commonName: 'Elf Owl',
    eventType: 'arrival',
    category: 'Birds',
    startWeek: 11, peakWeek: 12, endWeek: 13,
    note: 'Arrives from Mexico in mid-March. Listen for a rapid puppy-like yipping call at dusk. The world\'s smallest owl.',
  },
  {
    id: 'curve-billed-thrasher-nesting',
    speciesId: 'curve-billed-thrasher',
    commonName: 'Curve-Billed Thrasher',
    eventType: 'nesting',
    category: 'Birds',
    startWeek: 10, peakWeek: 14, endWeek: 22,
    note: 'Year-round resident; nesting peaks March–May. Builds platform nest deep in cholla cactus for protection.',
  },
  {
    id: 'gambel-quail-nesting',
    speciesId: 'gambels-quail',
    commonName: 'Gambel\'s Quail',
    eventType: 'nesting',
    category: 'Birds',
    startWeek: 14, peakWeek: 17, endWeek: 24,
    note: 'Chicks hatch April–June and can run hours after hatching. Family groups called coveys; listen for the "chi-CA-go" call.',
  },
  {
    id: 'scott-oriole-arrival',
    speciesId: 'scott-oriole',
    commonName: 'Scott\'s Oriole',
    eventType: 'arrival',
    category: 'Birds',
    startWeek: 13, peakWeek: 14, endWeek: 15,
    note: 'Arrives late March/April and immediately begins singing from yucca stalks. Nests woven into hanging yucca leaves.',
  },
  {
    id: 'black-chinned-hummingbird-arrival',
    speciesId: 'black-chinned-hummingbird',
    commonName: 'Black-Chinned Hummingbird',
    eventType: 'arrival',
    category: 'Birds',
    startWeek: 14, peakWeek: 15, endWeek: 16,
    note: 'Arrives April, common in riparian and urban desert. Purple throat visible only at the right angle in sunlight.',
  },
  {
    id: 'lesser-nighthawk-arrival',
    speciesId: 'lesser-nighthawk',
    commonName: 'Lesser Nighthawk',
    eventType: 'arrival',
    category: 'Birds',
    startWeek: 14, peakWeek: 15, endWeek: 16,
    note: 'Arrives April; active at dusk and dawn catching insects in low fluttering flight over desert washes.',
  },
  {
    id: 'elf-owl-nesting',
    speciesId: 'elf-owl',
    commonName: 'Elf Owl',
    eventType: 'nesting',
    category: 'Birds',
    startWeek: 16, peakWeek: 19, endWeek: 28,
    note: 'Nests in abandoned Gila Woodpecker holes in saguaros April–July. Eats scorpions, removing the stinger before feeding to chicks.',
  },
  {
    id: 'gila-woodpecker-nesting',
    speciesId: 'gila-woodpecker',
    commonName: 'Gila Woodpecker',
    eventType: 'nesting',
    category: 'Birds',
    startWeek: 13, peakWeek: 16, endWeek: 24,
    note: 'Excavates nest cavities in saguaros March–June. Fresh cavities must dry 1 year before Elf Owls can use them.',
  },
  {
    id: 'lesser-long-nosed-bat-arrival',
    commonName: 'Lesser Long-Nosed Bat',
    eventType: 'arrival',
    category: 'Birds',
    startWeek: 18, peakWeek: 20, endWeek: 21,
    note: 'Arrives from Mexico in May following the northward bloom of columnar cacti. Primary pollinator of saguaro and organ pipe.',
  },
  {
    id: 'scott-oriole-departure',
    speciesId: 'scott-oriole',
    commonName: 'Scott\'s Oriole',
    eventType: 'departure',
    category: 'Birds',
    startWeek: 33, peakWeek: 35, endWeek: 36,
    note: 'Departs for Mexico in August after breeding season. Males leave first, followed by females and juveniles.',
  },
  {
    id: 'elf-owl-departure',
    speciesId: 'elf-owl',
    commonName: 'Elf Owl',
    eventType: 'departure',
    category: 'Birds',
    startWeek: 37, peakWeek: 38, endWeek: 40,
    note: 'Migrates south to Mexico in September. Silent and difficult to detect on departure.',
  },
  {
    id: 'turkey-vulture-departure',
    speciesId: 'turkey-vulture',
    commonName: 'Turkey Vulture',
    eventType: 'departure',
    category: 'Birds',
    startWeek: 39, peakWeek: 41, endWeek: 43,
    note: 'Leaves Oct–Nov in long southbound streams. Some of the largest groups (100+) pass through AZ mountain passes.',
  },
  {
    id: 'cactus-wren-nesting',
    speciesId: 'cactus-wren',
    commonName: 'Cactus Wren',
    eventType: 'nesting',
    category: 'Birds',
    startWeek: 10, peakWeek: 15, endWeek: 22,
    note: 'Builds football-shaped nests deep in cholla March–May. Year-round resident; Arizona\'s state bird.',
  },

  // ── REPTILES ─────────────────────────────────────────────────────────────

  {
    id: 'gila-monster-emergence',
    speciesId: 'gila-monster',
    commonName: 'Gila Monster',
    eventType: 'emergence',
    category: 'Reptiles',
    startWeek: 8, peakWeek: 11, endWeek: 13,
    note: 'Emerges from winter dormancy Feb–March when soil warms. Most active spring and early summer. One of only two venomous lizards in the world.',
  },
  {
    id: 'desert-tortoise-emergence',
    speciesId: 'desert-tortoise',
    commonName: 'Desert Tortoise',
    eventType: 'emergence',
    category: 'Reptiles',
    startWeek: 9, peakWeek: 11, endWeek: 14,
    note: 'Emerges from winter dormancy March–April after soil warms above 60°F. Immediately begins foraging on spring annuals.',
  },
  {
    id: 'western-diamondback-emergence',
    speciesId: 'western-diamondback',
    commonName: 'Western Diamondback Rattlesnake',
    eventType: 'emergence',
    category: 'Reptiles',
    startWeek: 10, peakWeek: 13, endWeek: 15,
    note: 'Emerges from communal dens March–April. Most encounters happen in spring during emergence and fall before denning.',
  },
  {
    id: 'collared-lizard-active',
    speciesId: 'collared-lizard',
    commonName: 'Collared Lizard',
    eventType: 'active',
    category: 'Reptiles',
    startWeek: 13, peakWeek: 18, endWeek: 35,
    note: 'Active March–September on rocky outcrops. Males display brilliant green and orange colors in breeding season.',
  },
  {
    id: 'chuckwalla-active',
    speciesId: 'chuckwalla',
    commonName: 'Chuckwalla',
    eventType: 'active',
    category: 'Reptiles',
    startWeek: 12, peakWeek: 18, endWeek: 30,
    note: 'Basking on boulders March–August. Inflates body and wedges between rocks when threatened. Herbivore — favors creosote flowers.',
  },
  {
    id: 'desert-iguana-active',
    speciesId: 'desert-iguana',
    commonName: 'Desert Iguana',
    eventType: 'active',
    category: 'Reptiles',
    startWeek: 14, peakWeek: 22, endWeek: 35,
    note: 'One of the most heat-tolerant lizards — active at 115°F when others hide. Favors creosote bush habitat.',
  },
  {
    id: 'gila-monster-active',
    speciesId: 'gila-monster',
    commonName: 'Gila Monster',
    eventType: 'active',
    category: 'Reptiles',
    startWeek: 12, peakWeek: 16, endWeek: 24,
    note: 'Peak activity April–June before summer heat. Consumes 3–4 large meals per year; fat stored in tail.',
  },
  {
    id: 'rattlesnake-peak',
    speciesId: 'western-diamondback',
    commonName: 'Western Diamondback Rattlesnake',
    eventType: 'active',
    category: 'Reptiles',
    startWeek: 18, peakWeek: 26, endWeek: 30,
    note: 'Peak activity May–July, mostly nocturnal in summer heat. Most bites occur May–October; watch where you step after dark.',
  },
  {
    id: 'desert-tortoise-dormant',
    speciesId: 'desert-tortoise',
    commonName: 'Desert Tortoise',
    eventType: 'dormant',
    category: 'Reptiles',
    startWeek: 41, endWeek: 8,
    note: 'Enters winter dormancy October–March in underground burrows. Also estivates underground in peak summer heat (July–August).',
  },
  {
    id: 'rattlesnake-denning',
    speciesId: 'western-diamondback',
    commonName: 'Western Diamondback Rattlesnake',
    eventType: 'dormant',
    category: 'Reptiles',
    startWeek: 41, endWeek: 9,
    note: 'Returns to communal dens October–March. Multiple snakes overwinter together; den sites used for generations.',
  },

  // ── INSECTS & ARACHNIDS ──────────────────────────────────────────────────

  {
    id: 'painted-lady-migration-spring',
    speciesId: 'painted-lady',
    commonName: 'Painted Lady',
    eventType: 'active',
    category: 'Insects & Arachnids',
    startWeek: 8, peakWeek: 12, endWeek: 16,
    note: 'Massive northward migration in good rain years Feb–April. Billions move through the Sonoran Desert into CA and beyond.',
  },
  {
    id: 'giant-saguaro-skipper',
    speciesId: 'giant-saguaro-skipper',
    commonName: 'Giant Saguaro Skipper',
    eventType: 'active',
    category: 'Insects & Arachnids',
    startWeek: 15, peakWeek: 18, endWeek: 22,
    note: 'One of the largest skippers in North America. Adults emerge April–May, feed on saguaro and agave nectar.',
  },
  {
    id: 'queen-butterfly-active',
    speciesId: 'queen-butterfly',
    commonName: 'Queen Butterfly',
    eventType: 'active',
    category: 'Insects & Arachnids',
    startWeek: 14, peakWeek: 26, endWeek: 44,
    note: 'Year-round in southern AZ but peak April–November. Often confused with Monarch — note brown (not black) veins.',
  },
  {
    id: 'bark-scorpion-active',
    speciesId: 'arizona-bark-scorpion',
    commonName: 'Arizona Bark Scorpion',
    eventType: 'active',
    category: 'Insects & Arachnids',
    startWeek: 20, peakWeek: 28, endWeek: 42,
    note: 'Highly active May–October. Nocturnal; enters homes seeking moisture. Glow bright teal-green under UV blacklight.',
  },
  {
    id: 'tarantula-hawk-peak',
    speciesId: 'tarantula-hawk',
    commonName: 'Tarantula Hawk Wasp',
    eventType: 'active',
    category: 'Insects & Arachnids',
    startWeek: 28, peakWeek: 32, endWeek: 38,
    note: 'Most active July–September during monsoon season. Delivers one of the most painful insect stings — only the female stings.',
  },
  {
    id: 'white-lined-sphinx-moth',
    speciesId: 'white-lined-sphinx',
    commonName: 'White-Lined Sphinx Moth',
    eventType: 'active',
    category: 'Insects & Arachnids',
    startWeek: 28, peakWeek: 32, endWeek: 38,
    note: 'Hovers like a hummingbird at sacred datura and desert willow flowers at dusk during monsoon season. Primary datura pollinator.',
  },
  {
    id: 'monarch-migration-fall',
    speciesId: 'monarch-butterfly',
    commonName: 'Monarch Butterfly',
    eventType: 'active',
    category: 'Insects & Arachnids',
    startWeek: 38, peakWeek: 41, endWeek: 44,
    note: 'Fall migration through AZ Sep–Oct. Fuel up on rabbitbrush and milkweed. Millions pass through en route to Mexican mountains.',
  },
  {
    id: 'tarantula-mating-walks',
    speciesId: 'desert-tarantula',
    commonName: 'Desert Tarantula',
    eventType: 'mating',
    category: 'Insects & Arachnids',
    startWeek: 36, peakWeek: 39, endWeek: 42,
    note: 'Males wander at dusk Sep–Oct searching for females. A tarantula crossing a desert road in fall is almost always a male on his mating walk.',
  },
  {
    id: 'pepsis-wasp-active',
    speciesId: 'pepsis-wasp',
    commonName: 'Pepsis Wasp (Tarantula Hawk)',
    eventType: 'active',
    category: 'Insects & Arachnids',
    startWeek: 26, peakWeek: 31, endWeek: 40,
    note: 'Hunts and paralyzes tarantulas as a living larder for larvae. Most visible July–October when monsoon insects peak.',
  },

  // ── MAMMALS ──────────────────────────────────────────────────────────────

  {
    id: 'kit-fox-pups',
    speciesId: 'kit-fox',
    commonName: 'Kit Fox',
    eventType: 'birthing',
    category: 'Mammals',
    startWeek: 8, peakWeek: 10, endWeek: 14,
    note: 'Pups born Feb–March, emerge from den April. Enormous ears dissipate heat — don\'t handle or disturb desert dens.',
  },
  {
    id: 'javelina-birthing',
    speciesId: 'javelina',
    commonName: 'Javelina (Collared Peccary)',
    eventType: 'birthing',
    category: 'Mammals',
    startWeek: 6, peakWeek: 10, endWeek: 14,
    note: 'Peak births Feb–April, with twins most common. Newborns (reds) can run within hours. Give herds wide berth — mothers are protective.',
  },
  {
    id: 'desert-cottontail-breeding',
    speciesId: 'desert-cottontail',
    commonName: 'Desert Cottontail',
    eventType: 'birthing',
    category: 'Mammals',
    startWeek: 4, peakWeek: 14, endWeek: 40,
    note: 'Breeds nearly year-round in the desert, peak Feb–September. Litters of 2–6; young are fully weaned in 3 weeks.',
  },
  {
    id: 'coyote-pups',
    speciesId: 'coyote',
    commonName: 'Coyote',
    eventType: 'birthing',
    category: 'Mammals',
    startWeek: 13, peakWeek: 15, endWeek: 17,
    note: 'Pups born April in earthen dens. Family groups howl together at dawn and dusk — chorus may sound like dozens but is often just 3–4 animals.',
  },
  {
    id: 'lesser-long-nosed-bat-depart',
    commonName: 'Lesser Long-Nosed Bat',
    eventType: 'departure',
    category: 'Mammals',
    startWeek: 35, peakWeek: 37, endWeek: 38,
    note: 'Departs back to Mexico Aug–September after saguaro and agave blooms end. Pregnant females lead the southbound migration.',
  },
  {
    id: 'mule-deer-rut',
    speciesId: 'mule-deer',
    commonName: 'Mule Deer',
    eventType: 'mating',
    category: 'Mammals',
    startWeek: 44, peakWeek: 47, endWeek: 50,
    note: 'Rut peaks November. Bucks spar and chase does across canyon country. Most vehicle-deer collisions occur during rut.',
  },
  {
    id: 'pronghorn-rut',
    speciesId: 'pronghorn',
    commonName: 'Pronghorn',
    eventType: 'mating',
    category: 'Mammals',
    startWeek: 36, peakWeek: 38, endWeek: 40,
    note: 'Rut peaks September. Bucks establish harems and chase rivals. North America\'s fastest land animal at 55 mph.',
  },

  // ── SPECIAL EVENTS ────────────────────────────────────────────────────────

  {
    id: 'spring-wildflower-superbloom',
    commonName: 'Spring Wildflower Bloom',
    eventType: 'special',
    category: 'Special Events',
    startWeek: 9, peakWeek: 12, endWeek: 16,
    note: 'Peak Mar–Apr after a wet winter. In El Niño years, Anza-Borrego, Organ Pipe, and Saguaro NP blaze with color. No two years are the same.',
  },
  {
    id: 'monsoon-season',
    commonName: 'Monsoon Season',
    eventType: 'special',
    category: 'Special Events',
    startWeek: 26, peakWeek: 31, endWeek: 37,
    note: 'July–mid Sept: afternoon thunderstorms triggered by moisture from the Gulf of Mexico. Flash flood risk in canyons. Desert transforms overnight — dozens of species bloom and emerge.',
  },
  {
    id: 'saguaro-harvest',
    commonName: 'Saguaro Harvest (Tohono O\'odham)',
    eventType: 'special',
    category: 'Special Events',
    startWeek: 27, peakWeek: 28, endWeek: 30,
    note: 'July: Tohono O\'odham harvest bahidaj (saguaro fruit) with ribs of fallen cacti. Fermented wine (nawait) is central to the Wi:gita rain ceremony — their new year.',
  },
  {
    id: 'monsoon-wildflowers',
    commonName: 'Post-Monsoon Wildflower Flush',
    eventType: 'special',
    category: 'Special Events',
    startWeek: 31, peakWeek: 33, endWeek: 36,
    note: 'Late July–August: globe mallow, sacred datura, desert zinnia, and desert marigold explode after monsoon rains.',
  },
  {
    id: 'tarantula-walks',
    commonName: 'Tarantula Mating Walks',
    eventType: 'special',
    category: 'Special Events',
    startWeek: 36, peakWeek: 39, endWeek: 42,
    note: 'Sept–Oct: male tarantulas wander desert roads at dusk seeking females. A once-a-year spectacle. Males die after mating; females may live 20+ years.',
  },
  {
    id: 'monarch-migration',
    commonName: 'Monarch Migration',
    eventType: 'special',
    category: 'Special Events',
    startWeek: 38, peakWeek: 41, endWeek: 44,
    note: 'Sept–Oct: millions of monarchs funnel through Arizona mountain corridors. Peak at rabbitbrush and milkweed patches. En route to Michoacán, Mexico.',
  },
  {
    id: 'valley-fever-risk',
    commonName: 'Valley Fever Season',
    eventType: 'special',
    category: 'Special Events',
    startWeek: 36, peakWeek: 40, endWeek: 48,
    note: 'Peak risk Sept–Nov in dry, dusty conditions after summer rain. Coccidioides fungus spores release when soil is disturbed. Wear a mask if digging or in dust storms. More common than most visitors realize.',
  },
];

export const CATEGORY_ORDER: PhenologyCategory[] = [
  'Plants',
  'Birds',
  'Reptiles',
  'Insects & Arachnids',
  'Mammals',
  'Special Events',
];
