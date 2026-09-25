#!/usr/bin/env python3
"""Regenerate packages/dj/src/furEliseScore.ts from ai_dj/fur_elise_score.py.

The note strings are kilobytes of transcription; copying them by hand would
rot. Run from the repo root:  python3 packages/dj/scripts/genFurEliseScore.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))
from ai_dj import fur_elise_score as f  # noqa: E402

out = (
    "// GENERATED from ai_dj/fur_elise_score.py — do not edit by hand.\n"
    "// Regenerate with: python3 packages/dj/scripts/genFurEliseScore.py\n"
    f"export const FUR_ELISE_BPM = {f.FUR_ELISE_BPM};\n"
    f"export const FUR_ELISE_RIGHT_HAND = {json.dumps(f.FUR_ELISE_RIGHT_HAND)};\n"
    f"export const FUR_ELISE_LEFT_HAND = {json.dumps(f.FUR_ELISE_LEFT_HAND)};\n"
)
dest = os.path.join(os.path.dirname(__file__), "..", "src", "furEliseScore.ts")
with open(dest, "w") as fh:
    fh.write(out)
print(f"wrote {dest} ({len(out)} chars)")
