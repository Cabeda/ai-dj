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
| `stop` | works |
| `set_volume` | best-effort (master gain) |
| `capture` | **not working** — the realtime AudioWorklet tap reports failure rather than feeding silence to the model |

`capture` is the remaining blocker for switching the default backend. The
robust fix is an **offline render** (`OfflineAudioContext`) of the current
pattern rather than a realtime tap.

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
