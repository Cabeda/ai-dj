import unittest

from ai_dj import llm
from ai_dj.live import valid_strudel
from ai_dj.state import DJState
from ai_dj.strudel_templates import build


class AdoptSeedTests(unittest.TestCase):
    def setUp(self):
        self.layers, self.info = build("harp_strings", key="f", mode="minor", bpm=72)
        self.state = DJState(bpm=72, key="f", mode="minor",
                             layers=self.layers, lang="strudel")

    def test_keep_identity_ignores_different_tempo_and_key(self):
        seed = ('setcpm(96/4)\n\nstack(\n  // layer: harp\n'
                '  n("0 4 2 5").scale("f:minor").s("gm_orchestral_harp")\n)\n')
        self.state.adopt_seed(seed, hearing={"key": "c minor"}, keep_identity=True)
        self.assertEqual(self.state.bpm, 72)
        self.assertEqual(self.state.key, "f")
        self.assertEqual(self.state.mode, "minor")
        self.assertEqual(list(self.state.layers), ["harp"])

    def test_without_keep_identity_the_seed_retunes_the_session(self):
        seed = 'setcpm(96/4)\n\nstack(\n  // layer: harp\n  s("gm_harp")\n)\n'
        self.state.adopt_seed(seed, hearing={"key": "c minor"})
        self.assertEqual(self.state.bpm, 96)
        self.assertEqual(self.state.key, "c")

    def test_mood_is_still_taken_when_keeping_identity(self):
        seed = 'stack(\n  // layer: harp\n  s("gm_orchestral_harp")\n)\n'
        self.state.adopt_seed(seed, hearing={"mood": "calm"}, keep_identity=True)
        self.assertEqual(self.state.mood, "calm")

    def test_adopted_script_stays_valid_and_keeps_identity(self):
        seed = ('setcpm(140/4)\n\nstack(\n  // layer: kick\n  s("bd*4")\n,'
                '\n  // layer: bass\n  n("0 3").scale("a:minor").s("sawtooth")\n)\n')
        self.state.adopt_seed(seed, keep_identity=True)
        script = self.state.render()
        self.assertTrue(valid_strudel(script))
        self.assertIn("setcpm(72/4)", script)
        self.assertIn("f:minor", script)  # music agrees with the session key


    def test_seed_scale_is_rewritten_to_the_session_key(self):
        # the model is asked to stay in key; enforce it
        seed = ('stack(\n  // layer: bass\n'
                '  n("0 3").scale("a:minor").s("sawtooth")\n,\n'
                '  // layer: drums\n  s("bd*4")\n)\n')
        self.state.adopt_seed(seed, keep_identity=True)
        self.assertIn('scale("f:minor")', self.state.layers["bass"])
        self.assertNotIn("a:minor", self.state.layers["bass"])
        self.assertEqual(self.state.layers["drums"], 's("bd*4")')

    def test_alignment_does_not_mangle_code(self):
        from ai_dj.state import _align_strudel_identity

        code = 'n("0 2 4").scale("c:dorian").lpf(sine.range(200,900).slow(4)).gain(0.3)'
        out = _align_strudel_identity(code, "g", "minor")
        self.assertEqual(out.count("("), out.count(")"))
        self.assertIn('scale("g:minor")', out)
        self.assertIn("sine.range(200,900)", out)

    def test_alignment_leaves_absolute_notes_alone(self):
        from ai_dj.state import _align_strudel_identity

        code = 'note("c3 e3 g3").s("gm_violin")'
        self.assertEqual(_align_strudel_identity(code, "f", "minor"), code)


class SeedPromptTests(unittest.TestCase):
    def test_anchored_prompt_forbids_new_tempo(self):
        anchored = llm._system("seed", "strudel", reference=False, anchored=True)
        self.assertIn("Do NOT call setcpm", anchored)
        self.assertNotIn("Start with setcpm", anchored)

    def test_unanchored_prompt_still_sets_tempo(self):
        free = llm._system("seed", "strudel", reference=False)
        self.assertIn("Start with setcpm", free)

    def test_session_identity_reaches_the_model(self):
        captured = {}

        def fake_post(provider, base_url, api_key, body, session_id=None, timeout=300):
            captured["body"] = body
            return {"choices": [{"message": {"content": "{}"}}], "usage": {}}

        original = llm._post_chat
        llm._post_chat = fake_post
        try:
            llm.seed_script("lo-fi girl", "k", reference=False, lang="strudel",
                            session={"bpm": 72, "key": "f", "mode": "minor"})
        finally:
            llm._post_chat = original
        system = captured["body"]["messages"][0]["content"]
        user = captured["body"]["messages"][1]["content"]
        self.assertIn("Do NOT call setcpm", system)
        self.assertIn("72bpm", user)
        self.assertIn("f", user)


class LayerParseEdgeTests(unittest.TestCase):
    def test_single_layer_does_not_swallow_the_closing_paren(self):
        script = 'stack(\n  // layer: harp\n  n("0 4").s("gm_harp")\n)\n'
        state = DJState.from_script(script, lang="strudel")
        self.assertEqual(list(state.layers), ["harp"])
        self.assertEqual(state.layers["harp"], 'n("0 4").s("gm_harp")')

    def test_multi_layer_round_trips(self):
        layers, info = build("orchestral", seed=2)
        state = DJState(bpm=info["bpm"], key=info["key"], mode=info["mode"],
                        layers=layers, lang="strudel")
        back = DJState.from_script(state.render(), lang="strudel")
        self.assertEqual(set(back.layers), set(layers))
        for code in back.layers.values():
            self.assertNotIn("\n)", code)


if __name__ == "__main__":
    unittest.main()
