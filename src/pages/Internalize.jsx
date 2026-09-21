import { useState } from 'react'
import ShortcutCard from '../components/ShortcutCard.jsx'
import Drills from '../components/Drills.jsx'
import { SHORTCUTS } from '../theory.js'

export default function Internalize({ progress, answer, recordDrill }) {
  const [tab, setTab] = useState('shortcuts')

  return (
    <div className="page">
      <h2>Fretboard</h2>
      <div className="segmented">
        <button className={tab === 'shortcuts' ? 'on' : ''} onClick={() => setTab('shortcuts')}>Octave shortcuts</button>
        <button className={tab === 'drills' ? 'on' : ''} onClick={() => setTab('drills')}>Timed drills</button>
      </div>

      {tab === 'shortcuts' ? (
        <>
          <p className="muted">
            Every note appears in several places on the neck. These four patterns show where a note repeats an octave
            higher, so once you know a note on a low string you can find it on a higher one without counting.
          </p>
          <p className="muted small">
            Strings are numbered from the thin one: 1st = high e, 6th = low E. “Toward the body” means a higher fret
            number, “toward the nut” a lower one.
          </p>
          {SHORTCUTS.map((sc) => (
            <ShortcutCard key={sc.id} shortcut={sc} />
          ))}
        </>
      ) : (
        <Drills progress={progress} answer={answer} recordDrill={recordDrill} />
      )}
    </div>
  )
}
