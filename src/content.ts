import type { HiddenChanceCard, SceneSpec, ScenarioType, Vibe } from './types'

export const vibeLabels: Record<Vibe, string> = {
  dreamy: 'Dreamy',
  chaotic: 'Chaotic',
  romantic: 'Romantic',
  bold: 'Bold',
  brainy: 'Brainy',
  cozy: 'Cozy',
  glam: 'Glam',
  wild: 'Wild',
}

export const scenarioLabels: Record<ScenarioType, string> = {
  'first-date': 'First Date',
  'second-date': 'Second Date',
  'random-encounter': 'Random Encounter',
  chance: 'Chance',
  'third-date': 'Third Date',
  finale: 'Finale',
}

export const themeLabels: Record<string, string> = {
  cosmic: 'Cosmic',
  floral: 'Floral',
  artsy: 'Artsy',
  rebel: 'Rebel',
  sporty: 'Sporty',
  heroic: 'Heroic',
  cozy: 'Cozy',
  spooky: 'Spooky',
  nature: 'Nature',
  abstract: 'Abstract',
  mythic: 'Mythic',
  patriotic: 'Patriotic',
  hometown: 'Hometown',
  campus: 'Campus',
  legacy: 'Legacy',
  classic: 'Classic',
}

export const themeFlavors: Record<string, string> = {
  cosmic: 'You keep falling for the one that looks like it already knows the ending.',
  floral: 'You clearly have a weakness for petals, tenderness, and beautifully timed emotional damage.',
  artsy: 'You like your feelings filtered through references, texture, and one extremely good museum label.',
  rebel: 'You are not here for subtlety. You want glitter, nerve, and a little social risk.',
  sporty: 'You romance momentum. If the vibe can sprint, leap, or dramatically point into the distance, you are in.',
  heroic: 'You want a Rocky with plot armor, conviction, and a cape in spirit if not in paint.',
  cozy: 'You were always going to choose the one that feels like a soft seat by the window after rain.',
  spooky: 'You enjoy a little atmosphere with your affection. Some fog. Some menace. A lot of yearning.',
  nature: 'You trust the route with weather, blossoms, and the sense that migration is part of the story.',
  abstract: 'You want the interesting one. The one people do not fully understand until page 47.',
  mythic: 'You prefer a Rocky with prophecy energy and maybe one impossible accessory.',
  patriotic: 'You answer strongly to ceremony, banners, and a certain stately sincerity.',
  hometown: 'You keep choosing the Rocky that feels rooted, familiar, and weirdly protective.',
  campus: 'You enjoy a little academia in the air: longing, ambition, and suspiciously good timing.',
  legacy: 'You notice the originals, the standard-bearers, the dogs who arrive with lore already attached.',
  classic: 'You keep returning to the route that feels timeless, balanced, and quietly sure of itself.',
}

