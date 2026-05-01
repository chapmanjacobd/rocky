import type { HiddenChanceCard, SceneSpec, ScenarioType, Vibe } from './types'

export const vibeLabels: Record<Vibe, string> = {
  dreamy: 'Dreamy',
  chaotic: 'Chaotic',
  romantic: 'Warm',
  bold: 'Bold',
  brainy: 'Brainy',
  cozy: 'Cozy',
  glam: 'Glam',
  wild: 'Wild',
}

export const scenarioLabels: Record<ScenarioType, string> = {
  'first-date': 'Opening',
  'second-date': 'Middle Round',
  'random-encounter': 'Wildcard',
  chance: 'Bonus Signal',
  'third-date': 'Late Round',
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
  cosmic: 'You consistently respond to mystery, scale, and a slightly otherworldly look.',
  floral: 'You notice softness, pattern, and decorative detail right away.',
  artsy: 'You favor pieces with references, texture, and a curated point of view.',
  rebel: 'You prefer standout choices with edge, volume, and a little risk.',
  sporty: 'You gravitate toward motion, action, and a sense of momentum.',
  heroic: 'You respond to confidence, clarity, and larger-than-life energy.',
  cozy: 'You keep returning to pieces that feel welcoming and familiar.',
  spooky: 'You like atmosphere, contrast, and a slightly mysterious mood.',
  nature: 'You notice organic shapes, outdoor settings, and seasonal cues.',
  abstract: 'You like the more unusual picks that reward a second look.',
  mythic: 'You respond to dramatic symbolism and larger visual storytelling.',
  patriotic: 'You notice ceremony, tradition, and formal presentation.',
  hometown: 'You favor pieces that feel grounded, local, and recognizable.',
  campus: 'You like academic settings, references, and thoughtful details.',
  legacy: 'You notice the originals and the pieces with strong history behind them.',
  classic: 'You consistently return to balanced, timeless-looking choices.',
}

