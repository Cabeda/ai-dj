"""LLM client with two providers.

- "go":  opencode Zen Go subscription (https://opencode.ai/zen/go/v1). Needs
         OPENCODE_API_KEY. mimo-v2.6-flash can hear audio via input_audio parts.
- "local": a llama.cpp server (default http://127.0.0.1:8080/v1). No key. Audio
         support depends on the loaded model; if the model can't take audio the
         call falls back to text (the layer's code as context).

Frugality rules baked in here:
- The system prompt is byte-identical every call (instructions + reference), so
  it is fully prompt-cached. Everything variable goes in the user message.
- The evolve call asks for ONE layer patch, not the whole script, and runs with
  reasoning_effort="none" by default.
"""

import base64
import json
import os
import re
import subprocess
import sys

ZEN_GO_BASE = "https://opencode.ai/zen/go/v1"
LOCAL_BASE_DEFAULT = os.environ.get("LLAMA_BASE_URL", "http://127.0.0.1:8080/v1")
DEFAULT_MODEL = "mimo-v2.6-flash"

_REFERENCE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reference")
_REFERENCE_PATHS = {
    "sonic_pi": os.path.join(_REFERENCE_DIR, "sonic_pi.md"),
    "strudel": os.path.join(_REFERENCE_DIR, "strudel.md"),
}
LANGS = tuple(_REFERENCE_PATHS)
DEFAULT_LANG = "sonic_pi"


def _load_reference(lang=DEFAULT_LANG):
    try:
        with open(_REFERENCE_PATHS[lang]) as f:
            return f.read()
    except (OSError, KeyError):
        return ""


_EVOLVE = {
    "sonic_pi": """You are the live-coding engine of a generative radio DJ.
You evolve ONE layer of a Sonic Pi live set at a time, smoothly and gradually.

Given: the session state, the layer to change, the direction to take, that
layer's current code (if any), a 10s audio sample, and optional user feedback.

Return ONLY valid JSON, no markdown:
{
  "hearing": {"tempo_bpm": 0, "key": "", "chords": [], "energy": "", "mood": "", "structure": ""},
  "decision": {"action": "", "why": ""},
  "op": {"kind": "add|modify|remove", "layer": "<the given layer>"},
  "ruby": "<ONE live_loop for that layer, with # why comments>"
}

HARD RULES:
- Change ONLY the given layer. Never touch other layers.
- Do NOT set use_bpm; the session tempo is fixed.
- Keep the session key and mode; stay in the current vibe.
- This is one incremental step, not a new song.
- "ruby" must be a single valid Sonic Pi live_loop.
- Precede each musical choice with a "# why" comment.
- No text outside the JSON.

# Sonic Pi Reference
""",
    "strudel": """You are the live-coding engine of a generative radio DJ.
You evolve ONE layer of a Strudel live set at a time, smoothly and gradually.

Given: the session state, the layer to change, the direction to take, that
layer's current pattern (if any), a 10s audio sample, and optional user feedback.

Return ONLY valid JSON, no markdown:
{
  "hearing": {"tempo_bpm": 0, "key": "", "chords": [], "energy": "", "mood": "", "structure": ""},
  "decision": {"action": "", "why": ""},
  "op": {"kind": "add|modify|remove", "layer": "<the given layer>"},
  "ruby": "<ONE Strudel pattern expression for that layer>"
}

HARD RULES:
- Change ONLY the given layer. Never touch other layers.
- Do NOT call setcpm/setcps; the session tempo is fixed.
- Keep the session key and mode; stay in the current vibe.
- This is one incremental step, not a new song.
- "ruby" must be a single Strudel pattern expression: no stack(), no $: labels.
- Choose timbres only from the instrument palette.
- Precede each musical choice with a "// why" comment.
- No text outside the JSON.

# Strudel Reference
""",
}

_SEED = {
    "sonic_pi": """You are the live-coding engine of a generative radio DJ.
Create the FIRST script for a new live set, based on the vibe given.

Return ONLY valid JSON, no markdown:
{
  "hearing": {"tempo_bpm": 0, "key": "", "chords": [], "energy": "", "mood": "", "structure": ""},
  "decision": {"action": "", "why": ""},
  "ruby": "<the complete playable script>"
}

HARD RULES:
- Set one use_bpm at the top and keep it for the whole set.
- Build one live_loop per element (kick, bass, hats, pad, lead, FX) and sync them.
- Every musical choice gets a preceding "# why" comment.
- Valid Sonic Pi DSL only. No text outside the JSON.

# Sonic Pi Reference
""",
    "strudel": """You are the live-coding engine of a generative radio DJ.
Create the FIRST set for a new live session, based on the vibe given.

Return ONLY valid JSON, no markdown:
{
  "hearing": {"tempo_bpm": 0, "key": "", "chords": [], "energy": "", "mood": "", "structure": ""},
  "decision": {"action": "", "why": ""},
  "ruby": "<the complete playable Strudel script>"
}

HARD RULES:
- Start with setcpm(<bpm>/4) and keep that tempo for the whole set.
- Build the set as ONE expression: stack(...) with one pattern per layer
  (kick, bass, hats, pad, lead, FX).
- Choose timbres only from the instrument palette.
- Every musical choice gets a preceding "// why" comment.
- Valid Strudel only. No $: labels. No text outside the JSON.

# Strudel Reference
""",
}


def _system(kind, lang=DEFAULT_LANG, reference=True):
    prompts = _EVOLVE if kind == "evolve" else _SEED
    base = prompts.get(lang, prompts[DEFAULT_LANG])
    if not reference:
        return base  # without the (large) reference
    return base + _load_reference(lang)