export const safariScenes: SceneSpec[] = [
  {
    id: 'opening-glance',
    scenarioType: 'first-date',
    title: 'Opening Glance',
    prompt: 'Three Rockys notice you first. Which one instantly turns your internal monologue into narration?',
    options: [
      {
        id: 'stargazer',
        label: 'The one glowing like it already knows your birth chart',
        blurb: 'Soft omens. Ominous charm. Immediate eye contact.',
        preferredThemes: ['cosmic', 'campus'],
        vibeFocus: { dreamy: 4, brainy: 2, bold: 1 },
      },
      {
        id: 'bouquet',
        label: 'The bloom-drenched sweetheart with suspicious emotional range',
        blurb: 'Petal drama, spring ache, and a very good profile shot.',
        preferredThemes: ['floral', 'nature'],
        vibeFocus: { romantic: 4, dreamy: 2, cozy: 1 },
      },
      {
        id: 'menace',
        label: 'The glam menace who would absolutely text you in all caps',
        blurb: 'Disco static. Dangerous charm. Zero indoor voice.',
        preferredThemes: ['rebel', 'abstract'],
        vibeFocus: { chaotic: 4, glam: 2, bold: 1 },
      },
    ],
  },
  {
    id: 'first-date-table',
    scenarioType: 'first-date',
    title: 'The First Date Somehow Escalates',
    prompt: 'The drinks arrive, the lighting turns cinematic, and one Rocky becomes impossible to play cool around.',
    options: [
      {
        id: 'museum-date',
        label: 'The one who makes every offhand comment sound like curation',
        blurb: 'Very articulate. Possibly dangerous in a gallery.',
        preferredThemes: ['artsy', 'mythic', 'campus'],
        vibeFocus: { brainy: 4, romantic: 1, glam: 1 },
      },
      {
        id: 'park-date',
        label: 'The one who acts casual while absolutely engineering tenderness',
        blurb: 'Windblown sincerity. Impeccable emotional timing.',
        preferredThemes: ['floral', 'cozy', 'nature'],
        vibeFocus: { cozy: 3, romantic: 3, dreamy: 1 },
      },
      {
        id: 'neon-date',
        label: 'The one who says “trust me” and then chooses the loudest possible venue',
        blurb: 'Questionable planning. Excellent chemistry.',
        preferredThemes: ['rebel', 'sporty', 'heroic'],
        vibeFocus: { glam: 2, chaotic: 3, bold: 2 },
      },
    ],
  },
  {
    id: 'missed-connection',
    scenarioType: 'random-encounter',
    title: 'Bad Timing, Excellent Plot',
    prompt: 'A random encounter hits at exactly the wrong moment. Which Rocky makes coincidence feel deeply personal?',
    options: [
      {
        id: 'rainy-runin',
        label: 'The one standing there like weather has been personally arranged for them',
        blurb: 'Rain, atmosphere, and entirely avoidable longing.',
        preferredThemes: ['spooky', 'cosmic', 'classic'],
        vibeFocus: { dreamy: 3, romantic: 2, bold: 1 },
      },
      {
        id: 'market-runin',
        label: 'The one you bump into while pretending not to buy something soft and domestic',
        blurb: 'Sweetness. Proximity. A very dangerous level of care.',
        preferredThemes: ['cozy', 'hometown', 'floral'],
        vibeFocus: { cozy: 4, romantic: 2 },
      },
      {
        id: 'street-runin',
        label: 'The one who appears mid-chaos and somehow improves the choreography',
        blurb: 'Momentum with eye contact.',
        preferredThemes: ['sporty', 'heroic', 'rebel'],
        vibeFocus: { bold: 3, wild: 2, chaotic: 2 },
      },
    ],
  },
  {
    id: 'planned-detour',
    scenarioType: 'second-date',
    title: 'Second Date, Suspiciously Intentional',
    prompt: 'Now they are planning things on purpose. Which Rocky turns one small detour into a very real escalation?',
    options: [
      {
        id: 'bookshop-detour',
        label: 'The one who says “just one stop” and walks you into a perfect little intellectual ambush',
        blurb: 'Annotated flirting. Niche references. Emotional premeditation.',
        preferredThemes: ['artsy', 'campus', 'classic'],
        vibeFocus: { brainy: 3, romantic: 2, dreamy: 1 },
      },
      {
        id: 'picnic-detour',
        label: 'The one who somehow packed fruit, blankets, and a reason to sit closer than necessary',
        blurb: 'Soft logistics. Very unsafe tenderness.',
        preferredThemes: ['cozy', 'nature', 'floral'],
        vibeFocus: { cozy: 3, romantic: 3, dreamy: 1 },
      },
      {
        id: 'neon-detour',
        label: 'The one who detours into a carnival-grade side quest and acts like this is normal',
        blurb: 'Brass, velocity, and deeply unserious confidence.',
        preferredThemes: ['rebel', 'sporty', 'glam'],
        vibeFocus: { bold: 2, chaotic: 3, glam: 2 },
      },
    ],
  },
  {
    id: 'domestic-tension',
    scenarioType: 'second-date',
    title: 'Accidental Domesticity',
    prompt: 'The route briefly pretends you already know each other. Which Rocky makes ordinary tasks feel catastrophically intimate?',
    options: [
      {
        id: 'grocery-theory',
        label: 'The one who becomes devastating in a grocery aisle and somehow turns produce into subtext',
        blurb: 'Domestic realism with a body count.',
        preferredThemes: ['hometown', 'cozy', 'classic'],
        vibeFocus: { cozy: 3, brainy: 1, romantic: 2 },
      },
      {
        id: 'museum-errand',
        label: 'The one who treats every casual errand like a secret elective in yearning',
        blurb: 'Academic flirtation in broad daylight.',
        preferredThemes: ['artsy', 'abstract', 'campus'],
        vibeFocus: { brainy: 3, dreamy: 1, romantic: 1 },
      },
      {
        id: 'afterparty-errand',
        label: 'The one who says “help me with one thing” and drags you into glamorous disarray',
        blurb: 'Questionable plans. Impeccable chemistry.',
        preferredThemes: ['rebel', 'heroic', 'mythic'],
        vibeFocus: { glam: 2, wild: 2, chaotic: 2 },
      },
    ],
  },
  {
    id: 'second-pass',
    scenarioType: 'random-encounter',
    title: 'You Keep Running Into This Dog',
    prompt: 'At this point it is either fate or municipal overcommitment. Which Rocky keeps reappearing in your route?',
    options: [
      {
        id: 'bookish-repeat',
        label: 'The one who keeps materializing near references, symbols, and suspiciously relevant advice',
        blurb: 'You are being romanced by subtext.',
        preferredThemes: ['artsy', 'abstract', 'campus'],
        vibeFocus: { brainy: 3, dreamy: 1, glam: 1 },
      },
      {
        id: 'pastoral-repeat',
        label: 'The one who turns every reappearance into a soft-focus seasonal event',
        blurb: 'Petals again. You are not beating the allegations.',
        preferredThemes: ['nature', 'floral', 'hometown'],
        vibeFocus: { dreamy: 2, romantic: 2, cozy: 2 },
      },
      {
        id: 'electric-repeat',
        label: 'The one who keeps arriving with volume, velocity, and a tiny amount of risk',
        blurb: 'You were never going to choose caution.',
        preferredThemes: ['rebel', 'sporty', 'abstract'],
        vibeFocus: { chaotic: 3, bold: 2, glam: 2 },
      },
    ],
  },
  {
    id: 'luck-pivot',
    scenarioType: 'chance',
    title: 'The Town Rearranges Itself',
    prompt: 'Something invisible tilts the route. A message lands late. A turn opens. A coincidence becomes policy. Which Rocky benefits most?',
    options: [
      {
        id: 'lucky-bloom',
        label: 'The one suddenly favored by timing, weather, and absurd floral luck',
        blurb: 'A suspiciously kind universe.',
        preferredThemes: ['floral', 'nature', 'cozy'],
        vibeFocus: { romantic: 2, dreamy: 2, cozy: 1 },
      },
      {
        id: 'lucky-eclipse',
        label: 'The one who looks even more compelling when fate gets theatrical',
        blurb: 'Destiny with lighting cues.',
        preferredThemes: ['cosmic', 'spooky', 'mythic'],
        vibeFocus: { dreamy: 3, glam: 1, bold: 1 },
      },
      {
        id: 'lucky-detour',
        label: 'The one who somehow profits from every sudden detour and rule bend',
        blurb: 'Excellent luck. Dubious methods.',
        preferredThemes: ['rebel', 'heroic', 'sporty'],
        vibeFocus: { chaotic: 2, wild: 2, bold: 2 },
      },
    ],
  },
  {
    id: 'third-date-line',
    scenarioType: 'third-date',
    title: 'Third Date, No More Alibis',
    prompt: 'By now the joke is over. Which Rocky makes honesty feel unavoidable and a little bit fatal?',
    options: [
      {
        id: 'soft-confession',
        label: 'The one who lowers the volume, says one true thing, and lets it hit like weather',
        blurb: 'No spectacle. Total damage.',
        preferredThemes: ['classic', 'cozy', 'romantic'],
        vibeFocus: { romantic: 3, cozy: 2, dreamy: 1 },
      },
      {
        id: 'brainy-confession',
        label: 'The one who confesses through theory, symbolism, and one devastatingly careful question',
        blurb: 'You are being loved via subtext again.',
        preferredThemes: ['campus', 'artsy', 'cosmic'],
        vibeFocus: { brainy: 3, dreamy: 2, romantic: 1 },
      },
      {
        id: 'reckless-confession',
        label: 'The one who admits it mid-motion and makes impulse look like destiny',
        blurb: 'Terrible timing. Incredible effect.',
        preferredThemes: ['heroic', 'rebel', 'sporty'],
        vibeFocus: { bold: 3, wild: 2, chaotic: 1 },
      },
    ],
  },
  {
    id: 'true-pup-threshold',
    scenarioType: 'finale',
    title: 'Threshold Moment',
    prompt: 'You are one choice away from your true pup. What closes the route?',
    options: [
      {
        id: 'ornate-ending',
        label: 'A dazzling confession under impossible lighting',
        blurb: 'You want the full visual novel ending. Respect.',
        preferredThemes: ['mythic', 'artsy', 'rebel'],
        vibeFocus: { glam: 3, romantic: 2, dreamy: 1 },
      },
      {
        id: 'steady-ending',
        label: 'A quiet walk, one honest sentence, and a devastating look back',
        blurb: 'Minimal theatrics. Maximum emotional impact.',
        preferredThemes: ['classic', 'hometown', 'cozy'],
        vibeFocus: { cozy: 2, brainy: 1, romantic: 3 },
      },
      {
        id: 'chaos-ending',
        label: 'A reckless finale where someone absolutely vaults over something',
        blurb: 'You want sparks, movement, and a little public concern.',
        preferredThemes: ['heroic', 'sporty', 'patriotic'],
        vibeFocus: { bold: 3, wild: 2, chaotic: 2 },
      },
    ],
  },
]

