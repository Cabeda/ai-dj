"""Sound backend seam.

The orchestrator (state machine, LLM client, control server, UI) talks to sound
only through :class:`SoundBackend`, so the engine is swappable: Sonic Pi for the
terminal today, Strudel (Web Audio) for the browser / embedded desktop next.
See docs/adr/0001-sound-backend-seam-and-strudel.md.

Contract:

    boot(timeout)          start the engine; ready to accept a script
    play(script)           (re)start the live set from a script
    stop()                 silence all output
    set_volume(volume)     master volume, 0.0..1.0
    capture(path, seconds) record a sample; return the path, or None on failure
    shutdown()             stop the engine and release resources

An out-of-process backend speaks line-delimited JSON on stdio so the Strudel
host can be a JS process driven by the same contract:

    -> {"op": "boot", "timeout": 90}
    <- {"event": "ready"}
    -> {"op": "play", "script": "..."}
    -> {"op": "stop"}
    -> {"op": "set_volume", "volume": 0.8}
    -> {"op": "capture", "path": "...", "seconds": 10}
    <- {"event": "captured", "path": "..."} | {"event": "error", "message": "..."}
    -> {"op": "shutdown"}
"""

from __future__ import annotations

import json
import subprocess
import threading
import time
from abc import ABC, abstractmethod

BACKEND_NAME = "abstract"

# How long to wait for the host to accept a script. Evaluating a pattern is
# fast; this only bites if the host has wedged.
PLAY_TIMEOUT = 30


class BackendClosed(RuntimeError):
    """Raised when the backend is asked to work after shutdown began.

    Shutdown races the DJ loop by design (the loop may be mid-capture when the
    user quits), so callers treat this as "we are leaving", not as a fault.
    """


class SoundBackend(ABC):
    """The seam between the DJ logic and the sound engine."""

    name = BACKEND_NAME

    @abstractmethod
    def boot(self, timeout: float = 90, audio_driver=None):
        """Start the engine. Raise on failure."""

    @abstractmethod
    def play(self, script: str) -> bool:
        """Start (or replace) the live set with `script`.

        Returns False if the engine rejected the script — it keeps playing the
        previous one. Raise only for transport failures.
        """

    @abstractmethod
    def stop(self) -> None:
        """Silence all output."""

    @abstractmethod
    def set_volume(self, volume: float) -> None:
        """Set master volume in 0.0..1.0."""

    @abstractmethod
    def capture(self, path: str, seconds: float):
        """Record `seconds` of output to `path`; return path or None."""

    @abstractmethod
    def shutdown(self) -> None:
        """Stop the engine and release resources. Idempotent."""

    # Optional: instruments this backend can play (canonical palette names).
    def instruments(self):
        from . import palette

        return palette.names(self.name)


class SonicPiBackend(SoundBackend):
    """Terminal backend: the existing Sonic Pi daemon controller."""

    name = "sonic_pi"

    def __init__(self, log=print, sp=None):
        if sp is None:
            from .sonicpi import SonicPi

            sp = SonicPi(log=log)
        self._sp = sp
        self.log = log

    @property
    def raw(self):
        return self._sp

    @property
    def audio_output(self):
        return getattr(self._sp, "audio_output", None)

    @audio_output.setter
    def audio_output(self, value):
        self._sp.audio_output = value

    def boot(self, timeout: float = 90, audio_driver=None):
        return self._sp.boot(timeout=timeout, audio_driver=audio_driver)

    def play(self, script: str) -> bool:
        self._sp.run_code(script)
        return True

    def stop(self) -> None:
        self._sp.stop_all()

    def set_volume(self, volume: float) -> None:
        self._sp.set_volume(volume)

    def capture(self, path: str, seconds: float):
        return self._sp.capture(path, seconds)

    def shutdown(self) -> None:
        self._sp.shutdown()


def make_strudel_backend(log=print, bundle=None, stderr=None, silent=True):
    """Build the Strudel backend: a Bun host speaking the stdio protocol.

    Opt-in for now — see strudel/README.md for status. The host is bundled at
    strudel/host.bundle.mjs (run `bash strudel/build.sh`).

    `stderr` is where the host's own diagnostics go. Leave it None to inherit
    the terminal (CLI runs); pass an open log file under the TUI, where any
    stderr write would corrupt the OpenTUI screen.

    `silent` (the default) keeps the host from scheduling audio to the
    speakers while still evaluating every script, so offline capture — and
    therefore the tests — work unchanged. Blasting audio at whoever runs the
    tests is never right, so the app opts *in* to sound; `AI_DJ_SILENT=1`
    forces silence regardless.
    """
    import os

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    host = bundle or os.path.join(root, "strudel", "host.bundle.mjs")
    if os.environ.get("AI_DJ_SILENT") == "1":
        silent = True
    env = dict(os.environ)
    env["AI_DJ_SILENT"] = "1" if silent else "0"
    return StdioBackend(["bun", host], name="strudel", log=log, stderr=stderr,
                        env=env)


