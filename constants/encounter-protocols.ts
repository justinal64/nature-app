// Step-by-step encounter protocols for dangerous or commonly-misunderstood Southwest species.
// Distinct from getDangerInfo() in catalog.ts, which provides classification + first-aid.
// This file provides behavioral guidance: what to do before, during, and after an encounter.

export type EncounterProtocol = {
  immediateAction: string;
  do: string[];
  dont: string[];
  ifBitten?: string;
  ifStung?: string;
  distanceRecommendation?: string;
  emergencyNote?: string;
};

const PROTOCOLS: Partial<Record<string, EncounterProtocol>> = {

  // ── RATTLESNAKES (shared protocol, referenced by all rattler IDs) ──────────

  'western-diamondback': {
    immediateAction: 'Freeze, locate the snake, then back away slowly to at least 6 feet.',
    distanceRecommendation: 'Stay at least 6 ft (2 m) away — a rattlesnake can strike half its body length.',
    do: [
      'Watch where you step, especially on warm rocks and at dusk',
      'Step onto rocks before stepping over them so you can see the other side',
      'Give the snake time to move off the trail on its own',
      'Wear over-ankle boots and long pants in snake country',
    ],
    dont: [
      'Pick it up, poke it, or try to move it',
      'Assume a coiled snake will warn you — many strikes happen without a rattle',
      'Put hands into rock crevices, under logs, or into bushes without looking first',
      'Try to catch it to "identify it" after a bite — rescuers can ID from a photo',
    ],
    ifBitten:
      'Call 911 immediately. Remove jewelry and tight clothing from the limb. Immobilize the bite site below heart level. Walk calmly to the nearest road; do NOT run, cut the wound, suction, or apply a tourniquet. Antivenom is the only treatment — reach a hospital within 4 hours.',
    emergencyNote: 'Arizona Poison Control: 1-800-222-1222',
  },

  'mojave-rattlesnake': {
    immediateAction: 'Back away immediately — Mojave venom is the most potent of any North American rattlesnake.',
    distanceRecommendation: 'Give extra space — 8+ ft. Do not approach to photograph.',
    do: [
      'Treat any Mojave encounter as high-priority and give maximum distance',
      'Note your location (GPS pin) if a bite occurs so emergency services can reach you',
      'Stay on established trails where snakes are more visible',
      'Check your boots before putting them on each morning in camp',
    ],
    dont: [
      'Attempt to handle under any circumstance — even a decapitated head can bite reflexively for 90 minutes',
      'Mistake the blotched pattern for a harmless gopher snake — look for the rattle',
      'Camp in or near rocky outcrops without shaking out gear',
      'Apply pressure immobilization — contraindicated for pit viper envenomation',
    ],
    ifBitten:
      'CALL 911 IMMEDIATELY. Mojave venom has a delayed neurotoxic component — symptoms may seem mild for 6–12 hours then become life-threatening. Hospital treatment is mandatory even if you feel fine. Do not drive yourself.',
    emergencyNote: 'Arizona Poison Control: 1-800-222-1222 — mention "Mojave Rattlesnake" explicitly.',
  },

  'great-basin-rattlesnake': {
    immediateAction: 'Back away slowly — give the snake room to move off on its own.',
    distanceRecommendation: 'Maintain at least 6 ft. Strike range equals roughly half the snake\'s body length.',
    do: [
      'Watch rocky areas, talus slopes, and sage-juniper edge habitat carefully',
      'Tap the ground ahead with a trekking pole when walking in tall grass',
      'Carry a charged phone and know your GPS coordinates when hiking remotely',
      'Scan the ground before sitting on rocks or logs for a rest break',
    ],
    dont: [
      'Handle dead snakes — envenomation from a deceased snake is well documented',
      'Use a flashlight carelessly at night — snakes cross warm pavement after dark',
      'Freeze in place on a trail; after locating the snake, calmly create distance',
      'Ignore a bite even if pain seems minor — envenomation severity varies widely',
    ],
    ifBitten:
      'Call 911. Keep bite site below heart level. Remove constrictive items. Walk slowly to help. Do not cut, suck, tourniquet, or apply ice. Severity depends on fang penetration depth and volume of venom delivered.',
    emergencyNote: 'Arizona/Nevada Poison Control: 1-800-222-1222',
  },

  'tiger-rattlesnake': {
    immediateAction: 'Back away — the tiger rattlesnake has the most toxic venom-to-body-size ratio of any US rattlesnake.',
    distanceRecommendation: '6+ ft. Despite small size, venom potency is extremely high.',
    do: [
      'Respect that the small size means a smaller rattle — it may be quieter than you expect',
      'Look before reaching into rocky outcrops or piles of palo verde deadfall',
      'Be especially alert on rocky bajadas in the Tucson foothills during spring evenings',
    ],
    dont: [
      'Underestimate it based on size — this species punches far above its weight class',
      'Assume all small desert rattlesnakes are the same — the tiger requires hospital treatment',
    ],
    ifBitten:
      'Call 911 immediately. Same protocol as western diamondback. Antivenom is critical given the high venom potency per body weight.',
    emergencyNote: 'Arizona Poison Control: 1-800-222-1222',
  },

  'black-tailed-rattlesnake': {
    immediateAction: 'Back away calmly. This is a relatively calm species, but any rattlesnake demands respect.',
    distanceRecommendation: '6 ft minimum. Found in rocky mountain canyons and cliff faces.',
    do: [
      'Look carefully along cliff ledges and canyon walls when scrambling',
      'Check handholds before committing when rock climbing in desert canyons',
      'Give more space than you think you need — canyon acoustics can mask the rattle',
    ],
    dont: [
      'Reach above your head onto ledges you cannot see',
      'Confuse docile behavior with safety — provocation changes behavior quickly',
    ],
    ifBitten:
      'Standard rattlesnake protocol: Call 911, immobilize limb below heart level, do not cut or suction.',
    emergencyNote: 'Arizona Poison Control: 1-800-222-1222',
  },

  'western-rattlesnake': {
    immediateAction: 'Stop, locate the snake, and back away slowly without turning your back on it.',
    distanceRecommendation: 'At least 6 ft. Common on hiking trails in California, Nevada, and southern Oregon.',
    do: [
      'Listen for the rattle — it sounds like a distant lawn sprinkler or cicada',
      'Watch your step near rocky sunny outcrops in the morning when snakes bask',
      'Carry a snakebite action card or have the Poison Control number saved offline',
    ],
    dont: [
      'Throw rocks or sticks to make it move — this provokes defensive strikes',
      'Block trail for other hikers — go around, then warn those behind you',
    ],
    ifBitten:
      'Call 911. Immobilize and go to an ER. Do not apply ice or alcohol.',
    emergencyNote: 'California Poison Control: 1-800-222-1222',
  },

  'sonoran-coral-snake': {
    immediateAction: 'Back away. Do not handle. Its small mouth requires direct contact to envenomated.',
    distanceRecommendation: 'Do not approach. The "red touches yellow, kill a fellow" rhyme applies here.',
    do: [
      'Learn the ID: red bands touch yellow bands (vs. harmless milk/long-nosed snake where red touches black)',
      'Shake out shoes, towels, and sleeping bag corners — coral snakes hide in small spaces',
      'If bitten, call 911 immediately and get to an ER — neurotoxic venom can cause respiratory failure',
    ],
    dont: [
      'Pick it up even with gloves — venom is neurotoxic and antivenom supply in the US is limited',
      'Dismiss a bite because initial pain is mild — neurotoxic symptoms are delayed 1–12 hours',
      'Attempt pressure immobilization without medical guidance',
    ],
    ifBitten:
      'CALL 911 IMMEDIATELY. Coral snake venom is neurotoxic with potentially delayed onset. The US has limited antivenom supply — early hospital transport is critical. Do NOT wait for symptoms to appear.',
    emergencyNote: 'Arizona Poison Control: 1-800-222-1222. Mention "Sonoran Coral Snake" explicitly so ER can source antivenom.',
  },

  // ── ARACHNIDS ─────────────────────────────────────────────────────────────

  'arizona-bark-scorpion': {
    immediateAction: 'Shake out all clothing, shoes, towels, and sleeping bags before use — they hide in folded fabric.',
    distanceRecommendation: 'Do not handle. They can sting multiple times and climb glass-smooth surfaces.',
    do: [
      'Shake shoes and gear out over a hard floor each morning when camping in AZ',
      'Use a UV blacklight at night — scorpions glow bright teal-green under UV',
      'Wear leather gloves when moving rocks, firewood, or debris piles',
      'Keep cots off the ground and tuck in sleeping bag edges',
    ],
    dont: [
      'Walk barefoot inside Arizona vacation rentals or tents at night',
      'Leave clothes or shoes on the ground overnight in AZ desert areas',
      'Put bare hands into dark crevices under rocks or in wood piles',
    ],
    ifStung:
      'Wash the site with soap and water. Immobilize the stung limb and keep it below heart level. Call Arizona Poison Control (1-800-222-1222) immediately — children under 6 and elderly adults can have severe systemic reactions requiring antivenom (Anascorp). Adults with no systemic symptoms can often manage at home with ice and ibuprofen if cleared by Poison Control first.',
    emergencyNote: 'Arizona Poison Control: 1-800-222-1222. Anascorp antivenom is available at most AZ ERs.',
  },

  'tarantula': {
    immediateAction: 'Observe from a respectful distance. Tarantulas are not aggressive and rarely bite humans.',
    distanceRecommendation: '12+ inches for viewing. They are docile but will rear up if cornered.',
    do: [
      'Watch for males crossing desert roads at dusk in September–October — mating season',
      'Observe without touching — some species have urticating hairs they flick defensively',
      'Photograph from below for a full view of the abdomen pattern',
    ],
    dont: [
      'Handle wild tarantulas — even docile spiders bite when stressed, causing local pain/swelling',
      'Assume the tarantula hawk wasp nearby is more dangerous — it is (by far)',
      'Assume a dead tarantula is harmless — urticating hairs remain potent',
    ],
    emergencyNote:
      'Bites are rarely medically significant in healthy adults. If systemic symptoms develop, call Poison Control: 1-800-222-1222.',
  },

  'tarantula-hawk': {
    immediateAction: 'Back away. Do not swat. They are non-aggressive and will only sting if grabbed or stepped on.',
    distanceRecommendation: '3 ft. Their sting is rated the most painful insect sting in North America (Schmidt index: 4/4).',
    do: [
      'Give them room — they are solitary and focused on finding tarantula burrows',
      'Wear closed shoes in desert scrub during July–September when they are most active',
      'Admire the iridescent wings from a distance — they are spectacular insects',
    ],
    dont: [
      'Swat at them — this is when stings happen',
      'Step barefoot in desert scrub during peak activity season',
      'Pick up a "dead" one — reflexive stings have been documented',
    ],
    ifStung:
      'The sting causes immediate, blinding pain lasting 3–5 minutes, then subsides. No antivenom exists or is needed. Ice the site. Take ibuprofen. Do not scratch. The sting is painful but not medically dangerous to healthy adults — call Poison Control if an allergic reaction develops.',
    emergencyNote: 'Anaphylaxis is rare but possible. If breathing difficulty develops: call 911.',
  },

  'pepsis-wasp': {
    immediateAction: 'Give way — they are intent on hunting tarantulas, not people.',
    distanceRecommendation: 'Same species as tarantula hawk. See tarantula-hawk protocol.',
    do: [
      'Watch the behavior from a safe distance — witnessing a tarantula hunt is remarkable',
      'Wear shoes outdoors in late summer desert areas',
    ],
    dont: [
      'Interfere with a hunt in progress',
      'Swat if one lands on you — stay still and it will move on',
    ],
    ifStung:
      'Intense pain for 3–5 minutes, then subsides. Ice and ibuprofen. Seek care only if systemic allergic reaction develops.',
    emergencyNote: 'Anaphylaxis: call 911. Poison Control: 1-800-222-1222.',
  },

  // ── MAMMALS ───────────────────────────────────────────────────────────────

  'javelina': {
    immediateAction: 'Back away slowly and calmly. Javelinas have poor eyesight — speak calmly so they know you\'re human, not another javelina.',
    distanceRecommendation: '50+ ft from herds. 100+ ft from a mother with young.',
    do: [
      'Back away to higher ground — they rarely follow uphill',
      'Make yourself appear large and speak firmly in a calm voice',
      'Carry a walking stick in urban desert neighborhoods where they are common',
      'If charged, step behind a tree, car, or fence; they pull up quickly',
    ],
    dont: [
      'Run — this triggers a chase response',
      'Feed or approach javelinas in campgrounds or neighborhoods — they lose fear of humans rapidly',
      'Get between a mother and her piglets — she will charge',
      'Bring dogs into javelina territory off-leash — conflict is common and injuries occur',
    ],
    emergencyNote: 'Javelina tusks cause puncture wounds that require medical evaluation due to infection risk. Seek care within 24 hours of any bite or tusk injury.',
  },

  'coyote': {
    immediateAction: 'Stand your ground and make yourself appear large. Do not run.',
    distanceRecommendation: 'Stay at least 50 ft from any coyote that is not fleeing from you.',
    do: [
      'Haze a non-fleeing coyote: wave arms, shout, throw small rocks near (not at) it',
      'Keep children between adults when hiking in areas with active coyote sightings',
      'Keep pets on leash in desert areas at dawn, dusk, and night',
      'Report a coyote that does not respond to hazing to local wildlife services',
    ],
    dont: [
      'Feed coyotes — a food-conditioned coyote will eventually require removal',
      'Leave small pets outside unattended at dusk or dawn',
      'Turn your back on a bold coyote or run away',
    ],
    emergencyNote: 'Coyote attacks on humans are rare. Bites require rabies exposure evaluation — contact local health dept.',
  },

  // ── PLANTS (special safety cases) ─────────────────────────────────────────

  'sacred-datura': {
    immediateAction: 'Do not touch eyes, nose, or mouth after handling any part of this plant.',
    distanceRecommendation: 'No handling required. Admire only — all parts are toxic.',
    do: [
      'Wash hands thoroughly if you contact the plant accidentally',
      'Photograph without touching the flowers or leaves',
      'Note the distinctive large white trumpet flowers at dusk as an ID warning',
    ],
    dont: [
      'Consume any part under any circumstance — contains tropane alkaloids (atropine, scopolamine, hyoscyamine)',
      'Brew as a tea, smoke, or ingest based on historical accounts — dosage is unpredictable and overdose is common',
      'Allow children or pets to play near it',
    ],
    emergencyNote: 'Ingestion: call Poison Control IMMEDIATELY at 1-800-222-1222 or call 911. Sacred datura poisoning causes delirium, hyperthermia, tachycardia, and can be fatal. There is no specific antidote.',
  },

  'lechuguilla': {
    immediateAction: 'Check your skin and clothing immediately after passing through lechuguilla fields — needle-sharp tips break off and work deeper with movement.',
    distanceRecommendation: 'Step over or well around — the rigid spines can puncture boot leather.',
    do: [
      'Wear gaiters and thick pants when hiking in Chihuahuan Desert terrain',
      'Remove embedded spines immediately — they can cause infection if left in',
      'Watch for it growing in clusters that block the entire trail in Big Bend',
    ],
    dont: [
      'Push through dense lechuguilla — even with long pants you will be punctured',
      'Ignore a spine wound in a remote area — desert spine wounds can develop serious infections',
    ],
    emergencyNote: 'Deep puncture wounds in remote desert: clean thoroughly, monitor for redness/swelling. Seek care within 48h if signs of infection appear.',
  },

};

export function getEncounterProtocol(speciesId: string): EncounterProtocol | undefined {
  return PROTOCOLS[speciesId];
}
