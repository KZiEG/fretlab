import { pcAt } from '../theory.js'

const SG = 22 // string gap
const FG = 24 // fret gap
const ROWS = 5
const PAD_X = 36
const PAD_TOP = 28
const W = PAD_X * 2 + SG * 5
const H = PAD_TOP + ROWS * FG + 10

/** A classic chord box: frets = [low E ... high e], null = muted, 0 = open. */
export default function ChordDiagram({ frets, root, onClick }) {
  const fretted = frets.filter((f) => f)
  const hi = fretted.length ? Math.max(...fretted) : 0
  const lo = fretted.length ? Math.min(...fretted) : 1
  // show the "3fr" style label unless the shape sits in first position
  const base = hi <= ROWS && lo <= 2 ? 1 : lo
  const x = (s) => PAD_X + s * SG
  const rowY = (f) => PAD_TOP + (f - base + 0.5) * FG

  // a barre bar is only drawn when the lowest fret covers 4+ strings' span
  const atLow = frets.map((f, s) => (f === lo && lo > 0 ? s : -1)).filter((s) => s >= 0)
  const barre = atLow.length >= 2 && atLow[atLow.length - 1] - atLow[0] >= 3

  return (
    <svg className="chord-diagram" viewBox={`0 0 ${W} ${H}`} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}>
      {base === 1 ? (
        <line className="nut" x1={x(0) - 1} x2={x(5) + 1} y1={PAD_TOP} y2={PAD_TOP} />
      ) : (
        <text className="fret-num" x={PAD_X - 15} y={rowY(base) + 4} textAnchor="end">{base}fr</text>
      )}
      {Array.from({ length: ROWS + 1 }, (_, i) => (
        <line key={`h${i}`} className="fret-line" x1={x(0)} x2={x(5)} y1={PAD_TOP + i * FG} y2={PAD_TOP + i * FG} />
      ))}
      {Array.from({ length: 6 }, (_, s) => (
        <line key={`v${s}`} className="string-line" strokeWidth={1.4} x1={x(s)} x2={x(s)} y1={PAD_TOP} y2={PAD_TOP + ROWS * FG} />
      ))}

      {barre && (
        <rect className="barre" x={x(atLow[0]) - 8} y={rowY(lo) - 8} width={x(atLow[atLow.length - 1]) - x(atLow[0]) + 16} height={16} rx={8} />
      )}

      {frets.map((f, s) => {
        if (f === null) {
          return <text key={s} className="muted-x" x={x(s)} y={PAD_TOP - 9} textAnchor="middle">×</text>
        }
        if (f === 0) {
          return <circle key={s} className="open-o" cx={x(s)} cy={PAD_TOP - 11} r={4.5} />
        }
        const isRoot = pcAt(s, f) === root
        return <circle key={s} className={`finger${isRoot ? ' finger-root' : ''}`} cx={x(s)} cy={rowY(f)} r={8} />
      })}
    </svg>
  )
}
