// BOSS ME-90 guide content, written in our own words from the ME-90 Parameter Guide.
// Type and knob names are the labels printed on the pedal. Each type lists what the
// section's knobs (1, 2, 3...) do for that type. Most knobs run 0-99.

export const ME90 = {
  name: 'BOSS ME-90',
  // signal flow, guitar on the left; the SEND/RETURN loop sits right after the PREAMP
  chain: ['PEDAL FX', 'COMP/FX1', 'OD/DS', 'PREAMP', 'SEND/RETURN', 'EQ/FX2', 'NS', 'VOLUME', 'MOD', 'DELAY', 'REVERB'],
}

// Knob value 0-10 drawn as a clock position: 0 = 7 o'clock (all the way down),
// 5 = 12 o'clock, 10 = 5 o'clock (all the way up).
export function clockLabel(v) {
  const hour = ((7 + Math.floor(v) - 1) % 12) + 1
  return Number.isInteger(v) ? `${hour} o'clock` : `half past ${hour}`
}

const SAME = (types, knobs) => types.map(([name, what]) => ({ name, what, knobs }))
const MOD3 = ['RATE: speed', 'DEPTH: how deep', 'E.LEVEL: effect volume']
const DLY3 = ['TIME: delay time (10–800 ms)', 'FEEDBACK: number of repeats', 'E.LEVEL: volume of repeats']
const NONE = '—'

