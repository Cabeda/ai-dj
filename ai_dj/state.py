"""Deterministic DJ state.

Everything that does not need a model lives here: tempo, key, mode, energy,
the section plan, which layer to change next, and a deterministic variation
used between model calls. The LLM only ever produces one small layer patch.

State is the single source of truth for the live set. It renders the full
Sonic Pi script on demand and can parse a saved script back into layers so a
session can be resumed.
"""

import random
import re
import time

# (name, seconds, target_energy) — a deterministic energy arc that loops.
SECTIONS = [
    ("intro", 60, 0.30),
    ("build", 75, 0.55),
    ("peak", 90, 0.85),
    ("breakdown", 45, 0.25),
    ("peak", 90, 0.90),
    ("outro", 45, 0.35),
]

# Layer priorities for deterministic decisions.
BUILD_ORDER = ["hats", "perc", "bass", "pad", "arp", "lead", "fx", "sub", "drone"]
REDUCE_ORDER = ["lead", "arp", "fx", "perc", "hats", "drone", "sub", "pad", "bass"]
CORE_LAYERS = {"kick", "bass"}

# the single "layer" an opaque set is evolved as
WHOLE_LAYER = "set"


def _align_strudel_identity(code, key, mode):
    """Rewrite a Strudel layer so its tonality matches the session.

    The model is told to stay in key, but a seed or replace can still emit
    `.scale("a:minor")` in an F-minor session. Rewrite the root:mode inside
    `.scale(...)` and `.chord(...)` so the music cannot contradict the session.
    """
    def fix(m):
        return f'{m.group(1)}"{key}:{mode}"'

    code = re.sub(r'(\.scale\()"[^"]*"', fix, code)
    code = re.sub(r'(\.chord\()"[^"]*"', fix, code)
    return code


def parse_layers(script, lang="sonic_pi"):
    """Split a rendered script into {layer_name: layer_code}.

    sonic_pi: top-level `live_loop :name do` blocks (what render() guarantees).
    strudel:  top-level `$ name: <pattern>` marker comments that render() emits.
    """
    if lang == "strudel":
        return _parse_layers_strudel(script)
    matches = list(re.finditer(r"(?m)^live_loop\s+:(\w+)\s+do", script))
    layers = {}
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(script)
        layers[m.group(1)] = script[start:end].strip()
    return layers


def _parse_layers_strudel(script):
    """Split a Strudel script on `// layer: <name>` markers (indentation ok)."""
    matches = list(re.finditer(r"(?m)^\s*//\s*layer:\s*(\w+)\s*$", script))
    layers = {}
    for i, m in enumerate(matches):
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(script)
        body = script[start:end].strip().rstrip(",").strip()
        if i + 1 == len(matches):
            # the last layer runs to the end of the script, which includes the
            # stack's closing paren — drop it (and any blank lines before it)
            body = re.sub(r"\n\s*\)\s*$", "", body).strip()
        if body:
            layers[m.group(1)] = body
    return layers


def parse_header(script):
    """Read the '# state ...' / '// state ...' comment line back into a dict."""
    m = re.search(r"(?m)^(?:\#|//)\s*state\s+(.+)$", script)
    if not m:
        return {}
    out = {}
    for tok in m.group(1).split():
        if "=" in tok:
            k, v = tok.split("=", 1)
            out[k] = v
    return out


