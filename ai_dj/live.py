"""The ai-dj live loop.

Boots Sonic Pi headless, plays a random starter instantly, then every 10s
captures the audio that's playing, sends it (plus the current script and any
user feedback) to the LLM, and live-codes the evolved script back into Sonic Pi.

Context is bounded per call — system prompt (cached) + current script + audio +
feedback — with no chat history, so a session can run for hours without the
input growing. Decisions only fire when the previous one finished and the audio
signature changed enough (adaptive cadence).

State lives in memory; the only persistence is the versioned script files in
the session dir.
"""

import math
import os
import struct
import sys
import threading
import time

from . import llm, session, sonicpi
from .templates import random_starter

CAPTURE_SECONDS = 10
TICK_SECONDS = 10
MIN_LLM_GAP = 20
SIGNATURE_CHANGE = 3.0


class Feedback:
    """Collects user feedback typed on stdin; drained once per iteration."""

    def __init__(self, enabled=True):
        self._lock = threading.Lock()
        self._items = []
        self._thread = None
        if enabled and sys.stdin and sys.stdin.isatty():
            self._thread = threading.Thread(target=self._read_loop, daemon=True)
            self._thread.start()

    def _read_loop(self):
        for line in sys.stdin:
            line = line.strip()
            if line:
                with self._lock:
                    self._items.append(line)

    def drain(self):
        with self._lock:
            items, self._items = self._items, []
        return "; ".join(items)


