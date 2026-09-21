import { useMemo, useState } from 'react'
import scaleData from '../data/scales.json'
import Fretboard from '../components/Fretboard.jsx'
import { MAX_FRET, OPEN_MIDI, noteLabel, pcAt, spell } from '../theory.js'
import { playSequence, unlockAudio } from '../audio.js'

export default function Scales() {
  const [root, setRoot] = useState(9)
  const [scaleId, setScaleId] = useState('minpent')
  const [pos, setPos] = useState('all') // 'all' or window index
  const [labels, setLabels] = useState('note') // 'note' | 'degree'

  const scale = scaleData.scales.find((s) => s.id === scaleId)
  const windows = scaleData.windows[root][scaleId]
  const pcs = scale.intervals.map((i) => (root + i) % 12)
  const activeWindow = pos === 'all' ? null : windows[pos] ?? null

  const marks = useMemo(() => {
    const out = []
    for (let s = 0; s < 6; s++) {
      for (let f = 0; f <= MAX_FRET; f++) {
        const idx = pcs.indexOf(pcAt(s, f))
        if (idx < 0) continue
        const inside = !activeWindow || (f >= activeWindow[0] && f <= activeWindow[1])
        out.push({
          s, f,
          kind: !inside ? 'ghost' : idx === 0 ? 'root' : 'note',
          label: !inside ? null : labels === 'note' ? spell(pcs[idx], root) : scale.degrees[idx],
        })
      }
    }
    return out
  }, [root, scaleId, pos, labels]) // eslint-disable-line react-hooks/exhaustive-deps

  function play() {
    unlockAudio()
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
          <div className="chord-title">{spell(root, root)} {scale.name}</div>
          <div className="muted">
            {pcs.map((pc) => spell(pc, root)).join(' · ')} &nbsp;({scale.degrees.join(' ')})
          </div>
        </div>
        <button className="btn" onClick={play}>Play</button>
      </div>

      <h4>Position</h4>
      <div className="chips scroll">
        <button className={`chip${pos === 'all' ? ' on' : ''}`} onClick={() => setPos('all')}>Whole neck</button>
        {windows.map((w, i) => (
          <button key={i} className={`chip${pos === i ? ' on' : ''}`} onClick={() => setPos(i)}>
            Frets {w[0]}–{w[1]}
          </button>
        ))}
      </div>

      <div className="segmented small">
        <button className={labels === 'note' ? 'on' : ''} onClick={() => setLabels('note')}>Note names</button>
        <button className={labels === 'degree' ? 'on' : ''} onClick={() => setLabels('degree')}>Scale degrees</button>
      </div>

      <Fretboard frets={MAX_FRET} marks={marks} />

      <p className="muted small">
        Red dots are the root. Position boxes group the scale into small, playable chunks — learn one box at a time,
        then link neighbouring boxes together.
      </p>
    </div>
  )
}
