import { hiddenChanceDeck, themeFlavors, themeLabels } from '../content'
import type {
  GeneratedScene,
  HiddenChanceCard,
  RockyData,
  SafariAnswer,
  SceneOption,
  SceneSpec,
  ScenarioType,
  Vibe,
} from '../types'
import { vibeKeys } from '../types'

const scenarioBias: Record<ScenarioType, Partial<Record<Vibe, number>>> = {
  'first-date': { romantic: 2, cozy: 1, glam: 1 },
  'second-date': { cozy: 2, brainy: 1, romantic: 2 },
  'random-encounter': { dreamy: 1, chaotic: 1, wild: 1, bold: 1 },
  chance: { dreamy: 1, glam: 1, bold: 1 },
  'third-date': { romantic: 2, brainy: 1, bold: 1 },
  finale: { romantic: 2, bold: 1, glam: 1 },
}

const scenarioWeights: Record<ScenarioType, number> = {
  'first-date': 1.15,
  'second-date': 1.2,
  'random-encounter': 1,
  chance: 0.95,
  'third-date': 1.28,
  finale: 1.35,
}

const vibePhrases: Record<Vibe, string> = {
  dreamy: 'soft-focus inevitability',
  chaotic: 'bad-idea magnetism',
  romantic: 'direct emotional damage',
  bold: 'full-volume conviction',
  brainy: 'dangerously articulate charm',
  cozy: 'weaponized tenderness',
  glam: 'spotlit menace',
  wild: 'runaway momentum',
}

const vibeRouteTitles: Record<Vibe, string> = {
  dreamy: 'Moonlit Drift Route',
  chaotic: 'Disaster Flirt Route',
  romantic: 'Soft Launch, Hard Feelings Route',
  bold: 'Grand Gesture Route',
  brainy: 'Annotated Yearning Route',
  cozy: 'Domestic Trap Route',
  glam: 'Velvet Menace Route',
  wild: 'Runaway Chemistry Route',
}

const vibeRouteOpeners: Record<Vibe, string> = {
  dreamy: 'You kept choosing atmosphere over common sense.',
  chaotic: 'You repeatedly rewarded chemistry that looked mildly unsafe.',
  romantic: 'You took every invitation to feel something immediately.',
  bold: 'You were never going to pick restraint if momentum was available.',
  brainy: 'You made a home out of subtext, references, and suspiciously smart eye contact.',
  cozy: 'You fell for comfort so hard it looped back around into peril.',
  glam: 'You trusted the route with spectacle, nerve, and impossible lighting.',
  wild: 'You kept leaning toward motion, risk, and dogs who absolutely would not slow down.',
}

const venueRoles = {
  campus: 'campus legend',
  indoors: 'indoor heartbreaker',
  privateResidence: 'off-limits problem',
  default: 'street-corner apparition',
}

function pickFrom<T>(items: T[], ...parts: string[]) {
  return items[hashString(parts.join(':')) % items.length]
}

export function emptyProfile(): Record<Vibe, number> {
  return Object.fromEntries(vibeKeys.map((key) => [key, 0])) as Record<Vibe, number>
}

export function addProfile(
  target: Record<Vibe, number>,
  source: Partial<Record<Vibe, number>>,
  weight = 1,
) {
  for (const key of vibeKeys) {
    target[key] += (source[key] ?? 0) * weight
  }
}

export function titleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function labelTheme(theme: string) {
  return themeLabels[theme] ?? titleCase(theme)
}

function labelVibe(vibe: Vibe) {
  return titleCase(vibe)
}

function dotProduct(left: Partial<Record<Vibe, number>>, right: Partial<Record<Vibe, number>>) {
  return vibeKeys.reduce((total, key) => total + (left[key] ?? 0) * (right[key] ?? 0), 0)
}

