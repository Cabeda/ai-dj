// ai-dj Strudel host — headless Strudel on Web Audio, driven over stdio.
//
// The orchestrator sends line-delimited JSON ops; this replies with events.
// See ai_dj/backend.py for the protocol and docs/adr/0001 for why.
//
// Bun has no Web Audio, so we supply one via node-web-audio-api. Strudel's
// draw/scope modules touch `document`/`window` at import time, so we shim the
// few globals they use before importing. The Strudel packages must be bundled
// (see build.sh) because @kabelsalat/web ships a UMD bundle with no ESM named
// exports, which breaks @strudel/core's barrel under Bun/Node ESM.

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
  type: string
  detail: unknown
  constructor(type: string, opts?: { detail?: unknown }) {
    this.type = type
    this.detail = opts?.detail
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
const { webaudioOutput, getAudioContext, registerSynthSounds, registerZZFXSounds } =
  await import("@strudel/webaudio")
const { registerSoundfonts } = await import("@strudel/soundfonts")
const { samples } = await import("superdough")
await import("@strudel/tonal") // registers .scale/.chord/.voicing

const { evalScope, evaluate, getTrigger, Cyclist } = core as any
await evalScope(core, mini)

registerSynthSounds?.()
registerZZFXSounds?.()
try {
  registerSoundfonts?.() // General MIDI soundfonts: the classical palette (gm_*)
} catch (e: any) {
  log(`soundfonts unavailable: ${e?.message ?? e}`)
}
// Sample maps. The REPL prebakes these same maps; without them `s("steinway")`
// or `.bank("RolandTR909")` resolve to nothing and silently render silence.
//   - tidal-drum-machines: TR-808/909/707/… kits (professional drum machines)
//   - vcsl: Versilian Community Sample Library (CC0 orchestral/acoustic)
//   - piano: Salamander-style grand pianos
const SAMPLE_MAPS = [
  "https://raw.githubusercontent.com/felixroos/dough-samples/main/tidal-drum-machines.json",
  "https://raw.githubusercontent.com/felixroos/dough-samples/main/vcsl.json",
  "https://raw.githubusercontent.com/felixroos/dough-samples/main/piano.json",
]
const loaded: string[] = []
for (const map of SAMPLE_MAPS) {
  try {
    await samples(map)
    loaded.push(map.split("/").pop()!.replace(".json", ""))
  } catch (e: any) {
    log(`sample map failed (${map}): ${e?.message ?? e}`)
  }
}
log(`sample maps: ${loaded.join(", ") || "none"}`)
// legacy Dirt-Samples, kept for the s("bd")-style names used by older patterns
try {
  await samples("github:tidalcycles/dirt-samples")
} catch (e: any) {
  log(`dirt-samples unavailable: ${e?.message ?? e}`)
}

const ctx: any = getAudioContext()

// Master volume is applied by the model per event (via `gain`), not by
// shadowing ctx.destination: superdough reads destination.maxChannelCount when
// building its output, and a shadowed node reports 0 channels, which breaks
// node creation. set_volume is therefore a no-op hook for now.
let master: any = null

const scheduler = new Cyclist({
  onTrigger: getTrigger({ getTime: () => ctx.currentTime, defaultOutput: webaudioOutput }),
  getTime: () => ctx.currentTime,
})
scheduler.setCps(0.5) // 120 bpm in 4/4

// The REPL defines setcpm inside repl(); we do not use repl(), so a script's
// opening setcpm(<bpm>/4) had no implementation. Expose it against our
// scheduler, and remember the cps so capture renders at the right tempo.
const setcpm = (cpm: number) => {
  const cps = Number(cpm) / 60
  if (Number.isFinite(cps) && cps > 0) scheduler.setCps(cps)
  return (core as any).silence
}
const setcps = (cps: number) => {
  const v = Number(cps)
  if (Number.isFinite(v) && v > 0) scheduler.setCps(v)
  return (core as any).silence
}
await evalScope({ setcpm, setcps })

let currentCode = ""
let pattern: any = null

function log(msg: string) {
  process.stderr.write(`[host] ${msg}\n`)
}

// -- capture: offline render of the current pattern --------------------------
// Rendering happens in a separate process (strudel/render.ts). Doing it here
// meant swapping superdough's module-global context out from under the running
// scheduler, which raced and produced silent renders.

async function capture(path: string, seconds: number) {
  return captureNow(path, seconds)
}

async function captureNow(path: string, seconds: number) {
  if (!currentCode) {
    log("capture: no current code")
    return null
  }
  // Render in a separate process. superdough keeps its context, controller and
  // caches in module globals; doing this in-process meant swapping them out
  // from under the running scheduler, which raced and produced silent renders.
  //
  // Spawned asynchronously: a blocking spawn would freeze this event loop, so
  // the Cyclist could not queue events and the live set would stutter on every
  // capture.
  const { fileURLToPath } = await import("node:url")
  const req = JSON.stringify({
    script: currentCode,
    seconds,
    cps: scheduler.cps,
    out: path,
  })
  const renderer = fileURLToPath(new URL("./render.bundle.mjs", import.meta.url))
  const proc = Bun.spawn(["bun", renderer], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  })
  proc.stdin.write(req + "\n")
  await proc.stdin.end()

  const timeoutMs = (seconds + 10) * 1000
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    try {
      proc.kill()
    } catch {}
  }, timeoutMs)
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ])
  await proc.exited
  clearTimeout(timer)

  if (timedOut) {
    log(`capture: renderer timed out after ${timeoutMs / 1000}s`)
    return null
  }
  // the renderer logs to stderr; stdout carries only the JSON reply
  const line = stdout
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("{"))
    .pop()
  if (!line) {
    log(`capture: renderer produced nothing (stderr: ${stderr.slice(-300)})`)
    return null
  }
  let res: any
  try {
    res = JSON.parse(line)
  } catch {
    log(`capture: renderer output not JSON: ${line.slice(0, 200)}`)
    return null
  }
  if (!res.ok) {
    log(`capture: render failed: ${res.error}`)
    return null
  }
  log(`capture: rendered peak=${Number(res.peak).toFixed(4)}`)
  return res.path ?? path
}

