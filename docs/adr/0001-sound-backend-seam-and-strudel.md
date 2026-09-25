# Adopt a pluggable sound backend; target Strudel for browser and embedded desktop

## Status

accepted, outcome recorded 2026-09-25

Strudel became the default headless backend (not just the strategic one): the
tracer-bullet blocker, capture, was solved with a separate-process offline
render, and the engine lives at `packages/strudel/` (`@ai-dj/strudel`) behind
the same seam. Sonic Pi remains opt-in.

Two cleanups from the same pass: the `evolve` op the host answered was dead
surface — no sender ever existed — so it was deleted rather than adopted into
the seam. And on naming: `ruby` stays as the model's wire field (the prompts
and the parsed JSON say `ruby`), while all code variables prefer `script` per
the glossary.

## Context

ai-dj live-codes a music script, listens to its own output, and evolves it with
an LLM. Today the only sound backend is Sonic Pi: a Ruby DSL driving a
SuperCollider/SuperSonic daemon that runs as a separate native process. The
product must also become a single embeddable desktop app and, later, a browser
app with an in-browser LLM — and it must support classical instruments.

Sonic Pi cannot meet those goals: there is no browser path, it cannot be
embedded as a library, it has no orchestral timbres, and it is a heavy native
daemon with a ~15s boot and awkward capture.

## Decision

1. Route all sound through a **SoundBackend** seam — `boot`, `play`, `stop`,
   `set_volume`, `capture`, `shutdown` — so the orchestrator (state machine,
   LLM client, control server, UI) never depends on a specific engine.
2. Keep **Sonic Pi as the terminal backend** for now (it already produces sound
   and works).
3. Target **Strudel** as the strategic backend for the **browser and embedded
   desktop**: it runs in-page on Web Audio, embeds as a library, ships General
   MIDI soundfonts (`gm_*`) for classical voices, reads `.sf2`, can drive Csound
   WASM, and can emit MIDI.
4. Treat **classical support as a sampled-instrument concern**, expressed as an
   **instrument palette** the model must choose from — not as synthesis. Each
   instrument names its realisation per backend, and a backend advertises only
   the instruments it can play.
5. Out-of-process backends speak a **line-delimited JSON stdio protocol** so the
   Strudel host can be a JS process driven by the same contract.

## Considered options

- **Sonic Pi everywhere.** Rejected: no browser path, no embedding, no orchestral
  timbres, heavy native daemon.
- **Strudel everywhere, including the terminal.** Rejected for now: Web Audio has
  no terminal host; it would require `node-web-audio-api` or a headless browser.
  The terminal keeps Sonic Pi.
- **Synthesis only, no samples.** Rejected: classical instruments require
  sampled timbres.

## Consequences

- Adding Strudel becomes an adapter, not a rewrite: the orchestrator, control
  server, UI, and LLM client stay backend-agnostic.
- Strudel is **AGPL-3.0-or-later** (copyleft with a network clause). If ai-dj
  bundles Strudel it must be distributed under AGPL.
- Two backends coexist during the transition: Sonic Pi for the terminal,
  Strudel for browser/desktop.
- Templates, the LLM prompt/reference, and script validation are backend-specific
  and must be rewritten per backend. Strudel code is JavaScript evaluated to
  patterns, so its gate is evaluation, not `ruby -c`.

## Verification (1st tracer bullet)

Built and verified: `strudel/host.ts` runs Strudel headless in **Bun** on Web
Audio (`node-web-audio-api`), driven by the stdio protocol. `boot`, `play`,
`stop`, `set_volume` work; `capture` does not yet.

Two findings that constrain any future implementation:

1. **Strudel must be bundled.** `@kabelsalat/web` ships a UMD bundle with no
   ESM named exports, and `@strudel/core`'s barrel imports `SalatRepl` from it.
   This fails under any ESM runtime (Bun/Node) — Strudel only loads when a
   bundler resolves it (as Vite does for the REPL). `bun build` works.
2. **Bun has no Web Audio**, so a host runtime must supply one. `node-web-audio-api`
   works, and Strudel's draw/scope modules need a few DOM globals shimmed
   (`document`, `window`, `CustomEvent`) before import.

`capture` is the remaining blocker for making Strudel the default backend; the
robust fix is an offline render (`OfflineAudioContext`) of the current pattern
instead of a realtime AudioWorklet tap.

