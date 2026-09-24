# AGENTS.md

Guidance for AI coding agents working in this repo. Humans are welcome too.

## What this is

`ai-dj` is a generative radio DJ. It casts an archetype from a vibe prompt,
plays a starter, then loops: **capture ~10 s of its own output → ask an LLM for
one layer patch → validate → re-render → play → save a version**. A Bun/OpenTUI
app lets a human edit the script and send guide/replace feedback.

Two backends sit behind a `SoundBackend` seam. **Strudel is the default**
(headless Web Audio in Bun); Sonic Pi is opt-in. See
`docs/adr/0001-sound-backend-seam-and-strudel.md`.

## Commands

```bash
# install
python3 -m venv .venv && source .venv/bin/activate && pip install -e .
bash strudel/build.sh          # installs strudel deps + bundles the host
(cd tui && bun install)

# verify — run these before you claim something works
python3 -m unittest discover -s tests            # 82 tests, ~3 min (some render audio)
(cd tui && bunx tsc --noEmit -p tsconfig.json)   # TUI typecheck
bash strudel/build.sh                            # after editing strudel/*.ts

# docs images (committed)
python3 scripts/make_diagrams.py                 # SVG (+PNG via rsvg-convert)

# try it without a model or audio
./ai-dj dry --seed 1
```

The test suite is slow because several tests boot the real Strudel host and
render audio. Run a single module while iterating:
`python3 -m unittest tests.test_lang -v`.

## Layout

| Path | What lives there |
|---|---|
| `ai_dj/live.py` | the DJ loop: casting, ticks, sections, evolve, validation |
| `ai_dj/state.py` | `DJState` — layers, energy arc, render/parse, deterministic variation |
| `ai_dj/backend.py` | `SoundBackend` seam, `StdioBackend`, `make_strudel_backend` |
| `ai_dj/palette.py` | the closed instrument palette + `as_markdown()` |
| `ai_dj/strudel_templates.py` | the 16 archetypes |
| `ai_dj/llm.py` | prompts, reference loading, Zen Go / llama.cpp clients |
| `ai_dj/reference/*.md` | the per-language reference appended to the prompt |
| `ai_dj/session.py` | versioned session storage + `meta.json` (name, favourite) |
| `ai_dj/nowplaying.py` | macOS Now Playing / media-key integration (`tools/nowplaying.swift`) |
| `ai_dj/control.py` | the HTTP control surface shared with the TUI |
| `ai_dj/tui.py` | launches the loop + control server + the Bun TUI |
| `ai_dj/quality.py`, `ai_dj/similarity.py` | audio quality and reference-replication scoring |
| `strudel/host.ts` | the Bun Strudel host (stdio JSON) |
| `strudel/render.ts` | the offline renderer, in its own process |
| `strudel/analyze.ts` | symbolic note extraction for the similarity tests |
| `tui/index.ts` | the OpenTUI app |
| `CONTEXT.md` | **the glossary — read it first** |
| `docs/adr/` | architecture decision records |

## Invariants

- **`CONTEXT.md` is the vocabulary.** Backend, Script, Layer, Archetype,
  Casting, Guide/Replace feedback, Language. Use those words in code, comments
  and commits.
- **Language ≠ backend.** `sonic_pi` and `strudel` are *languages* (syntax,
  reference doc, validator). A backend is the thing that makes sound. Sonic Pi
  is always `sonic_pi`; Strudel is always `strudel`.
- **The palette is closed.** The model may only use instrument ids from
  `ai_dj/palette.py`. The table is appended to the prompt at build time, so
  adding an instrument there is enough.
- **Non-vocal by construction.** No archetype may use a voice patch; a test
  enforces it. This is a product rule, not a preference.
- **The system prompt is byte-identical on every call** so it stays
  prompt-cached. Everything variable goes in the user message.
- **Validate before mutating.** A bad patch must never overwrite the last-good
  layers.
- **A pasted script is the set.** If a script does not decompose into
  `// layer:` blocks it is *opaque* (`DJState.opaque`): kept verbatim and
  evolved as one piece (`WHOLE_LAYER`). Never rebuild an opaque set from the
  layer model — that resurrects the previous set, which the user hears as both
  sets playing at once.
- **`strudel/*.bundle.mjs` is generated and gitignored.** Edit the `.ts`, run
  `strudel/build.sh`.
- **stdout is the protocol.** The Strudel host and renderer must never write
  anything but JSON to stdout (see gotchas).
- **Anything a human presses must not wait for a tick.** The loop blocks in
  `wake.wait(tick)` for up to 10s, so media keys / Now Playing commands are
  handled in the watcher (~0.2s), never in the tick body.
- **Three loop modes, and they are different.** `paused` silences the set and
  freezes the loop; `autopilot` off keeps playing but stops the DJ changing the
  script; neither is the same as the process stopping.
