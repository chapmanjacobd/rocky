export const vibeKeys = [
  'dreamy',
  'chaotic',
  'romantic',
  'bold',
  'brainy',
  'cozy',
  'glam',
  'wild',
] as const

export type Vibe = (typeof vibeKeys)[number]

export type ScenarioType = 'first-date' | 'random-encounter' | 'chance' | 'finale'

export interface RockyData {
  objectId: number
  id: number
  slug: string
  name: string
  location: string
  address: string
  city: string
  artist: string
  year: number
  alpha: boolean
  indoors: boolean
  campus: boolean
  sponsor: string
  long: number | null
  lat: number | null
  mapsUrl: string
  description: string
  comment: string
  retired: boolean
  privateResidence: boolean
  imagePath: string
  relativeImagePath: string
  themes: string[]
  primaryTheme: string
  vibeScores: Record<Vibe, number>
  topVibes: Vibe[]
  venueLabel: string
}

export interface HiddenChanceCard {
  id: string
  boostThemes: string[]
  suppressThemes: string[]
  vibeFocus: Partial<Record<Vibe, number>>
}

export interface SceneOption {
  id: string
  label: string
  blurb: string
  preferredThemes: string[]
  vibeFocus: Partial<Record<Vibe, number>>
}

export interface SceneSpec {
  id: string
  scenarioType: ScenarioType
  title: string
  prompt: string
  options: SceneOption[]
}

export interface GeneratedScene {
  scene: SceneSpec
  cast: RockyData[]
  hiddenChance: HiddenChanceCard
}

export interface SafariAnswer {
  sceneId: string
  sceneTitle: string
  sceneType: ScenarioType
  option: SceneOption
  rocky: RockyData
  hiddenChance: HiddenChanceCard
}
