"""Musical similarity scoring for integration tests.

We cannot ship recordings of famous music (the scores are public domain, their
performances are not), so references are **symbolic**: a compact note list per
piece. Tests analyze a Strudel pattern's actual notes (exact, deterministic)
and score how close it is to the reference.

Features are deliberately coarse and robust:
  - pitch-class histogram (chroma): what notes are used
  - interval histogram: melodic character (steps vs leaps)
  - length ratio: how much music there is

Scoring is cosine similarity per feature, combined into 0..1. This catches
"the wrong notes / the wrong shape", which is what an integration test should
fail on. It is not a transcription checker.
"""

import math
import struct

# Reference pieces: symbolic note lists (MIDI numbers), hand-encoded from the
# score. Public domain works, so only the notes are stored.
REFERENCE_PIECES = {
    # Bach, Prelude in C major, BWV 846 — the opening broken-chord figure,
    # one chord per cycle.
    "bach_prelude_c": {
        "composer": "J.S. Bach",
        "work": "Prelude in C, BWV 846",
        "notes": [
            48, 52, 55, 60, 64, 67, 60, 64,  # C  E  G  C  E  G  C  E
            47, 50, 55, 59, 62, 67, 59, 62,  # B  D  G  B  D  G  B  D
            45, 48, 52, 57, 60, 64, 60, 64,  # A  C  E  A  C  E  C  E
            43, 47, 50, 55, 59, 62, 59, 62,  # G  B  D  G  B  D  B  D
        ],
    },
    # Mozart, Eine kleine Nachtmusik, K.525 (I) — the opening theme.
    "mozart_nachtmusik": {
        "composer": "W.A. Mozart",
        "work": "Eine kleine Nachtmusik, K.525 (I)",
        "notes": [
            67, 67, 67, 62, 67, 71, 67, 62,  # G  G  G  D  G  B  G  D
            67, 67, 67, 62, 67, 71, 67, 62,
            67, 67, 67, 62, 67, 71, 67, 62,
            72, 72, 72, 67, 72, 76, 72, 67,  # C  C  C  G  C  E  C  G
        ],
    },
}

# Style targets for the electronic archetypes. There is no canonical score, so
# these describe the style (register, harmony, shape) rather than a specific
# track. Treated the same way as the pieces above.
STYLE_REFERENCES = {
    "lofi_study": {
        "notes": [
            62, 65, 69, 72, 69, 65, 62, 65,  # Dm9 upper structure
            62, 65, 69, 72, 69, 65, 62, 65,
            60, 64, 67, 71, 67, 64, 60, 64,  # Cmaj7
            58, 62, 65, 69, 65, 62, 58, 62,  # Bb
        ],
    },
    "synthwave": {
        "notes": [
            57, 60, 64, 69, 57, 60, 64, 69,  # A minor arpeggio
            53, 57, 60, 65, 53, 57, 60, 65,  # F
            55, 59, 62, 67, 55, 59, 62, 67,  # G
            52, 55, 59, 64, 52, 55, 59, 64,  # E
        ],
    },
}


def pitch_classes(notes):
    return [n % 12 for n in notes]


def chroma_histogram(notes):
    """12-bin pitch-class distribution, normalised."""
    hist = [0.0] * 12
    for n in notes:
        hist[n % 12] += 1.0
    total = sum(hist)
    return [h / total for h in hist] if total else hist


def interval_histogram(notes):
    """Distribution of melodic intervals. Bin 0 is a repeat, bins 1-11 are
    interval classes, bin 12 an octave or wider."""
    hist = [0.0] * 13
    for a, b in zip(notes, notes[1:]):
        step = abs(b - a)
        hist[step if step <= 12 else 12] += 1.0
    total = sum(hist)
    return [h / total for h in hist] if total else hist


def cosine(a, b):
    if len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return max(0.0, min(1.0, dot / (na * nb)))


def similarity(a_notes, b_notes):
    """0..1 similarity between two note lists."""
    if not a_notes or not b_notes:
        return 0.0
    chroma = cosine(chroma_histogram(a_notes), chroma_histogram(b_notes))
    interval = cosine(interval_histogram(a_notes), interval_histogram(b_notes))
    la, lb = len(a_notes), len(b_notes)
    length = min(la, lb) / max(la, lb) if max(la, lb) else 0.0
    return round(0.5 * chroma + 0.3 * interval + 0.2 * length, 4)


# -- audio side -------------------------------------------------------------

def read_wav_mono(path):
    """Return (samples, sample_rate) for a 16-bit PCM WAV."""
    with open(path, "rb") as f:
        data = f.read()
    if len(data) < 44 or data[:4] != b"RIFF":
        return [], 0
    channels = struct.unpack("<H", data[22:24])[0]
    bits = struct.unpack("<H", data[34:36])[0]
    rate = struct.unpack("<I", data[24:28])[0]
    if bits != 16 or channels == 0:
        return [], rate
    pcm = data[44:]
    n = len(pcm) // 2
    raw = struct.unpack("<%dh" % n, pcm[: n * 2])
    if channels > 1:
        raw = raw[::channels]
    return list(raw), rate


def detect_onsets(samples, rate, threshold_ratio=0.35, min_gap_ms=60):
    """Cheap onset detection: envelope peaks over 10ms frames.

    Enough to compare rhythmic density, which is all the audio scorer needs.
    """
    if not samples:
        return []
    window = max(1, int(rate * 0.01))
    envelope = []
    for i in range(0, len(samples) - window, window):
        frame = samples[i : i + window]
        envelope.append(sum(abs(v) for v in frame) / len(frame))
    if not envelope:
        return []
    peak = max(envelope)
    if peak == 0:
        return []
    threshold = peak * threshold_ratio
    min_gap = max(1, int(min_gap_ms / 10))
    onsets = []
    last = -min_gap
    for i, value in enumerate(envelope):
        if value >= threshold and (i - last) >= min_gap:
            if i == 0 or envelope[i] >= envelope[i - 1]:
                onsets.append(i)
                last = i
    return onsets


def onset_density(samples, rate):
    """Onsets per second."""
    if not samples or not rate:
        return 0.0
    onsets = detect_onsets(samples, rate)
    return round(len(onsets) / (len(samples) / rate), 2)
