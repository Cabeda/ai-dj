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

const { OfflineAudioContext } = await import("node-web-audio-api")

// superdough's reverb generator builds its own OfflineAudioContext and waits on
// `context.oncomplete`. node-web-audio-api resolves startRendering() as a
// promise instead, so that callback never fires and the reverb impulse response
// never resolves -> the render hangs forever. Bridge the promise to the
// callback so reverb works offline.
{
  const proto = OfflineAudioContext.prototype as any
  const realStart = proto.startRendering
  proto.startRendering = function () {
    const p = realStart.call(this)
    if (typeof p?.then === "function") {
      p.then((buffer: any) => {
        try {
          this.oncomplete?.({ renderedBuffer: buffer })
        } catch {}
      })
    }
    return p
  }
}
const core = await import("@strudel/core")
const mini = await import("@strudel/mini")
const { transpiler } = await import("@strudel/transpiler")
const { registerSynthSounds, registerZZFXSounds } = await import("@strudel/webaudio")
const { registerSoundfonts } = await import("@strudel/soundfonts")
const sd = await import("superdough")
const { SuperdoughAudioController } = await import("superdough/superdoughoutput.mjs")
await import("@strudel/tonal")

await core.evalScope(core, mini)

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

async function render(req: any) {
  const { script, seconds, cps, out } = req
  const sampleRate = 48000
  const oc = new OfflineAudioContext({
    numberOfChannels: 2,
    length: Math.ceil(seconds * sampleRate),
    sampleRate,
  })
  sd.setAudioContext(oc)
  sd.setSuperdoughAudioController(new SuperdoughAudioController(oc))
  await sd.initAudio({})

  // resolve the pattern (no scheduler needed: queryArc is pure)
  const { pattern } = await core.evaluate(script, transpiler)
  const haps = pattern
    .queryArc(0, seconds * cps, { _cps: cps })
    .sort((a: any, b: any) => a.whole.begin.valueOf() - b.whole.begin.valueOf())

  // Fetch + decode every sample the window needs, before scheduling. Decoding
  // is async and the sampler discards a node whose fetch outran its start time.
  const needed = new Set<string>()
  for (const hap of haps) {
    if (!hap.hasOnset() || !hap.value?.s) continue
    const v = hap.value
    const key = `${v.s}:${v.n ?? 0}:${v.bank ?? ""}`
    if (needed.has(key)) continue
    needed.add(key)
    try {
      await sd.getSampleBufferSource(v, v.bank, undefined)
    } catch {}
  }

  for (const hap of haps) {
    if (!hap.hasOnset()) continue
    try {
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
  let peak = 0
  for (let i = 0; i < left.length; i++) peak = Math.max(peak, Math.abs(left[i]))
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
