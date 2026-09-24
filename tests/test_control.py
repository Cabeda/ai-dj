import unittest

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


if __name__ == "__main__":
    unittest.main()
