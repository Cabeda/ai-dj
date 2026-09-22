import json
import os
import shutil
import subprocess
import unittest

from ai_dj import similarity

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ANALYZER = os.path.join(ROOT, "strudel", "analyze.bundle.mjs")
REFERENCES = os.path.join(os.path.dirname(os.path.abspath(__file__)), "references")


def analyze(script, seconds=8, cps=0.5):
    """Extract the notes a Strudel pattern actually plays (exact, no audio)."""
    req = json.dumps({"script": script, "seconds": seconds, "cps": cps})
    proc = subprocess.run(
        ["bun", ANALYZER], input=req + "\n",
        capture_output=True, text=True, timeout=120,
    )
    line = [l for l in proc.stdout.splitlines() if l.startswith("{")]
    if not line:
        raise RuntimeError(f"analyzer produced nothing: {proc.stderr[-400:]}")
    res = json.loads(line[-1])
    if "error" in res:
        raise RuntimeError(f"analyzer error: {res['error']}")
    return res


def read_reference(name):
    with open(os.path.join(REFERENCES, f"{name}.strudel")) as f:
        return f.read()


@unittest.skipUnless(shutil.which("bun") and os.path.exists(ANALYZER),
                     "bun or the built analyzer is not available")
class ReferenceReplicationTests(unittest.TestCase):
    """Our replication of each piece must closely match its symbolic reference.

    These are the pieces we can check exactly: the reference is the score, and
    the analyzer reports the notes the pattern actually plays.
    """

    def _score(self, reference_key, pattern_name, cps=0.5):
        reference = similarity.REFERENCE_PIECES[reference_key]["notes"]
        result = analyze(read_reference(pattern_name), seconds=8, cps=cps)
        return similarity.similarity(result["notes"], reference), result

    def test_bach_prelude_matches(self):
        score, result = self._score("bach_prelude_c", "bach_prelude_c")
        self.assertGreaterEqual(score, 0.95, f"Bach replication scored {score}: {result}")

    def test_mozart_nachtmusik_matches(self):
        score, result = self._score("mozart_nachtmusik", "mozart_nachtmusik")
        self.assertGreaterEqual(score, 0.95, f"Mozart replication scored {score}: {result}")

    def test_bach_is_not_mozart(self):
        # the scorer must discriminate, or a high score means nothing
        bach = similarity.REFERENCE_PIECES["bach_prelude_c"]["notes"]
        mozart = similarity.REFERENCE_PIECES["mozart_nachtmusik"]["notes"]
        self.assertLess(similarity.similarity(bach, mozart), 0.9)

    def test_analyzer_extracts_the_expected_notes(self):
        result = analyze('note("<c3 e3 g3 c4>")', seconds=8, cps=0.5)
        self.assertEqual(sorted(result["notes"]), [48, 52, 55, 60])
        self.assertEqual(result["onsets"], 4)


@unittest.skipUnless(shutil.which("bun") and os.path.exists(ANALYZER),
                     "bun or the built analyzer is not available")
class StyleTargetTests(unittest.TestCase):
    """Electronic styles have no canonical score; these are style targets.

    The assertion is deliberately loose: the pattern should be much closer to
    its own style reference than to an unrelated one.
    """

    def test_lofi_pattern_matches_its_style_target(self):
        result = analyze(read_reference("lofi_study"), seconds=8, cps=0.5)
        own = similarity.similarity(
            result["notes"], similarity.STYLE_REFERENCES["lofi_study"]["notes"]
        )
        other = similarity.similarity(
            result["notes"], similarity.STYLE_REFERENCES["synthwave"]["notes"]
        )
        self.assertGreater(own, other, f"lofi {own} vs synthwave {other}")

    def test_synthwave_pattern_matches_its_style_target(self):
        result = analyze(read_reference("synthwave"), seconds=8, cps=0.5)
        own = similarity.similarity(
            result["notes"], similarity.STYLE_REFERENCES["synthwave"]["notes"]
        )
        other = similarity.similarity(
            result["notes"], similarity.STYLE_REFERENCES["lofi_study"]["notes"]
        )
        self.assertGreater(own, other, f"synthwave {own} vs lofi {other}")

    def test_synthwave_is_busier_than_lofi(self):
        # a real style difference the note lists alone do not capture: lofi is
        # sparse (a chord every few beats), synthwave is a running arpeggio.
        lofi = analyze(read_reference("lofi_study"), seconds=8, cps=0.5)
        synth = analyze(read_reference("synthwave"), seconds=8, cps=0.5)
        self.assertGreater(
            synth["onsets"], lofi["onsets"] * 2,
            f"synthwave ({synth['onsets']} onsets) should be far busier "
            f"than lofi ({lofi['onsets']})",
        )


if __name__ == "__main__":
    unittest.main()
