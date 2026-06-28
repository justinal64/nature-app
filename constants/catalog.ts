import { SpeciesKind } from '@/lib/sightings';

export type Region = 'SONORAN' | 'MOJAVE' | 'CHIHUAHUAN' | 'GREAT_BASIN';

export type SpeciesStat = { label: string; value: string };

export type Species = {
  id: string;
  commonName: string;
  latin: string;
  family: string;
  kind: SpeciesKind;
  region: Region;
  description: string;
  didYouKnow: string;
  idTips: string[];
  stats: SpeciesStat[];
};

export const CATALOG: Species[] = [
  // ─── Plants & Cacti ──────────────────────────────────────────────────────────
  {
    id: 'saguaro',
    commonName: 'Saguaro',
    latin: 'Carnegiea gigantea',
    family: 'Cacti · Cactaceae',
    kind: 'cactus',
    region: 'SONORAN',
    description:
      'The towering icon of the Sonoran Desert. Saguaros can take 70 years to grow their first arm and live for two centuries — pleated trunks swell to hold rainwater after monsoon storms.',
    didYouKnow: 'A flowering Saguaro can hold up to 80 lbs of water in a single arm.',
    idTips: [
      'Ribbed, column-shaped trunk that expands after monsoon rain to store water',
      'Arms typically develop after 50–75 years of growth',
      'White, waxy flowers bloom at arm tips in May–June',
      'Grows only in the Sonoran Desert — Arizona, California, and Sonora, Mexico',
      'Distinctive pleated texture visible on the trunk of mature specimens',
    ],
    stats: [
      { label: 'Habitat', value: 'Sonoran' },
      { label: 'Height', value: '12–18 m' },
      { label: 'Lifespan', value: '150 yr+' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'joshua-tree',
    commonName: 'Joshua Tree',
    latin: 'Yucca brevifolia',
    family: 'Agaves · Asparagaceae',
    kind: 'cactus',
    region: 'MOJAVE',
    description:
      'The symbolic tree of the Mojave Desert. Joshua Trees are actually tree-like yuccas that depend on the yucca moth for pollination — a relationship so specialized that neither can survive without the other.',
    didYouKnow: 'Joshua Trees can live over 500 years and grow very slowly — sometimes less than 2 cm per year.',
    idTips: [
      'Cluster of spiky, dagger-like leaves at branch tips',
      'Twisted, branching trunk with rough, fibrous bark',
      'Creamy white flowers in dense clusters, January–April',
      'Found above 400 m elevation in the Mojave Desert only',
      'Old trees may have dozens of upward-pointing branches',
    ],
    stats: [
      { label: 'Habitat', value: 'Mojave' },
      { label: 'Height', value: '4–15 m' },
      { label: 'Lifespan', value: '500 yr+' },
      { label: 'Status', value: 'Threatened' },
    ],
  },
  {
    id: 'palo-verde',
    commonName: 'Blue Palo Verde',
    latin: 'Parkinsonia florida',
    family: 'Legumes · Fabaceae',
    kind: 'cactus',
    region: 'SONORAN',
    description:
      'The Arizona state tree. Its green bark performs photosynthesis even when leafless during drought — a rare adaptation that gives the tree its distinctive color year-round.',
    didYouKnow: 'Palo Verde means "green stick" in Spanish — the bark can photosynthesize even without leaves.',
    idTips: [
      'Bright green bark on trunk and branches (unique among desert trees)',
      'Tiny, bipinnate leaves that drop in dry seasons',
      'Brilliant yellow flowers blanket the canopy in spring',
      'Smooth, bluish-green twigs with small thorns at nodes',
      'State tree of Arizona',
    ],
    stats: [
      { label: 'Habitat', value: 'Sonoran' },
      { label: 'Height', value: '5–10 m' },
      { label: 'Lifespan', value: '100 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'mesquite',
    commonName: 'Velvet Mesquite',
    latin: 'Prosopis velutina',
    family: 'Legumes · Fabaceae',
    kind: 'cactus',
    region: 'SONORAN',
    description:
      'One of the most ecologically important trees in the Sonoran Desert. Its seed pods fed indigenous peoples for millennia and its deep taproot can reach water 50 meters underground.',
    didYouKnow: 'Mesquite roots have been found 53 meters (174 ft) deep — among the deepest of any plant.',
    idTips: [
      'Compound leaves with 10–30 pairs of tiny leaflets per pinnae',
      'Paired thorns at leaf nodes',
      'Catkin-like yellowish-white flower spikes in spring',
      'Distinctive twisted, bean-like seed pods, tan to reddish',
      'Dark, furrowed bark on older trunks',
    ],
    stats: [
      { label: 'Habitat', value: 'Sonoran' },
      { label: 'Height', value: '6–9 m' },
      { label: 'Lifespan', value: '200 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'ocotillo',
    commonName: 'Ocotillo',
    latin: 'Fouquieria splendens',
    family: 'Candlewood · Fouquieriaceae',
    kind: 'cactus',
    region: 'SONORAN',
    description:
      'Not a cactus, but equally iconic. Ocotillo produces leaves within 72 hours of rain and drops them during drought — cycling through this process up to five times per year.',
    didYouKnow: 'Ocotillo can leaf out and drop leaves five or more times a year in response to rain.',
    idTips: [
      'Cluster of tall, spiny, unbranched cane-like stems radiating upward',
      'Brilliant red-orange tubular flowers at stem tips in spring',
      'Small, oval leaves appear after rainfall and drop in drought',
      'Stems appear dead and grey when dry, green when wet',
      'Up to 30 canes emerging from a single base',
    ],
    stats: [
      { label: 'Habitat', value: 'Sonoran' },
      { label: 'Height', value: '3–10 m' },
      { label: 'Lifespan', value: '60 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'ironwood',
    commonName: 'Desert Ironwood',
    latin: 'Olneya tesota',
    family: 'Legumes · Fabaceae',
    kind: 'cactus',
    region: 'SONORAN',
    description:
      'The longest-lived native tree of the Sonoran Desert. Ironwood acts as a nurse plant — its shade and leaf litter create a microclimate where young saguaros and other species establish themselves.',
    didYouKnow: 'Ironwood is so dense it sinks in water — one of the heaviest woods in North America.',
    idTips: [
      'Dark, deeply furrowed bark on older specimens',
      'Small, blue-grey compound leaves with paired thorns at nodes',
      'Lavender to pink pea-shaped flowers in May–June',
      'Dense, rounded canopy providing reliable shade',
      'Found in washes and rocky slopes below 760 m',
    ],
    stats: [
      { label: 'Habitat', value: 'Sonoran' },
      { label: 'Height', value: '5–10 m' },
      { label: 'Lifespan', value: '800 yr+' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'barrel-cactus',
    commonName: 'Fishhook Barrel Cactus',
    latin: 'Ferocactus wislizeni',
    family: 'Cacti · Cactaceae',
    kind: 'cactus',
    region: 'SONORAN',
    description:
      'The barrel cactus leans slightly southwest — toward the sun — earning it the folk name "compass cactus." Orange or yellow flowers ring the top of mature plants in late summer.',
    didYouKnow: 'Barrel cacti lean toward the sun, so in the Sonoran Desert they tilt slightly to the southwest.',
    idTips: [
      'Stout, barrel-shaped body, rarely branching',
      'Distinctive hooked central spines (the "fishhook")',
      'Red-orange flowers at the crown in July–September',
      'Yellow fruit persists on the plant through winter',
      'Often leans noticeably to the south or southwest',
    ],
    stats: [
      { label: 'Habitat', value: 'Sonoran' },
      { label: 'Height', value: '0.6–2 m' },
      { label: 'Lifespan', value: '100+ yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'organ-pipe',
    commonName: 'Organ Pipe Cactus',
    latin: 'Stenocereus thurberi',
    family: 'Cacti · Cactaceae',
    kind: 'cactus',
    region: 'SONORAN',
    description:
      'Unlike the Saguaro, the Organ Pipe branches from the base into multiple stems resembling organ pipes. It blooms at night, and its purple-tinged fruit is an important food source for bats and coyotes.',
    didYouKnow: 'Organ Pipe flowers open only at night and are pollinated by lesser long-nosed bats.',
    idTips: [
      'Multiple columnar stems arising from a single base with no central trunk',
      'Stems appear similar to Saguaro but shorter and more numerous',
      'Pale pink to white night-blooming flowers at stem tips',
      'Reddish-purple edible fruit (pitaya dulce) in summer',
      'Found in US only in Organ Pipe Cactus National Monument area',
    ],
    stats: [
      { label: 'Habitat', value: 'Sonoran' },
      { label: 'Height', value: '3–8 m' },
      { label: 'Lifespan', value: '150 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'cholla',
    commonName: 'Jumping Cholla',
    latin: 'Cylindropuntia fulgida',
    family: 'Cacti · Cactaceae',
    kind: 'cactus',
    region: 'SONORAN',
    description:
      'Famous for appearing to jump onto passers-by, cholla stems don\'t actually launch themselves — the barbed spines grip so efficiently that the slightest brush detaches a segment. Entire cholla "forests" often form from clonal stem drop.',
    didYouKnow: 'Jumping cholla forests can cover acres — each plant often a clone of the original, spread by detached stem segments.',
    idTips: [
      'Dense, silvery-grey spines covering the entire stem',
      'Segments detach at the slightest touch due to backward-barbed spines',
      'Chain-like clusters of old fruit hanging from stems',
      'Pink to lavender flowers in summer',
      'Tree-like form with drooping, chained fruit clusters',
    ],
    stats: [
      { label: 'Habitat', value: 'Sonoran' },
      { label: 'Height', value: '1–4 m' },
      { label: 'Lifespan', value: '20 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'desert-willow',
    commonName: 'Desert Willow',
    latin: 'Chilopsis linearis',
    family: 'Bignonia · Bignoniaceae',
    kind: 'cactus',
    region: 'CHIHUAHUAN',
    description:
      'Not a true willow, but named for its long, narrow leaves. It produces showy orchid-like flowers and is found along desert washes where it can access subsurface water.',
    didYouKnow: 'Desert Willow produces seed pods that can remain on the tree for over a year after the flowers fade.',
    idTips: [
      'Long, narrow, willow-like leaves 10–26 cm long',
      'Showy pink-to-purple trumpet flowers with yellow-striped throat',
      'Long, thin seed pods resembling green beans hanging from branches',
      'Found almost exclusively in dry stream beds and washes',
      'Twisting trunk with shaggy, peeling bark on older trees',
    ],
    stats: [
      { label: 'Habitat', value: 'Washes' },
      { label: 'Height', value: '3–9 m' },
      { label: 'Lifespan', value: '80 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },

  // ─── Birds ───────────────────────────────────────────────────────────────────
  {
    id: 'gambels-quail',
    commonName: "Gambel's Quail",
    latin: 'Callipepla gambelii',
    family: 'New World Quail · Odontophoridae',
    kind: 'bird',
    region: 'SONORAN',
    description:
      "The signature bird of the Sonoran Desert. Gambel's Quail travel in coveys of 10–40 birds and communicate with a distinctive three-note \"chi-ca-go\" call that echoes through desert washes.",
    didYouKnow: "Gambel's Quail chicks can run within hours of hatching and follow their parents immediately.",
    idTips: [
      'Distinctive teardrop-shaped black topknot plume (longer on males)',
      'Males have rufous cap, black face and throat with white border',
      'Females are buffy-brown overall with a shorter plume',
      'Rounded body, short tail, usually seen running rather than flying',
      "Distinctive three-note call: \"chi-ca-go\"",
    ],
    stats: [
      { label: 'Habitat', value: 'Desert scrub' },
      { label: 'Length', value: '25–28 cm' },
      { label: 'Lifespan', value: '3–5 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'roadrunner',
    commonName: 'Greater Roadrunner',
    latin: 'Geococcyx californianus',
    family: 'Cuckoos · Cuculidae',
    kind: 'bird',
    region: 'SONORAN',
    description:
      'The Greater Roadrunner is a ground-dwelling cuckoo that can run at 32 km/h. It kills rattlesnakes by pinning them to the ground, then whipping them against rocks or biting them behind the head.',
    didYouKnow: 'Roadrunners can kill and eat venomous rattlesnakes — they sometimes take on prey twice their length.',
    idTips: [
      'Large, slender ground-dwelling bird with a long tail held horizontally',
      'Brown and white streaked plumage with iridescent sheen',
      'Prominent shaggy crest often raised when excited',
      'Blue and red skin patch behind the eye (bare postocular skin)',
      'Runs with tail and head held level, rarely flies',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert scrub' },
      { label: 'Length', value: '52–62 cm' },
      { label: 'Lifespan', value: '7–8 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'gila-woodpecker',
    commonName: 'Gila Woodpecker',
    latin: 'Melanerpes uropygialis',
    family: 'Woodpeckers · Picidae',
    kind: 'bird',
    region: 'SONORAN',
    description:
      'The Gila Woodpecker excavates nest cavities in living Saguaro cacti. The cactus seals around the wound, forming a hard, gourd-like "boot" — cavities abandoned by woodpeckers become homes for Elf Owls and other cavity nesters.',
    didYouKnow: 'Gila Woodpecker nest cavities in Saguaros harden into "boots" that indigenous peoples used as water canteens.',
    idTips: [
      'Black and white barred back and wings (zebra pattern)',
      'Plain tan-grey head and underparts',
      'Males have a bright red crown patch',
      'Often seen on Saguaro cacti, hammering for insects or excavating nests',
      'Loud, rolling "churr" call frequently heard before the bird is seen',
    ],
    stats: [
      { label: 'Habitat', value: 'Saguaro desert' },
      { label: 'Length', value: '20–24 cm' },
      { label: 'Lifespan', value: '10 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'cactus-wren',
    commonName: 'Cactus Wren',
    latin: 'Campylorhynchus brunneicapillus',
    family: 'Wrens · Troglodytidae',
    kind: 'bird',
    region: 'SONORAN',
    description:
      "The largest wren in North America and the Arizona state bird. Cactus Wrens build football-shaped nests deep inside cholla cacti, using the spines as armor against predators.",
    didYouKnow: 'Cactus Wrens build multiple nests — males maintain "dummy" nests to confuse predators while females incubate eggs in the real one.',
    idTips: [
      'Bold white eyebrow stripe contrasting with brown cap',
      'Heavy brown spotting on white chest and belly',
      'Large, chunky body for a wren; long, slightly curved bill',
      'Typically found in or near cholla, ocotillo, or prickly pear',
      "Loud, repeated 'churr-churr-churr' call sounds like a car that won't start",
    ],
    stats: [
      { label: 'Habitat', value: 'Cactus scrub' },
      { label: 'Length', value: '18–22 cm' },
      { label: 'Lifespan', value: '7 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'vermilion-flycatcher',
    commonName: 'Vermilion Flycatcher',
    latin: 'Pyrocephalus rubinus',
    family: 'Tyrant Flycatchers · Tyrannidae',
    kind: 'bird',
    region: 'SONORAN',
    description:
      'One of the most brilliantly colored birds in North America. The male\'s vivid scarlet-and-black plumage is unmistakable. It catches insects in mid-air with quick, acrobatic sallies from low perches near water.',
    didYouKnow: 'Male Vermilion Flycatchers display by fluttering upward in a "butterfly flight" while puffing out their red chest feathers to impress females.',
    idTips: [
      'Males: brilliant scarlet crown and underparts, dark brown-black back and wings',
      'Females: grey-brown above, with peachy-pink wash on belly and fine streaking on chest',
      'Small, compact flycatcher; often bobs tail',
      'Found near desert water sources — streams, ponds, irrigated areas',
      'Frequently sallies out to catch insects in mid-air from open perches',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert riparian' },
      { label: 'Length', value: '12–14 cm' },
      { label: 'Lifespan', value: '5 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'turkey-vulture',
    commonName: 'Turkey Vulture',
    latin: 'Cathartes aura',
    family: 'New World Vultures · Cathartidae',
    kind: 'bird',
    region: 'SONORAN',
    description:
      "Turkey Vultures locate carrion almost entirely by smell — unusual among birds. They soar for hours on thermals with a characteristic V-shaped \"dihedral\" wing posture, rocking side to side.",
    didYouKnow: 'Turkey Vultures have a stomach acid so strong it destroys anthrax, botulism, and cholera bacteria — they are nature\'s hazmat crew.',
    idTips: [
      'All-dark plumage with silver-grey flight feathers on the underwing',
      'Naked red head (adults); grey head on juveniles',
      'V-shaped dihedral wing posture in soaring flight, with frequent rocking',
      'Much larger than hawks; slower, more unsteady wing beats',
      'Often seen in groups roosting on utility poles or bare trees at dawn',
    ],
    stats: [
      { label: 'Habitat', value: 'Widespread' },
      { label: 'Wingspan', value: '170–183 cm' },
      { label: 'Lifespan', value: '16 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'costas-hummingbird',
    commonName: "Costa's Hummingbird",
    latin: 'Calypte costae',
    family: 'Hummingbirds · Trochilidae',
    kind: 'bird',
    region: 'SONORAN',
    description:
      "One of the smallest hummingbirds in North America and uniquely suited to the Sonoran Desert. Costa's Hummingbirds breed in winter and early spring to take advantage of desert wildflower blooms.",
    didYouKnow: "Costa's Hummingbirds enter torpor on cold nights — dropping their heart rate from 500+ bpm to as low as 50 bpm to conserve energy.",
    idTips: [
      'Males: brilliant amethyst-purple crown and flared gorget extending down the sides of the neck',
      'Females: grey-green above, whitish below, with minimal spotting on throat',
      'Very small, compact hummingbird with short bill',
      'Found in dry desert washes and desert scrub below 900 m',
      'U-shaped display dive with a prolonged, high-pitched whistle',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert scrub' },
      { label: 'Length', value: '7.5–8.5 cm' },
      { label: 'Lifespan', value: '6 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'great-horned-owl',
    commonName: 'Great Horned Owl',
    latin: 'Bubo virginianus',
    family: 'Owls · Strigidae',
    kind: 'bird',
    region: 'SONORAN',
    description:
      'The most widespread owl in the Americas and one of the most powerful. Great Horned Owls can take prey as large as herons and skunks. They often nest in abandoned hawk or raven nests, beginning as early as January.',
    didYouKnow: 'Great Horned Owls have a grip strength of about 300 psi — stronger than a human hand and enough to crush a skunk\'s spine.',
    idTips: [
      'Large size with prominent ear tufts ("horns") set wide apart',
      'Deep rusty or brown facial disc with white throat patch',
      'Finely barred underparts of brown and white',
      'Deep, resonant hooting: "hoo-hoo hoooooo hoo-hoo"',
      'Yellow eyes; silent flight due to comb-like wing feather edges',
    ],
    stats: [
      { label: 'Habitat', value: 'Widespread' },
      { label: 'Wingspan', value: '91–153 cm' },
      { label: 'Lifespan', value: '13 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'phainopepla',
    commonName: 'Phainopepla',
    latin: 'Phainopepla nitens',
    family: 'Silky Flycatchers · Ptilogonatidae',
    kind: 'bird',
    region: 'SONORAN',
    description:
      'The Phainopepla is a silky-flycatcher that depends heavily on desert mistletoe. A single bird can eat 1,100 mistletoe berries per day. By depositing seeds in bird droppings, they spread the parasitic plant that sustains them.',
    didYouKnow: 'A Phainopepla can eat over 1,000 mistletoe berries in a single day and may visit 12 different territories across two breeding seasons.',
    idTips: [
      'Males: glossy blue-black with bright red eye and prominent crest',
      'Females: grey with red eye and visible crest',
      'White wing patches visible in flight (conspicuous on males)',
      'Slender body, long tail; perches upright on exposed branches',
      'Found in desert washes with mistletoe-infested mesquite and ironwood',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert washes' },
      { label: 'Length', value: '19–20 cm' },
      { label: 'Lifespan', value: '5 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'mourning-dove',
    commonName: 'Mourning Dove',
    latin: 'Zenaida macroura',
    family: 'Pigeons · Columbidae',
    kind: 'bird',
    region: 'SONORAN',
    description:
      'The most abundant wild bird in North America. The Mourning Dove\'s soft, mournful cooing is one of the most familiar sounds of desert mornings. They can drink brackish water too salty for most animals.',
    didYouKnow: 'Mourning Doves can drink water with three times the salt concentration of seawater — a critical adaptation for desert survival.',
    idTips: [
      'Slender body with long, pointed tail with white tips visible in flight',
      'Soft pinkish-buff plumage with small black spots on wing coverts',
      'Small, round head with blue-grey eye ring',
      'Loud, whistling wingbeats on takeoff',
      "Mournful, cooing call: \"ooah-oo-oo-oo\" often mistaken for an owl",
    ],
    stats: [
      { label: 'Habitat', value: 'Widespread' },
      { label: 'Length', value: '22–36 cm' },
      { label: 'Lifespan', value: '5 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },

  // ─── Insects & Arthropods ─────────────────────────────────────────────────────
  {
    id: 'tarantula-hawk',
    commonName: 'Tarantula Hawk',
    latin: 'Pepsis grossa',
    family: 'Spider Wasps · Pompilidae',
    kind: 'insect',
    region: 'SONORAN',
    description:
      'A large, solitary wasp that hunts tarantulas to provision its nest. The female paralyzes a tarantula with her venom, buries it with her egg, and the larva feeds on the living spider. Its sting is rated among the most painful insect stings in the world.',
    didYouKnow: 'The Tarantula Hawk has the second-most painful insect sting in the world, yet adult wasps are nearly harmless — they feed only on nectar.',
    idTips: [
      'Large wasp (3–5 cm); metallic blue-black body with rust-orange wings',
      'Orange wings are visible even at rest and distinctly bright in flight',
      'Females have a long, curved stinger used only to paralyze tarantulas',
      'Adults visit flowers — particularly milkweed — for nectar',
      'New Mexico state insect; often found near tarantula burrows',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert scrub' },
      { label: 'Length', value: '3–5 cm' },
      { label: 'Lifespan', value: '1 season' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'arizona-bark-scorpion',
    commonName: 'Arizona Bark Scorpion',
    latin: 'Centruroides sculpturatus',
    family: 'Scorpions · Buthidae',
    kind: 'insect',
    region: 'SONORAN',
    description:
      'The most venomous scorpion in North America. Unlike most scorpions that burrow, the Bark Scorpion climbs — it can be found on walls, in shoes, or clinging upside-down to bark. It glows bright blue-green under ultraviolet light.',
    didYouKnow: 'Arizona Bark Scorpions can climb glass and often enter homes by scaling rough exterior walls — they glow bright teal under a black light.',
    idTips: [
      'Slender build; pale tan to yellow-brown color with slightly darker stripes',
      'Tail (metasoma) held laterally rather than curled upright when resting',
      'Climbs vertical surfaces including rock faces, trees, and walls',
      'Glows bright blue-green under UV (black) light',
      'Smaller than most other Sonoran scorpions; about 5–8 cm total length',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert, suburbs' },
      { label: 'Length', value: '5–8 cm' },
      { label: 'Lifespan', value: '6 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'desert-tarantula',
    commonName: 'Desert Blonde Tarantula',
    latin: 'Aphonopelma chalcodes',
    family: 'Tarantulas · Theraphosidae',
    kind: 'insect',
    region: 'SONORAN',
    description:
      'The most commonly encountered tarantula in the Sonoran Desert. Females can live 25 years; males die within a year of their first mating season. Late summer monsoons trigger males to wander in search of mates.',
    didYouKnow: 'Female Desert Tarantulas can live up to 25 years and rarely leave their burrow, while males die after their first mating season.',
    idTips: [
      'Large, hairy spider; females brown, males darker with pale golden-blonde hairs on abdomen',
      'Eight eyes arranged in two rows across the front of the carapace',
      'Abdomen noticeably darker on males during mating season',
      'Burrows visible at the base of shrubs; spun silk at entrance',
      'Most active at night; day-active males during late July–October mating season',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert scrub' },
      { label: 'Leg Span', value: '10–14 cm' },
      { label: 'Lifespan', value: '25 yr (F)' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'palo-verde-beetle',
    commonName: 'Palo Verde Beetle',
    latin: 'Derobrachus geminatus',
    family: 'Longhorn Beetles · Cerambycidae',
    kind: 'insect',
    region: 'SONORAN',
    description:
      'One of the largest beetles in North America. Despite their formidable size and long antennae, adult Palo Verde Beetles do not eat — they emerge for only a few weeks during monsoon season to mate, then die.',
    didYouKnow: 'Palo Verde Beetles spend up to 3 years underground as larvae feeding on roots, then emerge as adults for just a few weeks to mate.',
    idTips: [
      'Very large beetle (5–9 cm); dark brown to black with spiny thorax',
      'Long, segmented antennae often as long as the body',
      'Spiny projections along the edges of the thorax',
      'Adults attracted to lights at night, July–August',
      'Larvae (grubs) found in the soil around Palo Verde and other desert tree roots',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert scrub' },
      { label: 'Length', value: '5–9 cm' },
      { label: 'Lifespan', value: '3 yr total' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'monarch-butterfly',
    commonName: 'Monarch Butterfly',
    latin: 'Danaus plexippus',
    family: 'Brush-footed Butterflies · Nymphalidae',
    kind: 'insect',
    region: 'SONORAN',
    description:
      'The most iconic migratory insect in North America. Monarchs travel up to 4,800 km between their wintering grounds in Mexico and summer breeding grounds in Canada — a journey no single butterfly completes twice.',
    didYouKnow: 'The migratory generation of Monarchs lives 8 months — six times longer than summer generations — to survive the round trip to Mexico.',
    idTips: [
      'Bold orange wings with black vein pattern and white-dotted black borders',
      'Males have a black dot (scent gland) on each hindwing along a vein',
      'Slow, gliding flight interspersed with wing flaps',
      'Caterpillars are yellow, white, and black striped; feed only on milkweed',
      'Often seen visiting desert milkweed (Asclepias subulata) in the Sonoran Desert',
    ],
    stats: [
      { label: 'Habitat', value: 'Milkweed areas' },
      { label: 'Wingspan', value: '9–10 cm' },
      { label: 'Lifespan', value: '2–8 months' },
      { label: 'Status', value: 'Endangered' },
    ],
  },
  {
    id: 'velvet-ant',
    commonName: 'Velvet Ant (Cow Killer)',
    latin: 'Dasymutilla magnifica',
    family: 'Velvet Ants · Mutillidae',
    kind: 'insect',
    region: 'SONORAN',
    description:
      'Not an ant at all, but a wingless wasp. The female\'s dense, velvet-like red-and-black hair is a warning — her sting is so painful it earned the folk name "cow killer." Males have wings and look quite different.',
    didYouKnow: 'Velvet Ants have an exoskeleton so tough it can survive being run over by a car — it protects them from bee and wasp stings when raiding nests.',
    idTips: [
      'Females: wingless, covered in dense, velvety red and black hair',
      'Males: winged; similar coloration but less distinctive',
      'Walks rapidly across open desert ground',
      'Squeaks (stridulates) when handled as a warning',
      'Solitary; parasitizes nests of ground-nesting bees and wasps',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert scrub' },
      { label: 'Length', value: '1.5–2.5 cm' },
      { label: 'Lifespan', value: '1 season' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'giant-desert-centipede',
    commonName: 'Giant Desert Centipede',
    latin: 'Scolopendra heros',
    family: 'Scolopendridae · Scolopendromorpha',
    kind: 'insect',
    region: 'SONORAN',
    description:
      'The largest centipede in North America. Nocturnal and fast, it preys on insects, lizards, toads, and even small rodents. Its forcipules (modified front legs) deliver a bite that causes intense pain in humans.',
    didYouKnow: 'Giant Desert Centipedes have been observed climbing cave walls to catch bats in mid-air.',
    idTips: [
      'Up to 20 cm long; body flattened with 21–23 pairs of legs',
      'Alternating dark blue/black and rusty-orange body segments',
      'Bright yellow legs, which become darker toward the rear',
      'Moves very quickly; nocturnal but sometimes seen on warm evenings',
      'Head and last segment are dark colored; middle segments have turquoise sheen',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert, rocky' },
      { label: 'Length', value: '15–20 cm' },
      { label: 'Lifespan', value: '5–6 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'black-widow',
    commonName: 'Western Black Widow',
    latin: 'Latrodectus hesperus',
    family: 'Cobweb Spiders · Theridiidae',
    kind: 'insect',
    region: 'SONORAN',
    description:
      'One of the few medically significant spiders in the United States. The Western Black Widow is shy and non-aggressive; bites almost always occur when the spider is accidentally pressed against skin. Antivenom is widely available.',
    didYouKnow: 'Only female Black Widows are venomous to humans — males are too small to pierce human skin and their venom is far weaker.',
    idTips: [
      'Females: glossy black abdomen with a distinctive red hourglass on the underside',
      'Males: smaller, brown with cream and red markings — harmless to humans',
      'Messy, irregular cobweb built low to the ground, in dark protected spots',
      'Hangs upside-down in its web',
      'Found in wood piles, rock crevices, outdoor furniture, and garages',
    ],
    stats: [
      { label: 'Habitat', value: 'Widespread' },
      { label: 'Body', value: '1.5–3 cm (F)' },
      { label: 'Lifespan', value: '1–3 yr (F)' },
      { label: 'Status', value: 'Stable' },
    ],
  },

  // ─── Snakes ───────────────────────────────────────────────────────────────────
  {
    id: 'western-diamondback',
    commonName: 'Western Diamondback Rattlesnake',
    latin: 'Crotalus atrox',
    family: 'Pit Vipers · Viperidae',
    kind: 'snake',
    region: 'SONORAN',
    description:
      'The most commonly encountered venomous snake in Arizona and responsible for the majority of snakebites in the southwestern US. It is not aggressive, but stands its ground when threatened and delivers a potent hemotoxic venom.',
    didYouKnow: 'Western Diamondbacks are ectothermic but can detect infrared heat with pit organs between their eyes and nostrils — allowing them to strike warm-blooded prey in complete darkness.',
    idTips: [
      'Bold diamond-shaped pattern along the back; typically grey-brown with dark borders',
      'Distinctive black and white banded tail just above the rattle',
      'Triangular head, noticeably wider than the neck',
      'Heat-sensing pit organs between the eye and nostril',
      'Rattle at the tip of the tail; adds a segment each time it sheds (not its age)',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert, scrub' },
      { label: 'Length', value: '0.9–1.7 m' },
      { label: 'Lifespan', value: '20+ yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'mojave-rattlesnake',
    commonName: 'Mojave Rattlesnake',
    latin: 'Crotalus scutulatus',
    family: 'Pit Vipers · Viperidae',
    kind: 'snake',
    region: 'SONORAN',
    description:
      'Considered to have the most potent venom of any rattlesnake in the US. Some populations produce Mojave toxin A (a neurotoxin) in addition to hemotoxic components. Often confused with the Western Diamondback.',
    didYouKnow: 'Mojave Rattlesnake venom varies significantly by population — some individuals produce primarily neurotoxin, others mainly hemotoxin.',
    idTips: [
      'Similar diamond pattern to the Western Diamondback, but greener in overall tone',
      'White tail bands are wider than the black bands (opposite of diamondback)',
      'Scales between the eyes are large and prominent (supraocular scales)',
      'More slender build than the Western Diamondback',
      'Typically found at higher elevations in more open desert terrain',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert flats' },
      { label: 'Length', value: '0.9–1.3 m' },
      { label: 'Lifespan', value: '20 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'sonoran-coral-snake',
    commonName: 'Sonoran Coral Snake',
    latin: 'Micruroides euryxanthus',
    family: 'Elapids · Elapidae',
    kind: 'snake',
    region: 'SONORAN',
    description:
      'The only coral snake species in the western US. Despite its highly neurotoxic venom, it is extremely secretive and rarely bites humans. The vivid red, yellow, and black banding warns predators of its toxicity.',
    didYouKnow: 'The Sonoran Coral Snake has a unique defense: it hides its head under its coils and raises its tail, mimicking its head to confuse predators.',
    idTips: [
      'Bright red, yellow, and black banding: "red touches yellow, kill a fellow"',
      'Small, slender snake with a blunt head not wider than the neck',
      'Smooth, shiny scales',
      'Secretive; usually found under rocks, logs, or in loose soil',
      'Active at dusk and night, especially after summer monsoon rains',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert scrub' },
      { label: 'Length', value: '40–60 cm' },
      { label: 'Lifespan', value: '15 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'sidewinder',
    commonName: 'Sidewinder',
    latin: 'Crotalus cerastes',
    family: 'Pit Vipers · Viperidae',
    kind: 'snake',
    region: 'SONORAN',
    description:
      'Named for its distinctive sidewinding locomotion — an adaptation for moving across loose sand without sinking. The Sidewinder has horn-like projections above its eyes and is the smallest rattlesnake in the Sonoran Desert.',
    didYouKnow: 'Sidewinding locomotion allows the snake to cross loose sand at up to 2 km/h while leaving only two parallel tracks — each a J-shaped mark.',
    idTips: [
      'Small rattlesnake (rarely over 80 cm); sand-colored with a blotched pattern',
      'Distinctive raised horn-like projections (supraocular scales) above each eye',
      'Leaves distinctive J-shaped parallel tracks in sand',
      'Moves sideways through a unique rolling motion unlike most snakes',
      'Burrows under shrubs or into rodent burrows to escape heat',
    ],
    stats: [
      { label: 'Habitat', value: 'Sandy desert' },
      { label: 'Length', value: '45–80 cm' },
      { label: 'Lifespan', value: '13 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'gopher-snake',
    commonName: 'Gopher Snake',
    latin: 'Pituophis catenifer',
    family: 'Colubrids · Colubridae',
    kind: 'snake',
    region: 'SONORAN',
    description:
      'The most commonly encountered large snake in the Sonoran Desert. When threatened, it mimics a rattlesnake by flattening its head, vibrating its tail rapidly, and hissing loudly — a bluff that fools predators and hikers alike.',
    didYouKnow: 'Gopher Snakes are immune to many rodent-transmitted diseases and are among the best natural rodent controllers in the desert.',
    idTips: [
      'Large (often 1.2–1.5 m), with a yellowish-tan body and dark dorsal blotches',
      'Narrow head, not triangular; no heat-sensing pits between eye and nostril',
      'Round pupils (rattlesnakes have vertical, cat-like pupils)',
      'When threatened, vibrates tail rapidly and flattens head to appear like a rattlesnake',
      'No rattle — the sound from tail vibrating in dry leaves can be convincing',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert, grassland' },
      { label: 'Length', value: '0.9–1.8 m' },
      { label: 'Lifespan', value: '15 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'coachwhip',
    commonName: 'Red Racer (Coachwhip)',
    latin: 'Masticophis flagellum piceus',
    family: 'Colubrids · Colubridae',
    kind: 'snake',
    region: 'SONORAN',
    description:
      'The fastest snake in North America, capable of short bursts up to 6 km/h. The Red Racer is a subspecies of coachwhip named for the whip-like pattern of its scales. It is an active, diurnal hunter that chases lizards in the open desert.',
    didYouKnow: 'Coachwhips are entirely diurnal — they actively chase prey by day rather than ambushing at night like most desert snakes.',
    idTips: [
      'Head and neck are red to pinkish; body becomes darker, often black toward the tail',
      'Very slender and long with a long, thin tail',
      'Scales have a braided, whip-like pattern',
      'Extremely fast-moving; often seen crossing roads at high speed',
      'When cornered, may strike repeatedly and vibrate tail',
    ],
    stats: [
      { label: 'Habitat', value: 'Open desert' },
      { label: 'Length', value: '1.2–1.8 m' },
      { label: 'Lifespan', value: '10 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'kingsnake',
    commonName: 'Sonoran Mountain Kingsnake',
    latin: 'Lampropeltis pyromelana',
    family: 'Colubrids · Colubridae',
    kind: 'snake',
    region: 'SONORAN',
    description:
      'A strikingly beautiful non-venomous snake that closely mimics the Sonoran Coral Snake. It is immune to rattlesnake venom and regularly preys on other snakes, including rattlesnakes. Remember: "red touches black, safe for Jack."',
    didYouKnow: 'Kingsnakes are immune to pit viper venom and actively hunt and eat rattlesnakes — one of the few animals that does so regularly.',
    idTips: [
      'Red, black, and white (or yellow) banding: red is bordered by black, not yellow',
      '"Red touches black, safe for Jack" — distinguishes it from the coral snake',
      'Round pupils; head not much wider than the neck',
      'Smooth, shiny scales that give a clean, bright appearance',
      'Found at higher elevations (800–2700 m) in rocky, mountainous desert terrain',
    ],
    stats: [
      { label: 'Habitat', value: 'Rocky slopes' },
      { label: 'Length', value: '60–110 cm' },
      { label: 'Lifespan', value: '20 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
  {
    id: 'desert-nightsnake',
    commonName: 'Desert Nightsnake',
    latin: 'Hypsiglena chlorophaea',
    family: 'Colubrids · Colubridae',
    kind: 'snake',
    region: 'SONORAN',
    description:
      'A small, nocturnal snake with vertical pupils that give it an unsettling, viper-like appearance. It is mildly venomous but its rear-fanged delivery makes it harmless to humans. It specializes in eating lizards and their eggs.',
    didYouKnow: 'Nightsnakes have vertical pupils like cats — one of the few non-viper North American snakes with this feature.',
    idTips: [
      'Small (30–50 cm), grey to tan with dark brown blotches along the back',
      'Vertical, cat-like pupils — distinctive for a non-viper',
      'Dark brown patches on the sides of the neck behind the head',
      'Smooth scales; slender build',
      'Strictly nocturnal; found under rocks and in rocky desert terrain',
    ],
    stats: [
      { label: 'Habitat', value: 'Rocky desert' },
      { label: 'Length', value: '30–55 cm' },
      { label: 'Lifespan', value: '10 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
];

export function getSpeciesById(id: string): Species | undefined {
  return CATALOG.find((s) => s.id === id);
}

export function getCatalogByKind(kind: SpeciesKind): Species[] {
  return CATALOG.filter((s) => s.kind === kind);
}

export function getCategoryCount(kind: SpeciesKind): number {
  return getCatalogByKind(kind).length;
}
