"""The ai-dj live loop (frugal).

Deterministic where possible, model only where necessary:

- Python owns tempo, key, mode, energy, the section arc, which layer to change,
  and a deterministic variation used between calls (see state.DJState).
- The model is called only at a section boundary, when the audio changed
  enough, or when the user gives feedback — and it returns ONE layer patch.
- Context per call is bounded: cached system + compact state + one layer +
  audio. No chat history, so a session can run for hours.

An optional `control` object (ai_dj.control.Control) exposes state, logs,
feedback and manual script edits to the TUI.
"""

import math
import os
import struct
import sys
import threading
import time

from . import llm, session, sonicpi
from .state import DJState, parse_layers
from .templates import random_layers

CAPTURE_SECONDS = 10
TICK_SECONDS = 10
MIN_LLM_GAP = 30
SIGNATURE_CHANGE = 3.0
VARIATION_EVERY = 30


def valid_ruby(code):
    """True if `ruby -c` accepts the script. Catches LLM syntax errors
    before they hit Sonic Pi's spider (which only reports them at runtime)."""
    import subprocess
    import tempfile

    if not code or not code.strip():
        return False
    path = None
    try:
        with tempfile.NamedTemporaryFile("w", suffix=".rb", delete=False) as f:
            f.write(code)
            path = f.name
        r = subprocess.run(["ruby", "-c", path], capture_output=True, text=True, timeout=10)
        return r.returncode == 0
    except Exception:
        return True  # no system ruby — don't block playback on a missing checker
    finally:
        if path:
            try:
                os.unlink(path)
            except OSError:
                pass


class Feedback:
    """Collects user feedback typed on stdin; drained once per iteration."""

    def __init__(self, enabled=True):
        self._lock = threading.Lock()
        self._items = []
        if enabled and sys.stdin and sys.stdin.isatty():
            threading.Thread(target=self._read_loop, daemon=True).start()

    def _read_loop(self):
        for line in sys.stdin:
            line = line.strip()
            if line:
                with self._lock:
                    self._items.append(line)
                    self._items = self._items[-100:]

    def drain(self):
        with self._lock:
            items, self._items = self._items, []
        return "; ".join(items)