function hashString(input: string) {
  let hash = 0

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

function jitter(seed: number, ...parts: string[]) {
  return (hashString(`${seed}:${parts.join(':')}`) % 1000) / 1000
}

function selectHiddenChance(scene: SceneSpec, seed: number, sceneIndex: number) {
  const deck = hiddenChanceDeck[scene.scenarioType]
  return deck[(hashString(`${seed}:${scene.id}:${sceneIndex}`) + sceneIndex) % deck.length]
}

function scoreChanceCard(rocky: RockyData, hiddenChance: HiddenChanceCard) {
  let score = dotProduct(hiddenChance.vibeFocus, rocky.vibeScores)

  hiddenChance.boostThemes.forEach((theme, index) => {
    if (rocky.themes.includes(theme)) {
      score += index === 0 ? 5 : 3
    }
  })

  hiddenChance.suppressThemes.forEach((theme) => {
    if (rocky.themes.includes(theme)) {
      score -= 3
    }
  })

  return score
}

export function scoreRockyForOption(
  rocky: RockyData,
  option: SceneOption,
  sceneType: ScenarioType,
  hiddenChance: HiddenChanceCard,
) {
  let score = dotProduct(option.vibeFocus, rocky.vibeScores)
  score += dotProduct(scenarioBias[sceneType], rocky.vibeScores) * 0.6
  score += scoreChanceCard(rocky, hiddenChance)

  for (const theme of option.preferredThemes) {
    if (rocky.themes.includes(theme)) {
      score += rocky.primaryTheme === theme ? 7 : 4
    }
  }

  if (rocky.description) {
    score += 0.25
  }

  return score
}

export function buildSafariRun(rockys: RockyData[], scenes: SceneSpec[], seed: number): GeneratedScene[] {
  const used = new Set<string>()

  return scenes.map((scene, sceneIndex) => {
    const hiddenChance = selectHiddenChance(scene, seed, sceneIndex)
    const cast = scene.options.map((option, optionIndex) => {
      const ranked = rockys
        .filter((rocky) => !used.has(rocky.slug))
        .map((rocky) => ({
          rocky,
          score:
            scoreRockyForOption(rocky, option, scene.scenarioType, hiddenChance) +
            jitter(seed, scene.id, option.id, rocky.slug) * 0.9 +
            jitter(sceneIndex + optionIndex, hiddenChance.id, rocky.slug) * 0.5,
        }))
        .sort((left, right) => right.score - left.score)

      const selected = ranked[0]?.rocky ?? rockys[0]
      used.add(selected.slug)
      return selected
    })

    return {
      scene,
      cast,
      hiddenChance,
    }
  })
}

function buildPreferenceState(answers: SafariAnswer[]) {
  const profile = emptyProfile()
  const themeWeights = new Map<string, number>()
  const chanceWeights = new Map<string, number>()
  const chosenIds = new Set<string>()

  answers.forEach(({ option, rocky, sceneType, hiddenChance }, index) => {
    const scenarioWeight = scenarioWeights[sceneType]

    addProfile(profile, option.vibeFocus, 1.25 * scenarioWeight)
    addProfile(profile, rocky.vibeScores, (0.6 + index * 0.05) * scenarioWeight)
    addProfile(profile, hiddenChance.vibeFocus, 0.95)

    option.preferredThemes.forEach((theme, themeIndex) => {
      themeWeights.set(theme, (themeWeights.get(theme) ?? 0) + (themeIndex === 0 ? 4 : 2) * scenarioWeight)
    })

    rocky.themes.forEach((theme, themeIndex) => {
      themeWeights.set(theme, (themeWeights.get(theme) ?? 0) + (themeIndex === 0 ? 2.5 : 1) * scenarioWeight)
    })

    hiddenChance.boostThemes.forEach((theme, themeIndex) => {
      themeWeights.set(theme, (themeWeights.get(theme) ?? 0) + (themeIndex === 0 ? 3.5 : 2))
      chanceWeights.set(theme, (chanceWeights.get(theme) ?? 0) + (themeIndex === 0 ? 3 : 1.5))
    })

    hiddenChance.suppressThemes.forEach((theme) => {
      themeWeights.set(theme, (themeWeights.get(theme) ?? 0) - 2.5)
      chanceWeights.set(theme, (chanceWeights.get(theme) ?? 0) - 1.5)
    })

    chosenIds.add(rocky.slug)
  })

  return { profile, themeWeights, chanceWeights, chosenIds }
}

export function matchTruePup(rockys: RockyData[], answers: SafariAnswer[]) {
  const { profile, themeWeights, chosenIds } = buildPreferenceState(answers)

  return rockys
    .map((rocky) => {
      const themeScore = rocky.themes.reduce(
        (total, theme, index) => total + (themeWeights.get(theme) ?? 0) * (index === 0 ? 1.3 : 0.8),
        0,
      )

      const score =
        dotProduct(profile, rocky.vibeScores) +
        themeScore +
        (chosenIds.has(rocky.slug) ? 3 : 0) +
        (rocky.description ? 0.5 : 0)

      return { rocky, score }
    })
    .sort((left, right) => right.score - left.score)[0]?.rocky
}

export function getRelatedRockys(rockys: RockyData[], match: RockyData, answers: SafariAnswer[]) {
  const chosenIds = new Set([...answers.map((answer) => answer.rocky.slug), match.slug])
  const anchorThemes = new Set(match.themes)

  return rockys
    .filter((rocky) => !chosenIds.has(rocky.slug))
    .map((rocky) => {
      const sharedThemes = rocky.themes.filter((theme) => anchorThemes.has(theme)).length
      const vibeScore = dotProduct(match.vibeScores, rocky.vibeScores)
      return { rocky, score: sharedThemes * 12 + vibeScore }
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map((entry) => entry.rocky)
}

export function summarizeVibes(rocky: RockyData) {
  return rocky.topVibes.slice(0, 2).map((vibe) => titleCase(vibe)).join(' / ')
}

export function summarizeThemes(rocky: RockyData) {
  return rocky.themes.slice(0, 3).map((theme) => labelTheme(theme)).join(' · ')
}

function sortMapEntries(map: Map<string, number>) {
  return [...map.entries()].sort((left, right) => right[1] - left[1])
}

function rankProfile(profile: Record<Vibe, number>) {
  return [...vibeKeys]
    .map((vibe) => [vibe, profile[vibe]] as const)
    .sort((left, right) => right[1] - left[1])
}

function formatPair(first: string, second?: string) {
  return second && second !== first ? `${first} and ${second}` : first
}

function getVenueRole(rocky: RockyData) {
  if (rocky.privateResidence) {
    return venueRoles.privateResidence
  }

  if (rocky.campus) {
    return venueRoles.campus
  }

  if (rocky.indoors) {
    return venueRoles.indoors
  }

  return venueRoles.default
}

export function buildRockyFieldGuide(rocky: RockyData) {
  const leadVibe = rocky.topVibes[0]
  const supportVibe = rocky.topVibes[1] ?? leadVibe
  const secondaryTheme = rocky.themes[1] ?? rocky.primaryTheme
  const opener = pickFrom(
    ['reads as', 'plays like', 'lands as', 'comes off as'],
    rocky.slug,
    'field-guide-opener',
  )
  const closer = pickFrom(
    [
      'It knows exactly what it is doing to the route.',
      'Calling this “just public art” feels strategically naive.',
      'You could behave normally about it, but the text does not support that reading.',
      'Nobody gets out of this one emotionally untouched.',
    ],
    rocky.slug,
    'field-guide-closer',
  )

  return `${rocky.name} ${opener} a ${labelTheme(rocky.primaryTheme).toLowerCase()} ${getVenueRole(rocky)} with ${vibePhrases[leadVibe]}, a streak of ${vibePhrases[supportVibe]}, and just enough ${labelTheme(secondaryTheme).toLowerCase()} energy to keep the plot unstable. ${closer}`
}

export function buildRockyTeaser(rocky: RockyData) {
  const leadVibe = rocky.topVibes[0]
  const teaser = pickFrom(
    [
      'Feels like a sequel waiting to happen.',
      'Would absolutely complicate a clean ending.',
      'Shows up with immediate side-route potential.',
      'Carries very strong “one more episode” energy.',
    ],
    rocky.slug,
    'teaser',
  )

  return `${labelTheme(rocky.primaryTheme)} ${getVenueRole(rocky)}, ${vibePhrases[leadVibe]}, ${teaser}`
}

export function describeAnswerBeat(answer: SafariAnswer) {
  const theme = labelTheme(answer.rocky.primaryTheme).toLowerCase()
  const leadVibe = labelVibe(answer.rocky.topVibes[0]).toLowerCase()
  const chanceTheme = labelTheme(answer.hiddenChance.boostThemes[0] ?? answer.rocky.primaryTheme).toLowerCase()
  const closer = pickFrom(
    [
      'You were not escaping that energy twice.',
      'The route logged that preference immediately.',
      'That choice aged into a pattern very fast.',
      'At that point the invisible board started taking notes.',
    ],
    answer.sceneId,
    answer.rocky.slug,
    'answer-beat',
  )

  return `${answer.rocky.name} turned this ${theme} beat into ${leadVibe} trouble, while the hidden luck system quietly fed extra ${chanceTheme} into the scene. ${closer}`
}

export function describeRouteOutcome(match: RockyData, answers: SafariAnswer[]) {
  const { profile, themeWeights, chanceWeights, chosenIds } = buildPreferenceState(answers)
  const rankedVibes = rankProfile(profile)
  const rankedThemes = sortMapEntries(themeWeights)
  const rankedChanceThemes = sortMapEntries(chanceWeights)
  const leadVibe = rankedVibes[0]?.[0] ?? match.topVibes[0]
  const supportVibe = rankedVibes[1]?.[0] ?? match.topVibes[1] ?? leadVibe
  const leadTheme = rankedThemes[0]?.[0] ?? match.primaryTheme
  const supportTheme = rankedThemes[1]?.[0] ?? match.themes[1] ?? leadTheme
  const boostedTheme = rankedChanceThemes[0]?.[0] ?? leadTheme
  const matchWasChosenEarlier = chosenIds.has(match.slug)
  const routeTitle = vibeRouteTitles[leadVibe]
  const routeFlavor = themeFlavors[leadTheme] ?? themeFlavors.classic

  return {
    title: routeTitle,
    summary: `${vibeRouteOpeners[leadVibe]} Across the second and third dates, the route kept reinforcing ${labelVibe(supportVibe).toLowerCase()} instincts and circling back to ${formatPair(labelTheme(leadTheme).toLowerCase(), labelTheme(supportTheme).toLowerCase())} trouble.`,
    compatibility: matchWasChosenEarlier
      ? `${match.name} fits because you were already gravitating toward it before the finale; the app basically spent the later dates proving your subconscious right. ${routeFlavor}`
      : `${match.name} fits because even when it stayed offstage, your picks kept building the exact emotional runway it wanted: ${vibePhrases[match.topVibes[0]]}, ${labelTheme(match.primaryTheme).toLowerCase()} flair, and a little dramatic inevitability. ${routeFlavor}`,
    epilogue: `The invisible chance deck kept boosting ${labelTheme(boostedTheme).toLowerCase()} signals in the background, so this ending reads less like luck and more like the town conspiring on your behalf.`,
  }
}
