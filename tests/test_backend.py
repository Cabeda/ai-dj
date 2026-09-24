import os
import sys
import unittest

from ai_dj.backend import SonicPiBackend, SoundBackend, StdioBackend

HOST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fake_host.py")


class FakeSonicPi:
    def __init__(self):
        self.calls = []
        self.audio_output = None

    def boot(self, timeout=90, audio_driver=None):
        self.calls.append(("boot", timeout, audio_driver))
        return self

    def run_code(self, script):
        self.calls.append(("run_code", script))

    def stop_all(self):
        self.calls.append(("stop_all",))

    def set_volume(self, vol):
        self.calls.append(("set_volume", vol))

    def capture(self, path, seconds):
        self.calls.append(("capture", path, seconds))
        return path

    def shutdown(self):
        self.calls.append(("shutdown",))


class SonicPiBackendTests(unittest.TestCase):
    def test_delegates_to_underlying_controller(self):
        fake = FakeSonicPi()
        be = SonicPiBackend(sp=fake)
        self.assertEqual(be.name, "sonic_pi")

        be.boot(timeout=5)
        be.play("use_bpm 90")
        be.stop()
        be.set_volume(0.5)
        self.assertEqual(be.capture("/tmp/x.wav", 2), "/tmp/x.wav")
        be.shutdown()

        self.assertEqual(fake.calls, [
            ("boot", 5, None),
            ("run_code", "use_bpm 90"),
            ("stop_all",),
            ("set_volume", 0.5),
            ("capture", "/tmp/x.wav", 2),
            ("shutdown",),
        ])

    def test_audio_output_delegates(self):
        fake = FakeSonicPi()
        be = SonicPiBackend(sp=fake)
        be.audio_output = "WF-1000XM6"
        self.assertEqual(fake.audio_output, "WF-1000XM6")
        self.assertEqual(be.audio_output, "WF-1000XM6")

    def test_instruments_come_from_palette(self):
        be = SonicPiBackend(sp=FakeSonicPi())
        self.assertIn("kick", be.instruments())
        self.assertNotIn("violin", be.instruments())


class SoundBackendContractTests(unittest.TestCase):
    def test_is_abstract(self):
        with self.assertRaises(TypeError):
            SoundBackend()

    def test_backends_implement_the_seam(self):
        self.assertTrue(issubclass(SonicPiBackend, SoundBackend))
        self.assertTrue(issubclass(StdioBackend, SoundBackend))

    def test_methods_are_declared(self):
        for method in ("boot", "play", "stop", "set_volume", "capture", "shutdown"):
            self.assertTrue(hasattr(SoundBackend, method))


class StdioBackendTests(unittest.TestCase):
    def test_name_selects_the_palette(self):
        strudel = StdioBackend([sys.executable, HOST], name="strudel", log=lambda *a: None)
        self.assertIn("violin", strudel.instruments())
        plain = StdioBackend([sys.executable, HOST], log=lambda *a: None)
        self.assertNotIn("violin", plain.instruments())

    def test_speaks_the_protocol_to_a_host(self):
        be = StdioBackend([sys.executable, HOST], log=lambda *a: None)
        try:
            be.boot(timeout=5)
            be.play("note('c3')")
            be.stop()
            be.set_volume(0.8)
            self.assertEqual(be.capture("/tmp/out.wav", 1), "/tmp/out.wav")
        finally:
            be.shutdown()
        self.assertIsNone(be.proc)

    def test_boot_times_out_without_a_host(self):
        be = StdioBackend([sys.executable, "-c", "import time; time.sleep(30)"],
                          log=lambda *a: None)
        try:
            with self.assertRaises(RuntimeError):
                be.boot(timeout=0.5)
        finally:
            be.shutdown()

    def test_play_reports_a_rejected_script(self):
        # A host that refuses every play, like Strudel did when `samples` was
        # missing from the eval scope. play() must report it, not pretend the
        # swap worked and leave the previous pattern running.
        refusing = (
            "import json,sys\n"
            "for line in sys.stdin:\n"
            "    m=json.loads(line); op=m.get('op')\n"
            "    if op=='boot': print(json.dumps({'event':'ready'}),flush=True)\n"
            "    elif op=='play': print(json.dumps({'event':'error',"
            "'message':'samples is not defined'}),flush=True)\n"
            "    elif op=='shutdown': print(json.dumps({'event':'bye'}),flush=True); break\n"
        )
        logs = []
        be = StdioBackend([sys.executable, "-c", refusing], log=logs.append)
        try:
            be.boot(timeout=5)
            self.assertFalse(be.play("samples('x')\ns('bd')"))
        finally:
            be.shutdown()
        self.assertTrue(any("rejected" in line for line in logs), logs)

    def test_play_reports_success(self):
        be = StdioBackend([sys.executable, HOST], log=lambda *a: None)
        try:
            be.boot(timeout=5)
            self.assertTrue(be.play("note('c3')"))
        finally:
            be.shutdown()


if __name__ == "__main__":
    unittest.main()


class StdioBackendShutdownTests(unittest.TestCase):
    """Quitting while a capture is in flight must read as "leaving", not as a
    failure — the DJ loop and shutdown race by design."""

    def _backend(self):
        return StdioBackend([sys.executable, HOST], name="strudel", log=lambda *a: None)

    def test_capture_after_shutdown_raises_closed(self):
        from ai_dj.backend import BackendClosed

        be = self._backend()
        try:
            be.boot(timeout=5)
        finally:
            be.shutdown()
        with self.assertRaises(BackendClosed):
            be.capture("/tmp/ai_dj_closed.wav", 1)

    def test_play_and_stop_after_shutdown_are_noops(self):
        be = self._backend()
        try:
            be.boot(timeout=5)
        finally:
            be.shutdown()
        # must not raise
        be.play("stack(s('bd'))")
        be.stop()
        be.set_volume(0.5)

    def test_shutdown_is_idempotent(self):
        be = self._backend()
        be.boot(timeout=5)
        be.shutdown()
        be.shutdown()  # must not raise
