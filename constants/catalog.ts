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

  // ─── Mojave Desert ────────────────────────────────────────────────────────────
  {
    id: 'creosote-bush',
    commonName: 'Creosote Bush',
    latin: 'Larrea tridentata',
    family: 'Caltrop Family · Zygophyllaceae',
    kind: 'cactus',
    region: 'MOJAVE',
    description:
      'The most widely distributed shrub in the Mojave and Sonoran Deserts, identifiable by its distinctive resinous smell after rain. Some creosote clones in the Mojave are estimated to be over 11,000 years old — among the oldest living plants on Earth.',
    didYouKnow: 'After rain, creosote releases a distinctive earthy scent from its resinous leaves — often described as the "smell of the desert."',
    idTips: [
      'Small, dark green resinous leaves in pairs; strong turpentine odor when rubbed',
      'Yellow five-petaled flowers in spring; fuzzy white seed balls in summer',
      'Open, airy branch structure; rarely taller than 1.5 m',
      'Widespread on open desert flats and alluvial fans',
      'Often surrounded by bare ground — releases chemicals that inhibit competing plants',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert flats' },
      { label: 'Height', value: '0.5–1.5 m' },
      { label: 'Flowers', value: 'Mar–May' },
      { label: 'Status', value: 'Common' },
    ],
  },
  {
    id: 'mojave-yucca',
    commonName: 'Mojave Yucca',
    latin: 'Yucca schidigera',
    family: 'Asparagus Family · Asparagaceae',
    kind: 'cactus',
    region: 'MOJAVE',
    description:
      'A stout, trunkless or short-trunked yucca with long, fibrous, dagger-like leaves. Its large clusters of creamy white flowers bloom in spring and were an important food source for Indigenous peoples. Like Joshua Trees, it depends on yucca moths for pollination.',
    didYouKnow: 'Yucca root extracts (saponins) were used as soap and shampoo by Native peoples — and are still used in commercial shampoos today.',
    idTips: [
      'Long, stiff, fibrous leaves with sharp terminal spines and peeling margins',
      'Stout, short trunk or multi-stemmed from near ground level',
      'Large panicle of creamy white bell-shaped flowers in spring',
      'Found on dry slopes and mesas from 300 to 1200 m',
      'Similar to Joshua Tree but lacks distinct trunk; leaves longer and straighter',
    ],
    stats: [
      { label: 'Habitat', value: 'Rocky slopes' },
      { label: 'Height', value: '1–5 m' },
      { label: 'Flowers', value: 'Apr–May' },
      { label: 'Status', value: 'Common' },
    ],
  },
  {
    id: 'desert-tortoise',
    commonName: 'Desert Tortoise',
    latin: 'Gopherus agassizii',
    family: 'Tortoises · Testudinidae',
    kind: 'snake',
    region: 'MOJAVE',
    description:
      'The official state reptile of California and Nevada. Desert tortoises spend up to 95% of their lives underground in burrows to escape extreme heat and cold. They can live over 80 years and store enough water in their bladder to survive a full year of drought.',
    didYouKnow: 'A desert tortoise can store up to a quart of water in its bladder — which can be re-absorbed as needed during drought. Never pick one up outdoors — they may release this precious water reserve in fear.',
    idTips: [
      'High-domed shell, typically brown to tan; elephant-like columnar legs',
      'Front legs heavily scaled and flattened for digging',
      'Slow-moving; active in morning and late afternoon',
      'Burrow entrances in desert flats and rocky hillsides',
      'Shell length 20–38 cm; males have longer tail and gular horn',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert flats' },
      { label: 'Shell length', value: '20–38 cm' },
      { label: 'Lifespan', value: '80+ yr' },
      { label: 'Status', value: 'Threatened' },
    ],
  },
  {
    id: 'black-throated-sparrow',
    commonName: 'Black-throated Sparrow',
    latin: 'Amphispiza bilineata',
    family: 'New World Sparrows · Passerellidae',
    kind: 'bird',
    region: 'MOJAVE',
    description:
      'One of the most distinctive and commonly seen desert songbirds, easily identified by the bold black bib on its white face. It is remarkably water-independent — deriving most moisture from the seeds and insects it eats, rarely needing to drink free water.',
    didYouKnow: 'Black-throated Sparrows can survive without drinking water indefinitely, obtaining all the moisture they need from their food.',
    idTips: [
      'Bold black triangular bib contrasting with white face and white supercilium',
      'Gray-brown back and wings; white belly; long dark tail with white outer tail feathers',
      'Distinctive two-note song: a sweet metallic "tink-tink-tseeee"',
      'Often seen foraging on the ground near creosote and desert scrub',
      'Year-round resident in lower deserts; common and confiding',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert scrub' },
      { label: 'Length', value: '12–14 cm' },
      { label: 'Wingspan', value: '19–22 cm' },
      { label: 'Status', value: 'Common' },
    ],
  },

  // ─── Chihuahuan Desert ────────────────────────────────────────────────────────
  {
    id: 'lechuguilla',
    commonName: 'Lechuguilla',
    latin: 'Agave lechuguilla',
    family: 'Asparagus Family · Asparagaceae',
    kind: 'cactus',
    region: 'CHIHUAHUAN',
    description:
      'The most diagnostic plant of the Chihuahuan Desert — if you see lechuguilla, you are in the Chihuahuan. Its fiercely spine-tipped leaves have been called "the most dangerous plant in Mexico." A monocarpic agave, it blooms once after 10–20 years, then dies.',
    didYouKnow: 'Lechuguilla fibers (istle) were used for thousands of years by Indigenous peoples to make rope, mats, sandals, and brushes — and are still harvested commercially today.',
    idTips: [
      'Dense rosette of stiff, narrow, yellowish-green leaves with a rigid terminal spine',
      'Leaves recurved at the tips, forming a compact, low rosette (30–50 cm tall)',
      'Found only on rocky limestone slopes — a strong indicator of Chihuahuan Desert',
      'Flowers on a tall stalk (1.5–4 m) with reddish buds, blooms once then dies',
      'Much smaller and narrower-leaved than other desert agaves',
    ],
    stats: [
      { label: 'Habitat', value: 'Rocky limestone' },
      { label: 'Height', value: '30–50 cm' },
      { label: 'Bloom cycle', value: '10–20 yr' },
      { label: 'Status', value: 'Common' },
    ],
  },
  {
    id: 'scaled-quail',
    commonName: 'Scaled Quail',
    latin: 'Callipepla squamata',
    family: 'New World Quail · Odontophoridae',
    kind: 'bird',
    region: 'CHIHUAHUAN',
    description:
      'Called "Cotton Top" for the distinctive white-tipped crest on its head, the Scaled Quail is the characteristic quail of the Chihuahuan Desert grasslands and desert scrub. Its body feathers have a scaly appearance from black-edged tips, giving it its name.',
    didYouKnow: 'Scaled Quail can run remarkably fast and often prefer to run rather than fly to escape predators — they can sprint at over 20 km/h.',
    idTips: [
      'Distinctive white-tipped crest (the "cotton top") visible at a distance',
      'Blue-gray body with black-edged feathers giving a "scaly" pattern on breast',
      'Reddish-buff streaking on flanks',
      'Found in desert grasslands, thorny scrub, and arroyos',
      'Often seen in coveys running along the ground',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert grassland' },
      { label: 'Length', value: '25–30 cm' },
      { label: 'Wingspan', value: '35–40 cm' },
      { label: 'Status', value: 'Declining' },
    ],
  },
  {
    id: 'checkered-whipsnake',
    commonName: 'Checkered Whipsnake',
    latin: 'Masticophis flagellum testaceus',
    family: 'Colubrids · Colubridae',
    kind: 'snake',
    region: 'CHIHUAHUAN',
    description:
      'A long, slender, fast-moving snake with a striking checkered pattern. Like other whipsnakes, it is diurnal, alert, and capable of remarkable bursts of speed. It is a key predator of lizards, small rodents, and other snakes across the Chihuahuan Desert.',
    didYouKnow: 'Checkered Whipsnakes can outpace a running human for short distances — reaching speeds of over 6 km/h. They climb well and often bask in shrubs above the ground.',
    idTips: [
      'Long and slender; distinct checkered pattern of dark squares on pale tan background',
      'Whip-like thin tail; head not wider than the neck',
      'Fast-moving and diurnal; often seen gliding rapidly across open ground',
      'When cornered, vibrates tail and may strike repeatedly; non-venomous',
      'Found in desert scrub, grasslands, and rocky outcrops below 1800 m',
    ],
    stats: [
      { label: 'Habitat', value: 'Desert scrub' },
      { label: 'Length', value: '1–1.6 m' },
      { label: 'Lifespan', value: '12 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },

  // ─── Great Basin Desert ───────────────────────────────────────────────────────
  {
    id: 'big-sagebrush',
    commonName: 'Big Sagebrush',
    latin: 'Artemisia tridentata',
    family: 'Daisy Family · Asteraceae',
    kind: 'cactus',
    region: 'GREAT_BASIN',
    description:
      'The defining plant of the Great Basin Desert and the American West. Sagebrush covers more area in North America than any other native shrub. Its aromatic silver-gray leaves release a powerful scent when wet — the iconic smell of the high desert after rain.',
    didYouKnow: 'Sagebrush has been part of the North American landscape for at least 40,000 years. Indigenous peoples used it for medicine, ceremonial purposes, and as a building material.',
    idTips: [
      'Silver-gray aromatic leaves with three shallow lobes at the tip',
      'Woody, multi-branched shrub 0.5–3 m tall',
      'Strong, distinctive sage scent, especially when wet or crushed',
      'Small yellow flowers in late summer; tiny dry fruits',
      'Dominant shrub in open, dry landscapes at 1000–3000 m elevation',
    ],
    stats: [
      { label: 'Habitat', value: 'High desert' },
      { label: 'Height', value: '0.5–3 m' },
      { label: 'Flowers', value: 'Aug–Oct' },
      { label: 'Status', value: 'Common' },
    ],
  },
  {
    id: 'rabbitbrush',
    commonName: 'Rubber Rabbitbrush',
    latin: 'Ericameria nauseosa',
    family: 'Daisy Family · Asteraceae',
    kind: 'cactus',
    region: 'GREAT_BASIN',
    description:
      'One of the most conspicuous shrubs of the Great Basin, exploding into golden-yellow bloom in late summer and fall when little else flowers. It is a critical late-season nectar source for migrating monarch butterflies and a wide variety of native bees.',
    didYouKnow: 'During WWII, rubber rabbitbrush was investigated as a potential commercial rubber source due to latex in its stems — hence "rubber" in its name.',
    idTips: [
      'Narrow, gray-green or white-felted leaves; stems also white and felted',
      'Dense, showy clusters of bright yellow flowers from August through October',
      'Upright, rounded shrub 0.5–2 m tall; green-gray year-round',
      'Found in disturbed soils, roadsides, and open shrubland',
      'Flowers later in the season than most other Great Basin shrubs',
    ],
    stats: [
      { label: 'Habitat', value: 'Open shrubland' },
      { label: 'Height', value: '0.5–2 m' },
      { label: 'Flowers', value: 'Aug–Oct' },
      { label: 'Status', value: 'Common' },
    ],
  },
  {
    id: 'sage-thrasher',
    commonName: 'Sage Thrasher',
    latin: 'Oreoscoptes montanus',
    family: 'Mockingbirds · Mimidae',
    kind: 'bird',
    region: 'GREAT_BASIN',
    description:
      'The smallest of the North American thrashers, and the only one that breeds in sagebrush habitat. A talented mimic and accomplished singer, it produces a long, rambling, melodious song from exposed perches — a defining sound of Great Basin mornings in spring.',
    didYouKnow: 'Sage Thrashers are closely tied to sagebrush — they nest almost exclusively in sagebrush plants and are considered indicators of intact sagebrush ecosystems.',
    idTips: [
      'Gray-brown above; heavily streaked black-and-white below',
      'Yellow eyes; short, slightly curved bill',
      'White wing bars and white tips on outer tail feathers in flight',
      'Found almost exclusively in sagebrush habitat',
      'Song is a long, varied, melodious series of phrases from a high perch',
    ],
    stats: [
      { label: 'Habitat', value: 'Sagebrush' },
      { label: 'Length', value: '20–23 cm' },
      { label: 'Wingspan', value: '30–35 cm' },
      { label: 'Status', value: 'Declining' },
    ],
  },
  {
    id: 'great-basin-rattlesnake',
    commonName: 'Great Basin Rattlesnake',
    latin: 'Crotalus oreganus lutosus',
    family: 'Pit Vipers · Viperidae',
    kind: 'snake',
    region: 'GREAT_BASIN',
    description:
      'The most widespread rattlesnake of the Great Basin, found from the sagebrush flats to rocky mountain ridges at 3000 m. It is heavier-bodied and more cold-tolerant than the Mojave or Western Diamondback rattlesnakes, active at surprisingly low temperatures in early spring.',
    didYouKnow: 'Great Basin Rattlesnakes sometimes gather in communal dens (hibernacula) of dozens of individuals, emerging each spring in what is called a "snake emergence."',
    idTips: [
      'Heavy-bodied with a pattern of brown blotches on gray-brown background',
      'Triangular head, clearly wider than the neck',
      'Rattle at the tail tip; heat-sensing pit organs between eye and nostril',
      'Found in rocky outcrops, sagebrush flats, and scrub habitat up to 3000 m',
      'More olive-brown and paler than the Western Diamondback; blotches rounder',
    ],
    stats: [
      { label: 'Habitat', value: 'Shrub-steppe' },
      { label: 'Length', value: '0.8–1.3 m' },
      { label: 'Lifespan', value: '20 yr' },
      { label: 'Status', value: 'Stable' },
    ],
  },
];

// Month numbers (1=Jan … 12=Dec) when each species is most likely to be encountered.
// Plants are year-round; animals reflect active / in-range seasons for the Sonoran Desert.
const ALL: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const WARM: number[] = [3, 4, 5, 6, 7, 8, 9, 10];

export const ACTIVE_MONTHS: Record<string, number[]> = {
  // Plants — permanent fixtures, always visible
  'saguaro':        ALL,
  'joshua-tree':    ALL,
  'palo-verde':     ALL,
  'mesquite':       ALL,
  'ocotillo':       ALL,
  'ironwood':       ALL,
  'barrel-cactus':  ALL,
  'organ-pipe':     ALL,
  'cholla':         ALL,
  'desert-willow':  [3, 4, 5, 6, 7, 8, 9, 10], // deciduous; bare in winter

  // Birds
  'gambels-quail':          ALL,   // year-round resident
  'roadrunner':             ALL,   // year-round resident
  'gila-woodpecker':        ALL,   // year-round resident
  'cactus-wren':            ALL,   // year-round resident
  'vermilion-flycatcher':   ALL,   // year-round in low Sonoran
  'turkey-vulture':         WARM,  // migratory; Apr–Oct in AZ
  'costas-hummingbird':     [1, 2, 3, 4, 10, 11, 12], // winter/spring low desert
  'great-horned-owl':       ALL,   // year-round resident
  'phainopepla':            [1, 2, 3, 4, 10, 11, 12], // winter resident in low Sonoran
  'mourning-dove':          ALL,   // year-round resident

  // Insects & Arthropods
  'tarantula-hawk':         [4, 5, 6, 7, 8, 9, 10],
  'arizona-bark-scorpion':  ALL,   // shelter year-round; most active warm months
  'desert-tarantula':       [4, 5, 6, 7, 8, 9, 10], // males roam Jul–Oct
  'palo-verde-beetle':      [6, 7, 8], // monsoon emergence only
  'monarch-butterfly':      [3, 4, 9, 10], // spring & fall migration
  'velvet-ant':             [5, 6, 7, 8, 9, 10],
  'giant-desert-centipede': WARM,
  'black-widow':            ALL,   // present year-round; more visible Apr–Oct

  // Snakes — ectothermic; inactive in cold months
  'western-diamondback':    [3, 4, 5, 6, 7, 8, 9, 10, 11],
  'mojave-rattlesnake':     WARM,
  'sonoran-coral-snake':    [4, 5, 6, 7, 8, 9, 10], // most active after monsoon
  'sidewinder':             WARM,
  'gopher-snake':           [3, 4, 5, 6, 7, 8, 9, 10, 11],
  'coachwhip':              [4, 5, 6, 7, 8, 9, 10],
  'kingsnake':              [4, 5, 6, 7, 8, 9, 10],
  'desert-nightsnake':      [4, 5, 6, 7, 8, 9, 10],

  // Mojave
  'creosote-bush':          ALL,
  'mojave-yucca':           ALL,
  'desert-tortoise':        [3, 4, 5, 6, 7, 8, 9, 10], // brumation Oct–Feb
  'black-throated-sparrow': ALL,

  // Chihuahuan
  'lechuguilla':            ALL,
  'scaled-quail':           ALL,
  'checkered-whipsnake':    [4, 5, 6, 7, 8, 9, 10],

  // Great Basin
  'big-sagebrush':          ALL,
  'rabbitbrush':            ALL, // yellow flowers Aug–Oct but plant visible year-round
  'sage-thrasher':          [3, 4, 5, 6, 7, 8, 9], // breeds spring–summer, winters south
  'great-basin-rattlesnake': [4, 5, 6, 7, 8, 9, 10], // cold-tolerant but still ectotherm
};

export function isActiveNow(speciesId: string): boolean {
  const month = new Date().getMonth() + 1;
  return (ACTIVE_MONTHS[speciesId] ?? ALL).includes(month);
}

export function getActiveMonths(speciesId: string): number[] {
  return ACTIVE_MONTHS[speciesId] ?? ALL;
}

export function getSpeciesById(id: string): Species | undefined {
  return CATALOG.find((s) => s.id === id);
}

export function getCatalogByKind(kind: SpeciesKind): Species[] {
  return CATALOG.filter((s) => s.kind === kind);
}

export function getCategoryCount(kind: SpeciesKind): number {
  return getCatalogByKind(kind).length;
}

type BBox = { minLat: number; maxLat: number; minLng: number; maxLng: number };
const REGION_BOXES: { region: Region; box: BBox }[] = [
  // Check MOJAVE first — it overlaps Sonoran's northern edge and is more specific there
  { region: 'MOJAVE',      box: { minLat: 33, maxLat: 38, minLng: -118, maxLng: -113 } },
  { region: 'CHIHUAHUAN',  box: { minLat: 25, maxLat: 33, minLng: -108, maxLng: -100 } },
  { region: 'GREAT_BASIN', box: { minLat: 36, maxLat: 45, minLng: -120, maxLng: -113 } },
  { region: 'SONORAN',     box: { minLat: 25, maxLat: 35, minLng: -116, maxLng: -107 } },
];

export function getRelatedSpecies(species: Species, limit = 4): Species[] {
  return CATALOG.filter(
    (s) => s.id !== species.id && (s.kind === species.kind || s.region === species.region),
  )
    .sort((a, b) => {
      // Same kind AND same region ranks highest
      const aScore = (a.kind === species.kind ? 2 : 0) + (a.region === species.region ? 1 : 0);
      const bScore = (b.kind === species.kind ? 2 : 0) + (b.region === species.region ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, limit);
}

export function getRegionForCoords(lat: number, lng: number): Region | null {
  const match = REGION_BOXES.find(
    ({ box }) => lat >= box.minLat && lat <= box.maxLat && lng >= box.minLng && lng <= box.maxLng,
  );
  return match?.region ?? null;
}
