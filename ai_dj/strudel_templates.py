"""Strudel archetypes.

Curated starting points for a Strudel set, the Strudel counterpart of the
Sonic Pi templates. An archetype is a named ensemble/genre: a set of layers,
each a Strudel pattern expression, plus a tempo, key and mode.

Layers render into one `stack(...)` expression, because a Strudel set is a
single pattern. Every layer is self-contained (no `setcpm`, no `$:` labels) so
the orchestrator keeps owning tempo.

Timbre names in `s(...)` come from ai_dj.palette (Strudel realisations).
"""

import random

_KEYS = ["c", "d", "e", "f", "g", "a", "b"]
_MODES = ["minor", "major", "dorian", "mixolydian", "aeolian"]
_BPM_RANGE = (70, 132)


def _bpm():
    return random.randint(*_BPM_RANGE)


def _key():
    return random.choice(_KEYS)


def _mode():
    return random.choice(_MODES)


# -- layer bodies ----------------------------------------------------------
# Each body is a Strudel pattern expression. `{key}` / `{mode}` are substituted.

_LAYER_BODIES = {
    # electronic
    "kick":     's("bd*4").gain(0.85)',
    "hat":      's("hh*8").gain(rand.range(0.15,0.4)).pan(sine.range(0.3,0.7).slow(4))',
    "noise_fx": 's("white").gain(0.04).lpf(perlin.range(600,2400).slow(8))',
    "acid":     'n("0 0 3 5 0 7 5 3").scale("{key}:{mode}").s("sawtooth")'
                '.lpf(sine.range(300,1400).slow(4)).gain(0.4)',
    "lead":     'n("0 2 4 7").scale("{key}:{mode}").s("sawtooth")'
                '.lpf(sine.range(700,2200).slow(6)).gain(0.28)',
    "arp":      'n("0 2 4 7 4 2").scale("{key}:{mode}").s("triangle")'
                '.gain(0.22).fast(2)',
    # classical
    "pad":      'note("[{root}3,{third}3,{fifth}3]").s("gm_string_ensemble_1")'
                '.attack(1.2).release(3).gain(0.32).slow(4)',
    "choir":    'note("[{root}4,{third}4,{fifth}4]").s("gm_choir_aahs")'
                '.attack(1.5).release(4).gain(0.25).slow(8)',
    "violin":   'n("0 2 4 7 4 2").scale("{key}:{mode}").s("gm_violin")'
                '.attack(0.15).release(0.9).gain(0.3)',
    "cello":    'n("0 2 4 2").scale("{key}:{mode}").s("gm_cello")'
                '.attack(0.2).release(1.2).gain(0.35).slow(2)',
    "pizz":     'note("[{root}2,{fifth}2]").s("gm_pizzicato_strings").gain(0.3)',
    "harp":     'n("0 4 2 5 3 7").scale("{key}:{mode}").s("gm_orchestral_harp")'
                '.gain(0.28).slow(2)',
    "piano":    'chord("<{key^}m7 {key^}m7 {key^}M7 {key^}m7>").voicing()'
                '.s("gm_piano").gain(0.3).slow(4)',
    "flute":    'n("4 2 0 2 4 7").scale("{key}:{mode}").s("gm_flute")'
                '.attack(0.1).release(1).gain(0.25)',
    "timpani":  'note("{root}1").s("gm_timpani").gain(0.4).slow(4)',
}

_SCALE_DEGREES = {
    "minor": [0, 2, 3, 5, 7, 8, 10],
    "major": [0, 2, 4, 5, 7, 9, 11],
    "dorian": [0, 2, 3, 5, 7, 9, 10],
    "mixolydian": [0, 2, 4, 5, 7, 9, 10],
    "aeolian": [0, 2, 3, 5, 7, 8, 10],
}

_PITCH_CLASSES = {"c": 0, "d": 2, "e": 4, "f": 5, "g": 7, "a": 9, "b": 11}
_NAMES = ["c", "db", "d", "eb", "e", "f", "gb", "g", "ab", "a", "bb", "b"]