export const SECTIONS = [
  {
    id: 'pedalfx',
    name: 'PEDAL FX',
    title: 'Pedal effects',
    switch: 'Press the toe of the expression pedal down hard to turn it on or off. When it’s off, the pedal is a volume pedal.',
    summary:
      'Effects you play with your foot: rocking the expression pedal sweeps the effect while you play.',
    knobLabels: [],
    types: [
      { name: 'WAH', what: 'Classic wah: rock the pedal for the vocal "wow" sweep.', knobs: [] },
      { name: 'VOICE', what: 'A talking, vowel-like sweep, as if the guitar were speaking.', knobs: [] },
      { name: '+1 OCT', what: 'Bends the pitch smoothly up to an octave above. Single notes only.', knobs: [] },
      { name: '+2 OCT', what: 'Bends the pitch up to two octaves above. Single notes only.', knobs: [] },
      { name: '-1 OCT', what: 'Bends the pitch down by up to an octave. Single notes only.', knobs: [] },
      { name: '-2 OCT', what: 'Bends the pitch down by up to two octaves. Single notes only.', knobs: [] },
      { name: 'FREEZE', what: 'Holds whatever you are playing at the moment you stomp it, like endless sustain.', knobs: [] },
      { name: 'OSC DELAY', what: 'Pushes a delay into runaway, swirling oscillation with one foot movement.', knobs: [] },
      { name: 'OD/DS', what: 'Pedal controls how much drive OD/DS adds. The DRIVE knob sets the most you can reach.', knobs: [] },
      { name: 'MOD RATE', what: 'Pedal controls the speed of the MOD effect. The MOD RATE knob sets the top speed.', knobs: [] },
      { name: 'DELAY LEVEL', what: 'Pedal fades the delay repeats in and out. The DELAY E.LEVEL knob sets the maximum.', knobs: [] },
    ],
  },
  {
    id: 'comp',
    name: 'COMP/FX1',
    title: 'Compressor / Effect 1',
    switch: 'Number pedal 1 (COMP) turns it on and off in manual or memory edit mode.',
    summary:
      'The first effect after the pedal. Use it as a compressor to even out your volume and add clean sustain, or pick one of the special effects that work best early in the chain.',
    knobLabels: ['1', '2', '3'],
    types: [
      { name: 'COMP', what: 'Evens out loud and quiet notes for smooth sustain without dirt; also tames sudden peaks.', knobs: ['SUSTAIN: how long notes ring', 'ATTACK: how sharp the pick attack stays', 'LEVEL: output volume'] },
      { name: 'T.WAH UP', what: 'An auto-wah that opens up the harder you pick.', knobs: ['SENS: how strongly it reacts to picking', 'TONE: how bright the wah is', 'PEAK: how pronounced the wah is'] },
      { name: 'SLOW GEAR', what: 'Hides the pick attack so notes swell in like a violin.', knobs: ['SENS: how easily the swell triggers', 'ATTACK: how long each swell takes', 'LEVEL: output volume'] },
      { name: 'DEFRETTER', what: 'Makes the guitar sound like a fretless instrument.', knobs: ['SENS: how strongly it reacts to picking', 'TONE: brightness', 'LEVEL: output volume'] },
      { name: 'OCTAVE', what: 'Adds notes one and two octaves below for a big low end.', knobs: ['-1 OCT LEVEL: octave below', '-2 OCT LEVEL: two octaves below', 'DIRECT LEVEL: your normal note'] },
      { name: 'HUMANIZER', what: 'Makes the guitar "sing" vowels, moving between two vowel sounds as you pick.', knobs: ['SENS: how strongly it reacts to picking', 'VOWEL1: first vowel (a, e, i, o, u)', 'VOWEL2: second vowel'] },
      { name: 'FEEDBACKER', what: 'Creates controlled feedback while you hold the pedal down.', knobs: [NONE, 'DEPTH: how easily feedback kicks in', NONE] },
      { name: 'AC SIM', what: 'Makes an electric guitar sound closer to an acoustic.', knobs: ['LOW: bass', 'HIGH: treble', 'LEVEL: output volume'] },
      { name: 'SOLO', what: 'Shapes the tone to cut through for leads. Use with OD/DS or PREAMP on.', knobs: ['LOW: bass', 'HIGH: treble', 'LEVEL: output volume'] },
      { name: 'TUNE DOWN', what: 'Lowers your pitch as if you had tuned down, without retuning.', knobs: ['PITCH: how many semitones down (0 to -12)', NONE, NONE] },
      { name: 'S-BEND', what: 'A big pitch swoop up or down while you hold the pedal, beyond what a whammy bar can do.', knobs: ['PITCH: how far, in octaves', 'RISE TIME: how fast it bends', 'FALL TIME: how fast it returns'] },
    ],
    swapSlot: 11,
    swaps: [
      { name: 'D-COMP', what: 'A compressor in the style of the MXR Dyna Comp.', knobs: ['SUSTAIN: how long notes ring', 'ATTACK: how sharp the pick attack stays', 'LEVEL: output volume'] },
      { name: 'RING MOD', what: 'Mixes your note with an internal tone for clangy, bell-like sounds.', knobs: ['FREQ: pitch of the internal tone', 'DIRECT LEVEL: your normal note', 'MOD LEVEL: the effect'] },
      { name: 'POLY OCTAVE', what: 'An octave-down that works with chords too.', knobs: ['RANGE: which notes get the octave', '-1 OCT LEVEL: octave below', 'DIRECT LEVEL: your normal note'] },
      { name: 'T.WAH DOWN', what: 'An auto-wah that closes as you pick harder.', knobs: ['SENS: how strongly it reacts to picking', 'TONE: how bright the wah is', 'PEAK: how pronounced the wah is'] },
      { name: 'Single > Hum', what: 'Gives single-coil pickups a thicker humbucker sound.', knobs: ['LOW: bass', 'HIGH: treble', 'LEVEL: output volume'] },
      { name: 'Hum > Single', what: 'Gives humbuckers a brighter single-coil sound.', knobs: ['LOW: bass', 'HIGH: treble', 'LEVEL: output volume'] },
    ],
  },
  {
    id: 'odds',
    name: 'OD/DS',
    title: 'Overdrive / Distortion',
    switch: 'Number pedal 2 (OD/DS) turns it on and off in manual or memory edit mode.',
    summary: 'Adds grit, crunch or full distortion, from a light push to metal and fuzz. Every type uses the same three knobs.',
    knobLabels: ['1', '2', '3'],
    sharedKnobs: true,
    types: SAME(
      [
        ['BOOST', 'A mid-focused boost. Great in front of an AIRD preamp for solos.'],
        ['OVERDRIVE', 'Smooth overdrive based on the BOSS SD-1.'],
        ['T-SCREAM', 'The mid-heavy overdrive of the Ibanez Tube Screamer (TS-808).'],
        ['CENTA OD', 'A transparent, open-sounding overdrive in the style of the Klon Centaur.'],
        ['BLUES OD', 'Touch-sensitive drive based on the BOSS BD-2 Blues Driver.'],
        ['DISTORTION', 'Classic BOSS DS-1 distortion.'],
        ['TURBO DS', 'Distortion with a pushed midrange, like the BOSS DS-2 in turbo mode.'],
        ['RAT DS', 'Gritty, aggressive distortion in the style of the ProCo RAT.'],
        ['METAL DS', 'High-gain metal distortion based on the BOSS Metal Zone (MT-2).'],
        ['CORE', 'Tight, aggressive high gain for fast metal riffs (BOSS ML-2).'],
        ['MUFF FUZZ', 'Thick, woolly fuzz in the style of the Electro-Harmonix Big Muff.'],
      ],
      ['DRIVE: how much distortion', 'TONE: brightness', 'LEVEL: output volume'],
    ),
    swapSlot: 11,
    swaps: SAME(
      [
        ['CLEAN BOOST', 'A clean volume push that also makes a punchy clean tone on its own.'],
        ['TREBLE BOOST', 'A bright boost that sharpens the top end.'],
        ['OD-1', 'Sweet, mild overdrive based on the BOSS OD-1.'],
        ['TURBO OD', 'A stronger overdrive, like the BOSS OD-2 in turbo mode.'],
        ['GUV DS', 'Distortion in the style of the Marshall Guv’nor.'],
        ['’60S FUZZ', 'Vintage fuzz in the style of the Fuzz Face.'],
        ['OCT FUZZ', 'Fuzz with a note an octave higher mixed in, inspired by the Octavia.'],
      ],
      ['DRIVE: how much distortion', 'TONE: brightness', 'LEVEL: output volume'],
    ),
  },
  {
    id: 'preamp',
    name: 'PREAMP',
    title: 'Preamp (AIRD amp sound)',
    switch: 'The BANK ▼ (AMP) pedal turns it on and off in manual or memory edit mode.',
    summary:
      'The "amp" of your sound. Pick an amp character, then set its gain and EQ like a real amp. Turn it off when you plug into a real amp’s front input or use the 4-cable method. Every type uses the same five knobs.',
    knobLabels: ['1', '2', '3', '4', '5'],
    sharedKnobs: true,
    types: SAME(
      [
        ['NATURAL', 'A plain, neutral clean sound without harsh treble or boomy bass.'],
        ['X-CRUNCH', 'A crisp crunch where every string stays clear.'],
        ['X-HI GAIN', 'Wide-range high gain that keeps notes separated.'],
        ['MAXIMUM', 'Vintage Marshall-style tone and response, pushed to higher gain.'],
        ['JUGGERNAUT', 'A huge stack sound tuned for modern metal.'],
        ['X-MODDED', 'Extreme gain that still keeps notes defined.'],
        ['TWIN COMBO', 'Sparkling clean in the style of a Fender Twin Reverb.'],
        ['TWEED COMBO', 'Warm vintage crunch in the style of a Fender Bassman.'],
        ['DIAMOND', 'Chimey crunch in the style of a VOX AC30.'],
        ['BRIT STACK', 'Classic hard-rock crunch in the style of a Marshall 1959.'],
        ['RECTI STACK', 'Heavy modern gain in the style of a Mesa/Boogie Dual Rectifier.'],
      ],
      ['GAIN: amount of distortion', 'BASS: low end', 'MIDDLE: midrange', 'TREBLE: high end', 'LEVEL: overall volume'],
    ),
    swapSlot: 11,
    swaps: SAME(
      [
        ['TRANSPARENT', 'Very flat and full-range; good for acoustic guitar.'],
        ['BOUTIQUE', 'A crunch that follows your picking dynamics closely.'],
        ['SUPREME', 'A responsive crunch with the weight of a 4×12 cabinet.'],
        ['JC-120', 'The bright, clean Roland JC-120 sound.'],
        ['DELUXE COMBO', 'Classic clean-to-breakup in the style of a Fender Deluxe Reverb.'],
      ],
      ['GAIN: amount of distortion', 'BASS: low end', 'MIDDLE: midrange', 'TREBLE: high end', 'LEVEL: overall volume'],
    ),
  },
  {
    id: 'eqfx2',
    name: 'EQ/FX2',
    title: 'EQ / Effect 2',
    switch: 'The BANK ▲ (EQ) pedal turns it on and off in manual or memory edit mode.',
    summary:
      'Sits after the preamp (and after the SEND/RETURN loop). Use it as a 3-band EQ or as a second effect slot. Knob 1 (MODE) picks a version of most effects.',
    knobLabels: ['1', '2', '3', '4'],
    types: [
      { name: 'PHASER', what: 'Swirling sweep. MODE 1 NORMAL, or MODE 2 SCRIPT (MXR Phase 90 style).', knobs: ['MODE: NORMAL or SCRIPT', 'RATE: speed', 'DEPTH: how deep', 'RESONANCE / E.LEVEL: intensity (NORMAL) or effect volume (SCRIPT)'] },
      { name: 'TREM/PAN', what: 'MODE 1 TREMOLO pulses the volume; MODE 2 PAN bounces the sound between left and right in stereo.', knobs: ['MODE: TREMOLO or PAN', 'RATE: speed', 'DEPTH: how deep', 'E.LEVEL: effect volume'] },
      { name: 'BOOST', what: 'A second boost after the amp: MID, CLEAN or TREBLE.', knobs: ['MODE: MID, CLEAN or TREBLE', 'DRIVE: how much grit', 'TONE: brightness', 'LEVEL: output volume'] },
      { name: 'DELAY', what: 'A second delay (10–800 ms): STANDARD, ANALOG or TAPE.', knobs: ['MODE: STANDARD, ANALOG or TAPE', 'TIME: delay time', 'FEEDBACK: number of repeats', 'E.LEVEL: volume of repeats'] },
      { name: 'CHORUS', what: 'Shimmer and width: MONO, STEREO or the BOSS CE-1 sound.', knobs: ['MODE: MONO, STEREO or CE-1', 'RATE: speed', 'DEPTH: how deep', 'E.LEVEL: effect volume'] },
      { name: 'EQ', what: 'A 3-band equalizer for shaping the overall tone.', knobs: ['BASS: low end', 'MIDDLE: midrange', 'TREBLE: high end', 'LEVEL: output volume'] },
    ],
    swapSlot: 6,
    swaps: [
      { name: 'FLANGER', what: 'A jet-plane "whoosh".', knobs: [NONE, 'RATE: speed', 'DEPTH: how deep', 'RESONANCE: intensity'] },
      { name: 'VIBRATO', what: 'Wobbles the pitch itself.', knobs: [NONE, ...MOD3] },
      { name: 'PITCH SHIFT', what: 'Moves the pitch up or down by up to two octaves.', knobs: [NONE, 'PITCH: semitones (center = detune)', 'D.LEVEL: your normal note', 'E.LEVEL: shifted note'] },
      { name: 'HARMONIST', what: 'Adds a harmony in the song’s key. Single notes only.', knobs: [NONE, 'KEY: the song’s key', 'HARMONY: which interval', 'E.LEVEL: harmony volume'] },
      { name: 'ROTARY', what: 'The swirl of a rotating speaker, in stereo.', knobs: [NONE, ...MOD3] },
      { name: 'UNI-V', what: 'The throbbing late-’60s Uni-Vibe sound.', knobs: [NONE, ...MOD3] },
      { name: 'OVERTONE', what: 'Adds octave overtones for a fuller sound.', knobs: [NONE, 'UPPER: octave above', 'LOWER: octave below', 'D.LEVEL: your normal note'] },
    ],
  },
  {
    id: 'ns',
    name: 'NS',
    title: 'Noise suppressor',
    switch: 'Hold EDIT and use the BANK ▲ / ▼ pedals to set the threshold (0–50). 0 turns it off.',
    summary:
      'Cuts hiss and hum from your pickups when you stop playing. Set it just high enough to quieten the noise; too high and soft notes or fades get cut off.',
    knobLabels: [],
    types: [],
  },
  {
    id: 'mod',
    name: 'MOD',
    title: 'Modulation',
    switch: 'Number pedal 3 (MOD) turns it on and off in manual or memory edit mode.',
    summary: 'Movement and width: swirls, wobbles, pitch effects and harmonies, before the delay and reverb.',
    knobLabels: ['1', '2', '3'],
    types: [
      { name: 'PHASER', what: 'Swirling, whooshing sweep.', knobs: ['RATE: speed', 'DEPTH: how deep', 'RESONANCE: intensity'] },
      { name: 'FLANGER', what: 'A jet-plane "whoosh" with a metallic edge.', knobs: ['RATE: speed', 'DEPTH: how deep', 'RESONANCE: intensity'] },
      { name: 'TREMOLO', what: 'Rhythmic volume pulsing for a vintage feel.', knobs: MOD3 },
      { name: 'CHORUS', what: 'A gentle shimmer that makes the sound wider and richer.', knobs: MOD3 },
      { name: 'VIBRATO', what: 'Wobbles the pitch itself, far more than your fingers could.', knobs: MOD3 },
      { name: 'PITCH SHIFT', what: 'Moves the pitch up or down by up to two octaves; the middle setting detunes slightly.', knobs: ['PITCH: semitones (center = detune)', 'D.LEVEL: your normal note', 'E.LEVEL: shifted note'] },
      { name: 'HARMONIST', what: 'Adds a harmony that follows the song’s key, like twin guitars. Single notes only.', knobs: ['KEY: the song’s key', 'HARMONY: which interval to add', 'E.LEVEL: harmony volume'] },
      { name: 'ROTARY', what: 'The swirl of a rotating organ speaker, in stereo.', knobs: MOD3 },
      { name: 'UNI-V', what: 'The throbbing late-’60s Uni-Vibe sound.', knobs: MOD3 },
      { name: 'DELAY', what: 'A second delay of 10–800 ms.', knobs: DLY3 },
      { name: 'OVERTONE', what: 'Adds octave overtones above and below for a fuller sound, even with chords.', knobs: ['UPPER: octave above', 'LOWER: octave below', 'D.LEVEL: your normal note'] },
    ],
    swapSlot: 11,
    swaps: [
      { name: 'SCRIPT PHASER', what: 'A vintage phaser in the style of the ’70s MXR Phase 90.', knobs: MOD3 },
      { name: 'STEREO CHORUS', what: 'A wide chorus with a different sweep on left and right.', knobs: MOD3 },
      { name: 'CE-1 CHORUS', what: 'The classic BOSS CE-1 chorus.', knobs: MOD3 },
      { name: 'AUTO WAH', what: 'A wah that sweeps on its own in a steady cycle.', knobs: MOD3 },
    ],
  },
  {
    id: 'delay',
    name: 'DELAY',
    title: 'Delay',
    switch: 'Number pedal 4 (DELAY) turns it on and off in manual or memory edit mode.',
    summary: 'Echoes of what you play, from slapback to big ambient washes. Also home to tap tempo, the phrase looper and shimmer.',
    knobLabels: ['1', '2', '3'],
    types: [
      { name: 'STANDARD', what: 'A clean, everyday echo (10–800 ms).', knobs: DLY3 },
      { name: 'ANALOG', what: 'Warm, soft repeats that darken as they fade.', knobs: DLY3 },
      { name: 'TAPE', what: 'Slightly wobbly repeats like an old tape echo.', knobs: DLY3 },
      { name: 'WARM', what: 'A softer, slightly blurred digital delay.', knobs: DLY3 },
      { name: 'MODULATE', what: 'Repeats with a gentle shimmer on them.', knobs: DLY3 },
      { name: 'REVERSE', what: 'Repeats play backwards.', knobs: ['TIME: delay time (10–800 ms)', 'FEEDBACK: number of repeats', 'BALANCE: normal vs reversed sound (99 = reversed only)'] },
      { name: 'TEMPO', what: 'Delay timed by tapping a pedal, so the echoes follow the song’s tempo.', knobs: ['TIME: which note value the repeats follow (e.g. dotted eighth)', 'FEEDBACK: number of repeats', 'E.LEVEL: volume of repeats'] },
      { name: 'TERA ECHO', what: 'A spacious, moving ambience that reacts to how hard you pick.', knobs: ['TIME: length of the effect', 'FEEDBACK: how slowly it fades', 'E.LEVEL: effect volume'] },
      { name: 'SHIMMER', what: 'Delay with pitch-shifted repeats for a heavenly, pad-like sound.', knobs: ['TIME: delay time (10–800 ms)', 'FEEDBACK: how slowly it fades', 'E.LEVEL: effect volume'] },
      { name: 'PHRASE LOOP', what: 'Record a part and have it repeat so you can play over it.', knobs: [NONE, NONE, 'LEVEL: loop volume'] },
      { name: '+REVERB', what: 'Delay and reverb together for a big, lush space.', knobs: ['TIME: delay time (10–800 ms)', 'FEEDBACK: how slowly it fades', 'E.LEVEL: effect volume'] },
    ],
    swapSlot: 11,
    swaps: [
      { name: 'CHO+DELAY', what: 'Delay with chorus.', knobs: ['TIME: delay time (10–800 ms)', 'FEEDBACK: how slowly it fades', 'E.LEVEL: effect volume'] },
      { name: 'WARP', what: 'A dreamy, warping sound while you hold the pedal.', knobs: ['TIME: delay time (10–800 ms)', NONE, 'E.LEVEL: effect volume'] },
      { name: 'TWIST', what: 'An aggressive spinning sound while you hold the pedal; wild with distortion.', knobs: ['RISE TIME: how fast it spins up', 'FALL TIME: how fast it stops', 'E.LEVEL: effect volume'] },
      { name: 'GLITCH', what: 'A machine-gun stutter while you hold the pedal.', knobs: ['TIME: length of the effect', 'GLITCH: intensity', 'BALANCE: normal vs effect sound'] },
    ],
  },
  {
    id: 'reverb',
    name: 'REVERB',
    title: 'Reverb',
    switch: 'The CTL (REV) pedal turns it on and off in manual or memory edit mode.',
    summary:
      'Puts your sound in a space, in stereo. One knob chooses both the type and how much: turn it up through ROOM, then HALL, then SPRING. All the way down turns reverb off.',
    knobLabels: ['1'],
    types: [
      { name: 'ROOM', what: 'A small, natural room. Adds life without sounding effected.', knobs: ['REVERB: room amount (first part of the knob)'] },
      { name: 'HALL', what: 'A large, smooth concert hall.', knobs: ['REVERB: hall amount (middle part of the knob)'] },
      { name: 'SPRING', what: 'The bouncy, drippy reverb built into vintage amps.', knobs: ['REVERB: spring amount (last part of the knob)'] },
    ],
  },
]

