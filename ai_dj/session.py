"""Session storage.

A session is a directory of versioned scripts; the decision rationale lives in
comments inside the scripts. The filename encodes the version.

  sessions/<timestamp>-<slug>/0001.mjs
  sessions/<timestamp>-<slug>/0002.mjs
  ...
  sessions/<timestamp>-<slug>/meta.json      name, favourite, ...
  last.rb / last.mjs -> symlink to the latest version

An all-day run saves a script every evolve (thousands per day), so versioning
reads the symlink rather than scanning the directory, and old versions are
pruned to KEEP_VERSIONS. `last.*` is never pruned.

`list_sessions` reads the dirs; `load_latest(id)` returns the latest script.
`meta.json` carries what a human needs to find a session again — a name and a
favourite flag — and is absent for sessions created before it existed.
"""

import json
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
META = "meta.json"


def _slug(seed_info):
    # seed may be model text; keep it to a safe filename fragment
    seed = re.sub(r"[^A-Za-z0-9_-]+", "-", str(seed_info.get("seed") or ""))[:24]
    bpm = seed_info.get("bpm")
    return f"{int(time.time())}-{seed}-b{bpm}"


def _version_of(name):
    # any number of digits: a day-long run can exceed 9999 versions
    m = re.match(r"(\d+)\.(?:rb|mjs)$", name)
    return int(m.group(1)) if m else 0


def create_session(seed_info=None):
    info = seed_info or {}
    name = _slug(info)
    path = os.path.join(BASE, name)
    os.makedirs(path, exist_ok=True)
    save_meta(path, bpm=info.get("bpm"), key=info.get("key"),
              mode=info.get("mode") or info.get("scale"),
              archetype=info.get("archetype"), created=time.time())
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
    # prune per extension: last.<ext> always points at the newest file of that
    # extension, so pruning the oldest of each extension can never delete the
    # file a symlink still targets
    for ext in _EXT.values():
        files = sorted(
            (f for f in os.listdir(session_path)
             if _version_of(f) and f.endswith("." + ext)),
            key=_version_of,
        )
        if len(files) <= keep:
            continue
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
    if os.path.lexists(last):
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
            if os.path.islink(last) and os.path.exists(last):
                latest = os.readlink(last)
                break
        meta = load_meta(p)
        out.append({
            "id": d,
            "path": p,
            "latest": latest,
            "name": meta.get("name") or "",
            "favorite": bool(meta.get("favorite")),
            "created": _created_of(d),
        })
    # newest first, favourites on top
    out.sort(key=lambda s: (not s["favorite"], -s["created"]))
    return out


# -- metadata (name, favourite) ---------------------------------------------

def _created_of(name):
    """The unix timestamp the slug starts with, or 0."""
    m = re.match(r"(\d{9,})-", name or "")
    return float(m.group(1)) if m else 0.0


def meta_path(session_path):
    return os.path.join(session_path, META)


def load_meta(session_path):
    """Metadata for a session dir. Never raises; missing means 'no name'."""
    try:
        with open(meta_path(session_path)) as f:
            meta = json.load(f)
        if not isinstance(meta, dict):
            meta = {}
    except (OSError, ValueError):
        meta = {}
    meta.setdefault("name", "")
    meta.setdefault("favorite", False)
    return meta


def save_meta(session_path, **fields):
    """Merge fields into a session's metadata. Ignores None (no accidental
    clears) and never raises — losing a name is not worth crashing a run."""
    meta = load_meta(session_path)
    meta.update({k: v for k, v in fields.items() if v is not None})
    try:
        with open(meta_path(session_path), "w") as f:
            json.dump(meta, f, indent=2)
    except OSError:
        pass
    return meta


def preview(session_path, limit=2000):
    """The beginning of a session's latest script, for the browser."""
    try:
        _, script = load_latest(os.path.basename(session_path))
    except (FileNotFoundError, OSError):
        return ""
    return script[:limit]


def load_latest(session_id):
    d = os.path.join(BASE, session_id)
    for ext in ("rb", "mjs"):
        p = os.path.join(d, f"last.{ext}")
        if os.path.islink(p) and os.path.exists(p):
            target = os.path.join(d, os.readlink(p))
            with open(target) as f:
                return os.readlink(p), f.read()
    raise FileNotFoundError(f"no session {session_id}")