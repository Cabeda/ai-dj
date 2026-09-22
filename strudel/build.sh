#!/usr/bin/env bash
# Bundle the Strudel host and the offline renderer. Bundling is required:
# @kabelsalat/web ships a UMD bundle with no ESM named exports, which breaks
# @strudel/core's barrel under Bun/Node ESM. node-web-audio-api stays external
# (native addon).
set -euo pipefail
cd "$(dirname "$0")"
bun install
bun build host.ts   --target=bun --external node-web-audio-api --outfile host.bundle.mjs
bun build render.ts --target=bun --external node-web-audio-api --outfile render.bundle.mjs
echo "built strudel/host.bundle.mjs and strudel/render.bundle.mjs"
