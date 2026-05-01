import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { safariScenes, themeFlavors, themeLabels, vibeLabels } from './content'
import {
  buildSafariRun,
  getRelatedRockys,
  labelTheme,
  matchTruePup,
  summarizeThemes,
  summarizeVibes,
} from './lib/rocky'
import type { RockyData, SafariAnswer } from './types'

function App() {
  const [rockys, setRockys] = useState<RockyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [answers, setAnswers] = useState<SafariAnswer[]>([])
  const [seed, setSeed] = useState(0)
  const [search, setSearch] = useState('')
  const [activeTheme, setActiveTheme] = useState('all')

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
  const revealedFlavor = revealedRocky
    ? themeFlavors[revealedRocky.primaryTheme] ?? themeFlavors.classic
    : ''

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">True Pup Safari</p>
          <h1 className="brand">Choose badly, feel deeply, meet your Rocky.</h1>
        </div>
        <nav className="topbar-links" aria-label="Primary">
          <a href="#safari">Safari</a>
          <a href="#archive">Roster</a>
        </nav>
      </header>

      <section className="hero-panel">
        <div className="hero-copy">
          <p className="kicker">Part field guide, part personality quiz, part public-art visual novel.</p>
          <p className="hero-lede">
            You do not need to travel anywhere. Each run moves through dates, run-ins, and suspiciously
            well-timed coincidences, then quietly decides which sculpture is your <strong>true pup</strong>.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#safari">
              Start the safari
            </a>
            <a className="button button-secondary" href="#archive">
              Browse the full roster
            </a>
          </div>
        </div>

        <aside className="hero-card">
          <p className="mini-label">How it works</p>
          <ol className="steps-list">
            <li>Move through multiple dramatic scenarios instead of a single quiz screen.</li>
            <li>Choose the Rocky that most wrecks your composure in each beat.</li>
            <li>Let the route’s hidden luck and affinity system decide your final match.</li>
          </ol>
        </aside>
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

      <section className="section-panel" id="safari">
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
                Scene {currentSceneIndex + 1} of {safariScenes.length}
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
              {answers.map(({ rocky, option, sceneTitle }) => (
                <article key={`${rocky.slug}-${option.id}`} className="glimpse-card">
                  <img src={rocky.imagePath} alt={rocky.name} loading="lazy" />
                  <div>
                    <p className="mini-label">{sceneTitle}</p>
                    <h4>{rocky.name}</h4>
                    <p>{option.blurb}</p>
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
              <p>{revealedFlavor}</p>
              <p>
                <strong>Temperament:</strong> {summarizeVibes(revealedRocky)}.
              </p>
              <p>
                <strong>Why it fits:</strong> Your route kept rewarding {revealedRocky.topVibes[0]} energy and{' '}
                {revealedRocky.topVibes[1] ?? revealedRocky.topVibes[0]} restraint, while the hidden luck system
                quietly kept nudging you toward {revealedTheme.toLowerCase()} trouble.
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
                    <p>{themeFlavors[rocky.primaryTheme] ?? themeFlavors.classic}</p>
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

      <section className="section-panel" id="archive">
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
    </main>
  )
}

export default App
