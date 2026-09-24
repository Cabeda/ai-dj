"""Control surface shared between the DJ loop and the TUI.

The loop owns the music; this object is the thread-safe hand-off point. The
TUI polls GET /state and POSTs feedback / manual script edits. No state is
duplicated in the UI.
"""

import http.server
import json
import os
import threading


class Control:
    def __init__(self):
        self._lock = threading.Lock()
        self.state = {"running": False}
        self.log_lines = []
        self.feedback = []
        self.manual_script = None
        self.commands = []

    def set_state(self, **kw):
        with self._lock:
            if "script" in kw and kw["script"] != self.state.get("script"):
                # A monotonic revision lets the UI tell a genuinely new script
                # apart from one it sent that the engine rejected (the script
                # value is unchanged, so the revision is too).
                self.state["script_rev"] = self.state.get("script_rev", 0) + 1
            self.state.update(kw)

    def log(self, line):
        with self._lock:
            self.log_lines.append(line)
            self.log_lines = self.log_lines[-400:]

    def push_feedback(self, text, mode="guide"):
        text = (text or "").strip()
        if text:
            with self._lock:
                self.feedback.append({"text": text, "mode": mode})
                # loop may be stalled between drains — don't grow forever
                self.feedback = self.feedback[-100:]

    def drain_feedback(self):
        with self._lock:
            items, self.feedback = self.feedback, []
        return items

    def has_feedback(self):
        with self._lock:
            return bool(self.feedback)

    def push_manual_script(self, ruby):
        with self._lock:
            self.manual_script = ruby

    def drain_manual_script(self):
        with self._lock:
            s, self.manual_script = self.manual_script, None
        return s

    def push_command(self, cmd):
        cmd = (cmd or "").strip()
        if cmd:
            with self._lock:
                self.commands.append(cmd)
                self.commands = self.commands[-20:]

    def drain_commands(self):
        with self._lock:
            items, self.commands = self.commands, []
        return items

    def snapshot(self):
        with self._lock:
            return {**self.state, "log": self.log_lines[-200:],
                    "feedback": list(self.feedback)}

    # -- sessions (the browser modal) ---------------------------------------
    def sessions(self):
        """Every saved session, newest first with favourites on top, each with
        a preview of its latest script."""
        from . import session as session_mod

        out = []
        for s in session_mod.list_sessions():
            out.append({**s, "preview": session_mod.preview(s["path"])})
        return out

    def name_session(self, session_id, name):
        from . import session as session_mod

        path = os.path.join(session_mod.BASE, os.path.basename(session_id or ""))
        if os.path.isdir(path):
            session_mod.save_meta(path, name=(name or "").strip()[:80])

    def favorite_session(self, session_id, favorite):
        from . import session as session_mod

        path = os.path.join(session_mod.BASE, os.path.basename(session_id or ""))
        if os.path.isdir(path):
            session_mod.save_meta(path, favorite=bool(favorite))

    def load_session(self, session_id):
        """Queue a saved session's latest script as a manual edit, so the
        running set adopts it (the same path as pasting it into the editor)."""
        from . import session as session_mod

        try:
            _, script = session_mod.load_latest(os.path.basename(session_id or ""))
        except (FileNotFoundError, OSError):
            return False
        self.push_manual_script(script)
        return True


class _Handler(http.server.BaseHTTPRequestHandler):
    control = None

    def _send(self, code, obj=None):
        body = b"" if obj is None else json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if body:
            self.wfile.write(body)

    def do_GET(self):
        if self.path.startswith("/state"):
            self._send(200, self.control.snapshot())
        elif self.path.startswith("/sessions"):
            self._send(200, {"sessions": self.control.sessions()})
        elif self.path == "/health":
            self._send(200, {"ok": True})
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        try:
            data = json.loads(self.rfile.read(length) or b"{}")
        except ValueError:
            data = {}
        if self.path.startswith("/feedback"):
            self.control.push_feedback(data.get("text", ""), data.get("mode", "guide"))
            self._send(200, {"ok": True})
        elif self.path.startswith("/script"):
            self.control.push_manual_script(data.get("ruby", ""))
            self._send(200, {"ok": True})
        elif self.path.startswith("/command"):
            self.control.push_command(data.get("cmd", ""))
            self._send(200, {"ok": True})
        elif self.path.startswith("/session/name"):
            self.control.name_session(data.get("id", ""), data.get("name", ""))
            self._send(200, {"ok": True})
        elif self.path.startswith("/session/favorite"):
            self.control.favorite_session(data.get("id", ""), data.get("favorite", False))
            self._send(200, {"ok": True})
        elif self.path.startswith("/session/load"):
            ok = self.control.load_session(data.get("id", ""))
            self._send(200 if ok else 404, {"ok": ok})
        else:
            self._send(404, {"error": "not found"})

    def log_message(self, *args):
        pass


class _Server(http.server.ThreadingHTTPServer):
    # TIME_WAIT from a previous run must not block a restart
    allow_reuse_address = True
    daemon_threads = True


def make_server(control, port, attempts=10):
    """Bind 127.0.0.1:port; if busy, try port+1 .. port+attempts-1.

    Raises OSError with a clear message if none are free.
    """
    handler = type("BoundHandler", (_Handler,), {"control": control})
    last = None
    for i in range(attempts):
        try:
            return _Server(("127.0.0.1", port + i), handler)
        except OSError as e:
            last = e
    raise OSError(
        f"control port(s) {port}..{port + attempts - 1} unavailable: {last}"
    )
