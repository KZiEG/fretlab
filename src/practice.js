// Practice tab content: the daily routine and the built-in Guitar Project pathways.

// The daily 20-minute routine: four 5-minute blocks.
export const ROUTINE = [
  {
    id: 'neck',
    title: 'Know the neck',
    minutes: 5,
    what: 'Name and find notes in the Trainer. Knowing where notes are is what lets you choose melody notes on purpose.',
    link: '#/trainer',
    linkLabel: 'Open Trainer',
  },
  {
    id: 'scale',
    title: 'Scale practice',
    minutes: 5,
    what: 'One scale position, slowly, with the metronome. Clean, even notes matter more than speed.',
    link: '#/scales',
    linkLabel: 'Open Scales',
  },
  {
    id: 'ear',
    title: 'Ear & melody',
    minutes: 5,
    what: 'Work out a few notes of a melody by ear: hum it, find the first note, then go up or down until it matches.',
  },
  {
    id: 'improv',
    title: 'Improvise',
    minutes: 5,
    what: 'Loop two chords (ME-90 phrase loop) and improvise over them, focusing on one phrasing technique.',
    link: '#/rig',
    linkLabel: 'Open Rig',
  },
]

// A pathway: stages in order. Each stage has key concepts, tasks to tick off, a milestone
// that says you're ready to move on, tools in the app, and a suggestion for each routine block.
export const PATHWAYS = [
  {
    id: 'melodic',
    name: 'Melodic guitar',
    goal: 'Play lines that sing like a voice: choose notes on purpose, make them expressive, and play melodies you hear in your head.',
    overview: [
      'Melody is about choosing notes, so it starts with knowing where they are on the neck.',
      'Learn one scale deeply before adding more. The minor pentatonic is the easiest place to start because it’s hard to hit a bad note.',
      'Expression (vibrato, slides, bends, space) turns correct notes into music. Work on one technique at a time.',
      'Learn real melodies by ear, especially vocal lines: they teach phrasing better than guitar solos.',
      'Aim for chord tones: melodies sound strongest when they land on notes of the chord underneath.',
      'Little and often wins: 20 focused minutes a day beats a long session once a week.',
    ],
    stages: [
      {
        id: 'neck',
        title: 'Know the notes on the neck',
        summary: 'Find any natural note on the two lowest strings without counting frets, and see the same note in other places.',
        concepts: [
          'The musical alphabet is A B C D E F G. Between most letters there is a sharp/flat (1 fret); B–C and E–F are only 1 fret apart.',
          'Fret 12 is the octave: the same notes start again, one octave higher.',
          'Octave shapes (2 strings over, 2 frets up, and so on) let you find a note in several places without counting.',
          'Root notes on the low E and A strings are the anchors for scales and chords.',
        ],
        tasks: [
          { id: 't1', text: 'Trainer “Name the note” on the 6th and 5th strings, 5 minutes a day for a week' },
          { id: 't2', text: 'Find every A, C and G on the 6th string without counting' },
          { id: 't3', text: 'Learn the four octave shortcuts (Fretboard → Octave shortcuts)' },
          { id: 't4', text: 'Complete timed drill 1 (naturals along a string) on the 6th and 5th strings' },
        ],
        milestone: 'Name any note on the 6th and 5th strings (frets 0–12) in under 2 seconds.',
        tools: [['#/trainer', 'Trainer'], ['#/fretboard', 'Fretboard drills']],
        suggest: {
          neck: 'Name the note on the 6th and 5th strings, frets 0–12.',
          scale: 'Play the A natural notes up and down the 6th string with the metronome at 60 BPM.',
          ear: 'Hum a note, then find it on the 6th string.',
          improv: 'Loop an A minor chord and play only A, C, D, E, G anywhere on the 6th string.',
        },
      },
      {
        id: 'minpent',
        title: 'Minor pentatonic, box 1',
        summary: 'Own the minor pentatonic in one position and start making short phrases with it.',
        concepts: [
          'A pentatonic scale has 5 notes; minor pentatonic = 1 ♭3 4 5 ♭7 (in A: A C D E G).',
          'Its pattern of steps is W+H W W W+H W: no half steps, which is why nothing clashes.',
          'Box 1 sits with the root under your first finger on the 6th string (A at fret 5).',
          'The root note is “home”: phrases that end on it sound finished.',
        ],
        tasks: [
          { id: 't1', text: 'Play A minor pentatonic box 1 up and down at 60 BPM, one note per beat' },
          { id: 't2', text: 'Same at 80 BPM in eighth notes, every note clean' },
          { id: 't3', text: 'Make up five 3–4 note phrases that end on the root' },
          { id: 't4', text: 'Play box 1 in two other keys (move it to E at fret 12 and G at fret 3)' },
        ],
        milestone: 'Improvise for one minute over an A minor loop using box 1, ending phrases on A.',
        tools: [['#/scales', 'Scales (A, Minor pentatonic)']],
        suggest: {
          neck: 'Find every A on the neck, then every E.',
          scale: 'A minor pentatonic box 1, up and down, 60 → 80 BPM.',
          ear: 'Hum a 3-note phrase, then find it in box 1.',
          improv: 'Loop Am for 4 bars; play short phrases from box 1 and end each on A.',
        },
      },
      {
        id: 'phrasing',
        title: 'The phrasing toolkit',
        summary: 'Make notes expressive: vibrato, slides, bends, hammer-ons, pull-offs, and space.',
        concepts: [
          'Vibrato (a steady wiggle on a held note) is the single biggest difference between a beginner and a singer-like tone.',
          'Bends must reach the right pitch: check a bend against the fretted note it’s aiming for.',
          'Hammer-ons and pull-offs connect notes smoothly (legato), like a singer joining words.',
          'Space is part of melody: a phrase is a sentence, and the gap after it lets it land.',
          'Call and response: play a phrase, then answer it with a variation.',
        ],
        tasks: [
          { id: 't1', text: 'Vibrato: hold a note for 4 beats with even vibrato (fingers 1, 2 and 3)' },
          { id: 't2', text: 'Slides: slide into notes from 2 frets below, in time' },
          { id: 't3', text: 'Bends: whole-step bend on the 3rd string, matched to the fretted target note' },
          { id: 't4', text: 'Hammer-ons/pull-offs across box 1, two notes per string' },
          { id: 't5', text: 'Call and response: 10 pairs of phrases with a 2-beat gap between them' },
        ],
        milestone: 'A 30-second improvisation over a loop using at least three techniques, with clear gaps between phrases.',
        tools: [['#/scales', 'Scales'], ['#/home', 'Metronome']],
        suggest: {
          neck: 'Find the notes of your phrases on a second string set.',
          scale: 'Box 1 with a hammer-on or pull-off on every string.',
          ear: 'Sing a phrase, play it back with a slide into the last note.',
          improv: 'Technique of the day: vibrato on every last note of a phrase.',
        },
      },
      {
        id: 'majpent',
        title: 'Major pentatonic and relative keys',
        summary: 'Use the same shapes for a brighter, happier sound by changing which note is home.',
        concepts: [
          'Major pentatonic = 1 2 3 5 6 (in C: C D E G A).',
          'A minor pentatonic and C major pentatonic contain the same notes; they are relatives. What changes is which note feels like home.',
          'Minor sounds sad or tough, major sounds sweet and open: the same shape, a different mood.',
        ],
        tasks: [
          { id: 't1', text: 'Play C major pentatonic in the same box, starting and ending on C' },
          { id: 't2', text: 'Over a C major loop, play phrases ending on C; over Am, end on A' },
          { id: 't3', text: 'Find the relative major/minor of G minor and E minor' },
        ],
        milestone: 'Switch between a major and minor feel over two different loops using one box.',
        tools: [['#/scales', 'Scales (C, Major pentatonic)']],
        suggest: {
          neck: 'Find every C on the neck.',
          scale: 'C major pentatonic, same box as A minor pentatonic, start and end on C.',
          ear: 'Work out a simple happy tune (e.g. a nursery rhyme) in C.',
          improv: 'Loop C – G; play phrases that end on C, E or G.',
        },
      },
      {
        id: 'ear',
        title: 'Learn melodies by ear',
        summary: 'Hear a melody, then find it on the guitar: the core skill of melodic playing.',
        concepts: [
          'Method: hum the line, find the first note, then ask “up or down? a little or a lot?” for each next note.',
          'Intervals are the distances between notes; learning a few by sound (e.g. a step, a jump of 3 frets, an octave) speeds this up hugely.',
          'Vocal melodies teach phrasing and space better than guitar solos.',
          'Start slow: get 4 notes right, then the next 4.',
        ],
        tasks: [
          { id: 't1', text: 'Work out “Happy Birthday” by ear' },
          { id: 't2', text: 'Work out “Twinkle Twinkle Little Star” in two different places on the neck' },
          { id: 't3', text: 'Work out the chorus melody of a song you love (vocal line)' },
          { id: 't4', text: 'Play that melody along with the recording (stream it through the ME-90)' },
        ],
        milestone: 'Play the full vocal melody of one song you like, by ear, along with the recording.',
        tools: [['#/rig', 'Rig → ME-90 (Bluetooth audio for play-along)']],
        suggest: {
          neck: 'Find the first note of today’s melody in three places.',
          scale: 'Play the scale the melody uses (major or minor pentatonic).',
          ear: 'Next 4 notes of your song’s melody.',
          improv: 'Play your melody, then improvise a variation of it.',
        },
      },
      {
        id: 'fullscales',
        title: 'Full major and minor scales',
        summary: 'Add the two missing notes for more colour, tension and release.',
        concepts: [
          'Natural minor = 1 2 ♭3 4 5 ♭6 ♭7 (pattern W H W W H W W); major = 1 2 3 4 5 6 7 (W W H W W W H).',
          'The extra notes add tension (they want to move); landing on 1, 3 or 5 releases it.',
          'Scale degrees (1–7) let you think about any key the same way.',
        ],
        tasks: [
          { id: 't1', text: 'A natural minor in one position, up and down at 70 BPM' },
          { id: 't2', text: 'C major in one position, up and down at 70 BPM' },
          { id: 't3', text: 'Play box 1 pentatonic, then add the two extra notes and hear the difference' },
          { id: 't4', text: 'Use the Scale degrees view to say the degree of each note you play' },
        ],
        milestone: 'Improvise over Am – F – C – G using A natural minor, using the extra notes as passing tension.',
        tools: [['#/scales', 'Scales (A Natural minor, C Major)']],
        suggest: {
          neck: 'Name the notes of A natural minor on the 5th string.',
          scale: 'A natural minor, one position, 70 BPM.',
          ear: 'Work out a melody that uses a note outside the pentatonic.',
          improv: 'Loop Am – F; use the ♭6 (F) as a note that pulls back down to E.',
        },
      },
      {
        id: 'chordtones',
        title: 'Target the chord tones',
        summary: 'Make melodies follow the chords by landing on chord notes at each change.',
        concepts: [
          'A triad is three notes: root, 3rd and 5th. Chord tones sound stable over their chord.',
          'Notes between chord tones are passing notes: fine in between, but land on chord tones on strong beats.',
          'When the chord changes, moving to the nearest chord tone sounds smooth and intentional.',
        ],
        tasks: [
          { id: 't1', text: 'Learn the triad shapes for Am, F, C and G on the top 3 strings (Chords → Triads)' },
          { id: 't2', text: 'Over Am – F – C – G, play only chord tones, one note per chord' },
          { id: 't3', text: 'Same loop: move to the nearest chord tone at each change' },
          { id: 't4', text: 'Add passing notes between the chord tones' },
        ],
        milestone: 'A melody over a four-chord loop that clearly follows the chords.',
        tools: [['#/chords', 'Chords → Triads']],
        suggest: {
          neck: 'Find the root, 3rd and 5th of Am and C on the top strings.',
          scale: 'Arpeggiate Am – F – C – G with triads, one beat each.',
          ear: 'Hum a line over Am – F – C – G, then find its notes.',
          improv: 'Land on a chord tone on beat 1 of every chord.',
        },
      },
      {
        id: 'connect',
        title: 'Connect the whole neck',
        summary: 'Link scale boxes and play the same melody in several places.',
        concepts: [
          'Each scale has several overlapping boxes; neighbouring boxes share notes.',
          'Playing along one string (horizontal) shows how the boxes connect.',
          'The same melody in a different place changes its tone: higher and thinner, or lower and warmer.',
        ],
        tasks: [
          { id: 't1', text: 'Learn A minor pentatonic box 2 and move between box 1 and 2' },
          { id: 't2', text: 'Play A minor pentatonic along a single string from fret 0 to 12' },
          { id: 't3', text: 'Play your ear-learned melody in three places on the neck' },
        ],
        milestone: 'Improvise from fret 3 to fret 15 without stopping, sliding between boxes.',
        tools: [['#/scales', 'Scales (positions)'], ['#/fretboard', 'Octave shortcuts']],
        suggest: {
          neck: 'Octave shortcuts: find each melody note an octave up.',
          scale: 'A minor pentatonic box 1 → box 2 → back, 70 BPM.',
          ear: 'Your melody, starting from a different string.',
          improv: 'Start a phrase in box 1 and finish it in box 2.',
        },
      },
      {
        id: 'modes',
        title: 'Colour with modes',
        summary: 'Two modes that add distinct moods to melodies.',
        concepts: [
          'Dorian = natural minor with a raised 6th: minor but hopeful (soul, funk, many folk tunes).',
          'Mixolydian = major with a ♭7: bright but bluesy (rock, country).',
          'A mode sounds like itself over the right chords: Dorian over Am – D, Mixolydian over G – F.',
        ],
        tasks: [
          { id: 't1', text: 'Play A Dorian and hear the F♯ against A natural minor' },
          { id: 't2', text: 'Improvise A Dorian over a loop of Am – D' },
          { id: 't3', text: 'Improvise G Mixolydian over a loop of G – F' },
        ],
        milestone: 'Make Dorian and Mixolydian sound different from plain minor and major over their loops.',
        tools: [['#/scales', 'Scales (Dorian, Mixolydian)']],
        suggest: {
          neck: 'Find the 6th note of A (F♯) everywhere in box 1.',
          scale: 'A Dorian, one position.',
          ear: 'Find a melody you know that uses the Dorian 6th.',
          improv: 'Loop Am – D; lean on F♯.',
        },
      },
      {
        id: 'capstone',
        title: 'Capstone: your own melody',
        summary: 'Write, polish and record a melody that is yours.',
        concepts: [
          'Good melodies repeat and vary: state an idea, repeat it, change it, resolve it.',
          'Shape matters: build to one high point, then come home.',
          'The sound supports the melody: pick or build an ME-90 patch that fits the mood.',
        ],
        tasks: [
          { id: 't1', text: 'Choose a four-chord loop and a key' },
          { id: 't2', text: 'Write an 8-bar melody: idea, repeat, variation, ending on the root' },
          { id: 't3', text: 'Extend it to 16 bars with one high point' },
          { id: 't4', text: 'Dial in and save an ME-90 patch for it' },
          { id: 't5', text: 'Record it (phone recording is fine) and listen back' },
        ],
        milestone: 'A recorded 16-bar melody over your loop that you’re happy to play for someone.',
        tools: [['#/rig', 'Rig → ME-90 → Sounds'], ['#/home', 'Metronome']],
        suggest: {
          neck: 'Find your melody’s notes in a second position.',
          scale: 'Play the scale of your melody’s key at your song’s tempo.',
          ear: 'Hum the next 2 bars of your melody, then find them.',
          improv: 'Play your melody, then improvise a solo over the same loop.',
        },
      },
    ],
  },
]

// ---- helpers

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function addDays(key, n) {
  const [y, m, d] = key.split('-').map(Number)
  return dayKey(new Date(y, m - 1, d + n))
}

/** Days in a row (ending today or yesterday) with at least one routine block done. */
export function practiceStreak(days, today = dayKey()) {
  const did = (k) => Object.values(days[k]?.blocks ?? {}).some(Boolean)
  let k = did(today) ? today : addDays(today, -1)
  let n = 0
  while (did(k)) {
    n += 1
    k = addDays(k, -1)
  }
  return n
}

/** Turn a user-made project into the same shape as a built-in pathway. */
export function customToPathway(c) {
  return {
    id: c.id,
    custom: true,
    name: c.name,
    goal: c.goal,
    overview: [],
    stages: [
      {
        id: 'steps',
        title: 'Steps',
        summary: '',
        concepts: [],
        tasks: c.steps.map((text, i) => ({ id: `s${i}`, text })),
        milestone: c.goal,
        tools: [],
        suggest: {},
      },
    ],
  }
}

export const allTasks = (p) => p.stages.flatMap((s) => s.tasks.map((t) => `${s.id}/${t.id}`).concat(`${s.id}/milestone`))
