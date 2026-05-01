import { hiddenChanceDeck, themeFlavors, themeLabels, vibeLabels } from '../content'
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
  dreamy: 'atmospheric calm',
  chaotic: 'high-energy contrast',
  romantic: 'warm expressiveness',
  bold: 'confident presence',
  brainy: 'thoughtful detail',
  cozy: 'welcoming energy',
  glam: 'showpiece flair',
  wild: 'sense of motion',
}

const vibeRouteTitles: Record<Vibe, string> = {
  dreamy: 'Dreamy Profile',
  chaotic: 'Chaotic Profile',
  romantic: 'Warm Profile',
  bold: 'Bold Profile',
  brainy: 'Brainy Profile',
  cozy: 'Cozy Profile',
  glam: 'Glam Profile',
  wild: 'Wild Profile',
}

const vibeRouteOpeners: Record<Vibe, string> = {
  dreamy: 'Your picks consistently favored atmosphere and imagination.',
  chaotic: 'Your picks leaned toward contrast, surprise, and strong visual energy.',
  romantic: 'Your picks consistently favored warmth and expressive details.',
  bold: 'Your picks rewarded confidence, clarity, and momentum.',
  brainy: 'Your picks emphasized references, structure, and thoughtful details.',
  cozy: 'Your picks kept returning to comfort, familiarity, and warmth.',
  glam: 'Your picks favored spectacle, polish, and standout presentation.',
  wild: 'Your picks leaned toward motion, energy, and a sense of action.',
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
  return vibeLabels[vibe] ?? titleCase(vibe)
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

function isAvailableForRun(seed: number, rocky: RockyData) {
  return jitter(seed, 'run-availability', rocky.slug) >= 0.28
}

function chooseWeightedCandidate(
  ranked: Array<{ rocky: RockyData; score: number }>,
  seed: number,
  ...parts: string[]
) {
  if (ranked.length === 0) {
    return undefined
  }

  const bestScore = ranked[0]?.score ?? 0
  const candidates = ranked.slice(0, 18)

  const weighted = candidates.map((entry, index) => {
    const closeness = Math.max(0.08, 1 - (bestScore - entry.score) / 18)
    const randomnessBoost = 0.8 + jitter(seed, ...parts, entry.rocky.slug, String(index)) * 0.45

    return {
      ...entry,
      weight: closeness * randomnessBoost,
    }
  })

  const totalWeight = weighted.reduce((total, entry) => total + entry.weight, 0)

  if (totalWeight <= 0) {
    return weighted[0]?.rocky
  }

  const target = jitter(seed, ...parts, 'weighted-pick') * totalWeight
  let runningWeight = 0

  for (const entry of weighted) {
    runningWeight += entry.weight

    if (target <= runningWeight) {
      return entry.rocky
    }
  }

  return weighted[weighted.length - 1]?.rocky
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
  const minimumCastSize = scenes.length * 3 + 12
  const rotatedPool = rockys.filter((rocky) => isAvailableForRun(seed, rocky))
  const pool = rotatedPool.length >= minimumCastSize ? rotatedPool : rockys
  const used = new Set<string>()

  return scenes.map((scene, sceneIndex) => {
    const hiddenChance = selectHiddenChance(scene, seed, sceneIndex)
    const cast = scene.options.map((option, optionIndex) => {
      const ranked = pool
        .filter((rocky) => !used.has(rocky.slug))
        .map((rocky) => ({
          rocky,
          score:
            scoreRockyForOption(rocky, option, scene.scenarioType, hiddenChance) +
            jitter(seed, scene.id, option.id, rocky.slug) * 1.9 +
            jitter(sceneIndex + optionIndex, hiddenChance.id, rocky.slug) * 1.2,
        }))
        .sort((left, right) => right.score - left.score)

      const selected =
        chooseWeightedCandidate(ranked, seed, scene.id, option.id, hiddenChance.id, String(sceneIndex), String(optionIndex)) ??
        ranked[0]?.rocky ??
        rockys[0]
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
  return rankRockysByAnswers(rockys, answers)[0]?.rocky
}

export function rankRockysByAnswers(rockys: RockyData[], answers: SafariAnswer[]) {
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

      return { rocky, score, chosenEarlier: chosenIds.has(rocky.slug) }
    })
    .sort((left, right) => right.score - left.score)
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
  return rocky.topVibes.slice(0, 2).map((vibe) => labelVibe(vibe)).join(' / ')
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
    ['reads as', 'feels like', 'comes across as', 'works as'],
    rocky.slug,
    'field-guide-opener',
  )
  const closer = pickFrom(
    [
      'It stands out immediately in the lineup.',
      'It reads less like a background piece and more like a centerpiece.',
      'The combination of theme and setting gives it a clear identity.',
      'It has a distinct point of view within the full roster.',
    ],
    rocky.slug,
    'field-guide-closer',
  )

  return `${rocky.name} ${opener} a ${labelTheme(rocky.primaryTheme).toLowerCase()} ${getVenueRole(rocky)} with ${vibePhrases[leadVibe]}, a streak of ${vibePhrases[supportVibe]}, and enough ${labelTheme(secondaryTheme).toLowerCase()} energy to stay distinctive. ${closer}`
}

export function buildRockyTeaser(rocky: RockyData) {
  const leadVibe = rocky.topVibes[0]
  const teaser = pickFrom(
    [
      'Feels like a strong alternate result.',
      'Stands out as another close match.',
      'Has a profile that overlaps with your top picks.',
      'Reads as a nearby fit in the ranking.',
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
      'That choice reinforced the pattern quickly.',
      'The scoring model picked up on that preference immediately.',
      'That answer made your overall profile more consistent.',
      'That selection clearly strengthened the result pattern.',
    ],
    answer.sceneId,
    answer.rocky.slug,
    'answer-beat',
  )

  return `${answer.rocky.name} pushed this round toward ${theme} themes, ${leadVibe} energy, and a bit more ${chanceTheme} influence. ${closer}`
}

export function describeRouteOutcome(match: RockyData, answers: SafariAnswer[]) {
  const { profile, themeWeights, chosenIds } = buildPreferenceState(answers)
  const rankedVibes = rankProfile(profile)
  const rankedThemes = sortMapEntries(themeWeights)
  const leadVibe = rankedVibes[0]?.[0] ?? match.topVibes[0]
  const supportVibe = rankedVibes[1]?.[0] ?? match.topVibes[1] ?? leadVibe
  const leadTheme = rankedThemes[0]?.[0] ?? match.primaryTheme
  const supportTheme = rankedThemes[1]?.[0] ?? match.themes[1] ?? leadTheme
  const matchWasChosenEarlier = chosenIds.has(match.slug)
  const routeTitle = vibeRouteTitles[leadVibe]
  const routeFlavor = themeFlavors[leadTheme] ?? themeFlavors.classic

  return {
    title: routeTitle,
    summary: `${vibeRouteOpeners[leadVibe]} Across the quiz, your answers kept reinforcing ${labelVibe(supportVibe).toLowerCase()} traits and circling back to ${formatPair(labelTheme(leadTheme).toLowerCase(), labelTheme(supportTheme).toLowerCase())} themes.`,
    compatibility: matchWasChosenEarlier
      ? `${match.name} ranks first because you repeatedly gravitated toward the same mix of themes and visual energy. ${routeFlavor}`
      : `${match.name} ranks first because your answers built a strong profile match for its ${vibePhrases[match.topVibes[0]]}, ${labelTheme(match.primaryTheme).toLowerCase()} focus, and overall style. ${routeFlavor}`,
  }
}
