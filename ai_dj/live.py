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
import shutil
import struct
import sys
import threading
import time

from . import llm, session
from .backend import BackendClosed, SonicPiBackend
from .state import DJState, parse_layers
from .templates import default_layers, random_layers
from .strudel_templates import build as strudel_build, archetype_name

CAPTURE_SECONDS = 10
TICK_SECONDS = 10
MIN_LLM_GAP = 30
SIGNATURE_CHANGE = 3.0
VARIATION_EVERY = 30


def valid_strudel(code):
    """Cheap structural gate for Strudel before it reaches the host. The host
    evaluates for real; this only catches obviously broken output."""
    if not code or not code.strip():
        return False
    s = code.strip()
    if s.count('"') % 2 != 0:
        return False
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    if stack:
        return False
    # reject leaked Sonic Pi code
    for bad in ("live_loop", "use_bpm", "with_fx"):
        if bad in s:
            return False
    return True


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
        tick=TICK_SECONDS, dry=False, backend=None, provider="go", base_url=None,
        reference=True, feedback_enabled=True, reasoning="none", control=None,
        record_dir=None):
    backend = backend or SonicPiBackend()
    lang = "strudel" if getattr(backend, "name", "") == "strudel" else "sonic_pi"
    valid = valid_strudel if lang == "strudel" else valid_ruby
    cap = os.path.join("/tmp", f"ai_dj_cap_{os.getpid()}.wav")
    fb = Feedback(feedback_enabled)
    # Pausing silences the set and freezes the loop — no capture, no model call
    # — until the user continues. A boxed flag so the closures below share it.
    paused = [False]

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
                              script=script, paused=paused[0])

    def play_live(code):
        """Play unless paused. Silence is the point of a pause, so the loop's
        play calls must not un-mute it."""
        if paused[0]:
            return True
        return backend.play(code)

    if session_id:
        ver, script = session.load_latest(session_id)
        state = DJState.from_script(script, model=model, lang=lang)
        sess_path = os.path.join(session.BASE, session_id)
        log(f"[session] resumed {session_id} at {ver} "
            f"({len(state.layers)} layers, {state.bpm}bpm)")
    elif lang == "strudel":
        archetype = archetype_name(new_seed)
        layers, info = strudel_build(archetype, seed=new_seed)
        state = DJState(bpm=info["bpm"], key=info["key"], mode=info["mode"],
                        layers=layers, model=model, lang=lang)
        sess_path = session.create_session(info)
        log(f"[session] new session: {os.path.basename(sess_path)}"
            f" | archetype: {archetype}"
            + (f" | guide: {prompt}" if prompt else ""))
    else:
        if new_seed is None:
            layers, info = default_layers()
        else:
            layers, info = random_layers(seed=new_seed)
        state = DJState(bpm=info["bpm"], key=info["key"], mode=info["scale"],
                        layers=layers, model=model, lang=lang)
        sess_path = session.create_session(info)
        log(f"[session] new session: {os.path.basename(sess_path)}"
            + (f" | guide: {prompt}" if prompt else ""))

    if record_dir == "auto":
        record_dir = os.path.join(sess_path, "audio")
    if record_dir:
        os.makedirs(record_dir, exist_ok=True)
        log(f"[record] saving captures to {record_dir}")

    if dry:
        log("[dry] skipping audio")
        return sess_path

    # show the starter in the TUI immediately — boot can take ~15s
    script = state.render()
    session.save_script(sess_path, script, lang=lang)
    sync_state(script)

    backend.boot()
    backend.set_volume(1.0)
    play_live(script)
    log("[play] starter running (instant)")
    sync_state(script)

    prev_sig = None
    apply_lock = threading.Lock()
    manual_rev = [0]

    def apply_manual(manual):
        nonlocal script, prev_sig
        if not valid(manual):
            state.last_action = f"manual edit rejected (invalid {lang})"
            log(f"[manual] rejected edit (invalid {lang})")
            sync_state(script)
            return
        with apply_lock:
            # Play first: if the engine rejects it, nothing has changed yet.
            # The old script stays current, and the reason reaches the status
            # line — a manual edit that silently does nothing is the worst
            # possible outcome.
            try:
                ok = play_live(manual)
                why = "the engine rejected the script"
            except BackendClosed:
                raise
            except Exception as e:
                ok, why = False, str(e)
            if not ok:
                state.last_action = f"manual edit failed: {why}"
                log(f"[manual] {why}")
                sync_state(script)
                return
            layers = parse_layers(manual)
            if layers:
                state.layers = layers
            state.last_action = "manual edit"
            script = manual
            session.save_script(sess_path, script, lang=lang)
            sync_state(script)
            prev_sig = None
            manual_rev[0] += 1
        log(f"[manual] applied user edit ({len(state.layers)} layers)")

    def run_command(cmd):
        if cmd in ("pause", "stop"):
            if not paused[0]:
                paused[0] = True
                backend.stop()
                state.last_action = "paused"
                log("[cmd] paused")
                sync_state(script)
        elif cmd == "resume":
            if paused[0]:
                paused[0] = False
                with apply_lock:
                    play_live(script)
                state.last_action = "resumed"
                log("[cmd] resumed")
                sync_state(script)

    wake = threading.Event()

    def watcher():
        # TUI edits must not wait for capture/LLM work in the main loop
        while True:
            try:
                manual = control.drain_manual_script()
                if manual:
                    apply_manual(manual)
                for cmd in control.drain_commands():
                    run_command(cmd)
                if control.has_feedback():
                    wake.set()
            except BackendClosed:
                return  # we are leaving
            except Exception as e:
                # never let one bad edit kill the watcher: that would silently
                # disable every future manual edit and command
                log(f"[watch] error: {e}")
            time.sleep(0.2)

    if control:
        threading.Thread(target=watcher, daemon=True).start()

    if prompt:
        log(f"[seed] generating first script for '{prompt}'...")
        seed_rev = manual_rev[0]
        try:
            decided = llm.seed_script(prompt, key, model=model, provider=provider,
                                      base_url=base_url, reference=reference,
                                      reasoning=reasoning, lang=lang,
                                      session={"bpm": state.bpm, "key": state.key,
                                               "mode": state.mode})
            if manual_rev[0] != seed_rev:
                log("[seed] discarded — manual edit applied during generation")
            else:
                ruby = decided.get("ruby", "")
                if not valid(ruby):
                    raise ValueError(
                        f"seed script invalid for {lang}: {ruby[:160].strip()!r}")
                # keep the archetype's tempo/key/mode — the seed supplies
                # musical content inside the session, not a new identity
                state.adopt_seed(ruby, decided.get("hearing"), keep_identity=True)
                script = state.render()
                if not valid(script):
                    raise ValueError(f"rendered seed invalid for {lang}")
                name = session.save_script(sess_path, script, lang=lang)
                play_live(script)
                log(f"[seed] applied {name} ({len(state.layers)} layers, {state.bpm}bpm {state.key})")
                sync_state(script)
        except Exception as e:
            log(f"[seed] failed ({e}); keeping starter")

    if feedback_enabled and sys.stdin and sys.stdin.isatty():
        log("[feedback] type feedback + Enter anytime (e.g. 'more bass')")

    last_llm = 0.0
    last_var = time.time()
    ticks = 0

    try:
        while True:
            # wake early when the TUI sends feedback, instead of waiting a tick
            wake.wait(tick)
            wake.clear()
            ticks += 1
            rev_before = manual_rev[0]

            if paused[0]:
                # silence is already in effect; skip capture, the model call
                # and playback. Queued feedback waits for the resume.
                continue

            items = control.drain_feedback() if control else []
            replace_text = "; ".join(i["text"] for i in items if i.get("mode") == "replace")
            guide_text = "; ".join(i["text"] for i in items if i.get("mode") != "replace")
            stdin_fb = fb.drain()
            if stdin_fb:
                guide_text = f"{guide_text}; {stdin_fb}" if guide_text else stdin_fb

            # instant replacement: full new set, no audio sample needed
            if replace_text:
                log(f"[replace] building a new set for '{replace_text}'...")
                replace_rev = manual_rev[0]
                try:
                    decided = llm.seed_script(
                        replace_text, key, model=model, provider=provider,
                        base_url=base_url, reference=reference, reasoning=reasoning, lang=lang,
                        session={"bpm": state.bpm, "key": state.key,
                                 "mode": state.mode})
                except Exception as e:
                    log(f"[replace] ERROR: {e}")
                    continue
                if manual_rev[0] != replace_rev:
                    log("[replace] discarded — manual edit applied during call")
                    continue
                ruby = (decided.get("ruby") or "").strip()
                if not valid(ruby):
                    log("[replace] invalid Ruby; keeping current set")
                    last_llm = time.time()
                    continue
                prev = (dict(state.layers), state.bpm, state.key, state.mode, state.mood)
                # a replace keeps the session's tempo/key/mode too: the vibe
                # changes, the set stays a set
                state.adopt_seed(ruby, decided.get("hearing"), keep_identity=True)
                script = state.render()
                if not valid(script):
                    (state.layers, state.bpm, state.key,
                     state.mode, state.mood) = prev
                    script = state.render()
                    log("[replace] rendered script invalid; keeping current set")
                    last_llm = time.time()
                    continue
                with apply_lock:
                    name = session.save_script(sess_path, script, lang=lang)
                    play_live(script)
                    sync_state(script)
                last_llm = time.time()
                log(f"[replace] applied {name} ({len(state.layers)} layers, "
                    f"{state.bpm}bpm {state.key})")
                continue

            try:
                capfile = backend.capture(cap, CAPTURE_SECONDS)
            except BackendClosed:
                # the user quit while this capture was in flight; leaving is
                # the expected outcome, not a failure
                log("[bye] backend closed")
                break
            if not capfile:
                log(f"[tick {ticks}] capture failed, skipping")
                continue
            if record_dir and capfile:
                try:
                    shutil.copy(capfile, os.path.join(record_dir, f"tick_{ticks:04d}.wav"))
                except OSError:
                    pass
            sig = _signature(capfile)
            changed = _diff(prev_sig, sig) if prev_sig is not None else 0.0
            prev_sig = sig

            feedback = guide_text

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
                    with apply_lock:
                        script = state.render()
                        play_live(script)
                        sync_state(script)
                    log(f"[tick {ticks}] deterministic variation (no model call)")
                elif ticks % 6 == 0:
                    # nothing happened — a once-a-minute heartbeat is enough
                    log(f"[tick {ticks}] holding (diff={changed:.1f})")
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
                    reference=reference, reasoning=reasoning, lang=lang)
            except Exception as e:
                log(f"[llm] ERROR: {e} — deterministic fallback")
                if state.variation():
                    with apply_lock:
                        script = state.render()
                        play_live(script)
                        sync_state(script)
                continue

            if manual_rev[0] != rev_before:
                log("[llm] discarded result — manual edit applied during call")
                continue

            # validate BEFORE mutating state — a bad patch must not
            # overwrite the last-good layers in state/render. The model
            # returns a single layer body, so validate it on its own: wrapping
            # it in a Sonic Pi header would make every Strudel patch fail
            # (valid_strudel rejects `use_bpm`).
            ruby = (decided.get("ruby") or "").strip()
            kind = (decided.get("op") or {}).get("kind", "modify")
            if kind != "remove" and ruby and not valid(ruby):
                log(f"[llm] evolve returned invalid {lang} "
                    f"({ruby[:160].strip()!r}); keeping previous script")
                last_llm = time.time()
                continue

            prev_layers = dict(state.layers)
            with apply_lock:
                state.apply_op(decided)
                script = state.render()
                if not valid(script):
                    state.layers = prev_layers
                    script = state.render()
                    log(f"[llm] rendered script invalid; rolled back")
                    last_llm = time.time()
                    continue
                # the engine can still reject a structurally valid script
                # (an unknown function, a bad sample pack); roll back rather
                # than report music that is not actually playing
                if not play_live(script):
                    state.layers = prev_layers
                    script = state.render()
                    play_live(script)
                    log(f"[llm] engine rejected the patch; rolled back")
                    last_llm = time.time()
                    continue
                name = session.save_script(sess_path, script, lang=lang)
                sync_state(script)
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
        backend.shutdown()
