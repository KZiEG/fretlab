import { useEffect, useRef, useState } from 'react'
import Fretboard from './Fretboard.jsx'
import Metronome from './Metronome.jsx'
import {
  MAX_FRET as NECK_MAX_FRET, NATURAL_PCS, SHARP, SHORTCUTS, STRING_ORDINALS, STRING_TITLES,
  fretsFor, midiAt, noteLabel, pcAt,
} from '../theory.js'
import { drillScore } from '../progress.js'
import { pluck } from '../audio.js'
import { buzzWrong, useWakeLock } from '../mobile.js'

const MAX_FRET = 12 // exercises 1-3 stay in a beginner-friendly range
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
  {
    id: 4,
    title: '4 · Octave shortcuts',
    blurb: 'Pick a shortcut and up to 2 notes (any note, sharps and flats included). You start from the note shown on the neck — find the octave using the shortcut, timed.',
  },
]

const fmt = (ms) => {
  const m = Math.floor(ms / 60000)
  const s = (ms % 60000) / 1000
  return `${m}:${s.toFixed(1).padStart(4, '0')}`
}

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const rollNaturals = (n) => shuffle(NATURAL_PCS).slice(0, n)

const boardFretsFor = (ex) => (ex === 4 ? NECK_MAX_FRET : MAX_FRET)

// Every (from, to) fret pair this shortcut/pair-selection/note produces
function shortcutSteps(cfg) {
  const sc = SHORTCUTS.find((s) => s.id === cfg.shortcutId)
  const pairs = cfg.pairIdx === 'both' ? sc.pairs : [sc.pairs[cfg.pairIdx]]
  const minFret = Math.max(0, -sc.fretDelta)
  const maxFret = Math.min(NECK_MAX_FRET, NECK_MAX_FRET - sc.fretDelta)
  const steps = []
  for (const pc of cfg.notes4) {
    for (const [from, to] of pairs) {
      for (let f = minFret; f <= maxFret; f++) {
        if (pcAt(from, f) === pc) steps.push({ s: to, pc, f: f + sc.fretDelta, fromS: from, fromF: f })
      }
    }
  }
  return shuffle(steps)
}

// The ordered list of things to find. `f` is set when one exact fret is required.
function buildSteps(ex, cfg) {
  if (ex === 4) return shortcutSteps(cfg)
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
  if (ex === 3) return cfg.source === 'random' ? `ex3:random${cfg.count}:${cfg.dir}` : `ex3:${sorted(cfg.picked)}:${cfg.dir}`
  return `ex4:${cfg.shortcutId}:${cfg.pairIdx}:${sorted(cfg.notes4)}`
}

// ------------------------------------------------------------------ runner

