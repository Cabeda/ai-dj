import unittest

from ai_dj import palette


class PaletteTests(unittest.TestCase):
    def test_names_are_unique(self):
        names = palette.names()
        self.assertEqual(len(names), len(set(names)))

    def test_every_instrument_has_a_realisation_and_known_family(self):
        for ins in palette.all_instruments():
            self.assertTrue(ins.realisations, f"{ins.name} has no backend")
            self.assertIn(ins.family, palette.families())

    def test_strudel_supports_classical_instruments(self):
        strudel = palette.names(palette.STRUDEL)
        for name in ("violin", "cello", "flute", "trumpet", "piano", "timpani"):
            self.assertIn(name, strudel)
        # classical voices are sampled (GM soundfont or a real recorded library)
        self.assertEqual(palette.realisation("violin", palette.STRUDEL), "gm_violin")
        self.assertEqual(palette.realisation("timpani", palette.STRUDEL), "timpani")

    def test_prefers_recorded_instruments_over_soundfonts(self):
        # VCSL and the piano/drum-machine packs sound better than GM, so the
        # headline instruments from those families must not be GM soundfonts.
        for name in ("piano", "grand_piano", "harp", "timpani", "vibraphone",
                     "marimba", "kick", "snare", "hat", "shaker"):
            self.assertFalse(
                palette.realisation(name, palette.STRUDEL).startswith("gm_"),
                f"{name} regressed to a GM soundfont",
            )

    def test_sonic_pi_does_not_support_classical(self):
        sonic = palette.names(palette.SONIC_PI)
        self.assertNotIn("violin", sonic)
        self.assertFalse(palette.is_supported("violin", palette.SONIC_PI))
        # but the electronic core is there
        self.assertIn("kick", sonic)
        self.assertIn("acid_bass", sonic)

    def test_for_backend_filters(self):
        self.assertTrue(set(palette.names(palette.STRUDEL)).issuperset(
            set(palette.names(palette.SONIC_PI))))
        self.assertGreater(len(palette.names(palette.STRUDEL)),
                           len(palette.names(palette.SONIC_PI)))

    def test_resolve_and_realisation(self):
        ins = palette.resolve("kick")
        self.assertEqual(ins.family, "drums")
        self.assertEqual(palette.realisation("kick", palette.SONIC_PI), ":bd_haus")
        self.assertEqual(palette.realisation("kick", palette.STRUDEL), "bd")
        with self.assertRaises(KeyError):
            palette.resolve("nope")
        with self.assertRaises(KeyError):
            palette.realisation("violin", palette.SONIC_PI)

    def test_describe_lists_only_supported(self):
        text = palette.describe(palette.SONIC_PI)
        self.assertIn("drums:", text)
        self.assertNotIn("violin", text)
        self.assertIn("violin", palette.describe(palette.STRUDEL))


if __name__ == "__main__":
    unittest.main()
