import { useRef } from 'react'
import Fretboard from '../components/Fretboard.jsx'
import { STRING_ORDINALS, SHARP, pcAt } from '../theory.js'
import {
  STATUSES, cellKey, effectiveLevel, emptyState, levelFromXp, statusFor, streakOf, todayKey, xpForLevel,
} from '../progress.js'

export default function Home({ progress, setProgress }) {
  const { cells, xp, days, settings } = progress
  const fileRef = useRef(null)
  const now = Date.now()

  const level = levelFromXp(xp)
  const floor = xpForLevel(level)
  const ceil = xpForLevel(level + 1)
  const streak = streakOf(days, now)
  const today = days[todayKey(now)]

  const counts = { learning: 0, refined: 0, mastered: 0 }
  const seen = []
  const marks = []
  for (let s = 0; s < 6; s++) {
    for (let f = 0; f <= 12; f++) {
      const cell = cells[cellKey(s, f)]
      const status = statusFor(cell, now, settings.decay)
      if (cell) {
        counts[status.id]++
        seen.push({ s, f, level: effectiveLevel(cell, now, settings.decay), last: cell.last })
      }
      marks.push({ s, f, kind: 'heat', color: status.color })
    }
  }
  const attention = seen.sort((a, b) => a.level - b.level).slice(0, 5)

  function exportData() {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `fretlab-progress-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function importData(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      if (typeof data !== 'object' || !data.cells) throw new Error('not a FretLab file')
      setProgress({ ...emptyState(), ...data, settings: { ...emptyState().settings, ...data.settings } })
    } catch {
      alert("That file doesn't look like a FretLab export.")
    }
  }

  function reset() {
    if (confirm('Erase all progress on this device? This cannot be undone.')) setProgress(emptyState())
  }

  return (
    <div className="page">
      <h2>Your fretboard</h2>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-num">Lv {level}</div>
          <div className="bar"><span style={{ width: `${((xp - floor) / (ceil - floor)) * 100}%` }} /></div>
          <div className="muted small">{xp} XP · {ceil - xp} to next</div>
        </div>
        <div className="stat">
          <div className="stat-num">{streak}</div>
          <div className="muted small">day streak</div>
        </div>
        <div className="stat">
          <div className="stat-num">{today?.n ?? 0}</div>
          <div className="muted small">answers today</div>
        </div>
      </div>

      <a className="btn primary wide" href="#/trainer">Start training</a>

      <h3>Note map</h3>
      <p className="muted small">
        Every position from the nut to fret 12. Colour shows how well you know it — and notes fade back if you leave them
        alone.
      </p>
      <Fretboard frets={12} marks={marks} />
      <div className="legend">
        {STATUSES.map((s) => (
          <span key={s.id}><i style={{ background: s.color }} />{s.label}{s.id !== 'unseen' && ` ${counts[s.id]}`}</span>
        ))}
      </div>

      <h3>Needs attention</h3>
      {attention.length === 0 ? (
        <p className="muted">Nothing yet — head to the trainer and answer a few questions.</p>
      ) : (
        <ul className="attention">
          {attention.map((c) => {
            const ago = Math.floor((now - c.last) / 86_400_000)
            return (
              <li key={`${c.s}-${c.f}`}>
                <strong>{SHARP[pcAt(c.s, c.f)]}</strong>
                <span>{STRING_ORDINALS[c.s]} string, fret {c.f}</span>
                <span className="muted">{Math.round(c.level)}% · {ago === 0 ? "today" : `${ago}d ago`}</span>
              </li>
            )
          })}
        </ul>
      )}

      <h3>Your data</h3>
      <p className="muted small">Progress is saved in this browser only. Export a backup to move it to another device.</p>
      <div className="chips">
        <button className="btn" onClick={exportData}>Export</button>
        <button className="btn" onClick={() => fileRef.current?.click()}>Import</button>
        <button className="btn danger" onClick={reset}>Reset</button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
      </div>
    </div>
  )
}
