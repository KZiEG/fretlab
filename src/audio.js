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

// A short click for the metronome, scheduled at a precise AudioContext time
// (not routed through pluck's plucked-string buffer: this needs a plain, tight tick)
export function scheduleClick(time, accent = false) {
  const c = unlockAudio()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'square'
  osc.frequency.value = accent ? 1500 : 950
  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.exponentialRampToValueAtTime(accent ? 0.3 : 0.18, time + 0.002)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045)
  osc.connect(gain).connect(c.destination)
  osc.start(time)
  osc.stop(time + 0.05)
}

// The AudioContext's own clock, for scheduling the metronome precisely
export function audioTime() {
  return unlockAudio()?.currentTime ?? 0
}

// ---- speech: the device's built-in voices (Web Speech API)

// Joke and character voices some phones ship with; never pick these automatically
const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|superstar|trinoids|whisper|wobble|zarvox|junior|ralph|fred|kathy|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley/i

// Higher = more natural sounding. Premium/Enhanced (iOS, macOS) and Natural/Neural/
// Google (Android, Chrome, Edge) voices are far less robotic than the defaults.
function voiceScore(v) {
  let score = 0
  if (/^en[-_]?us/i.test(v.lang)) score += 3
  else if (/^en/i.test(v.lang)) score += 2
  else return -100
  if (/premium/i.test(v.name)) score += 6
  if (/enhanced/i.test(v.name)) score += 5
  if (/natural|neural/i.test(v.name)) score += 5
  if (/google/i.test(v.name)) score += 3
  if (/samantha|ava|allison|susan|zoe|evan|nathan|tom|serena|daniel|karen|moira/i.test(v.name)) score += 1
  if (!v.localService) score += 1 // online voices are usually the better ones
  if (NOVELTY.test(v.name)) score -= 50
  return score
}

/** English voices on this device, most natural first. May be empty until they load. */
export function englishVoices() {
  const voices = window.speechSynthesis?.getVoices() ?? []
  return voices
    .filter((v) => voiceScore(v) > -10)
    .sort((a, b) => voiceScore(b) - voiceScore(a) || a.name.localeCompare(b.name))
}

// Say something. `voiceURI` picks a voice; empty means the most natural one found.
// The first call must come from a tap on iOS, after which it also works from timers.
export function speak(text, voiceURI = '') {
  const synth = window.speechSynthesis
  if (!synth) return
  synth.cancel() // never let a backlog build up at fast countdowns
  const u = new SpeechSynthesisUtterance(text)
  const voices = englishVoices()
  const voice = voices.find((v) => v.voiceURI === voiceURI) ?? voices[0]
  if (voice) {
    u.voice = voice
    u.lang = voice.lang
  }
  synth.speak(u)
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel()
}
