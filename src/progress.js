// Progress tracking with a GuitarDex-style decay mechanic, applied to fretboard
// notes. Every (string, fret) position is a "card" with a level from 0-100.
// Practising raises it; leaving it alone lets it fade, more slowly the more
// you've practised it.

const KEY = 'fretlab:v1'
const DAY = 86_400_000

export const GRACE_DAYS = 2
export const DECAY_PER_DAY = 6

export const STATUSES = [
  { id: 'unseen', label: 'Unseen', min: -1, color: '#2a2f3a' },
  { id: 'learning', label: 'Learning', min: 0, color: '#e0a03a' },
  { id: 'refined', label: 'Refined', min: 40, color: '#4fb3c9' },
  { id: 'mastered', label: 'Mastered', min: 75, color: '#5fd08a' },
]

export const cellKey = (string, fret) => `${string}-${fret}`

export const defaultSettings = {
  mode: 'name', // 'name' | 'find'
  strings: [0, 1, 2, 3, 4, 5],
  maxFret: 12,
  sound: true,
  decay: true,
}

export function emptyState() {
  return { version: 1, cells: {}, xp: 0, days: {}, settings: { ...defaultSettings } }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw)
    return { ...emptyState(), ...parsed, settings: { ...defaultSettings, ...parsed.settings } }
  } catch {
    return emptyState()
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full or unavailable: progress just won't persist */
  }
}

// The lowest a card can decay to, based on the best it ever reached
function floorFor(best) {
  if (best >= 75) return 40 // mastered cards never fall below Refined
  if (best >= 40) return 10
  return 0
}

export function effectiveLevel(cell, now = Date.now(), decayOn = true) {
  if (!cell) return 0
  if (!decayOn) return cell.level
  const days = (now - cell.last) / DAY
  const resistance = 1 + Math.min(cell.reps, 30) / 10 // 1x .. 4x
  const overdue = Math.max(0, days - GRACE_DAYS * resistance)
  return Math.max(floorFor(cell.best), cell.level - (overdue * DECAY_PER_DAY) / resistance)
}

export function statusFor(cell, now = Date.now(), decayOn = true) {
  if (!cell) return STATUSES[0]
  const level = effectiveLevel(cell, now, decayOn)
  let status = STATUSES[1]
  for (const s of STATUSES) if (level >= s.min && s.min >= 0) status = s
  return status
}

export function todayKey(now = Date.now()) {
  const d = new Date(now)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function levelFromXp(xp) {
  return Math.floor(Math.sqrt(xp / 50)) + 1
}

export function xpForLevel(level) {
  return 50 * (level - 1) * (level - 1)
}

// Consecutive days with any practice, ending today (or yesterday if today is empty)
export function streakOf(days, now = Date.now()) {
  let streak = 0
  let t = now
  if (!days[todayKey(t)]) t -= DAY
  while (days[todayKey(t)]) {
    streak++
    t -= DAY
  }
  return streak
}

// Returns a new state with one answer applied to the (string, fret) card
export function applyAnswer(state, string, fret, correct, ms, now = Date.now()) {
  const key = cellKey(string, fret)
  const before = state.cells[key]
  const current = effectiveLevel(before, now, state.settings.decay)
  const fast = ms < 3000
  let level
  if (correct) level = Math.min(100, current + 12 + (fast ? 6 : 0))
  else level = Math.max(0, current - 15)
  const cell = {
    level,
    best: Math.max(before?.best ?? 0, level),
    reps: (before?.reps ?? 0) + 1,
    last: now,
  }
  const day = todayKey(now)
  const prevDay = state.days[day] ?? { n: 0, correct: 0 }
  return {
    ...state,
    xp: state.xp + (correct ? (fast ? 15 : 10) : 2),
    cells: { ...state.cells, [key]: cell },
    days: { ...state.days, [day]: { n: prevDay.n + 1, correct: prevDay.correct + (correct ? 1 : 0) } },
  }
}

// Choose the next card to quiz: weak, decayed and unseen cards come up more often
export function pickCard(state, strings, maxFret, lastKey, now = Date.now()) {
  const pool = []
  let total = 0
  for (const s of strings) {
    for (let f = 0; f <= maxFret; f++) {
      const key = cellKey(s, f)
      if (key === lastKey) continue
      const cell = state.cells[key]
      const level = cell ? effectiveLevel(cell, now, state.settings.decay) : null
      const weight = level === null ? 3 : 1 + (100 - level) / 20
      pool.push({ s, f, weight })
      total += weight
    }
  }
  if (!pool.length) return null
  let r = Math.random() * total
  for (const p of pool) {
    r -= p.weight
    if (r <= 0) return { s: p.s, f: p.f }
  }
  const last = pool[pool.length - 1]
  return { s: last.s, f: last.f }
}
