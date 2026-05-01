import { hiddenChanceDeck, themeLabels } from '../content'
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
  'random-encounter': { dreamy: 1, chaotic: 1, wild: 1, bold: 1 },
  chance: { dreamy: 1, glam: 1, bold: 1 },
  finale: { romantic: 2, bold: 1, glam: 1 },
}

const scenarioWeights: Record<ScenarioType, number> = {
  'first-date': 1.15,
  'random-encounter': 1,
  chance: 0.95,
  finale: 1.35,
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
    })

    hiddenChance.suppressThemes.forEach((theme) => {
      themeWeights.set(theme, (themeWeights.get(theme) ?? 0) - 2.5)
    })

    chosenIds.add(rocky.slug)
  })

  return { profile, themeWeights, chosenIds }
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
