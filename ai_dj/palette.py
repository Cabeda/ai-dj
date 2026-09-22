"""Instrument palette.

The model may only choose instruments from this palette. Each instrument names
its realisation per backend, and a backend advertises only the instruments it
can actually play — so classical voices (General MIDI soundfonts) are first
class on Strudel and simply absent on Sonic Pi.

Canonical names are what the model sees; the per-backend ids are what the
generated code uses.
"""

from dataclasses import dataclass
from typing import Mapping

SONIC_PI = "sonic_pi"
STRUDEL = "strudel"

# Families group instruments for the model and for building archetypes.
FAMILIES = (
    "drums", "bass", "keys", "synth", "strings",
    "brass", "woodwind", "voice", "fx",
)


@dataclass(frozen=True)
class Instrument:
    name: str
    family: str
    realisations: Mapping[str, str]


def _i(name, family, **realisations):
    return Instrument(name, family, dict(realisations))


PALETTE = (
    # -- drums --------------------------------------------------------------
    _i("kick", "drums", sonic_pi=":bd_haus", strudel="bd"),
    _i("snare", "drums", sonic_pi=":drum_snare_hard", strudel="sd"),
    _i("hat", "drums", sonic_pi=":drum_cymbal_open", strudel="hh"),
    _i("perc", "drums", sonic_pi=":drum_tom_mid_soft", strudel="perc"),
    # -- bass ---------------------------------------------------------------
    _i("acid_bass", "bass", sonic_pi=":tb303", strudel="sawtooth"),
    _i("sub_bass", "bass", sonic_pi=":sine", strudel="sine"),
    # -- synth --------------------------------------------------------------
    _i("pad", "synth", sonic_pi=":hollow", strudel="supersaw"),
    _i("lead", "synth", sonic_pi=":prophet", strudel="sawtooth"),
    _i("arp", "synth", sonic_pi=":beep", strudel="triangle"),
    _i("drone", "synth", sonic_pi=":saw", strudel="sawtooth"),
    # -- keys (sampled) -----------------------------------------------------
    _i("piano", "keys", strudel="gm_piano"),
    _i("electric_piano", "keys", strudel="gm_electric_piano_1"),
    _i("harpsichord", "keys", strudel="gm_harpsichord"),
    _i("organ", "keys", strudel="gm_church_organ"),
    # -- strings (sampled) --------------------------------------------------
    _i("violin", "strings", strudel="gm_violin"),
    _i("viola", "strings", strudel="gm_viola"),
    _i("cello", "strings", strudel="gm_cello"),
    _i("contrabass", "strings", strudel="gm_contrabass"),
    _i("string_ensemble", "strings", strudel="gm_string_ensemble_1"),
    _i("tremolo_strings", "strings", strudel="gm_tremolo_strings"),
    _i("pizzicato_strings", "strings", strudel="gm_pizzicato_strings"),
    _i("harp", "strings", strudel="gm_orchestral_harp"),
    _i("timpani", "strings", strudel="gm_timpani"),
    # -- brass (sampled) ----------------------------------------------------
    _i("trumpet", "brass", strudel="gm_trumpet"),
    _i("trombone", "brass", strudel="gm_trombone"),
    _i("french_horn", "brass", strudel="gm_french_horn"),
    _i("tuba", "brass", strudel="gm_tuba"),
    _i("brass_section", "brass", strudel="gm_brass_section"),
    # -- woodwind (sampled) -------------------------------------------------
    _i("flute", "woodwind", strudel="gm_flute"),
    _i("piccolo", "woodwind", strudel="gm_piccolo"),
    _i("oboe", "woodwind", strudel="gm_oboe"),
    _i("english_horn", "woodwind", strudel="gm_english_horn"),
    _i("clarinet", "woodwind", strudel="gm_clarinet"),
    _i("bassoon", "woodwind", strudel="gm_bassoon"),
    # -- voice (sampled) ----------------------------------------------------
    _i("choir", "voice", strudel="gm_choir_aahs"),
    _i("voice_oohs", "voice", strudel="gm_voice_oohs"),
    # -- fx -----------------------------------------------------------------
    _i("noise", "fx", sonic_pi=":noise", strudel="white"),
)

_BY_NAME = {ins.name: ins for ins in PALETTE}


def all_instruments():
    return PALETTE


def families():
    return FAMILIES


def for_backend(backend):
    """Instruments the given backend can actually play."""
    return tuple(ins for ins in PALETTE if backend in ins.realisations)


def is_supported(name, backend):
    ins = _BY_NAME.get(name)
    return bool(ins and backend in ins.realisations)


def resolve(name):
    """Return the Instrument for a canonical name, or raise KeyError."""
    return _BY_NAME[name]


def realisation(name, backend):
    """Return the backend-specific id for an instrument, or raise KeyError."""
    return _BY_NAME[name].realisations[backend]


def names(backend=None):
    if backend is None:
        return tuple(ins.name for ins in PALETTE)
    return tuple(ins.name for ins in for_backend(backend))


def describe(backend):
    """A compact, model-facing list of what the backend can play."""
    lines = []
    for fam in FAMILIES:
        items = [i.name for i in for_backend(backend) if i.family == fam]
        if items:
            lines.append(f"{fam}: {', '.join(items)}")
    return "\n".join(lines)
