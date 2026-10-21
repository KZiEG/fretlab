import { MODES, TOPICS } from '../me90howto.js'

/** "How to use the ME-90": manual vs memory at a glance, then one card per task. */
export default function HowTo() {
  return (
    <div className="howto">
      <h3>Manual vs memory mode</h3>
      <p className="muted small">Press the MEMORY/MANUAL pedal to switch. Its light shows which mode you’re in.</p>
      <div className="mode-cards">
        {MODES.map((m, i) => (
          <div key={m.name} className={`mode-card ${i === 0 ? 'manual' : 'memory'}`}>
            <strong>{m.name}</strong>
            <span className="mode-light">{m.light}</span>
            <p>{m.what}</p>
            <p className="muted small">{m.use}</p>
          </div>
        ))}
      </div>

      <h3>How to…</h3>
      <p className="muted small">Tap a topic to open it.</p>
      {TOPICS.map((t, i) => (
        <details key={t.id} className="panel howto-topic" open={i === 0}>
          <summary>{t.title}</summary>
          <p className="howto-intro">{t.intro}</p>
          {t.steps.length > 0 && (
            <ol className="hk-steps">
              {t.steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
          )}
          {t.tips.length > 0 && (
            <>
              <h4>Good to know</h4>
              <ul className="tips">
                {t.tips.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </>
          )}
        </details>
      ))}
    </div>
  )
}