// -- protocol ---------------------------------------------------------------
function send(obj: unknown) {
  process.stdout.write(JSON.stringify(obj) + "\n")
}

async function handle(msg: any) {
  switch (msg.op) {
    case "boot":
      send({ event: "ready" })
      break
    case "play": {
      currentCode = msg.script ?? ""
      const res = await evaluate(currentCode, transpiler)
      pattern = res.pattern
      await scheduler.setPattern(pattern, true)
      send({ event: "playing" })
      break
    }
    case "evolve": {
      // preview a layer change without committing it to the live set
      const code = msg.script ?? ""
      try {
        const { pattern: p } = await evaluate(code, transpiler)
        await scheduler.setPattern(p, true)
        currentCode = code
        send({ event: "playing" })
      } catch (e: any) {
        send({ event: "error", message: `evaluate failed: ${e?.message ?? e}` })
      }
      break
    }
    case "stop":
      scheduler.stop()
      send({ event: "stopped" })
      break
    case "set_volume":
      // see note above: applied per-event via `gain`, not a master node
      if (master) master.gain.value = Math.max(0, Math.min(1, Number(msg.volume) || 0))
      break
    case "capture": {
      try {
        const out = await capture(msg.path, Number(msg.seconds) || 10)
        if (out) send({ event: "captured", path: out })
        else send({ event: "error", message: "capture produced no audio" })
      } catch (e: any) {
        send({ event: "error", message: `capture failed: ${e?.message ?? e}` })
      }
      break
    }
    case "shutdown":
      try {
        scheduler.stop()
      } catch {}
      send({ event: "bye" })
      process.exit(0)
      break
    default:
      send({ event: "error", message: `unknown op: ${msg.op}` })
  }
}

let queue: Promise<void> = Promise.resolve()
const decoder = new TextDecoder()
let pending = ""
for await (const chunk of Bun.stdin.stream()) {
  pending += decoder.decode(chunk, { stream: true })
  let nl
  while ((nl = pending.indexOf("\n")) >= 0) {
    const line = pending.slice(0, nl).trim()
    pending = pending.slice(nl + 1)
    if (!line) continue
    let msg: any
    try {
      msg = JSON.parse(line)
    } catch {
      send({ event: "error", message: "invalid JSON" })
      continue
    }
    queue = queue.then(() => handle(msg)).catch((e) => {
      send({ event: "error", message: String(e?.message ?? e) })
    })
  }
}