def load_env_key(env_path):
    if env_path and os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                m = re.match(r"export\s+OPENCODE_API_KEY\s*=\s*(.+)", line)
                if m:
                    return m.group(1).strip().strip('"').strip("'")
    return os.environ.get("OPENCODE_API_KEY", "")


def _audio_part(path):
    if path.endswith(".wav"):
        down = path.rsplit(".", 1)[0] + "_16k.mp3"
        subprocess.run(
            ["ffmpeg", "-y", "-i", path, "-ar", "16000", "-ac", "1",
             "-codec:a", "libmp3lame", "-qscale:a", "7", down],
            capture_output=True, check=True)
        path = down
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    return {"type": "input_audio", "input_audio": {"data": b64, "format": "mp3"}}


# -- provider plumbing ------------------------------------------------------

def _base_url(provider, base_url=None):
    if base_url:
        return base_url
    return LOCAL_BASE_DEFAULT if provider == "local" else ZEN_GO_BASE


def _post_chat(provider, base_url, api_key, body, session_id=None, timeout=300):
    url = _base_url(provider, base_url).rstrip("/") + "/chat/completions"
    headers = ["-H", "Content-Type: application/json"]
    if api_key:
        headers += ["-H", f"Authorization: Bearer {api_key}"]
    if session_id:
        headers += ["-H", f"x-opencode-session: {session_id}"]
    p = subprocess.run(
        ["curl", "-s", "-X", "POST", url, *headers, "-d", "@-"],
        input=json.dumps(body), capture_output=True, text=True, timeout=timeout)
    if p.returncode != 0:
        raise RuntimeError(f"curl failed: {p.stderr.strip()[:300]}")
    if not p.stdout.strip():
        raise RuntimeError(f"empty response from {url}")
    data = json.loads(p.stdout)
    if "error" in data:
        raise RuntimeError(f"API error: {data['error']}")
    return data


def list_local_models(base_url=None, timeout=10):
    """Return the model ids served by a llama.cpp (or any OpenAI-compatible)
    server, or [] if unreachable."""
    url = _base_url("local", base_url).rstrip("/") + "/models"
    try:
        p = subprocess.run(["curl", "-s", "--max-time", str(timeout), url],
                           capture_output=True, text=True, timeout=timeout + 5)
    except Exception:
        return []
    if p.returncode != 0 or not p.stdout.strip():
        return []
    try:
        data = json.loads(p.stdout)
    except ValueError:
        return []
    return [m.get("id") for m in data.get("data", []) if m.get("id")]


def _parse(data, model):
    choice = data["choices"][0]
    msg = choice["message"]
    content = msg.get("content")
    if not content:
        raise RuntimeError(f"model returned no content (finish={choice.get('finish_reason')})")
    parsed = _extract_json(content)
    parsed["_usage"] = data.get("usage", {})
    parsed["_model"] = model
    return parsed


# -- public calls -----------------------------------------------------------

def seed_script(prompt, key, model=DEFAULT_MODEL, session_id=None,
                provider="go", base_url=None, reference=True, reasoning="none",
                lang=DEFAULT_LANG):
    """Generate the first full script for a vibe prompt (one-time call)."""
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": _system("seed", lang, reference)},
            {"role": "user", "content":
                f'Create the first Sonic Pi script for a live set with this vibe: "{prompt}".'},
        ],
        "max_tokens": 16000,
        "temperature": 0.8,
        "reasoning_effort": reasoning,
    }
    sid = session_id or f"ai-dj-{os.getpid()}"
    data = _post_chat(provider, base_url, key, body, session_id=sid)
    return _parse(data, model)


def evolve_layer(audio_path, key, model=DEFAULT_MODEL, session_id=None,
                 state_context="", layer="", direction="", layer_code=None,
                 feedback=None, provider="go", base_url=None, reference=True,
                 reasoning="none", lang=DEFAULT_LANG):
    """Send the state + one layer's code + audio; get a single-layer patch.

    Input is bounded: system (cached) + compact state + one layer + audio.
    """
    lines = [f"Session state: {state_context}",
             f"Change layer: {layer}",
             f"Direction: {direction}"]
    if layer_code:
        lines.append(f"Current code for '{layer}':\n```ruby\n{layer_code}\n```")
    else:
        lines.append(f"Current code for '{layer}': none yet — create it.")
    if feedback:
        lines.append(f"User feedback (act on it): {feedback}")
    lines.append("Here is a 10s sample of the current output.")

    user_content = [{"type": "text", "text": "\n\n".join(lines)},
                    _audio_part(audio_path)]
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": _system("evolve", lang, reference)},
            {"role": "user", "content": user_content},
        ],
        "max_tokens": 8000,
        "temperature": 0.8,
        "reasoning_effort": reasoning,
    }
    sid = session_id or f"ai-dj-{os.getpid()}"
    try:
        data = _post_chat(provider, base_url, key, body, session_id=sid)
        return _parse(data, model)
    except Exception as e:
        if provider != "local" or not layer_code:
            raise
        print(f"[llm] local audio failed ({e}); retrying text-only", file=sys.stderr)
        body["messages"][1]["content"] = (
            f"Your model cannot hear audio. Evolve layer '{layer}' "
            f"({direction}) of this set.\n\n```ruby\n{layer_code}\n```")
        data = _post_chat(provider, base_url, key, body, session_id=sid)
        return _parse(data, model)


def _extract_json(text):
    # strict=False tolerates raw control characters (e.g. unescaped newlines
    # inside the "ruby" string), which models emit often.
    decoder = json.JSONDecoder(strict=False)
    idx = text.find("{")
    if idx < 0:
        raise ValueError(f"no JSON in model reply: {text[:300]}")
    obj, _ = decoder.raw_decode(text[idx:])
    return obj
