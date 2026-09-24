import tempfile
import threading
import time
import unittest
from unittest import mock

from ai_dj import live, session
from ai_dj.backend import BackendClosed
from ai_dj.control import Control


class CountingBackend:
    """Records the work the loop asks of it."""

    name = "strudel"
    silent = True

    def __init__(self):
        self.plays = []
        self.captures = 0
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
        self.captures += 1
        return None

    def shutdown(self):
        pass

    def instruments(self):
        return ("piano",)


class AutopilotTests(unittest.TestCase):
    """Autopilot off keeps the set playing but stops the DJ touching it."""

    def _run(self, ctl, be, tick=0.05):
        threading.Thread(
            target=live.run,
            kwargs=dict(key="", model="m", env="", backend=be, control=ctl,
                        tick=tick, dry=False, feedback_enabled=False),
            daemon=True).start()

    def test_freezing_stops_the_ai_work_but_not_the_music(self):
        with tempfile.TemporaryDirectory() as tmp:
            with mock.patch.object(session, "BASE", tmp):
                ctl, be = Control(), CountingBackend()
                self._run(ctl, be)
                try:
                    time.sleep(0.5)
                    self.assertGreater(be.captures, 0, "the loop never captured")
                    plays_before = len(be.plays)

                    ctl.push_command("autopilot-off")
                    time.sleep(0.4)
                    self.assertFalse(ctl.snapshot().get("autopilot"))
                    captures_at_freeze = be.captures
                    time.sleep(0.6)  # many ticks
                    self.assertEqual(be.captures, captures_at_freeze,
                                     "the AI kept working while frozen")
                    self.assertEqual(len(be.plays), plays_before,
                                     "the frozen set was replayed or changed")

                    ctl.push_command("autopilot-on")
                    time.sleep(0.5)
                    self.assertTrue(ctl.snapshot().get("autopilot"))
                    self.assertGreater(be.captures, captures_at_freeze,
                                       "unfreezing did not resume the AI")
                finally:
                    be.done = True

    def test_a_manual_edit_still_lands_while_frozen(self):
        with tempfile.TemporaryDirectory() as tmp:
            with mock.patch.object(session, "BASE", tmp):
                ctl, be = Control(), CountingBackend()
                self._run(ctl, be)
                try:
                    time.sleep(0.4)
                    ctl.push_command("autopilot-off")
                    time.sleep(0.4)
                    ctl.push_manual_script("stack(s('bd*4'))\n")
                    time.sleep(0.5)
                    self.assertEqual(be.plays[-1], "stack(s('bd*4'))\n",
                                     "a manual edit was dropped while frozen")
                finally:
                    be.done = True


if __name__ == "__main__":
    unittest.main()
