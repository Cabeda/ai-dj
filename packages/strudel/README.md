# Strudel sound host

Headless [Strudel](https://strudel.cc) running on Web Audio inside Bun, driven
by ai-dj over line-delimited JSON on stdio. This is the single-backend target
from `docs/adr/0001-sound-backend-seam-and-strudel.md`: it can run in the
terminal (Bun), in an embedded desktop shell, and in the browser.

## Status

| op | status |
| --- | --- |
| `boot` | works (~0.9s) |
| `play` | works — evaluates Strudel code and schedules it |
| `evolve` | works — preview a layer change without committing it |
| `stop` | works |
| `set_volume` | no-op — volume is per-event `gain` (a master node breaks superdough, see below) |
| `capture` | **works** — offline render via Strudel's own `renderPatternAudio` |

Capture renders the current pattern through an `OfflineAudioContext` (the same
path the REPL's "export" uses): exact, needs no audio device, and works for both
built-in synths and the `gm_*` soundfonts. Output is a stereo 48kHz WAV.

## Known constraints

- **No master volume node.** SuperDough reads `audioContext.destination.maxChannelCount`
  when building its output. Shadowing `destination` with a `GainNode` makes that
  read `0` and node creation fails with `Invalid number of channels: 0`. Volume
  is therefore applied per event via `gain`. A real master bus needs a different
  approach.
- **Sampled instruments are samples, not synths.** `s("bd")` and `s("gm_violin")`
  need their banks registered. `registerSynthSounds` covers built-in synths;
  `registerSoundfonts` covers the General MIDI palette. Drum samples still need
  a sample pack or a bank.


## Build

Bundling is required, not optional:

```
bash build.sh
```

Two packaging gotchas, both documented in the ADR:

1. **`@kabelsalat/web` ships a UMD bundle with no ESM named exports.** `@strudel/core`'s
   barrel imports `SalatRepl` from it, which fails under any ESM runtime
   (Bun/Node). It only works through a bundler (Vite in the Strudel REPL).
   `bun build` resolves it.
2. **Bun has no Web Audio.** We supply one with `node-web-audio-api`
   (Rust/napi). Its `polyfill.js` installs the globals Strudel expects. Strudel's
   draw/scope modules also touch `document`/`window` at import time, so the host
   shims a few DOM globals before importing.

`node-web-audio-api` must stay external (`--external node-web-audio-api`) — it is
a native addon.

## Protocol

See the docstring in `ai_dj/backend.py`.
