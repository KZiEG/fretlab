"""Draw the PWA icons (pure standard library, no Pillow needed).

Run from the project root:  python tools/make_icons.py
"""
import struct
import zlib
from pathlib import Path

PUBLIC = Path(__file__).resolve().parent.parent / "public"
BG, LINE, DOT = (15, 17, 21), (139, 147, 165), (240, 169, 62)


def clamp(v):
    return max(0.0, min(1.0, v))


def mix(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def render(size):
    u = size / 512
    strings = [x * u for x in (156, 226, 296, 366)]  # vertical string x positions
    frets = [y * u for y in (200, 316)]                # horizontal fret y positions
    top, bottom, left, right = 130 * u, 382 * u, 120 * u, 402 * u
    dots = [(226 * u, 258 * u), (366 * u, 374 * u)]
    rows = []
    for y in range(size):
        row = bytearray([0])
        for x in range(size):
            c = BG
            if top <= y <= bottom:
                for sx in strings:
                    c = mix(c, LINE, clamp(1.6 * u + 0.5 - abs(x - sx)))
            if left <= x <= right:
                for fy in frets:
                    c = mix(c, LINE, clamp(1.2 * u + 0.5 - abs(y - fy)))
            for dx, dy in dots:
                d = ((x - dx) ** 2 + (y - dy) ** 2) ** 0.5
                c = mix(c, DOT, clamp(46 * u + 0.5 - d))
            row.extend(c)
        rows.append(bytes(row))
    return b"".join(rows)


def png(size):
    def chunk(tag, data):
        body = tag + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body))

    header = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header)
            + chunk(b"IDAT", zlib.compress(render(size), 9)) + chunk(b"IEND", b""))


for name, size in (("icon-512.png", 512), ("icon-192.png", 192), ("apple-touch-icon.png", 180)):
    (PUBLIC / name).write_bytes(png(size))
    print("wrote", name)
