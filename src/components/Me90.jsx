import { useState } from 'react'
import { ME90, SECTIONS, STARTERS, clockLabel } from '../me90.js'
import HookUp from './HookUp.jsx'
import HowTo from './HowTo.jsx'

const byId = Object.fromEntries(SECTIONS.map((s) => [s.id, s]))
// sections you can save on a patch card, in signal order
const EDITABLE = ['pedalfx', 'comp', 'odds', 'preamp', 'eqfx2', 'ns', 'mod', 'delay', 'reverb']

// every type a section can use: its own 1-11 list plus the app swap-ins
const allTypes = (sec) => [...sec.types, ...(sec.swaps ?? [])]

const knobName = (role) => (role && role !== '—' ? role.split(':')[0] : null)

/** A pedal knob for a 0-10 value: 7 o'clock is 0, 12 o'clock is 5, 5 o'clock is 10. */
function Dial({ value, size = 36 }) {
  const angle = -150 + value * 30
  return (
    <svg className="dial" viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <circle className="knob-body" cx="20" cy="20" r="15" />
      <line className="knob-pointer" x1="20" y1="20" x2="20" y2="8" transform={`rotate(${angle} 20 20)`} />
    </svg>
  )
}

function Chain({ on = [] }) {
  return (
    <div className="chain" aria-label="Signal chain">
      {ME90.chain.map((s, i) => (
        <span key={s} className="chain-step">
          {i > 0 && <span className="chain-arrow">→</span>}
          <span className={`chain-box${on.includes(s) ? ' on' : ''}`}>{s}</span>
        </span>
      ))}
    </div>
  )
}

// ------------------------------------------------------------------ guide

