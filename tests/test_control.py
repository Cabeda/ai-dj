import os
import tempfile
import unittest

from ai_dj import session
from ai_dj.control import Control


class ScriptRevTests(unittest.TestCase):
    """The TUI adopts the server's script only when script_rev changes, so a
    manual edit the engine rejected (same script, same revision) does not
    revert the text the user just pasted.
    """

    def test_rev_bumps_only_when_the_script_changes(self):
        c = Control()
        c.set_state(script="a")
        first = c.snapshot()["script_rev"]
        c.set_state(script="a")                     # unchanged
        self.assertEqual(c.snapshot()["script_rev"], first)
        c.set_state(script="b")                     # changed
        self.assertEqual(c.snapshot()["script_rev"], first + 1)

    def test_other_state_updates_do_not_bump_the_rev(self):
        c = Control()
        c.set_state(script="a", bpm=120)
        first = c.snapshot()["script_rev"]
        c.set_state(bpm=124, energy=0.5)
        self.assertEqual(c.snapshot()["script_rev"], first)

    def test_rev_starts_absent_then_appears(self):
        c = Control()
        self.assertNotIn("script_rev", c.snapshot())
        c.set_state(script="a")
        self.assertEqual(c.snapshot()["script_rev"], 1)


class SessionBrowserTests(unittest.TestCase):
    """The browser modal's backend: list, name, favourite, load."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self._orig_base = session.BASE
        session.BASE = self._tmp.name
        self.a = session.create_session({"seed": "night", "bpm": 92})
        session.save_script(self.a, "stack(s('bd'))\n", lang="strudel")
        self.b = session.create_session({"seed": "focus", "bpm": 70})
        session.save_script(self.b, "stack(note('c3'))\n", lang="strudel")
        self.ctl = Control()

    def tearDown(self):
        session.BASE = self._orig_base
        self._tmp.cleanup()

    def _id(self, path):
        return os.path.basename(path)

    def test_sessions_carry_a_preview(self):
        rows = self.ctl.sessions()
        self.assertEqual(len(rows), 2)
        by_id = {r["id"]: r for r in rows}
        self.assertIn("stack", by_id[self._id(self.a)]["preview"])

    def test_name_and_favourite_round_trip(self):
        self.ctl.name_session(self._id(self.a), "Night ride")
        self.ctl.favorite_session(self._id(self.a), True)
        rows = {r["id"]: r for r in self.ctl.sessions()}
        self.assertEqual(rows[self._id(self.a)]["name"], "Night ride")
        self.assertTrue(rows[self._id(self.a)]["favorite"])

    def test_naming_ignores_an_unknown_session(self):
        self.ctl.name_session("nope", "x")      # must not raise
        self.ctl.favorite_session("nope", True)

    def test_loading_a_session_queues_it_as_a_manual_edit(self):
        self.assertTrue(self.ctl.load_session(self._id(self.a)))
        self.assertEqual(self.ctl.drain_manual_script(), "stack(s('bd'))\n")

    def test_loading_a_missing_session_reports_failure(self):
        self.assertFalse(self.ctl.load_session("nope"))

    def test_a_session_id_cannot_escape_the_sessions_dir(self):
        self.ctl.name_session("../../etc/passwd", "x")
        self.ctl.favorite_session("../../etc/passwd", True)
        self.assertFalse(os.path.exists(os.path.join(self._tmp.name, "..", "..", "etc")))


if __name__ == "__main__":
    unittest.main()
