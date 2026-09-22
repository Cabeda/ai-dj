"""Session storage.

A session is a directory of versioned scripts; the decision rationale lives in
comments inside the scripts. The filename encodes the version.

  sessions/<timestamp>-<slug>/0001.mjs
  sessions/<timestamp>-<slug>/0002.mjs
  ...
  last.rb / last.mjs -> symlink to the latest version

An all-day run saves a script every evolve (thousands per day), so versioning
reads the symlink rather than scanning the directory, and old versions are
pruned to KEEP_VERSIONS. `last.*` is never pruned.

`list_sessions` reads the dirs; `load_latest(id)` returns the latest script.
"""

import os
import re
import time

BASE = os.environ.get(
    "AI_DJ_SESSIONS",
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sessions"))

# Enough history to resume or diagnose, bounded so a day-long run cannot fill
# the disk. At ~1 save/30s that is a few hours of scrollback.
KEEP_VERSIONS = 200

_EXT = {"sonic_pi": "rb", "strudel": "mjs"}


def _slug(seed_info):
    seed = seed_info.get("seed") or ""
    bpm = seed_info.get("bpm")
    return f"{int(time.time())}-{seed}-b{bpm}"


def _version_of(name):
    m = re.match(r"(\d{4})\.(?:rb|mjs)$", name)
    return int(m.group(1)) if m else 0


def create_session(seed_info=None):
    name = _slug(seed_info or {})
    path = os.path.join(BASE, name)
    os.makedirs(path, exist_ok=True)
    return path


def _next_version(session_path):
    """Next version number, read from the symlinks rather than a dir scan."""
    best = 0
    for ext in ("rb", "mjs"):
        last = os.path.join(session_path, f"last.{ext}")
        if os.path.islink(last):
            best = max(best, _version_of(os.readlink(last)))
    return best + 1


def _prune(session_path, keep=None):
    # read KEEP_VERSIONS at call time, not as a default argument
    keep = KEEP_VERSIONS if keep is None else keep
    files = sorted(
        (f for f in os.listdir(session_path) if _version_of(f)),
        key=_version_of,
    )
    if len(files) <= keep:
        return
    for old in files[:-keep]:
        try:
            os.unlink(os.path.join(session_path, old))
        except OSError:
            pass


def save_script(session_path, script, lang="sonic_pi"):
    ext = _EXT.get(lang, "rb")
    nxt = _next_version(session_path)
    name = f"{nxt:04d}.{ext}"
    with open(os.path.join(session_path, name), "w") as f:
        f.write(script)
    last = os.path.join(session_path, f"last.{ext}")
    if os.path.islink(last):
        os.unlink(last)
    os.symlink(name, last)
    _prune(session_path)
    return name


def list_sessions():
    if not os.path.isdir(BASE):
        return []
    out = []
    for d in sorted(os.listdir(BASE)):
        p = os.path.join(BASE, d)
        if not os.path.isdir(p):
            continue
        latest = None
        for ext in ("rb", "mjs"):
            last = os.path.join(p, f"last.{ext}")
            if os.path.islink(last):
                latest = os.readlink(last)
                break
        out.append({"id": d, "path": p, "latest": latest})
    return out


def load_latest(session_id):
    d = os.path.join(BASE, session_id)
    for ext in ("rb", "mjs"):
        p = os.path.join(d, f"last.{ext}")
        if os.path.islink(p):
            target = os.path.join(d, os.readlink(p))
            with open(target) as f:
                return os.readlink(p), f.read()
    raise FileNotFoundError(f"no session {session_id}")