export const safariScenes: SceneSpec[] = [
  {
    id: 'opening-glance',
    scenarioType: 'first-date',
    title: 'Opening Pick',
    prompt: 'Three Rockys stand out immediately. Which one grabs your attention first?',
    options: [
      {
        id: 'stargazer',
        label: 'The one glowing like it already arrived with its own mythology',
        blurb: 'Soft omens, cosmic detail, and instant atmosphere.',
        preferredThemes: ['cosmic', 'campus'],
        vibeFocus: { dreamy: 4, brainy: 2, bold: 1 },
      },
      {
        id: 'bouquet',
        label: 'The bloom-drenched Rocky with strong floral detail',
        blurb: 'Petal-heavy, seasonal, and visually memorable.',
        preferredThemes: ['floral', 'nature'],
        vibeFocus: { romantic: 4, dreamy: 2, cozy: 1 },
      },
      {
        id: 'menace',
        label: 'The glam standout with the loudest visual presence',
        blurb: 'Disco static, bright contrast, and zero subtlety.',
        preferredThemes: ['rebel', 'abstract'],
        vibeFocus: { chaotic: 4, glam: 2, bold: 1 },
      },
    ],
  },
  {
    id: 'first-date-table',
    scenarioType: 'first-date',
    title: 'First Impression',
    prompt: 'Looking a little longer changes the read. Which Rocky feels strongest on a second look?',
    options: [
      {
        id: 'museum-date',
        label: 'The one who makes every offhand comment sound like curation',
        blurb: 'Thoughtful, reference-heavy, and gallery-ready.',
        preferredThemes: ['artsy', 'mythic', 'campus'],
        vibeFocus: { brainy: 4, romantic: 1, glam: 1 },
      },
      {
        id: 'park-date',
        label: 'The one that feels calm, balanced, and carefully composed',
        blurb: 'Windblown, calm, and carefully composed.',
        preferredThemes: ['floral', 'cozy', 'nature'],
        vibeFocus: { cozy: 3, romantic: 3, dreamy: 1 },
      },
      {
        id: 'neon-date',
        label: 'The one who says “trust me” and then chooses the loudest possible venue',
        blurb: 'Big energy, bright color, and no hesitation.',
        preferredThemes: ['rebel', 'sporty', 'heroic'],
        vibeFocus: { glam: 2, chaotic: 3, bold: 2 },
      },
    ],
  },
  {
    id: 'missed-connection',
    scenarioType: 'random-encounter',
    title: 'Unexpected Favorite',
    prompt: 'A Rocky shows up where you were not expecting it. Which surprise appearance works best for you?',
    options: [
      {
        id: 'rainy-runin',
        label: 'The one standing there like weather has been personally arranged for them',
        blurb: 'Rain, atmosphere, and strong visual mood.',
        preferredThemes: ['spooky', 'cosmic', 'classic'],
        vibeFocus: { dreamy: 3, romantic: 2, bold: 1 },
      },
      {
        id: 'market-runin',
        label: 'The one you bump into while pretending not to buy something soft and domestic',
        blurb: 'Warm, familiar, and easy to picture in context.',
        preferredThemes: ['cozy', 'hometown', 'floral'],
        vibeFocus: { cozy: 4, romantic: 2 },
      },
      {
        id: 'street-runin',
        label: 'The one who appears mid-chaos and somehow improves the choreography',
        blurb: 'Momentum, motion, and excellent timing.',
        preferredThemes: ['sporty', 'heroic', 'rebel'],
        vibeFocus: { bold: 3, wild: 2, chaotic: 2 },
      },
    ],
  },
  {
    id: 'planned-detour',
    scenarioType: 'second-date',
    title: 'Closer Look',
    prompt: 'One Rocky starts to feel more deliberate and memorable. Which one keeps climbing your list?',
    options: [
      {
        id: 'bookshop-detour',
        label: 'The one who says “just one stop” and walks you into a perfect little intellectual ambush',
        blurb: 'Niche references, layered detail, and strong composition.',
        preferredThemes: ['artsy', 'campus', 'classic'],
        vibeFocus: { brainy: 3, romantic: 2, dreamy: 1 },
      },
      {
        id: 'picnic-detour',
        label: 'The one built around blankets, fruit, and an unusually well-composed setting',
        blurb: 'Soft logistics and a very cohesive visual mood.',
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
    title: 'Everyday Setting',
    prompt: 'Placed in an ordinary setting, which Rocky still feels especially distinctive?',
    options: [
      {
        id: 'grocery-theory',
        label: 'The one that still feels distinctive in a simple grocery-aisle setting',
        blurb: 'Domestic realism with a strong point of view.',
        preferredThemes: ['hometown', 'cozy', 'classic'],
        vibeFocus: { cozy: 3, brainy: 1, romantic: 2 },
      },
      {
        id: 'museum-errand',
        label: 'The one who turns a casual errand into something more thoughtful',
        blurb: 'Academic texture in broad daylight.',
        preferredThemes: ['artsy', 'abstract', 'campus'],
        vibeFocus: { brainy: 3, dreamy: 1, romantic: 1 },
      },
      {
        id: 'afterparty-errand',
        label: 'The one who says “help me with one thing” and drags you into glamorous disarray',
        blurb: 'Questionable plans, but excellent visual payoff.',
        preferredThemes: ['rebel', 'heroic', 'mythic'],
        vibeFocus: { glam: 2, wild: 2, chaotic: 2 },
      },
    ],
  },
  {
    id: 'second-pass',
    scenarioType: 'random-encounter',
    title: 'Repeat Standout',
    prompt: 'Which Rocky would keep standing out even if you ran into it again and again?',
    options: [
      {
        id: 'bookish-repeat',
        label: 'The one who keeps materializing near references, symbols, and suspiciously relevant advice',
        blurb: 'References and symbolism keep pushing it higher.',
        preferredThemes: ['artsy', 'abstract', 'campus'],
        vibeFocus: { brainy: 3, dreamy: 1, glam: 1 },
      },
      {
        id: 'pastoral-repeat',
        label: 'The one who turns every reappearance into a soft-focus seasonal event',
        blurb: 'Petals again, with a clear seasonal identity.',
        preferredThemes: ['nature', 'floral', 'hometown'],
        vibeFocus: { dreamy: 2, romantic: 2, cozy: 2 },
      },
      {
        id: 'electric-repeat',
        label: 'The one who keeps arriving with volume, velocity, and a tiny amount of risk',
        blurb: 'Big motion, bright contrast, and no interest in caution.',
        preferredThemes: ['rebel', 'sporty', 'abstract'],
        vibeFocus: { chaotic: 3, bold: 2, glam: 2 },
      },
    ],
  },
  {
    id: 'luck-pivot',
    scenarioType: 'chance',
    title: 'Bonus Signal',
    prompt: 'A few background details tilt the mood. Which Rocky benefits most from that extra context?',
    options: [
      {
        id: 'lucky-bloom',
        label: 'The one suddenly favored by timing, weather, and absurd floral luck',
        blurb: 'A favorable setup for color, setting, and floral detail.',
        preferredThemes: ['floral', 'nature', 'cozy'],
        vibeFocus: { romantic: 2, dreamy: 2, cozy: 1 },
      },
      {
        id: 'lucky-eclipse',
        label: 'The one that gets stronger when the setting turns theatrical',
        blurb: 'Extra atmosphere and strong lighting cues.',
        preferredThemes: ['cosmic', 'spooky', 'mythic'],
        vibeFocus: { dreamy: 3, glam: 1, bold: 1 },
      },
      {
        id: 'lucky-detour',
        label: 'The one who somehow profits from every sudden detour and rule bend',
        blurb: 'Excellent timing and slightly dubious methods.',
        preferredThemes: ['rebel', 'heroic', 'sporty'],
        vibeFocus: { chaotic: 2, wild: 2, bold: 2 },
      },
    ],
  },
  {
    id: 'third-date-line',
    scenarioType: 'third-date',
    title: 'Clear Preference',
    prompt: 'By now your preferences are clearer. Which Rocky feels like the most natural fit?',
    options: [
      {
        id: 'soft-confession',
        label: 'The one that works through quiet detail instead of spectacle',
        blurb: 'Low-key presentation, strong effect.',
        preferredThemes: ['classic', 'cozy', 'romantic'],
        vibeFocus: { romantic: 3, cozy: 2, dreamy: 1 },
      },
      {
        id: 'brainy-confession',
        label: 'The one that communicates through theory, symbolism, and careful detail',
        blurb: 'Structured, thoughtful, and heavy on subtext.',
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
    title: 'Final Choice',
    prompt: 'One last choice shapes the final ranking. What kind of finish fits you best?',
    options: [
      {
        id: 'ornate-ending',
        label: 'A dramatic finish under impossible lighting',
        blurb: 'You want the biggest visual statement.',
        preferredThemes: ['mythic', 'artsy', 'rebel'],
        vibeFocus: { glam: 3, romantic: 2, dreamy: 1 },
      },
      {
        id: 'steady-ending',
        label: 'A quiet finish built around one clear moment',
        blurb: 'Minimal theatrics, maximum clarity.',
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
