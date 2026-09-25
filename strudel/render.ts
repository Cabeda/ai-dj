// Offline renderer for ai-dj — a fresh process, invoked by the host over stdio.
//
// Why a separate process: superdough keeps the AudioContext, its output
// controller, the sample cache and the decode cache in module-level globals.
// Rendering inside the long-lived host means swapping those globals out from
// under a running scheduler, which races (silent renders, "nodes from
// different contexts"). Here there is no scheduler and no live context, so the
// only context that ever exists is the offline one.
//
// Protocol (one JSON line in, one JSON line out):
//   {"script": "...", "seconds": 2, "cps": 0.275, "out": "/tmp/x.wav"}
//   -> {"ok": true, "path": "...", "peak": 0.12} | {"ok": false, "error": "..."}

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

// stdout is a single JSON reply, so library logging must never touch it.
// Strudel/superdough log through console.* at call time; send it to stderr
// (which the host reads for diagnostics) before the imports below emit.
const quiet = () => {}
console.log = quiet
console.info = quiet
console.debug = quiet
console.warn = (...a: unknown[]) => process.stderr.write(`[render] warn: ${a.map(String).join(" ")}\n`)
console.error = (...a: unknown[]) => process.stderr.write(`[render] error: ${a.map(String).join(" ")}\n`)

const { OfflineAudioContext } = await import("node-web-audio-api")

const core = await import("@strudel/core")
const mini = await import("@strudel/mini")
const { transpiler } = await import("@strudel/transpiler")
const sd = await import("@strudel/webaudio")
const { registerSynthSounds, registerZZFXSounds } = sd
const { registerSoundfonts } = await import("@strudel/soundfonts")

// superdough's reverb builds its impulse response in a *separate*
// OfflineAudioContext (reverbGen) and waits on `context.oncomplete`, which
// node-web-audio-api never fires (it resolves startRendering() as a promise).
// The resulting buffer then belongs to the wrong context and cannot be
// connected. Rather than patch around it, generate the IR in the render
// context: an exponentially-decaying noise burst, one-pole lowpassed.
{
  const { BaseAudioContext } = await import("node-web-audio-api")
  const proto = (BaseAudioContext as any).prototype
  proto.createReverb = function (
    duration = 2,
    fade = 0.1,
    lp = 15000,
    dim = 1000,
    ir?: any,
    irspeed?: number,
    irbegin?: number,
  ) {
    const ac = this
    const convolver = ac.createConvolver()
    convolver.generate = () => {
      const total = Math.max(0.05, duration * 1.5)
      const frames = Math.round(total * ac.sampleRate)
      const decayFrames = Math.max(1, Math.round(duration * ac.sampleRate))
      const fadeFrames = Math.max(0, Math.round(fade * ac.sampleRate))
      const decay = Math.pow(1 / 1000, 1 / decayFrames)
      const buffer = ac.createBuffer(2, frames, ac.sampleRate)
      // one-pole lowpass coefficient from the requested start frequency
      const cutoff = Math.min(lp || 15000, ac.sampleRate / 2)
      const a = 1 - Math.exp((-2 * Math.PI * cutoff) / ac.sampleRate)
      for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch)
        let prev = 0
        for (let i = 0; i < frames; i++) {
          const noise = Math.random() * 2 - 1
          prev += a * (noise - prev)
          let v = prev * Math.pow(decay, i)
          if (fadeFrames && i < fadeFrames) v *= i / fadeFrames
          data[i] = v
        }
      }
      convolver.buffer = buffer
      return buffer
    }
    // superdough calls generate() itself; build it eagerly too so the buffer
    // is present even if that path differs.
    convolver.generate()
    return convolver
  }
}

await import("@strudel/tonal")

// Same eval scope as the host: without `webaudio` a script calling
// `samples(...)` throws here, so every capture of such a set fails.
await core.evalScope(core, mini, sd)

// Scripts open with `setcpm(<bpm>/4)`. The REPL defines it inside repl(); we
// are not the REPL, so without this the call hangs the transpiler instead of
// erroring. Tempo is already carried by `cps`, so these are no-ops that keep
// the script evaluating.
await core.evalScope({
  setcpm: () => (core as any).silence,
  setcps: () => (core as any).silence,
})
registerSynthSounds?.()
registerZZFXSounds?.()
try {
  registerSoundfonts?.()
} catch {}

