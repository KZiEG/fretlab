// Note names recorded in the player's own voice. They play through Web Audio, the
// same path as the metronome, so they follow AirPods / Waza-Air on iPhone, unlike
// the built-in speech engine, which iOS often sends to the phone speaker.
import { unlockAudio } from './audio.js'

const DB_NAME = 'fretlab-voice'
const STORE = 'clips' // key: pitch class 0-11, value: recorded Blob

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function tx(mode, fn) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode)
    const out = fn(t.objectStore(STORE))
    t.oncomplete = () => resolve(out?.result)
    t.onerror = () => reject(t.error)
  })
}

export const saveClip = (pc, blob) => tx('readwrite', (s) => s.put(blob, pc))
export const deleteClip = (pc) => tx('readwrite', (s) => s.delete(pc))

async function loadBlobs() {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const out = new Map()
    const req = db.transaction(STORE).objectStore(STORE).openCursor()
    req.onsuccess = () => {
      const cur = req.result
      if (!cur) return resolve(out)
      out.set(cur.key, cur.value)
      cur.continue()
    }
    req.onerror = () => reject(req.error)
  })
}

// Cut the silence before and after the word and even out the volume, so every
// name starts the moment it's played and they all sound about as loud.
function trim(ctx, buf) {
  const data = buf.getChannelData(0)
  let peak = 0
  for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]))
  if (peak < 0.01) return null // nothing but silence
  const thresh = peak * 0.08
  let a = 0
  let b = data.length - 1
  while (a < b && Math.abs(data[a]) < thresh) a++
  while (b > a && Math.abs(data[b]) < thresh) b--
  const pad = Math.round(buf.sampleRate * 0.03)
  a = Math.max(0, a - pad)
  b = Math.min(data.length - 1, b + pad * 4) // longer tail: words fade out
  const out = ctx.createBuffer(1, b - a + 1, buf.sampleRate)
  const dst = out.getChannelData(0)
  const gain = 0.9 / peak
  for (let i = a; i <= b; i++) dst[i - a] = data[i] * gain
  return out
}

async function decode(blob) {
  const ctx = unlockAudio()
  if (!ctx) return null
  const raw = await new Promise((resolve, reject) => {
    blob.arrayBuffer().then((ab) => ctx.decodeAudioData(ab, resolve, reject), reject)
  })
  return trim(ctx, raw)
}

/** Every saved clip, decoded and trimmed: Map of pitch class -> AudioBuffer. */
export async function loadClips() {
  const out = new Map()
  let blobs
  try {
    blobs = await loadBlobs()
  } catch {
    return out // private browsing or storage blocked: no recordings
  }
  for (const [pc, blob] of blobs) {
    try {
      const buf = await decode(blob)
      if (buf) out.set(pc, buf)
    } catch {
      // a clip this browser can't decode is skipped; the phone voice covers it
    }
  }
  return out
}

/** Record from the microphone for `ms`, then return the decoded, trimmed clip and its Blob. */
export async function recordClip(ms = 1600) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true },
  })
  try {
    const rec = new MediaRecorder(stream)
    const chunks = []
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
    const stopped = new Promise((resolve) => { rec.onstop = resolve })
    rec.start()
    await new Promise((r) => setTimeout(r, ms))
    rec.stop()
    await stopped
    const blob = new Blob(chunks, { type: rec.mimeType || chunks[0]?.type })
    return { blob, buffer: await decode(blob) }
  } finally {
    stream.getTracks().forEach((t) => t.stop()) // release the mic straight away
  }
}

export function playClip(buffer) {
  const ctx = unlockAudio()
  if (!ctx || !buffer) return
  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.connect(ctx.destination)
  src.start()
}

export const canRecord = () =>
  typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined'
