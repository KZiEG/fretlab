import { useState } from 'react'
import {
  BEAT_CHOICES, MAX_BPM, MIN_BPM, nudgeBpm, setAccent, setBeats, setBpm, stop, tap, toggle, useMetronome,
} from '../metronome.js'
import { useHeadphonesAwake, useWakeLock } from '../mobile.js'

function BeatDots({ beats, beat, running }) {
  return (
    <div className="met-beats" aria-hidden="true">
      {Array.from({ length: beats }, (_, i) => (
        <span key={i} className={`met-beat${i === 0 && beats > 1 ? ' first' : ''}${running && i === beat ? ' on' : ''}`} />
      ))}
    </div>
  )
}

/** The full metronome (Home tab): speed, tap tempo, beats per bar, accent. */
export function MetronomePanel() {
  const m = useMetronome()
  const [tapped, setTapped] = useState(0)

  return (
    <section className="met-panel" aria-label="Metronome">
      <div className="met-panel-top">
        <div>
          <div className="met-big">{m.bpm}</div>
          <div className="muted small">beats per minute</div>
        </div>
        <button className={`btn met-play${m.running ? ' on' : ''}`} onClick={toggle}>
          {m.running ? 'Stop' : 'Start'}
        </button>
      </div>

      <BeatDots beats={m.beats} beat={m.beat} running={m.running} />

      <input
        className="met-slider"
        type="range" min={MIN_BPM} max={MAX_BPM} step="1" value={m.bpm}
        onChange={(e) => setBpm(e.target.value)}
        aria-label="Tempo"
      />
      <div className="met-steps">
        <button className="btn" onClick={() => nudgeBpm(-5)} aria-label="5 slower">−5</button>
        <button className="btn" onClick={() => nudgeBpm(-1)} aria-label="1 slower">−1</button>
        <button className="btn" onClick={() => setTapped(tap())}>
          Tap{tapped === 1 ? '…' : ''}
        </button>
        <button className="btn" onClick={() => nudgeBpm(1)} aria-label="1 faster">+1</button>
        <button className="btn" onClick={() => nudgeBpm(5)} aria-label="5 faster">+5</button>
      </div>

      <h4>Beats per bar</h4>
      <div className="met-beat-choices">
        {BEAT_CHOICES.map((b) => (
          <button key={b} className={`chip${m.beats === b ? ' on' : ''}`} onClick={() => setBeats(b)}>{b}</button>
        ))}
      </div>
      <label className="check">
        <input type="checkbox" checked={m.accent} onChange={(e) => setAccent(e.target.checked)} />
        Accent the first beat of each bar
      </label>
      <p className="muted small">
        Keeps playing when you switch tabs. Tap the metronome badge at the top of any screen to stop it.
      </p>
    </section>
  )
}

/** The compact bar above the timed drills: start/stop and speed, same metronome. */
export default function Metronome() {
  const m = useMetronome()
  return (
    <div className="metronome">
      <button className={`btn met-toggle${m.running ? ' on' : ''}`} onClick={toggle}>
        {m.running ? 'Stop' : 'Metronome'}
      </button>
      <div className="met-bpm">
        <button className="btn met-step" onClick={() => nudgeBpm(-5)} disabled={m.bpm <= MIN_BPM} aria-label="Slower">−</button>
        <span className="met-num">{m.bpm} BPM</span>
        <button className="btn met-step" onClick={() => nudgeBpm(5)} disabled={m.bpm >= MAX_BPM} aria-label="Faster">+</button>
      </div>
      <span key={m.pulse} className={`met-dot${m.running && m.beat === 0 && m.beats > 1 && m.accent ? ' accent' : ''}`} />
    </div>
  )
}

/**
 * Shown in the top bar on every tab while the metronome runs: the tempo and a
 * pulsing dot; tap to stop. Also keeps the screen and Bluetooth headphones awake.
 */
export function MetronomeBadge() {
  const m = useMetronome()
  useWakeLock(m.running)
  useHeadphonesAwake(m.running)
  if (!m.running) return null
  return (
    <button className="met-badge" onClick={stop} aria-label={`Metronome at ${m.bpm} BPM, tap to stop`}>
      <span key={m.pulse} className={`met-dot${m.beat === 0 && m.beats > 1 && m.accent ? ' accent' : ''}`} />
      {m.bpm} BPM
      <span className="met-badge-stop">■</span>
    </button>
  )
}