const SAMPLE_MAPS = [
  "https://raw.githubusercontent.com/felixroos/dough-samples/main/tidal-drum-machines.json",
  "https://raw.githubusercontent.com/felixroos/dough-samples/main/vcsl.json",
  "https://raw.githubusercontent.com/felixroos/dough-samples/main/piano.json",
  // keep in step with host.ts: a script must render the same way offline as it
  // plays live
  "github:yaxu/clean-breaks",
  "github:Bubobubobubobubo/Dough-Amen",
  "github:eddyflux/crate",
]
for (const map of SAMPLE_MAPS) {
  try {
    await sd.samples(map)
  } catch {}
}

function encodeWav(left: Float32Array, right: Float32Array, sampleRate: number) {
  const frames = left.length
  const bytes = frames * 2 * 2
  const buf = Buffer.alloc(44 + bytes)
  buf.write("RIFF", 0)
  buf.writeUInt32LE(36 + bytes, 4)
  buf.write("WAVE", 8)
  buf.write("fmt ", 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20)
  buf.writeUInt16LE(2, 22)
  buf.writeUInt32LE(sampleRate, 24)
  buf.writeUInt32LE(sampleRate * 4, 28)
  buf.writeUInt16LE(4, 32)
  buf.writeUInt16LE(16, 34)
  buf.write("data", 36)
  buf.writeUInt32LE(bytes, 40)
  let o = 44
  for (let i = 0; i < frames; i++) {
    const l = Math.max(-1, Math.min(1, left[i]))
    const r = Math.max(-1, Math.min(1, right[i]))
    buf.writeInt16LE((l * 32767) | 0, o)
    buf.writeInt16LE((r * 32767) | 0, o + 2)
    o += 4
  }
  return buf
}

// hap.value is a control object that superdough reads directly; it is not a
// plain record, so it must be mutated rather than spread into.
function scaleGain(value: any, master: number): void {
  if (master >= 1 || !value || typeof value !== "object") return
  const g = value.gain
  if (g == null) {
    value.gain = master
  } else if (typeof g === "number") {
    value.gain = g * master
  }
  // a string or signal gain cannot be scaled without evaluating it, so it is
  // left alone and the master volume does not apply to that layer
}

async function render(req: any) {
  const { script, seconds, cps, out, volume = 1 } = req
  const master = Math.max(0, Math.min(1, Number(volume)))
  const sampleRate = 48000
  const oc = new OfflineAudioContext({
    numberOfChannels: 2,
    length: Math.ceil(seconds * sampleRate),
    sampleRate,
  })
  sd.setAudioContext(oc)
  // Do NOT construct a controller from the subpath: it is a different
  // module instance of the context singleton, so superdough's own gainNode()
  // would see a null context and build a stray live AudioContext (which made
  // every room() render fail). Setting null makes superdough build it from oc.
  sd.setSuperdoughAudioController(null)
  await sd.initAudio({})

  // resolve the pattern (no scheduler needed: queryArc is pure)
  const { pattern } = await core.evaluate(script, transpiler)
  const haps = pattern
    .queryArc(0, seconds * cps, { _cps: cps })
    .sort((a: any, b: any) => a.whole.begin.valueOf() - b.whole.begin.valueOf())

  for (const hap of haps) {
    if (!hap.hasOnset()) continue
    try {
      scaleGain(hap.value, master)
      await sd.superdough(
        hap.value,
        hap.whole.begin.valueOf() / cps,
        hap.duration / cps,
        cps,
        hap.whole.begin.valueOf(),
      )
    } catch (e: any) {
      // a single bad layer must not abort the whole render
    }
  }

  const buffer = await oc.startRendering()
  const left = buffer.getChannelData(0)
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left
  // peak across every channel: a hard-panned render is not silence
  let peak = 0
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]))
  }
  if (peak < 0.0001) return { ok: false, error: "rendered silence" }
  await Bun.write(out, encodeWav(left, right, buffer.sampleRate))
  return { ok: true, path: out, peak }
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
    let req: any
    try {
      req = JSON.parse(line)
    } catch (e: any) {
      process.stdout.write(JSON.stringify({ ok: false, error: "bad request json" }) + "\n")
      continue
    }
    let res: any
    try {
      res = await render(req)
    } catch (e: any) {
      res = { ok: false, error: String(e?.message ?? e) }
    }
    process.stdout.write(JSON.stringify(res) + "\n")
  }
}
