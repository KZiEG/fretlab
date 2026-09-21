"""Generate the chord and scale data FretLab displays.

The app itself does no music theory searching: this script works out playable
chord voicings and scale position "boxes" for standard tuning and writes them
to src/data/*.json. Pure standard library, no installs needed.

Run from the project root:  python tools/generate_data.py
"""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "src" / "data"

TUNING = [40, 45, 50, 55, 59, 64]  # E2 A2 D3 G3 B3 E4, low string first
MAX_FRET = 15
MAX_VOICINGS = 6
MAX_STRINGS = {"5": 3}  # power chords: just root-fifth-octave

# ---------------------------------------------------------------- chords

# id, name, symbol, intervals, optional intervals (may be omitted), min strings
QUALITIES = [
    ("maj", "Major", "", [0, 4, 7], [], 4),
    ("min", "Minor", "m", [0, 3, 7], [], 4),
    ("5", "Power chord", "5", [0, 7], [], 3),
    ("7", "Dominant 7th", "7", [0, 4, 7, 10], [7], 4),
    ("maj7", "Major 7th", "maj7", [0, 4, 7, 11], [7], 4),
    ("m7", "Minor 7th", "m7", [0, 3, 7, 10], [7], 4),
    ("sus2", "Suspended 2nd", "sus2", [0, 2, 7], [], 4),
    ("sus4", "Suspended 4th", "sus4", [0, 5, 7], [], 4),
    ("add9", "Add 9", "add9", [0, 2, 4, 7], [7], 4),
    ("6", "Major 6th", "6", [0, 4, 7, 9], [7], 4),
    ("9", "Dominant 9th", "9", [0, 2, 4, 7, 10], [7], 4),
    ("dim", "Diminished", "dim", [0, 3, 6], [], 4),
    ("m7b5", "Half-diminished", "m7b5", [0, 3, 6, 10], [], 4),
    ("aug", "Augmented", "aug", [0, 4, 8], [], 4),
]

DEGREE = {0: "1", 1: "b2", 2: "2", 3: "b3", 4: "3", 5: "4", 6: "b5",
          7: "5", 8: "#5", 9: "6", 10: "b7", 11: "7"}


def chord_degrees(intervals):
    labels = []
    for i in intervals:
        # 2 in a chord with a 7th/9th is really a 9
        labels.append("9" if i == 2 and any(x in (10, 11) for x in intervals) else DEGREE[i])
    return labels


def fingers_needed(frets):
    """Fingers used, treating notes on the lowest fretted fret as one barre.

    Returns None if the shape is unplayable (an open string inside a barre).
    """
    fretted = [(s, f) for s, f in enumerate(frets) if f]
    if not fretted:
        return 0
    low = min(f for _, f in fretted)
    at_low = [s for s, f in fretted if f == low]
    if len(at_low) >= 2:
        for s in range(min(at_low), max(at_low) + 1):
            if frets[s] == 0:
                return None
        return len(fretted) - len(at_low) + 1
    return len(fretted)


def search_voicings(root, intervals, optional, min_strings, max_strings):
    tones = {(root + i) % 12 for i in intervals}
    required = {(root + i) % 12 for i in intervals if i not in optional}
    found = []
    frets = [None] * 6

    def rec(s, started, ended, lo, hi):
        if s == 6:
            finish(lo)
            return
        # muted string (only at the ends: no gaps between sounded strings)
        if not started:
            frets[s] = None
            rec(s + 1, False, False, lo, hi)
        elif not ended:
            frets[s] = None
            rec(s + 1, True, True, lo, hi)
        if ended:
            frets[s] = None
            rec(s + 1, True, True, lo, hi)
            return
        for f in range(MAX_FRET + 1):
            if (TUNING[s] + f) % 12 not in tones:
                continue
            nlo, nhi = lo, hi
            if f:
                nlo, nhi = min(lo, f), max(hi, f)
                if nhi - nlo > 3:
                    continue
            frets[s] = f
            rec(s + 1, True, False, nlo, nhi)
        frets[s] = None

    def finish(lo):
        sounded = [s for s, f in enumerate(frets) if f is not None]
        if not min_strings <= len(sounded) <= max_strings:
            return
        if (TUNING[sounded[0]] + frets[sounded[0]]) % 12 != root:
            return  # root position only
        pcs = {(TUNING[s] + frets[s]) % 12 for s in sounded}
        if not required <= pcs:
            return
        fretted = [f for f in frets if f]
        opens = sum(1 for s in sounded if frets[s] == 0)
        if opens and fretted and max(fretted) > 4:
            return  # open strings only make sense in open-position shapes
        n = fingers_needed(frets)
        if n is None or n > 4:
            return
        span = (max(fretted) - min(fretted)) if fretted else 0
        low = min(fretted) if fretted else 0
        wanted = min(max_strings, 6)
        score = (0.8 * n + 0.7 * span + 0.1 * low
                 + 0.6 * max(0, wanted - len(sounded)) - 0.25 * opens)
        found.append((score, low, list(frets), n))

    rec(0, False, False, 99, 0)
    return found


