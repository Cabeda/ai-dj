import tempfile
import threading
import time
import unittest
from unittest import mock

from ai_dj import live, session
from ai_dj.backend import BackendClosed
from ai_dj.control import Control

PASTED = (
    "// \"Night ride\"\n"
    "samples('github:eddyflux/crate')\n"
    "setcps(.75)\n"
    "stack(\n"
    "  s(\"bd\").bank('crate'),\n"
    "  note(\"c3 e3\").s(\"gm_epiano1\")\n"
    ")\n"
)


class FakeBackend:
    name = "strudel"
    silent = True

    def __init__(self):
        self.plays = []
        self.done = False

    def boot(self, timeout=90, audio_driver=None):
        return self

    def play(self, script):
        self.plays.append(script)
        return True

    def stop(self):
        pass

    def set_volume(self, volume):
        pass

    def capture(self, path, seconds):
        if self.done:
            raise BackendClosed("test finished")
        return None  # no audio -> no model call, so the set stays as applied

    def shutdown(self):
        pass

    def instruments(self):
        return ("piano",)


class ManualApplyTests(unittest.TestCase):
    """Pasting a whole script must replace the set and stay replaced.

    Regression: the manual path only adopted a script's layers when it
    decomposed into `// layer:` blocks. A pasted script does not, so the old
    layers survived and the loop's next render switched the music back — heard
    as the old set playing over the new one.
    """

    def test_a_pasted_script_is_not_reverted_by_the_loop(self):
        with tempfile.TemporaryDirectory() as tmp:
            with mock.patch.object(session, "BASE", tmp):
                ctl, be = Control(), FakeBackend()
                threading.Thread(
                    target=live.run,
                    kwargs=dict(key="", model="m", env="", backend=be, control=ctl,
                                tick=0.05, dry=False, feedback_enabled=False),
                    daemon=True).start()
                try:
                    time.sleep(0.5)
                    starter = be.plays[-1]
                    self.assertIn("// layer:", starter, "expected a generated starter")

                    ctl.push_manual_script(PASTED)
                    time.sleep(0.6)
                    self.assertEqual(be.plays[-1], PASTED,
                                     "the pasted script was not applied verbatim")

                    # several more ticks must not bring the old set back
                    time.sleep(0.6)
                    self.assertEqual(be.plays[-1], PASTED,
                                     "the loop reverted to the previous script")
                    for played in be.plays[be.plays.index(PASTED):]:
                        self.assertNotIn("// layer:", played,
                                         "the old layer model was re-rendered")
                finally:
                    be.done = True


if __name__ == "__main__":
    unittest.main()