class StdioBackend(SoundBackend):
    """Out-of-process backend over line-delimited JSON on stdio.

    Used to drive a JS host (e.g. a Strudel runtime) with the same contract.
    """

    name = "stdio"

    def __init__(self, argv, log=print, stderr=None, name=None, env=None):
        self.argv = list(argv)
        self.log = log
        self._stderr = stderr
        self._env = env
        if name:
            # the host's palette, e.g. name="strudel"
            self.name = name
        self.proc = None
        self._events = []
        self._dead = False
        self._closed = False
        self._warned_non_json = False
        self.silent = False
        self._cv = threading.Condition()

    # -- process plumbing ---------------------------------------------------
    def _start(self):
        if self.proc is not None:
            return
        self.proc = subprocess.Popen(
            self.argv,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=self._stderr,
            env=self._env,
            text=True,
            bufsize=1,
        )
        threading.Thread(target=self._read_loop, daemon=True).start()

    def _read_loop(self):
        assert self.proc is not None and self.proc.stdout is not None
        for line in self.proc.stdout:
            line = line.strip()
            if not line:
                continue
            try:
                event = json.loads(line)
            except ValueError:
                # The host writes diagnostics to stderr, so stdout should be
                # pure JSON. A stray line means protocol corruption: note the
                # first one as a canary, then stay quiet rather than flooding
                # the log with library chatter.
                if not self._warned_non_json:
                    self._warned_non_json = True
                    self.log(f"[stdio] non-JSON from host (further lines hidden): {line[:200]}")
                continue
            with self._cv:
                self._events.append(event)
                self._cv.notify_all()
        with self._cv:
            self._dead = True
            self._cv.notify_all()

    def _send(self, obj):
        if self._closed:
            raise BackendClosed("backend is shutting down")
        if self.proc is None or self.proc.stdin is None:
            raise RuntimeError("stdio backend not started")
        self.proc.stdin.write(json.dumps(obj) + "\n")
        self.proc.stdin.flush()

    def _wait(self, event_name, timeout):
        """Wait for an event, surfacing host errors instead of swallowing them."""
        deadline = time.time() + timeout
        with self._cv:
            while True:
                for i, event in enumerate(self._events):
                    kind = event.get("event")
                    if kind == event_name:
                        return self._events.pop(i)
                    if kind == "error":
                        self._events.pop(i)
                        raise RuntimeError(f"host error: {event.get('message', 'unknown')}")
                if self._closed:
                    raise BackendClosed("backend is shutting down")
                if self._dead:
                    raise RuntimeError("stdio backend host exited")
                remaining = deadline - time.time()
                if remaining <= 0:
                    return None
                self._cv.wait(remaining)

    # -- SoundBackend -------------------------------------------------------
    def boot(self, timeout: float = 90, audio_driver=None):
        self._start()
        self._send({"op": "boot", "timeout": timeout})
        ready = self._wait("ready", timeout)
        if ready is None:
            raise RuntimeError("stdio backend did not become ready")
        # the host reports whether it will schedule to the speakers; tests
        # assert this is True so a regression cannot start making noise
        self.silent = bool(ready.get("silent"))
        return self

    def play(self, script: str) -> bool:
        if self._closed:
            return True  # leaving; a late edit is not an error
        self._send({"op": "play", "script": script})
        # The host answers `playing`, or `error` (and keeps the previous
        # pattern). Wait for the verdict so a rejected script is never silently
        # ignored — the whole point of a manual edit is that it takes effect.
        try:
            return self._wait("playing", PLAY_TIMEOUT) is not None
        except RuntimeError as e:
            self.log(f"[stdio] play rejected: {e}")
            return False

    def stop(self) -> None:
        if self._closed:
            return
        self._send({"op": "stop"})

    def set_volume(self, volume: float) -> None:
        if self._closed:
            return
        self._send({"op": "set_volume", "volume": float(volume)})

    def capture(self, path: str, seconds: float):
        if self._closed:
            raise BackendClosed("backend is shutting down")
        self._send({"op": "capture", "path": path, "seconds": float(seconds)})
        try:
            event = self._wait("captured", seconds + 25)
        except BackendClosed:
            raise
        except RuntimeError as e:
            # host reported a render failure — treat as no capture
            self.log(f"[stdio] capture failed: {e}")
            return None
        if event is None:
            return None
        return event.get("path", path)

    def shutdown(self) -> None:
        # mark closed first: the DJ loop may be mid-capture, and that race is
        # expected, not a failure
        self._closed = True
        if self.proc is None:
            return
        try:
            self._send({"op": "shutdown"})
        except (OSError, RuntimeError):
            pass
        try:
            if self.proc.stdin:
                self.proc.stdin.close()
        except OSError:
            pass
        if self.proc.poll() is None:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                self.proc.kill()
                self.proc.wait(timeout=3)
        for stream in (self.proc.stdout, self.proc.stderr):
            try:
                if stream:
                    stream.close()
            except OSError:
                pass
        self.proc = None