function Runner({ steps, frets, subtitle, sound, answer, onDone, onCancel }) {
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

  useWakeLock(true) // don't let the phone sleep mid-drill

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
      buzzWrong()
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

  // the shortcut exercise always shows where you're starting from
  const fromMark = step.fromS !== undefined
    ? [{ s: step.fromS, f: step.fromF, kind: 'from', label: SHARP[step.pc] }]
    : []
  const marks = [...fromMark, ...(peek ? targetMarks(steps) : []), ...done, ...(wrong ? [wrong] : [])]
  const trail = steps.filter((st) => st.s === step.s && st.f !== undefined && st.fromS === undefined)

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

        {subtitle && <p className="muted small drill-subtitle">{subtitle}</p>}
        <div className="prompt">
          {step.fromS !== undefined ? (
            <>
              Find <strong>{noteLabel(step.pc)}</strong>'s octave on the <strong>{STRING_ORDINALS[step.s]}</strong> string
            </>
          ) : (
            <>
              {trail.length ? 'Next natural note: ' : 'Find '}
              <strong>{noteLabel(step.pc)}</strong> on the <strong>{STRING_ORDINALS[step.s]}</strong> string
              {step.hint && <span className="muted"> ({step.hint})</span>}
            </>
          )}
        </div>
      </div>

      {trail.length > 0 && (
        <div className="trail">
          {trail.map((st, i) => (
            <span key={i} className={st === step ? 'now' : st.f < step.f ? 'past' : ''}>{SHARP[st.pc]}</span>
          ))}
        </div>
      )}

      <Fretboard frets={frets} marks={marks} highlightString={step.s} onCell={tap} />
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
    shortcutId: 1, pairIdx: 'both', notes4: [],
  })
  const [phase, setPhase] = useState('setup') // setup | run | done
  const [run, setRun] = useState(null) // { steps, key, frets, header }
  const [result, setResult] = useState(null)
  const [runId, setRunId] = useState(0) // new id per run so the runner resets only when a run starts

  const patch = (p) => setCfg((c) => ({ ...c, ...p }))
  const steps = buildSteps(ex, cfg)
  const key = bestKey(ex, cfg)
  const best = progress.drills?.[key]?.best
  const shortcut = SHORTCUTS.find((s) => s.id === cfg.shortcutId)

  const valid =
    ex === 1 ? true
      : ex === 2 ? cfg.notes.length >= 1
        : ex === 3 ? (cfg.source === 'random' || cfg.picked.length === cfg.count)
          : cfg.notes4.length >= 1

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
    const header = ex === 4 ? `Shortcut ${c.shortcutId} · ${shortcut.title}` : undefined
    setRun({ steps: buildSteps(ex, c), key: bestKey(ex, c), frets: boardFretsFor(ex), header })
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

  let content
  if (phase === 'run') {
    content = (
      <Runner
        key={runId}
        steps={run.steps}
        frets={run.frets}
        subtitle={run.header}
        sound={progress.settings.sound}
        answer={answer}
        onDone={finish}
        onCancel={() => setPhase('setup')}
      />
    )
  } else if (phase === 'done' && result) {
    const slowest = [...result.splits].sort((a, b) => b.ms - a.ms).slice(0, 3)
    content = (
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
  } else {
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

    content = (
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

        {ex === 4 && (
          <>
            <h4>Which shortcut?</h4>
            <div className="chips wrap">
              {SHORTCUTS.map((sc) => (
                <button
                  key={sc.id}
                  className={`chip${cfg.shortcutId === sc.id ? ' on' : ''}`}
                  onClick={() => patch({ shortcutId: sc.id, pairIdx: 'both' })}
                >
                  {sc.id} · {sc.title}
                </button>
              ))}
            </div>

            {shortcut.pairs.length > 1 && (
              <>
                <h4>Which string pair?</h4>
                <div className="chips">
                  <button className={`chip${cfg.pairIdx === 'both' ? ' on' : ''}`} onClick={() => patch({ pairIdx: 'both' })}>Both</button>
                  {shortcut.pairs.map(([a, b], i) => (
                    <button key={i} className={`chip${cfg.pairIdx === i ? ' on' : ''}`} onClick={() => patch({ pairIdx: i })}>
                      String {6 - a} → {6 - b}
                    </button>
                  ))}
                </div>
              </>
            )}

            <h4>Choose up to 2 notes ({cfg.notes4.length}/2)</h4>
            <div className="chips wrap">
              {SHARP.map((_, pc) => (
                <button
                  key={pc}
                  className={`chip${cfg.notes4.includes(pc) ? ' on' : ''}`}
                  disabled={!cfg.notes4.includes(pc) && cfg.notes4.length >= 2}
                  onClick={() => toggleNote(pc, cfg.notes4, 2, 'notes4')}
                >
                  {noteLabel(pc)}
                </button>
              ))}
            </div>
            <p className="muted small">{shortcut.rule}</p>
          </>
        )}

        <h4>What you'll be finding</h4>
        {valid ? (
          <>
            <Fretboard frets={boardFretsFor(ex)} marks={preview} />
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
          <p className="muted">Choose {ex === 4 ? 'a note' : `${cfg.count} notes`} above to see the map.</p>
        )}

        <button className="btn primary wide" disabled={!valid} onClick={() => start(false)}>Start timer</button>
      </>
    )
  }

  return (
    <>
      <Metronome />
      {content}
    </>
  )
}
