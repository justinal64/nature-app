// Action-oriented information for invasive species in the catalog.
// "What should I do if I see this?" — report links, removal guidance, ecological context.

export type InvasiveImpactLevel = 'severe' | 'high' | 'moderate';

export type InvasiveInfo = {
  impactLevel: InvasiveImpactLevel;
  impactSummary: string;
  whatToDo: string[];
  whatNotToDo?: string[];
  reportTo?: string;
  removalNote?: string;
  spreadMechanism: string;
};

const INVASIVE_MAP: Partial<Record<string, InvasiveInfo>> = {

  buffelgrass: {
    impactLevel: 'severe',
    impactSummary: 'Transforms the fire-adapted Sonoran Desert into a fire-prone grassland. Native saguaros, ironwoods, and palo verdes are killed by the fires it fuels. Over 500,000 acres of Arizona are now infested.',
    spreadMechanism: "Seeds spread by wind, water, wildlife, vehicles, and hikers' shoes. Germination spikes after summer monsoons.",
    whatToDo: [
      'Report sightings using the iMapInvasives AZ app or AZ CWMA reporting portal',
      'Pull small plants by hand before they set seed (wear gloves — seeds lodge in skin)',
      'Photograph and note GPS location for land managers',
      'Join a removal event with Saguaro National Park, the Arizona Invasive Species Advisory Council, or local Buffelgrass Busting groups',
      'If you drive off-road, brush tires and undercarriage before leaving infested areas',
    ],
    whatNotToDo: [
      'Do not mow or cut it without immediately bagging all material — cut plants re-sprout and seeds remain viable',
      'Do not plant as erosion control or in home landscapes',
      'Do not burn infested areas without a coordinated plan — fire helps buffelgrass spread',
    ],
    reportTo: 'AZ Invasive Plants: azinvasiveplants.org | iMapInvasives: imapinvasives.org',
    removalNote: 'Pull before seed set (before June and after monsoon greening). Larger infestations require herbicide by certified applicators. Contact your nearest National Park or BLM field office for coordinated removal.',
  },

  tamarisk: {
    impactLevel: 'severe',
    impactSummary: 'Has degraded virtually every major riparian corridor in the Southwest. Dramatically reduces water availability, increases soil salinity, and displaces the cottonwood-willow habitat that migrating birds depend on.',
    spreadMechanism: 'Wind-dispersed seeds released in massive quantities; seeds require moist soil to germinate. Spreads along waterways downstream.',
    whatToDo: [
      'Report dense infestations to your local BLM or US Forest Service field office',
      'Support or volunteer for tamarisk removal projects (tamariskcoalition.org)',
      'If you kayak/raft desert rivers, clean your gear between waterways',
      'Note that Tamarisk Beetles (Diorhabda spp.) have been released as biocontrol on some rivers — do not disturb release sites',
    ],
    whatNotToDo: [
      'Do not plant or transplant tamarisk — it is an illegal noxious weed in several SW states',
      'Do not cut and leave stumps unsprayed — they re-sprout aggressively from the base',
    ],
    reportTo: 'Tamarisk Coalition: tamariskcoalition.org | USDA Plants: plants.usda.gov',
    removalNote: 'Mechanical removal must be followed by herbicide treatment of stumps within 1 hour of cutting (imazapyr or triclopyr). Cut-stump treatment is most effective. Large-scale removal should involve professional contractors.',
  },

  cheatgrass: {
    impactLevel: 'severe',
    impactSummary: 'Has converted over 100 million acres of Great Basin sagebrush ecosystem into annual grassland. Increased fire return intervals from 60–110 years to 3–5 years, preventing native plant recovery and accelerating its own spread. Named the most devastating invasive plant in the West.',
    spreadMechanism: 'Sharp-awned seeds attach to clothing, fur, and vehicle undersides. Wind also spreads seeds. Germinates in fall, monopolizes early soil moisture.',
    whatToDo: [
      'Check socks, laces, and cuffs after hiking in Great Basin — remove awns before leaving the area',
      'Brush dog fur thoroughly — awns can work into skin and cause serious injury to pets',
      'Report large new infestations in cheatgrass-free areas to your local BLM office',
      'Volunteer for early detection surveys in high-priority sagebrush areas',
    ],
    whatNotToDo: [
      'Do not graze cheatgrass-infested areas in spring — livestock spread seeds in manure',
      'Do not drive off-road through cheatgrass stands — vehicles are major seed vectors',
    ],
    reportTo: 'Great Basin Invasive Plant Network: sagebrushsea.org | EDDMapS: eddmaps.org',
    removalNote: 'Imazapic herbicide is the most effective treatment at landscape scale, applied in fall after native seed germination. Revegetation with native bunchgrasses is essential after treatment. Consult your BLM district for assistance programs.',
  },

  'sahara-mustard': {
    impactLevel: 'high',
    impactSummary: 'Outcompetes native desert wildflowers in the critical post-winter-rain window. In El Niño years that should produce spectacular blooms, it can dominate entire valleys before native annuals can establish. Affects Anza-Borrego, Joshua Tree, and Mojave National Preserve.',
    spreadMechanism: 'Up to 9,000 seeds per plant dispersed by wind and as a tumbling dry plant. Seeds persist in soil for years.',
    whatToDo: [
      'Hand-pull plants before they set seed — get the root; it re-sprouts if broken',
      'Bag and trash all pulled material — do not compost or leave on-site',
      'Report infestations in wildflower areas to the relevant National Park or California Desert District BLM',
      'Join CNPS (California Native Plant Society) workdays in Joshua Tree or Anza-Borrego',
    ],
    whatNotToDo: [
      'Do not pull after seed set — shaking the plant can spread thousands of seeds',
      'Do not leave pulled plants on the ground — seeds can still mature and disperse',
    ],
    reportTo: 'Mojave Desert Invasive Plants: invasivespeciesinfo.gov | CalWeedMapper: calweedmapper.org',
    removalNote: 'Most effective when pulled in winter before seed formation. Early detection is key — dense stands require herbicide (glyphosate or imazapic) by trained applicators.',
  },

  'russian-thistle': {
    impactLevel: 'moderate',
    impactSummary: 'Colonizes disturbed soils, fallow fields, roadsides, and overgrazed rangeland. While not as ecosystem-transforming as buffelgrass or cheatgrass, it outcompetes native annuals on disturbed ground and produces massive seed loads.',
    spreadMechanism: 'Iconic tumbling dispersal — the entire dried plant breaks off and rolls with wind, broadcasting up to 250,000 seeds across miles of landscape.',
    whatToDo: [
      'Pull or hoe plants while young, before they become woody and spiny',
      'Cut at the base before seed set to prevent tumbling dispersal',
      'Revegetate disturbed soil with native seed mixes — bare disturbed ground is tumbleweed habitat',
    ],
    whatNotToDo: [
      'Do not allow plants to dry and detach — a tumbling plant is a seed machine',
      'Do not mow without bagging — creates many smaller tumbleweeds from broken branches',
    ],
    reportTo: 'EDDMapS: eddmaps.org | USDA PLANTS: plants.usda.gov',
    removalNote: 'Mechanical removal is effective when done early. Metsulfuron and 2,4-D are common herbicide options on rangelands. Most effective on disturbed sites combined with native plant restoration.',
  },

  'african-rue': {
    impactLevel: 'high',
    impactSummary: 'Expanding across Chihuahuan Desert grasslands, displacing native grasses and forbs. Toxic to livestock, wildlife, and humans — all parts contain harmaline alkaloids. Listed as a noxious weed in New Mexico, Arizona, and Nevada.',
    spreadMechanism: 'Seeds dispersed by birds, livestock, and water. Drought-tolerant and persists on heavily grazed, degraded soils where natives cannot.',
    whatToDo: [
      'Report sightings to your state department of agriculture — it is a listed noxious weed',
      'Do not allow livestock to graze it — toxic to sheep and can harm cattle',
      'Small plants can be pulled by hand (wear gloves — seeds toxic if absorbed)',
      'Photograph and GPS-tag new infestations outside known range for early detection',
    ],
    whatNotToDo: [
      'Do not handle extensively without gloves — alkaloids absorbed through skin',
      'Do not compost or spread pulled material — seeds remain viable',
      'Do not allow it to establish near water sources — toxic to livestock at watering holes',
    ],
    reportTo: 'NM Dept of Agriculture: nmda.nmsu.edu | AZ Dept of Agriculture: azda.gov',
    removalNote: 'Picloram or dicamba herbicides are effective. Mechanical removal of small plants is possible with gloves. Large infestations require coordinated treatment with state agency involvement.',
  },

  'western-honey-bee': {
    impactLevel: 'moderate',
    impactSummary: 'European honey bees (Africanized population in SW) compete with native bees for pollen and nectar, and may displace native bees from cavity nest sites. Despite being critical agricultural pollinators, they reduce native bee diversity in areas with high managed hive density.',
    spreadMechanism: 'Established swarms and escaped hives spread naturally. Africanized colonies spread from existing wild populations.',
    whatToDo: [
      'Support native bee habitat: plant native flowering plants and leave bare soil patches for ground-nesting bees',
      'Report feral Africanized hives in high-use recreational areas to your county extension office',
      'Do not disturb or attempt to relocate hives — contact a licensed beekeeper or exterminator',
    ],
    reportTo: 'Arizona Dept of Agriculture Pest Management: azda.gov | Local county extension offices',
  },
};

export function getInvasiveInfo(speciesId: string): InvasiveInfo | undefined {
  return INVASIVE_MAP[speciesId];
}

export const IMPACT_LEVEL_CONFIG: Record<InvasiveImpactLevel, { color: string; label: string }> = {
  severe:   { color: '#C0392B', label: 'Severe Threat' },
  high:     { color: '#E67E22', label: 'High Impact'   },
  moderate: { color: '#F1C40F', label: 'Moderate Impact' },
};
