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
  createElement: () => ({ style: {}, getContext: () => null, appendChild: noop }),
  createElementNS: () => ({ style: {}, appendChild: noop }),
  body: { appendChild: noop },
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

const { evalScope, evaluate, getTrigger, Cyclist } = core as any
await evalScope(core, mini)
registerSynthSounds?.()
registerZZFXSounds?.()

const ctx: any = getAudioContext()
const { GainNode, AudioWorkletNode } = await import("node-web-audio-api")

// Route superdough's output through a master gain so we can both set volume
// and tap it for capture. superdough connects to audioContext.destination, so
// shadow that with our gain (own property shadows the prototype getter).
let master: any = null
try {
  const realDest = ctx.destination
  master = new GainNode(ctx, { gain: 1 })
  master.connect(realDest)
  Object.defineProperty(ctx, "destination", { get: () => master, configurable: true })
} catch {
  master = null
}

const scheduler = new Cyclist({
  onTrigger: getTrigger({ getTime: () => ctx.currentTime, defaultOutput: webaudioOutput }),
  getTime: () => ctx.currentTime,
})
scheduler.setCps(0.5) // 120 bpm in 4/4

let currentCode = ""
let pattern: any = null

// -- capture: tap the master output with an AudioWorklet ---------------------
let recorderReady = false
async function ensureRecorder() {
  if (recorderReady) return
  const src = `
class Recorder extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0] && inputs[0][0]
    if (ch) this.port.postMessage(ch.slice())
    return true
  }
}
registerProcessor("ai-dj-recorder", Recorder)
`
  const tmp = `/tmp/ai_dj_recorder_${process.pid}.js`
  await Bun.write(tmp, src)
  await ctx.audioWorklet.addModule(tmp)
  recorderReady = true
}

function writeWav(path: string, chunks: Float32Array[], sampleRate: number) {
  let n = 0
  for (const c of chunks) n += c.length
  const buf = Buffer.alloc(44 + n * 2)
  buf.write("RIFF", 0)
  buf.writeUInt32LE(36 + n * 2, 4)
  buf.write("WAVE", 8)
  buf.write("fmt ", 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20)
  buf.writeUInt16LE(1, 22)
  buf.writeUInt32LE(sampleRate, 24)
  buf.writeUInt32LE(sampleRate * 2, 28)
  buf.writeUInt16LE(2, 32)
  buf.writeUInt16LE(16, 34)
  buf.write("data", 36)
  buf.writeUInt32LE(n * 2, 40)
  let o = 44
  for (const c of chunks) {
    for (let i = 0; i < c.length; i++) {
      const s = Math.max(-1, Math.min(1, c[i]))
      buf.writeInt16LE((s * 32767) | 0, o)
      o += 2
    }
  }
  return buf
}

async function capture(path: string, seconds: number) {
  await ensureRecorder()
  const node = new AudioWorkletNode(ctx, "ai-dj-recorder", {
    numberOfInputs: 1,
    numberOfOutputs: 0,
    channelCount: 1,
  })
  const chunks: Float32Array[] = []
  node.port.onmessage = (e: any) => chunks.push(e.data)
  const tap = master ?? ctx.destination
  tap.connect(node)
  await new Promise((r) => setTimeout(r, Math.ceil(seconds * 1000)))
  tap.disconnect(node)
  // Realtime tap is not yet reliable (superdough's graph + worklet timing):
  // report failure rather than feed silence to the model.
  let peak = 0
  for (const c of chunks) for (let i = 0; i < c.length; i++) peak = Math.max(peak, Math.abs(c[i]))
  if (peak === 0) return null
  await Bun.write(path, writeWav(path, chunks, ctx.sampleRate))
  return path
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
    case "stop":
      scheduler.stop()
      send({ event: "stopped" })
      break
    case "set_volume":
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
