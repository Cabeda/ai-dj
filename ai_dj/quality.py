"""Audio quality metrics — how "MIDI-like" a render sounds.

General MIDI playback is recognisable by four things: sharp attacks, no room,
flat dynamics, and a centred image. Each metric here targets one of those and
is normalised to 0..1, where 1 is *natural* and 0 is *sequencer*.

`euphony()` combines them. Use it in tests to keep the archetypes from
regressing into thin, quantised mush.
"""

import math
import struct

from .similarity import detect_onsets


def _frames(samples, rate, window_s=0.02):
    window = max(1, int(rate * window_s))
    for i in range(0, len(samples) - window + 1, window):
        yield i, samples[i : i + window]


def _rms(frame):
    return math.sqrt(sum(v * v for v in frame) / len(frame))


def read_stereo(path):
    """Return ((left, right), sample_rate). Mono is duplicated."""
    with open(path, "rb") as f:
        data = f.read()
    if len(data) < 44 or data[:4] != b"RIFF":
        return ((), ()), 0
    channels = struct.unpack("<H", data[22:24])[0]
    bits = struct.unpack("<H", data[34:36])[0]
    rate = struct.unpack("<I", data[24:28])[0]
    if bits != 16 or channels == 0:
        return ((), ()), rate
    n = (len(data) - 44) // 2
    raw = struct.unpack("<%dh" % n, data[44 : 44 + n * 2])
    if channels == 1:
        left = list(raw)
        return (left, list(left)), rate
    left = list(raw[::channels])
    right = list(raw[1::channels])
    return (left, right), rate


def mono(path):
    (left, _), rate = read_stereo(path)
    return left, rate


def attack_softness(samples, rate):
    """Mean rise time of onsets (10% -> 90% of the onset peak), 0..1.

    Sharp MIDI-style hits score near 0; bowed/voiced/sampled instruments with a
    real attack shape score near 1.
    """
    frames = list(_frames(samples, rate))
    if not frames:
        return 0.0
    env = [_rms(f) for _, f in frames]
    onsets = detect_onsets(samples, rate)
    if not onsets:
        return 0.0
    window_s = 0.02
    rises = []
    for start in onsets:
        peak = env[start] if start < len(env) else 0
        if peak <= 0:
            continue
        lo = hi = None
        for i in range(start, max(start - 15, -1), -1):
            if env[i] < peak * 0.1:
                lo = i
                break
        for i in range(start, min(start + 8, len(env))):
            if env[i] >= peak * 0.9:
                hi = i
                break
        if lo is not None and hi is not None and hi > lo:
            rises.append((hi - lo) * window_s)
    if not rises:
        return 0.5  # neutral: not enough onsets to judge
    mean_rise = sum(rises) / len(rises)
    return min(1.0, mean_rise / 0.05)  # 50ms+ attack is fully soft


def decay_tail(samples, rate):
    """How long the sound lingers after its loudest point, 0..1.

    A dry hit dies instantly; a room or a long release keeps energy alive.
    """
    frames = list(_frames(samples, rate))
    if not frames:
        return 0.0
    env = [_rms(f) for _, f in frames]
    peak = max(env)
    if peak <= 0:
        return 0.0
    peak_i = env.index(peak)
    floor = peak * 0.05
    tail = 0
    for i in range(peak_i, len(env)):
        if env[i] < floor:
            break
        tail += 1
    return min(1.0, (tail * 0.02) / 3.0)  # 3s of tail is fully open


def onset_level_variation(samples, rate):
    """Coefficient of variation of onset peak levels, 0..1.

    Every note at the same velocity (a sequencer) scores near 0; expressive
    accents and ghosts score higher.
    """
    frames = list(_frames(samples, rate))
    if not frames:
        return 0.0
    env = [_rms(f) for _, f in frames]
    onsets = detect_onsets(samples, rate)
    peaks = [env[i] for i in onsets if i < len(env)]
    if len(peaks) < 2:
        # sparse music (pads, drones): fall back to frame-level variation
        peaks = env
    if len(peaks) < 2:
        return 0.5  # neutral: too short to judge
    mean = sum(peaks) / len(peaks)
    if mean <= 0:
        return 0.0
    var = sum((e - mean) ** 2 for e in peaks) / len(peaks)
    cv = math.sqrt(var) / mean
    return min(1.0, cv / 0.5)  # a spread of 50% is fully expressive


def stereo_width(path):
    """1 - |correlation| between channels. Mono scores 0."""
    (left, right), rate = read_stereo(path)
    if not left or len(left) != len(right):
        return 0.0
    n = len(left)
    ml = sum(left) / n
    mr = sum(right) / n
    num = sum((a - ml) * (b - mr) for a, b in zip(left, right))
    dl = sum((a - ml) ** 2 for a in left)
    dr = sum((b - mr) ** 2 for b in right)
    if dl <= 0 or dr <= 0:
        return 0.0
    corr = abs(num / math.sqrt(dl * dr))
    return max(0.0, min(1.0, 1.0 - corr))


def breakdown(path):
    """Per-metric quality scores, for diagnosing a render."""
    samples, rate = mono(path)
    if not samples or not rate:
        return {"attack": 0.0, "decay": 0.0, "dynamics": 0.0, "width": 0.0}
    return {
        "attack": attack_softness(samples, rate),
        "decay": decay_tail(samples, rate),
        "dynamics": onset_level_variation(samples, rate),
        "width": stereo_width(path),
    }


def euphony(path):
    """0..1 composite quality. 0 is sequencer-MIDI, 1 is spacious and human."""
    scores = breakdown(path)
    return round(
        0.3 * scores["attack"]
        + 0.3 * scores["decay"]
        + 0.25 * scores["dynamics"]
        + 0.15 * scores["width"],
        4,
    )
