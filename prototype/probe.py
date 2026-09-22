#!/usr/bin/env python3
"""
PROTOTYPE - ai-dj probe
Question it answers: can mimo-v2.6-flash (go plan) actually LISTEN to a music
sample and produce a plausible, runnable DJ decision + Sonic Pi script with
comments explaining the decisions?

Throwaway. Not production. State lives in memory. Wipe me when the verdict lands.

Usage:
    python3 probe.py [--audio clip.wav] [--model mimo-v2.6-flash] [--env ~/env]

No --audio? A sample chord is synthesized for you.

Exit 0 if mimo heard the audio, produced valid JSON, and the rendered Ruby passes
`ruby -c`. Non-zero otherwise.
"""

import argparse
import base64
import json
import os
import re
import subprocess
import sys
import tempfile

ZEN_GO = "https://opencode.ai/zen/go/v1/chat/completions"

SYSTEM = """You are the live-coding engine of a generative radio DJ.
You are given a short audio sample of what is currently playing.
TASKS, IN THIS ORDER:
1. HEAR the audio. Describe tempo, key, chords, energy, mood, structure.
2. DECIDE what a live DJ should change next to keep the set flowing
   (build, drop, filter, add/remove a layer, shift key or tempo, silence).
3. Return ONE Ruby snippet for Sonic Pi (live_loop style) that implements
   the change. It must be syntactically valid Sonic Pi Ruby.
4. For EVERY decision in the snippet, add a `#` comment on the line above
   explaining WHY you decided it, based on what you heard.

Respond with ONLY valid JSON, no markdown fences, shape:
{
  "hearing": {"tempo_bpm": 0, "key": "", "chords": [], "energy": "", "mood": "", "structure": ""},
  "decision": {"action": "", "why": "", "change_to": ""},
  "ruby": "..."  // the Sonic Pi snippet, comments inline
}"""


def load_env(env_path):
    if not env_path or not os.path.exists(env_path):
        return os.environ.get("OPENCODE_API_KEY", "")
    for line in open(env_path):
        m = re.match(r'export\s+OPENCODE_API_KEY\s*=\s*(.+)', line)
        if m:
            return m.group(1).strip().strip('"').strip("'")
    return os.environ.get("OPENCODE_API_KEY", "")


def call_llm(key, model, audio_b64, audio_mime):
    body = {
        "model": model,
        "messages": [{"role": "system", "content": SYSTEM},
                     {"role": "user", "content": [
                         {"type": "text",
                          "text": "Here is a 10-second sample of the music being played. Listen and produce your decision JSON."},
                         {"type": "input_audio", "input_audio": {"data": audio_b64, "format": audio_mime}},
                     ]}],
        "max_tokens": 2000,
        "temperature": 0.7,
    }
    payload = json.dumps(body)
    p = subprocess.run(
        ["curl", "-s", "-X", "POST", ZEN_GO,
         "-H", f"Authorization: Bearer {key}",
         "-H", "Content-Type: application/json",
         "-H", f"x-opencode-session: ai-dj-probe-{os.getpid()}",
         "-d", payload],
        capture_output=True, text=True, timeout=180)
    if p.returncode != 0:
        raise RuntimeError(f"curl failed: {p.stderr.strip()[:300]}")
    d = json.loads(p.stdout)
    if "error" in d:
        raise RuntimeError(f"API error: {d['error']}")
    return d["choices"][0]["message"]["content"], d.get("usage", {})


def extract_json(text):
    decoder = json.JSONDecoder()
    idx = text.find("{")
    if idx < 0:
        raise ValueError(f"no JSON found in reply: {text[:400]}")
    obj, _ = decoder.raw_decode(text[idx:])
    return obj


def render_script(sample_name, model, result):
    h = result["hearing"]
    d = result["decision"]
    ruby = result["ruby"]
    header = f"""# ai-dj probe prototype - generated script
# sample: {sample_name}
# model:  {model}
# HEARD:  {h.get('tempo_bpm','?')} bpm, {h.get('key','?')}, chords={h.get('chords','?')},
#         energy={h.get('energy','?')}, mood={h.get('mood','?')}
# DECIDED: {d.get('action','?')} -> {d.get('change_to','?')}
# WHY:     {d.get('why','?')}

"""
    return header + ruby


def ruby_syntax_ok(script):
    with tempfile.NamedTemporaryFile("w", suffix=".rb", delete=False) as f:
        f.write(script)
        tmp = f.name
    try:
        p = subprocess.run(["ruby", "-c", tmp], capture_output=True, text=True)
        return p.returncode == 0, p.stderr.strip()
    finally:
        os.unlink(tmp)


def synth_sample(path="/tmp/ai_dj_sample.wav"):
    freqs = "440:554.37:659.25"
    cmd = ["ffmpeg", "-y"]
    for f in freqs.split(":"):
        cmd += ["-f", "lavfi", "-i", f"sine=frequency={f}:duration=10"]
    cmd += [
        "-filter_complex", "amix=inputs=3,volume=0.4,afade=t=in:d=1,afade=t=out:st=9:d=1",
        "-ar", "16000", "-ac", "1", path]
    subprocess.run(cmd, capture_output=True, text=True, check=True)
    return path


def main():
    ap = argparse.ArgumentParser(description="ai-dj probe prototype")
    ap.add_argument("--audio", default=None,
                    help="audio file to listen to (default: synthesized sample)")
    ap.add_argument("--model", default="mimo-v2.6-flash",
                    help="go-plan model (free tier cannot hear audio)")
    ap.add_argument("--env", default=os.path.expanduser("~/env"))
    ap.add_argument("--out", default=None, help="write rendered .rb here")
    args = ap.parse_args()

    key = load_env(args.env)
    if not key:
        print("NO API KEY - set OPENCODE_API_KEY in --env file")
        sys.exit(2)

    if args.audio:
        audio = args.audio
        print(f"[0/4] using {audio}")
    else:
        audio = synth_sample()
        print(f"[0/4] no --audio; synthesized sample at {audio}")

    mime = "wav" if audio.endswith(".wav") else "mp3"
    audio_b64 = base64.b64encode(open(audio, "rb").read()).decode()

    print(f"[1/4] sending {audio} to {args.model} ...")
    reply, usage = call_llm(key, args.model, audio_b64, mime)

    print(f"[2/4] parsed reply (in_tokens={usage.get('prompt_tokens')}, "
          f"audio_tokens={usage.get('prompt_tokens_details',{}).get('audio_tokens')})")
    result = extract_json(reply)
    print(json.dumps({"hearing": result["hearing"], "decision": result["decision"]},
                     indent=2, ensure_ascii=False))

    print(f"[3/4] raw ruby snippet:\n{result['ruby']}")

    script = render_script(os.path.basename(audio), args.model, result)
    ok, err = ruby_syntax_ok(script)
    print(f"[4/4] rendered script ruby -c: {'OK' if ok else 'FAIL'}")
    if not ok:
        print(f"      ruby error: {err}")

    if args.out:
        with open(args.out, "w") as f:
            f.write(script)
        print(f"      wrote {args.out}")

    print("\n" + "=" * 60)
    print(script)
    print("=" * 60)

    heard = bool(usage.get("prompt_tokens_details", {}).get("audio_tokens", 0))
    sys.exit(0 if (heard and ok) else 1)


if __name__ == "__main__":
    main()