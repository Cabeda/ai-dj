"""Launch the TUI: run the DJ loop + control server, then the Bun/OpenTUI app."""

import os
import subprocess
import sys
import threading

from . import control as control_mod
from . import live

TUI_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tui")


def launch(a, provider, model, base_url, key):
    ctl = control_mod.Control()
    want = getattr(a, "port", 8765)
    try:
        srv = control_mod.make_server(ctl, want)
    except OSError as e:
        print(f"[tui] {e}", file=sys.stderr)
        sys.exit(2)
    port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    # no print() after this point — OpenTUI owns stdout
    if port != want:
        ctl.log(f"[tui] port {want} busy; using {port}")
    ctl.log(f"[tui] control server: http://127.0.0.1:{port}")

    from .cli import make_sonic
    sp = make_sonic(a, log=ctl.log)
    ctl.set_state(running=True, provider=provider, model=model)

    def loop():
        try:
            live.run(key, model, a.env, new_seed=getattr(a, "seed", None),
                     session_id=getattr(a, "session_id", None),
                     prompt=getattr(a, "prompt", None),
                     tick=getattr(a, "tick", 10), sonic=sp,
                     provider=provider, base_url=base_url,
                     reference=not getattr(a, "no_reference", False),
                     feedback_enabled=False,
                     reasoning=getattr(a, "reasoning", "none"), control=ctl)
        except Exception as e:
            ctl.log(f"[loop] fatal: {e}")
            ctl.set_state(running=False)

    threading.Thread(target=loop, daemon=True).start()

    env = os.environ.copy()
    env["AI_DJ_URL"] = f"http://127.0.0.1:{port}"
    try:
        subprocess.run(["bun", "run", os.path.join(TUI_DIR, "index.ts")], env=env)
    except FileNotFoundError:
        print("[tui] bun not found; install from https://bun.sh", file=sys.stderr)
        sys.exit(2)
    finally:
        sp.shutdown()
        srv.shutdown()
