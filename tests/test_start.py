import tempfile
import threading
import time
import unittest
from unittest import mock

from ai_dj import live, session
from ai_dj import strudel_templates as st
from ai_dj.backend import BackendClosed
from ai_dj.control import Control


class CatalogueTests(unittest.TestCase):
    """The picker lists starting points; it must not silently drop one."""

    def test_every_archetype_is_in_exactly_one_group(self):
        listed = [n for names in st.ARCHETYPE_GROUPS.values() for n in names]
        self.assertEqual(sorted(listed), sorted(st.ARCHETYPE_NAMES))
        self.assertEqual(len(listed), len(set(listed)), "an archetype is in two groups")

    def test_catalogue_covers_every_archetype_with_detail(self):
        entries = st.catalogue()
        self.assertEqual(sorted(e["name"] for e in entries),
                         sorted(st.ARCHETYPE_NAMES))
        for e in entries:
            self.assertTrue(e["bpm"], e["name"])
            self.assertTrue(e["modes"], e["name"])
            self.assertTrue(e["layers"], e["name"])
            self.assertIn(e["group"], st.ARCHETYPE_GROUPS, e["name"])


class ControlStartTests(unittest.TestCase):
    """Nothing plays until the picker answers."""

    def test_awaiting_start_until_a_choice_arrives(self):
        c = Control()
        self.assertTrue(c.snapshot()["awaiting_start"])
        self.assertTrue(c.request_start(archetype="techno"))
        self.assertFalse(c.snapshot()["awaiting_start"])
        self.assertEqual(c.await_start(timeout=0.1), {"archetype": "techno"})

    def test_a_second_choice_is_refused(self):
        # a late click on the picker must not restart the set
        c = Control()
        c.request_start(archetype="techno")
        self.assertFalse(c.request_start(archetype="house"))
        self.assertEqual(c.await_start(timeout=0.1), {"archetype": "techno"})

    def test_mark_started_skips_the_picker(self):
        # `--archetype`/`--prompt`/`--seed` on the command line means go now
        c = Control()
        c.mark_started()
        self.assertFalse(c.snapshot()["awaiting_start"])
        self.assertEqual(c.await_start(timeout=0.05), {})


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
        return None

    def shutdown(self):
        pass

    def instruments(self):
        return ("piano",)


class ExplicitArchetypeTests(unittest.TestCase):
    def _starter(self, **kw) -> str:
        with tempfile.TemporaryDirectory() as tmp:
            with mock.patch.object(session, "BASE", tmp):
                be = FakeBackend()
                threading.Thread(
                    target=live.run,
                    kwargs=dict(key="", model="m", env="", backend=be, tick=0.05,
                                dry=False, feedback_enabled=False, **kw),
                    daemon=True).start()
                try:
                    deadline = time.time() + 3
                    while time.time() < deadline and not be.plays:
                        time.sleep(0.05)
                    return be.plays[0] if be.plays else ""
                finally:
                    be.done = True

    def test_a_chosen_archetype_is_cast(self):
        # downtempo is built on a break, so the starter proves which was cast
        self.assertIn('s("amen")', self._starter(archetype="downtempo"))

    def test_an_unknown_archetype_falls_back_to_a_cast(self):
        script = self._starter(archetype="not-an-archetype")
        self.assertTrue(script.strip(), "no starter was played at all")

    def test_without_a_choice_it_still_casts_something(self):
        self.assertTrue(self._starter().strip())


if __name__ == "__main__":
    unittest.main()
