import { useState } from 'react'
import { SHARP } from '../theory.js'
import { canRecord, deleteClip, playClip, recordClip, saveClip } from '../voiceClips.js'

const REC_MS = 1600
const SAY = ['C', 'C sharp', 'D', 'D sharp', 'E', 'F', 'F sharp', 'G', 'G sharp', 'A', 'A sharp', 'B']

/** Record each note name in your own voice. `clips` is a Map of pitch class -> AudioBuffer. */
export default function VoiceRecorder({ clips, setClips }) {
  const [busy, setBusy] = useState(null) // pitch class being recorded
  const [error, setError] = useState('')

  if (!canRecord()) {
    return <p className="muted small">This browser can't record audio, so the phone voice is used.</p>
  }

  async function record(pc) {
    setError('')
    setBusy(pc)
    try {
      const { blob, buffer } = await recordClip(REC_MS)
      if (!buffer) {
        setError('Didn’t catch anything. Try again a little closer to the mic.')
        return
      }
      await saveClip(pc, blob)
      setClips((m) => new Map(m).set(pc, buffer))
      playClip(buffer) // play it back straight away so you can hear how it came out
    } catch (e) {
      setError(e?.name === 'NotAllowedError'
        ? 'Microphone access was blocked. Allow it for this site in Settings, then try again.'
        : 'Recording didn’t work on this device.')
    } finally {
      setBusy(null)
    }
  }

  async function remove(pc) {
    await deleteClip(pc).catch(() => {})
    setClips((m) => {
      const next = new Map(m)
      next.delete(pc)
      return next
    })
  }

  return (
    <details className="panel rec-panel">
      <summary>Record note names in your voice ({clips.size}/12)</summary>
      <p className="muted small rec-help">
        Recordings play through your headphones (the phone voice can come out of the speaker on iPhone). Tap
        Record, say the name within the next {REC_MS / 1000} s, and it plays back. Notes you haven't recorded use
        the phone voice.
      </p>
      <ul className="rec-list">
        {SHARP.map((name, pc) => {
          const has = clips.has(pc)
          return (
            <li key={pc}>
              <span className="rec-name">{name}</span>
              <span className="muted small rec-say">say “{SAY[pc]}”</span>
              {has && (
                <button className="chip" onClick={() => playClip(clips.get(pc))} aria-label={`Play ${name}`}>▶</button>
              )}
              <button
                className={`chip${busy === pc ? ' on' : ''}`}
                disabled={busy !== null}
                onClick={() => record(pc)}
              >
                {busy === pc ? 'Listening…' : has ? 'Redo' : 'Record'}
              </button>
              {has && (
                <button className="chip" onClick={() => remove(pc)} aria-label={`Delete ${name}`}>✕</button>
              )}
            </li>
          )
        })}
      </ul>
      {error && <p className="feedback bad small">{error}</p>}
    </details>
  )
}
