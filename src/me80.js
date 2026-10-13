// BOSS ME-80 guide content, written in our own words from the owner's manual's
// "Using the Effects" chapter. Type and knob names are the labels printed on the
// pedal. Each type lists what the section's knobs (1, 2, 3...) do for that type.

export const ME80 = {
  name: 'BOSS ME-80',
  // signal flow, guitar on the left
  chain: ['PEDAL FX', 'COMP/FX1', 'OD/DS', 'PREAMP', 'EQ/FX2', 'NS', 'VOLUME', 'MOD', 'DELAY', 'REVERB'],
}

// Knob value 0-10 drawn as a clock position: 0 = 7 o'clock (all the way down),
// 5 = 12 o'clock, 10 = 5 o'clock (all the way up).
export function clockLabel(v) {
  const hour = ((7 + Math.floor(v) - 1) % 12) + 1
  return Number.isInteger(v) ? `${hour} o'clock` : `half past ${hour}`
}

const SAME = (types, knobs) => types.map(([name, what]) => ({ name, what, knobs }))

export const SECTIONS = [
  {
    id: 'pedalfx',
    name: 'PEDAL FX',
    title: 'Pedal effects',
    switch: 'Press the toe of the expression pedal down hard to turn it on or off. When it’s off, the pedal is a volume pedal.',
    summary:
      'Effects you play with your foot. Rocking the expression pedal sweeps the effect, so you can shape it while you play. Choose the type with the PEDAL FX knob.',
    knobLabels: [],
    types: [
      { name: 'WAH', what: 'Classic wah: rock the pedal for the vocal "wow" sweep.', knobs: [] },
      { name: 'VOICE', what: 'A talking, vowel-like sweep, as if the guitar were saying "ah" to "ee".', knobs: [] },
      { name: '+1 OCT', what: 'Bends the pitch smoothly up to an octave above as you push. Single notes only.', knobs: [] },
      { name: '+2 OCT', what: 'Like +1 OCT, but sweeps up to two octaves. Single notes only.', knobs: [] },
      { name: '-1 OCT', what: 'Bends the pitch down by up to an octave. Single notes only.', knobs: [] },
      { name: 'FREEZE', what: 'Holds whatever you are playing at the moment you stomp it, like an endless sustain.', knobs: [] },
      { name: 'OSC DELAY', what: 'Pushes a delay into runaway, swirling oscillation with one foot movement.', knobs: [] },
      { name: 'OD/DS', what: 'Pedal controls how much drive the OD/DS section adds. The DRIVE knob sets the most you can reach.', knobs: [] },
      { name: 'MOD RATE', what: 'Pedal controls the speed of the MOD effect. The MOD RATE knob sets the top speed.', knobs: [] },
      { name: 'DELAY LEV', what: 'Pedal fades the delay repeats in and out. The DELAY E.LEVEL knob sets the maximum.', knobs: [] },
    ],
  },
  {
    id: 'comp',
    name: 'COMP/FX1',
    title: 'Compressor / Effect 1',
    switch: 'Number pedal 1 (COMP) turns it on and off in Manual and Memory Edit mode.',
    summary:
      'The first effect after the pedal. Use it as a compressor to even out your volume and add sustain without dirt, or pick one of the special effects that work best early in the chain.',
    knobLabels: ['1', '2', '3'],
    types: [
      { name: 'COMP', what: 'Squeezes loud and quiet notes closer together for smooth, even sustain. Also catches sudden peaks.', knobs: ['SUSTAIN: how much it holds notes', 'ATTACK: how sharp the pick attack stays', 'LEVEL: output volume'] },
      { name: 'T.WAH UP', what: 'An auto-wah that opens up the harder you pick.', knobs: ['SENS: how strongly it reacts to picking', 'TONE: how bright the wah is', 'PEAK: how pronounced the wah is'] },
      { name: 'T.WAH DOWN', what: 'An auto-wah that sweeps the other way, closing as you pick harder.', knobs: ['SENS: how strongly it reacts to picking', 'TONE: how bright the wah is', 'PEAK: how pronounced the wah is'] },
      { name: 'OCTAVE', what: 'Adds notes one and two octaves below for a big, bass-like low end.', knobs: ['-1 OCT: volume of the octave below', '-2 OCT: volume of two octaves below', 'DIRECT: volume of your normal note'] },
      { name: 'SLOW GEAR', what: 'Hides the pick attack so notes swell in like a violin.', knobs: ['SENS: how easily the swell triggers', 'ATTACK: how long each swell takes', 'LEVEL: output volume'] },
      { name: 'DEFRETTER', what: 'Makes the guitar sound like a fretless instrument, with a smooth, singing attack.', knobs: ['SENS: how strongly it reacts to picking', 'TONE: brightness', '—'] },
      { name: 'RING MOD', what: 'Mixes your note with an internal tone for clangy, bell-like, out-of-tune sounds.', knobs: ['FREQ: pitch of the internal tone', 'D.LEVEL: volume of your normal note', 'E.LEVEL: volume of the effect'] },
      { name: 'AC SIM', what: 'Makes an electric guitar sound closer to an acoustic.', knobs: ['LOW: bass tone', 'HIGH: treble tone', 'LEVEL: output volume'] },
      { name: 'Single → Hum', what: 'Gives single-coil pickups the thicker sound of a humbucker.', knobs: ['—', '—', '—'] },
      { name: 'Hum → Single', what: 'Gives humbuckers the brighter, thinner sound of single coils.', knobs: ['—', '—', '—'] },
      { name: 'SOLO', what: 'Shapes the tone to cut through for lead playing. Works best with OD/DS and PREAMP also on.', knobs: ['—', '—', '—'] },
    ],
  },
  {
    id: 'odds',
    name: 'OD/DS',
    title: 'Overdrive / Distortion',
    switch: 'Number pedal 2 (OD/DS) turns it on and off in Manual and Memory Edit mode.',
    summary:
      'Adds grit, crunch or full distortion, from a light push to heavy metal and fuzz. All types use the same three knobs.',
    knobLabels: ['1', '2', '3'],
    types: SAME(
      [
        ['BOOST', 'A clean volume and gain push. Great for hitting the amp harder, or alone for a punchy clean tone.'],
        ['OVERDRIVE', 'Smooth, mild overdrive based on the BOSS OD-1.'],
        ['T-SCREAM', 'The mid-heavy overdrive of the famous Ibanez Tube Screamer (TS-808).'],
        ['BLUES', 'Based on the BOSS BD-2 Blues Driver: touch-sensitive, from clean-ish to crunchy.'],
        ['TURBO OD', 'A stronger overdrive with more gain, like the BOSS OD-2 in turbo mode.'],
        ['DISTORTION', 'Classic BOSS DS-1 distortion.'],
        ['TURBO DS', 'Distortion with a pushed midrange, like the BOSS DS-2 in turbo mode.'],
        ['METAL DS', 'High-gain metal distortion based on the BOSS Metal Zone (MT-2).'],
        ['CORE', 'Tight, aggressive high gain for fast metal riffing (BOSS ML-2).'],
        ['FUZZ', 'Thick, woolly fuzz in the style of the Electro-Harmonix Big Muff.'],
        ['OCT FUZZ', 'Fuzz that adds a note an octave higher, inspired by the Octavia.'],
      ],
      ['DRIVE: how much distortion', 'TONE: brightness', 'LEVEL: output volume'],
    ),
  },
  {
    id: 'preamp',
    name: 'PREAMP',
    title: 'Preamp (amp sound)',
    switch: 'The BANK ▼ (AMP) pedal turns it on and off in Manual and Memory Edit mode.',
    summary:
      'The "amp" of your sound. Pick an amp character, then set its gain and EQ just like the knobs on a real amp. All types use the same five knobs.',
    knobLabels: ['1', '2', '3', '4', '5'],
    types: SAME(
      [
        ['AC', 'Voiced for electro-acoustic guitars plugged in.'],
        ['CLEAN', 'A neutral clean sound without the harsh treble or boomy bass some amps have.'],
        ['TWEED', 'Warm vintage crunch in the style of a Fender Bassman.'],
        ['CRUNCH', 'A modern crunch that responds closely to how hard you pick.'],
        ['COMBO', 'Chimey vintage crunch in the style of a VOX AC30.'],
        ['LEAD', 'Smooth, sustaining vintage lead tone like a Mesa/Boogie Mark series.'],
        ['DRIVE', 'A versatile, straight-ahead drive voiced specially for the ME-80.'],
        ['STACK', 'Bright hard-rock crunch in the style of a Marshall 1959 stack.'],
        ['METAL', 'Heavy, saturated metal in the style of a Bogner Überschall.'],
      ],
      ['GAIN: amount of distortion', 'BASS: low end', 'MIDDLE: midrange', 'TREBLE: high end', 'LEVEL: overall volume'],
    ),
  },
  {
    id: 'eqfx2',
    name: 'EQ/FX2',
    title: 'EQ / Effect 2',
    switch: 'The BANK ▲ (EQ) pedal turns it on and off in Manual and Memory Edit mode.',
    summary:
      'Sits right after the preamp. Use it as a 3-band EQ to fine-tune the amp sound, or as a second effect slot when MOD and DELAY are already busy.',
    knobLabels: ['1', '2', '3', '4'],
    types: [
      { name: 'PHASER', what: 'Swirling, whooshing sweep.', knobs: ['—', 'RATE: speed', 'DEPTH: how deep', 'LEVEL: how strong'] },
      { name: 'TREMOLO', what: 'Rhythmic volume pulsing for a vintage feel.', knobs: ['—', 'RATE: speed', 'DEPTH: how deep', 'LEVEL: output volume'] },
      { name: 'BOOST', what: 'A second gain or volume boost, handy as a solo boost after the amp.', knobs: ['—', 'DRIVE: how much grit', 'TONE: brightness', 'LEVEL: output volume'] },
      { name: 'DELAY', what: 'A simple echo of 10–990 ms, useful as a second delay.', knobs: ['—', 'TIME: delay time (10 ms steps)', 'FEEDBACK: number of repeats', 'LEVEL: volume of repeats'] },
      { name: 'CHORUS', what: 'Adds shimmer and width.', knobs: ['—', 'RATE: speed', 'DEPTH: how deep', 'LEVEL: output volume'] },
      { name: 'EQ', what: 'A 3-band equalizer for shaping the overall tone.', knobs: ['BASS: low end', 'MIDDLE: midrange', 'TREBLE: high end', 'LEVEL: output volume'] },
    ],
  },
  {
    id: 'ns',
    name: 'NS',
    title: 'Noise suppressor',
    switch: 'Hold EDIT and use the BANK ▲ / ▼ pedals to set the threshold. 0 turns it off.',
    summary:
      'Cuts hiss and hum from your pickups when you stop playing. Set it just high enough to quieten the noise; too high and soft notes or long fades get cut off.',
    knobLabels: [],
    types: [],
  },
  {
    id: 'mod',
    name: 'MOD',
    title: 'Modulation',
    switch: 'Number pedal 3 (MOD) turns it on and off in Manual and Memory Edit mode.',
    summary:
      'Movement and width: swirls, wobbles, pitch effects and harmonies. Comes after the amp, before delay and reverb.',
    knobLabels: ['1', '2', '3'],
    types: [
      { name: 'PHASER', what: 'Swirling, whooshing sweep.', knobs: ['RATE: speed', 'DEPTH: how deep', 'RESONANCE: how intense'] },
      { name: 'FLANGER', what: 'A jet-plane "whoosh" with a metallic edge.', knobs: ['RATE: speed', 'DEPTH: how deep', 'RESONANCE: how intense'] },
      { name: 'TREMOLO', what: 'Rhythmic volume pulsing for a vintage feel.', knobs: ['RATE: speed', 'DEPTH: how deep', 'E.LEVEL: effect volume'] },
      { name: 'CHORUS', what: 'A gentle shimmer that makes the sound wider and richer.', knobs: ['RATE: speed', 'DEPTH: how deep', 'E.LEVEL: effect volume'] },
      { name: 'VIBRATO', what: 'Wobbles the pitch itself, far more than your fingers could.', knobs: ['RATE: speed', 'DEPTH: how deep', 'E.LEVEL: effect volume'] },
      { name: 'PITCH SHIFT', what: 'Moves the pitch up or down by up to two octaves.', knobs: ['PITCH: how far to shift', 'D.LEVEL: volume of your normal note', '—'] },
      { name: 'HARMONIST', what: 'Adds a harmony that follows the song’s key, like twin guitars. Play single notes.', knobs: ['KEY: the song’s key', 'HARMONY: which interval to add', 'E.LEVEL: harmony volume'] },
      { name: 'ROTARY', what: 'The swirl of a rotating organ speaker, in stereo.', knobs: ['RATE: speed', 'DEPTH: how deep', 'E.LEVEL: effect volume'] },
      { name: 'UNI-V', what: 'The throbbing late-’60s Uni-Vibe sound.', knobs: ['RATE: speed', 'DEPTH: how deep', 'E.LEVEL: effect volume'] },
      { name: 'DELAY', what: 'A short second delay of 10–600 ms.', knobs: ['TIME: delay time (10 ms steps)', 'FEEDBACK: number of repeats', '—'] },
      { name: 'OVERTONE', what: 'Adds octave overtones above and below for a fuller sound, even with chords.', knobs: ['UPPER: octave-up volume', 'LOWER: octave-down volume', 'D.LEVEL: volume of your normal note'] },
    ],
  },
  {
    id: 'delay',
    name: 'DELAY',
    title: 'Delay',
    switch: 'Number pedal 4 (DELAY) turns it on and off in Manual and Memory Edit mode.',
    summary:
      'Echoes of what you play, from quick doubling to long, spacey repeats. Also home to the tap-tempo delay and the phrase looper.',
    knobLabels: ['1', '2', '3'],
    types: [
      { name: '1–99 ms', what: 'Very short delay for a thick, doubled sound.', knobs: ['TIME: delay time (1 ms steps)', 'FEEDBACK: number of repeats', 'E.LEVEL: volume of repeats'] },
      { name: '100–600 ms', what: 'The everyday echo range for slapback to classic lead delay.', knobs: ['TIME: delay time (10 ms steps)', 'FEEDBACK: number of repeats', 'E.LEVEL: volume of repeats'] },
      { name: '500–6000 ms', what: 'Very long delays for ambient textures and special effects.', knobs: ['TIME: delay time (100 ms steps)', 'FEEDBACK: number of repeats', 'E.LEVEL: volume of repeats'] },
      { name: 'ANALOG', what: 'Warm, soft repeats that darken as they fade (30–400 ms).', knobs: ['TIME: delay time', 'FEEDBACK: number of repeats', 'E.LEVEL: volume of repeats'] },
      { name: 'TAPE', what: 'Slightly wobbly repeats like an old tape echo (30–400 ms).', knobs: ['TIME: delay time', 'FEEDBACK: number of repeats', 'E.LEVEL: volume of repeats'] },
      { name: 'MODULATE', what: 'Repeats with a chorus shimmer on them (30–400 ms).', knobs: ['TIME: delay time', 'FEEDBACK: number of repeats', 'E.LEVEL: volume of repeats'] },
      { name: 'REVERSE', what: 'Repeats play backwards (300–4800 ms).', knobs: ['TIME: delay time', 'FEEDBACK: number of repeats', 'E.LEVEL: balance of normal and reversed sound'] },
      { name: 'CHO + DELAY', what: 'Stereo chorus and delay together; the chorus is preset (10–990 ms).', knobs: ['TIME: delay time', 'FEEDBACK: number of repeats', 'E.LEVEL: volume of repeats'] },
      { name: 'TEMPO', what: 'Delay timed by tapping a pedal, so the echoes follow the song’s tempo.', knobs: ['TIME: which note value the repeats follow (e.g. dotted eighth)', 'FEEDBACK: number of repeats', 'E.LEVEL: volume of repeats'] },
      { name: 'TERA ECHO', what: 'A spacious, moving ambience somewhere between delay and reverb.', knobs: ['TIME: length of the effect', 'FEEDBACK: how slowly it fades', 'E.LEVEL: effect volume'] },
      { name: 'PHRASE LOOP', what: 'Record a part and have it repeat so you can play over it.', knobs: ['—', '—', 'E.LEVEL: loop volume'] },
    ],
  },
  {
    id: 'reverb',
    name: 'REVERB',
    title: 'Reverb',
    switch: 'The CTL (REV) pedal turns it on and off in Manual and Memory Edit mode.',
    summary:
      'Puts your sound in a space. One knob chooses both the type and how big the space is: turn it up through ROOM, then HALL, then SPRING.',
    knobLabels: ['1'],
    types: [
      { name: 'ROOM', what: 'A small, natural room. Adds life without sounding effected.', knobs: ['REVERB: room size (low part of the knob)'] },
      { name: 'HALL', what: 'A large, smooth concert hall.', knobs: ['REVERB: hall size (middle of the knob)'] },
      { name: 'SPRING', what: 'The bouncy, drippy reverb built into vintage amps.', knobs: ['REVERB: spring amount (top of the knob)'] },
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
      preamp: { on: true, type: 'CLEAN', knobs: [3, 5, 4, 6, 5] },
      mod: { on: true, type: 'CHORUS', knobs: [3, 4, 4] },
      reverb: { on: true, type: 'HALL', knobs: [4] },
    },
  },
  {
    name: 'Blues crunch',
    note: 'Touch-sensitive: soft picking cleans up, digging in adds grit.',
    sections: {
      odds: { on: true, type: 'BLUES', knobs: [5, 5, 6] },
      preamp: { on: true, type: 'TWEED', knobs: [4, 5, 6, 5, 5] },
      reverb: { on: true, type: 'SPRING', knobs: [8] },
    },
  },
  {
    name: 'Rock lead',
    note: 'Singing sustain with a slapback-to-lead delay.',
    sections: {
      odds: { on: true, type: 'T-SCREAM', knobs: [3, 6, 7] },
      preamp: { on: true, type: 'STACK', knobs: [7, 5, 6, 6, 5] },
      delay: { on: true, type: '100–600 ms', knobs: [6, 3, 3] },
      reverb: { on: true, type: 'HALL', knobs: [3] },
    },
  },
  {
    name: 'Ambient swell',
    note: 'Use the volume pedal or SLOW GEAR for pad-like swells.',
    sections: {
      comp: { on: true, type: 'SLOW GEAR', knobs: [5, 6, 5] },
      preamp: { on: true, type: 'CLEAN', knobs: [3, 5, 5, 5, 5] },
      delay: { on: true, type: 'TERA ECHO', knobs: [6, 6, 4] },
      reverb: { on: true, type: 'HALL', knobs: [6] },
    },
  },
]
