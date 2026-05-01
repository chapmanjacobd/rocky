import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { safariScenes, scenarioLabels, themeLabels, vibeLabels } from './content'
import {
  buildRockyFieldGuide,
  buildRockyTeaser,
  buildSafariRun,
  describeAnswerBeat,
  describeRouteOutcome,
  getRelatedRockys,
  labelTheme,
  matchTruePup,
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
  const revealedRocky = useMemo(
    () => (answers.length === safariScenes.length ? matchTruePup(rockys, answers) : undefined),
    [answers, rockys],
  )
  const relatedRockys = useMemo(
    () => (revealedRocky ? getRelatedRockys(rockys, revealedRocky, answers) : []),
    [answers, revealedRocky, rockys],
  )
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

  const revealedTheme = revealedRocky ? labelTheme(revealedRocky.primaryTheme) : ''
  const activePageLabel = activeView === 'safari' ? 'Safari' : activeView === 'roster' ? 'Roster' : ''
  const safariProgressCopy =
    answers.length > 0 ? `${answers.length} of ${safariScenes.length} route beats answered.` : 'Fresh route. No emotional damage yet.'
  const leadingThemesCopy =
    themeCounts.length > 0 ? themeCounts.slice(0, 3).map(([theme]) => labelTheme(theme)).join(' / ') : 'Loading archive moods...'

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">True Pup Safari</p>
          <h1 className="brand">
            {activeView === 'home' ? 'Choose badly, feel deeply, meet your Rocky.' : activePageLabel}
          </h1>
          {activeView === 'home' ? null : (
            <p className="topbar-copy">
              {activeView === 'safari'
                ? 'A standalone route screen for the full dramatic quiz run.'
                : 'A standalone archive screen for browsing the full Rocky cast.'}
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
              <p className="kicker">Part field guide, part personality quiz, part public-art visual novel.</p>
              <p className="hero-lede">
                You do not need to travel anywhere. Pick which screen you want to disappear into, then let the archive
                decide how intense the next few minutes get.
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
                <li>Use Safari for the full route-based quiz experience.</li>
                <li>Use Roster when you want the complete archive without the quiz flow.</li>
                <li>Jump between them like separate little destinations.</li>
              </ol>
            </aside>
          </section>

          <section className="page-grid" aria-label="Page destinations">
            <article className="page-card">
              <p className="mini-label">Safari</p>
              <h2>Find the Rocky who keeps choosing you back.</h2>
              <p>{safariProgressCopy}</p>
              <div className="page-card-meta">
                <span>{safariScenes.length} scenes per run</span>
                <span>{revealedRocky ? `Current match: ${revealedRocky.name}` : 'No reveal yet'}</span>
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
              <p className="eyebrow">Safari sequence</p>
              <h2>Find the Rocky who keeps choosing you back.</h2>
            </div>
            <div className="action-row">
              <button type="button" className="button button-secondary" onClick={restartSafari}>
                Restart route
              </button>
              <button type="button" className="button button-secondary" onClick={reshuffleSafari}>
                Reshuffle cast
              </button>
            </div>
          </div>

          {loading ? <div className="status-card">Loading 132 very intense bulldogs...</div> : null}
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
                  <p className="mini-label">Your route so far</p>
                  <h3>Current emotional damage</h3>
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
                <p className="eyebrow">Your true pup</p>
                <h2>{revealedRocky.name}</h2>
                <p className="reveal-lede">
                  The archive has spoken: you are on the <strong>{revealedTheme}</strong> route.
                </p>
                {routeOutcome ? (
                  <div className="route-dossier">
                    <p className="mini-label">Route reading</p>
                    <h3>{routeOutcome.title}</h3>
                    <p>{routeOutcome.summary}</p>
                    <p>{routeOutcome.compatibility}</p>
                    <p>{routeOutcome.epilogue}</p>
                  </div>
                ) : null}
                <p>{revealedRocky.description || buildRockyFieldGuide(revealedRocky)}</p>
                {revealedRocky.description ? <p className="generated-note">{buildRockyFieldGuide(revealedRocky)}</p> : null}
                <p>
                  <strong>Temperament:</strong> {summarizeVibes(revealedRocky)}.
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

                <div className="tag-row" aria-label="Route tags">
                  {revealedRocky.themes.slice(0, 4).map((theme) => (
                    <span key={`${revealedRocky.slug}-${theme}`} className="tag">
                      {themeLabels[theme] ?? theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {!loading && !error && revealedRocky && relatedRockys.length > 0 ? (
            <div className="followup-panel">
              <div className="section-heading compact">
                <div>
                  <p className="mini-label">Post-route recommendations</p>
                  <h3>Other Rockys you would absolutely text back</h3>
                </div>
              </div>
              <div className="related-grid">
                {relatedRockys.map((rocky) => (
                  <article key={rocky.slug} className="related-card">
                    <img src={rocky.imagePath} alt={rocky.name} loading="lazy" />
                    <div>
                      <h4>{rocky.name}</h4>
                      <p>{buildRockyTeaser(rocky)}</p>
                      {rocky.mapsUrl ? (
                        <a href={rocky.mapsUrl} target="_blank" rel="noreferrer">
                          Google Maps
                        </a>
                      ) : null}
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
                      `${rocky.name} is tagged ${summarizeThemes(rocky).toLowerCase()} and feels dangerously well cast.`}
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
