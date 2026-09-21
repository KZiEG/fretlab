import { useMemo, useState } from 'react'
import chordData from '../data/chords.json'
import ChordDiagram from '../components/ChordDiagram.jsx'
import Fretboard from '../components/Fretboard.jsx'
import Triads from '../components/Triads.jsx'
import { MAX_FRET, chordName, midiAt, noteLabel, pcAt, spell } from '../theory.js'
import { strum, unlockAudio } from '../audio.js'

function ChordShapes({ root }) {
  const [qid, setQid] = useState('maj')
  const [neck, setNeck] = useState(false)

  const quality = chordData.qualities.find((q) => q.id === qid)
  const voicings = chordData.voicings[root][qid]
  const tones = quality.intervals.map((i) => (root + i) % 12)

  function play(frets) {
    unlockAudio()
    strum(frets.flatMap((f, s) => (f === null ? [] : [midiAt(s, f)])))
  }

  const marks = useMemo(() => {
    if (!neck) return []
    const out = []
    for (let s = 0; s < 6; s++) {
      for (let f = 0; f <= MAX_FRET; f++) {
        const idx = tones.indexOf(pcAt(s, f))
        if (idx >= 0) {
          out.push({ s, f, kind: idx === 0 ? 'root' : 'note', label: quality.degrees[idx] })
        }
      }
    }
    return out
  }, [neck, root, qid]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <h4>Type</h4>
      <div className="chips scroll">
        {chordData.qualities.map((q) => (
          <button key={q.id} className={`chip${qid === q.id ? ' on' : ''}`} onClick={() => setQid(q.id)}>
            {q.name}
          </button>
        ))}
      </div>

      <div className="chord-head">
        <div>
          <div className="chord-title">{chordName(root, quality)}</div>
          <div className="muted">
            {tones.map((pc) => spell(pc, root)).join(' · ')} &nbsp;({quality.degrees.join(' ')})
          </div>
        </div>
        <button className="btn" onClick={() => play(voicings[0].frets)}>Play</button>
      </div>
      <p className="desc">{quality.desc}</p>

      <div className="voicing-grid">
        {voicings.map((v, i) => (
          <div className="voicing" key={i}>
            <ChordDiagram frets={v.frets} root={root} onClick={() => play(v.frets)} />
            <div className="voicing-cap">Tap to hear</div>
          </div>
        ))}
      </div>
      <p className="muted small">
        Shapes are listed from the nut up the neck. Red dots are the root note. The same shapes slide up the neck as the
        chord changes.
      </p>

      <button className="btn wide" onClick={() => setNeck((n) => !n)}>
        {neck ? 'Hide' : 'Show'} every {chordName(root, quality)} note on the neck
      </button>
      {neck && <Fretboard frets={MAX_FRET} marks={marks} />}
    </>
  )
}

export default function Chords() {
  const [root, setRoot] = useState(0)
  const [mode, setMode] = useState('chords') // 'chords' | 'triads'

  return (
    <div className="page">
      <h2>Chords</h2>

      <div className="segmented">
        <button className={mode === 'chords' ? 'on' : ''} onClick={() => setMode('chords')}>Chord shapes</button>
        <button className={mode === 'triads' ? 'on' : ''} onClick={() => setMode('triads')}>Triads</button>
      </div>

      <h4>Root</h4>
      <div className="chips wrap">
        {Array.from({ length: 12 }, (_, pc) => (
          <button key={pc} className={`chip${root === pc ? ' on' : ''}`} onClick={() => setRoot(pc)}>
            {noteLabel(pc)}
          </button>
        ))}
      </div>

      {mode === 'chords' ? <ChordShapes root={root} /> : <Triads root={root} />}
    </div>
  )
}
