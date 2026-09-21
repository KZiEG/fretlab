import { useEffect, useRef, useState } from 'react'
import Fretboard from './Fretboard.jsx'
import {
  NATURAL_PCS, SHARP, STRING_ORDINALS, STRING_TITLES, fretsFor, midiAt, noteLabel, pcAt,
} from '../theory.js'
import { drillScore } from '../progress.js'
import { pluck } from '../audio.js'

const MAX_FRET = 12
const NOTE_COLORS = ['#4fb3c9', '#f0a93e', '#b08bf0']
const ALL_STRINGS = [0, 1, 2, 3, 4, 5]

const EXERCISES = [
  {
    id: 1,
    title: '1 · Naturals along a string',
    blurb: 'Walk up one string and find every natural note in order (E F G A B C D E…). No sharps or flats.',
  },
  {
    id: 2,
    title: '2 · One note, every string',
    blurb: 'Pick 1 to 3 notes. Find each note on every string, one string after another: a vertical line down the neck.',
  },
  {
    id: 3,
    title: '3 · Note pairs, string by string',
    blurb: 'Two or three natural notes. On each string find all of them, then move on to the next string.',
  },
]

const fmt = (ms) => {
  const m = Math.floor(ms / 60000)
  const s = (ms % 60000) / 1000
  return `${m}:${s.toFixed(1).padStart(4, '0')}`
}

function rollNaturals(n) {
  const pool = [...NATURAL_PCS]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, n)
}

// The ordered list of things to find. `f` is set when one exact fret is required.
function buildSteps(ex, cfg) {
  const order = cfg.dir === 'down' ? [...ALL_STRINGS].reverse() : ALL_STRINGS
  const steps = []
  if (ex === 1) {
    const strings = cfg.string === 'all' ? ALL_STRINGS : [cfg.string]
    for (const s of strings) {
      for (let f = 0; f <= MAX_FRET; f++) {
        const pc = pcAt(s, f)
        if (NATURAL_PCS.includes(pc)) {
          steps.push({ s, pc, f, hint: f === 0 ? 'open string' : f === 12 ? '12th fret' : null })
        }
      }
    }
  } else if (ex === 2) {
    for (const pc of cfg.notes) for (const s of order) steps.push({ s, pc })
  } else {
    const notes = cfg.source === 'random' ? cfg.rolled : cfg.picked
    for (const s of order) for (const pc of notes) steps.push({ s, pc })
  }
  return steps
}

