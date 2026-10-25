import { useState } from 'react'
import { PATHWAYS, ROUTINE, addDays, allTasks, customToPathway, dayKey, practiceStreak } from '../practice.js'
import { fmtClock, remainingMs, startTimer, stopTimer, usePracticeTimer } from '../practiceTimer.js'

export const emptyPractice = () => ({ days: {}, projects: {}, custom: [], focus: 'melodic' })

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const prettyDay = (key) => {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return `${DAY_NAMES[date.getDay()]} ${d} ${date.toLocaleString(undefined, { month: 'short' })}`
}

function pathwaysOf(practice) {
  return [...PATHWAYS, ...(practice.custom ?? []).map(customToPathway)]
}

const doneMap = (practice, pid) => practice.projects?.[pid]?.done ?? {}

function progressOf(practice, p) {
  const ids = allTasks(p)
  const done = doneMap(practice, p.id)
  return { done: ids.filter((id) => done[id]).length, total: ids.length }
}

/** The first stage whose milestone isn't ticked yet (or the last stage). */
function currentStage(practice, p) {
  const done = doneMap(practice, p.id)
  const i = p.stages.findIndex((s) => !done[`${s.id}/milestone`])
  return i === -1 ? { stage: p.stages[p.stages.length - 1], index: p.stages.length - 1, finished: true } : { stage: p.stages[i], index: i, finished: false }
}

function Bar({ value, total }) {
  return <div className="progress-bar"><span style={{ width: `${total ? (value / total) * 100 : 0}%` }} /></div>
}

// ------------------------------------------------------------------ today