def _triad(key, mode):
    """Root/third/fifth note names for a key+mode (for sampled chords)."""
    base = _PITCH_CLASSES[key]
    steps = _SCALE_DEGREES[mode]
    names = []
    for deg in (0, 2, 4):
        # degree 0 = root, 2 = third, 4 = fifth (index into the scale)
        iv = steps[deg % len(steps)] + 12 * (deg // len(steps))
        names.append(_NAMES[(base + iv) % 12])
    return {"root": names[0], "third": names[1], "fifth": names[2]}


def _fill(body, key, mode):
    triad = _triad(key, mode)
    return (body
            .replace("{key^}", key.upper())
            .replace("{key}", key)
            .replace("{mode}", mode)
            .replace("{root}", triad["root"])
            .replace("{third}", triad["third"])
            .replace("{fifth}", triad["fifth"]))


def render_layers(layers):
    """Render an archetype's layers into one Strudel script (a stack)."""
    body = ",\n  ".join(layers)
    return f"stack(\n  {body}\n)"


# -- archetypes ------------------------------------------------------------

def _arch(*layers):
    """Archetype layers, as layer names from _LAYER_BODIES."""
    return list(layers)


_ARCHETYPES = {
    # electronic
    "techno":    _arch("kick", "hat", "acid", "noise_fx"),
    "house":     _arch("kick", "hat", "acid", "piano"),
    "ambient":   _arch("pad", "choir", "noise_fx"),
    "downtempo": _arch("kick", "hat", "piano", "noise_fx"),
    "synthwave": _arch("kick", "hat", "acid", "lead", "arp"),
    # classical
    "string_quartet": _arch("pad", "cello", "violin", "pizz"),
    "chamber":        _arch("cello", "piano", "violin"),
    "orchestral":     _arch("pad", "choir", "violin", "timpani", "flute"),
    "solo_piano":     _arch("piano", "harp"),
    "harp_choir":     _arch("choir", "harp", "flute"),
}

ARCHETYPE_NAMES = tuple(_ARCHETYPES)


def layers_for(archetype, key, mode):
    """Return {layer_name: pattern} for an archetype."""
    out = {}
    for name in _ARCHETYPES[archetype]:
        out[name] = _fill(_LAYER_BODIES[name], key, mode)
    return out


# Tempo ranges suit the archetype: electronic fast, classical slow.
_ARCHETYPE_BPM = {
    "techno": (126, 140),
    "house": (118, 128),
    "synthwave": (100, 118),
    "downtempo": (78, 96),
    "ambient": (60, 80),
    "string_quartet": (62, 84),
    "chamber": (66, 92),
    "orchestral": (58, 80),
    "solo_piano": (60, 90),
    "harp_choir": (64, 88),
}

# Modes that suit the archetype's mood.
_ARCHETYPE_MODES = {
    "techno": ["minor", "dorian"],
    "house": ["minor", "dorian", "mixolydian"],
    "synthwave": ["minor", "aeolian"],
    "downtempo": ["minor", "dorian", "mixolydian"],
    "ambient": ["minor", "dorian", "aeolian"],
    "string_quartet": ["minor", "major", "dorian"],
    "chamber": ["major", "minor", "dorian"],
    "orchestral": ["minor", "major", "aeolian"],
    "solo_piano": ["major", "minor", "dorian"],
    "harp_choir": ["major", "minor", "aeolian"],
}


def build(archetype, seed=None, bpm=None, key=None, mode=None):
    """Return ({layer: pattern}, info) for an archetype, rendered as a script."""
    rng = random.Random(seed if seed is not None else random.random())
    lo, hi = _ARCHETYPE_BPM[archetype]
    if bpm is None:
        bpm = rng.randint(lo, hi)
    if key is None:
        key = rng.choice(_KEYS)
    if mode is None:
        mode = rng.choice(_ARCHETYPE_MODES[archetype])
    layers = layers_for(archetype, key, mode)
    info = {"archetype": archetype, "seed": seed, "bpm": bpm,
            "key": key, "mode": mode, "layers": list(layers)}
    return layers, info


def random_archetype(seed=None):
    """Return ({layer: pattern}, info) for a random archetype."""
    rng = random.Random(seed)
    name = rng.choice(ARCHETYPE_NAMES)
    return build(name, seed=seed)


def archetype_name(seed=None):
    """Deterministically choose an archetype name for a seed."""
    return random.Random(seed).choice(ARCHETYPE_NAMES)


def all_archetypes():
    return {n: list(layers) for n, layers in _ARCHETYPES.items()}
