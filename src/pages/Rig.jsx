import { useState } from 'react'
import { DELAY_NOTES, DEVICE, EFFECTS, delayMs } from '../rig.js'

/** A 0-100 knob drawn like a pedal knob: 7 o'clock is 0, 5 o'clock is 100. */
function Knob({ label, value }) {
  const angle = -135 + (value / 100) * 270
  return (
    <div className="knob">
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <circle className="knob-body" cx="20" cy="20" r="15" />
        <line className="knob-pointer" x1="20" y1="20" x2="20" y2="8" transform={`rotate(${angle} 20 20)`} />
      </svg>
      <span className="knob-val">{value}</span>
      <span className="knob-label">{label}</span>
    </div>
  )
}

function SettingsCard({ settings }) {
  return (
    <div className="patch">
      {settings.map((b) => (
        <div key={b.section} className="patch-block">
          <div className="patch-head">
            <span className="patch-section">{b.section}</span>
            <span className="patch-type">{b.type}</span>
          </div>
          <div className="knobs">
            {b.params.map(([name, v]) =>
              typeof v === 'number' ? (
                <Knob key={name} label={name} value={v} />
              ) : (
                <div key={name} className="knob readout">
                  <span className="readout-val">{v}</span>
                  <span className="knob-label">{name}</span>
                </div>
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function Chain({ on }) {
  return (
    <div className="chain" aria-label="Signal chain">
      {DEVICE.chain.map((s, i) => (
        <span key={s} className="chain-step">
          {i > 0 && <span className="chain-arrow">→</span>}
          <span className={`chain-box${on.includes(s) ? ' on' : ''}`}>{s}</span>
        </span>
      ))}
    </div>
  )
}

function DelayCalc() {
  const [bpm, setBpm] = useState(120)
  const step = (d) => setBpm((b) => Math.min(240, Math.max(40, b + d)))
  return (
    <div className="panel">
      <h3 className="calc-title">Delay time for your tempo</h3>
      <div className="stepper">
        <button className="btn" onClick={() => step(-5)} aria-label="Slower">−</button>
        <div className="stepper-label"><strong>{bpm}</strong> BPM</div>
        <button className="btn" onClick={() => step(5)} aria-label="Faster">+</button>
      </div>
      <div className="calc-grid">
        {DELAY_NOTES.map(([name, beats]) => (
          <div key={name} className="calc-cell">
            <span className="calc-ms">{delayMs(bpm, beats)} ms</span>
            <span className="muted small">{name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Rig() {
  const [effectId, setEffectId] = useState('delay')
  const fx = EFFECTS.find((e) => e.id === effectId)

  return (
    <div className="page">
      <h2>Rig</h2>
      <p className="muted small">
        Effects on the {DEVICE.name}: what each one does and what it pairs well with. Settings use the knob names in
        the BOSS Tone Studio app and are starting points to tweak by ear.
      </p>

      <div className="chips">
        {EFFECTS.map((e) => (
          <button key={e.id} className={`chip${effectId === e.id ? ' on' : ''}`} onClick={() => setEffectId(e.id)}>
            {e.name}
          </button>
        ))}
      </div>

      <h3>{fx.name}</h3>
      <p>{fx.summary}</p>

      <h4>Where it goes</h4>
      <Chain on={[fx.section]} />
      <p className="muted">{fx.chain}</p>

      <h4>Controls</h4>
      <dl className="defs">
        {fx.controls.map(([name, what]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{what}</dd>
          </div>
        ))}
      </dl>

      <h4>Types</h4>
      <dl className="defs">
        {fx.types.map(([name, what]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{what}</dd>
          </div>
        ))}
      </dl>

      {fx.id === 'delay' && <DelayCalc />}

      {fx.tips.length > 0 && (
        <>
          <h4>Tips</h4>
          <ul className="tips">
            {fx.tips.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </>
      )}

      <h3>Goes well with</h3>
      {fx.pairings.map((p, i) => (
        <section key={p.with} className="shortcut">
          <span className="shortcut-num">Pairing {i + 1} · {p.feel}</span>
          <h3>{fx.name} + {p.with}</h3>
          <p className="why">{p.why}</p>
          {p.settings && (
            <>
              <Chain on={p.settings.map((b) => b.section)} />
              <SettingsCard settings={p.settings} />
            </>
          )}
          {p.note && <p className="muted small">{p.note}</p>}
        </section>
      ))}
    </div>
  )
}
