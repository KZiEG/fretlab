// How to connect the ME-80 to an amp. Our own diagrams and words.

function Jack({ x, y, label, dim, active }) {
  return (
    <g className={`hk-jack${dim ? ' dim' : ''}${active ? ' active' : ''}`}>
      <text x={x} y={y - 13} textAnchor="middle">{label}</text>
      <circle cx={x} cy={y} r="7" />
      <circle cx={x} cy={y} r="3" className="hk-hole" />
    </g>
  )
}

function Cable({ d, n, at, cls }) {
  return (
    <g className={`hk-cable ${cls}`}>
      <path d={d} />
      <g transform={`translate(${at[0]} ${at[1]})`}>
        <rect x="-10" y="-10" width="20" height="20" rx="4" />
        <text y="5" textAnchor="middle">{n}</text>
      </g>
    </g>
  )
}

/** Guitar -> ME-80 -> amp. `to` is 'front' (amp INPUT) or 'loop' (amp FX LOOP RETURN). */
function Diagram({ to }) {
  const loop = to === 'loop'
  return (
    <svg className="hk-diagram" viewBox="0 0 340 232" role="img"
      aria-label={loop ? 'Guitar into ME-80 input, ME-80 output into the amp effects loop return' : 'Guitar into ME-80 input, ME-80 output into the amp input'}>
      <rect className="hk-box" x="8" y="22" width="70" height="40" rx="8" />
      <text className="hk-name" x="43" y="47" textAnchor="middle">Guitar</text>

      <rect className="hk-box" x="104" y="12" width="228" height="78" rx="8" />
      <text className="hk-name" x="218" y="84" textAnchor="middle">ME-80</text>
      <Jack x={140} y={50} label="INPUT" active />
      <Jack x={248} y={50} label="OUT L/MONO" active />
      <Jack x={306} y={50} label="OUT R" dim />

      <rect className="hk-box" x="8" y="140" width="324" height="84" rx="8" />
      <text className="hk-name" x="170" y="216" textAnchor="middle">Amplifier</text>
      <Jack x={44} y={176} label="INPUT" active={!loop} dim={loop} />
      <text className="hk-group" x="268" y="150" textAnchor="middle">FX LOOP</text>
      <Jack x={236} y={182} label="SEND" dim />
      <Jack x={298} y={182} label="RETURN" active={loop} dim={!loop} />

      <Cable cls="c1" n="1" d="M78 42 H112 V50 H133" at={[100, 42]} />
      {loop
        ? <Cable cls="c2" n="2" d="M248 57 V118 H298 V175" at={[272, 118]} />
        : <Cable cls="c2" n="2" d="M248 57 V118 H44 V169" at={[150, 118]} />}
    </svg>
  )
}

const SETUPS = [
  {
    id: 'front',
    title: 'Option A · Into the front of the amp',
    best: 'Best when you like your amp’s own sound. Simplest setup.',
    steps: [
      ['Cable 1', 'Guitar → ME-80 INPUT.'],
      ['Cable 2', 'ME-80 OUTPUT L/MONO → the amp’s normal INPUT on the front.'],
    ],
    settings: [
      'Use the amp’s clean channel with its gain low, and its EQ near the middle (12 o’clock).',
      'Turn the ME-80’s PREAMP section off: your amp is already the amp. Use OD/DS for drive instead.',
      'Delay and reverb sit before the amp here. That sounds fine on a clean amp; if the amp itself is distorting, the echoes get distorted too, so keep the amp clean.',
    ],
  },
  {
    id: 'loop',
    title: 'Option B · Into the amp’s effects loop',
    best: 'Best when you want the ME-80’s amp models, using your amp just for its speaker and power. Needs an amp with an FX LOOP.',
    steps: [
      ['Cable 1', 'Guitar → ME-80 INPUT.'],
      ['Cable 2', 'ME-80 OUTPUT L/MONO → the amp’s FX LOOP RETURN on the back. Leave SEND empty.'],
    ],
    settings: [
      'Turn the ME-80’s PREAMP section on: it is now your amp sound. Pick the type and set GAIN and EQ there.',
      'The amp’s own channel, gain and tone knobs are skipped this way. Its master volume (and loop level, if it has one) set how loud it is.',
      'If the loop has a level switch (e.g. −10 dBV / +4 dBu), start on −10 dBV, the setting for pedals.',
      'Delay and reverb now come after the amp sound, like the 4-cable method gives you.',
    ],
  },
]

export default function HookUp() {
  return (
    <div className="hookup">
      <p>
        Two ways to connect the ME-80 to an amp. Both use two cables; pick one based on whose amp sound you want, the
        amp’s or the ME-80’s.
      </p>

      <div className="hk-safety">
        <strong>Before you plug in</strong>
        <span>Turn the amp volume all the way down. Switch the ME-80 on first, then the amp; when you finish, switch the amp off first. That avoids loud pops.</span>
      </div>

      {SETUPS.map((s) => (
        <section key={s.id} className="shortcut">
          <h3>{s.title}</h3>
          <p className="muted small">{s.best}</p>
          <Diagram to={s.id} />
          <ol className="hk-steps">
            {s.steps.map(([n, what]) => (
              <li key={n}><strong>{n}:</strong> {what}</li>
            ))}
          </ol>
          <h4>Settings</h4>
          <ul className="tips">
            {s.settings.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </section>
      ))}

      <section className="shortcut">
        <h3>What about the 4-cable method?</h3>
        <p className="why">
          The 4-cable method splits a multi-effects unit in two: drives go before the amp’s preamp and modulation,
          delay and reverb go in the amp’s effects loop. That needs <strong>SEND</strong> and{' '}
          <strong>RETURN</strong> jacks on the effects unit itself, and the ME-80 has just one input and one output,
          so its chain can’t be split.
        </p>
        <p className="why">
          Option B gets you close: everything, amp sound included, comes from the ME-80, and the delay and reverb land
          after the amp sound. If the back of your unit does have SEND and RETURN jacks, it’s a different model;
          tell me and the 4-cable steps can be added.
        </p>
      </section>
    </div>
  )
}