def pick(found):
    """Best few voicings, at least two frets apart along the neck."""
    found.sort(key=lambda c: (c[0], c[1]))
    chosen = []
    for score, low, frets, n in found:
        if all(abs(low - c[1]) >= 2 for c in chosen):
            chosen.append((score, low, frets, n))
        if len(chosen) == MAX_VOICINGS:
            break
    chosen.sort(key=lambda c: c[1])
    return [{"frets": c[2], "fingers": c[3]} for c in chosen]


def build_chords():
    qualities = [
        {"id": q[0], "name": q[1], "symbol": q[2], "intervals": q[3],
         "degrees": chord_degrees(q[3])}
        for q in QUALITIES
    ]
    voicings = {}
    for root in range(12):
        voicings[str(root)] = {}
        for qid, _n, _s, intervals, optional, min_strings in QUALITIES:
            voicings[str(root)][qid] = pick(search_voicings(
                root, intervals, optional, min_strings, MAX_STRINGS.get(qid, 6)))
    return {"tuning": TUNING, "qualities": qualities, "voicings": voicings}


# ---------------------------------------------------------------- scales

SCALES = [
    ("major", "Major (Ionian)", [0, 2, 4, 5, 7, 9, 11]),
    ("minor", "Natural minor (Aeolian)", [0, 2, 3, 5, 7, 8, 10]),
    ("majpent", "Major pentatonic", [0, 2, 4, 7, 9]),
    ("minpent", "Minor pentatonic", [0, 3, 5, 7, 10]),
    ("blues", "Blues", [0, 3, 5, 6, 7, 10]),
    ("dorian", "Dorian", [0, 2, 3, 5, 7, 9, 10]),
    ("phrygian", "Phrygian", [0, 1, 3, 5, 7, 8, 10]),
    ("lydian", "Lydian", [0, 2, 4, 6, 7, 9, 11]),
    ("mixolydian", "Mixolydian", [0, 2, 4, 5, 7, 9, 10]),
    ("locrian", "Locrian", [0, 1, 3, 5, 6, 8, 10]),
    ("harmonic_minor", "Harmonic minor", [0, 2, 3, 5, 7, 8, 11]),
]


def scale_degrees(sid, intervals):
    out = []
    for i in intervals:
        label = DEGREE[i]
        if i == 6 and sid == "lydian":
            label = "#4"
        if i == 8 and sid in ("minor", "phrygian", "locrian", "harmonic_minor"):
            label = "b6"
        out.append(label)
    return out


def scale_windows(root, intervals):
    """Fret windows ("boxes") that tile the neck for this scale.

    For each scale note on the low E string, try a few small windows around it
    and keep the one where every string holds about the same number of notes
    (2 for pentatonic-ish scales, 3 for seven-note scales).
    """
    pcs = {(root + i) % 12 for i in intervals}
    ideal = 2 if len(intervals) <= 6 else 3
    widths = (3, 4) if ideal == 2 else (4, 5)
    windows = set()
    for pc in pcs:
        for anchor in ((pc - TUNING[0]) % 12 + o for o in (0, 12)):
            best = None
            for start in range(max(0, anchor - 2), anchor + 1):
                for w in widths:
                    end = start + w
                    if end > MAX_FRET or not start <= anchor <= end:
                        continue
                    penalty = 0.15 * w + 0.05 * (anchor - start)
                    for s in range(6):
                        count = sum(1 for f in range(start, end + 1)
                                    if (TUNING[s] + f) % 12 in pcs)
                        penalty += abs(count - ideal)
                    if best is None or penalty < best[0]:
                        best = (penalty, start, end)
            if best:
                windows.add((best[1], best[2]))
    return [list(w) for w in sorted(windows)]


def build_scales():
    scales = [
        {"id": sid, "name": name, "intervals": iv, "degrees": scale_degrees(sid, iv)}
        for sid, name, iv in SCALES
    ]
    windows = {
        str(root): {sid: scale_windows(root, iv) for sid, _n, iv in SCALES}
        for root in range(12)
    }
    return {"scales": scales, "windows": windows}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    chords = build_chords()
    scales = build_scales()
    (OUT / "chords.json").write_text(json.dumps(chords, separators=(",", ":")))
    (OUT / "scales.json").write_text(json.dumps(scales, separators=(",", ":")))
    total = sum(len(v) for r in chords["voicings"].values() for v in r.values())
    print(f"chords.json: {total} voicings across "
          f"{len(chords['qualities'])} qualities x 12 roots")
    print(f"scales.json: {len(scales['scales'])} scales x 12 roots")


if __name__ == "__main__":
    main()
