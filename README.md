# FretLab

A personal, mobile-first guitar theory app: learn the fretboard, chords and scales.
Inspired by GuitarDex's "levels that decay" idea, applied to fretboard knowledge.

- **Trainer** – *Name the note*: a quiz where every fretboard position is a card with a level
  (Learning → Refined → Mastered). Weak, forgotten and unseen positions come up more often, and
  positions you leave alone slowly decay. *Find the note*: hands-free flashcards. One note at a time is shown on each
  string in turn, 6th to 1st, with its name on the neck and a sentence like "A: 5th string, open". It
  moves on when the countdown ends (0.5–5 s, in 0.5 s steps), for notes you pick (in the order you
  pick them) or 3, 5, 8 or all 12 random notes. The phone's voice says each
  note as it starts, and a metronome click marks every step (accented on a new note); both can be
  switched off. It picks the most natural English voice on the device (Premium/Enhanced/Natural
  voices first); a voice menu and Test button let you choose another.
- **Chords** – 14 chord types in all 12 keys, each with a one-line description and several
  playable voicings from the nut up the neck. Tap a diagram to hear it strummed. Optionally
  show every chord tone on the whole neck. A **Triads** mode shows major, minor, diminished
  and augmented triads on each set of three neighbouring strings, in all three inversions.
- **Scales** – 11 scales in all 12 keys, shown across the whole neck or one position "box"
  at a time (other notes are dimmed for context). Note names or scale degrees. Playable.
- **Fretboard** – *Octave shortcuts*: four patterns for finding the same note an octave (or two)
  higher, each with the rule, why it works, and an interactive fretboard with an arrow you can
  step along. *Timed drills*: (1) walk the natural notes along a string, (2) find 1-3 notes on
  every string, (3) find 2-3 natural notes string by string, (4) pick an octave shortcut and up
  to 2 notes (any note) and find the octave from a given starting position. Each shows a map of
  what you are looking for, times you, counts mistakes (+3 s each when comparing runs) and keeps
  personal bests. Notes you hit first try also feed your Trainer levels. A metronome (start/stop,
  40-220 BPM) sits above the drills, independent of the timer.
- **Rig** – effects on the BOSS Waza-Air, starting with **Delay** and **Reverb**: what each does,
  where it sits in the signal chain, its controls and types, and pairings with other effects, each
  with starter settings drawn as knobs. Delay has a tempo-to-milliseconds calculator.
- **Home** – level, XP, day streak, a colour-coded note map, and the notes needing attention.

On phones, the *Name the note* answer buttons stay pinned above the tab bar and the asked fret
scrolls into view on its own. The screen stays awake during a timed drill or while the metronome
runs. Wrong answers give a short buzz on phones that support vibration (Android).

No accounts, no server, no cost. Progress is stored in the browser (localStorage); use
Export / Import on the Home page to back up or move it between devices.

## Run it

```
npm install
npm run dev        # http://localhost:5173, also reachable from your phone on the same Wi-Fi
```

## Where things live

| Path | What it does |
|---|---|
| `tools/generate_data.py` | Python: searches for chord voicings, triad shapes and scale position boxes, writes `src/data/*.json`. Re-run with `npm run data` after changing it. |
| `tools/make_icons.py` | Python: draws the PWA icons in `public/`. |
| `src/theory.js` | Notes, tuning, helpers. |
| `src/progress.js` | XP, levels, streaks and the decay model (constants at the top). |
| `src/rig.js` | Rig tab content: effects, pairings and starter settings (edit here to add effects). |
| `src/mobile.js` | Phone helpers: vibration and the screen wake lock. |
| `src/audio.js` | Plucked-string synth (Karplus-Strong), no audio files needed. |
| `src/components/` | `Fretboard` (SVG, vertical on phones, horizontal on wide screens), `ChordDiagram`, `Triads`, `ShortcutCard`, `Drills` and `Metronome`. |
| `src/pages/` | Home, Trainer, Chords, Scales, Internalize (the Fretboard tab), Rig. |

## Put it on your phone (free)

1. `npm run build` creates `dist/`, a static site.
2. Host `dist/` anywhere static: GitHub Pages, Cloudflare Pages, Netlify or Vercel all have free tiers.
   The build uses relative paths, so it works from a sub-path like `user.github.io/fretlab/`.
3. Open the URL on your phone, then Share → Add to Home Screen (Safari) or
   menu → Install app (Chrome).

Audio and the future tuner need `https://`, which those hosts provide.

On iPhone the app's sound plays like music (iOS 16.4+), so the silent switch doesn't mute it and
it follows AirPods or a Waza-Air. While a Find-the-note run or the metronome is going, an
inaudible tone keeps Bluetooth headphones from sleeping and clipping the clicks.

## Ideas for next

- Licks section (short phrases with tab, playback and looping)
- Interval and CAGED-shape trainers, ear training
- Reuse the decay model for chords and scales ("which keys have I neglected?")
- Alternate tunings
