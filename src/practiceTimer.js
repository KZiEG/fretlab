// One countdown for the Practice routine. It lives outside any page, so it keeps
// running while you open the Trainer or Scales for that block.
import { useSyncExternalStore } from 'react'
import { audioTime, scheduleClick, unlockAudio } from './audio.js'

let state = { blockId: null, endsAt: 0, now: Date.now() }
const listeners = new Set()
const finishers = new Set() // called with the block id when a countdown reaches zero
let timer = null

function set(patch) {
  state = { ...state, ...patch }
  listeners.forEach((fn) => fn())
}

function chime() {
  const t = audioTime() + 0.05
  ;[0, 0.18, 0.36].forEach((d, i) => scheduleClick(t + d, i === 2))
}

function tick() {
  const now = Date.now()
  if (now >= state.endsAt) {
    const id = state.blockId
    clearInterval(timer)
    timer = null
    set({ blockId: null, endsAt: 0, now })
    chime()
    finishers.forEach((fn) => fn(id))
  } else {
    set({ now })
  }
}

export function startTimer(blockId, minutes) {
  unlockAudio() // called from a tap, so the end chime can play on iOS
  clearInterval(timer)
  set({ blockId, endsAt: Date.now() + minutes * 60000, now: Date.now() })
  timer = setInterval(tick, 500)
}

export function stopTimer() {
  clearInterval(timer)
  timer = null
  set({ blockId: null, endsAt: 0, now: Date.now() })
}

export function onTimerDone(fn) {
  finishers.add(fn)
  return () => finishers.delete(fn)
}

export const remainingMs = (s) => Math.max(0, s.endsAt - s.now)
export const fmtClock = (ms) => {
  const s = Math.ceil(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function usePracticeTimer() {
  return useSyncExternalStore(subscribe, () => state)
}
