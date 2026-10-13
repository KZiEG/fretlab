// One metronome for the whole app. It lives outside any page, so it keeps playing
// while you move between tabs; every metronome control on screen talks to this.
//
// Standard lookahead scheduler: a timer checks often, but every click is scheduled
// against the AudioContext's own clock, so the tempo stays exact even though JS
// timers are not.
import { useSyncExternalStore } from 'react'
import { audioTime, scheduleClick, unlockAudio } from './audio.js'

export const MIN_BPM = 30
export const MAX_BPM = 250
export const BEAT_CHOICES = [1, 2, 3, 4, 5, 6, 7] // beats per bar; 1 = no accent pattern

const LOOKAHEAD_S = 0.12
const TICK_MS = 25
const SAVE_KEY = 'fretlab-metronome'

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')
    return {
      bpm: clampBpm(saved.bpm ?? 80),
      beats: BEAT_CHOICES.includes(saved.beats) ? saved.beats : 4,
      accent: saved.accent ?? true,
    }
  } catch {
    return { bpm: 80, beats: 4, accent: true }
  }
}

function clampBpm(v) {
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(Number(v) || 80)))
}

// state is replaced (never mutated) so React can tell when it changed
let state = { running: false, beat: -1, pulse: 0, ...loadSaved() }
const listeners = new Set()

function set(patch) {
  state = { ...state, ...patch }
  listeners.forEach((fn) => fn())
  if ('bpm' in patch || 'beats' in patch || 'accent' in patch) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ bpm: state.bpm, beats: state.beats, accent: state.accent }))
    } catch {
      // storage blocked: settings just won't be remembered
    }
  }
}

let timer = null
let nextTime = 0
let count = 0
const pending = new Set() // screen updates waiting for their click

function tick() {
  const now = audioTime()
  // the audio clock stalled (iOS paused it): restart the beat instead of a burst of catch-up clicks
  if (nextTime < now - 0.1) nextTime = now + 0.05
  while (nextTime < now + LOOKAHEAD_S) {
    const beat = count % state.beats
    scheduleClick(nextTime, state.accent && state.beats > 1 && beat === 0)
    const id = setTimeout(() => {
      pending.delete(id)
      set({ beat, pulse: state.pulse + 1 })
    }, Math.max(0, (nextTime - now) * 1000))
    pending.add(id)
    count += 1
    nextTime += 60 / state.bpm
  }
}

export function start() {
  if (state.running) return
  unlockAudio() // called from a tap, which unlocks audio on iOS
  count = 0
  nextTime = audioTime() + 0.05
  set({ running: true, beat: -1 })
  tick()
  timer = setInterval(tick, TICK_MS)
}

export function stop() {
  clearInterval(timer)
  timer = null
  pending.forEach(clearTimeout)
  pending.clear()
  set({ running: false, beat: -1 })
}

export const toggle = () => (state.running ? stop() : start())
export const setBpm = (v) => set({ bpm: clampBpm(v) })
export const nudgeBpm = (d) => setBpm(state.bpm + d)
export const setBeats = (beats) => {
  count = 0 // start the new bar pattern on its first beat
  set({ beats })
}
export const setAccent = (accent) => set({ accent })

// Tap tempo: the average gap between recent taps; a pause of 2 s starts over
let taps = []
export function tap() {
  const now = performance.now()
  if (taps.length && now - taps[taps.length - 1] > 2000) taps = []
  taps = [...taps, now].slice(-6)
  if (taps.length >= 2) {
    const gaps = taps.slice(1).map((t, i) => t - taps[i])
    setBpm(60000 / (gaps.reduce((a, b) => a + b, 0) / gaps.length))
  }
  return taps.length
}

const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** The metronome's current state; re-renders whenever it changes. */
export function useMetronome() {
  return useSyncExternalStore(subscribe, () => state)
}