export const hiddenChanceDeck: Record<ScenarioType, HiddenChanceCard[]> = {
  'first-date': [
    {
      id: 'lingering-eye-contact',
      boostThemes: ['romantic', 'glam', 'cozy'],
      suppressThemes: ['patriotic'],
      vibeFocus: { romantic: 2, glam: 1 },
    },
    {
      id: 'unexpected-depth',
      boostThemes: ['artsy', 'campus', 'classic'],
      suppressThemes: ['sporty'],
      vibeFocus: { brainy: 2, dreamy: 1 },
    },
  ],
  'second-date': [
    {
      id: 'borrowed-jacket',
      boostThemes: ['cozy', 'classic', 'hometown'],
      suppressThemes: ['patriotic'],
      vibeFocus: { cozy: 2, romantic: 1 },
    },
    {
      id: 'shared-bite',
      boostThemes: ['floral', 'nature', 'romantic'],
      suppressThemes: ['abstract'],
      vibeFocus: { romantic: 2, dreamy: 1 },
    },
    {
      id: 'tiny-public-scandal',
      boostThemes: ['rebel', 'glam', 'heroic'],
      suppressThemes: ['classic'],
      vibeFocus: { glam: 1, chaotic: 1, bold: 2 },
    },
  ],
  'random-encounter': [
    {
      id: 'rain-delay',
      boostThemes: ['spooky', 'cosmic', 'nature'],
      suppressThemes: ['patriotic'],
      vibeFocus: { dreamy: 2, romantic: 1 },
    },
    {
      id: 'same-aisle-again',
      boostThemes: ['cozy', 'hometown', 'floral'],
      suppressThemes: ['abstract'],
      vibeFocus: { cozy: 2, romantic: 1 },
    },
    {
      id: 'street-sparks',
      boostThemes: ['rebel', 'sporty', 'heroic'],
      suppressThemes: ['classic'],
      vibeFocus: { bold: 2, chaotic: 1, wild: 1 },
    },
  ],
  chance: [
    {
      id: 'advance-to-roses',
      boostThemes: ['floral', 'nature', 'romantic'],
      suppressThemes: ['abstract'],
      vibeFocus: { romantic: 2, dreamy: 1 },
    },
    {
      id: 'bank-error-in-your-favor',
      boostThemes: ['glam', 'mythic', 'rebel'],
      suppressThemes: ['cozy'],
      vibeFocus: { glam: 2, bold: 1, chaotic: 1 },
    },
    {
      id: 'free-parking-of-the-soul',
      boostThemes: ['classic', 'hometown', 'cozy'],
      suppressThemes: ['sporty'],
      vibeFocus: { cozy: 2, brainy: 1 },
    },
  ],
  'third-date': [
    {
      id: 'almost-hand-hold',
      boostThemes: ['classic', 'cozy', 'romantic'],
      suppressThemes: ['sporty'],
      vibeFocus: { romantic: 2, cozy: 1 },
    },
    {
      id: 'say-it-clearly',
      boostThemes: ['campus', 'artsy', 'mythic'],
      suppressThemes: ['patriotic'],
      vibeFocus: { brainy: 2, dreamy: 1, romantic: 1 },
    },
    {
      id: 'parking-lot-fireworks',
      boostThemes: ['heroic', 'rebel', 'glam'],
      suppressThemes: ['cozy'],
      vibeFocus: { bold: 2, wild: 1, glam: 1 },
    },
  ],
  finale: [
    {
      id: 'last-look',
      boostThemes: ['classic', 'romantic', 'mythic'],
      suppressThemes: ['patriotic'],
      vibeFocus: { romantic: 2, dreamy: 1 },
    },
    {
      id: 'grand-gesture',
      boostThemes: ['heroic', 'rebel', 'glam'],
      suppressThemes: ['cozy'],
      vibeFocus: { bold: 2, glam: 1, wild: 1 },
    },
  ],
}
