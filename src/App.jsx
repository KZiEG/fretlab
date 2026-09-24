import { useCallback, useEffect, useState } from 'react'
import Home from './pages/Home.jsx'
import Trainer from './pages/Trainer.jsx'
import Chords from './pages/Chords.jsx'
import Scales from './pages/Scales.jsx'
import Internalize from './pages/Internalize.jsx'
import { applyAnswer, applyDrill, loadState, saveState } from './progress.js'

const ROUTES = [
  ['home', 'Home'],
  ['trainer', 'Trainer'],
  ['chords', 'Chords'],
  ['scales', 'Scales'],
  ['fretboard', 'Fretboard'],
]

// 24x24 stroke icons for the tab bar
const ICONS = {
  home: <path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" />,
  trainer: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  chords: (
    <>
      <path d="M6 4h12M6 4v16M10 4v16M14 4v16M18 4v16M6 9h12M6 14h12" />
      <circle cx="10" cy="11.5" r="1.6" fill="currentColor" />
      <circle cx="14" cy="6.5" r="1.6" fill="currentColor" />
    </>
  ),
  scales: <path d="M4 19h4v-4h4v-4h4V7h4" />,
  fretboard: (
    <>
      <path d="M3 7h18M3 12h18M3 17h18M7 5v14M12 5v14M17 5v14" />
    </>
  ),
}

const readRoute = () => {
  const r = window.location.hash.replace(/^#\/?/, '')
  return ROUTES.some(([id]) => id === r) ? r : 'home'
}

export default function App() {
  const [route, setRoute] = useState(readRoute)
  const [progress, setProgress] = useState(loadState)

  useEffect(() => {
    const on = () => {
      setRoute(readRoute())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  useEffect(() => saveState(progress), [progress])

  const answer = useCallback(
    (s, f, correct, ms) => setProgress((p) => applyAnswer(p, s, f, correct, ms)),
    [],
  )
  const recordDrill = useCallback(
    (key, ms, mistakes) => setProgress((p) => applyDrill(p, key, ms, mistakes)),
    [],
  )
  const updateSettings = useCallback(
    (patch) => setProgress((p) => ({ ...p, settings: { ...p.settings, ...patch } })),
    [],
  )

  return (
    <div className="app">
      <header className="topbar">
        <span className="logo">FretLab</span>
      </header>

      <main>
        {route === 'home' && <Home progress={progress} setProgress={setProgress} />}
        {route === 'trainer' && <Trainer progress={progress} answer={answer} updateSettings={updateSettings} />}
        {route === 'chords' && <Chords />}
        {route === 'scales' && <Scales />}
        {route === 'fretboard' && <Internalize progress={progress} answer={answer} recordDrill={recordDrill} />}
      </main>

      <nav className="tabbar">
        {ROUTES.map(([id, label]) => (
          <a key={id} href={`#/${id}`} className={route === id ? 'on' : ''} aria-current={route === id ? 'page' : undefined}>
            <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[id]}</svg>
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}
