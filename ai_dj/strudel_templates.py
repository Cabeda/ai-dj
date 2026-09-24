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
    "kick":     's("RolandTR909_bd*4").gain(rand.range(0.7,0.9)).room(0.08)',
    "kick808":  's("RolandTR808_bd*4").gain(rand.range(0.7,0.9)).room(0.08)',
    "hat":      's("RolandTR909_hh*8").gain(rand.range(0.1,0.3)).pan(sine.range(0.3,0.7).slow(4)).room(0.15)',
    "shaker":   's("shaker_large*16").gain(rand.range(0.08,0.25)).room(0.1)',
    "noise_fx": 's("white").gain(0.03).lpf(perlin.range(600,2400).slow(8)).room(0.5)',
    "acid":     'n("0 0 3 5 0 7 5 3").scale("{key}:{mode}").s("sawtooth")'
                '.lpf(sine.range(300,1400).slow(4)).gain(rand.range(0.3,0.5)).room(0.2)',
    "lead":     'n("0 2 4 7").scale("{key}:{mode}").s("sawtooth")'
                '.lpf(sine.range(700,2200).slow(6)).gain(rand.range(0.2,0.35))'
                '.room(0.3).superimpose(x => x.gain(0.3).late(0.015).pan(0.3))',
    "arp":      'n("0 2 4 7 4 2").scale("{key}:{mode}").s("triangle")'
                '.gain(rand.range(0.18,0.28)).room(0.2).fast(2)',
    # classical
    "pad":      'note("[{root}3,{third}3,{fifth}3]").s("gm_string_ensemble_1")'
                '.attack(1.2).release(4).gain(rand.range(0.25,0.38)).room(0.55).slow(4)'
                '.superimpose(x => x.gain(0.35).late(0.012).pan(0.3))',
    "violin":   'n("0 2 4 7 4 2").scale("{key}:{mode}").s("gm_violin")'
                '.attack(0.15).release(1).gain(rand.range(0.25,0.35)).room(0.4)',
    "cello":    'n("0 2 4 2").scale("{key}:{mode}").s("gm_cello")'
                '.attack(0.3).release(1.5).gain(rand.range(0.3,0.4)).room(0.35).slow(2)',
    "pizz":     'note("[{root}2,{fifth}2]").s("gm_pizzicato_strings").gain(rand.range(0.25,0.35)).room(0.3)',
    "harp":     'n("0 4 2 5 3 7").scale("{key}:{mode}").s("harp")'
                '.gain(rand.range(0.35,0.5)).room(0.4).slow(2)',
    "piano":    'chord("<{key^}{q7} {key^}{q7} {key^}M7 {key^}{q7}>").voicing()'
                '.s("piano").gain(rand.range(0.22,0.35)).room(0.4).slow(4)',
    "flute":    'n("4 2 0 2 4 7").scale("{key}:{mode}").s("gm_flute")'
                '.attack(0.1).release(1.2).gain(rand.range(0.2,0.3)).room(0.4)',
    "timpani":  'note("{root}1").s("timpani").gain(rand.range(0.8,1.0)).room(0.5).slow(4)',
}


# Additional layer bodies used by the archetypes below.
_EXTRA = {
    "padrich":  'note("[{root}3,{third}3,{fifth}3,{root}4]").s("sawtooth")'
                '.attack(2).release(5).lpf(perlin.range(400,1600).slow(16))'
                '.gain(rand.range(0.14,0.22)).room(0.6).slow(8)'
                '.superimpose(x => x.gain(0.35).late(0.012).pan(0.3))',
    "sub":      'note("{root}1").s("sine").gain(rand.range(0.4,0.6)).slow(2)',
    "rhodes":   'chord("<{key^}{q9} {key^}{q9} {key^}{q7} {key^}{q9}>").voicing()'
                '.s("gm_clavinet").gain(rand.range(0.2,0.3)).room(0.4).slow(4)',
    "vibes":    'n("0 4 2 5 7 4").scale("{key}:{mode}").s("vibraphone")'
                '.gain(rand.range(0.28,0.4)).room(0.35).slow(2)',
    "marimba":  'n("0 2 4 7").scale("{key}:{mode}").s("marimba")'
                '.gain(rand.range(0.4,0.6)).room(0.3).slow(2)',
    "vinyl":    's("white*16").gain(rand.range(0.01,0.03)).hpf(2000)',
    "strings":  'note("[{root}3,{third}3,{fifth}3]").s("gm_string_ensemble_1")'
                '.attack(2).release(6).gain(rand.range(0.18,0.28)).room(0.55).slow(8)'
                '.superimpose(x => x.gain(0.35).late(0.012).pan(0.3))',
    "strings_trem": 'note("[{root}3,{third}3,{fifth}3]").s("gm_tremolo_strings")'
                '.attack(1.5).release(5).gain(rand.range(0.16,0.24)).room(0.55).slow(8)',
    "flute":    'n("4 2 0 2 4 7").scale("{key}:{mode}").s("gm_flute")'
                '.attack(0.1).release(1.2).gain(rand.range(0.2,0.3)).room(0.4)',
    "folkharp": 'n("0 4 2 5 3 7").scale("{key}:{mode}").s("folkharp")'
                '.gain(rand.range(0.3,0.45)).room(0.4).slow(2)',
    "sax":      'n("4 2 0 2").scale("{key}:{mode}").s("sax").gain(0.3)',
    # a whole break, stretched to the cycle: it already carries kick, snare and
    # hats, so it is the rhythm on its own — do not stack a drum kit on it
    "break":    's("amen").fit().gain(rand.range(0.55,0.75)).room(0.15)'
                '.lpf(perlin.range(2500,5500).slow(16))',
}
_LAYER_BODIES.update(_EXTRA)

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