// Ready-made starting points. Knobs are 0-10 (5 = 12 o'clock); tweak by ear.
export const STARTERS = [
  {
    name: 'Clean with sparkle',
    note: 'Bright clean for chords and arpeggios.',
    sections: {
      comp: { on: true, type: 'COMP', knobs: [4, 6, 5] },
      preamp: { on: true, type: 'TWIN COMBO', knobs: [3, 5, 4, 6, 5] },
      mod: { on: true, type: 'CHORUS', knobs: [3, 4, 4] },
      reverb: { on: true, type: 'HALL', knobs: [4] },
    },
  },
  {
    name: 'Blues crunch',
    note: 'Touch-sensitive: soft picking cleans up, digging in adds grit.',
    sections: {
      odds: { on: true, type: 'BLUES OD', knobs: [5, 5, 6] },
      preamp: { on: true, type: 'TWEED COMBO', knobs: [4, 5, 6, 5, 5] },
      reverb: { on: true, type: 'SPRING', knobs: [8] },
    },
  },
  {
    name: 'Rock lead',
    note: 'Singing sustain with a lead delay.',
    sections: {
      odds: { on: true, type: 'T-SCREAM', knobs: [3, 6, 7] },
      preamp: { on: true, type: 'BRIT STACK', knobs: [7, 5, 6, 6, 5] },
      delay: { on: true, type: 'STANDARD', knobs: [6, 3, 3] },
      reverb: { on: true, type: 'HALL', knobs: [3] },
    },
  },
  {
    name: 'Ambient swell',
    note: 'Volume swells into a shimmering wash.',
    sections: {
      comp: { on: true, type: 'SLOW GEAR', knobs: [5, 6, 5] },
      preamp: { on: true, type: 'NATURAL', knobs: [3, 5, 5, 5, 5] },
      delay: { on: true, type: 'SHIMMER', knobs: [6, 6, 4] },
      reverb: { on: true, type: 'HALL', knobs: [6] },
    },
  },
]
