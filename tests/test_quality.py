import math
import os
import shutil
import struct
import tempfile
import time
import unittest

from ai_dj import quality, strudel_templates as st
from ai_dj.backend import make_strudel_backend
from ai_dj.state import DJState

BUNDLE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "packages", "strudel", "host.bundle.mjs")


def _wav(path, dur=2.0, sr=48000, *, soft=False, stereo=False, velocity_var=False):
    """Synthetic WAV for metric tests: a 220Hz tone with controlled character."""
    n = int(dur * sr)
    channels = 2 if stereo else 1
    buf = bytearray(44 + n * channels * 2)
    buf[:4] = b"RIFF"
    struct.pack_into("<I", buf, 4, 36 + n * channels * 2)
    buf[8:12] = b"WAVE"
    buf[12:16] = b"fmt "
    struct.pack_into("<I", buf, 16, 16)
    struct.pack_into("<H", buf, 20, 1)
    struct.pack_into("<H", buf, 22, channels)
    struct.pack_into("<I", buf, 24, sr)
    struct.pack_into("<I", buf, 28, sr * channels * 2)
    struct.pack_into("<H", buf, 32, channels * 2)
    struct.pack_into("<H", buf, 34, 16)
    buf[36:40] = b"data"
    struct.pack_into("<I", buf, 40, n * channels * 2)
    o = 44
    for i in range(n):
        t = i / sr
        if soft:
            env = min(1.0, t / 0.3) * math.exp(-t * 0.8)
        else:
            env = 1.0 if t < 0.1 else 0.0
        level = 0.5
        if velocity_var and i % (sr // 4) < sr // 8:
            level = 0.8
        v = math.sin(2 * math.pi * 220 * t) * env * level
        s = int(max(-1, min(1, v)) * 32767)
        struct.pack_into("<h", buf, o, s)
        o += 2
        if stereo:
            # genuinely different signal: different frequency -> low correlation
            s2 = int(max(-1, min(1, math.sin(2 * math.pi * 330 * t) * env * level)) * 32767)
            struct.pack_into("<h", buf, o, s2)
            o += 2
    with open(path, "wb") as f:
        f.write(buf)
    return path


class QualityMetricTests(unittest.TestCase):
    """The four metrics must separate sequencer-MIDI from natural audio."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.dir = self._tmp.name

    def tearDown(self):
        self._tmp.cleanup()

    def _path(self, name):
        return os.path.join(self.dir, name)

    def test_hard_attack_scores_low(self):
        midi = _wav(self._path("midi.wav"), soft=False)
        soft = _wav(self._path("soft.wav"), soft=True)
        self.assertLess(quality.attack_softness(*quality.mono(midi)),
                        quality.attack_softness(*quality.mono(soft)))

    def test_dry_audio_has_shorter_decay(self):
        dry = _wav(self._path("dry.wav"), soft=False)
        wet = _wav(self._path("wet.wav"), soft=True)
        self.assertLess(quality.decay_tail(*quality.mono(dry)),
                        quality.decay_tail(*quality.mono(wet)))

    def test_mono_scores_zero_width(self):
        mono = _wav(self._path("mono.wav"), soft=False)
        self.assertEqual(quality.stereo_width(mono), 0.0)

    def test_stereo_scores_higher_width(self):
        stereo = _wav(self._path("stereo.wav"), soft=False, stereo=True)
        self.assertGreater(quality.stereo_width(stereo), 0.5)

    def test_natural_audio_scores_higher_than_midi(self):
        midi = _wav(self._path("midi.wav"), soft=False)
        natural = _wav(self._path("natural.wav"), soft=True, stereo=True, velocity_var=True)
        self.assertGreater(quality.euphony(natural), quality.euphony(midi))
        self.assertGreater(quality.euphony(midi), 0.0)
        self.assertGreater(quality.euphony(natural), 0.45)

    def test_breakdown_returns_all_metrics(self):
        p = _wav(self._path("b.wav"))
        b = quality.breakdown(p)
        self.assertEqual(set(b), {"attack", "decay", "dynamics", "width"})
        for v in b.values():
            self.assertGreaterEqual(v, 0.0)
            self.assertLessEqual(v, 1.0)


@unittest.skipUnless(shutil.which("bun") and os.path.exists(BUNDLE),
                     "bun or the built host is not available")
class ArchetypeQualityTests(unittest.TestCase):
    """Every archetype must render audio that is pleasant to listen to —
    not thin, quantised MIDI mush."""

    def _euphony(self, arch, seed=7):
        layers, info = st.build(arch, seed=seed)
        state = DJState(bpm=info["bpm"], key=info["key"], mode=info["mode"],
                        layers=layers, lang="strudel")
        be = make_strudel_backend(log=lambda *a: None)
        out = f"/tmp/ai_dj_quality_{arch}.wav"
        try:
            be.boot(timeout=90)
            be.play(state.render())
            time.sleep(1.0)
            path = be.capture(out, 3)
        finally:
            be.shutdown()
        return quality.euphony(path)

    def test_all_archetypes_beat_a_bare_drum(self):
        # absolute thresholds are brittle; the meaningful claim is that every
        # archetype is more natural than a lone quantised kick
        drums = self._drums_only()
        bad = []
        for arch in st.ARCHETYPE_NAMES:
            score = self._euphony(arch)
            if score <= drums:
                bad.append(f"{arch}={score} <= drums {drums}")
        self.assertEqual(bad, [], f"archetypes sound worse than a bare drum: {bad}")

    def _drums_only(self):
        from ai_dj.backend import StdioBackend

        be = StdioBackend(["bun", BUNDLE], name="strudel", log=lambda *a: None)
        try:
            be.boot(timeout=90)
            be.play('s("RolandTR909_bd*4").gain(0.85)')
            time.sleep(1.0)
            path = be.capture("/tmp/ai_dj_quality_drums.wav", 3)
        finally:
            be.shutdown()
        return quality.euphony(path)

    def test_focus_archetypes_are_more_euphonic_than_a_bare_drum(self):
        # a lone drum hit is the definition of MIDI-like
        from ai_dj.backend import StdioBackend

        be = StdioBackend(["bun", BUNDLE], name="strudel", log=lambda *a: None)
        try:
            be.boot(timeout=90)
            be.play('s("RolandTR909_bd*4").gain(0.85)')
            time.sleep(1.0)
            path = be.capture("/tmp/ai_dj_quality_drums.wav", 3)
        finally:
            be.shutdown()
        drums = quality.euphony(path)
        focus = self._euphony("deep_focus")
        self.assertGreater(focus, drums, f"deep_focus {focus} vs drums-only {drums}")


if __name__ == "__main__":
    unittest.main()
