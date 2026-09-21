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

export const NATURAL_PCS = [0, 2, 4, 5, 7, 9, 11] // C D E F G A B

// Guitarists number strings from the thin one: 1st = high e ... 6th = low E
export const STRING_TITLES = ['6th (low E)', '5th (A)', '4th (D)', '3rd (G)', '2nd (B)', '1st (high e)']

// Octave shortcuts. Each pair is [from, to] in this app's string indexes
// (0 = low E ... 5 = high e); `fretDelta` is how the fret number changes
// (positive = toward the body, negative = toward the nut).
export const SHORTCUTS = [
  {
    id: 1,
    title: '2 strings over, 2 frets up',
    applies: 'Strings 6 and 5',
    pairs: [[0, 2], [1, 3]],
    fretDelta: 2,
    octaves: 1,
    rule: 'Start on the 6th or 5th string. Move 2 strings toward the high e and 2 frets toward the body (higher fret number). Same note, one octave higher.',
    why: 'Two strings over is 10 semitones (two perfect 4ths). Two more frets makes 12, a full octave.',
  },
  {
    id: 2,
    title: '2 strings over, 3 frets up',
    applies: 'Strings 4 and 3',
    pairs: [[2, 4], [3, 5]],
    fretDelta: 3,
    octaves: 1,
    rule: 'Start on the 4th or 3rd string. Move 2 strings toward the high e and 3 frets toward the body. Same note, one octave higher.',
    why: 'The gap between the G and B strings is only 4 semitones (not 5), so two strings over is 9 semitones. Three more frets makes 12.',
  },
  {
    id: 3,
    title: '3 strings over, 2 frets back',
    applies: 'Strings 5 and 4',
    pairs: [[1, 4], [2, 5]],
    fretDelta: -2,
    octaves: 1,
    rule: 'Start on the 5th or 4th string. Move 3 strings toward the high e and 2 frets toward the nut (lower fret number). Same note, one octave higher.',
    why: 'Three strings over is 14 semitones, which overshoots the octave by 2. Two frets back lands on 12.',
  },
  {
    id: 4,
    title: 'High e mirrors low E',
    applies: '6th and 1st string',
    pairs: [[0, 5]],
    fretDelta: 0,
    octaves: 2,
    rule: 'The 6th string (low E) and the 1st string (high e) are tuned two octaves apart, so any fret gives the same note on both. Same fret, same note, two octaves higher.',
    why: 'E to e is 24 semitones across all six strings, so the fret number does not change.',
  },
]
