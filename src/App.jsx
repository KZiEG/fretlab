import { useCallback, useEffect, useState } from 'react'
import Home from './pages/Home.jsx'
import Trainer from './pages/Trainer.jsx'
import Chords from './pages/Chords.jsx'
import Scales from './pages/Scales.jsx'
import Internalize from './pages/Internalize.jsx'
import Rig from './pages/Rig.jsx'
import Practice, { emptyPractice } from './pages/Practice.jsx'
import { dayKey } from './practice.js'
import { fmtClock, onTimerDone, remainingMs, usePracticeTimer } from './practiceTimer.js'
import { useWakeLock } from './mobile.js'
import { MetronomeBadge } from './components/Metronome.jsx'
import { applyAnswer, applyDrill, loadState, saveState } from './progress.js'

const ROUTES = [
  ['home', 'Home'],
  ['practice', 'Practice'],
  ['trainer', 'Trainer'],
  ['chords', 'Chords'],
  ['scales', 'Scales'],
  ['fretboard', 'Fretboard'],
  ['rig', 'Rig'],
]

// 24x24 stroke icons for the tab bar
const ICONS = {
  practice: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 3h6v3H9zM8.5 11l2 2 4-4M8.5 17h7" />
    </>
  ),
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
  rig: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="9" cy="8" r="1.8" />
      <circle cx="15" cy="8" r="1.8" />
      <rect x="9" y="14" width="6" height="4" rx="1" />
    </>
  ),
}

const readRoute = () => {
  const r = window.location.hash.replace(/^#\/?/, '')
  return ROUTES.some(([id]) => id === r) ? r : 'home'
}

/** Top-bar badge while a practice timer runs: time left; tap to go to Practice. */
function TimerBadge() {
  const t = usePracticeTimer()
  useWakeLock(!!t.blockId)
  if (!t.blockId) return null
  return (
    <a className="met-badge timer-badge" href="#/practice" aria-label="Practice timer">
      ⏱ {fmtClock(remainingMs(t))}
    </a>
  )
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
  const setPatches = useCallback(
    (fn) => setProgress((p) => ({ ...p, patches: typeof fn === 'function' ? fn(p.patches ?? []) : fn })),
    [],
  )
  const updatePractice = useCallback(
    (fn) => setProgress((p) => ({ ...p, practice: fn(p.practice ?? emptyPractice()) })),
    [],
  )
  // a routine block's timer ran out: tick that block off for today
  useEffect(
    () =>
      onTimerDone((blockId) =>
        updatePractice((pr) => {
          const today = dayKey()
          const day = pr.days[today] ?? { blocks: {}, note: '', projects: [] }
          return { ...pr, days: { ...pr.days, [today]: { ...day, blocks: { ...day.blocks, [blockId]: true } } } }
        }),
      ),
    [updatePractice],
  )
  const updateSettings = useCallback(
    (patch) => setProgress((p) => ({ ...p, settings: { ...p.settings, ...patch } })),
    [],
  )

  return (
    <div className="app">
      <header className="topbar">
        <span className="logo">FretLab</span>
        <span className="topbar-badges">
          <TimerBadge />
          <MetronomeBadge />
        </span>
      </header>

      <main>
        {route === 'home' && <Home progress={progress} setProgress={setProgress} />}
        {route === 'practice' && <Practice practice={progress.practice} update={updatePractice} />}
        {route === 'trainer' && <Trainer progress={progress} answer={answer} updateSettings={updateSettings} />}
        {route === 'chords' && <Chords />}
        {route === 'scales' && <Scales />}
        {route === 'fretboard' && <Internalize progress={progress} answer={answer} recordDrill={recordDrill} />}
        {route === 'rig' && (
          <Rig progress={progress} updateSettings={updateSettings} setPatches={setPatches} />
        )}
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
