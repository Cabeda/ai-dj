import unittest

from ai_dj import strudel_templates as st
from ai_dj.live import valid_strudel
from ai_dj.palette import STRUDEL, is_supported
from ai_dj.state import DJState


class ArchetypeTests(unittest.TestCase):
    def test_every_archetype_builds_and_validates(self):
        for name in st.ARCHETYPE_NAMES:
            layers, info = st.build(name, seed=1)
            self.assertTrue(layers, name)
            self.assertEqual(info["archetype"], name)
            script = st.render_layers(layers.values())
            self.assertTrue(valid_strudel(script), f"{name} is not valid Strudel")

    def test_layers_have_no_tempo_or_stack(self):
        # layers are rendered inside a stack; they must not set tempo themselves
        for name in st.ARCHETYPE_NAMES:
            layers, _ = st.build(name, seed=2)
            for layer, code in layers.items():
                self.assertNotIn("setcpm", code, f"{name}/{layer}")
                self.assertNotIn("stack", code, f"{name}/{layer}")

    def test_strudel_instruments_are_in_the_palette(self):
        import re

        for name in st.ARCHETYPE_NAMES:
            layers, _ = st.build(name, seed=3)
            for layer, code in layers.items():
                ids = re.findall(r'\.s\("([^"]+)"\)', code)
                if not ids and "s(" in code:
                    ids = re.findall(r's\("([^"]+)"\)', code)
                for sid in ids:
                    # built-in synth/sample names are not palette entries
                    if sid.startswith("gm_"):
                        self.assertTrue(
                            any(
                                is_supported(canonical, STRUDEL)
                                and canonical == _canonical_for(STRUDEL, sid)
                                for canonical in _canonicals()
                            ),
                            f"{sid} not in palette",
                        )

    def test_tempo_matches_the_archetype(self):
        _, electronic = st.build("techno", seed=1)
        _, classical = st.build("orchestral", seed=1)
        self.assertGreater(electronic["bpm"], classical["bpm"])

    def test_seeds_vary(self):
        a, _ = st.build("techno", seed=1)
        b, _ = st.build("techno", seed=2)
        self.assertNotEqual(a, b)

    def test_classical_archetype_uses_gm_instruments(self):
        layers, _ = st.build("string_quartet", seed=1)
        joined = " ".join(layers.values())
        self.assertIn("gm_", joined)


def _canonicals():
    from ai_dj.palette import all_instruments

    return [i.name for i in all_instruments()]


def _canonical_for(backend, realisation):
    from ai_dj.palette import all_instruments

    for ins in all_instruments():
        if ins.realisations.get(backend) == realisation:
            return ins.name
    return None


class StrudelStateTests(unittest.TestCase):
    def test_render_and_parse_round_trip(self):
        layers, info = st.build("orchestral", seed=5)
        state = DJState(bpm=info["bpm"], key=info["key"], mode=info["mode"],
                        layers=layers, lang="strudel")
        script = state.render()
        self.assertIn("setcpm(", script)
        self.assertIn("stack(", script)
        back = DJState.from_script(script, lang="strudel")
        self.assertEqual(set(back.layers), set(layers))
        self.assertEqual(back.bpm, info["bpm"])
        self.assertEqual(back.key, info["key"])

    def test_parsed_layers_are_single_expressions(self):
        layers, info = st.build("chamber", seed=6)
        state = DJState(bpm=info["bpm"], key=info["key"], mode=info["mode"],
                        layers=layers, lang="strudel")
        back = DJState.from_script(state.render(), lang="strudel")
        for name, code in back.layers.items():
            self.assertFalse(code.endswith(","), name)
            self.assertNotIn("// layer:", code, name)

    def test_sonic_pi_render_is_unchanged(self):
        from ai_dj.templates import default_layers

        layers, info = default_layers()
        state = DJState(bpm=info["bpm"], key=info["key"], mode=info["scale"],
                        layers=layers)
        script = state.render()
        self.assertIn("use_bpm", script)
        self.assertIn("live_loop :kick", script)


if __name__ == "__main__":
    unittest.main()
