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

    def test_capture_reports_failure_rather_than_silence(self):
        # The realtime tap is not working yet; capture must not claim success.
        from ai_dj.backend import make_strudel_backend

        be = make_strudel_backend(log=lambda *a: None)
        try:
            be.boot(timeout=60)
            be.play("silence")
            self.assertIsNone(be.capture("/tmp/ai_dj_test_cap.wav", 1))
        finally:
            be.shutdown()


if __name__ == "__main__":
    unittest.main()
