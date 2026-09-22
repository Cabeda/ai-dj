#!/usr/bin/env bash
# Bundle the Strudel host. Bundling is required: @kabelsalat/web ships a UMD
# bundle with no ESM named exports, which breaks @strudel/core's barrel under
# Bun/Node ESM. node-web-audio-api stays external (native addon).
set -euo pipefail
cd "$(dirname "$0")"
bun install
bun build host.ts --target=bun --external node-web-audio-api --outfile host.bundle.mjs
echo "built strudel/host.bundle.mjs"