function Today({ practice, update, openProject }) {
  const timer = usePracticeTimer()
  const today = dayKey()
  const day = practice.days[today] ?? { blocks: {}, note: '' }
  const doneCount = ROUTINE.filter((b) => day.blocks[b.id]).length
  const streak = practiceStreak(practice.days, today)

  const focus = pathwaysOf(practice).find((p) => p.id === practice.focus)
  const cur = focus && currentStage(practice, focus)

  const setDay = (patch) => update((pr) => ({ ...pr, days: { ...pr.days, [today]: { blocks: {}, note: '', ...pr.days[today], ...patch } } }))
  const toggle = (id) => setDay({ blocks: { ...day.blocks, [id]: !day.blocks[id] } })

  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))
  const history = Object.keys(practice.days)
    .filter((k) => k !== today && (Object.values(practice.days[k].blocks ?? {}).some(Boolean) || practice.days[k].note))
    .sort()
    .reverse()
    .slice(0, 14)

  return (
    <>
      <div className="stat-row">
        <div className="stat">
          <div className="stat-num">{doneCount}/{ROUTINE.length}</div>
          <Bar value={doneCount} total={ROUTINE.length} />
          <div className="muted small">blocks today</div>
        </div>
        <div className="stat">
          <div className="stat-num">{streak}</div>
          <div className="muted small">day streak</div>
        </div>
        <div className="stat">
          <div className="stat-num">{doneCount * 5}</div>
          <div className="muted small">min today</div>
        </div>
      </div>

      <div className="week" aria-label="Last 7 days">
        {week.map((k) => {
          const n = ROUTINE.filter((b) => practice.days[k]?.blocks?.[b.id]).length
          return (
            <div key={k} className={`week-day${k === today ? ' today' : ''}`}>
              <span className="week-dot" style={{ '--fill': `${(n / ROUTINE.length) * 100}%` }} />
              <span className="muted small">{prettyDay(k).slice(0, 2)}</span>
            </div>
          )
        })}
      </div>

      {focus && (
        <button className="focus-card" onClick={() => openProject(focus.id)}>
          <span className="muted small">Project focus</span>
          <strong>{focus.name}</strong>
          <span className="small">{cur.finished ? 'All stages complete 🎉' : `Stage ${cur.index + 1}: ${cur.stage.title}`}</span>
        </button>
      )}

      <h3>Today’s routine · {prettyDay(today)}</h3>
      {ROUTINE.map((b, i) => {
        const running = timer.blockId === b.id
        const done = !!day.blocks[b.id]
        const tip = cur && !cur.finished ? cur.stage.suggest?.[b.id] : null
        return (
          <section key={b.id} className={`block${done ? ' done' : ''}`}>
            <div className="block-head">
              <label className="check block-check">
                <input type="checkbox" checked={done} onChange={() => toggle(b.id)} />
                <strong>{i + 1}. {b.title}</strong>
              </label>
              <span className="muted small">{b.minutes} min</span>
            </div>
            <p className="small">{b.what}</p>
            {tip && <p className="block-tip"><span>Today:</span> {tip}</p>}
            <div className="chips">
              <button className={`chip${running ? ' on' : ''}`} onClick={() => (running ? stopTimer() : startTimer(b.id, b.minutes))}>
                {running ? `Stop · ${fmtClock(remainingMs(timer))}` : `Start ${b.minutes}:00`}
              </button>
              {b.link && <a className="chip" href={b.link}>{b.linkLabel}</a>}
            </div>
          </section>
        )
      })}
      <p className="muted small">When a timer finishes it chimes and ticks the block off. It keeps running if you switch tabs.</p>

      <label className="field">
        <span>Notes for today</span>
        <textarea rows="3" value={day.note} placeholder="What went well? What to work on tomorrow?"
          onChange={(e) => setDay({ note: e.target.value })} />
      </label>

      {history.length > 0 && (
        <>
          <h3>Recent days</h3>
          <ul className="history">
            {history.map((k) => {
              const d = practice.days[k]
              const n = ROUTINE.filter((b) => d.blocks?.[b.id]).length
              return (
                <li key={k}>
                  <strong>{prettyDay(k)}</strong>
                  <span className="muted small">{n}/{ROUTINE.length} blocks · {n * 5} min</span>
                  {d.note && <span className="small history-note">{d.note}</span>}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </>
  )
}

// ------------------------------------------------------------------ projects

function ProjectList({ practice, open, startNew }) {
  return (
    <>
      <p className="muted small">Goals with a step-by-step path. Your focus project suggests what to practise in each routine block.</p>
      {pathwaysOf(practice).map((p) => {
        const pr = progressOf(practice, p)
        const cur = currentStage(practice, p)
        return (
          <button key={p.id} className="project-card" onClick={() => open(p.id)}>
            <div className="project-card-head">
              <strong>{p.name}</strong>
              {practice.focus === p.id && <span className="badge-focus">Focus</span>}
            </div>
            <span className="small muted">{p.goal}</span>
            <Bar value={pr.done} total={pr.total} />
            <span className="small">
              {pr.done}/{pr.total} done{p.stages.length > 1 && !cur.finished ? ` · Stage ${cur.index + 1}: ${cur.stage.title}` : ''}
            </span>
          </button>
        )
      })}
      <button className="btn wide" onClick={startNew}>+ New project</button>
    </>
  )
}

function NewProject({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [steps, setSteps] = useState('')
  const list = steps.split('\n').map((s) => s.trim()).filter(Boolean)
  return (
    <section className="patch-card editing">
      <h3>New project</h3>
      <label className="field"><span>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Learn “Wish You Were Here” intro" />
      </label>
      <label className="field"><span>Goal (what “done” looks like)</span>
        <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Play it along with the recording" />
      </label>
      <label className="field"><span>Steps, one per line</span>
        <textarea rows="6" value={steps} onChange={(e) => setSteps(e.target.value)}
          placeholder={'Learn the chord shapes\nGet the riff at half speed\nPlay along at full speed'} />
      </label>
      <div className="chips">
        <button className="btn primary" disabled={!name.trim() || !list.length}
          onClick={() => onSave({ id: `c${Date.now()}`, name: name.trim(), goal: goal.trim() || name.trim(), steps: list })}>
          Save
        </button>
        <button className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </section>
  )
}

function ProjectDetail({ practice, update, project: p, back }) {
  const done = doneMap(practice, p.id)
  const pr = progressOf(practice, p)
  const cur = currentStage(practice, p)
  const notes = practice.projects?.[p.id]?.notes ?? ''

  const setProject = (patch) =>
    update((x) => ({ ...x, projects: { ...x.projects, [p.id]: { done: {}, notes: '', ...x.projects?.[p.id], ...patch } } }))
  const tick = (key) => {
    const next = { ...done }
    if (next[key]) delete next[key]
    else next[key] = dayKey()
    setProject({ done: next })
  }

  return (
    <>
      <button className="chip back" onClick={back}>← All projects</button>
      <h3 className="project-title">{p.name}</h3>
      <p>{p.goal}</p>
      <Bar value={pr.done} total={pr.total} />
      <p className="muted small">{pr.done}/{pr.total} tasks and milestones done</p>
      <div className="chips">
        {practice.focus === p.id
          ? <span className="badge-focus big">Daily focus ✓</span>
          : <button className="btn" onClick={() => update((x) => ({ ...x, focus: p.id }))}>Make this my daily focus</button>}
      </div>

      {p.overview.length > 0 && (
        <details className="panel howto-topic">
          <summary>How to approach it</summary>
          <ul className="tips">{p.overview.map((o) => <li key={o}>{o}</li>)}</ul>
        </details>
      )}

      {p.stages.map((s, i) => {
        const ids = s.tasks.map((t) => `${s.id}/${t.id}`).concat(`${s.id}/milestone`)
        const n = ids.filter((id) => done[id]).length
        const complete = !!done[`${s.id}/milestone`]
        return (
          <details key={s.id} className={`panel stage${complete ? ' complete' : ''}`} open={i === cur.index && !cur.finished}>
            <summary>
              <span className="stage-num">{complete ? '✓' : i + 1}</span>
              <span className="stage-title">{s.title}</span>
              <span className="muted small">{n}/{ids.length}</span>
            </summary>
            {s.summary && <p className="howto-intro">{s.summary}</p>}
            {s.concepts.length > 0 && (
              <>
                <h4>Things to know</h4>
                <ul className="tips">{s.concepts.map((c) => <li key={c}>{c}</li>)}</ul>
              </>
            )}
            <h4>{p.custom ? 'Steps' : 'Practice'}</h4>
            <ul className="tasks">
              {s.tasks.map((t) => {
                const key = `${s.id}/${t.id}`
                return (
                  <li key={t.id}>
                    <label className="check">
                      <input type="checkbox" checked={!!done[key]} onChange={() => tick(key)} />
                      <span>{t.text}{done[key] && <span className="muted small"> · {prettyDay(done[key])}</span>}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
            <label className={`check milestone${complete ? ' on' : ''}`}>
              <input type="checkbox" checked={complete} onChange={() => tick(`${s.id}/milestone`)} />
              <span><strong>{p.custom ? 'Goal reached:' : 'Milestone:'}</strong> {s.milestone}</span>
            </label>
            {s.tools.length > 0 && (
              <div className="chips stage-tools">
                {s.tools.map(([href, label]) => <a key={href + label} className="chip" href={href}>{label}</a>)}
              </div>
            )}
          </details>
        )
      })}

      <label className="field">
        <span>Project notes</span>
        <textarea rows="3" value={notes} placeholder="Songs to learn, tempos reached, ideas…" onChange={(e) => setProject({ notes: e.target.value })} />
      </label>

      {p.custom && (
        <button className="btn danger" onClick={() => {
          if (!window.confirm(`Delete “${p.name}”?`)) return
          update((x) => ({ ...x, custom: x.custom.filter((c) => c.id !== p.id), focus: x.focus === p.id ? 'melodic' : x.focus }))
          back()
        }}>Delete project</button>
      )}
    </>
  )
}

// ------------------------------------------------------------------ page

export default function Practice({ practice, update }) {
  const [view, setView] = useState('today') // today | projects
  const [openId, setOpenId] = useState(null)
  const [creating, setCreating] = useState(false)
  const pr = practice ?? emptyPractice()
  const project = openId && pathwaysOf(pr).find((p) => p.id === openId)

  const openProject = (id) => { setView('projects'); setOpenId(id); window.scrollTo(0, 0) }

  return (
    <div className="page">
      <h2>Practice</h2>
      <div className="segmented">
        <button className={view === 'today' ? 'on' : ''} onClick={() => setView('today')}>Today</button>
        <button className={view === 'projects' ? 'on' : ''} onClick={() => { setView('projects'); setOpenId(null) }}>Guitar Projects</button>
      </div>

      {view === 'today' && <Today practice={pr} update={update} openProject={openProject} />}
      {view === 'projects' && creating && (
        <NewProject
          onCancel={() => setCreating(false)}
          onSave={(c) => { update((x) => ({ ...x, custom: [...(x.custom ?? []), c] })); setCreating(false); setOpenId(c.id) }}
        />
      )}
      {view === 'projects' && !creating && (project
        ? <ProjectDetail practice={pr} update={update} project={project} back={() => setOpenId(null)} />
        : <ProjectList practice={pr} open={(id) => { setOpenId(id); window.scrollTo(0, 0) }} startNew={() => setCreating(true)} />)}
    </div>
  )
}
