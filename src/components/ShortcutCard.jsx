import { useState } from 'react'
import Fretboard from './Fretboard.jsx'
import { MAX_FRET, SHARP, STRING_TITLES, midiAt, noteLabel, pcAt } from '../theory.js'
import { playSequence, unlockAudio } from '../audio.js'

const stringNum = (s) => 6 - s

/** One octave shortcut: the rule, why it works, and a fretboard you can step through. */
export default function ShortcutCard({ shortcut: sc }) {
  const [pairIdx, setPairIdx] = useState(0)
  const [fret, setFret] = useState(sc.fretDelta < 0 ? 5 : 3)

  const [from, to] = sc.pairs[pairIdx]
  // keep both the starting fret and the landing fret on the board
  const minFret = Math.max(0, -sc.fretDelta)
  const maxFret = Math.min(MAX_FRET, MAX_FRET - sc.fretDelta)
  const f = Math.min(maxFret, Math.max(minFret, fret))
  const f2 = f + sc.fretDelta
  const pc = pcAt(from, f)

  const marks = [
    { s: from, f, kind: 'from', label: SHARP[pc] },
    { s: to, f: f2, kind: 'correct', label: SHARP[pc] },
  ]

  function hear() {
    unlockAudio()
    playSequence([midiAt(from, f), midiAt(to, f2)], 0.8)
  }

  const octaves = sc.octaves === 1 ? 'one octave higher' : 'two octaves higher'

  return (
    <section className="shortcut">
      <div className="shortcut-num">Shortcut {sc.id}</div>
      <h3>{sc.title}</h3>
      <div className="muted small">Applies to: {sc.applies}</div>
      <p>{sc.rule}</p>
      <p className="why"><strong>Why it works:</strong> {sc.why}</p>

      {sc.pairs.length > 1 && (
        <div className="chips">
          {sc.pairs.map(([a, b], i) => (
            <button key={i} className={`chip${pairIdx === i ? ' on' : ''}`} onClick={() => setPairIdx(i)}>
              String {stringNum(a)} → {stringNum(b)}
            </button>
          ))}
        </div>
      )}

      <Fretboard frets={MAX_FRET} marks={marks} links={[{ from: { s: from, f }, to: { s: to, f: f2 } }]} />

      <div className="stepper">
        <button className="btn" onClick={() => setFret(Math.max(minFret, f - 1))} disabled={f <= minFret} aria-label="Start one fret lower">−</button>
        <div className="stepper-label">
          <strong>{noteLabel(pc)}</strong> on the {STRING_TITLES[from]} string, fret {f}
        </div>
        <button className="btn" onClick={() => setFret(Math.min(maxFret, f + 1))} disabled={f >= maxFret} aria-label="Start one fret higher">+</button>
      </div>

      <p className="result-line">
        → <strong>{noteLabel(pc)}</strong> on the {STRING_TITLES[to]} string, fret {f2} ({octaves})
      </p>
      <button className="btn wide" onClick={hear}>Hear both notes</button>
    </section>
  )
}
