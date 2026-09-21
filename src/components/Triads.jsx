import { useState } from 'react'
import triadData from '../data/triads.json'
import ChordDiagram from './ChordDiagram.jsx'
import { midiAt, spell } from '../theory.js'
import { strum, unlockAudio } from '../audio.js'

const INVERSIONS = [
  { name: 'Root position', bass: 'root', tone: 0 },
  { name: '1st inversion', bass: '3rd', tone: 1 },
  { name: '2nd inversion', bass: '5th', tone: 2 },
]
const SET_LABELS = triadData.stringSets.map((set) => set.map((s) => 6 - s).join('-'))

/** Three-note chords on three neighbouring strings, in all three inversions. */
export default function Triads({ root }) {
  const [qid, setQid] = useState('maj')
  const [setIdx, setSetIdx] = useState(1)

  const quality = triadData.qualities.find((q) => q.id === qid)
  const sset = triadData.stringSets[setIdx]
  const shapes = triadData.voicings[root][qid][setIdx]
  const tones = quality.intervals.map((i) => (root + i) % 12)

  function play(triple) {
    unlockAudio()
    strum(triple.map((f, i) => midiAt(sset[i], f)))
  }

  const toFrets = (triple) => {
    const frets = [null, null, null, null, null, null]
    triple.forEach((f, i) => { frets[sset[i]] = f })
    return frets
  }

  return (
    <>
      <p className="muted small">
        A triad is a three-note chord: the root, the 3rd and the 5th. Played on three neighbouring strings, the same three
        notes can be reordered so the root, the 3rd or the 5th is lowest. Those are the inversions.
      </p>

      <h4>Triad type</h4>
      <div className="chips">
        {triadData.qualities.map((q) => (
          <button key={q.id} className={`chip${qid === q.id ? ' on' : ''}`} onClick={() => setQid(q.id)}>
            {q.name.replace(' triad', '')}
          </button>
        ))}
      </div>

      <h4>Strings</h4>
      <div className="chips">
        {SET_LABELS.map((label, i) => (
          <button key={i} className={`chip${setIdx === i ? ' on' : ''}`} onClick={() => setSetIdx(i)}>
            {label}
          </button>
        ))}
      </div>

      <div className="chord-head">
        <div>
          <div className="chord-title">{spell(root, root)} {quality.name.replace(' triad', '').toLowerCase()}</div>
          <div className="muted">
            {tones.map((pc) => spell(pc, root)).join(' · ')} &nbsp;({quality.degrees.join(' ')})
          </div>
        </div>
      </div>
      <p className="desc">{quality.desc}</p>

      {INVERSIONS.map((inv, i) => (
        <div key={inv.name}>
          <h4>{inv.name} · {spell(tones[inv.tone], root)} ({inv.bass}) in the bass</h4>
          <div className="voicing-grid">
            {shapes[i].map((triple, k) => (
              <div className="voicing" key={k}>
                <ChordDiagram frets={toFrets(triple)} root={root} onClick={() => play(triple)} />
                <div className="voicing-cap">Tap to hear</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <p className="muted small">
        Red dots are the root. The shapes slide up and down the neck as the root changes, and the same shape works on
        every string set that has the same spacing.
      </p>
    </>
  )
}
