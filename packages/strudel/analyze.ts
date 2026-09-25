// Symbolic analyzer: evaluate a Strudel pattern and print the notes it plays.
//
// Exact and deterministic (no audio), which makes it the right basis for
// similarity scoring: it answers "did this pattern play the right notes?"
// rather than "does the waveform look similar".
//
// stdin:  {"script": "...", "seconds": 8, "cps": 0.5}
// stdout: {"notes": [60, 64, 67, ...], "onsets": 42, "sounds": ["piano"]}

import "node-web-audio-api/polyfill.js"

const g = globalThis as any
const noop = () => {}
g.document ??= {
  addEventListener: noop,
  removeEventListener: noop,
  dispatchEvent: () => true,
  createElement: () => ({ style: {}, getContext: () => null, appendChild: noop, click: noop }),
  createElementNS: () => ({ style: {}, appendChild: noop }),
  body: { appendChild: noop, removeChild: noop },
  documentElement: { style: {} },
}
g.CustomEvent ??= class CustomEvent {
  constructor(type: string, opts?: { detail?: unknown }) {
    ;(this as any).type = type
    ;(this as any).detail = opts?.detail
  }
}
g.navigator ??= { userAgent: "bun" }
if (g.window) {
  g.window.addEventListener ??= noop
  g.window.removeEventListener ??= noop
  g.window.dispatchEvent ??= () => true
}
g.requestAnimationFrame ??= (fn: (t: number) => void) => setTimeout(() => fn(Date.now()), 16)
g.cancelAnimationFrame ??= (id: number) => clearTimeout(id)

const core = await import("@strudel/core")
const mini = await import("@strudel/mini")
const { transpiler } = await import("@strudel/transpiler")
await import("@strudel/tonal")
await core.evalScope(core, mini)
await core.evalScope({
  setcpm: () => (core as any).silence,
  setcps: () => (core as any).silence,
})

const NOTE_NAMES: Record<string, number> = {
  c: 0, "c#": 1, db: 1, d: 2, "d#": 3, eb: 3, e: 4, f: 5,
  "f#": 6, gb: 6, g: 7, "g#": 8, ab: 8, a: 9, "a#": 10, bb: 10, b: 11,
}

function toMidi(value: any): number | null {
  if (value == null) return null
  if (typeof value === "number") return Math.round(value)
  const m = String(value)
    .trim()
    .toLowerCase()
    .match(/^([a-g][#b]?)(-?\d+)$/)
  if (!m) return null
  const pc = NOTE_NAMES[m[1]]
  if (pc === undefined) return null
  return (parseInt(m[2], 10) + 1) * 12 + pc
}

async function analyze(req: any) {
  const { script, seconds = 8, cps = 0.5 } = req
  const { pattern } = await core.evaluate(script, transpiler)
  const haps = pattern.queryArc(0, seconds * cps, { _cps: cps })
  const notes: number[] = []
  const sounds = new Set<string>()
  let onsets = 0
  for (const hap of haps) {
    if (!hap.hasOnset()) continue
    onsets++
    const v = hap.value ?? {}
    if (v.s) sounds.add(String(v.s))
    const midi = toMidi(v.note)
    if (midi !== null) notes.push(midi)
  }
  // NOTE: keep temporal order — interval scoring depends on it
  return { notes, onsets, sounds: [...sounds] }
}

const decoder = new TextDecoder()
let pending = ""
for await (const chunk of Bun.stdin.stream()) {
  pending += decoder.decode(chunk, { stream: true })
  let nl
  while ((nl = pending.indexOf("\n")) >= 0) {
    const line = pending.slice(0, nl).trim()
    pending = pending.slice(nl + 1)
    if (!line) continue
    let res: any
    try {
      res = await analyze(JSON.parse(line))
    } catch (e: any) {
      res = { error: String(e?.message ?? e) }
    }
    process.stdout.write(JSON.stringify(res) + "\n")
  }
}
