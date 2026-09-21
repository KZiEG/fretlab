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
          <a key={id} href={`#/${id}`} className={route === id ? 'on' : ''}>
            {label}
          </a>
        ))}
      </nav>
    </div>
  )
}
