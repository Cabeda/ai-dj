"""Sonic Pi headless controller.

Boots `daemon.rb`, parses its 6-field stdout handshake, keeps it alive, sends
`/run-code` to live-code, and captures audio through SuperSonic's record tap.

Protocol reference: Sonic Pi 5.0.0
  app/server/ruby/bin/daemon.rb, headless_boot.rb, headless-record.rb
"""

import os
import socket
import subprocess
import threading
import time

from . import osc

APP = "/Applications/Sonic Pi.app/Contents/Resources/app/server"
RUBY = f"{APP}/native/ruby/bin/ruby"
DAEMON = f"{APP}/ruby/bin/daemon.rb"

# Repeated SuperSonic reconnect chatter — noise, not useful log.
_SP_NOISE = (
    "Daemon SuperSonic Conn: connection lost",
    "Daemon SuperSonic Conn: reconnecting",
)


class SonicPi:
    def __init__(self, log=print):
        self.log = log
        self.proc = None
        self.token = None
        self.daemon_port = self.gui_listen = self.gui_send = None
        self.sc_port = self.cues = None
        self._sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self._sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self._listener = None
        self._running = False
        self._ready = threading.Event()
        self._errors = []
        self._listen_sock = None
        self.audio_driver = None
        self.audio_output = None

    # -- boot ---------------------------------------------------------------
    def boot(self, timeout=90, audio_driver=None):
        if not os.path.exists(DAEMON):
            raise RuntimeError(f"Sonic Pi daemon not found at {DAEMON}. Install: brew install --cask sonic-pi")
        cmd = [RUBY, DAEMON]
        if self.audio_driver:
            cmd += ["--audio-driver", self.audio_driver]
        if getattr(self, "audio_output", None):
            cmd += ["--audio-output", self.audio_output]
        self.proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            text=True, bufsize=1)
        line = self.proc.stdout.readline()
        if not line:
            raise RuntimeError("daemon produced no handshake")
        fields = line.split()
        if len(fields) < 6:
            raise RuntimeError(f"unexpected daemon handshake: {line!r}")
        self.daemon_port, self.gui_listen, self.gui_send, self.sc_port, self.cues, self.token = (int(f) for f in fields[:6])
        self.log(f"daemon up: pid={self.proc.pid} token={self.token} eval_port={self.gui_send} engine_port={self.sc_port}")

        self._running = True
        self._listener = threading.Thread(target=self._listen, daemon=True)
        self._listener.start()
        threading.Thread(target=self._keep_alive, daemon=True).start()
        threading.Thread(target=self._drain_stdout, daemon=True).start()

        threading.Thread(target=self._ping_until_ready, daemon=True).start()
        if not self._ready.wait(timeout):
            raise RuntimeError("Sonic Pi engine did not become ready in time")
        self.log("engine ready")
        if not self.audio_output:
            # No pinned device: adopt whatever the user is listening on,
            # including Bluetooth, via the reopen path.
            time.sleep(0.5)
            self.follow_system_default()
            self.log("following system default output; waiting for engine...")
            self.wait_for_engine()
        return self

    def _drain_stdout(self):
        for line in self.proc.stdout:
            s = line.rstrip()
            if not s.strip() or any(n in s for n in _SP_NOISE):
                continue
            self.log(f"[sp] {s}")

    def _listen(self):
        srv = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        srv.bind(("127.0.0.1", self.gui_listen))
        srv.settimeout(0.5)
        self._listen_sock = srv
        try:
            while self._running:
                try:
                    data, _ = srv.recvfrom(65535)
                except socket.timeout:
                    continue
                except OSError:
                    break
                try:
                    addr, args = osc.decode(data)
                except Exception:
                    continue
                self._handle(addr, args)
        finally:
            srv.close()
            self._listen_sock = None

    def _handle(self, addr, args):
        if addr == "/ack":
            self._ready.set()
        elif addr == "/log/info":
            if len(args) > 1 and "Live Coding begin" in str(args[1]):
                self._ready.set()
        elif addr == "/error":
            msg = f"run {args[0]} line {args[3]}: {args[1]}" if len(args) > 3 else str(args)
            self._errors.append(msg)
            self._errors = self._errors[-100:]
            self.log(f"[sp ERROR] {msg}")
        elif addr == "/syntax_error":
            msg = f"syntax run {args[0]} line {args[3]}: {args[1]}" if len(args) > 3 else str(args)
            self._errors.append(msg)
            self._errors = self._errors[-100:]
            self.log(f"[sp SYNTAX ERROR] {msg}")
        elif addr == "/log/multi_message":
            if isinstance(args, list) and len(args) > 4:
                texts = [args[i] for i in range(4, len(args), 2)]
                for t in texts:
                    if t:
                        self.log(f"[sp] {t}")

    def _keep_alive(self):
        while self._running:
            try:
                self._send(self.daemon_port, "/daemon/keep-alive", self.token)
            except OSError:
                pass
            time.sleep(4)

    def _ping_until_ready(self):
        while self._running and not self._ready.is_set():
            try:
                self._send(self.gui_send, "/ping", self.token, "hello")
            except OSError:
                pass
            time.sleep(0.5)

    def follow_system_default(self):
        """Adopt the current system default output device.

        SuperSonic can't *boot* on a Bluetooth/wireless device (it falls back
        to a wired one), but its reopen path re-reads the system default and
        switches to it via JUCE's wireless-capable init. This is how the DJ
        plays through whatever the user is actually listening on.
        """
        self._send(self.daemon_port, "/daemon/audio/reopen-device", self.token)

    def wait_for_engine(self, timeout=45, interval=1.5):
        """Poll until the spider accepts code.

        A device switch (especially to a wireless device) reinitialises the
        audio engine; while that runs, any code errors with "still
        reinitialising". Probe with a no-op until it stops erroring.
        """
        deadline = time.time() + timeout
        while time.time() < deadline:
            n = len(self._errors)
            self.run_code("use_bpm 60")
            time.sleep(interval)
            new = self._errors[n:]
            if not any("reinitialis" in e for e in new):
                return True
        self.log("[warn] engine did not report ready within timeout")
        return False

    # -- control ------------------------------------------------------------
    def _send(self, port, address, *args):
        self._sock.sendto(osc.encode(address, *args), ("127.0.0.1", port))

    def run_code(self, code: str):
        self._send(self.gui_send, "/run-code", self.token, code)

    def stop_all(self):
        self._send(self.gui_send, "/stop-all-jobs", self.token)

    def set_volume(self, vol: float):
        self._send(self.gui_send, "/mixer-output-volume", self.token, float(vol), 0)

    # -- capture ------------------------------------------------------------
    # Sonic Pi 5's engine OSC rides a TCP connection owned by the daemon, so
    # the old UDP /supersonic/record/start on sc_port is dead. The supported
    # route is the in-language recording_start / recording_save DSL, which the
    # spider forwards over that TCP connection.
    def capture(self, path: str, seconds: float):
        if os.path.exists(path):
            os.unlink(path)
        # One eval: start, wait, save. in_thread keeps the main run free.
        self.run_code(
            "in_thread do\n"
            "  recording_start\n"
            f"  sleep {float(seconds)}\n"
            f'  recording_save "{path}"\n'
            "end")
        deadline = time.time() + seconds + 8
        while time.time() < deadline:
            if os.path.exists(path) and os.path.getsize(path) > 0:
                time.sleep(0.5)
                return path
            time.sleep(0.25)
        return None

    def shutdown(self):
        if not self._running and (not self.proc or self.proc.poll() is not None):
            return  # already down
        self._running = False
        # boot may have failed before the handshake — no token/port yet
        if self.daemon_port is not None and self.token is not None:
            try:
                self._send(self.daemon_port, "/daemon/exit", self.token)
            except (OSError, TypeError):
                pass
        time.sleep(0.5)
        if self.proc and self.proc.poll() is None:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.proc.kill()
                self.proc.wait(timeout=5)
        if self.proc and self.proc.stdout:
            self.proc.stdout.close()
        self._sock.close()
