// "How to use the ME-90", written in our own words from the ME-90 Reference Manual.
// Each topic: a short intro, numbered steps, and tips.

export const MODES = [
  {
    name: 'Manual mode',
    light: 'MEMORY/MANUAL light is blue',
    what: 'The ME-90 works like a pedalboard of separate pedals. Each footswitch turns one effect on or off (COMP, OD/DS, MOD, DELAY, AMP, EQ, REV), and the knobs set the sound live.',
    use: 'Use it for practising, jamming and building a new sound.',
  },
  {
    name: 'Memory mode',
    light: 'MEMORY/MANUAL light is red',
    what: 'The ME-90 recalls whole saved sounds, called patches. The BANK pedals pick a bank and pedals 1–4 pick a patch in it, so one tap changes everything at once.',
    use: 'Use it for songs and gigs, when you want to jump between finished sounds.',
  },
]

export const TOPICS = [
  {
    id: 'modes',
    title: 'Manual vs memory mode',
    intro:
      'The ME-90 has two ways of working. Press the MEMORY/MANUAL pedal to switch between them; its light tells you which one you are in.',
    steps: [
      'Press MEMORY/MANUAL once: the light changes between blue (manual) and red (memory).',
      'In manual mode, stomp a footswitch to turn that effect on or off, and turn the knobs to shape it.',
      'In memory mode, press BANK ▲/▼ to choose a bank, then 1–4 to load a patch.',
    ],
    tips: [
      'A typical workflow: build a sound in manual mode, save it as a patch, then use memory mode to play your saved sounds.',
      'In memory mode the footswitches select patches, so they can’t turn single effects on and off. To change effects inside a patch, use memory edit mode (see “Tweaking a saved sound”).',
      'When you go from memory to manual mode, the ME-90 keeps the patch’s sound by default (setting m1). Change it to m0 if you’d rather the sound jump to wherever the knobs are pointing (see “System settings”).',
    ],
  },
  {
    id: 'start',
    title: 'Getting started: power, output and volume',
    intro: 'Set these once and the ME-90 will sound right through whatever you plug it into.',
    steps: [
      'With everything turned down, connect your cables, then switch on the ME-90 first and your amp second. Switch off in the reverse order: amp first, ME-90 last.',
      'Set the Gt.AMP/LINE switch on the back: Gt.AMP when going into a guitar amp, LINE for headphones, a mixer or powered speakers.',
      'If you use a guitar amp, tell the ME-90 which kind with OUTPUT SELECT: in manual mode press EDIT, pick 1–12 with the BANK pedals, then press WRITE.',
      'Set the overall volume with the OUTPUT LEVEL knob.',
    ],
    tips: [
      'For headphones, use the PHONES jack with the switch on LINE.',
      'Batteries can stay in even when you use the power adaptor, so a pulled cable won’t cut your sound mid-song.',
    ],
  },
  {
    id: 'select',
    title: 'Picking a saved sound (patch)',
    intro:
      'The ME-90 holds 72 patches in banks of four. Banks U1–U9 are your own (you can save to them); P1–P9 are BOSS presets you can play but not overwrite.',
    steps: [
      'Switch to memory mode (red light).',
      'Press BANK ▲ or ▼ until the bank you want shows on the display (U1–U9 or P1–P9).',
      'Press pedal 1, 2, 3 or 4 to load that patch.',
    ],
    tips: [
      'Changing to another patch in the same bank? Just press its number; no need to touch the BANK pedals.',
      'By default, pressing BANK only changes the display; the sound changes when you press a number (setting H0). Set H1 if you want BANK to switch straight away.',
      'Browsing the P1–P9 presets is a great way to hear what the ME-90 can do.',
    ],
  },
  {
    id: 'save',
    title: 'Saving your own sound',
    intro: 'Saving (BOSS calls it “patch write”) stores everything except OUTPUT LEVEL in one of your 36 user slots.',
    steps: [
      'Build the sound in manual mode (or edit a patch, see below).',
      'Press WRITE. The footswitch lights blink.',
      'Press BANK ▲/▼ to choose a user bank (U1–U9).',
      'Press pedal 1–4 to choose the slot.',
      'Press WRITE again to save. Press EXIT instead if you change your mind.',
    ],
    tips: [
      'Save before switching patches or turning off: unsaved changes are lost.',
      'Saving overwrites whatever was in that slot.',
      'To copy a patch, load it and save it to a different slot.',
      'After saving, the ME-90 switches to memory mode.',
      'Write the knob settings down in FretLab’s “My sounds” too, so you can rebuild a sound anytime.',
    ],
  },
  {
    id: 'edit',
    title: 'Tweaking a saved sound (memory edit mode)',
    intro: 'To change a patch, including turning its effects on or off, you use memory edit mode.',
    steps: [
      'Load the patch in memory mode.',
      'Press EDIT. The display shows “Ed”.',
      'Turn knobs and stomp the footswitches: in this mode they turn effects on and off, just like manual mode.',
      'Save with WRITE (see “Saving your own sound”) to keep the changes.',
    ],
    tips: ['Leaving the patch or turning off before saving throws the changes away.'],
  },
  {
    id: 'knobs',
    title: 'When the knobs don’t match the sound',
    intro:
      'A patch remembers its own settings, so after loading one the knobs on the panel may point somewhere else. That’s normal.',
    steps: [
      'Hold EDIT and turn a knob: the display shows that setting’s real value.',
      'When the knob reaches the stored value, the guides on both sides of the display light up.',
    ],
    tips: [
      'By default a knob changes the sound as soon as you touch it (n0). With n1, it only takes over once it passes the stored value, which avoids sudden jumps (see “System settings”).',
    ],
  },
  {
    id: 'tuner',
    title: 'Tuning',
    intro: 'The ME-90 has a built-in tuner.',
    steps: [
      'Hold MEMORY/MANUAL for two seconds. Its light turns yellow.',
      'Play one open string. The display shows the nearest note.',
      'Tune until the guides on both sides of the display light up together; if one side flashes, you are flat or sharp.',
      'Press any footswitch to leave the tuner.',
    ],
    tips: [
      'The reference pitch is 440 Hz. Press EDIT in the tuner to step it between 435 and 445 Hz.',
      'The sound is muted while tuning (t0). Set t1 if you want to hear your guitar while you tune.',
    ],
  },
  {
    id: 'tap',
    title: 'Delay in time with the song (tap tempo)',
    intro: 'Tap the DELAY pedal along with the music and the echoes lock to that tempo.',
    steps: [
      'Turn the DELAY type knob to TEMPO.',
      'Use the TIME knob to choose the echo rhythm: dotted eighth or quarter note.',
      'Tap the DELAY pedal two or more times along with the beat. Its light then flashes in time.',
    ],
    tips: [
      'Hold the DELAY pedal for two seconds to turn the delay off.',
      'In memory mode, tap the current patch’s number pedal instead.',
      'You can also tap the speed of MOD or the time of other delays: hold the MOD or DELAY pedal for two seconds, tap at the speed you want, then hold it for two seconds again. Turning RATE or TIME afterwards overrides the tapped speed.',
    ],
  },
  {
    id: 'looper',
    title: 'Looping (phrase loop)',
    intro: 'Record up to 38 seconds, let it repeat, and play or layer more parts over it.',
    steps: [
      'Turn the DELAY type knob to PHRASE LOOP. The DELAY light blinks white (ready).',
      'Press DELAY to start recording (red).',
      'Press DELAY again to close the loop. It starts playing (blue).',
      'Press DELAY to add another layer (yellow); press again to go back to playing.',
      'Double-press DELAY quickly to stop. Press it once to play again.',
      'Hold DELAY to erase the loop and start over.',
    ],
    tips: [
      'Set the loop volume with the E.LEVEL knob.',
      'Loops aren’t saved: turning the type knob or the power off erases them.',
    ],
  },
  {
    id: 'ctl',
    title: 'The CTL pedal (one-tap changes inside a patch)',
    intro:
      'In memory mode, the CTL pedal can turn several effects on or off at once, or jump one knob to a set value, like a solo boost. Each patch stores its own CTL setup.',
    steps: [
      'Switch to memory mode and load the patch.',
      'Press the CTL button. The display shows “Ct”.',
      'Either press the footswitches of the effects CTL should turn on/off (their lights blink), or turn one knob to the value CTL should jump to.',
      'Optional: press the CTL button twice to choose TOGGLE (“to”, each press switches) or MOMENTARY (“mo”, only while you hold the pedal), then press CTL again.',
      'Save the patch with WRITE.',
    ],
    tips: ['Type knobs can’t be assigned to CTL. To turn CTL off for a patch, clear all its settings.'],
  },
  {
    id: 'loop',
    title: 'Using the SEND/RETURN loop',
    intro:
      'SEND/RETURN lets you add an outside pedal into the ME-90’s chain, or connect an amp with the 4-cable method (see Hook up).',
    steps: [
      'Connect SEND to the input of the outside pedal (or amp), and its output back to RETURN.',
      'Turn the loop on or off: hold EDIT and press the CTL pedal (1 = on, 0 = off). This is saved with each patch.',
      'Choose where the loop sits (system setting): S0 = before the preamp (factory setting, best for drive pedals), S1 = after the preamp (best for delays and the like).',
    ],
    tips: [
      'If nothing is plugged into RETURN, no sound comes out of SEND.',
      'Setting r1 makes the REV footswitch turn the loop on/off in manual mode instead of the reverb.',
    ],
  },
  {
    id: 'system',
    title: 'System settings (the whole unit)',
    intro: 'These settings apply to the ME-90 as a whole, not to one patch.',
    steps: [
      'Switch to manual mode (blue light).',
      'Press EDIT repeatedly to step through the settings.',
      'Use BANK ▲/▼ to change the value shown.',
      'Press WRITE to save.',
    ],
    tips: [
      'OUTPUT SELECT (1–12): which amp you plug into, and whether into its INPUT or RETURN.',
      'n0 / n1: knobs change the sound straight away, or only once they pass the stored value.',
      'H0 / H1: BANK pedals wait for a number pedal, or switch at once.',
      'm0 / m1: entering manual mode uses the knob positions, or keeps the patch’s sound.',
      'S0 / S1: SEND/RETURN before or after the preamp.',
      'o0 / o1: delay echoes cut off, or carry over, when you change patch.',
      'r0 / r1: REV footswitch controls reverb, or the SEND/RETURN loop.',
      't0 / t1: muted, or audible, while tuning.',
      'E0 / E1: full-colour lights, or a simpler red/yellow/blue scheme that is easier to tell apart.',
    ],
  },
  {
    id: 'trouble',
    title: 'Troubleshooting',
    intro: 'Quick checks when something isn’t working.',
    steps: [],
    tips: [
      'No sound: check the cables, that the amp is on and turned up, the OUTPUT LEVEL knob, and that the tuner isn’t on (it mutes the sound).',
      'Patch won’t change: with the default H0 setting, BANK only changes the display; press a number pedal to switch.',
      'Feedback or squealing: lower the gain or volume settings in the effects.',
      'A pedal effect does nothing: make sure the effect it controls is switched on.',
      'The expression pedal won’t reach full volume or click on/off reliably: recalibrate it (in manual mode hold CTL and press DELAY, then follow the display).',
      'Batteries low: BATTERY LOW blinks on the display.',
    ],
  },
  {
    id: 'reset',
    title: 'Factory reset',
    intro:
      'Puts everything back to how it left the factory. This erases all your saved user patches, so note down any you want to keep first.',
    steps: [
      'Switch to manual mode.',
      'Hold the CTL button and press the MOD pedal. The display shows “FA”.',
      'Press WRITE, then WRITE again to confirm. Don’t turn the power off while it resets.',
    ],
    tips: [],
  },
]