class DJState:
    def __init__(self, bpm, key, mode, layers, energy=0.35, mood="",
                 section_index=0, model="", lang="sonic_pi", opaque=False):
        self.bpm = int(bpm)
        self.key = key
        self.mode = mode
        self.lang = lang
        self.layers = dict(layers)
        self.energy = float(energy)
        self.mood = mood
        self.section_index = section_index % len(SECTIONS)
        self.section_started = time.time()
        self.model = model
        self.last_action = ""
        self.last_layer = None
        self.history = []
        self.rng = random.Random(bpm * 1000 + len(layers))
        # An opaque set is a whole script the user pasted (or that we resumed)
        # which does not decompose into `// layer:` blocks. It is the source of
        # truth: rendered verbatim, and evolved as one piece — never rebuilt
        # from the layer model, which would resurrect the previous set.
        self.opaque = opaque

    # -- section / energy ---------------------------------------------------
    @property
    def section(self):
        return SECTIONS[self.section_index][0]

    def target_energy(self):
        return SECTIONS[self.section_index][2]

    def section_seconds(self):
        return SECTIONS[self.section_index][1]

    def section_elapsed(self):
        return time.time() - self.section_started

    def advance_section(self):
        self.section_index = (self.section_index + 1) % len(SECTIONS)
        self.section_started = time.time()

    # -- deterministic planning --------------------------------------------
    def _pick_existing(self, exclude_last=True):
        names = [n for n in self.layers if not (exclude_last and n == self.last_layer)]
        if not names:
            names = list(self.layers)
        return self.rng.choice(names) if names else None

    def plan_next(self):
        """Deterministically choose the layer and direction for the next step."""
        target = self.target_energy()
        delta = target - self.energy
        if self.opaque:
            # one piece: never add or drop "layers" it does not have
            if delta > 0.08:
                direction = "build"
            elif delta < -0.08:
                direction = "reduce"
            else:
                direction = "vary"
            return {"layer": WHOLE_LAYER, "direction": direction}
        if delta > 0.08:
            direction = "build"
            layer = next((l for l in BUILD_ORDER if l not in self.layers), None)
            if layer is None:
                direction = "intensify"
                layer = self._pick_existing()
        elif delta < -0.08:
            direction = "reduce"
            layer = next((l for l in REDUCE_ORDER
                          if l in self.layers and l not in CORE_LAYERS), None)
            if layer is None:
                direction = "vary"
                layer = self._pick_existing()
        else:
            direction = "vary"
            layer = self._pick_existing()
        return {
            "direction": direction,
            "layer": layer,
            "energy_now": round(self.energy, 2),
            "target_energy": round(target, 2),
            "section": self.section,
        }

    # -- applying a model patch --------------------------------------------
    def apply_op(self, decided):
        op = decided.get("op") or {}
        kind = op.get("kind", "modify")
        layer = op.get("layer") or self.last_layer
        ruby = (decided.get("ruby") or "").strip()
        if self.opaque:
            # the set is one piece: a patch can only replace it wholesale, and
            # a model that names some other "layer" must not add one (render()
            # would ignore it and the change would silently vanish)
            kind, layer = "modify", WHOLE_LAYER
        if kind == "remove" and layer:
            self.layers.pop(layer, None)
        elif layer and ruby:
            self.layers[layer] = ruby
        self.last_layer = layer
        action = (decided.get("decision") or {}).get("action", "")
        self.last_action = action
        self.history.append(action)
        self.history = self.history[-5:]
        self.mood = (decided.get("hearing") or {}).get("mood", self.mood)
        # step energy toward the section target
        if kind == "remove":
            self.energy = max(0.0, self.energy - 0.15)
        else:
            self.energy += 0.2 * (self.target_energy() - self.energy)
        self.energy = max(0.0, min(1.0, self.energy))

    # -- deterministic variation (no model) --------------------------------
    def variation(self):
        """Nudge one layer's numeric params. Safe no-op if nothing matches."""
        layer = self._pick_existing()
        if not layer:
            return False
        code = self.layers[layer]

        def bump(m):
            val = float(m.group(2))
            factor = self.rng.choice([0.9, 0.95, 1.05, 1.1])
            return f"{m.group(1)}{round(val * factor, 3)}"

        if self.lang == "strudel":
            # method-call params, e.g. .gain(0.3) .room(0.4) .lpf(2000)
            params = ("gain", "room", "lpf", "hpf", "attack", "release",
                      "delay", "pan", "shape")
        else:
            # Sonic Pi keyword args, e.g. amp: 0.5
            params = ("amp", "cutoff", "release")

        new = code
        for param in params:
            if self.lang == "strudel":
                pat = rf"(\.{param}\(\s*)([0-9.]+)"
            else:
                pat = rf"(\b{param}:\s*)([0-9.]+)"
            new = re.sub(pat, bump, code, count=1)
            if new != code:
                break
        if new != code:
            self.layers[layer] = new
            self.last_layer = layer
            return True
        return False

    # -- context + render ---------------------------------------------------
    def to_context(self):
        return (
            f"bpm={self.bpm} key={self.key} mode={self.mode} "
            f"energy={self.energy:.2f} section={self.section}\n"
            f"active layers: {', '.join(self.layers) or 'none'}\n"
            f"last action: {self.last_action or 'none'}")

    def render(self):
        if self.opaque:
            # the user's own script, played as-is
            return self.layers.get(WHOLE_LAYER, "")
        if self.lang == "strudel":
            return self._render_strudel()
        header = (
            "# ai-dj live - generated script\n"
            f"# model: {self.model}\n"
            f"# state bpm={self.bpm} key={self.key} mode={self.mode} "
            f"energy={self.energy:.2f} section={self.section}\n"
            f"# last: {self.last_action}\n"
            "\n")
        body = f"use_bpm {self.bpm}\n\n" + "\n\n".join(self.layers.values())
        return header + body

    def _render_strudel(self):
        header = (
            "// ai-dj live - generated script\n"
            f"// model: {self.model}\n"
            f"// state bpm={self.bpm} key={self.key} mode={self.mode} "
            f"energy={self.energy:.2f} section={self.section}\n"
            f"// last: {self.last_action}\n"
            f"\nsetcpm({self.bpm}/4)\n\n"
            "stack(\n")
        parts = []
        for name, code in self.layers.items():
            parts.append(f"  // layer: {name}\n  {code}")
        return header + ",\n".join(parts) + "\n)\n"

    def set_manual(self, script):
        """Adopt a script the user wrote.

        If it decomposes into `// layer:` blocks we keep evolving it layer by
        layer. Otherwise it is opaque: kept verbatim, and evolved as one piece.
        Either way the previous layer model is dropped — otherwise the next
        render would resurrect the old set.
        """
        layers = parse_layers(script, self.lang)
        if layers:
            self.layers = layers
            self.opaque = False
        else:
            self.layers = {WHOLE_LAYER: script}
            self.opaque = True
        self.last_layer = None

    @classmethod
    def from_script(cls, script, model="", lang="sonic_pi"):
        layers = parse_layers(script, lang)
        h = parse_header(script)
        return cls(
            bpm=int(h.get("bpm", 120)),
            key=h.get("key", "a"),
            mode=h.get("mode", "minor"),
            layers=layers if layers else ({WHOLE_LAYER: script} if script.strip() else {}),
            energy=float(h.get("energy", 0.35)),
            model=model,
            lang=lang,
            opaque=not layers and bool(script.strip()),
        )

    def adopt_seed(self, ruby, hearing=None, lang=None, keep_identity=False):
        """Replace layers with those parsed from a seed script.

        keep_identity: keep this session's tempo/key/mode and only take the
        seed's musical content. Used for prompt seeding and replace feedback,
        where the session (or the archetype it was cast from) already has an
        identity and the model should write music inside it, not rename it.
        """
        lang = lang or self.lang
        layers = parse_layers(ruby or "", lang)
        if layers and keep_identity and lang == "strudel":
            # the model may still emit another key; make the music agree with
            # the session so the set cannot contradict itself
            layers = {n: _align_strudel_identity(c, self.key, self.mode)
                      for n, c in layers.items()}
        if layers:
            self.layers = layers
        if not keep_identity:
            m = re.search(r"(?:use_bpm|setcpm\()\s*(\d+)", ruby or "")
            if m:
                self.bpm = int(m.group(1))
        if hearing:
            if not keep_identity:
                k = (hearing.get("key") or "")
                root = re.search(r"\b([a-gA-G])", k)
                if root:
                    self.key = root.group(1).lower()
                low = k.lower()
                if "minor" in low:
                    self.mode = "minor"
                elif "major" in low:
                    self.mode = "major"
            self.mood = hearing.get("mood", self.mood)
        self.last_action = "seed"
