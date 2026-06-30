// Foraging legality by land management type for the desert Southwest.
// Rules vary more by who manages the land than by state. Users in the field
// know whether they're in a National Park vs. BLM land more readily than
// tracking per-state statute variations.
//
// Sources: NPS Management Policies §4.4.3, USFS Directives FSM 2300, BLM Manual 6400,
// various state park regulations, and Arizona Native Plant Law (ARS §3-903).

export type ForagingRule =
  | 'allowed'          // Personal-use foraging explicitly permitted
  | 'limited'          // Permitted with quantity/method restrictions
  | 'prohibited'       // Not permitted
  | 'permit-required'  // Any harvest requires a permit
  | 'varies';          // Depends on district / unit

export type ForagingLandType =
  | 'nationalPark'
  | 'nationalMonument'
  | 'nationalForest'
  | 'blm'
  | 'statePark'
  | 'wildernessArea'
  | 'tribalLand';

export type ForagingLegalityInfo = {
  byLandType: Partial<Record<ForagingLandType, ForagingRule>>;
  specialProtection?: string;
  personalUseLimit?: string;
  notes: string;
  foragerTip?: string;
};

const FORAGING_MAP: Partial<Record<string, ForagingLegalityInfo>> = {

  // ── Cacti ─────────────────────────────────────────────────────────────────

  saguaro: {
    byLandType: {
      nationalPark:    'prohibited',
      nationalMonument:'prohibited',
      nationalForest:  'prohibited',
      blm:             'permit-required',
      statePark:       'prohibited',
      tribalLand:      'varies',
    },
    specialProtection: 'Protected statewide by Arizona Native Plant Law (ARS §3-903). Harvesting, removing, or damaging saguaro — including collecting fallen fruit — without a permit is a Class 4 felony. The Tohono O\'odham Nation has specific cultural rights to harvest bahidaj.',
    notes: 'One of the most strictly protected plants in the American West. Even collecting fallen fruit on BLM land requires a permit from the Arizona Department of Agriculture. The exception: tribal members harvesting on their own land per cultural rights.',
    foragerTip: 'Visit the Tohono O\'odham Cultural Center in Sells, AZ to learn about the saguaro harvest tradition. Do not attempt to harvest.',
  },

  'prickly-pear': {
    byLandType: {
      nationalPark:    'prohibited',
      nationalMonument:'prohibited',
      nationalForest:  'limited',
      blm:             'limited',
      statePark:       'prohibited',
      wildernessArea:  'limited',
    },
    personalUseLimit: 'On National Forest and BLM land: generally 2 gallons of fruit (tunas) per day for personal use without a permit. Commercial harvest requires a Special Use Permit.',
    notes: 'The most forager-friendly cactus in the Southwest. On BLM and National Forest land, modest harvest of ripe tunas (magenta fruits) is generally allowed for personal use. Always verify with the specific district — regulations vary.',
    foragerTip: 'Use tongs or thick leather gloves. Burn off glochids (tiny hairlike spines) with a torch or scrub off with a rough cloth before eating. Ripe in July–August.',
  },

  cholla: {
    byLandType: {
      nationalPark:    'prohibited',
      nationalMonument:'prohibited',
      nationalForest:  'limited',
      blm:             'limited',
      statePark:       'prohibited',
    },
    notes: 'Cholla flower buds (harvested before opening in spring) are a traditional O\'odham food. On National Forest and BLM land, small personal quantities are generally permitted. Protected in National Parks and on tribal land without permission.',
    foragerTip: 'Harvest buds with tongs before they open (April–May). Roast or boil to remove oxalates. Do not harvest after blooming.',
  },

  'organ-pipe': {
    byLandType: {
      nationalPark:    'prohibited',
      nationalMonument:'prohibited',
      nationalForest:  'prohibited',
      blm:             'permit-required',
      statePark:       'prohibited',
      tribalLand:      'varies',
    },
    specialProtection: 'Organ Pipe Cactus National Monument prohibits all collection. Protected by AZ Native Plant Law.',
    notes: 'The organ pipe\'s range in the US is almost entirely within the Organ Pipe Cactus National Monument — where collection is completely prohibited. Fruit has been traditionally harvested in Mexico and by Tohono O\'odham communities.',
    foragerTip: 'Legal harvest of organ pipe fruit in the US is extremely limited. Respect both the law and its cultural significance.',
  },

  // ── Desert Trees & Shrubs ─────────────────────────────────────────────────

  mesquite: {
    byLandType: {
      nationalPark:    'prohibited',
      nationalMonument:'prohibited',
      nationalForest:  'limited',
      blm:             'limited',
      statePark:       'prohibited',
      wildernessArea:  'limited',
    },
    personalUseLimit: 'Up to 2 gallons of pods per day on BLM and National Forest land for personal use without permit.',
    notes: 'One of the most forager-accessible desert foods. Ripe yellow-green pods can be ground into mesquite flour (highly nutritious). On BLM and National Forest land, personal-use quantities are generally permitted. Commercial harvest requires a permit.',
    foragerTip: 'Collect ripe (fully yellowed to tan) pods in July–August. Do not collect wet pods — they mold. Dry thoroughly before grinding into flour.',
  },

  'single-leaf-pinyon': {
    byLandType: {
      nationalPark:    'prohibited',
      nationalMonument:'prohibited',
      nationalForest:  'limited',
      blm:             'limited',
      statePark:       'prohibited',
      wildernessArea:  'limited',
    },
    personalUseLimit: 'USFS allows up to 25 lbs of pine nuts per day for personal use on National Forest land. Commercial harvest (selling to buyers) requires a Special Use Permit from the district. BLM rules typically mirror USFS.',
    notes: 'Pine nut collection is a long-standing personal-use tradition on federal land in the Great Basin. In good mast years (every 3–7 years) competition is intense — arrive early, camp on-site.',
    foragerTip: 'Collect in September–October before jays and squirrels clean the trees. Green cones can be collected and dried; wait for natural opening. Nevada and Utah have especially productive districts.',
  },

  'joshua-tree': {
    byLandType: {
      nationalPark:    'prohibited',
      nationalMonument:'prohibited',
      nationalForest:  'limited',
      blm:             'limited',
      statePark:       'prohibited',
    },
    specialProtection: 'Joshua trees are protected under California law (California Endangered Species Act consideration ongoing). Nevada has a Joshua Tree Protection Act.',
    notes: 'Flower buds were traditionally eaten by Native peoples. Collecting is prohibited in all National Parks and most managed areas. Verify with local BLM before any harvest.',
    foragerTip: 'Admire without collecting. Joshua tree populations are under significant climate stress.',
  },

  'four-wing-saltbush': {
    byLandType: {
      nationalPark:    'prohibited',
      nationalMonument:'prohibited',
      nationalForest:  'limited',
      blm:             'allowed',
      statePark:       'prohibited',
      wildernessArea:  'limited',
    },
    personalUseLimit: 'Personal use quantities generally allowed on BLM land.',
    notes: 'Seeds were ground into flour by Navajo and other Great Basin peoples. Leaves can be used as a salt substitute. On BLM land, personal-use foraging is generally permitted.',
    foragerTip: 'Seeds ripen in October. The papery wings make them easy to collect. Grind in a coffee grinder for a salty, earthy flour.',
  },

  // ── Forbs & Wildflowers ───────────────────────────────────────────────────

  'mexican-golden-poppy': {
    byLandType: {
      nationalPark:    'prohibited',
      nationalMonument:'prohibited',
      nationalForest:  'prohibited',
      blm:             'prohibited',
      statePark:       'prohibited',
    },
    specialProtection: 'It is illegal to pick wildflowers in Arizona state parks and on most federal land. During superbloom events, even well-intentioned picking contributes to significant cumulative damage.',
    notes: 'Photographically, not culinarily valuable. Do not pick. The annual spectacle depends on each plant setting thousands of seeds for the next generation.',
    foragerTip: 'Leave them. Picking even a few flowers during a bloom deprives the soil of seeds for future years.',
  },

  'desert-poppy': {
    byLandType: {
      nationalPark:    'prohibited',
      nationalMonument:'prohibited',
      nationalForest:  'prohibited',
      blm:             'prohibited',
      statePark:       'prohibited',
    },
    notes: 'Same restrictions as Mexican golden poppy — wildflower picking is prohibited on virtually all public land in the Southwest.',
    foragerTip: 'Photograph only. These annuals depend on every seed reaching the soil.',
  },

  // ── Fungi ─────────────────────────────────────────────────────────────────

  'desert-puffball': {
    byLandType: {
      nationalPark:    'prohibited',
      nationalMonument:'prohibited',
      nationalForest:  'limited',
      blm:             'limited',
      statePark:       'prohibited',
      wildernessArea:  'limited',
    },
    personalUseLimit: 'USFS allows 2 gallons of mushrooms per day for personal use on National Forest land. Commercial harvest requires a Special Use Permit.',
    notes: 'Desert puffballs appear after monsoon rains July–September. On National Forest and BLM land, personal-use collection is generally permitted. Verify with the specific ranger district.',
    foragerTip: 'Slice in half before eating — the interior must be pure white throughout. Any hint of color, gills, or darkening means do not eat. Sauté in butter.',
  },

  'desert-inky-cap': {
    byLandType: {
      nationalPark:    'prohibited',
      nationalMonument:'prohibited',
      nationalForest:  'limited',
      blm:             'limited',
      statePark:       'prohibited',
    },
    personalUseLimit: 'Same as desert puffball: 2 gallons/day personal use on USFS/BLM land.',
    notes: 'Edible when young before auto-digestion, but TOXIC if consumed with alcohol within 72 hours (coprine compound causes disulfiram-like reaction). Collect only firm, white-gilled specimens.',
    foragerTip: 'Absolutely no alcohol consumption within 3 days of eating inky caps. Even a small amount causes severe flushing, nausea, and racing heart.',
  },
};

export function getForagingLegality(speciesId: string): ForagingLegalityInfo | undefined {
  return FORAGING_MAP[speciesId];
}

export const LAND_TYPE_LABELS: Record<ForagingLandType, string> = {
  nationalPark:     'National Park / Monument',
  nationalMonument: 'National Monument',
  nationalForest:   'National Forest',
  blm:              'BLM Land',
  statePark:        'State Park',
  wildernessArea:   'Wilderness Area',
  tribalLand:       'Tribal Land',
};

export const RULE_CONFIG: Record<ForagingRule, { color: string; icon: string; label: string }> = {
  allowed:          { color: '#5D8A52', icon: 'checkmark-circle', label: 'Allowed'         },
  limited:          { color: '#A8963C', icon: 'leaf-outline',     label: 'Limited'          },
  prohibited:       { color: '#C0392B', icon: 'close-circle',     label: 'Prohibited'       },
  'permit-required':{ color: '#E67E22', icon: 'document-outline', label: 'Permit Required'  },
  varies:           { color: '#7B8FA1', icon: 'help-circle',      label: 'Varies'           },
};
