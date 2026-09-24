"""macOS Now Playing integration.

Publishes the current set to the system Now Playing centre, so ai-dj shows up
in Control Center, on the media keys and on the Touch Bar — and so play, pause,
next and previous come back to the loop.

Best-effort by design: off macOS, without `swiftc`, or with
`AI_DJ_NOWPLAYING=0`, every method here is a safe no-op. The work lives in
`tools/nowplaying.swift` (MediaPlayer's public API needs an app run loop), built
on demand the way `ai_dj/audio.py` builds its device helper.
"""

import os
import shutil
import subprocess
import sys
import tempfile
import threading

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOL_SWIFT = os.path.join(PROJECT, "tools", "nowplaying.swift")
TOOL_BIN = os.path.join(tempfile.gettempdir(), "ai_dj_nowplaying")


class NowPlaying:
    """Drives the now-playing helper. Safe to call when unavailable."""

    def __init__(self, log=print):
        self.log = log
        self.proc = None
        self._commands = []
        self._lock = threading.Lock()

    def available(self):
        if os.environ.get("AI_DJ_NOWPLAYING") == "0":
            return False
        return sys.platform == "darwin" and shutil.which("swiftc") is not None

    def _build(self):
        if os.path.exists(TOOL_BIN):
            return True
        try:
            subprocess.run(["swiftc", "-O", "-o", TOOL_BIN, TOOL_SWIFT],
                           capture_output=True, check=True, timeout=180)
            return True
        except Exception as e:
            self.log(f"[nowplaying] helper build failed: {e}")
            return False

    def start(self):
        if self.proc is not None or not self.available():
            return False
        if not self._build():
            return False
        try:
            self.proc = subprocess.Popen(
                [TOOL_BIN], stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL, text=True, bufsize=1)
        except OSError as e:
            self.log(f"[nowplaying] could not start: {e}")
            return False
        threading.Thread(target=self._read, daemon=True).start()
        return True

    def _read(self):
        try:
            for line in self.proc.stdout:
                cmd = line.strip()
                if cmd:
                    with self._lock:
                        self._commands.append(cmd)
                        self._commands = self._commands[-20:]
        except Exception:
            pass

    def update(self, **fields):
        """Set any of title / artist / album / state (playing|paused) / clear."""
        if self.proc is None or self.proc.stdin is None:
            return
        try:
            for key, value in fields.items():
                if value is None:
                    continue
                self.proc.stdin.write(f"{key}={value}\n")
            self.proc.stdin.flush()
        except (OSError, ValueError):
            pass

    def drain(self):
        """Remote commands pressed since the last call."""
        with self._lock:
            items, self._commands = self._commands, []
        return items

    def stop(self):
        if self.proc is None:
            return
        try:
            self.update(clear="")
            if self.proc.stdin:
                self.proc.stdin.close()
            self.proc.wait(timeout=3)
        except Exception:
            try:
                self.proc.kill()
            except Exception:
                pass
        self.proc = None
