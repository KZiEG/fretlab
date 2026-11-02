import { useMemo, useState } from 'react'
import scaleData from '../data/scales.json'
import Fretboard from '../components/Fretboard.jsx'
import { MAX_FRET, OPEN_MIDI, midiAt, noteLabel, pcAt, spellDegrees } from '../theory.js'
import { boxPositions, threeNpsPositions } from '../scalePositions.js'
import { playSequence, unlockAudio } from '../audio.js'

// Size of each step between scale notes, in semitones (= frets on one string)
const STEP = {
  1: { label: 'H', name: 'half step', frets: '1 fret' },
  2: { label: 'W', name: 'whole step', frets: '2 frets' },
  3: { label: 'W+H', name: 'whole + half step', frets: '3 frets' },
}

/** The scale's notes with the whole/half step between each one, root to octave. */
function ScalePattern({ notes, intervals }) {
  const all = [...intervals, 12]
  const steps = all.slice(1).map((v, i) => v - all[i])
  return (
    <section className="pattern" aria-label="Scale pattern">
      <h4>Scale pattern</h4>
      <div className="pattern-formula">
        {steps.map((st, i) => (
          <span key={i} className={`step step-${st}`}>{STEP[st]?.label ?? st}</span>
        ))}
      </div>
      <div className="pattern-grid" style={{ gridTemplateColumns: `repeat(${notes.length * 2}, 1fr)` }}>
        {notes.map((n, i) => (
          <span key={`n${i}`} className={`pattern-note${i === 0 || i === notes.length - 1 ? ' root' : ''}`} style={{ gridColumn: `${2 * i + 1} / span 2`, gridRow: 1 }}>
            {n}
          </span>
        ))}
        {steps.map((st, i) => (
          <span key={`s${i}`} className={`pattern-step step-${st}`} style={{ gridColumn: `${2 * i + 2} / span 2`, gridRow: 2 }}>
            {STEP[st]?.label ?? st}
          </span>
        ))}
      </div>
      <p className="muted small">
        {[...new Set(steps)].sort().map((st) => `${STEP[st].label} = ${STEP[st].name} (${STEP[st].frets})`).join(' · ')}.
        Play the pattern up one string from the root to hear the scale.
      </p>
    </section>
  )
}

export default function Scales() {
  const [root, setRoot] = useState(9)
  const [scaleId, setScaleId] = useState('minpent')
  const [pos, setPos] = useState('all') // 'all' or a position number
  const [system, setSystem] = useState('box') // 'box' | 'nps' (3 notes per string, 7-note scales)
  const [labels, setLabels] = useState('note') // 'note' | 'degree'

  const scale = scaleData.scales.find((s) => s.id === scaleId)
  const pcs = scale.intervals.map((i) => (root + i) % 12)
  const names = spellDegrees(root, scale.intervals, scale.degrees) // names[i] spells pcs[i]
  const sevenNote = scale.intervals.length === 7
  const useNps = sevenNote && system === 'nps'
  const positions = useMemo(
    () => (useNps ? threeNpsPositions(root, scale) : boxPositions(root, scale)),
    [root, scaleId, useNps], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const position = pos === 'all' ? null : positions.find((p) => p.n === pos) ?? null
  // some positions climb past the 15th fret: draw the neck long enough for them
  const frets = Math.max(MAX_FRET, position?.to ?? 0)

  const marks = useMemo(() => {
    const inPos = position && new Set(position.notes.map((n) => `${n.s}-${n.f}`))
    const out = []
    for (let s = 0; s < 6; s++) {
      for (let f = 0; f <= frets; f++) {
        const idx = pcs.indexOf(pcAt(s, f))
        if (idx < 0) continue
        const inside = !inPos || inPos.has(`${s}-${f}`)
        out.push({
          s, f,
          kind: !inside ? 'ghost' : idx === 0 ? 'root' : 'note',
          label: !inside ? null : labels === 'note' ? names[idx] : scale.degrees[idx],
        })
      }
    }
    return out
  }, [root, scaleId, position, frets, labels]) // eslint-disable-line react-hooks/exhaustive-deps

  function play() {
    unlockAudio()
    if (position) {
      const up = position.notes.map((n) => midiAt(n.s, n.f)).sort((x, y) => x - y)
      playSequence([...up, ...up.slice(0, -1).reverse()], 0.24)
      return
    }
    const start = OPEN_MIDI[0] + ((root - 4 + 12) % 12)
    const up = [...scale.intervals, 12].map((i) => start + i)
    playSequence([...up, ...up.slice(0, -1).reverse()], 0.26)
  }

  return (
    <div className="page">
      <h2>Scales</h2>

      <h4>Key</h4>
      <div className="chips wrap">
        {Array.from({ length: 12 }, (_, pc) => (
          <button key={pc} className={`chip${root === pc ? ' on' : ''}`} onClick={() => { setRoot(pc); setPos('all') }}>
            {noteLabel(pc)}
          </button>
        ))}
      </div>

      <h4>Scale</h4>
      <div className="chips scroll">
        {scaleData.scales.map((s) => (
          <button key={s.id} className={`chip${scaleId === s.id ? ' on' : ''}`} onClick={() => { setScaleId(s.id); setPos('all') }}>
            {s.name}
          </button>
        ))}
      </div>

      <div className="chord-head">
        <div>
          <div className="chord-title">{names[0]} {scale.name}</div>
          <div className="muted">
            {names.join(' · ')} &nbsp;({scale.degrees.join(' ')})
          </div>
        </div>
        <button className="btn" onClick={play}>Play</button>
      </div>

      <ScalePattern notes={[...names, names[0]]} intervals={scale.intervals} />

      <h4>Position</h4>
      {sevenNote && (
        <div className="segmented small">
          <button className={system === 'box' ? 'on' : ''} onClick={() => { setSystem('box'); setPos('all') }}>Box positions</button>
          <button className={system === 'nps' ? 'on' : ''} onClick={() => { setSystem('nps'); setPos('all') }}>3 notes per string</button>
        </div>
      )}
      <div className="chips scroll">
        <button className={`chip${pos === 'all' ? ' on' : ''}`} onClick={() => setPos('all')}>Whole neck</button>
        {positions.map((p) => (
          <button key={p.n} className={`chip${pos === p.n ? ' on' : ''}`} onClick={() => setPos(p.n)}>
            Position {p.n} <span className="chip-sub">fr {p.from}–{p.to}</span>
          </button>
        ))}
      </div>

      <div className="segmented small">
        <button className={labels === 'note' ? 'on' : ''} onClick={() => setLabels('note')}>Note names</button>
        <button className={labels === 'degree' ? 'on' : ''} onClick={() => setLabels('degree')}>Scale degrees</button>
      </div>

      <Fretboard frets={frets} marks={marks} />

      <p className="muted small">
        {useNps
          ? 'Each 3-notes-per-string position starts on the next note of the scale on the low E string and keeps exactly three notes on every string: very even for speed and legato, with wider stretches.'
          : 'Each position starts on the next scale note up the low E string and climbs string by string, two notes per string for pentatonic scales and two or three for seven-note scales. Positions overlap: the top of one is the bottom of the next, which is how you link them up the neck.'}{' '}
        Red dots are the root. With a position selected, Play runs up and down that shape.
      </p>
    </div>
  )
}
