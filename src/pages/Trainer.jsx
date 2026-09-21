import { useCallback, useEffect, useRef, useState } from 'react'
import Fretboard from '../components/Fretboard.jsx'
import { STRING_LABELS, STRING_ORDINALS, SHARP, fretsFor, midiAt, noteLabel, pcAt } from '../theory.js'
import { pickCard } from '../progress.js'
import { pluck } from '../audio.js'

const RANGES = [
  [5, 'Frets 0–5'],
  [7, 'Frets 0–7'],
  [12, 'Frets 0–12'],
  [15, 'Frets 0–15'],
]

export default function Trainer({ progress, answer, updateSettings }) {
  const { settings } = progress
  const [card, setCard] = useState(null) // { s, f }
  const [phase, setPhase] = useState('ask') // ask | right | wrong
  const [picked, setPicked] = useState(null) // { s, f } tapped, or { pc } for name mode
  const [hint, setHint] = useState('')
  const [session, setSession] = useState({ n: 0, correct: 0 })

  const started = useRef(0)
  const lastKey = useRef(null)
  const timer = useRef(null)
  const progressRef = useRef(progress)
  progressRef.current = progress

  const stringsKey = settings.strings.join(',')

  const next = useCallback(() => {
    clearTimeout(timer.current)
    const c = pickCard(progressRef.current, settings.strings, settings.maxFret, lastKey.current)
    setCard(c)
    if (c) lastKey.current = `${c.s}-${c.f}`
    setPhase('ask')
    setPicked(null)
    setHint('')
    started.current = Date.now()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringsKey, settings.maxFret])

  useEffect(() => {
    next()
    return () => clearTimeout(timer.current)
  }, [next, settings.mode])

  // the first question is picked in an effect right after mount
  if (!card) return null

  const target = pcAt(card.s, card.f)
  const isFind = settings.mode === 'find'

  function finish(correct, pick) {
    if (phase !== 'ask') return
    answer(card.s, card.f, correct, Date.now() - started.current)
    setPicked(pick)
    setPhase(correct ? 'right' : 'wrong')
    setSession((s) => ({ n: s.n + 1, correct: s.correct + (correct ? 1 : 0) }))
    if (settings.sound) pluck(midiAt(card.s, card.f))
    if (correct) timer.current = setTimeout(next, 900)
  }

  function onNoteButton(pc) {
    finish(pc === target, { pc })
  }

  function onCell(s, f) {
    if (phase !== 'ask') return
    if (s !== card.s) {
      setHint(`Tap a fret on the ${STRING_ORDINALS[card.s]} string`)
      return
    }
    finish(pcAt(s, f) === target, { s, f })
  }

  // ---- what to draw on the neck
  let marks = []
  if (!isFind) {
    if (phase === 'ask') marks = [{ s: card.s, f: card.f, kind: 'target' }]
    else marks = [{ s: card.s, f: card.f, kind: 'correct', label: SHARP[target] }]
  } else if (phase !== 'ask') {
    const good = fretsFor(card.s, target, settings.maxFret).map((f) => ({
      s: card.s, f, kind: 'correct', label: SHARP[target],
    }))
    marks = [...good]
    if (phase === 'wrong' && picked?.s !== undefined) {
      marks.push({ s: picked.s, f: picked.f, kind: 'wrong', label: SHARP[pcAt(picked.s, picked.f)] })
    }
  }

  const acc = session.n ? Math.round((100 * session.correct) / session.n) : null

  let feedback = null
  if (phase === 'right') feedback = <p className="feedback good">Correct — {noteLabel(target)}</p>
  if (phase === 'wrong') {
    feedback = (
      <p className="feedback bad">
        {isFind
          ? `Not quite — that fret is ${noteLabel(pcAt(picked.s, picked.f))}. ${noteLabel(target)} is highlighted.`
          : `It's ${noteLabel(target)}, not ${noteLabel(picked.pc)}.`}
      </p>
    )
  }

  return (
    <div className="page">
      <div className="segmented">
        <button className={!isFind ? 'on' : ''} onClick={() => updateSettings({ mode: 'name' })}>Name the note</button>
        <button className={isFind ? 'on' : ''} onClick={() => updateSettings({ mode: 'find' })}>Find the note</button>
      </div>

      <div className="prompt">
        {isFind ? (
          <>
            Find <strong>{noteLabel(target)}</strong> on the <strong>{STRING_ORDINALS[card.s]}</strong> string
          </>
        ) : (
          <>
            What note is this? <span className="muted">({STRING_ORDINALS[card.s]} string, fret {card.f})</span>
          </>
        )}
      </div>

      <Fretboard
        frets={settings.maxFret}
        marks={marks}
        highlightString={isFind ? card.s : null}
        onCell={isFind && phase === 'ask' ? onCell : undefined}
      />

      {hint && phase === 'ask' && <p className="hint">{hint}</p>}
      {feedback}

      {!isFind && (
        <div className="note-grid">
          {SHARP.map((_, pc) => (
            <button
              key={pc}
              className={
                phase !== 'ask' && pc === target ? 'note-btn right'
                  : phase === 'wrong' && picked?.pc === pc ? 'note-btn wrong' : 'note-btn'
              }
              disabled={phase !== 'ask'}
              onClick={() => onNoteButton(pc)}
            >
              {noteLabel(pc)}
            </button>
          ))}
        </div>
      )}

      {phase === 'wrong' && (
        <button className="btn primary wide" onClick={next}>Next</button>
      )}

      <p className="session muted">
        This session: {session.correct}/{session.n}
        {acc !== null && ` (${acc}%)`}
      </p>

      <details className="panel">
        <summary>Practice settings</summary>
        <h4>Strings</h4>
        <div className="chips">
          {STRING_LABELS.map((label, s) => {
            const on = settings.strings.includes(s)
            return (
              <button
                key={s}
                className={`chip${on ? ' on' : ''}`}
                onClick={() => {
                  const strings = on ? settings.strings.filter((x) => x !== s) : [...settings.strings, s].sort()
                  if (strings.length) updateSettings({ strings })
                }}
              >
                {STRING_ORDINALS[s]}
              </button>
            )
          })}
        </div>
        <h4>Fret range</h4>
        <div className="chips">
          {RANGES.map(([n, label]) => (
            <button key={n} className={`chip${settings.maxFret === n ? ' on' : ''}`} onClick={() => updateSettings({ maxFret: n })}>
              {label}
            </button>
          ))}
        </div>
        <h4>Options</h4>
        <label className="check">
          <input type="checkbox" checked={settings.sound} onChange={(e) => updateSettings({ sound: e.target.checked })} />
          Play the note after each answer
        </label>
        <label className="check">
          <input type="checkbox" checked={settings.decay} onChange={(e) => updateSettings({ decay: e.target.checked })} />
          Notes fade if you don't practise them (decay)
        </label>
      </details>
    </div>
  )
}
