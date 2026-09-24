import { useEffect, useRef, useState } from 'react'
import { audioTime, scheduleClick } from '../audio.js'
import { useWakeLock } from '../mobile.js'

// Standard lookahead scheduler: a timer checks often, but every click is
// scheduled against the AudioContext's own clock, so the tempo stays exact
// even though JS timers (setInterval) are not.
const LOOKAHEAD_S = 0.12
const TICK_MS = 25
const BEATS_PER_BAR = 4
const MIN_BPM = 40
const MAX_BPM = 220

/** A small standalone metronome: tap tempo aside, just start/stop and a BPM stepper. */
export default function Metronome() {
  const [running, setRunning] = useState(false)
  const [bpm, setBpm] = useState(80)
  const [pulse, setPulse] = useState({ n: 0, accent: false })

  const bpmRef = useRef(80)
  const nextTime = useRef(0)
  const beatCount = useRef(0)
  const timer = useRef(null)

  useWakeLock(running)

  useEffect(() => () => clearInterval(timer.current), [])

  function tick() {
    const now = audioTime()
    while (nextTime.current < now + LOOKAHEAD_S) {
      const accent = beatCount.current % BEATS_PER_BAR === 0
      scheduleClick(nextTime.current, accent)
      const delayMs = Math.max(0, (nextTime.current - now) * 1000)
      setTimeout(() => setPulse((p) => ({ n: p.n + 1, accent })), delayMs)
      beatCount.current += 1
      nextTime.current += 60 / bpmRef.current
    }
  }

  function start() {
    beatCount.current = 0
    nextTime.current = audioTime() + 0.05
    setRunning(true)
    tick()
    timer.current = setInterval(tick, TICK_MS)
  }

  function stop() {
    clearInterval(timer.current)
    timer.current = null
    setRunning(false)
  }

  function changeBpm(delta) {
    const next = Math.min(MAX_BPM, Math.max(MIN_BPM, bpmRef.current + delta))
    bpmRef.current = next
    setBpm(next)
  }

  return (
    <div className="metronome">
      <button className={`btn met-toggle${running ? ' on' : ''}`} onClick={running ? stop : start}>
        {running ? 'Stop' : 'Metronome'}
      </button>
      <div className="met-bpm">
        <button className="btn met-step" onClick={() => changeBpm(-5)} disabled={bpm <= MIN_BPM} aria-label="Slower">−</button>
        <span className="met-num">{bpm} BPM</span>
        <button className="btn met-step" onClick={() => changeBpm(5)} disabled={bpm >= MAX_BPM} aria-label="Faster">+</button>
      </div>
      <span key={pulse.n} className={`met-dot${pulse.accent ? ' accent' : ''}`} />
    </div>
  )
}
