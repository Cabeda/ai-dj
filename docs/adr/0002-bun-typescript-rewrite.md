# Rewrite the product in Bun/TypeScript, tests first

## Status

accepted

## Context

ai-dj is split across two runtimes: the product logic (state machine, DJ loop,
templates, LLM client, session store, audio analysis) is ~1500 lines of tested
Python, and the clients (OpenTUI terminal app, and now a web app) are
TypeScript. The web app needs a shared sound engine and a shared protocol
client as real npm packages, the TUI must become distributable via npm/npx,
and the team (one developer, plus agents) wants a single language, a single
test runner, and a single deployable.

The product goals for this generation: one always-on radio **Station** with open
**Steering**, served from one Fly machine; the browser runs its own Strudel
engine and renders audio locally from the server-owned script; the web app is
Astro + React.

## Decision

1. Rewrite the product in Bun/TypeScript, **tests first**: port the test suite
   module by module to `bun:test` (RED), then port each module (GREEN). The
   Python tree keeps passing its own suite until a module reaches parity, then
   the Python original is retired — never both half-alive for the same module.
2. Publish real npm packages from this repo:
   - `@ai-dj/dj` — the brain: palette, state, templates, loop, LLM client,
     session store (`packages/dj/`).
   - `@ai-dj/strudel` — the sound engine: host, renderer, analyzer plus the
     stdio protocol (`packages/strudel/`, moved from `strudel/`).
   - `@ai-dj/client` — the typed protocol client both UIs consume
     (`packages/client/`).
   - The TUI (`apps/tui/`, moved from `tui/`) adopts `@ai-dj/client` and ships
     with a `bin` entry so it installs via npm/npx.
   - The web app (`apps/web/`) is Astro + React: a mostly static page with a
     React island for the player, the live script, and the steering input.
3. The web server is Bun: it serves the page and the API, owns the loop, and
   spawns the Strudel host child — the same process shape as today, one image.
4. Station API is station-scoped from day one (`/stations/main/state`,
   `.../steer`, `.../script`). The station auto-starts on boot with
   `deep_focus` (overridable by env); restart is a fresh start — there is no
   persistence in v1.
5. Frugality is a ported requirement, not a nice-to-have: byte-identical system
   prompts (prompt caching), one-layer patches, `reasoning_effort: none`,
   tick-gated model calls, bounded context. The subscription cost must not rise.

## Considered options

- **Keep the Python brain; publish only the engine and the client.** Lower risk
  and less work, and the TUI's only real overlap with the web app is the
  protocol client anyway. Rejected: the explicit goal is one language, one test
  runner, and npm-native distribution of everything including the TUI.
- **Port without the tests-first discipline.** Rejected: the 100-test suite is
  what makes this product trustworthy (validation gates, non-vocal rule,
  session pruning invariants); porting behaviour without porting the tests
  would silently drop guarantees.
- **Astro without React (pure Astro islands/vanilla TS).** Rejected: the player
  plus the live-updating script plus the steering input is exactly what React
  islands are for, and the team chose it.

## Consequences

- Every Python module is rewritten once, with its tests leading. Until parity,
  the Python suite is the source of truth; after, the `bun:test` suite is.
- `live.py`'s loop, the macOS-only helpers (`nowplaying`, audio devices), and
  the `ffmpeg` probe path are server-only concerns; the web server does not
  need them. The silent-host and offline-render paths carry over unchanged.
- Steering ships open: a bad-words blocklist plus UTF-8 only, no aggregation,
  no summary, no kill switch. Cleanup is explicitly deferred.
- The `lilypond-to-strudel` Python package stays Python; it is a tool, not part
  of the runtime.
