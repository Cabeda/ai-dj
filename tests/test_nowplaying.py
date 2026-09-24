import os
import sys
import tempfile
import threading
import time
import unittest
from unittest import mock

from ai_dj import live, session
from ai_dj.backend import BackendClosed
from ai_dj.control import Control
from ai_dj.nowplaying import NowPlaying


class UnavailableTests(unittest.TestCase):
    def test_disabled_is_a_safe_noop(self):
        os.environ["AI_DJ_NOWPLAYING"] = "0"
        try:
            np = NowPlaying(log=lambda *a: None)
            self.assertFalse(np.available())
            self.assertFalse(np.start())
            # every method must stay safe when the integration is off
            np.update(title="x", state="playing")
            self.assertEqual(np.drain(), [])
            np.stop()
        finally:
            os.environ.pop("AI_DJ_NOWPLAYING", None)

    def test_off_macos_is_unavailable(self):
        if sys.platform == "darwin":
            self.skipTest("macOS has the integration")
        self.assertFalse(NowPlaying(log=lambda *a: None).available())


class RecordingNowPlaying:
    """Stands in for the helper so the loop's wiring can be checked without
    registering anything with the OS."""

    instances = []

    def __init__(self, log=print):
        self.updates = []
        self.commands = []
        self.stopped = False
        RecordingNowPlaying.instances.append(self)

    def start(self):
        return True

    def update(self, **fields):
        self.updates.append(fields)

    def drain(self):
        out, self.commands = self.commands, []
        return out

    def stop(self):
        self.stopped = True


class LoudBackend:
    """A backend that wants sound, so the loop publishes to Now Playing."""

    name = "strudel"
    silent = False

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
        return None

    def shutdown(self):
        pass

    def instruments(self):
        return ("piano",)


class WiringTests(unittest.TestCase):
    """Media keys must reach the loop: play/pause/toggle, and next skips on."""

    def setUp(self):
        RecordingNowPlaying.instances = []

    def _run(self, ctl, be):
        t = threading.Thread(
            target=live.run,
            kwargs=dict(key="", model="m", env="", backend=be, control=ctl,
                        tick=0.05, dry=False, feedback_enabled=False),
            daemon=True)
        t.start()

    def test_pause_command_drives_the_now_playing_state(self):
        with tempfile.TemporaryDirectory() as tmp:
            with mock.patch.object(session, "BASE", tmp), \
                    mock.patch("ai_dj.nowplaying.NowPlaying", RecordingNowPlaying):
                ctl, be = Control(), LoudBackend()
                self._run(ctl, be)
                try:
                    time.sleep(0.5)
                    self.assertTrue(RecordingNowPlaying.instances,
                                    "the loop never started now-playing")
                    np = RecordingNowPlaying.instances[0]
                    self.assertTrue(any(u.get("state") == "playing" for u in np.updates),
                                    np.updates)

                    ctl.push_command("pause")
                    time.sleep(0.5)
                    self.assertTrue(ctl.snapshot().get("paused"))
                    self.assertTrue(any(u.get("state") == "paused" for u in np.updates),
                                    np.updates)
                finally:
                    # a paused loop never captures, so resume before ending it
                    ctl.push_command("resume")
                    time.sleep(0.3)
                    be.done = True
                    time.sleep(0.5)
                self.assertTrue(np.stopped, "now-playing was not torn down")

    def test_remote_toggle_reaches_the_loop(self):
        with tempfile.TemporaryDirectory() as tmp:
            with mock.patch.object(session, "BASE", tmp), \
                    mock.patch("ai_dj.nowplaying.NowPlaying", RecordingNowPlaying):
                ctl, be = Control(), LoudBackend()
                self._run(ctl, be)
                try:
                    time.sleep(0.5)
                    np = RecordingNowPlaying.instances[0]
                    np.commands.append("pause")   # the user pressed pause
                    time.sleep(0.5)
                    self.assertTrue(ctl.snapshot().get("paused"),
                                    "a media-key pause did not reach the loop")
                finally:
                    be.done = True


if __name__ == "__main__":
    unittest.main()