- **Nothing plays until a starting point is chosen.** The TUI shows the picker
  while `Control.awaiting_start` is true, and `tui.launch` does not call
  `live.run` until `Control.await_start()` returns. Command-line
  `--archetype`/`--prompt`/`--seed`/session means `mark_started()` and goes
  straight in. Every archetype belongs to exactly one `ARCHETYPE_GROUPS` entry
  (a test enforces it) so the picker cannot silently drop one.

## Gotchas

These cost real debugging time; they are not obvious from the code.

**Strudel host (`strudel/*.ts`)**

- Strudel **must be bundled**: `@kabelsalat/web` ships a UMD bundle with no ESM
  named exports and `@strudel/core`'s barrel imports `SalatRepl` from it, which
  breaks under any ESM runtime. `bun build` resolves it.
- Bun has **no Web Audio**; `node-web-audio-api` supplies it. Keep it
  `--external` (native addon).
- Do **not** import `SuperdoughAudioController` from
  `superdough/superdoughoutput.mjs` — it is a second module instance of the
  context singleton and builds a stray live `AudioContext`. Use
  `setSuperdoughAudioController(null)` and let superdough build it.
- Do **not** shadow `ctx.destination` — superdough reads
  `destination.maxChannelCount`, which a shadowed node reports as `0`.
  `set_volume` is therefore a no-op; volume is per-event `gain`.
- superdough's `reverbGen` waits on `context.oncomplete`, which
  `node-web-audio-api` never fires, so `room()` hangs. `createReverb` is
  overridden with a self-generated IR — and that override must be installed
  **after** the superdough import.
- `setcpm`/`setcps` must be registered in `core.evalScope`, or a script's
  opening `setcpm(...)` hangs the transpiler instead of erroring.
- **`evalScope` must include the `webaudio` module** — in the host *and* the
  renderer. Without it a script calling `samples(...)` throws
  `samples is not defined`; the host then keeps the previous pattern and a
  manual edit silently does nothing.
- A `play` that the engine rejects must not be reported as success. `play`
  returns a bool; `apply_manual` and the evolve path roll back and say why.
- Capture runs in a **separate process** (`render.ts`) — in-process it races the
  live scheduler and renders silence. Use `Bun.spawn` (async); `spawnSync`
  blocks the event loop and stutters the music.
- **Silence `console.*` before importing Strudel.** superdough logs a deprecation
  warning per scheduled node; on stdout that corrupts the JSON protocol.
- **`SAMPLE_MAPS` must stay identical in `host.ts` and `render.ts`.** A script
  has to render the same way offline as it plays live; drift means captures
  disagree with what you heard. Prebaking a bank only registers its sample URLs
  (cheap) — the audio still loads lazily.

**TUI (`tui/index.ts`)**

- The TUI **does not capture the mouse** (`useMouse: false`) on purpose, so
  terminal-native select-to-copy works. `ctrl+y` copies clean text.
- OpenTUI renders **diffs**, so raw pty bytes cannot be searched for a full
  string. To assert on the screen, use `@opentui/core/testing`'s
  `createTestRenderer().captureCharFrame()`.
- `renderer.destroy()` can hang on an active render pass, so quitting calls
  `process.exit(0)` — but that skips OpenTUI's terminal restore. Always call
  `restoreTerminal()` first (it is idempotent), including on `uncaughtException`
  and on SIGTERM from the launcher, or the terminal is left in the alternate
  screen with mouse reporting on.

**Platform / misc**

- macOS has no `timeout`; use `perl -e 'alarm N; exec @ARGV' …`.
- `llm.load_env_key` matches `export OPENCODE_API_KEY=…`, so the env file needs
  the `export ` prefix (or set the variable in the environment).
- The launcher `./ai-dj` must stay executable (mode `100755`).

## Testing

- Tests live in `tests/` and use `unittest`. Audio-dependent tests skip nothing —
  they render for real, which is why the suite takes minutes.
- **The suite must stay silent and invisible.** `make_strudel_backend` is
  silent by default (the app passes `silent=False`), and `live.run` only
  publishes to Now Playing when the backend is not silent. Never make a test
  play audio or register with the OS UI; if you add a test that boots the host,
  assert `be.silent`.
- `tests/references/*.strudel` are public-domain scores used to check that the
  similarity scorer recognises real music. Keep the analyzer's note order
  (interval histograms are order-sensitive).
- New behaviour that fixes a bug should come with a regression test that would
  have failed before the fix.

## Commits

Conventional Commits, imperative mood, scope when it helps
(`fix:`, `feat(tui):`, `docs:`, `chore:`). The body explains **why** — the
mechanism, not the diff. Do not commit secrets; `.env`, `env`, `sessions/` and
`logs/` are gitignored.
