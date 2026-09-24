"""Launch the TUI: run the DJ loop + control server, then the Bun/OpenTUI app."""

import os
import subprocess
import sys
import threading
import time

from . import control as control_mod
from . import live

TUI_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tui")
LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logs")

# Everything goes to one file so a run can be debugged after the fact: the
# orchestrator's log lines, the engine's stderr, and the TUI's own stderr.
# OpenTUI owns the terminal, so nothing useful reaches the screen.
_LOGFILE = None


def log_path():
    if _LOGFILE:
        return _LOGFILE
    os.makedirs(LOG_DIR, exist_ok=True)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    return os.path.join(LOG_DIR, f"tui-{stamp}-{os.getpid()}.log")


def _write_log(tag, text):
    if not text:
        return
    try:
        with open(log_path(), "a") as f:
            for line in text.splitlines():
                f.write(f"{time.strftime('%H:%M:%S')} {tag} {line}\n")
    except OSError:
        pass


def _tee(stream, tag):
    """Copy a subprocess stream to the log file only.

    OpenTUI owns the terminal, so echoing here would corrupt the screen. The
    log file is where a run gets debugged after the fact.
    """
    try:
        for line in stream:
            _write_log(tag, line.rstrip("\n"))
    except Exception as e:  # stream closed
        _write_log(tag, f"(stream ended: {e})")


def launch(a, provider, model, base_url, key):
    global _LOGFILE
    _LOGFILE = log_path()
    _write_log("[start]", f"ai-dj tui pid={os.getpid()} argv={sys.argv[1:]}")
    _write_log("[start]", f"backend={getattr(a, 'backend', 'strudel')} model={model}")

    ctl = control_mod.Control()
    # surface every orchestrator log line in the file too
    _ctl_log = ctl.log

    def ctl_log(line):
        _write_log("[dj]", str(line))
        _ctl_log(line)

    ctl.log = ctl_log

    want = getattr(a, "port", 8765)
    try:
        srv = control_mod.make_server(ctl, want)
    except OSError as e:
        print(f"[tui] {e}", file=sys.stderr)
        _write_log("[tui]", f"{e}")
        sys.exit(2)
    port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    # no print() after this point — OpenTUI owns stdout
    if port != want:
        ctl.log(f"[tui] port {want} busy; using {port}")
    ctl.log(f"[tui] control server: http://127.0.0.1:{port}")
    ctl.log(f"[tui] log file: {log_path()}")

    from .cli import make_backend
    # The host writes its diagnostics (sample loads, capture peaks) to stderr.
    # Under the TUI that must go to the run log, never the screen.
    try:
        host_stderr = open(log_path(), "a")
    except OSError:
        host_stderr = None
    try:
        backend = make_backend(a, log=ctl.log, stderr=host_stderr)
    except Exception as e:
        import traceback
        ctl.log(f"[tui] backend failed to start: {e}")
        _write_log("[traceback]", traceback.format_exc())
        sys.exit(2)
    ctl.set_state(running=True, provider=provider, model=model)

    # If the start was given on the command line, go straight in. Otherwise the
    # TUI shows the picker and nothing plays until a starting point is chosen.
    explicit = any([getattr(a, "prompt", None), getattr(a, "seed", None),
                    getattr(a, "archetype", None),
                    getattr(a, "session_id", None)])
    if explicit:
        ctl.mark_started()

    def loop():
        choice = {} if explicit else (ctl.await_start() or {})
        try:
            live.run(key, model, a.env,
                     new_seed=choice.get("seed") or getattr(a, "seed", None),
                     session_id=choice.get("session_id") or getattr(a, "session_id", None),
                     prompt=choice.get("prompt") or getattr(a, "prompt", None),
                     archetype=choice.get("archetype") or getattr(a, "archetype", None),
                     tick=getattr(a, "tick", 10), backend=backend,
                     provider=provider, base_url=base_url,
                     reference=not getattr(a, "no_reference", False),
                     feedback_enabled=False,
                     reasoning=getattr(a, "reasoning", "none"), control=ctl,
                     record_dir=getattr(a, "record", None))
        except Exception as e:
            import traceback
            ctl.log(f"[loop] fatal: {e}")
            _write_log("[traceback]", traceback.format_exc())
            ctl.set_state(running=False)

    threading.Thread(target=loop, daemon=True).start()

    env = os.environ.copy()
    env["AI_DJ_URL"] = f"http://127.0.0.1:{port}"
    env["AI_DJ_LOG"] = log_path()
    proc = None
    # The TUI must own the tty foreground — otherwise keystrokes (ctrl+q)
    # are delivered to this Python process and bun never sees them.
    import signal
    signal.signal(signal.SIGTTOU, signal.SIG_IGN)
    signal.signal(signal.SIGTTIN, signal.SIG_IGN)
    try:
        proc = subprocess.Popen(
            ["bun", "run", os.path.join(TUI_DIR, "index.ts")],
            env=env, stdin=sys.stdin, stdout=sys.stdout,
            stderr=subprocess.PIPE, text=True, bufsize=1,
            start_new_session=False,
            preexec_fn=os.setpgrp)
        threading.Thread(target=_tee, args=(proc.stderr, "[tui]"), daemon=True).start()
        try:
            os.tcsetpgrp(sys.stdin.fileno(), proc.pid)
        except OSError:
            pass
        try:
            proc.wait()
        except KeyboardInterrupt:
            pass
    except FileNotFoundError:
        print("[tui] bun not found; install from https://bun.sh", file=sys.stderr)
        sys.exit(2)
    finally:
        # reclaim the tty for cleanup prints
        try:
            os.tcsetpgrp(sys.stdin.fileno(), os.getpgrp())
        except OSError:
            pass
        if proc is not None and proc.poll() is None:
            proc.terminate()
            try:
                proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                proc.kill()
                proc.wait(timeout=3)
        if proc is not None and proc.stderr:
            try:
                proc.stderr.close()
            except OSError:
                pass
        backend.shutdown()
        srv.shutdown()
        srv.server_close()
        _write_log("[exit]", f"tui exited (log: {log_path()})")
