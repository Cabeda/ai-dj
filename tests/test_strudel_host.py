import os
import shutil
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "strudel", "host.bundle.mjs")


class StrudelHostTests(unittest.TestCase):
    """Integration: the Bun Strudel host speaks the backend protocol.

    Skipped when bun or the built host is missing. Plays `silence` so the test
    makes no noise.
    """

    def setUp(self):
        if not shutil.which("bun") or not os.path.exists(BUNDLE):
            self.skipTest("bun or strudel/host.bundle.mjs not available")

    def test_boot_play_stop_shutdown(self):
        from ai_dj.backend import make_strudel_backend

        be = make_strudel_backend(log=lambda *a: None)
        self.assertEqual(be.name, "strudel")
        self.assertIn("violin", be.instruments())
        try:
            be.boot(timeout=60)
            be.play("silence")
            be.stop()
        finally:
            be.shutdown()
        self.assertIsNone(be.proc)

    def test_capture_renders_real_audio(self):
        from ai_dj.backend import make_strudel_backend

        out = "/tmp/ai_dj_test_cap.wav"
        if os.path.exists(out):
            os.unlink(out)
        be = make_strudel_backend(log=lambda *a: None)
        try:
            be.boot(timeout=60)
            be.play('note("c3 e3 g3 c4").s("sawtooth").gain(0.4).slow(2)')
            path = be.capture(out, 1)
        finally:
            be.shutdown()
        self.assertEqual(path, out)
        self.assertTrue(os.path.exists(out))
        with open(out, "rb") as f:
            data = f.read()
        self.assertGreater(len(data), 44)
        self.assertEqual(data[:4], b"RIFF")

    def test_capture_of_silence_yields_a_quiet_wav(self):
        # renderPatternAudio always writes a buffer; silence is a valid (quiet)
        # capture, not an error. The model reads the WAV, so it just hears nothing.
        import struct
        from ai_dj.backend import make_strudel_backend

        out = "/tmp/ai_dj_test_cap_silent.wav"
        be = make_strudel_backend(log=lambda *a: None)
        try:
            be.boot(timeout=60)
            be.play("silence")
            path = be.capture(out, 1)
        finally:
            be.shutdown()
        self.assertEqual(path, out)
        with open(out, "rb") as f:
            data = f.read()
        self.assertGreater(len(data), 44)
        peak = max(
            abs(v)
            for v in struct.unpack("<%dh" % ((len(data) - 44) // 2), data[44:])
        )
        self.assertLess(peak, 50)


if __name__ == "__main__":
    unittest.main()
