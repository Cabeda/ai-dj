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
    # Real drum-machine kits (tidal-drum-machines) beat one-shot samples.
    _i("kick", "drums", sonic_pi=":bd_haus", strudel="RolandTR909_bd"),
    _i("kick_909", "drums", strudel="RolandTR909_bd"),
    _i("kick_808", "drums", strudel="RolandTR808_bd"),
    _i("snare", "drums", sonic_pi=":drum_snare_hard", strudel="RolandTR909_sd"),
    _i("hat", "drums", sonic_pi=":drum_cymbal_open", strudel="RolandTR909_hh"),
    _i("hat_open", "drums", strudel="RolandTR909_oh"),
    _i("rim", "drums", strudel="RolandTR909_rim"),
    _i("clap", "drums", strudel="RolandTR909_cp"),
    _i("crash", "drums", strudel="RolandTR909_cr"),
    _i("ride", "drums", strudel="RolandTR909_rd"),
    _i("tom_low", "drums", strudel="RolandTR909_lt"),
    _i("perc", "drums", sonic_pi=":drum_tom_mid_soft", strudel="RolandTR808_cb"),
    _i("cowbell", "drums", strudel="cowbell"),
    _i("tambourine", "drums", strudel="tambourine"),
    _i("woodblock", "drums", strudel="woodblock"),
    _i("triangle", "drums", strudel="triangle"),
    _i("shaker", "drums", strudel="shaker_large"),
    # -- bass ---------------------------------------------------------------
    _i("acid_bass", "bass", sonic_pi=":tb303", strudel="sawtooth"),
    _i("sub_bass", "bass", sonic_pi=":sine", strudel="sine"),
    _i("picked_bass", "bass", strudel="gm_acoustic_bass"),
    # -- synth --------------------------------------------------------------
    _i("pad", "synth", sonic_pi=":hollow", strudel="sawtooth"),
    _i("lead", "synth", sonic_pi=":prophet", strudel="sawtooth"),
    _i("arp", "synth", sonic_pi=":beep", strudel="triangle"),
    _i("drone", "synth", sonic_pi=":saw", strudel="saw"),
    # -- keys (sampled) -----------------------------------------------------
    _i("piano", "keys", strudel="piano"),
    _i("grand_piano", "keys", strudel="steinway"),
    _i("upright_piano", "keys", strudel="kawai"),
    _i("electric_piano", "keys", strudel="gm_clavinet"),
    _i("celesta", "keys", strudel="gm_celesta"),
    _i("harpsichord", "keys", strudel="gm_harpsichord"),
    _i("organ", "keys", strudel="pipeorgan_loud"),
    # -- strings (sampled: VCSL, CC0) ---------------------------------------
    _i("violin", "strings", strudel="gm_violin"),
    _i("viola", "strings", strudel="gm_viola"),
    _i("cello", "strings", strudel="gm_cello"),
    _i("contrabass", "strings", strudel="gm_contrabass"),
    _i("string_ensemble", "strings", strudel="gm_string_ensemble_1"),
    _i("tremolo_strings", "strings", strudel="gm_tremolo_strings"),
    _i("pizzicato_strings", "strings", strudel="gm_pizzicato_strings"),
    _i("harp", "strings", strudel="harp"),
    _i("folkharp", "strings", strudel="folkharp"),
    _i("timpani", "strings", strudel="timpani"),
    _i("nyckelharpa", "strings", strudel="dantranh"),
    # -- brass (sampled) ----------------------------------------------------
    _i("trumpet", "brass", strudel="gm_trumpet"),
    _i("trombone", "brass", strudel="gm_trombone"),
    _i("french_horn", "brass", strudel="gm_french_horn"),
    _i("tuba", "brass", strudel="gm_tuba"),
    _i("brass_section", "brass", strudel="gm_brass_section"),
    _i("sax", "brass", strudel="sax"),
    # -- woodwind (sampled) -------------------------------------------------
    _i("flute", "woodwind", strudel="gm_flute"),
    _i("piccolo", "woodwind", strudel="gm_piccolo"),
    _i("oboe", "woodwind", strudel="gm_oboe"),
    _i("english_horn", "woodwind", strudel="gm_english_horn"),
    _i("clarinet", "woodwind", strudel="gm_clarinet"),
    _i("bassoon", "woodwind", strudel="gm_bassoon"),
    _i("recorder", "woodwind", strudel="gm_clarinet"),
    _i("ocarina", "woodwind", strudel="ocarina"),
    # -- voice (sampled) ----------------------------------------------------
    _i("choir", "voice", strudel="gm_choir_aahs"),
    _i("voice_oohs", "voice", strudel="gm_voice_oohs"),
    # -- plucked / mallets (sampled: VCSL) ----------------------------------
    _i("marimba", "keys", strudel="marimba"),
    _i("vibraphone", "keys", strudel="vibraphone"),
    _i("kalimba", "keys", strudel="kalimba"),
    _i("glockenspiel", "keys", strudel="glockenspiel"),
    _i("tubular_bells", "keys", strudel="tubularbells"),
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


def as_markdown():
    """Markdown table of every instrument and its Strudel id.

    Appended to the LLM reference so the model always sees the current palette,
    not a hand-copied snapshot that drifts.
    """
    lines = ["| Canonical | Family | Strudel id |", "| --- | --- | --- |"]
    for ins in PALETTE:
        sid = ins.realisations.get(STRUDEL, "—")
        lines.append(f"| {ins.name} | {ins.family} | `{sid}` |")
    return "\n".join(lines)


def describe(backend):
    """A compact, model-facing list of what the backend can play."""
    lines = []
    for fam in FAMILIES:
        items = [i.name for i in for_backend(backend) if i.family == fam]
        if items:
            lines.append(f"{fam}: {', '.join(items)}")
    return "\n".join(lines)
