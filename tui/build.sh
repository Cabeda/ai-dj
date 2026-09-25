#!/usr/bin/env bash
# Build the TUI as a single executable.
#
# `bun build --compile` embeds the JS bundle *and* OpenTUI's native library,
# parser worker and Tree-sitter WASM, so the result runs on a machine with no
# Bun and no `tui/node_modules`. `ai_dj/tui.py` prefers this binary when it
# exists and falls back to `bun run` otherwise.
#
#   bash tui/build.sh                    # host platform
#   bash tui/build.sh bun-linux-x64      # cross-target (see below)
#
# Cross-targets: the docs' matrix is darwin-x64/arm64, linux-x64/arm64
# (glibc and musl) and win32-x64/arm64. Install every target's native package
# first, and define OPENTUI_LIBC at build time on Linux so Bun can drop the
# branch it does not need:
#
#   bun install --os="*" --cpu="*" @opentui/core@<version>

set -euo pipefail
cd "$(dirname "$0")"

target="${1:-}"
out="${2:-ai-dj-tui}"

# OPENTUI_LIBC is read at build time on Linux; default to glibc, matching Bun.
libc="${OPENTUI_LIBC:-glibc}"

args=(build --compile ./index.ts --outfile "$out")
if [[ -n "$target" ]]; then
  args+=(--target "$target")
  # a Linux target needs the libc pinned, or Bun keeps both selection branches
  case "$target" in
    *linux*)
      args+=(--define "process.env.OPENTUI_LIBC=\"$libc\"")
      ;;
  esac
fi

bun "${args[@]}"

size=$(du -h "$out" | cut -f1)
echo "built $out ($size) — ai-dj will use it automatically"
