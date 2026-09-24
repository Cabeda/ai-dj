import os
import shutil
import struct
import time
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "strudel", "host.bundle.mjs")


def peak_of(path):
    if not path or not os.path.exists(path):
        return 0
    with open(path, "rb") as f:
        data = f.read()
    n = (len(data) - 44) // 2
    if n <= 0:
        return 0
    return max(abs(v) for v in struct.unpack("<%dh" % n, data[44:]))


@unittest.skipUnless(shutil.which("bun") and os.path.exists(BUNDLE),
                     "bun or the built host is not available")
class StrudelHostTests(unittest.TestCase):
    """Integration: the Bun Strudel host speaks the backend protocol."""

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

    def test_the_suite_runs_the_host_silently(self):
        # The integration tests drive the real host; it must never schedule
        # audio to the machine's speakers.
        from ai_dj.backend import make_strudel_backend

        be = make_strudel_backend(log=lambda *a: None)
        try:
            be.boot(timeout=60)
            self.assertTrue(be.silent, "integration tests must not make noise")
        finally:
            be.shutdown()

    def test_play_accepts_a_script_that_calls_samples(self):
        # Regression: `samples` was missing from the host's eval scope, so any
        # script calling it threw "samples is not defined", the host kept the
        # previous pattern, and a manual edit silently did nothing. The call is
        # fire-and-forget, so this needs no network.
        from ai_dj.backend import make_strudel_backend

        be = make_strudel_backend(log=lambda *a: None)
        try:
            be.boot(timeout=60)
            self.assertTrue(
                be.play("samples('github:tidalcycles/dirt-samples')\ns(\"bd\")"))
        finally:
            be.shutdown()

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
        with open(out, "rb") as f:
            self.assertEqual(f.read(4), b"RIFF")
        self.assertGreater(peak_of(out), 50)

    def test_capture_of_silence_reports_failure(self):
        # the renderer rejects an all-zero render rather than handing the model
        # a silent WAV to "hear"
        from ai_dj.backend import make_strudel_backend

        be = make_strudel_backend(log=lambda *a: None)
        try:
            be.boot(timeout=60)
            be.play("silence")
            self.assertIsNone(be.capture("/tmp/ai_dj_test_cap_silent.wav", 1))
        finally:
            be.shutdown()


@unittest.skipUnless(shutil.which("bun") and os.path.exists(BUNDLE),
                     "bun or the built host is not available")
class ReverbRenderTests(unittest.TestCase):
    """room() must render.

    Two library bugs made every room() render fail:
      - reverbGen signals completion via `context.oncomplete`, which
        node-web-audio-api never fires (it resolves startRendering() as a
        promise), so the impulse response never resolved;
      - importing SuperdoughAudioController from its subpath yields a second
        copy of the context singleton, so superdough's gainNode() saw a null
        context and built a stray live AudioContext ("different contexts").
    """

    def _peak(self, script, seconds=2):
        from ai_dj.backend import make_strudel_backend

        out = "/tmp/ai_dj_reverb_test.wav"
        if os.path.exists(out):
            os.unlink(out)
        be = make_strudel_backend(log=lambda *a: None)
        try:
            be.boot(timeout=90)
            be.play(script)
            time.sleep(0.5)
            path = be.capture(out, seconds)
        finally:
            be.shutdown()
        return peak_of(path)

    def test_room_on_synth_renders(self):
        self.assertGreater(
            self._peak('note("c3 e3").s("sawtooth").gain(0.3).room(0.4)'),
            50, "room() on a synth rendered silence",
        )

    def test_room_on_sampled_instrument_renders(self):
        self.assertGreater(
            self._peak('s("RolandTR909_bd").gain(0.5).room(0.4)'),
            50, "room() on a sample rendered silence",
        )

    def test_room_repeatedly_is_stable(self):
        from ai_dj.backend import make_strudel_backend

        be = make_strudel_backend(log=lambda *a: None)
        try:
            be.boot(timeout=90)
            be.play('note("c3 e3").s("sawtooth").gain(0.3).room(0.4)')
            time.sleep(0.5)
            peaks = [peak_of(be.capture("/tmp/ai_dj_reverb_rep.wav", 1)) for _ in range(3)]
        finally:
            be.shutdown()
        self.assertTrue(all(p > 50 for p in peaks), f"a repeated room() render failed: {peaks}")


if __name__ == "__main__":
    unittest.main()
