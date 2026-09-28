// Rig tab content: effects on the BOSS Waza-Air, how they work and what pairs well.
// Section and knob names follow the BOSS Tone Studio app for the Waza-Air; the
// starter settings are starting points to tweak by ear, not exact presets.

export const DEVICE = {
  name: 'BOSS Waza-Air',
  // the app's default order, guitar on the left
  chain: ['Booster', 'Amp', 'Mod', 'FX', 'Delay', 'Reverb'],
}

// 60000 ms per minute / BPM, times the note length in beats
export const DELAY_NOTES = [
  ['Quarter', 1],
  ['Dotted eighth', 0.75],
  ['Eighth', 0.5],
  ['Triplet eighth', 1 / 3],
]
export const delayMs = (bpm, beats) => Math.round((60000 / bpm) * beats)

export const EFFECTS = [
  {
    id: 'delay',
    name: 'Delay',
    section: 'Delay',
    summary:
      'Repeats what you play a moment later, like an echo. Short, single repeats thicken a sound; longer repeats that fade out add space and rhythm.',
    chain:
      'Near the end: after drive and modulation, before reverb. The repeats then carry your whole tone, and the reverb sits around both the notes and the echoes.',
    controls: [
      ['Time', 'How long until each repeat, in milliseconds. Under ~150 ms is a slapback; 300–500 ms is a classic lead echo.'],
      ['Feedback', 'How many repeats. Low = one or two, high = a long trail. Near the top it can run away into a wash.'],
      ['E.Level', 'How loud the repeats are compared with your guitar. Keep it under your dry note so the echoes sit behind you.'],
      ['High Cut', 'Darkens the repeats so they don’t fight the notes you are playing now. Lower = warmer, more tape-like.'],
    ],
    types: [
      ['Digital', 'Clean, exact copies of your note. The most “in tune” and modern.'],
      ['Analog', 'Each repeat gets darker and softer. Warm and forgiving under leads.'],
      ['Tape Echo', 'Warm, slightly wobbly repeats like an old tape machine. Great for slapback.'],
      ['Modulate', 'Repeats with a gentle chorus-like shimmer. Dreamy and wide.'],
      ['Reverse', 'Plays the repeats backwards. A special effect, best on slow notes.'],
    ],
    tips: [
      'Set the time to the song’s tempo (see the calculator) so the echoes land on the beat instead of blurring it.',
      'If fast playing turns to mush, drop Feedback or E.Level before touching anything else.',
      'Dotted-eighth delay at the song tempo turns simple eighth notes into a rolling, busier rhythm.',
    ],
    pairings: [
      {
        with: 'Reverb',
        feel: 'Vintage slapback',
        why: 'Delay and reverb both add space, but together they sound bigger than either alone. Keep the delay short and low for a tape-style slapback and let a warm spring reverb fill in behind it.',
        settings: [
          { section: 'Amp', type: 'Clean', params: [['Gain', 30], ['Volume', 50]] },
          { section: 'Delay', type: 'Tape Echo', params: [['Time', '120 ms'], ['Feedback', 10], ['E.Level', 40]] },
          { section: 'Reverb', type: 'Spring', params: [['Time', 35], ['E.Level', 30], ['High Cut', 35]] },
        ],
      },
      {
        with: 'Overdrive / distortion',
        feel: 'Singing lead',
        why: 'Delay after drive lets sustained lead notes trail off into echoes. Analog-style repeats get darker as they fade, so they stay behind the lead instead of clashing with the next note.',
        settings: [
          { section: 'Amp', type: 'Lead', params: [['Gain', 60], ['Volume', 50]] },
          { section: 'Delay', type: 'Analog', params: [['Time', '380 ms'], ['Feedback', 30], ['E.Level', 30]] },
        ],
      },
      {
        with: 'Chorus',
        feel: 'Ambient clean',
        why: 'Chorus spreads the note out and the delay repeats that spread, so clean chords and arpeggios float. Add a little reverb on top for an even bigger space.',
        settings: [
          { section: 'Amp', type: 'Clean', params: [['Gain', 25], ['Volume', 50]] },
          { section: 'Mod', type: 'Chorus', params: [['Rate', 30], ['Depth', 50]] },
          { section: 'Delay', type: 'Digital', params: [['Time', '450 ms'], ['Feedback', 40], ['E.Level', 35]] },
          { section: 'Reverb', type: 'Hall', params: [['E.Level', 25]] },
        ],
      },
      {
        with: 'Compressor',
        feel: 'Rhythmic echo',
        why: 'A compressor evens out your picking so every repeat comes back at the same level. That makes a tempo-synced dotted-eighth delay sound tight and even.',
        settings: [
          { section: 'Amp', type: 'Clean', params: [['Gain', 30], ['Volume', 50]] },
          { section: 'Mod', type: 'Compressor', params: [['Sustain', 50], ['Level', 50]] },
          { section: 'Delay', type: 'Digital', params: [['Time', '375 ms'], ['Feedback', 35], ['E.Level', 40]] },
        ],
        note: '375 ms is a dotted eighth at 120 BPM. Use the calculator for other tempos.',
      },
    ],
  },
  {
    id: 'reverb',
    name: 'Reverb',
    section: 'Reverb',
    summary:
      'The sound of a room: your note bouncing off walls and fading away. It is the final layer that makes a dry guitar sound like it is being played somewhere.',
    chain: 'Typically last in the chain, the final layer over everything else. It goes well with almost every other effect.',
    controls: [
      ['Time', 'How long the reverb takes to die away. Short = small room, long = big hall.'],
      ['Pre-Delay', 'A short gap before the reverb starts, which keeps the attack of each note clear.'],
      ['E.Level', 'How much reverb is mixed in. A little goes a long way.'],
      ['High Cut', 'Turn it down for a warmer, darker reverb that stays out of the way.'],
    ],
    types: [
      ['Spring', 'The drippy, bouncy reverb built into vintage amps. Surf, blues and rockabilly.'],
      ['Room', 'A small, natural space. Adds life without sounding “effected”.'],
      ['Hall', 'A big, smooth space. Lush for clean chords and slow leads.'],
      ['Plate', 'Bright and dense, the classic studio reverb.'],
    ],
    tips: [],
    pairings: [
      {
        with: 'Delay',
        feel: 'Vintage slapback',
        why: 'Tape echo and spring reverb are close cousins, and reverb and delay often do similar jobs, but they go well combined. Set the delay for a traditional tape-style slapback (time and feedback short and low), then put the reverb on its spring voicing, or turn the tone down for a warm reverberation.',
        settings: [
          { section: 'Delay', type: 'Tape Echo', params: [['Time', '120 ms'], ['Feedback', 10], ['E.Level', 40]] },
          { section: 'Reverb', type: 'Spring', params: [['Time', 35], ['E.Level', 30], ['High Cut', 35]] },
        ],
      },
      {
        with: 'Overdrive / distortion',
        feel: 'Bluesy',
        why: 'Reverb takes the edge off the harshness of overdrive and distortion. The drive brings the energy and the reverb calms it down, which gives a bluesy feel.',
        settings: [
          { section: 'Amp', type: 'Crunch', params: [['Gain', 55], ['Volume', 50]] },
          { section: 'Reverb', type: 'Room', params: [['Time', 40], ['E.Level', 30]] },
        ],
      },
      {
        with: 'Tremolo',
        feel: 'Vintage',
        why: 'Tremolo and reverb together create vintage sounds. The reverb smooths out how choppy and overbearing the tremolo can be on its own.',
        settings: [
          { section: 'Amp', type: 'Clean', params: [['Gain', 25], ['Volume', 50]] },
          { section: 'Mod', type: 'Tremolo', params: [['Rate', 45], ['Depth', 60]] },
          { section: 'Reverb', type: 'Spring', params: [['Time', 45], ['E.Level', 35]] },
        ],
      },
      {
        with: 'Synth',
        feel: 'Atmospheric',
        why: 'Synth sounds pair well with pitch-shifting (“shimmer”) reverbs, which add octaves above the reverb tail.',
        note: 'Check the Tone Studio app for whether your Waza-Air has a synth or pitch-shifting option; if it doesn’t, this pairing is one for other gear.',
      },
    ],
  },
]
