"""Session storage.

Per Q10 decision: a session stores ONLY Sonic Pi scripts. Each session is a
directory of versioned .rb files; the decision rationale lives in comments
inside the scripts. The script filename encodes the version.

  ~/Git/ai-dj/sessions/<timestamp>-<slug>/0001.rb
  ~/Git/ai-dj/sessions/<timestamp>-<slug>/0002.rb
  ...
  last.rb -> symlink to the latest version

`list_sessions` reads the dirs; `load_session(id)` returns the latest script.
"""

import os
import re
import time

BASE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sessions")


def _slug(seed_info):
    seed = seed_info.get("seed") or ""
    bpm = seed_info.get("bpm")
    return f"{int(time.time())}-{seed}-b{bpm}"


def _version_of(name):
    m = re.match(r"(\d{4})\.rb$", name)
    return int(m.group(1)) if m else 0


def create_session(seed_info=None):
    name = _slug(seed_info or {})
    path = os.path.join(BASE, name)
    os.makedirs(path, exist_ok=True)
    return path


def save_script(session_path, script):
    files = [f for f in os.listdir(session_path) if _version_of(f)]
    nxt = max((_version_of(f) for f in files), default=0) + 1
    name = f"{nxt:04d}.rb"
    with open(os.path.join(session_path, name), "w") as f:
        f.write(script)
    last = os.path.join(session_path, "last.rb")
    if os.path.islink(last):
        os.unlink(last)
    os.symlink(name, last)
    return name


def list_sessions():
    if not os.path.isdir(BASE):
        return []
    out = []
    for d in sorted(os.listdir(BASE)):
        p = os.path.join(BASE, d)
        if not os.path.isdir(p):
            continue
        last = os.path.join(p, "last.rb")
        latest = os.readlink(last) if os.path.islink(last) else None
        out.append({"id": d, "path": p, "latest": latest})
    return out


def load_latest(session_id):
    p = os.path.join(BASE, session_id, "last.rb")
    if not os.path.islink(p):
        raise FileNotFoundError(f"no session {session_id}")
    return os.readlink(p), open(os.path.join(BASE, session_id, os.readlink(p))).read()