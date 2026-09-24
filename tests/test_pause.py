import tempfile
import threading
import time
import unittest
from unittest import mock

from ai_dj import live, session
from ai_dj.backend import BackendClosed
from ai_dj.control import Control


class FakeBackend:
    """A sound backend that records what the loop asks of it."""

    name = "strudel"

    def __init__(self):
        self.plays = []
        self.stops = 0
        self.done = False

    def boot(self, timeout=90, audio_driver=None):
        return self

    def play(self, script):
        self.plays.append(script)
        return True

    def stop(self):
        self.stops += 1

    def set_volume(self, volume):
        pass

    def capture(self, path, seconds):
        if self.done:
            raise BackendClosed("test finished")
        return None  # no audio -> the loop skips the model call

    def shutdown(self):
        pass

    def instruments(self):
        return ("piano",)


class PauseTests(unittest.TestCase):
    """Pause must silence the set and freeze the loop; the old "stop" only
    silenced it, and the next tick's play() un-muted it."""

    def _start(self, ctl, be):
        t = threading.Thread(
            target=live.run,
            kwargs=dict(key="", model="m", env="", backend=be, control=ctl,
                        tick=0.05, dry=False, feedback_enabled=False),
            daemon=True)
        t.start()
        return t

    def test_pause_silences_and_freezes_until_resume(self):
        with tempfile.TemporaryDirectory() as tmp:
            with mock.patch.object(session, "BASE", tmp):
                ctl, be = Control(), FakeBackend()
                self._start(ctl, be)
                try:
                    time.sleep(0.6)
                    self.assertGreaterEqual(len(be.plays), 1, "starter never played")

                    ctl.push_command("pause")
                    time.sleep(0.6)
                    self.assertEqual(be.stops, 1, "pause did not silence the backend")
                    self.assertTrue(ctl.snapshot().get("paused"))

                    plays_while_paused = len(be.plays)
                    time.sleep(0.6)  # many ticks
                    self.assertEqual(len(be.plays), plays_while_paused,
                                     "the loop kept playing while paused")

                    ctl.push_command("resume")
                    time.sleep(0.6)
                    self.assertFalse(ctl.snapshot().get("paused"))
                    self.assertGreater(len(be.plays), plays_while_paused,
                                       "resume did not restart the set")
                finally:
                    be.done = True

    def test_stop_is_still_an_alias_for_pause(self):
        with tempfile.TemporaryDirectory() as tmp:
            with mock.patch.object(session, "BASE", tmp):
                ctl, be = Control(), FakeBackend()
                self._start(ctl, be)
                try:
                    time.sleep(0.5)
                    ctl.push_command("stop")
                    time.sleep(0.5)
                    self.assertTrue(ctl.snapshot().get("paused"))
                    self.assertEqual(be.stops, 1)
                finally:
                    be.done = True


if __name__ == "__main__":
    unittest.main()
