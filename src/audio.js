// A tiny plucked-string synth (Karplus-Strong) so the app needs no audio files.
import { midiToFreq } from './theory.js'

let ctx = null
const cache = new Map()

// Must be called from a tap/click handler the first time (iOS requirement)
export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function pluckBuffer(midi) {
  if (cache.has(midi)) return cache.get(midi)
  const sr = ctx.sampleRate
  const period = Math.max(2, Math.round(sr / midiToFreq(midi)))
  const length = Math.floor(sr * 2.2)
  const buffer = ctx.createBuffer(1, length, sr)
  const data = buffer.getChannelData(0)
  const ring = new Float32Array(period)
  for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1
  const decay = 0.9955
  for (let i = 0; i < length; i++) {
    const idx = i % period
    data[i] = ring[idx]
    ring[idx] = decay * 0.5 * (ring[idx] + ring[(idx + 1) % period])
  }
  cache.set(midi, buffer)
  return buffer
}

export function pluck(midi, delay = 0, volume = 0.5) {
  if (!unlockAudio()) return
  const src = ctx.createBufferSource()
  src.buffer = pluckBuffer(midi)
  const gain = ctx.createGain()
  const t = ctx.currentTime + delay
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 2.1)
  src.connect(gain).connect(ctx.destination)
  src.start(t)
}

// Strum a list of MIDI notes low to high
export function strum(midis, gap = 0.045) {
  midis.forEach((m, i) => pluck(m, i * gap, 0.4))
}

// Play notes one after another
export function playSequence(midis, gap = 0.28) {
  midis.forEach((m, i) => pluck(m, i * gap, 0.5))
}
