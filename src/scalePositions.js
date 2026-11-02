// Scale positions (fingering shapes) worked out from the scale itself.
//
// Every position starts on a scale note on the low E string and climbs through the scale
// in pitch order, string by string, so each note appears exactly once and the shape bends
// around the B string the way real fingerings do. Strings are 0 (low E) .. 5 (high e).
import { OPEN_MIDI } from './theory.js'

// Positions may run a little past the 15th fret; the Scales page draws the neck long enough.
export const POS_MAX_FRET = 19
const MAX_FRET = POS_MAX_FRET

const B_SHIFT = (s) => (s >= 4 ? 1 : 0) // B and high e sit one fret further up the neck

// The scale's notes in pitch order from `startMidi` upward, as MIDI numbers.
function ascending(pcs, startMidi, top = OPEN_MIDI[5] + MAX_FRET) {
  const out = []
  for (let m = startMidi; m <= top; m++) if (pcs.includes(m % 12)) out.push(m)
  return out
}

/**
 * Walk the scale upward from (low E, fret f0). On each string take up to `cap` notes while
 * they stay within reach of the hand (`reach` frets above f0, one more on B/e); then move
 * to the next string. reach = Infinity means "exactly `cap` notes per string".
 */
function walk(pcs, f0, cap, reach) {
  const notes = []
  let s = 0
  let onString = 0
  for (const m of ascending(pcs, OPEN_MIDI[0] + f0)) {
    let f = m - OPEN_MIDI[s]
    const tooFar = f > f0 + reach + B_SHIFT(s)
    // move to the next string, unless the note is lower than that string's open note
    // (near the nut): then it has to stay on this string
    if ((onString >= cap || tooFar) && s < 5 && m - OPEN_MIDI[s + 1] >= 0) {
      s += 1
      onString = 0
      f = m - OPEN_MIDI[s]
    } else if (onString >= cap || tooFar) {
      if (s === 5) break
    }
    if (f > MAX_FRET) break
    notes.push({ s, f })
    onString += 1
  }
  // a shape must reach the top string to count as a full position
  return notes.some((n) => n.s === 5) ? notes : null
}

// Lowest fret (0-11) on the low E string for a pitch class.
const lowEFret = (pc) => (pc - OPEN_MIDI[0] % 12 + 12) % 12

// Which scale notes each box position starts on (as intervals above the root).
function boxStarts(intervals) {
  const has = (iv) => intervals.includes(iv)
  if (intervals.length <= 6) return [0, 3, 5, 7, 10].filter(has).length === 5 ? [0, 3, 5, 7, 10] : [0, 2, 4, 7, 9]
  if ([0, 2, 4, 7, 9].every(has)) return [0, 2, 4, 7, 9] // major-type: start on the major pentatonic notes
  if ([0, 3, 5, 7, 10].every(has)) return [0, 3, 5, 7, 10] // minor-type
  return [0, 2, 3, 4, 6].map((i) => intervals[i]) // anything else: five spread-out degrees
}

/** Place a shape low enough to fit on the neck: try its start fret 0-11, else 12 up. */
function fit(build, pc) {
  const f = lowEFret(pc)
  return build(f) ?? (f + 12 <= MAX_FRET ? build(f + 12) : null)
}

/**
 * Box positions 1-5: pentatonic boxes have 2 notes per string, 7-note scales 2-3 within a
 * four-fret reach. The blues scale is the minor pentatonic box plus its blue notes.
 */
export function boxPositions(root, scale) {
  const iv = scale.intervals
  const blues = scale.id === 'blues'
  const base = blues ? [0, 3, 5, 7, 10] : iv
  const pcs = base.map((i) => (root + i) % 12)
  const cap = base.length <= 6 ? 2 : 3
  const starts = boxStarts(base)
  const startPcs = starts.map((i) => (root + i) % 12)
  // 7-note box shapes usually begin one fret below their starting note on the low E string
  // when that fret is in the scale (e.g. C major at the 8th fret starts on the B at fret 7),
  // unless that note is where another position starts
  const startFret = (f0) => {
    const below = (OPEN_MIDI[0] + f0 - 1) % 12
    return cap === 3 && f0 >= 1 && pcs.includes(below) && !startPcs.includes(below) ? f0 - 1 : f0
  }
  return starts.map((start, i) => {
    let notes = fit((f0) => walk(pcs, startFret(f0), cap, 3), (root + start) % 12)
    if (notes && blues) notes = addBlueNotes(notes, root, iv)
    return notes && { n: i + 1, notes, from: Math.min(...notes.map((x) => x.f)), to: Math.max(...notes.map((x) => x.f)) }
  }).filter(Boolean)
}

// Add the blues scale's extra notes that fall inside (or one fret past) each string's part of a box.
function addBlueNotes(notes, root, intervals) {
  const extra = intervals.filter((i) => ![0, 3, 5, 7, 10].includes(i)).map((i) => (root + i) % 12)
  const out = [...notes]
  const have = new Set(notes.map((n) => OPEN_MIDI[n.s] + n.f))
  for (let s = 0; s < 6; s++) {
    const frets = notes.filter((n) => n.s === s).map((n) => n.f)
    if (!frets.length) continue
    for (let f = Math.min(...frets); f <= Math.max(...frets) + 1 && f <= MAX_FRET; f++) {
      const m = OPEN_MIDI[s] + f
      if (extra.includes(m % 12) && !have.has(m)) {
        out.push({ s, f })
        have.add(m)
      }
    }
  }
  return out
}

/** 3-notes-per-string positions (7-note scales): one starting on each scale degree. */
export function threeNpsPositions(root, scale) {
  const pcs = scale.intervals.map((i) => (root + i) % 12)
  return scale.intervals.map((start, i) => {
    const notes = fit((f0) => walk(pcs, f0, 3, Infinity), (root + start) % 12)
    return notes && { n: i + 1, notes, from: Math.min(...notes.map((x) => x.f)), to: Math.max(...notes.map((x) => x.f)) }
  }).filter(Boolean)
}