# Seventh-chord quality per mode: major modes get major sevenths, minor modes
# get minor sevenths. Without this a "major" archetype sounds minor and clashes
# with its own scale layers.
_MAJOR_MODES = {"major", "mixolydian", "lydian"}


def _fill(body, key, mode):
    triad = _triad(key, mode)
    q7 = "M7" if mode in _MAJOR_MODES else "m7"
    q9 = "M9" if mode in _MAJOR_MODES else "m9"
    return (body
            .replace("{q7}", q7)
            .replace("{q9}", q9)
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
    "techno":    _arch("kick808", "hat", "acid", "vinyl"),
    "house":     _arch("kick", "hat", "acid", "rhodes"),
    "downtempo": _arch("break", "rhodes", "sub", "vinyl"),
    "synthwave": _arch("kick808", "hat", "acid", "lead", "arp"),
    # focus / ambient: no drums or a very soft pulse, built for long listening
    "ambient":   _arch("padrich", "strings", "vibes", "vinyl"),
    "deep_focus": _arch("padrich", "sub", "vibes", "vinyl"),
    "drone":     _arch("padrich", "strings", "sub", "vinyl"),
    "lofi_study": _arch("kick808", "shaker", "rhodes", "vinyl"),
    "piano_study": _arch("piano", "sub", "vinyl"),
    "vibes_room": _arch("vibes", "sub", "piano", "vinyl"),
    # classical
    "string_quartet": _arch("strings", "cello", "violin", "pizz"),
    "chamber":        _arch("cello", "piano", "violin"),
    "orchestral":     _arch("strings", "strings_trem", "violin", "timpani", "flute"),
    "solo_piano":     _arch("piano", "harp"),
    "harp_strings":   _arch("harp", "strings", "flute"),
    "marimba_room":   _arch("marimba", "sub", "vibes", "vinyl"),
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
    "deep_focus": (58, 74),
    "drone": (54, 68),
    "lofi_study": (70, 86),
    "piano_study": (58, 76),
    "vibes_room": (60, 78),
    "marimba_room": (66, 84),
    "string_quartet": (62, 84),
    "chamber": (66, 92),
    "orchestral": (58, 80),
    "solo_piano": (60, 90),
    "harp_strings": (64, 88),
}

# Modes that suit the archetype's mood.
_ARCHETYPE_MODES = {
    "techno": ["minor", "dorian"],
    "house": ["minor", "dorian", "mixolydian"],
    "synthwave": ["minor", "aeolian"],
    "downtempo": ["minor", "dorian", "mixolydian"],
    "ambient": ["minor", "dorian", "aeolian"],
    "deep_focus": ["minor", "dorian", "aeolian"],
    "drone": ["minor", "aeolian", "dorian"],
    "lofi_study": ["minor", "dorian", "major"],
    "piano_study": ["major", "minor", "dorian"],
    "vibes_room": ["major", "minor", "dorian"],
    "marimba_room": ["major", "dorian", "minor"],
    "string_quartet": ["minor", "major", "dorian"],
    "chamber": ["major", "minor", "dorian"],
    "orchestral": ["minor", "major", "aeolian"],
    "solo_piano": ["major", "minor", "dorian"],
    "harp_strings": ["major", "minor", "aeolian"],
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
