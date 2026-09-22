"""Audio device detection for Sonic Pi.

SuperSonic's CoreAudio driver refuses Bluetooth/wireless output devices *at
boot* and silently falls back to a wired device. The fix is not to pin a
device at all: boot with the system default, then send
`/daemon/audio/reopen-device`, which re-reads the system default and switches
to it via JUCE's wireless-capable init (see SonicPi.follow_system_default).

This module only *reports* devices, so the CLI can tell the user what it is
following and `--output` can validate an explicit choice.
"""

import os
import subprocess
import tempfile

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOL_SWIFT = os.path.join(PROJECT, "tools", "audiodev.swift")
TOOL_BIN = os.path.join(tempfile.gettempdir(), "ai_dj_audiodev")


def _build_tool():
    if os.path.exists(TOOL_BIN):
        return True
    try:
        subprocess.run(["swiftc", "-o", TOOL_BIN, TOOL_SWIFT],
                       capture_output=True, check=True, timeout=120)
        return True
    except Exception:
        return False


def list_devices():
    if not _build_tool():
        return []
    try:
        p = subprocess.run([TOOL_BIN, "--list"], capture_output=True,
                           text=True, timeout=10)
    except Exception:
        return []
    out = []
    for ln in p.stdout.splitlines():
        parts = ln.split("\t")
        if len(parts) >= 4:
            out.append({"name": parts[0], "uid": parts[1],
                        "transport": parts[2], "default": parts[3] == "DEFAULT"})
    return out


def active_output():
    """Return the current default output device dict, or None."""
    for d in list_devices():
        if d["default"]:
            return d
    return None