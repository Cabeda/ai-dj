import unittest

from ai_dj import llm
from ai_dj.live import valid_ruby, valid_strudel


class LangTests(unittest.TestCase):
    def test_both_langs_have_prompts_and_references(self):
        for lang in llm.LANGS:
            system = llm._system("evolve", lang, True)
            self.assertIn("Reference", system)
            self.assertGreater(len(llm._load_reference(lang)), 100)

    def test_lean_form_omits_the_reference(self):
        self.assertLess(
            len(llm._system("seed", "strudel", False)),
            len(llm._system("seed", "strudel", True)),
        )

    def test_strudel_reference_covers_mini_notation_and_the_palette(self):
        ref = llm._load_reference("strudel")
        self.assertIn("mini-notation", ref.lower())
        self.assertIn("gm_violin", ref)
        self.assertIn("stack", ref)


class ValidStrudelTests(unittest.TestCase):
    def test_accepts_real_patterns(self):
        self.assertTrue(valid_strudel('note("c3 e3 g3").s("gm_violin")'))
        self.assertTrue(valid_strudel('stack(s("bd*4"), note("c2").s("sawtooth"))'))

    def test_rejects_broken_or_wrong_language(self):
        self.assertFalse(valid_strudel(""))
        self.assertFalse(valid_strudel('note("c3 e3'))          # unterminated quote
        self.assertFalse(valid_strudel('note("c3").s("x"'))     # unbalanced paren
        self.assertFalse(valid_strudel("use_bpm 90"))           # Sonic Pi leak
        self.assertFalse(valid_strudel("live_loop :kick do"))

    def test_ruby_gate_still_works_for_sonic_pi(self):
        self.assertTrue(valid_ruby("use_bpm 90\nplay 60"))

    def test_a_strudel_layer_validates_without_a_sonic_pi_header(self):
        # Regression: the evolve gate used to validate the model's layer body
        # wrapped in `use_bpm <bpm>` (a Sonic Pi header). valid_strudel rejects
        # `use_bpm`, so every Strudel patch was silently discarded and the set
        # never changed. A layer body must validate on its own.
        layer = 'note("c3 e3 g3").s("gm_violin").gain(0.4).room(0.4)'
        self.assertTrue(valid_strudel(layer))
        self.assertFalse(valid_strudel(f"use_bpm 90\n\n{layer}"))


if __name__ == "__main__":
    unittest.main()
