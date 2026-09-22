import os
import tempfile
import unittest

from ai_dj import session


class SessionStorageTests(unittest.TestCase):
    """An all-day run saves a script every evolve. Versioning must not scan the
    whole directory, and old versions must be pruned.
    """

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self._orig_base = session.BASE
        session.BASE = self._tmp.name
        self.path = session.create_session({"seed": 1, "bpm": 90})

    def tearDown(self):
        session.BASE = self._orig_base
        self._tmp.cleanup()

    def test_versions_increment_and_last_points_at_newest(self):
        for i in range(1, 4):
            name = session.save_script(self.path, f"script {i}")
            self.assertEqual(name, f"{i:04d}.rb")
        ver, text = session.load_latest(os.path.basename(self.path))
        self.assertEqual(ver, "0003.rb")
        self.assertEqual(text, "script 3")

    def test_strudel_sessions_use_mjs(self):
        name = session.save_script(self.path, "stack(s('bd'))", lang="strudel")
        self.assertEqual(name, "0001.mjs")
        self.assertTrue(os.path.islink(os.path.join(self.path, "last.mjs")))
        ver, text = session.load_latest(os.path.basename(self.path))
        self.assertEqual(ver, "0001.mjs")
        self.assertEqual(text, "stack(s('bd'))")

    def test_mixed_extensions_share_one_version_sequence(self):
        session.save_script(self.path, "a", lang="sonic_pi")
        session.save_script(self.path, "b", lang="strudel")
        self.assertEqual(session._next_version(self.path), 3)

    def test_old_versions_are_pruned(self):
        original = session.KEEP_VERSIONS
        session.KEEP_VERSIONS = 5
        try:
            for i in range(1, 13):
                session.save_script(self.path, f"script {i}")
            files = sorted(f for f in os.listdir(self.path) if session._version_of(f))
            self.assertEqual(len(files), 5)
            self.assertEqual(files, ["0008.rb", "0009.rb", "0010.rb", "0011.rb", "0012.rb"])
        finally:
            session.KEEP_VERSIONS = original
        # the newest is still loadable after pruning
        ver, text = session.load_latest(os.path.basename(self.path))
        self.assertEqual(text, "script 12")

    def test_pruning_never_orphans_a_symlink(self):
        # alternate languages while exceeding the cap: the file last.<ext>
        # points at must survive, or load_latest raises
        original = session.KEEP_VERSIONS
        session.KEEP_VERSIONS = 3
        try:
            for i in range(8):
                lang = "sonic_pi" if i % 2 == 0 else "strudel"
                session.save_script(self.path, f"v{i}", lang=lang)
            for ext in ("rb", "mjs"):
                last = os.path.join(self.path, f"last.{ext}")
                if os.path.islink(last):
                    self.assertTrue(
                        os.path.exists(last),
                        f"last.{ext} is dangling after pruning",
                    )
            # and both extensions remain loadable
            ver, text = session.load_latest(os.path.basename(self.path))
            self.assertTrue(text.startswith("v"))
        finally:
            session.KEEP_VERSIONS = original

    def test_versions_beyond_9999_still_increment(self):
        # a day-long run can pass 9999 versions; the counter must not reset
        session.save_script(self.path, "a")
        os.unlink(os.path.join(self.path, "0001.rb"))
        os.unlink(os.path.join(self.path, "last.rb"))
        with open(os.path.join(self.path, "10000.rb"), "w") as f:
            f.write("big")
        os.symlink("10000.rb", os.path.join(self.path, "last.rb"))
        self.assertEqual(session._next_version(self.path), 10001)

    def test_slug_is_safe_for_model_text(self):
        path = session.create_session({"seed": "../../etc/passwd", "bpm": 90})
        self.assertNotIn("..", os.path.basename(path))
        self.assertNotIn("/", os.path.basename(path))

    def test_list_sessions_reports_latest(self):
        session.save_script(self.path, "one")
        session.save_script(self.path, "two")
        entries = session.list_sessions()
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]["latest"], "0002.rb")


if __name__ == "__main__":
    unittest.main()
