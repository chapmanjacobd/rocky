import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { safariScenes, scenarioLabels, themeLabels, vibeLabels } from './content'
import {
  buildRockyFieldGuide,
  buildSafariRun,
  describeAnswerBeat,
  describeRouteOutcome,
  labelTheme,
  rankRockysByAnswers,
  summarizeThemes,
  summarizeVibes,
} from './lib/rocky'
import type { RockyData, SafariAnswer } from './types'

type AppView = 'home' | 'safari' | 'roster'

function getViewFromHash(hash: string): AppView {
  const normalizedHash = hash.replace(/^#\/?/, '').toLowerCase()

  if (normalizedHash === 'safari') {
    return 'safari'
  }

  if (normalizedHash === 'roster' || normalizedHash === 'archive') {
    return 'roster'
  }

  return 'home'
}

function App() {
  const [rockys, setRockys] = useState<RockyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [answers, setAnswers] = useState<SafariAnswer[]>([])
  const [seed, setSeed] = useState(0)
  const [search, setSearch] = useState('')
  const [activeTheme, setActiveTheme] = useState('all')
  const [activeView, setActiveView] = useState<AppView>(() => getViewFromHash(window.location.hash))

  useEffect(() => {
    let cancelled = false

    async function loadRockys() {
      try {
        setLoading(true)
        const response = await fetch('/rockys-data.json')

        if (!response.ok) {
          throw new Error(`Could not load Rocky data (${response.status})`)
        }

        const payload = (await response.json()) as RockyData[]

        if (!cancelled) {
          setRockys(payload)
          setError('')
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unknown loading error')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadRockys()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function syncViewWithHash() {
      setActiveView(getViewFromHash(window.location.hash))
    }

    window.addEventListener('hashchange', syncViewWithHash)

    return () => {
      window.removeEventListener('hashchange', syncViewWithHash)
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    document.title =
      activeView === 'safari' ? 'Safari | True Pup Safari' : activeView === 'roster' ? 'Roster | True Pup Safari' : 'True Pup Safari'
  }, [activeView])

  const safariRun = useMemo(
    () => (rockys.length > 0 ? buildSafariRun(rockys, safariScenes, seed) : []),
    [rockys, seed],
  )

  const currentSceneIndex = answers.length
  const currentGeneratedScene = safariRun[currentSceneIndex]
  const currentScene = currentGeneratedScene?.scene
  const currentCards = currentGeneratedScene?.cast ?? []
  const rankedResults = useMemo(
    () => (answers.length === safariScenes.length ? rankRockysByAnswers(rockys, answers) : []),
    [answers, rockys],
  )
  const revealedRocky = rankedResults[0]?.rocky
  const routeOutcome = useMemo(
    () => (revealedRocky ? describeRouteOutcome(revealedRocky, answers) : undefined),
    [answers, revealedRocky],
  )

  const themeCounts = useMemo(() => {
    const counts = new Map<string, number>()

    rockys.forEach((rocky) => {
      rocky.themes.forEach((theme) => {
        counts.set(theme, (counts.get(theme) ?? 0) + 1)
      })
    })

    return [...counts.entries()].sort((left, right) => right[1] - left[1])
  }, [rockys])

  const browseThemes = useMemo(
    () => ['all', ...themeCounts.slice(0, 8).map(([theme]) => theme)],
    [themeCounts],
  )

  const filteredRockys = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return rockys.filter((rocky) => {
      const matchesTheme = activeTheme === 'all' || rocky.themes.includes(activeTheme)
      const haystack = `${rocky.name} ${rocky.artist} ${rocky.location} ${rocky.sponsor}`.toLowerCase()
      const matchesSearch = normalizedSearch.length === 0 || haystack.includes(normalizedSearch)
      return matchesTheme && matchesSearch
    })
  }, [activeTheme, rockys, search])

  const stats = useMemo(() => {
    if (rockys.length === 0) {
      return []
    }

    const years = rockys.map((rocky) => rocky.year)
    return [
      { label: 'Rockys in the cast', value: String(rockys.length) },
      { label: 'Route beats per run', value: String(safariScenes.length) },
      { label: 'Years represented', value: `${Math.min(...years)}-${Math.max(...years)}` },
      {
        label: 'Strongest archive moods',
        value: themeCounts
          .slice(0, 3)
          .map(([theme]) => labelTheme(theme))
          .join(' / '),
      },
    ]
  }, [rockys, themeCounts])

  function chooseRocky(optionIndex: number) {
    if (!currentGeneratedScene) {
      return
    }

    const option = currentGeneratedScene.scene.options[optionIndex]
    const rocky = currentGeneratedScene.cast[optionIndex]

    if (!option || !rocky) {
      return
    }

    setAnswers((previous) => [
      ...previous,
      {
        sceneId: currentGeneratedScene.scene.id,
        sceneTitle: currentGeneratedScene.scene.title,
        sceneType: currentGeneratedScene.scene.scenarioType,
        option,
        rocky,
        hiddenChance: currentGeneratedScene.hiddenChance,
      },
    ])
  }

  function restartSafari() {
    setAnswers([])
  }

  function reshuffleSafari() {
    setAnswers([])
    setSeed((current) => current + 1)
  }

  const activePageLabel = activeView === 'safari' ? 'Safari' : activeView === 'roster' ? 'Roster' : ''
  const safariProgressCopy =
    answers.length > 0 ? `${answers.length} of ${safariScenes.length} quiz questions answered.` : 'Start the quiz to build your Rocky profile.'
  const leadingThemesCopy =
    themeCounts.length > 0 ? themeCounts.slice(0, 3).map(([theme]) => labelTheme(theme)).join(' / ') : 'Loading archive moods...'

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">True Pup Safari</p>
          <h1 className="brand">{activeView === 'home' ? 'Which Rocky are you?' : activePageLabel}</h1>
          {activeView === 'home' ? null : (
            <p className="topbar-copy">
              {activeView === 'safari'
                ? 'Take the quiz and see which Rockys best match your choices.'
                : 'Browse the full Rocky archive on its own page.'}
            </p>
          )}
        </div>
        <nav className="topbar-links" aria-label="Primary">
          {activeView !== 'home' ? <a href="#">Home</a> : null}
          {activeView !== 'safari' ? <a href="#safari">Safari</a> : null}
          {activeView !== 'roster' ? <a href="#roster">Roster</a> : null}
        </nav>
      </header>

      {activeView === 'home' ? (
        <>
          <section className="hero-panel">
            <div className="hero-copy">
              <p className="kicker">Part field guide, part personality quiz, part public-art archive.</p>
              <p className="hero-lede">
                Explore the Rockys two ways: take a short quiz to find your closest matches, or browse the full roster
                directly.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#safari">
                  Open safari
                </a>
                <a className="button button-secondary" href="#roster">
                  Open roster
                </a>
              </div>
            </div>

            <aside className="hero-card">
              <p className="mini-label">How it works</p>
              <ol className="steps-list">
                <li>Use Safari to answer a short series of Rocky preference questions.</li>
                <li>See your top match plus a ranked archive based on your selections.</li>
                <li>Use Roster when you want to browse the full collection directly.</li>
              </ol>
            </aside>
          </section>

          <section className="page-grid" aria-label="Page destinations">
            <article className="page-card">
              <p className="mini-label">Safari</p>
              <h2>Take the “Which Rocky are you?” quiz.</h2>
              <p>{safariProgressCopy}</p>
              <div className="page-card-meta">
                <span>{safariScenes.length} questions per run</span>
                <span>{revealedRocky ? `Current top match: ${revealedRocky.name}` : 'No result yet'}</span>
              </div>
              <a className="button button-primary" href="#safari">
                Enter safari
              </a>
            </article>

            <article className="page-card">
              <p className="mini-label">Roster</p>
              <h2>Browse the full Rocky archive like its own field guide.</h2>
              <p>{rockys.length > 0 ? `${rockys.length} Rockys in the cast.` : 'Loading the full cast...'}</p>
              <div className="page-card-meta">
                <span>{filteredRockys.length} visible with current filters</span>
                <span>{leadingThemesCopy}</span>
              </div>
              <a className="button button-secondary" href="#roster">
                Enter roster
              </a>
            </article>
          </section>

          {stats.length > 0 ? (
            <section className="stats-grid" aria-label="Archive statistics">
              {stats.map((stat) => (
                <article key={stat.label} className="stat-card">
                  <p className="mini-label">{stat.label}</p>
                  <p className="stat-value">{stat.value}</p>
                </article>
              ))}
            </section>
          ) : null}
        </>
      ) : null}

      {activeView === 'safari' ? (
        <section className="section-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Safari quiz</p>
              <h2>Which Rocky are you?</h2>
            </div>
            <div className="action-row">
              <button type="button" className="button button-secondary" onClick={restartSafari}>
                Restart quiz
              </button>
              <button type="button" className="button button-secondary" onClick={reshuffleSafari}>
                Shuffle options
              </button>
            </div>
          </div>

          {loading ? <div className="status-card">Loading the Rocky roster...</div> : null}
          {error ? <div className="status-card status-error">{error}</div> : null}

          {!loading && !error && currentScene ? (
            <>
              <div className="scene-header">
                <p className="mini-label">
                  Scene {currentSceneIndex + 1} of {safariScenes.length} · {scenarioLabels[currentScene.scenarioType]}
                </p>
                <h3>{currentScene.title}</h3>
                <p>{currentScene.prompt}</p>
              </div>

              <div className="choice-grid">
                {currentScene.options.map((option, optionIndex) => {
                  const rocky = currentCards[optionIndex]

                  if (!rocky) {
                    return null
                  }

                  return (
                    <button
                      key={`${currentScene.id}-${option.id}-${rocky.slug}`}
                      type="button"
                      className="choice-card"
                      onClick={() => chooseRocky(optionIndex)}
                    >
                      <img src={rocky.imagePath} alt={rocky.name} loading="lazy" />
                      <div className="choice-copy">
                        <p className="mini-label">{option.blurb}</p>
                        <h4>{rocky.name}</h4>
                        <p className="choice-label">{option.label}</p>
                        <p className="choice-meta">
                          {rocky.artist} · {rocky.year} · {summarizeThemes(rocky)}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          ) : null}

          {answers.length > 0 ? (
            <div className="glimpse-panel">
              <div className="section-heading compact">
                <div>
                  <p className="mini-label">Your selections so far</p>
                  <h3>How your profile is taking shape</h3>
                </div>
              </div>
              <div className="glimpse-grid">
                {answers.map((answer) => (
                  <article key={`${answer.rocky.slug}-${answer.option.id}`} className="glimpse-card">
                    <img src={answer.rocky.imagePath} alt={answer.rocky.name} loading="lazy" />
                    <div>
                      <p className="mini-label">
                        {answer.sceneTitle} · {scenarioLabels[answer.sceneType]}
                      </p>
                      <h4>{answer.rocky.name}</h4>
                      <p>{answer.option.blurb}</p>
                      <p className="glimpse-beat">{describeAnswerBeat(answer)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {!loading && !error && revealedRocky ? (
            <div className="reveal-panel">
              <div className="reveal-image">
                <img src={revealedRocky.imagePath} alt={revealedRocky.name} />
              </div>
              <div className="reveal-copy">
                <p className="eyebrow">Your top match</p>
                <h2>{revealedRocky.name}</h2>
                <p className="reveal-lede">
                  Based on your selections, <strong>{revealedRocky.name}</strong> ranks first in the roster.
                </p>
                {routeOutcome ? (
                  <div className="route-dossier">
                    <p className="mini-label">Result summary</p>
                    <h3>{routeOutcome.title}</h3>
                    <p>{routeOutcome.summary}</p>
                    <p>{routeOutcome.compatibility}</p>
                    <p>{routeOutcome.epilogue}</p>
                  </div>
                ) : null}
                <p>{revealedRocky.description || buildRockyFieldGuide(revealedRocky)}</p>
                {revealedRocky.description ? <p className="generated-note">{buildRockyFieldGuide(revealedRocky)}</p> : null}
                <p>
                  <strong>Top vibes:</strong> {summarizeVibes(revealedRocky)}.
                </p>

                <div className="metadata-grid">
                  <div>
                    <span>Artist</span>
                    <strong>{revealedRocky.artist}</strong>
                  </div>
                  <div>
                    <span>Year</span>
                    <strong>{revealedRocky.year}</strong>
                  </div>
                  <div>
                    <span>Sponsor</span>
                    <strong>{revealedRocky.sponsor || 'Unknown patron'}</strong>
                  </div>
                  <div>
                    <span>Location link</span>
                    {revealedRocky.mapsUrl ? (
                      <a href={revealedRocky.mapsUrl} target="_blank" rel="noreferrer">
                        Open in Google Maps
                      </a>
                    ) : (
                      <strong>Unavailable</strong>
                    )}
                  </div>
                </div>

                <div className="tag-row" aria-label="Profile tags">
                  {revealedRocky.themes.slice(0, 4).map((theme) => (
                    <span key={`${revealedRocky.slug}-${theme}`} className="tag">
                      {themeLabels[theme] ?? theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {!loading && !error && rankedResults.length > 0 ? (
            <div className="followup-panel">
              <div className="section-heading compact">
                <div>
                  <p className="mini-label">Sorted roster</p>
                  <h3>The full archive, ranked by your answers</h3>
                </div>
              </div>
              <p className="results-copy">Every Rocky is ordered here from closest match to farthest match.</p>
              <div className="archive-grid">
                {rankedResults.map((entry, index) => (
                  <article key={entry.rocky.slug} className="archive-card">
                    <img src={entry.rocky.imagePath} alt={entry.rocky.name} loading="lazy" />
                    <div className="archive-copy">
                      <div className="archive-heading">
                        <div>
                          <p className="mini-label">
                            #{index + 1} match{entry.chosenEarlier ? ' · picked in quiz' : ''}
                          </p>
                          <h3>{entry.rocky.name}</h3>
                        </div>
                        <p className="archive-vibe">
                          {entry.rocky.topVibes.map((vibe) => vibeLabels[vibe]).join(' / ')}
                        </p>
                      </div>
                      <p className="archive-body">
                        {entry.rocky.description ||
                          `${entry.rocky.name} is tagged ${summarizeThemes(entry.rocky).toLowerCase()} and stays consistent with your quiz pattern.`}
                      </p>
                      <p className="archive-note">{buildRockyFieldGuide(entry.rocky)}</p>
                      <div className="metadata-grid compact">
                        <div>
                          <span>Year</span>
                          <strong>{entry.rocky.year}</strong>
                        </div>
                        <div>
                          <span>Venue</span>
                          <strong>{entry.rocky.location || entry.rocky.address || entry.rocky.city}</strong>
                        </div>
                      </div>
                      <div className="archive-footer">
                        <div className="tag-row">
                          {entry.rocky.themes.slice(0, 3).map((theme) => (
                            <span key={`${entry.rocky.slug}-${theme}`} className="tag">
                              {labelTheme(theme)}
                            </span>
                          ))}
                        </div>
                        {entry.rocky.mapsUrl ? (
                          <a href={entry.rocky.mapsUrl} target="_blank" rel="noreferrer">
                            Maps
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeView === 'roster' ? (
        <section className="section-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Full roster</p>
              <h2>Browse the entire Rocky cast.</h2>
            </div>
          </div>

          <div className="browse-controls">
            <label className="search-field">
              <span className="mini-label">Search names, artists, and venues</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Try 'space', 'Deb Lutz', or 'campus'"
              />
            </label>
            <div className="chip-row" aria-label="Theme filters">
              {browseThemes.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  className={`filter-chip ${activeTheme === theme ? 'is-active' : ''}`}
                  onClick={() => setActiveTheme(theme)}
                >
                  {theme === 'all' ? 'All themes' : labelTheme(theme)}
                </button>
              ))}
            </div>
          </div>

          <p className="results-copy">{filteredRockys.length} Rockys currently staring back.</p>

          <div className="archive-grid">
            {filteredRockys.map((rocky) => (
              <article key={rocky.slug} className="archive-card">
                <img src={rocky.imagePath} alt={rocky.name} loading="lazy" />
                <div className="archive-copy">
                  <div className="archive-heading">
                    <div>
                      <p className="mini-label">{rocky.year}</p>
                      <h3>{rocky.name}</h3>
                    </div>
                    <p className="archive-vibe">
                      {rocky.topVibes.map((vibe) => vibeLabels[vibe]).join(' / ')}
                    </p>
                  </div>
                  <p className="archive-body">
                    {rocky.description ||
                      `${rocky.name} is tagged ${summarizeThemes(rocky).toLowerCase()} and stands out clearly in the archive.`}
                  </p>
                  <p className="archive-note">{buildRockyFieldGuide(rocky)}</p>
                  <div className="metadata-grid compact">
                    <div>
                      <span>Artist</span>
                      <strong>{rocky.artist}</strong>
                    </div>
                    <div>
                      <span>Venue</span>
                      <strong>{rocky.location || rocky.address || rocky.city}</strong>
                    </div>
                  </div>
                  <div className="archive-footer">
                    <div className="tag-row">
                      {rocky.themes.slice(0, 3).map((theme) => (
                        <span key={`${rocky.slug}-${theme}`} className="tag">
                          {labelTheme(theme)}
                        </span>
                      ))}
                    </div>
                    {rocky.mapsUrl ? (
                      <a href={rocky.mapsUrl} target="_blank" rel="noreferrer">
                        Maps
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}

export default App
