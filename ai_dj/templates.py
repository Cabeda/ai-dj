"""Random starter templates.

Each template is a Sonic Pi Ruby function body that fills one slot with a
musical idea. The starter generator picks a random template set, random
musical params, and renders a full standalone script. All templates are
hand-written and valid Ruby, so playback starts instantly and safely.

Every generated script stores its seed + params in a comment header so a
session can be resumed or diagnosed.
"""

import random

_BPM_RANGE = (60, 140)
_KEYS = ["c", "d", "e", "f", "g", "a", "b"]
_SCALES = ["minor", "major", "dorian", "phrygian", "mixolydian", "aeolian", "harmonic_minor"]
_SYNTHS = ["saw", "beep", "fm", "tb303", "pretty_bell", "hollow", "prophet", "zawa"]


def _rand_key():
    return random.choice(_KEYS)


def _rand_scale():
    return random.choice(_SCALES)


def _rand_bpm():
    return random.randint(*_BPM_RANGE)


def _rand_synth():
    return random.choice(_SYNTHS)


def _scale_notes(root, scale, octaves=2):
    intervals = {
        "minor": [0, 2, 3, 5, 7, 8, 10],
        "major": [0, 2, 4, 5, 7, 9, 11],
        "dorian": [0, 2, 3, 5, 7, 9, 10],
        "phrygian": [0, 1, 3, 5, 7, 8, 10],
        "mixolydian": [0, 2, 4, 5, 7, 9, 10],
        "aeolian": [0, 2, 3, 5, 7, 8, 10],
        "harmonic_minor": [0, 2, 3, 5, 7, 8, 11],
    }[scale]
    base = {"c": 0, "d": 2, "e": 4, "f": 5, "g": 7, "a": 9, "b": 11}[root]
    notes = []
    for oct in range(octaves):
        for iv in intervals:
            notes.append(base + iv + 12 * oct)
    return notes


def render_templates(templates, bpm, key, scale, synth, seed):
    lines = [f"use_bpm {bpm}"]
    for t in templates:
        body = _BODIES[t]
        lines.append(body.format(bpm=bpm, key=key, scale=scale, synth=synth,
                                 scale_notes=str(_scale_notes(key, scale)),
                                 seed=seed))
    return "\n\n".join(lines)


_BODIES = {
    "ambient_pad": """# ambient pad - sustained harmony bed
live_loop :pad do
  use_synth :hollow
  root = :{key}2
  sc = scale(root, :{scale})
  play_chord sc.take(3), amp: 0.35, release: 8, cutoff: 80
  sleep 8
end""",

    "techno_kick": """# techno kick - four on the floor pulse
live_loop :kick do
  sample :bd_haus, amp: 1.0
  sleep 1
end""",

    "acid_bass": """# acid bass - squelchy offbeat line
live_loop :acid do
  use_synth :tb303
  notes = {scale_notes}
  play notes.choose, amp: 0.8, cutoff: rrand(60, 100), release: 0.2
  sleep 0.5
end""",

    "bells": """# bells - sparse melodic sparkle
live_loop :bells do
  use_synth :pretty_bell
  notes = scale(:{key}3, :{scale})
  play notes.choose, amp: 0.3, release: 2, cutoff: 90
  sleep rrand(0.5, 2.0)
end""",

    "hats": """# hats - shimmering high end
live_loop :hats do
  sample :drum_cymbal_open, amp: 0.3, rate: rrand(0.8, 1.5)
  sleep 0.5
end""",

    "bass_pulse": """# bass pulse - sub anchor
live_loop :sub do
  use_synth :sine
  play :{key}1, amp: 0.7, release: 0.3
  sleep 1
end""",

    "arp": """# arp - running 16th notes
live_loop :arp do
  use_synth :beep
  notes = scale(:{key}4, :{scale})
  play notes.tick, amp: 0.25, release: 0.1
  sleep 0.25
end""",

    "drone": """# drone - long root sustain
live_loop :drone do
  use_synth :saw
  play :{key}2, amp: 0.3, release: 6, cutoff: 70
  sleep 6
end""",

    "noise_sweep": """# noise sweep - airy motion
live_loop :sweep do
  use_synth :noise
  play amp: 0.15, attack: 4, release: 4, cutoff: rrand(60, 110)
  sleep 8
end""",
}

TEMPLATE_NAMES = sorted(_BODIES)


def random_starter(seed=None):
    rng = random.Random(seed)
    bpm = _rand_bpm()
    key = _rand_key()
    scale = _rand_scale()
    synth = _rand_synth()
    n = rng.randint(2, 4)
    templates = rng.sample(TEMPLATE_NAMES, n)
    code = render_templates(templates, bpm, key, scale, synth, seed)
    header = (
        "# ai-dj random starter\n"
        f"# seed={seed} templates={','.join(templates)}\n"
        f"# bpm={bpm} key={key} scale={scale} synth={synth}\n"
        "\n")
    return header + code, {
        "seed": seed, "bpm": bpm, "key": key, "scale": scale,
        "synth": synth, "templates": templates,
    }