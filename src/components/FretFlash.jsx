import { useEffect, useState } from 'react'
import Fretboard from './Fretboard.jsx'
import { SHARP, fretsFor, midiAt, noteLabel } from '../theory.js'
import { pluck } from '../audio.js'
import { useWakeLock } from '../mobile.js'

export const FLASH_SECONDS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
export const FLASH_COUNTS = [3, 5, 8, 12] // notes per run; 12 = every note once

const ordinal = (n) => {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`
}

// strings are 0 = low E ... 5 = high e; guitarists number them from the high e
export const whereText = (s, f) => `${ordinal(6 - s)} string, ${f === 0 ? 'open' : `${ordinal(f)} fret`}`

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Each note shown on every chosen string from the 6th to the 1st
// at its lowest fret in range. Strings where the note isn't in range are skipped.
// `notes` is the player's picks, in the order picked; empty means random ones
function buildSteps(notes, count, strings, maxFret) {
  const order = [...strings].sort((a, b) => a - b)
  if (!notes.length) notes = shuffle(SHARP.map((_, pc) => pc)).slice(0, count)
  const steps = []
  notes.forEach((pc, n) => {
    for (const s of order) {
      const f = fretsFor(s, pc, maxFret)[0]
      if (f !== undefined) steps.push({ pc, s, f, n })
    }
  })
  return steps
}

/**
 * Hands-free flashcards: a note is shown on each string in turn, every `seconds`,
 * with a sentence saying where it is. Then the next note. Nothing to tap.
 */
export default function FretFlash({ progress, updateSettings }) {
  const { settings } = progress
  const seconds = settings.flashSeconds
  // older saved settings may hold a count from the previous version
  const count = FLASH_COUNTS.includes(settings.flashCount) ? settings.flashCount : 5
  const picked = settings.flashNotes ?? []
  const total = picked.length || count

  function togglePick(pc) {
    updateSettings({ flashNotes: picked.includes(pc) ? picked.filter((x) => x !== pc) : [...picked, pc] })
  }

  const [phase, setPhase] = useState('setup') // setup | run | done
  const [steps, setSteps] = useState([])
  const [idx, setIdx] = useState(0)

  useWakeLock(phase === 'run')

  const step = steps[idx]

  // play each position as it appears
  useEffect(() => {
    if (phase === 'run' && step && settings.sound) pluck(midiAt(step.s, step.f))
  }, [phase, step]) // eslint-disable-line react-hooks/exhaustive-deps

  function start() {
    window.scrollTo(0, 0)
    setSteps(buildSteps(picked, count, settings.strings, settings.maxFret))
    setIdx(0)
    setPhase('run')
  }

  // one timeout per position: show it for `seconds`, then move on or finish
  useEffect(() => {
    if (phase !== 'run') return
    const id = setTimeout(() => {
      if (idx + 1 >= steps.length) setPhase('done')
      else setIdx(idx + 1)
    }, seconds * 1000)
    return () => clearTimeout(id)
  }, [phase, idx, steps, seconds])

  const running = phase === 'run'

  return (
    <div className="flash">
      <div className="flash-head">
        {running && step ? (
          <p className="flash-where">
            <span className="flash-note">{noteLabel(step.pc)}</span>{' '}
            {whereText(step.s, step.f)}
          </p>
        ) : (
          <p className="muted flash-intro">
            {phase === 'done'
              ? `Done: ${total} note${total === 1 ? '' : 's'}.`
              : 'One note at a time, shown on each string from the 6th to the 1st. When the countdown ends it moves to the next string. Play each one on your guitar.'}
          </p>
        )}
        {running && (
          <>
            <div className="progress-bar flash-count">
              {/* key restarts the fill animation for every position */}
              <span key={idx} style={{ animationDuration: `${seconds}s` }} />
            </div>
            <p className="muted small flash-meta">Note {step.n + 1} of {total} · {seconds}s each</p>
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
          <h4>Notes</h4>
          <div className="chips">
            <button className={`chip${picked.length ? '' : ' on'}`} onClick={() => updateSettings({ flashNotes: [] })}>
              Random
            </button>
            {SHARP.map((name, pc) => (
              <button key={pc} className={`chip${picked.includes(pc) ? ' on' : ''}`} onClick={() => togglePick(pc)}>
                {name}
              </button>
            ))}
          </div>
          {picked.length > 0 ? (
            <p className="muted small">Runs {picked.map((pc) => SHARP[pc]).join(', ')} in the order you picked them.</p>
          ) : (
            <>
              <h4>How many random notes</h4>
              <div className="chips">
                {FLASH_COUNTS.map((n) => (
                  <button key={n} className={`chip${count === n ? ' on' : ''}`} onClick={() => updateSettings({ flashCount: n })}>
                    {n}
                  </button>
                ))}
              </div>
            </>
          )}
          <button className="btn primary wide" onClick={start}>{phase === 'done' ? 'Go again' : 'Start'}</button>
        </div>
      )}

      <div className="flash-board">
        <Fretboard
          frets={settings.maxFret}
          marks={running && step ? [
            // where this note already showed up on the strings before, so the pattern builds up
            ...steps.slice(0, idx).filter((p) => p.n === step.n).map((p) => ({ s: p.s, f: p.f, kind: 'note', label: SHARP[p.pc] })),
            { s: step.s, f: step.f, kind: 'from', label: SHARP[step.pc] },
          ] : []}
          highlightString={running && step ? step.s : null}
        />
      </div>

      {running && <button className="btn wide" onClick={() => setPhase('setup')}>Stop</button>}
    </div>
  )
}