def _signature(path):
    """Cheap audio fingerprint: RMS chunks."""
    with open(path, "rb") as f:
        data = f.read()
    if len(data) < 44:
        return None
    if struct.unpack("<4s", data[8:12])[0] != b"WAVE":
        return None
    channels = struct.unpack("<H", data[22:24])[0]
    bits = struct.unpack("<H", data[34:36])[0]
    if bits not in (16, 24) or channels == 0:
        return None
    frame_bytes = channels * (bits // 8)
    pcm = data[44:]
    n = len(pcm) // frame_bytes
    sig = []
    step = max(1, n // 16)
    scale = 1.0 / (1 << (bits - 1))
    for i in range(0, n, step):
        chunk = pcm[i * frame_bytes:(i + 1) * frame_bytes]
        if not chunk:
            continue
        nf = len(chunk) // frame_bytes
        total = 0.0
        for j in range(nf):
            raw = chunk[j * frame_bytes:(j + 1) * frame_bytes]
            if bits == 16:
                s = struct.unpack("<h", raw[0:2])[0]
            else:
                s = struct.unpack("<i", raw[0:3] + b"\x00")[0] >> 8
            total += (s * scale) ** 2
        sig.append(round(math.sqrt(total / nf), 4))
    return sig


def _diff(a, b):
    if not a or not b or len(a) != len(b):
        return 99.0
    return sum(abs(x - y) for x, y in zip(a, b))


def _render(decided, model, feedback=None):
    h = decided.get("hearing", {})
    d = decided.get("decision", {})
    header = (
        "# ai-dj live - generated script\n"
        f"# model: {model}\n"
        f"# HEARD: {h.get('tempo_bpm', '?')} bpm, {h.get('key', '?')}, chords={h.get('chords', '?')}, "
        f"energy={h.get('energy', '?')}, mood={h.get('mood', '?')}\n"
        f"# DECIDED: {d.get('action', '?')} -> {d.get('change_to', '?')}\n"
        f"# WHY: {d.get('why', '?')}\n"
        + (f"# FEEDBACK: {feedback}\n" if feedback else "")
        + "\n")
    return header + (decided.get("ruby") or "").strip()


def vibe_starter(prompt, key, model, provider="go", base_url=None,
                 reference=True, seed=None):
    """Generate an initial script for a vibe prompt. Falls back to a random
    starter so music always plays."""
    try:
        decided = llm.listen_and_decide_prompt(prompt, key, model=model,
                                               provider=provider, base_url=base_url,
                                               reference=reference)
        script = _render(decided, model)
        script = f"# ai-dj vibe starter (guide: {prompt})\n" + script.split("\n", 1)[-1]
        return script, {"seed": seed, "prompt": prompt, "model": model}
    except Exception as e:
        print(f"[vibe] LLM starter failed ({e}); falling back to random")
        return random_starter(seed=seed)


def run(key, model, env, new_seed=None, session_id=None, prompt=None,
        tick=10, dry=False, sonic=None, provider="go", base_url=None,
        reference=True, feedback_enabled=True):
    sp = sonic or sonicpi.SonicPi()
    cap = os.path.join("/tmp", f"ai_dj_cap_{os.getpid()}.wav")
    fb = Feedback(feedback_enabled)

    if session_id:
        ver, script = session.load_latest(session_id)
        sess_path = session_dir_of(session_id)
        print(f"[session] resumed {session_id} at {ver}")
    else:
        script, seed_info = random_starter(seed=new_seed)
        sess_path = session.create_session(seed_info)
        print(f"[session] new session: {os.path.basename(sess_path)}"
              + (f" | guide: {prompt}" if prompt else ""))
        session.save_script(sess_path, script)

    if dry:
        print("[dry] skipping Sonic Pi + audio")
        return sess_path

    sp.boot()
    sp.set_volume(1.0)
    sp.run_code(script)
    print("[play] random starter running (instant)")

    if prompt:
        print(f"[vibe] generating starter for '{prompt}'...")
        vibe_script, _ = vibe_starter(prompt, key, model, provider=provider,
                                      base_url=base_url, reference=reference,
                                      seed=new_seed)
        name = session.save_script(sess_path, vibe_script)
        sp.run_code(vibe_script)
        script = vibe_script
        print(f"[vibe] applied {name}")

    if feedback_enabled and sys.stdin and sys.stdin.isatty():
        print("[feedback] type feedback + Enter anytime (e.g. 'more bass'); "
              "it applies on the next update")

    prev_sig = None
    last_llm = 0.0
    ticks = 0
    try:
        while True:
            time.sleep(tick)
            ticks += 1
            capfile = sp.capture(cap, CAPTURE_SECONDS)
            if not capfile:
                print(f"[tick {ticks}] capture failed, skipping")
                continue
            sig = _signature(capfile)
            changed = _diff(prev_sig, sig) if prev_sig is not None else True
            prev_sig = sig

            feedback = fb.drain()
            since_llm = time.time() - last_llm
            if not feedback and (not changed or since_llm < MIN_LLM_GAP):
                print(f"[tick {ticks}] no significant change (diff={changed:.1f}, "
                      f"last_llm={since_llm:.0f}s ago) — keeping current script")
                continue

            print(f"[tick {ticks}] updating"
                  + (f" (feedback: {feedback})" if feedback else "")
                  + f"; sending sample to {model}...")
            try:
                decided = llm.listen_and_decide(
                    capfile, key, model=model,
                    session_id=os.path.basename(sess_path), prompt=prompt,
                    provider=provider, base_url=base_url,
                    current_script=script, feedback=feedback or None,
                    reference=reference)
                usage = decided.get("_usage", {})
                print(f"[llm] heard: {decided['hearing'].get('tempo_bpm')}bpm "
                      f"{decided['hearing'].get('key')} {decided['hearing'].get('mood')} | "
                      f"tokens_in={usage.get('prompt_tokens')} "
                      f"audio={usage.get('prompt_tokens_details', {}).get('audio_tokens')}")
            except Exception as e:
                print(f"[llm] ERROR: {e} — keeping current script")
                continue

            new_script = _render(decided, model, feedback or None)
            name = session.save_script(sess_path, new_script)
            print(f"[live-code] applied {name}: {decided['decision'].get('action', '')[:80]}")
            sp.run_code(new_script)
            script = new_script
            last_llm = time.time()
    except KeyboardInterrupt:
        print("\n[bye] stopping")
    finally:
        sp.shutdown()


def session_dir_of(session_id):
    return os.path.join(session.BASE, session_id)
