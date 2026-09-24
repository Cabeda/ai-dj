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

        from ai_dj.palette import STRUDEL, all_instruments

        known = {ins.realisations[STRUDEL] for ins in all_instruments() if STRUDEL in ins.realisations}
        # built-in oscillators/noise are not palette entries
        builtin = {"sawtooth", "sine", "triangle", "square", "supersaw", "saw",
                   "white", "pink", "brown"}
        unknown = []
        for name in st.ARCHETYPE_NAMES:
            layers, _ = st.build(name, seed=3)
            for layer, code in layers.items():
                for expr in re.findall(r's\("([^"]+)"\)', code):
                    # mini-notation: strip repeats (*n), indices (:n) and lists
                    for token in re.split(r"[,\s]+", expr):
                        base = token.split("*")[0].split(":")[0].strip()
                        if base and base not in known and base not in builtin:
                            unknown.append(f"{name}/{layer}: {base}")
        self.assertEqual(unknown, [], f"instrument ids not in the palette: {unknown}")

    def test_chord_quality_follows_the_mode(self):
        major = st.layers_for("solo_piano", "c", "major")["piano"]
        minor = st.layers_for("solo_piano", "c", "minor")["piano"]
        self.assertIn("CM7", major)
        self.assertNotIn("Cm7", major)
        self.assertIn("Cm7", minor)

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

    def test_variation_nudges_a_strudel_param(self):
        # Regression: variation() only matched Sonic Pi kwargs (amp:/cutoff:),
        # so on Strudel it was a permanent no-op and the "deterministic
        # variation" fallback never fired.
        state = DJState(bpm=120, key="c", mode="minor",
                        layers={"piano": 'note("c3 e3").s("gm_piano").gain(0.4)'},
                        lang="strudel")
        self.assertTrue(state.variation())
        self.assertNotEqual(state.layers["piano"],
                            'note("c3 e3").s("gm_piano").gain(0.4)')
        self.assertIn(".gain(", state.layers["piano"])

    # -- pasting a whole script (opaque sets) -------------------------------

    PASTED = (
        "// \"Night ride\"\n"
        "samples('github:eddyflux/crate')\n"
        "setcps(.75)\n"
        "stack(\n"
        "  s(\"bd\").bank('crate'),\n"
        "  note(\"c3 e3\").s(\"gm_epiano1\")\n"
        ")\n"
    )

    def _state_with_old_layers(self):
        return DJState(bpm=120, key="c", mode="minor",
                       layers={"kick": 's("RolandTR909_bd")',
                               "bass": 'note("c2").s("sawtooth")'},
                       lang="strudel")

    def test_a_pasted_script_is_kept_verbatim(self):
        state = self._state_with_old_layers()
        state.set_manual(self.PASTED)
        self.assertTrue(state.opaque)
        self.assertEqual(state.render(), self.PASTED)

    def test_a_pasted_script_does_not_resurrect_the_old_layers(self):
        # Regression: the manual path only replaced state.layers when the
        # script decomposed into `// layer:` blocks. A pasted script does not,
        # so the old layers survived and the next render switched the set back
        # to the previous music (heard as both sets playing at once).
        state = self._state_with_old_layers()
        state.set_manual(self.PASTED)
        self.assertNotIn("RolandTR909_bd", state.render())
        self.assertNotIn("sawtooth", state.render())

    def test_a_script_with_markers_stays_layer_based(self):
        marked = ('stack(\n'
                  '  // layer: kick\n  s("bd"),\n'
                  '  // layer: bass\n  note("c2")\n)\n')
        state = self._state_with_old_layers()
        state.set_manual(marked)
        self.assertFalse(state.opaque)
        self.assertEqual(set(state.layers), {"kick", "bass"})

    def test_an_opaque_set_is_evolved_as_one_piece(self):
        state = self._state_with_old_layers()
        state.set_manual(self.PASTED)
        plan = state.plan_next()
        self.assertEqual(plan["layer"], "set")
        # a model naming some other layer must still replace the whole set,
        # or render() would ignore the change
        state.apply_op({"op": {"kind": "modify", "layer": "kick"},
                        "ruby": "stack(s('bd*4'))",
                        "decision": {"action": "more drums"}})
        self.assertEqual(state.render(), "stack(s('bd*4'))")

    def test_resuming_an_opaque_script_is_detected(self):
        state = DJState.from_script(self.PASTED, lang="strudel")
        self.assertTrue(state.opaque)
        self.assertEqual(state.render(), self.PASTED)


if __name__ == "__main__":
    unittest.main()


class NonVocalTests(unittest.TestCase):
    """The station replaces non-vocal radio (lofi girl et al), so no archetype
    may use a voice patch: vocals pull attention away from the work.
    """

    VOCAL_PATCHES = ("choir", "voice_oohs", "gm_choir_aahs", "gm_voice_oohs")

    def test_no_archetype_uses_a_voice_patch(self):
        offenders = []
        for name in st.ARCHETYPE_NAMES:
            layers, _ = st.build(name, seed=1)
            joined = " ".join(layers.values())
            for patch in self.VOCAL_PATCHES:
                if patch in joined:
                    offenders.append((name, patch))
        self.assertEqual(offenders, [], f"vocal patches in archetypes: {offenders}")
