#!/usr/bin/env python3
"""Repro: does a `supersaw` pad play, and does capture still work after it?

The user's session (`drone`) starts with the padrich layer, which uses
`s("supersaw")`. The log showed:
  [getTrigger] error: processor 'supersaw-oscillator' is not registered
  [webaudio] error: Attempting to connect nodes from different contexts

Exit non-zero if the pad renders silence.
"""
import os
import struct
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ai_dj.backend import make_strudel_backend

PAD = 'note("[d3,f3,a3,d4]").s("supersaw").attack(2).release(4).gain(0.18).slow(8)'
SLOW = 'setcpm(66/4)\n\nstack(\n  note("[d3,f3,a3,d4]").s("supersaw").attack(2).release(4).lpf(800).gain(0.18).slow(8)\n)\n'


def peak(path):
    with open(path, "rb") as f:
        data = f.read()
    n = (len(data) - 44) // 2
    if n <= 0:
        return 0
    return max(abs(v) for v in struct.unpack("<%dh" % n, data[44:]))


def main():
    backend = make_strudel_backend(log=lambda m: print(f"  host: {m}"))
    out = "/tmp/ai_dj_repro.wav"
    failures = []
    try:
        backend.boot(timeout=90)
        for label, script, wait in [
            ("supersaw, quick", PAD, 1.0),
            ("supersaw, after worklet loads", PAD, 3.0),
            ("session script", SLOW, 3.0),
        ]:
            backend.play(script)
            time.sleep(wait)
            path = backend.capture(out, 2)
            p = peak(path) if path else 0
            print(f"{label:32s} peak={p:7d} {'ok' if p > 50 else 'RED'}")
            if p <= 50:
                failures.append(label)
        # does the second capture in a row work? (context-reuse hypothesis)
        backend.play(PAD)
        time.sleep(2)
        first = peak(backend.capture(out, 1) or "")
        second = peak(backend.capture(out, 1) or "")
        print(f"{'two captures in a row':32s} first={first} second={second}")
        if second <= 50:
            failures.append("second capture after a first")
    finally:
        backend.shutdown()
    print("RESULT:", "RED" if failures else "GREEN", failures)
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
