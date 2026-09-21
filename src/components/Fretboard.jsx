import { useEffect, useState } from 'react'
import { INLAYS, STRING_LABELS } from '../theory.js'

function useWide() {
  const query = '(min-width: 820px)'
  const [wide, setWide] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return wide
}

// Layout constants (SVG units; the SVG scales to fit its container)
const V = { sg: 42, fg: 36, padT: 50, padL: 34, padR: 14, padB: 10 } // vertical (phones)
const H = { sg: 36, fg: 54, padT: 14, padL: 58, padR: 14, padB: 26 } // horizontal (wide screens)
const R = 13

/**
 * Interactive fretboard. Strings are 0..5 (low E to high e).
 * marks: [{ s, f, kind, label, color }] where kind picks the style:
 *   root | note | from | target | correct | wrong | heat | ghost
 * links: [{ from: { s, f }, to: { s, f } }] draws an arrow between two positions
 * Portrait phones get a vertical neck (nut at the top), wide screens horizontal.
 */
export default function Fretboard({ frets = 12, marks = [], links = [], onCell, highlightString = null }) {
  const horizontal = useWide()
  const L = horizontal ? H : V

  const width = horizontal ? L.padL + frets * L.fg + L.padR : L.padL + 5 * L.sg + L.padR
  const height = horizontal ? L.padT + 5 * L.sg + L.padB : L.padT + frets * L.fg + L.padB

  // center of a (string, fret) cell
  const pos = (s, f) => {
    if (horizontal) {
      const x = f === 0 ? L.padL - 22 : L.padL + (f - 0.5) * L.fg
      return [x, L.padT + (5 - s) * L.sg]
    }
    const y = f === 0 ? L.padT - 20 : L.padT + (f - 0.5) * L.fg
    return [L.padL + s * L.sg, y]
  }

  // the rectangle a tap on (string, fret) should hit
  const cellRect = (s, f) => {
    const [cx, cy] = pos(s, f)
    if (horizontal) {
      const x0 = f === 0 ? 0 : L.padL + (f - 1) * L.fg
      const w = f === 0 ? L.padL : L.fg
      return { x: x0, y: cy - L.sg / 2, width: w, height: L.sg }
    }
    const y0 = f === 0 ? 0 : L.padT + (f - 1) * L.fg
    const h = f === 0 ? L.padT : L.fg
    return { x: cx - L.sg / 2, y: y0, width: L.sg, height: h }
  }

  const fretNumbers = []
  const lines = []
  for (let f = 1; f <= frets; f++) {
    if (horizontal) {
      const x = L.padL + f * L.fg
      lines.push(<line key={`f${f}`} className="fret-line" x1={x} x2={x} y1={L.padT} y2={L.padT + 5 * L.sg} />)
      fretNumbers.push(
        <text key={`n${f}`} className="fret-num" x={L.padL + (f - 0.5) * L.fg} y={height - 6} textAnchor="middle">{f}</text>,
      )
    } else {
      const y = L.padT + f * L.fg
      lines.push(<line key={`f${f}`} className="fret-line" x1={L.padL} x2={L.padL + 5 * L.sg} y1={y} y2={y} />)
      fretNumbers.push(
        <text key={`n${f}`} className="fret-num" x={L.padL - 14} y={L.padT + (f - 0.5) * L.fg + 4} textAnchor="end">{f}</text>,
      )
    }
  }

  const strings = STRING_LABELS.map((label, s) => {
    const sw = 3.2 - s * 0.45
    const cls = `string-line${highlightString === s ? ' string-hot' : ''}`
    if (horizontal) {
      const y = L.padT + (5 - s) * L.sg
      return <line key={s} className={cls} strokeWidth={sw} x1={L.padL} x2={L.padL + frets * L.fg} y1={y} y2={y} />
    }
    const x = L.padL + s * L.sg
    return <line key={s} className={cls} strokeWidth={sw} x1={x} x2={x} y1={L.padT} y2={L.padT + frets * L.fg} />
  })

  const inlays = INLAYS.filter((f) => f <= frets).flatMap((f) => {
    const cols = f === 12 ? [1.5, 3.5] : [2.5]
    return cols.map((c) => {
      const x = horizontal ? L.padL + (f - 0.5) * L.fg : L.padL + c * L.sg
      const y = horizontal ? L.padT + (5 - c) * L.sg : L.padT + (f - 0.5) * L.fg
      return <circle key={`i${f}-${c}`} className="inlay" cx={x} cy={y} r={5} />
    })
  })

  // string names next to the open-string end
  const stringNames = STRING_LABELS.map((label, s) => {
    const [x, y] = horizontal ? [L.padL - 48, L.padT + (5 - s) * L.sg + 4] : [L.padL + s * L.sg, 11]
    return <text key={`l${s}`} className="string-name" x={x} y={y} textAnchor="middle">{label}</text>
  })

  const nut = horizontal
    ? <line className="nut" x1={L.padL} x2={L.padL} y1={L.padT - 2} y2={L.padT + 5 * L.sg + 2} />
    : <line className="nut" x1={L.padL - 2} x2={L.padL + 5 * L.sg + 2} y1={L.padT} y2={L.padT} />

  return (
    <svg
      className={`fretboard ${horizontal ? 'horizontal' : 'vertical'}`}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Guitar fretboard"
    >
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path className="arrow-head" d="M0 0L10 5L0 10z" />
        </marker>
      </defs>
      {inlays}
      {lines}
      {nut}
      {strings}
      {fretNumbers}
      {stringNames}

      {links.map((l, i) => {
        const [x1, y1] = pos(l.from.s, l.from.f)
        const [x2, y2] = pos(l.to.s, l.to.f)
        const len = Math.hypot(x2 - x1, y2 - y1) || 1
        const ux = (x2 - x1) / len
        const uy = (y2 - y1) / len
        return (
          <line
            key={`link${i}`}
            className="link"
            x1={x1 + ux * (R + 2)} y1={y1 + uy * (R + 2)}
            x2={x2 - ux * (R + 4)} y2={y2 - uy * (R + 4)}
            markerEnd="url(#arrow)"
          />
        )
      })}

      {onCell &&
        Array.from({ length: 6 }, (_, s) =>
          Array.from({ length: frets + 1 }, (_, f) => (
            <rect
              key={`c${s}-${f}`}
              className="cell-hit"
              {...cellRect(s, f)}
              onClick={() => onCell(s, f)}
            />
          )),
        )}

      {marks.map((m, i) => {
        const [x, y] = pos(m.s, m.f)
        return (
          <g key={`${m.s}-${m.f}-${i}`} className={`mark mark-${m.kind}`} style={{ pointerEvents: 'none' }}>
            <circle cx={x} cy={y} r={m.kind === 'heat' ? R - 4 : R} style={m.color ? { fill: m.color } : undefined} />
            {m.label && (
              <text x={x} y={y + 4} textAnchor="middle">{m.label}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
