import os
import tempfile
import threading
import time
import unittest
from unittest import mock

from ai_dj import live, session
from ai_dj.backend import BackendClosed
from ai_dj.control import Control


class VolumeBackend:
    """Records the volume the loop asks for."""

    name = "strudel"
    silent = True

    def __init__(self):
        self.volumes = []
        self.plays = []
        self.done = False
        self.reject = False

    def boot(self, timeout=90, audio_driver=None):
        return self

    def play(self, script):
        self.plays.append(script)
        return True

    def stop(self):
        pass

    def set_volume(self, volume):
        if self.reject:
            raise RuntimeError("backend refused")
        self.volumes.append(volume)

    def capture(self, path, seconds):
        if self.done:
            raise BackendClosed("test finished")
        return None

    def shutdown(self):
        pass

    def instruments(self):
        return ("piano",)


class VolumeTests(unittest.TestCase):
    """Master volume is the loop's, and survives a script change."""

    def _run(self, ctl, be, tick=0.05):
        threading.Thread(
            target=live.run,
            kwargs=dict(key="", model="m", env="", backend=be, control=ctl,
                        tick=tick, dry=False, feedback_enabled=False),
            daemon=True).start()

    def _state(self, ctl):
        deadline = time.time() + 3
        while time.time() < deadline:
            s = ctl.snapshot()
            if s.get("volume") is not None:
                return s
            time.sleep(0.05)
        return ctl.snapshot()

    def test_starts_at_full_and_reports_it(self):
        with tempfile.TemporaryDirectory() as tmp:
            with mock.patch.object(session, "BASE", tmp):
                ctl, be = Control(), VolumeBackend()
                self._run(ctl, be)
                try:
                    self.assertEqual(self._state(ctl).get("volume"), 1.0)
                finally:
                    be.done = True

    def test_volume_command_sets_and_reports(self):
        with tempfile.TemporaryDirectory() as tmp:
            with mock.patch.object(session, "BASE", tmp):
                ctl, be = Control(), VolumeBackend()
                self._run(ctl, be)
                try:
                    time.sleep(0.4)
                    ctl.push_command("volume 0.4")
                    time.sleep(0.5)
                    self.assertEqual(self._state(ctl).get("volume"), 0.4)
                    self.assertEqual(be.volumes[-1], 0.4)
                finally:
                    be.done = True

    def test_volume_steps_up_and_down_and_clamps(self):
        with tempfile.TemporaryDirectory() as tmp:
            with mock.patch.object(session, "BASE", tmp):
                ctl, be = Control(), VolumeBackend()
                self._run(ctl, be)
                try:
                    time.sleep(0.4)
                    ctl.push_command("volume 0.95")
                    time.sleep(0.4)
                    ctl.push_command("volume up")
                    time.sleep(0.4)
                    self.assertEqual(self._state(ctl).get("volume"), 1.0, "did not clamp at 1.0")
                    ctl.push_command("volume down")
                    time.sleep(0.4)
                    self.assertEqual(self._state(ctl).get("volume"), 0.9)
                    ctl.push_command("volume 0.05")
                    time.sleep(0.4)
                    ctl.push_command("volume down")
                    time.sleep(0.4)
                    self.assertEqual(self._state(ctl).get("volume"), 0.0, "did not clamp at 0")
                finally:
                    be.done = True

    def test_mute_remembers_the_level(self):
        with tempfile.TemporaryDirectory() as tmp:
            with mock.patch.object(session, "BASE", tmp):
                ctl, be = Control(), VolumeBackend()
                self._run(ctl, be)
                try:
                    time.sleep(0.4)
                    ctl.push_command("volume 0.6")
                    time.sleep(0.4)
                    ctl.push_command("volume mute")
                    time.sleep(0.4)
                    self.assertEqual(self._state(ctl).get("volume"), 0.0)
                    ctl.push_command("volume unmute")
                    time.sleep(0.4)
                    self.assertEqual(self._state(ctl).get("volume"), 0.6,
                                     "unmute did not restore the previous level")
                finally:
                    be.done = True

    def test_a_bad_argument_is_reported_not_raised(self):
        with tempfile.TemporaryDirectory() as tmp:
            with mock.patch.object(session, "BASE", tmp):
                ctl, be = Control(), VolumeBackend()
                logs = []
                self._run(ctl, be)
                try:
                    time.sleep(0.4)
                    ctl.push_command("volume louder")
                    time.sleep(0.5)
                    self.assertEqual(self._state(ctl).get("volume"), 1.0, "changed on bad input")
                finally:
                    be.done = True

    def test_a_rejecting_backend_does_not_kill_the_watcher(self):
        with tempfile.TemporaryDirectory() as tmp:
            with mock.patch.object(session, "BASE", tmp):
                ctl, be = Control(), VolumeBackend()
                self._run(ctl, be)
                try:
                    time.sleep(0.4)
                    be.reject = True
                    ctl.push_command("volume 0.3")
                    time.sleep(0.5)
                    be.reject = False
                    ctl.push_command("volume 0.7")
                    time.sleep(0.5)
                    self.assertEqual(be.volumes[-1], 0.7,
                                     "the watcher stopped handling commands")
                finally:
                    be.done = True


if __name__ == "__main__":
    unittest.main()