// Every position the steps ask for, coloured by note (used as a preview / peek)
function targetMarks(steps) {
  const notes = [...new Set(steps.map((st) => st.pc))]
  const seen = new Set()
  const out = []
  for (const st of steps) {
    const frets = st.f !== undefined ? [st.f] : fretsFor(st.s, st.pc, MAX_FRET)
    for (const f of frets) {
      const key = `${st.s}-${f}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push({
        s: st.s, f, kind: 'note', label: SHARP[st.pc],
        color: notes.length <= 3 ? NOTE_COLORS[notes.indexOf(st.pc)] : undefined,
      })
    }
  }
  return out
}

function bestKey(ex, cfg) {
  const sorted = (a) => [...a].sort((x, y) => x - y).join('-')
  if (ex === 1) return `ex1:${cfg.string}`
  if (ex === 2) return `ex2:${sorted(cfg.notes)}:${cfg.dir}`
  return cfg.source === 'random' ? `ex3:random${cfg.count}:${cfg.dir}` : `ex3:${sorted(cfg.picked)}:${cfg.dir}`
}

// ------------------------------------------------------------------ runner

function Runner({ steps, sound, answer, onDone, onCancel }) {
  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState([])
  const [wrong, setWrong] = useState(null)
  const [hint, setHint] = useState('')
  const [peek, setPeek] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const t0 = useRef(Date.now())
  const stepStart = useRef(Date.now())
  const stepMiss = useRef(0)
  const totalMiss = useRef(0)
  const splits = useRef([])
  const finished = useRef(false)
  const wrongTimer = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => {
      clearInterval(id)
      clearTimeout(wrongTimer.current)
    }
  }, [])

  const step = steps[idx]

  function tap(s, f) {
    if (finished.current) return
    if (s !== step.s) {
      setHint(`Tap the ${STRING_ORDINALS[step.s]} string`)
      return
    }
    setHint('')
    const ok = step.f !== undefined ? f === step.f : pcAt(s, f) === step.pc
    const t = Date.now()
    if (!ok) {
      stepMiss.current++
      totalMiss.current++
      setWrong({ s, f, kind: 'wrong', label: SHARP[pcAt(s, f)] })
      clearTimeout(wrongTimer.current)
      wrongTimer.current = setTimeout(() => setWrong(null), 600)
      return
    }
    const ms = t - stepStart.current
    if (sound) pluck(midiAt(s, f))
    if (stepMiss.current === 0) answer(s, f, true, ms) // first-try hits count toward XP and levels
    splits.current.push({ step, ms, mistakes: stepMiss.current })
    setDone((d) => [...d, { s, f, kind: 'correct', label: SHARP[step.pc] }])
    stepStart.current = t
    stepMiss.current = 0
    if (idx + 1 >= steps.length) {
      finished.current = true
      onDone({ total: t - t0.current, mistakes: totalMiss.current, splits: splits.current })
    } else {
      setIdx(idx + 1)
    }
  }

  const marks = [...(peek ? targetMarks(steps) : []), ...done, ...(wrong ? [wrong] : [])]
  const trail = steps.filter((st) => st.s === step.s && st.f !== undefined)

  return (
    <div className="drill-run">
      <div className="drill-head">
        <div className="timer-row">
          <div className="timer">{fmt(now - t0.current)}</div>
          <div className="muted">
            Step {idx + 1} of {steps.length} · {totalMiss.current} mistake{totalMiss.current === 1 ? '' : 's'}
          </div>
        </div>
        <div className="progress-bar"><span style={{ width: `${(idx / steps.length) * 100}%` }} /></div>

        <div className="prompt">
          {trail.length ? 'Next natural note: ' : 'Find '}
          <strong>{noteLabel(step.pc)}</strong>
          {' on the '}
          <strong>{STRING_ORDINALS[step.s]}</strong> string
          {step.hint && <span className="muted"> ({step.hint})</span>}
        </div>
      </div>

      {trail.length > 0 && (
        <div className="trail">
          {trail.map((st, i) => (
            <span key={i} className={st === step ? 'now' : st.f < step.f ? 'past' : ''}>{SHARP[st.pc]}</span>
          ))}
        </div>
      )}

      <Fretboard frets={MAX_FRET} marks={marks} highlightString={step.s} onCell={tap} />
      {hint && <p className="hint">{hint}</p>}

      <div className="chips">
        <button className={`chip${peek ? ' on' : ''}`} onClick={() => setPeek((p) => !p)}>
          {peek ? 'Hide map' : 'Show map'}
        </button>
        <button className="chip" onClick={onCancel}>Stop</button>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ setup + results

export default function Drills({ progress, answer, recordDrill }) {
  const [ex, setEx] = useState(1)
  const [cfg, setCfg] = useState({
    string: 0, notes: [0], dir: 'up', count: 2, source: 'random', picked: [], rolled: rollNaturals(2),
  })
  const [phase, setPhase] = useState('setup') // setup | run | done
  const [run, setRun] = useState(null) // { steps, key }
  const [result, setResult] = useState(null)
  const [runId, setRunId] = useState(0) // new id per run so the runner resets only when a run starts

  const patch = (p) => setCfg((c) => ({ ...c, ...p }))
  const steps = buildSteps(ex, cfg)
  const key = bestKey(ex, cfg)
  const best = progress.drills?.[key]?.best

  const valid =
    ex === 1 ? true
      : ex === 2 ? cfg.notes.length >= 1
        : cfg.source === 'random' || cfg.picked.length === cfg.count

  function toggleNote(pc, list, max, field) {
    const has = list.includes(pc)
    if (has) patch({ [field]: list.filter((x) => x !== pc) })
    else if (list.length < max) patch({ [field]: [...list, pc] })
  }

  function start(reroll = false) {
    let c = cfg
    if (ex === 3 && cfg.source === 'random' && reroll) {
      c = { ...cfg, rolled: rollNaturals(cfg.count) }
      setCfg(c)
    }
    setRun({ steps: buildSteps(ex, c), key: bestKey(ex, c) })
    setResult(null)
    setRunId((n) => n + 1)
    setPhase('run')
  }

  function finish(r) {
    const prev = progress.drills?.[run.key]?.best
    const isBest = !prev || drillScore(r.total, r.mistakes) < prev.score
    recordDrill(run.key, r.total, r.mistakes)
    setResult({ ...r, isBest, first: !prev })
    setPhase('done')
  }

  // ---- running
  if (phase === 'run') {
    return (
      <Runner
        key={runId}
        steps={run.steps}
        sound={progress.settings.sound}
        answer={answer}
        onDone={finish}
        onCancel={() => setPhase('setup')}
      />
    )
  }

  // ---- results
  if (phase === 'done' && result) {
    const slowest = [...result.splits].sort((a, b) => b.ms - a.ms).slice(0, 3)
    return (
      <div className="drill-result">
        <h3>Finished</h3>
        {result.isBest && <div className="badge">{result.first ? 'First time recorded!' : 'New personal best!'}</div>}
        <div className="stat-row">
          <div className="stat"><div className="stat-num">{fmt(result.total)}</div><div className="muted small">time</div></div>
          <div className="stat"><div className="stat-num">{result.mistakes}</div><div className="muted small">mistakes</div></div>
          <div className="stat"><div className="stat-num">{(result.total / result.splits.length / 1000).toFixed(1)}s</div><div className="muted small">per note</div></div>
        </div>
        {!result.isBest && best && (
          <p className="muted">Best so far: {fmt(best.ms)} with {best.mistakes} mistake{best.mistakes === 1 ? '' : 's'}.</p>
        )}
        <h4>Slowest spots</h4>
        <ul className="attention">
          {slowest.map((sp, i) => (
            <li key={i}>
              <strong>{SHARP[sp.step.pc]}</strong>
              <span>{STRING_TITLES[sp.step.s]} string{sp.mistakes ? ` · ${sp.mistakes} miss` : ''}</span>
              <span className="muted">{(sp.ms / 1000).toFixed(1)}s</span>
            </li>
          ))}
        </ul>
        <p className="muted small">A mistake adds 3 seconds when comparing runs. Notes you hit first try also feed your fretboard levels.</p>
        <div className="chips">
          <button className="btn primary" onClick={() => start(true)}>Go again</button>
          <button className="btn" onClick={() => setPhase('setup')}>Change setup</button>
        </div>
      </div>
    )
  }

  // ---- setup
  const preview = targetMarks(steps)
  const previewNotes = [...new Set(steps.map((st) => st.pc))]
  const dirControl = (
    <>
      <h4>Order of strings</h4>
      <div className="segmented small">
        <button className={cfg.dir === 'up' ? 'on' : ''} onClick={() => patch({ dir: 'up' })}>Start on 6th (low E)</button>
        <button className={cfg.dir === 'down' ? 'on' : ''} onClick={() => patch({ dir: 'down' })}>Start on 1st (high e)</button>
      </div>
    </>
  )

  return (
    <>
      <div className="ex-list">
        {EXERCISES.map((e) => (
          <button key={e.id} className={`ex${ex === e.id ? ' on' : ''}`} onClick={() => setEx(e.id)}>
            <strong>{e.title}</strong>
          </button>
        ))}
      </div>
      <p className="muted">{EXERCISES[ex - 1].blurb}</p>

      {ex === 1 && (
        <>
          <h4>Which string?</h4>
          <div className="chips">
            {ALL_STRINGS.map((s) => (
              <button key={s} className={`chip${cfg.string === s ? ' on' : ''}`} onClick={() => patch({ string: s })}>
                {STRING_TITLES[s]}
              </button>
            ))}
            <button className={`chip${cfg.string === 'all' ? ' on' : ''}`} onClick={() => patch({ string: 'all' })}>
              All six in turn
            </button>
          </div>
        </>
      )}

      {ex === 2 && (
        <>
          <h4>Choose up to 3 notes ({cfg.notes.length}/3)</h4>
          <div className="chips wrap">
            {SHARP.map((_, pc) => (
              <button
                key={pc}
                className={`chip${cfg.notes.includes(pc) ? ' on' : ''}`}
                disabled={!cfg.notes.includes(pc) && cfg.notes.length >= 3}
                onClick={() => toggleNote(pc, cfg.notes, 3, 'notes')}
              >
                {noteLabel(pc)}
              </button>
            ))}
          </div>
          {dirControl}
        </>
      )}

      {ex === 3 && (
        <>
          <h4>How many notes?</h4>
          <div className="segmented small">
            {[2, 3].map((n) => (
              <button
                key={n}
                className={cfg.count === n ? 'on' : ''}
                onClick={() => patch({ count: n, rolled: rollNaturals(n), picked: cfg.picked.slice(0, n) })}
              >
                {n} notes
              </button>
            ))}
          </div>
          <h4>Which notes?</h4>
          <div className="segmented small">
            <button className={cfg.source === 'random' ? 'on' : ''} onClick={() => patch({ source: 'random' })}>Random</button>
            <button className={cfg.source === 'pick' ? 'on' : ''} onClick={() => patch({ source: 'pick' })}>I'll choose</button>
          </div>
          {cfg.source === 'random' ? (
            <div className="chips">
              <span className="muted">Your notes: <strong>{cfg.rolled.map((pc) => SHARP[pc]).join(' · ')}</strong></span>
              <button className="chip" onClick={() => patch({ rolled: rollNaturals(cfg.count) })}>Re-roll</button>
            </div>
          ) : (
            <div className="chips">
              {NATURAL_PCS.map((pc) => (
                <button
                  key={pc}
                  className={`chip${cfg.picked.includes(pc) ? ' on' : ''}`}
                  disabled={!cfg.picked.includes(pc) && cfg.picked.length >= cfg.count}
                  onClick={() => toggleNote(pc, cfg.picked, cfg.count, 'picked')}
                >
                  {SHARP[pc]}
                </button>
              ))}
              <span className="muted small">{cfg.picked.length}/{cfg.count} chosen</span>
            </div>
          )}
          {dirControl}
        </>
      )}

      <h4>What you'll be finding</h4>
      {valid ? (
        <>
          <Fretboard frets={MAX_FRET} marks={preview} />
          {previewNotes.length <= 3 && (
            <div className="legend">
              {previewNotes.map((pc, i) => (
                <span key={pc}><i style={{ background: NOTE_COLORS[i] }} />{noteLabel(pc)}</span>
              ))}
            </div>
          )}
          <p className="muted small">
            {steps.length} notes to find{best ? ` · Best: ${fmt(best.ms)} (${best.mistakes} mistake${best.mistakes === 1 ? '' : 's'})` : ''}
          </p>
        </>
      ) : (
        <p className="muted">Choose {cfg.count} notes above to see the map.</p>
      )}

      <button className="btn primary wide" disabled={!valid} onClick={() => start(false)}>Start timer</button>
    </>
  )
}
