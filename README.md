# FretLab

A personal, mobile-first guitar theory app: learn the fretboard, chords and scales.
Inspired by GuitarDex's "levels that decay" idea, applied to fretboard knowledge.

- **Trainer** – *Name the note* and *Find the note* quizzes. Every fretboard position is a
  card with a level (Learning → Refined → Mastered). Weak, forgotten and unseen positions
  come up more often, and positions you leave alone slowly decay.
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
- **Home** – level, XP, day streak, a colour-coded note map, and the notes needing attention.

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
| `src/audio.js` | Plucked-string synth (Karplus-Strong), no audio files needed. |
| `src/components/` | `Fretboard` (SVG, vertical on phones, horizontal on wide screens), `ChordDiagram`, `Triads`, `ShortcutCard`, `Drills` and `Metronome`. |
| `src/pages/` | Home, Trainer, Chords, Scales, Internalize (the Fretboard tab). |

## Put it on your phone (free)

1. `npm run build` creates `dist/`, a static site.
2. Host `dist/` anywhere static: GitHub Pages, Cloudflare Pages, Netlify or Vercel all have free tiers.
   The build uses relative paths, so it works from a sub-path like `user.github.io/fretlab/`.
3. Open the URL on your phone, then Share → Add to Home Screen (Safari) or
   menu → Install app (Chrome).

Audio and the future tuner need `https://`, which those hosts provide.

## Ideas for next

- Licks section (short phrases with tab, playback and looping)
- Interval and CAGED-shape trainers, ear training
- Reuse the decay model for chords and scales ("which keys have I neglected?")
- Alternate tunings