function KnobRow({ knobs }) {
  if (!knobs.length || knobs.every((k) => k === '—')) return null
  return (
    <div className="me-knobs" style={{ gridTemplateColumns: `repeat(${knobs.length}, 1fr)` }}>
      {knobs.map((k, j) => (
        <div key={j} className={`me-knob${k === '—' ? ' unused' : ''}`}>
          <span className="me-knob-num">Knob {j + 1}</span>
          {k === '—' ? <span className="muted">not used</span> : (
            <>
              <strong>{k.split(':')[0]}</strong>
              <span className="muted small">{k.split(':').slice(1).join(':')}</span>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function TypeCards({ types, start = 1, shared, slot }) {
  return (
    <div className="me-types">
      {types.map((t, i) => (
        <div key={t.name} className="me-type">
          <div className="me-type-head">
            <span className="me-type-num">{slot ?? start + i}</span>
            <strong>{t.name}</strong>
          </div>
          <p className="me-type-what">{t.what}</p>
          {!shared && <KnobRow knobs={t.knobs} />}
        </div>
      ))}
    </div>
  )
}

function SectionGuide({ sec }) {
  const shared = !!sec.sharedKnobs
  return (
    <div className="me-guide">
      <h3>{sec.name} <span className="muted small">· {sec.title}</span></h3>
      <p>{sec.summary}</p>
      <p className="muted small">{sec.switch}</p>
      {shared && (
        <>
          <h4>Knobs (all types)</h4>
          <KnobRow knobs={sec.types[0].knobs} />
        </>
      )}
      {sec.types.length > 0 && (
        <>
          <h4>{shared ? 'Types' : 'Types and what the knobs do'}</h4>
          <TypeCards types={sec.types} shared={shared} />
        </>
      )}
      {sec.swaps && (
        <>
          <h4>Swap-in options for slot {sec.swapSlot}</h4>
          <p className="muted small">
            With the BOSS TONE STUDIO for ME-90 app you can replace type {sec.swapSlot} with one of these, per patch.
          </p>
          <TypeCards types={sec.swaps} shared={shared} slot={sec.swapSlot} />
        </>
      )}
    </div>
  )
}

// ------------------------------------------------------------------ patch cards

const newPatch = () => ({ id: `p${Date.now()}`, name: '', note: '', sections: {} })

function sectionDefaults(sec) {
  return { on: true, type: sec.types[0]?.name ?? '', knobs: sec.knobLabels.map(() => 5), threshold: 0 }
}

function PatchView({ patch, onEdit, onDelete, onCopy }) {
  const used = EDITABLE.filter((id) => patch.sections[id]?.on)
  return (
    <section className="patch-card">
      <div className="patch-card-head">
        <h3>{patch.name || 'Untitled sound'}</h3>
        <div className="chips">
          {onEdit && <button className="chip" onClick={onEdit}>Edit</button>}
          {onCopy && <button className="chip" onClick={onCopy}>Save a copy</button>}
          {onDelete && <button className="chip" onClick={onDelete} aria-label="Delete">✕</button>}
        </div>
      </div>
      {patch.note && <p className="muted small">{patch.note}</p>}
      <Chain on={used.map((id) => byId[id].name)} />
      <div className="patch">
        {used.map((id) => {
          const sec = byId[id]
          const st = patch.sections[id]
          const type = allTypes(sec).find((t) => t.name === st.type)
          return (
            <div key={id} className="patch-block">
              <div className="patch-head">
                <span className="patch-section">{sec.name}</span>
                <span className="patch-type">{id === 'ns' ? `Threshold ${st.threshold ?? 0}` : st.type}</span>
              </div>
              {sec.knobLabels.length > 0 && (
                <div className="knobs">
                  {st.knobs.map((v, j) => {
                    const name = knobName(type?.knobs[j]) ?? `Knob ${j + 1}`
                    if (type && !knobName(type.knobs[j])) return null
                    return (
                      <div key={j} className="knob">
                        <Dial value={v} />
                        <span className="knob-val">{clockLabel(v)}</span>
                        <span className="knob-label">{name}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        {used.length === 0 && <p className="muted small">No sections switched on yet.</p>}
      </div>
    </section>
  )
}

function PatchEditor({ initial, onSave, onCancel }) {
  const [p, setP] = useState(initial)
  const setSec = (id, patch) =>
    setP((cur) => ({ ...cur, sections: { ...cur.sections, [id]: { ...(cur.sections[id] ?? sectionDefaults(byId[id])), ...patch } } }))

  return (
    <section className="patch-card editing">
      <h3>{initial.name ? 'Edit sound' : 'New sound'}</h3>
      <label className="field">
        <span>Name</span>
        <input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} placeholder="e.g. Blues lead" />
      </label>
      <label className="field">
        <span>Note (song, guitar, pickup…)</span>
        <input value={p.note} onChange={(e) => setP({ ...p, note: e.target.value })} placeholder="e.g. Neck pickup, tone at 7" />
      </label>
      <p className="muted small">Switch on the sections you use and copy where each knob points on your pedal.</p>

      {EDITABLE.map((id) => {
        const sec = byId[id]
        const st = p.sections[id]
        const on = !!st?.on
        const type = allTypes(sec).find((t) => t.name === st?.type)
        return (
          <div key={id} className={`edit-sec${on ? ' on' : ''}`}>
            <label className="check edit-sec-head">
              <input type="checkbox" checked={on} onChange={(e) => setSec(id, { on: e.target.checked })} />
              <strong>{sec.name}</strong> <span className="muted small">{sec.title}</span>
            </label>
            {on && id === 'ns' && (
              <label className="field">
                <span>Threshold (0 = off)</span>
                <input type="number" inputMode="numeric" min="0" max="100" value={st.threshold ?? 0}
                  onChange={(e) => setSec(id, { threshold: Math.max(0, Number(e.target.value) || 0) })} />
              </label>
            )}
            {on && sec.types.length > 0 && (
              <label className="field">
                <span>Type</span>
                <select value={st.type} onChange={(e) => setSec(id, { type: e.target.value })}>
                  {sec.types.map((t, i) => <option key={t.name} value={t.name}>{i + 1}. {t.name}</option>)}
                  {sec.swaps && (
                    <optgroup label={`Slot ${sec.swapSlot} swap-ins (app)`}>
                      {sec.swaps.map((t) => <option key={t.name} value={t.name}>{sec.swapSlot}. {t.name}</option>)}
                    </optgroup>
                  )}
                  {st.type && !allTypes(sec).some((t) => t.name === st.type) && <option value={st.type}>{st.type}</option>}
                </select>
              </label>
            )}
            {on && sec.knobLabels.length > 0 && (
              <div className="edit-knobs">
                {st.knobs.map((v, j) => {
                  const name = knobName(type?.knobs[j])
                  if (!name) return null
                  return (
                    <label key={j} className="edit-knob">
                      <Dial value={v} size={40} />
                      <span className="edit-knob-text">
                        <strong>{name}</strong>
                        <span className="muted small">{clockLabel(v)}</span>
                      </span>
                      <input type="range" min="0" max="10" step="0.5" value={v}
                        onChange={(e) => setSec(id, { knobs: st.knobs.map((x, k) => (k === j ? Number(e.target.value) : x)) })} />
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      <div className="chips">
        <button className="btn primary" onClick={() => onSave({ ...p, name: p.name.trim() || 'Untitled sound' })}>Save</button>
        <button className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </section>
  )
}

function PatchCards({ patches, setPatches }) {
  const [editing, setEditing] = useState(null) // a patch being edited

  function save(p) {
    setPatches((list) => (list.some((x) => x.id === p.id) ? list.map((x) => (x.id === p.id ? p : x)) : [p, ...list]))
    setEditing(null)
  }

  const fromStarter = (s) => ({ ...newPatch(), name: s.name, note: s.note, sections: JSON.parse(JSON.stringify(s.sections)) })

  if (editing) return <PatchEditor initial={editing} onSave={save} onCancel={() => setEditing(null)} />

  return (
    <div className="patch-list">
      <h3>My sounds</h3>
      <p className="muted small">Save the knob settings of sounds you like. They are kept on this phone and included in Export on the Home page.</p>
      <button className="btn primary wide" onClick={() => setEditing(newPatch())}>+ New sound</button>
      {patches.map((p) => (
        <PatchView
          key={p.id}
          patch={p}
          onEdit={() => setEditing(p)}
          onDelete={() => { if (window.confirm(`Delete "${p.name}"?`)) setPatches((list) => list.filter((x) => x.id !== p.id)) }}
        />
      ))}

      <h3>Starter sounds</h3>
      <p className="muted small">Starting points to dial in on your pedal and adjust by ear. Save a copy to make it your own.</p>
      {STARTERS.map((s) => (
        <PatchView key={s.name} patch={s} onCopy={() => setEditing(fromStarter(s))} />
      ))}
    </div>
  )
}

// ------------------------------------------------------------------ page

export default function Me90({ patches, setPatches }) {
  const [view, setView] = useState('howto') // howto | guide | hookup | sounds
  const [secId, setSecId] = useState('comp')
  const sec = byId[secId]

  return (
    <>
      <div className="segmented small four">
        <button className={view === 'howto' ? 'on' : ''} onClick={() => setView('howto')}>How to</button>
        <button className={view === 'guide' ? 'on' : ''} onClick={() => setView('guide')}>Effects</button>
        <button className={view === 'hookup' ? 'on' : ''} onClick={() => setView('hookup')}>Hook up</button>
        <button className={view === 'sounds' ? 'on' : ''} onClick={() => setView('sounds')}>Sounds</button>
      </div>

      {view === 'guide' ? (
        <>
          <h4>Signal chain</h4>
          <Chain on={[sec.name]} />
          <p className="muted small">Your guitar goes in on the left; each section feeds the next. Tap a section below to read about it.</p>
          <div className="chips scroll">
            {SECTIONS.map((s) => (
              <button key={s.id} className={`chip${secId === s.id ? ' on' : ''}`} onClick={() => setSecId(s.id)}>{s.name}</button>
            ))}
          </div>
          <SectionGuide sec={sec} />
        </>
      ) : view === 'howto' ? (
        <HowTo />
      ) : view === 'hookup' ? (
        <HookUp />
      ) : (
        <PatchCards patches={patches} setPatches={setPatches} />
      )}

      <p className="muted small">
        Written in our own words from the ME-90 Parameter Guide and Reference Manual; see your manual for full details. FretLab is not
        affiliated with Roland or BOSS.
      </p>
    </>
  )
}
