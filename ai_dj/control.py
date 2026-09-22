"""Control surface shared between the DJ loop and the TUI.

The loop owns the music; this object is the thread-safe hand-off point. The
TUI polls GET /state and POSTs feedback / manual script edits. No state is
duplicated in the UI.
"""

import http.server
import json
import threading


class Control:
    def __init__(self):
        self._lock = threading.Lock()
        self.state = {"running": False}
        self.log_lines = []
        self.feedback = []
        self.manual_script = None

    def set_state(self, **kw):
        with self._lock:
            self.state.update(kw)

    def log(self, line):
        with self._lock:
            self.log_lines.append(line)
            self.log_lines = self.log_lines[-400:]

    def push_feedback(self, text):
        text = (text or "").strip()
        if text:
            with self._lock:
                self.feedback.append(text)

    def drain_feedback(self):
        with self._lock:
            items, self.feedback = self.feedback, []
        return "; ".join(items)

    def push_manual_script(self, ruby):
        with self._lock:
            self.manual_script = ruby

    def drain_manual_script(self):
        with self._lock:
            s, self.manual_script = self.manual_script, None
        return s

    def snapshot(self):
        with self._lock:
            return {**self.state, "log": self.log_lines[-200:],
                    "feedback": list(self.feedback)}


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
            self.control.push_feedback(data.get("text", ""))
            self._send(200, {"ok": True})
        elif self.path.startswith("/script"):
            self.control.push_manual_script(data.get("ruby", ""))
            self._send(200, {"ok": True})
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
