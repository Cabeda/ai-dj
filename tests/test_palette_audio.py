import os
import shutil
import struct
import time
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "packages", "strudel", "host.bundle.mjs")


def _peak(path):
    with open(path, "rb") as f:
        data = f.read()
    n = (len(data) - 44) // 2
    if n <= 0:
        return 0
    vals = struct.unpack("<%dh" % n, data[44:])
    return max(abs(v) for v in vals)


@unittest.skipUnless(shutil.which("bun") and os.path.exists(BUNDLE),
                     "bun or the built host is not available")
class PaletteAuditTests(unittest.TestCase):
    """Every palette instrument must actually make sound on the real host.

    This is the guard against silent regressions: a wrong sample name renders
    an empty WAV without erroring, so nothing else would catch it.
    """

    def test_every_strudel_instrument_produces_audio(self):
        from ai_dj import palette
        from ai_dj.backend import make_strudel_backend

        be = make_strudel_backend(log=lambda *a: None)
        silent = []
        checked = 0
        try:
            be.boot(timeout=90)
            for ins in palette.for_backend(palette.STRUDEL):
                sid = ins.realisations[palette.STRUDEL]
                if ins.family in ("drums", "fx", "breaks"):
                    code = f's("{sid}").gain(0.9)'
                else:
                    code = f'note("c3 e3").s("{sid}").gain(0.9).slow(2)'
                be.play(code)
                time.sleep(1.5)  # let lazy sample loading settle
                out = "/tmp/ai_dj_palette_audit.wav"
                path = be.capture(out, 1)
                checked += 1
                if not path or _peak(path) < 50:
                    silent.append(f"{ins.name}={sid}")
        finally:
            be.shutdown()
        self.assertGreater(checked, 40)
        self.assertEqual(silent, [], f"instruments with no audio: {silent}")


if __name__ == "__main__":
    unittest.main()
