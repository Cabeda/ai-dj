"""Launch the TUI: run the DJ loop + control server, then the Bun/OpenTUI app."""

import os
import subprocess
import sys
import threading

from . import control as control_mod
from . import live

TUI_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tui")


def launch(a, provider, model, base_url, key):
    from .cli import make_sonic

    ctl = control_mod.Control()
    port = getattr(a, "port", 8765)
    srv = control_mod.make_server(ctl, port)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    print(f"[tui] control server: http://127.0.0.1:{port}")

    sp = make_sonic(a)
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
        print("[tui] bun not found; install from https://bun.sh")
        sys.exit(2)
    finally:
        sp.shutdown()
        srv.shutdown()
