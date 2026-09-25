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
import { SAMPLE_MAPS, installDomShims, scaleEventGain, silenceConsole } from "./prelude"

installDomShims()

// stdout carries the JSON protocol, so nothing else may write to it. Strudel
// and superdough log through console.* at call time (a deprecation warning per
// scheduled node, sample loads, ...), which would corrupt the stream. Route it
// all to stderr (the run log) before the imports below can emit anything.
silenceConsole((level, text) => log(`${level}: ${text}`))

const core = await import("@strudel/core")
const mini = await import("@strudel/mini")
const { transpiler } = await import("@strudel/transpiler")
const webaudio = await import("@strudel/webaudio")
const { webaudioOutput, getAudioContext, registerSynthSounds, registerZZFXSounds } =
  webaudio
const { registerSoundfonts } = await import("@strudel/soundfonts")
const { samples } = await import("superdough")
await import("@strudel/tonal") // registers .scale/.chord/.voicing

const { evalScope, evaluate, getTrigger, Cyclist } = core as any
// Expose the same globals the Strudel REPL does. Without `webaudio` in scope a
// script calling `samples(...)` (or `register`, `aliasBank`, ...) throws
// "samples is not defined" — and the host would keep the previous pattern.
await evalScope(core, mini, webaudio)

registerSynthSounds?.()
registerZZFXSounds?.()
try {
  registerSoundfonts?.() // General MIDI soundfonts: the classical palette (gm_*)
} catch (e: any) {
  log(`soundfonts unavailable: ${e?.message ?? e}`)
}
// Sample maps (see prelude.ts; the dirt-samples legacy pack below stays local).
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

// Master volume. Superdough reads `destination.maxChannelCount` when building
// its output, so shadowing `ctx.destination` with a GainNode makes that read 0
// and breaks node creation. Instead scale each event's `gain` on the way to the
// output — per-event volume is how superdough expects it anyway, and it leaves
// the destination untouched.
let masterVolume = 1

function scaledOutput(): any {
  const base = getTrigger({
    getTime: () => ctx.currentTime,
    defaultOutput: webaudioOutput,
  })
  return (...args: any[]) => {
    if (masterVolume < 1) scaleEventGain((args[0] as any)?.value, masterVolume);
    return base(...args);
  }
}

const scheduler = new Cyclist({
  onTrigger: scaledOutput(),
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

// Silent mode (AI_DJ_SILENT=1) still evaluates every script — so validation and
// offline capture behave identically — but never schedules it to the speakers.
// The test suite uses it: the machine can still hear the audio (by rendering
// it), the human cannot.
const SILENT = process.env.AI_DJ_SILENT === "1"

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
    // apply the same master volume the live path uses, so a recording matches
    // what was heard
    volume: masterVolume,
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
      send({ event: "ready", silent: SILENT })
      break
    case "play": {
      currentCode = msg.script ?? ""
      const res = await evaluate(currentCode, transpiler)
      pattern = res.pattern
      await scheduler.setPattern(pattern, true)
      send({ event: "playing" })
      break
    }
    case "stop":
      scheduler.stop()
      send({ event: "stopped" })
      break
    case "set_volume":
      // Applied to `masterVolume` immediately; no reply event, so nothing can
      // interleave with the capture/play acks the backend waits on.
      masterVolume = Math.max(0, Math.min(1, Number(msg.volume)))
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
