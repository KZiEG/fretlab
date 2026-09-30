import { useEffect, useRef, useState } from 'react'
import Fretboard from './Fretboard.jsx'
import { midiAt } from '../theory.js'
import { pickCard } from '../progress.js'
import { pluck } from '../audio.js'
import { useWakeLock } from '../mobile.js'

export const FLASH_SECONDS = [0.5, 1, 1.5, 2, 2.5]
export const FLASH_COUNTS = [10, 20, 30, 50]

const ordinal = (n) => {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`
}

// strings are 0 = low E ... 5 = high e; guitarists number them from the high e
export const whereText = (s, f) => `${ordinal(6 - s)} string, ${f === 0 ? 'open' : `${ordinal(f)} fret`}`

/**
 * Hands-free flashcards: every `seconds` a new fretboard position lights up with a
 * sentence saying where it is, `count` times in a row. Nothing to tap.
 */
export default function FretFlash({ progress, updateSettings }) {
  const { settings } = progress
  const seconds = settings.flashSeconds
  const count = settings.flashCount

  const [phase, setPhase] = useState('setup') // setup | run | done
  const [card, setCard] = useState(null)
  const [shown, setShown] = useState(0)

  const lastKey = useRef(null)
  const progressRef = useRef(progress)
  progressRef.current = progress

  useWakeLock(phase === 'run')

  function nextCard() {
    const { strings, maxFret } = progressRef.current.settings
    const c = pickCard(progressRef.current, strings, maxFret, lastKey.current)
    lastKey.current = c ? `${c.s}-${c.f}` : null
    setCard(c)
    if (c && progressRef.current.settings.sound) pluck(midiAt(c.s, c.f))
  }

  function start() {
    window.scrollTo(0, 0)
    lastKey.current = null
    setShown(1)
    nextCard()
    setPhase('run')
  }

  // one timeout per card: show it for `seconds`, then move on or finish
  useEffect(() => {
    if (phase !== 'run') return
    const id = setTimeout(() => {
      if (shown >= count) {
        setPhase('done')
        return
      }
      setShown((n) => n + 1)
      nextCard()
    }, seconds * 1000)
    return () => clearTimeout(id)
  }, [phase, shown, seconds, count]) // eslint-disable-line react-hooks/exhaustive-deps

  const running = phase === 'run'

  return (
    <div className="flash">
      <div className="flash-head">
        {running && card ? (
          <p className="flash-where">{whereText(card.s, card.f)}</p>
        ) : (
          <p className="muted flash-intro">
            {phase === 'done'
              ? `Done: ${count} notes.`
              : 'A point lights up on the neck with where it is, then moves to a new note when the countdown ends. Find each one on your guitar.'}
          </p>
        )}
        {running && (
          <>
            <div className="progress-bar flash-count">
              {/* key restarts the fill animation for every card */}
              <span key={shown} style={{ animationDuration: `${seconds}s` }} />
            </div>
            <p className="muted small flash-meta">Note {shown} of {count} · {seconds}s each</p>
          </>
        )}
      </div>

      {!running && (
        <div className="flash-setup">
          <h4>Countdown</h4>
          <div className="chips">
            {FLASH_SECONDS.map((s) => (
              <button key={s} className={`chip${seconds === s ? ' on' : ''}`} onClick={() => updateSettings({ flashSeconds: s })}>
                {s}s
              </button>
            ))}
          </div>
          <h4>How many notes</h4>
          <div className="chips">
            {FLASH_COUNTS.map((n) => (
              <button key={n} className={`chip${count === n ? ' on' : ''}`} onClick={() => updateSettings({ flashCount: n })}>
                {n}
              </button>
            ))}
          </div>
          <button className="btn primary wide" onClick={start}>{phase === 'done' ? 'Go again' : 'Start'}</button>
        </div>
      )}

      <div className="flash-board">
        <Fretboard
          frets={settings.maxFret}
          marks={running && card ? [{ s: card.s, f: card.f, kind: 'from' }] : []}
          highlightString={running && card ? card.s : null}
        />
      </div>

      {running && <button className="btn wide" onClick={() => setPhase('setup')}>Stop</button>}
    </div>
  )
}
