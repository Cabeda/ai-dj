#!/usr/bin/env python3
"""Convert a MusicXML piano score to a note-accurate Strudel script.

Requires the optional `music21` package. Import ABC files with music21 when
supported, or open them in MuseScore and export as MusicXML first.
"""
from __future__ import annotations

import argparse
import sys


def strudel_pitch(midi: int) -> str:
    names = ("c", "cs", "d", "ds", "e", "f", "fs", "g", "gs", "a", "as", "b")
    return f"{names[midi % 12]}{midi // 12 - 1}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("score", help="MusicXML/MXL path (or ABC if music21 supports it)")
    parser.add_argument("-o", "--output", help="output .strudel.js (default: stdout)")
    parser.add_argument("--tempo", type=float, help="override quarter-note BPM")
    args = parser.parse_args()
    try:
        from music21 import converter, tempo
    except ImportError:
        print("Install converter dependency: python3 -m pip install music21", file=sys.stderr)
        return 2

    score = converter.parse(args.score)
    marks = score.flatten().getElementsByClass(tempo.MetronomeMark)
    bpm = args.tempo or (float(marks[0].number) if marks and marks[0].number else 72.0)
    parts = list(score.parts)
    if not parts:
        parts = [score]
    lines = [f"// Converted from {args.score}", f"setcpm({bpm:g} / 4)", ""]
    for pi, part in enumerate(parts):
        events = []
        for element in part.flatten().notesAndRests:
            duration = float(element.duration.quarterLength)
            # Use a rational-ish cycle expression; event durations are measured
            # in quarter notes, while one Strudel cycle is one 4/4 bar.
            span = duration / 4
            dur = f"{span:.8g}"
            if element.isRest:
                events.append(f"~@{dur}")
            else:
                pitches = [strudel_pitch(p.midi) for p in element.pitches]
                token = pitches[0] if len(pitches) == 1 else "[" + ",".join(pitches) + "]"
                events.append(f"{token}@{dur}")
        lines.append(f"// Part {pi + 1}: {part.partName or 'Piano'}")
        lines.append("note(\"" + " ".join(events) + "\").s(\"piano\")")
        lines.append("")
    output = "\n".join(lines)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(output)
    else:
        print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
