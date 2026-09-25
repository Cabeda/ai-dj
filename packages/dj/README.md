# @ai-dj/dj

The ai-dj brain: instrument palette, DJ state machine, archetypes, session
store, and LLM client — ported module by module from `ai_dj/` (Python), tests
first. See `docs/adr/0002-bun-typescript-rewrite.md` for why.

```bash
bun install          # from the repo root
bun test             # fast, pure-logic suites
bunx tsc --noEmit    # typecheck
```

## Parity

Until a module reaches parity its Python tests are the source of truth; after,
the `bun:test` suite here is. Ported so far: `palette`, `state`, `templates`,
`session`, `llm`. Still Python-only: the loop (`live.py`), the stdio backend,
quality/similarity scoring.

Cross-checked, not just eyeballed: TypeScript `asMarkdown()` output is
byte-identical to Python `as_markdown()`, and all 17 archetypes render
identically given explicit bpm/key/mode.

## Publishing

Not published yet. When it is: `package.json` already carries the name,
version, `exports` and `files` fields; `bun publish` from this directory.
