<div align="center">

# ai-dj

**A generative radio DJ.**

It writes a live set, listens to its own output, and evolves the music with an
LLM — on its own, or with you in the loop.

[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Sound: Strudel](https://img.shields.io/badge/sound-Strudel-7CFFB2)](https://strudel.cc/)
[![Tests](https://img.shields.io/badge/tests-82%20passing-success)](#testing)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](#license)

<img src="docs/diagrams/tui.png" alt="The ai-dj TUI: a status bar, an editable live set, and a feedback box." width="100%">

</div>

---

## Why

Background music for deep work is either a fixed playlist you get tired of, or a
stream you don't control. ai-dj generates it instead: a set that never repeats,
stays **non-vocal by construction**, and drifts the way a DJ would — building,
peaking, breaking down, and settling again.

It is not a chatbot that writes a song once. It is a loop that keeps listening
to what it just played and makes one small change at a time.

## How it works

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/diagrams/flow-dark.svg">
  <img alt="Flow: a vibe prompt is cast into an archetype, a starter plays, then a loop of Listen, Decide, Patch, Play repeats every ten seconds, with human feedback feeding in." src="docs/diagrams/flow-light.svg" width="100%">
</picture>

</div>

1. **Cast** — your vibe prompt picks an **archetype** (one of 16), fixing the
   tempo, key and mode. No model call: this is deterministic.
2. **Play** — a curated **starter** starts immediately, so there is music while
   the first model call runs.
3. **The loop**, every ~10 seconds:
   - **Listen** — capture 10 s of its own output (an offline render, not a mic).
   - **Decide** — the LLM hears that audio plus the current state and returns
     **one layer patch**, not a whole new script.
   - **Patch** — validate it, apply it, re-render the script.
   - **Play** — schedule the result and save a version.
4. **Sections** — an energy arc (`intro → build → peak → breakdown → peak →
   outro`) decides whether to add a layer or strip one back.
5. **You** — edit the script directly, or send *guide* / *replace* feedback from
   the TUI at any time.

The loop is built to be cheap: the system prompt is byte-identical on every call
(so it is fully prompt-cached), the model only ever returns one layer, and
reasoning is off by default.

## Quick start

### Requirements

| | |
|---|---|
| **Python** | 3.10 or newer |
| **Bun** | 1.1+ — runs the Strudel sound host and the TUI |
| **ffmpeg** | on `PATH` — transcodes captures to the mp3 the model hears |
| **A model** | an [opencode Zen Go](https://opencode.ai) key, *or* a local `llama.cpp` server |

Strudel is the default backend and needs no external daemon. Sonic Pi is
optional — see [`--backend sonic_pi`](#configuration).

### Install

```bash
git clone https://github.com/Cabeda/ai-dj.git
cd ai-dj

# 1. the Python package and the `ai-dj` command
python3 -m venv .venv && source .venv/bin/activate
pip install -e .

# 2. the Strudel sound host (installs its deps and bundles the host)
bash strudel/build.sh

# 3. the TUI
(cd tui && bun install)

# 4. your API key (loaded from ~/env by default)
echo 'export OPENCODE_API_KEY="sk-..."' > ~/env
```

### Run

```bash
ai-dj tui
```

Nothing plays until you pick a **starting point** — the picker lists the
archetypes by group, your recent sets, and *Surprise me* (let the model write
the opening set from scratch). Choose one and the set starts.

Prefer no install? The repo ships a launcher that runs straight from a checkout:

```bash
./ai-dj tui
```

Skip the picker by naming the start up front:

```bash
ai-dj archetypes                      # what you can start from
ai-dj tui --archetype downtempo       # a named template
ai-dj tui --prompt "deep focus"       # a vibe guide for the model
ai-dj tui --surprise                  # let the model write it
ai-dj pick <session-id>               # resume a saved set
```

Hear a starter without any model or audio, to check your setup:

```bash
./ai-dj dry --archetype techno
```

## The TUI

| Key | Action |
|---|---|
| `↑`/`↓` + `enter` | pick a starting point (at launch) |
| `shift+enter` | apply the script you edited |
| `ctrl+a` | select the whole script — then type or paste to replace it |
| `ctrl+p` | pause / continue — silences the set and freezes the loop |
| `ctrl+o` | freeze / unfreeze — keep playing, but stop the AI changing it |
| `ctrl+l` | browse past sessions — name them, favourite them, load one |
| `enter` *(feedback box)* | send **guide** feedback — nudge the set |
| `shift+enter` *(feedback box)* | send **replace** feedback — swap the whole vibe |
| `ctrl+y` | copy the focused pane as clean text |
| `ctrl+k` | command palette — paste/select the script, copy, reset, modes, sessions, **show/hide logs** |
| `tab` | switch between the script and the feedback box |
| `ctrl+q` | quit |

**Pause** stops the audio *and* the loop — no captures, no model calls — so a
paused session costs nothing and continues exactly where it left off. Applying
a script (`shift+enter`) resumes a paused set: asking for a script to play is a
request to hear it.
**Freeze** is different: the music keeps playing, but the DJ stops touching the
script, so the set only changes when you edit it. The status bar shows
`· frozen` while it is on.

Drag to select with the mouse and your terminal copies natively — the TUI does
not capture the mouse. To **swap in a whole new script**, use the palette's
*Paste script from clipboard* (one step), or `ctrl+a` then paste. A script you
paste *is* the set from then on: it plays immediately, and if it is a complete
program of its own the DJ evolves it as one piece rather than rebuilding it
from the generated layers. The **log is hidden by default**; toggle it from the
command palette:

<div align="center">

<img src="docs/diagrams/tui-palette.png" alt="The command palette (ctrl+k), filtered to the 'Show logs' command." width="85%">

</div>

## Media controls (macOS)

ai-dj publishes the set to the system **Now Playing** centre, so it shows up in
Control Center and answers the media keys like any other player:

- **play / pause** — continue or pause the set (same as `ctrl+p`)
- **next** — skip to the next section of the energy arc
- the volume slider controls the machine's output, which is already ai-dj's

It is best-effort: it needs `swiftc` (Xcode command line tools) and is a silent
no-op everywhere else. Disable it with `AI_DJ_NOWPLAYING=0`.

## Architecture

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/diagrams/architecture-dark.svg">
  <img alt="Architecture: TUI talks over HTTP to a control server, which feeds the DJ loop. The loop uses sessions and an LLM client, and drives a sound backend through a SoundBackend seam (Strudel or Sonic Pi)." src="docs/diagrams/architecture-light.svg" width="100%">
</picture>

</div>

The orchestrator (state machine, LLM client, control server, UI) never depends on
a specific engine. All sound goes through a **`SoundBackend`** seam —
`boot` / `play` / `stop` / `set_volume` / `capture` / `shutdown`:

- **Strudel** *(default)* — headless [Strudel](https://strudel.cc) on Web Audio,
  running in Bun via `node-web-audio-api`, driven over line-delimited JSON on
  stdio. Capture is an `OfflineAudioContext` render, so it needs no audio device
  and is exact.
- **Sonic Pi** *(optional)* — the original backend; a native daemon driven over
  OSC.

Why Strudel, and the packaging constraints it brings, are recorded in
[`docs/adr/0001`](docs/adr/0001-sound-backend-seam-and-strudel.md).

## Instruments and archetypes

The model may only choose from a closed **instrument palette** — 73 instruments,
each with a per-backend realisation:

- **General MIDI soundfonts** (`gm_violin`, `gm_cello`, `gm_piano`, …) for the
  classical palette,
- **real samples** via VCSL (`harp`, `timpani`, `marimba`, …),
- **drum machines** (`RolandTR909_*`, `RolandTR808_*`, …),
- **whole drum breaks** (`break_amen`, `break_think`, `break_apache`, …) from
  [clean-breaks](https://github.com/yaxu/clean-breaks) and
  [Dough-Amen](https://github.com/Bubobubobubobubo/Dough-Amen) — a recorded loop
  rather than a one-shot, which is what the trip-hop `downtempo` archetype is
  built on.

The palette is generated into the model's prompt at build time
(`palette.as_markdown()`), so the reference can never drift from what actually
plays. The sample banks the palette names are prebaked by the host, so a set can
use them without a `samples(...)` call of its own.

**16 archetypes** cover focus and classical material, grouped as `electronic`
(techno, house, downtempo, synthwave), `focus` (ambient, deep_focus, drone,
lofi_study, piano_study, vibes_room, marimba_room) and `classical`
(string_quartet, chamber, orchestral, solo_piano, harp_strings). `ai-dj
archetypes` lists them; the TUI picker shows the same list at startup, so you
never have to start from something random. A test enforces that **no archetype
uses a vocal patch**.

## Configuration

### Models

```bash
# opencode Zen Go (default) — needs OPENCODE_API_KEY
ai-dj tui --model mimo-v2.6-flash

# a local llama.cpp server (no key; audio support depends on the model)
ai-dj models                       # list what is loaded
ai-dj tui --local --model <name>
```

### Flags

| Flag | Meaning |
|---|---|
| `--backend {strudel,sonic_pi}` | sound engine (default `strudel`) |
| `--archetype NAME` | start from this template (`ai-dj archetypes`) |
| `--prompt "..."` | start from a vibe guide for the model |
| `--surprise` | let the model write the opening set |
| `--seed N` | deterministic archetype choice instead of the picker |
| `--record [DIR]` | save every capture as a WAV (default `<session>/audio`) |
| `--reasoning {none,low,medium,high}` | reasoning effort (default `none`) |
| `--no-reference` | drop the language reference from the prompt |
| `--env PATH` | file holding `OPENCODE_API_KEY` (default `~/env`) |

### Commands

```
ai-dj tui [--archetype N]  live TUI: pick a starting point, edit, send feedback
ai-dj new [--archetype N]  fresh session, live-coded, in the terminal
ai-dj archetypes           list the starting points
ai-dj pick <session-id>    resume a saved session
ai-dj list                 list saved sessions
ai-dj models               list models on the local llama.cpp server
ai-dj probe [--audio F]    one-shot listen + decide
ai-dj dry [--archetype N]  render a starter, no audio
```

## Sessions

Every evolve is saved as a numbered version under `sessions/<id>/`, with
`last.mjs` symlinked to the newest. History is bounded (`KEEP_VERSIONS = 200`)
so an all-day run cannot fill the disk, and pruning is per-extension so a
symlink can never be orphaned.

`ctrl+l` opens the browser: saved sets on the left with their date, the
selected script on the right. From there you can **name** a session (`n`),
**favourite** it (`f` — favourites sort to the top), and **load** its script
into the running set (`enter`). The name and favourite live in
`sessions/<id>/meta.json`. Resume from the command line with
`ai-dj pick <id>`.

## Contributing

```bash
python3 -m unittest discover -s tests     # 82 tests (~3 min; some render audio)
(cd tui && bunx tsc --noEmit -p tsconfig.json)   # typecheck the TUI
bash strudel/build.sh                     # rebuild the host after editing strudel/*.ts
python3 scripts/make_diagrams.py          # regenerate the README diagrams
```

A few conventions worth knowing:

- **`CONTEXT.md` is the glossary** and the source of truth for vocabulary
  (Backend, Script, Layer, Archetype, Casting, …). Use its words.
- **Architecture decisions live in `docs/adr/`.** Add one when you change a
  load-bearing decision.
- **`strudel/*.bundle.mjs` is generated** and gitignored — edit the `.ts` and
  run `strudel/build.sh`, never the bundle.
- **The palette is closed.** Adding an instrument means adding it to
  `ai_dj/palette.py`; it reaches the model automatically.
- **Non-vocal is a rule, not a default.** No archetype may introduce a voice
  patch.

### Testing

The suite covers the backend seam, the palette (including a render-audit that
every Strudel instrument produces audio), session versioning, the archetypes,
the quality metrics, and reference-replication against public-domain scores.

## License

ai-dj is [MIT licensed](LICENSE). It depends on **Strudel**, which is
**AGPL-3.0-or-later** — a distribution that bundles the Strudel host must comply
with the AGPL. See
[`docs/adr/0001`](docs/adr/0001-sound-backend-seam-and-strudel.md).
