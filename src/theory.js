// Basic music theory helpers. Strings are indexed 0..5 from low E to high e.

export const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

export const OPEN_MIDI = [40, 45, 50, 55, 59, 64] // E2 A2 D3 G3 B3 E4
export const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e']
export const STRING_ORDINALS = ['low E', 'A', 'D', 'G', 'B', 'high e']

export const INLAYS = [3, 5, 7, 9, 12, 15]
export const MAX_FRET = 15

export const midiAt = (string, fret) => OPEN_MIDI[string] + fret
export const pcAt = (string, fret) => midiAt(string, fret) % 12
export const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12)

// "C#/Db" for accidentals, plain letter otherwise
export const noteLabel = (pc) => (SHARP[pc] === FLAT[pc] ? SHARP[pc] : `${SHARP[pc]}/${FLAT[pc]}`)

// Spell a note the way it would appear in a key: flats for F, Bb, Eb, Ab, Db, Gb
const FLAT_KEYS = new Set([1, 3, 5, 8, 10])
export const spell = (pc, keyRoot) => (FLAT_KEYS.has(keyRoot) ? FLAT[pc] : SHARP[pc])

export function chordName(root, quality) {
  return `${spell(root, root)}${quality.symbol}`
}

// Which frets on a string (within 0..maxFret) hold a given pitch class
export function fretsFor(string, pc, maxFret = MAX_FRET) {
  const out = []
  for (let f = 0; f <= maxFret; f++) if (pcAt(string, f) === pc) out.push(f)
  return out
}
