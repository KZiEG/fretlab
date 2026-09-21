# FretLab

A personal, mobile-first guitar theory app: learn the fretboard, chords and scales.
Inspired by GuitarDex's "levels that decay" idea, applied to fretboard knowledge.

- **Trainer** – *Name the note* and *Find the note* quizzes. Every fretboard position is a
  card with a level (Learning → Refined → Mastered). Weak, forgotten and unseen positions
  come up more often, and positions you leave alone slowly decay.
- **Chords** – 14 chord types in all 12 keys, each with several playable voicings from the
  nut up the neck. Tap a diagram to hear it strummed. Optionally show every chord tone on
  the whole neck.
- **Scales** – 11 scales in all 12 keys, shown across the whole neck or one position "box"
  at a time (other notes are dimmed for context). Note names or scale degrees. Playable.
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
| `tools/generate_data.py` | Python: searches for chord voicings and scale position boxes, writes `src/data/*.json`. Re-run with `npm run data` after changing it. |
| `tools/make_icons.py` | Python: draws the PWA icons in `public/`. |
| `src/theory.js` | Notes, tuning, helpers. |
| `src/progress.js` | XP, levels, streaks and the decay model (constants at the top). |
| `src/audio.js` | Plucked-string synth (Karplus-Strong), no audio files needed. |
| `src/components/` | `Fretboard` (SVG, vertical on phones, horizontal on wide screens) and `ChordDiagram`. |
| `src/pages/` | Home, Trainer, Chords, Scales. |

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
