"""LLM client with two providers.

- "go":  opencode Zen Go subscription (https://opencode.ai/zen/go/v1). Needs
         OPENCODE_API_KEY. mimo-v2.6-flash can hear audio via input_audio parts.
- "local": a llama.cpp server (default http://127.0.0.1:8080/v1). No key. Audio
         support depends on the loaded model; if the model can't take audio the
         call falls back to text (current script as context).

Shared by the `probe` prototype and the `live` loop.
"""

import base64
import json
import os
import re
import subprocess

ZEN_GO_BASE = "https://opencode.ai/zen/go/v1"
LOCAL_BASE_DEFAULT = os.environ.get("LLAMA_BASE_URL", "http://127.0.0.1:8080/v1")
DEFAULT_MODEL = "mimo-v2.6-flash"

_REFERENCE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                               "reference", "sonic_pi.md")


def _load_reference():
    try:
        with open(_REFERENCE_PATH) as f:
            return f.read()
    except OSError:
        return ""


_DJ_INSTRUCTIONS = """You are the live-coding engine of a generative radio DJ.
You hear a short audio sample of the current music and evolve the set.

You are given: the CURRENT Sonic Pi script (what is playing), a short AUDIO
SAMPLE of its output, and optionally USER FEEDBACK from the listener.

Your job: return an UPDATED version of the script that evolves the music
SMOOTHLY. Respond with ONLY valid JSON, no markdown:

{
  "hearing": {
    "tempo_bpm": 0,
    "key": "",
    "chords": [],
    "energy": "",
    "mood": "",
    "structure": ""
  },
  "decision": {
    "action": "",
    "why": "",
    "change_to": ""
  },
  "ruby": ""
}

HARD RULES:
- Smooth transitions. NEVER jump key, tempo or mood. Keep the current key,
  tempo and feel unless the user feedback explicitly asks otherwise, and then
  move GRADUALLY (change one element at a time, not the whole piece).
- Preserve structure. Keep the existing live_loops; change at most 1-2 elements
  per update (add/remove a layer, adjust a filter, vary a pattern, nudge energy).
- Return the COMPLETE, runnable script (all live_loops), not a diff.
- Every musical choice gets a preceding "# why" comment, referencing what you
  heard or the feedback you acted on.
- Only Sonic Pi DSL. No explanation outside the JSON.

Use the reference below to pick real synths, samples, FX and patterns — make
musically deliberate choices, not random ones.

# Sonic Pi Reference
"""

_DJ_INSTRUCTIONS_LEAN = """You are the live-coding engine of a generative radio DJ.
You hear a short audio sample of the current music and evolve the set smoothly.
Given the CURRENT script, an AUDIO SAMPLE, and optional USER FEEDBACK, return an
UPDATED runnable script as JSON:

{"hearing": {"tempo_bpm": 0, "key": "", "chords": [], "energy": "", "mood": "", "structure": ""},
 "decision": {"action": "", "why": "", "change_to": ""},
 "ruby": ""}

Rules: keep key/tempo/mood unless feedback says otherwise; change at most 1-2
elements per update; return the COMPLETE script (all live_loops); precede each
musical choice with a "# why" comment; valid Sonic Pi DSL only; JSON only.
"""


def _system(reference=True):
    if reference:
        return _DJ_INSTRUCTIONS + _load_reference()
    return _DJ_INSTRUCTIONS_LEAN


SYSTEM = _system(True)


def load_env_key(env_path):
    if env_path and os.path.exists(env_path):
        for line in open(env_path):
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
    b64 = base64.b64encode(open(path, "rb").read()).decode()
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


# -- public calls -----------------------------------------------------------

def _parse(data, model):
    choice = data["choices"][0]
    msg = choice["message"]
    content = msg.get("content")
    if not content:
        reason = choice.get("finish_reason")
        raise RuntimeError(
            f"model returned no content (finish={reason}); "
            f"try raising max_tokens or a smaller reference")
    parsed = _extract_json(content)
    parsed["_usage"] = data.get("usage", {})
    parsed["_model"] = model
    return parsed


def listen_and_decide_prompt(prompt, key, model=DEFAULT_MODEL, session_id=None,
                             provider="go", base_url=None, reference=True):
    """Generate an initial script from a vibe prompt (no audio input)."""
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": _system(reference)},
            {"role": "user", "content": (
                f"Create the FIRST Sonic Pi script for a live set with this vibe: "
                f'"{prompt}". Fill "hearing" with what this vibe implies '
                f'(tempo, key, energy, mood), "decision" with the starting plan, '
                f'and put the full playable script in "ruby".')},
        ],
        "max_tokens": 16000,
        "temperature": 0.8,
    }
    sid = session_id or f"ai-dj-{os.getpid()}"
    data = _post_chat(provider, base_url, key, body, session_id=sid)
    return _parse(data, model)


def listen_and_decide(audio_path, key, model=DEFAULT_MODEL, session_id=None,
                      prompt=None, provider="go", base_url=None,
                      current_script=None, feedback=None, reference=True):
    """Send the current script + audio sample (+ feedback), get the evolution.

    Context is bounded per call: system (cached) + current script + audio +
    feedback. No chat history is carried, so a session can run for hours.
    """
    intro = []
    if current_script:
        intro.append("Here is the CURRENT Sonic Pi script (what is playing now):\n"
                     f"```ruby\n{current_script}\n```")
    intro.append("Here is a 10-second sample of its current output. Evolve the "
                 "music smoothly.")
    if feedback:
        intro.append(f"USER FEEDBACK for this iteration (act on it): {feedback}")
    user_content = [{"type": "text", "text": "\n\n".join(intro)},
                    _audio_part(audio_path)]

    guide = f'\nSTYLE GUIDE (keep the whole set in this vibe): "{prompt}"' if prompt else ""
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": _system(reference) + guide},
            {"role": "user", "content": user_content},
        ],
        "max_tokens": 16000,
        "temperature": 0.8,
    }
    sid = session_id or f"ai-dj-{os.getpid()}"
    try:
        data = _post_chat(provider, base_url, key, body, session_id=sid)
        return _parse(data, model)
    except Exception as e:
        if provider != "local" or current_script is None:
            raise
        # Local model may not accept audio: retry text-only with the script.
        print(f"[llm] local audio failed ({e}); retrying text-only")
        body["messages"][1]["content"] = (
            f"Your model cannot hear audio. Evolve this CURRENT script musically, "
            f"smoothly.\n\n```ruby\n{current_script}\n```")
        data = _post_chat(provider, base_url, key, body, session_id=sid)
        return _parse(data, model)


def _extract_json(text):
    decoder = json.JSONDecoder()
    idx = text.find("{")
    if idx < 0:
        raise ValueError(f"no JSON in model reply: {text[:300]}")
    obj, _ = decoder.raw_decode(text[idx:])
    return obj