def _signature(path):
    with open(path, "rb") as f:
        data = f.read()
    if len(data) < 44 or struct.unpack("<4s", data[8:12])[0] != b"WAVE":
        return None
    channels = struct.unpack("<H", data[22:24])[0]
    bits = struct.unpack("<H", data[34:36])[0]
    if bits not in (16, 24) or channels == 0:
        return None
    frame_bytes = channels * (bits // 8)
    pcm = data[44:]
    n = len(pcm) // frame_bytes
    step = max(1, n // 16)
    scale = 1.0 / (1 << (bits - 1))
    sig = []
    for i in range(0, n, step):
        chunk = pcm[i * frame_bytes:(i + 1) * frame_bytes]
        nf = len(chunk) // frame_bytes
        if not nf:
            continue
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


def run(key, model, env, new_seed=None, session_id=None, prompt=None,
        tick=TICK_SECONDS, dry=False, sonic=None, provider="go", base_url=None,
        reference=True, feedback_enabled=True, reasoning="none", control=None):
    sp = sonic or sonicpi.SonicPi()
    cap = os.path.join("/tmp", f"ai_dj_cap_{os.getpid()}.wav")
    fb = Feedback(feedback_enabled)

    def log(line):
        # TUI owns the terminal — never print there; stdout collides with OpenTUI.
        if control:
            control.log(line)
        else:
            print(line)

    def sync_state(script):
        if control:
            control.set_state(running=True, provider=provider, model=model,
                              bpm=state.bpm, key=state.key, mode=state.mode,
                              energy=round(state.energy, 2), section=state.section,
                              layers=list(state.layers), last_action=state.last_action,
                              script=script)

    if session_id:
        ver, script = session.load_latest(session_id)
        state = DJState.from_script(script, model=model)
        sess_path = os.path.join(session.BASE, session_id)
        log(f"[session] resumed {session_id} at {ver} "
            f"({len(state.layers)} layers, {state.bpm}bpm)")
    else:
        layers, info = random_layers(seed=new_seed)
        state = DJState(bpm=info["bpm"], key=info["key"], mode=info["scale"],
                        layers=layers, model=model)
        sess_path = session.create_session(info)
        log(f"[session] new session: {os.path.basename(sess_path)}"
            + (f" | guide: {prompt}" if prompt else ""))

    if dry:
        log("[dry] skipping Sonic Pi + audio")
        return sess_path

    # show the starter in the TUI immediately — boot can take ~15s
    script = state.render()
    session.save_script(sess_path, script)
    sync_state(script)

    sp.boot()
    sp.set_volume(1.0)
    sp.run_code(script)
    log("[play] starter running (instant)")
    sync_state(script)

    if prompt:
        log(f"[seed] generating first script for '{prompt}'...")
        try:
            decided = llm.seed_script(prompt, key, model=model, provider=provider,
                                      base_url=base_url, reference=reference,
                                      reasoning=reasoning)
            ruby = decided.get("ruby", "")
            if not valid_ruby(ruby):
                raise ValueError("seed script failed ruby -c")
            state.adopt_seed(ruby, decided.get("hearing"))
            script = state.render()
            if not valid_ruby(script):
                raise ValueError("rendered seed failed ruby -c")
            name = session.save_script(sess_path, script)
            sp.run_code(script)
            log(f"[seed] applied {name} ({len(state.layers)} layers, {state.bpm}bpm {state.key})")
            sync_state(script)
        except Exception as e:
            log(f"[seed] failed ({e}); keeping random starter")

    if feedback_enabled and sys.stdin and sys.stdin.isatty():
        log("[feedback] type feedback + Enter anytime (e.g. 'more bass')")

    prev_sig = None
    last_llm = 0.0
    last_var = time.time()
    ticks = 0
    try:
        while True:
            time.sleep(tick)
            ticks += 1

            # manual edit from the TUI takes precedence
            manual = control.drain_manual_script() if control else None
            if manual:
                if not valid_ruby(manual):
                    log("[manual] rejected edit (ruby -c failed)")
                else:
                    layers = parse_layers(manual)
                    if layers:
                        state.layers = layers
                        state.last_action = "manual edit"
                    script = state.render() if not layers else manual
                    session.save_script(sess_path, script)
                    sp.run_code(script)
                    log(f"[manual] applied user edit ({len(state.layers)} layers)")
                    sync_state(script)
                    prev_sig = None

            capfile = sp.capture(cap, CAPTURE_SECONDS)
            if not capfile:
                log(f"[tick {ticks}] capture failed, skipping")
                continue
            sig = _signature(capfile)
            changed = _diff(prev_sig, sig) if prev_sig is not None else 0.0
            prev_sig = sig

            feedback = fb.drain()
            if not feedback and control:
                feedback = control.drain_feedback()

            boundary = state.section_elapsed() >= state.section_seconds()
            if boundary:
                state.advance_section()
                log(f"[section] -> {state.section} (target energy {state.target_energy()})")
                sync_state(script)

            due = feedback or boundary or (
                changed > SIGNATURE_CHANGE and (time.time() - last_llm) >= MIN_LLM_GAP)

            if not due:
                if (time.time() - last_var) >= VARIATION_EVERY and state.variation():
                    last_var = time.time()
                    script = state.render()
                    sp.run_code(script)
                    log(f"[tick {ticks}] deterministic variation (no model call)")
                    sync_state(script)
                else:
                    log(f"[tick {ticks}] hold (diff={changed:.1f})")
                continue

            plan = state.plan_next()
            log(f"[tick {ticks}] {plan['direction']} layer '{plan['layer']}'"
                + (f" | feedback: {feedback}" if feedback else "")
                + f" | sending sample to {model}...")
            try:
                decided = llm.evolve_layer(
                    capfile, key, model=model,
                    session_id=os.path.basename(sess_path),
                    state_context=state.to_context(),
                    layer=plan["layer"], direction=plan["direction"],
                    layer_code=state.layers.get(plan["layer"]),
                    feedback=feedback or None,
                    provider=provider, base_url=base_url,
                    reference=reference, reasoning=reasoning)
            except Exception as e:
                log(f"[llm] ERROR: {e} — deterministic fallback")
                if state.variation():
                    script = state.render()
                    sp.run_code(script)
                    sync_state(script)
                continue

            # validate BEFORE mutating state — a bad patch must not
            # overwrite the last-good layers in state/render.
            ruby = (decided.get("ruby") or "").strip()
            kind = (decided.get("op") or {}).get("kind", "modify")
            if kind != "remove" and ruby and not valid_ruby(
                f"use_bpm {state.bpm}\n\n{ruby}"
            ):
                log(f"[llm] seed/evolve returned invalid Ruby; keeping previous script")
                last_llm = time.time()
                continue

            prev_layers = dict(state.layers)
            state.apply_op(decided)
            script = state.render()
            if not valid_ruby(script):
                state.layers = prev_layers
                script = state.render()
                log(f"[llm] rendered script invalid; rolled back")
                last_llm = time.time()
                continue
            name = session.save_script(sess_path, script)
            sp.run_code(script)
            last_llm = time.time()
            u = decided.get("_usage", {})
            log(f"[live-code] {name}: {decided.get('decision', {}).get('action', '')[:80]}")
            log(f"[cost] in={u.get('prompt_tokens')} "
                f"cached={u.get('prompt_tokens_details', {}).get('cached_tokens')} "
                f"out={u.get('completion_tokens')} "
                f"reasoning={u.get('completion_tokens_details', {}).get('reasoning_tokens')}")
            sync_state(script)
    except KeyboardInterrupt:
        log("\n[bye] stopping")
    finally:
        if control:
            control.set_state(running=False)
        sp.shutdown()
