"""ai-dj CLI.

Commands:
  ai-dj new [--seed N] [--prompt V] [--model M] [--local]   fresh session, live-coded
  ai-dj pick <session-id> [--model M] [--local]             resume a saved session
  ai-dj list                                                list saved sessions
  ai-dj models [--local-url URL]                            list local llama.cpp models
  ai-dj probe [--audio F] [--model M] [--local]             one-shot listen+decide
  ai-dj dry [--seed N]                                      render a random starter, no audio

Model provider:
  default       opencode Zen Go (needs OPENCODE_API_KEY), audio-capable
  --local       a llama.cpp server; --local-url sets the endpoint
                (default $LLAMA_BASE_URL or http://127.0.0.1:8080/v1)
"""

import argparse
import os
import subprocess
import sys

from . import llm, session, templates
from .backend import SonicPiBackend
from .live import run


def cmd_list(_a):
    sessions = session.list_sessions()
    if not sessions:
        print("no sessions yet")
        return
    for s in sessions:
        print(f"{s['id']:45s} latest={s['latest']}")


def cmd_dry(a):
    if getattr(a, "backend", "strudel") == "sonic_pi":
        script, _info = templates.random_starter(seed=a.seed)
        print(script)
        return
    from .state import DJState
    from .strudel_templates import archetype_name, build

    name = archetype_name(a.seed)
    layers, info = build(name, seed=a.seed)
    state = DJState(bpm=info["bpm"], key=info["key"], mode=info["mode"],
                    layers=layers, lang="strudel")
    print(state.render())


def cmd_models(a):
    base = a.local_url or llm.LOCAL_BASE_DEFAULT
    models = llm.list_local_models(base)
    if not models:
        print(f"[local] no models found at {base}")
        print("        is llama.cpp running? pass --local-url to set the endpoint.")
        sys.exit(2)
    print(f"[local] models at {base}:")
    for m in models:
        print(f"    {m}")


def _resolve_local(a):
    base = a.local_url or llm.LOCAL_BASE_DEFAULT
    models = llm.list_local_models(base)
    if not models:
        print(f"[local] no models found at {base}")
        print("        is llama.cpp running? pass --local-url to set the endpoint.")
        sys.exit(2)
    if a.model:
        if a.model in models:
            return a.model, base
        print(f"[local] model '{a.model}' is not available at {base}. Available:")
        for m in models:
            print(f"    {m}")
        sys.exit(2)
    # no model chosen: show options, prompt if interactive
    print(f"[local] models at {base}:")
    for i, m in enumerate(models, 1):
        print(f"    {i}. {m}")
    if sys.stdin.isatty():
        try:
            idx = int(input("select a model number (or Ctrl-C): ").strip()) - 1
            return models[idx], base
        except (ValueError, IndexError, EOFError, KeyboardInterrupt):
            print("\n[local] no selection")
            sys.exit(2)
    print("[local] pass --model <name> to choose one")
    sys.exit(0)


def resolve_llm(a):
    """Return (provider, model, base_url, api_key)."""
    if getattr(a, "local", False):
        model, base = _resolve_local(a)
        return "local", model, base, None
    key = llm.load_env_key(a.env)
    if not key:
        print("no OPENCODE_API_KEY found"); sys.exit(2)
    return "go", a.model or llm.DEFAULT_MODEL, None, key


def make_backend(a, log=print, stderr=None):
    """Build the sound backend for this run.

    Default is Strudel (headless, any platform, classical palette).
    `--backend sonic_pi` opts into the Sonic Pi daemon instead.

    `stderr` is where an out-of-process host's diagnostics go (see
    make_strudel_backend); None inherits the terminal.
    """
    choice = getattr(a, "backend", None) or "strudel"
    if choice == "sonic_pi":
        backend = SonicPiBackend(log=log)
        if getattr(a, "output", None):
            backend.audio_output = a.output
            log(f"[audio] pinned output device: {backend.audio_output}")
        else:
            from .audio import active_output
            act = active_output()
            if act:
                log(f"[audio] following system default output: {act['name']} ({act['transport']})")
        return backend
    from .backend import make_strudel_backend
    return make_strudel_backend(log=log, stderr=stderr)


def run_live(a, provider, model, base_url, key):
    if not getattr(a, "dry", False):
        backend = make_backend(a)
    else:
        backend = None  # dry runs make no sound — don't start a host
    print(f"[llm] provider={provider} model={model}")
    return run(key, model, a.env, new_seed=getattr(a, "seed", None),
               session_id=getattr(a, "session_id", None),
               prompt=getattr(a, "prompt", None),
               tick=getattr(a, "tick", 10), dry=getattr(a, "dry", False),
               backend=backend, provider=provider, base_url=base_url,
               reference=not getattr(a, "no_reference", False),
               feedback_enabled=not getattr(a, "no_feedback", False),
               reasoning=getattr(a, "reasoning", "none"),
               record_dir=getattr(a, "record", None))


def run_tui(a, provider, model, base_url, key):
    from . import tui
    tui.launch(a, provider, model, base_url, key)


def cmd_probe(a):
    from .llm import evolve_layer
    provider, model, base_url, key = resolve_llm(a)
    if a.audio:
        audio = a.audio
    else:
        cmd = ["ffmpeg", "-y"]
        for f in "440:554.37:659.25".split(":"):
            cmd += ["-f", "lavfi", "-i", f"sine=frequency={f}:duration=10"]
        cmd += ["-filter_complex", "amix=inputs=3,volume=0.4,afade=t=in:d=1,afade=t=out:st=9:d=1",
                "-ar", "16000", "-ac", "1", "/tmp/ai_dj_probe_sample.wav"]
        subprocess.run(cmd, capture_output=True, check=True)
        audio = "/tmp/ai_dj_probe_sample.wav"
    print(f"[probe] {provider}:{model} <- {audio}")
    try:
        decided = evolve_layer(
            audio, key, model=model, provider=provider, base_url=base_url,
            state_context="bpm=120 key=a mode=minor energy=0.5 section=build",
            layer="hats", direction="build", layer_code=None,
            reference=not getattr(a, "no_reference", False),
            reasoning=getattr(a, "reasoning", "none"))
    except Exception as e:
        print(f"[probe] ERROR: {e}"); sys.exit(1)
    print("HEARING:", decided.get("hearing"))
    print("DECISION:", decided.get("decision"))
    print("OP:", decided.get("op"))
    print("RUBY:\n", decided.get("ruby", ""))


def _add_llm_flags(p, model_default=None):
    p.add_argument("--backend", default="strudel", choices=["strudel", "sonic_pi"],
                   help="sound backend (default strudel; sonic_pi needs the Sonic Pi app)")
    p.add_argument("--model", default=model_default,
                   help="model id (default: provider default; for --local, "
                        "omit to list loaded models)")
    p.add_argument("--local", action="store_true",
                   help="use a local llama.cpp server instead of Zen Go")
    p.add_argument("--local-url", default=None,
                   help=f"llama.cpp base url (default {llm.LOCAL_BASE_DEFAULT})")
    p.add_argument("--reasoning", default="none",
                   choices=["none", "low", "medium", "high"],
                   help="reasoning effort (default none — cheapest)")
    p.add_argument("--no-reference", action="store_true",
                   help="drop the backend's language reference from the prompt (lower context)")
    p.add_argument("--no-feedback", action="store_true",
                   help="disable reading feedback from stdin")
    p.add_argument("--env", default=os.path.expanduser("~/env"),
                   help="file holding OPENCODE_API_KEY")


def main(argv=None):
    ap = argparse.ArgumentParser(prog="ai-dj", description="generative radio DJ (Strudel by default)")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p_new = sub.add_parser("new", help="start a fresh random session")
    p_new.add_argument("--seed", type=int, default=None)
    p_new.add_argument("--prompt", default=None, help="initial vibe guide, e.g. 'synthwave', 'deep house 124bpm'")
    p_new.add_argument("--tick", type=int, default=10)
    p_new.add_argument("--dry", action="store_true")
    p_new.add_argument("--output", default=None, help="audio output device (default: follow system default)")
    p_new.add_argument("--record", nargs="?", const="auto", default=None,
                       help="save each capture as WAV (default: <session>/audio)")
    _add_llm_flags(p_new)
    p_new.set_defaults(fn=lambda a: run_live(a, *resolve_llm(a)))

    p_pick = sub.add_parser("pick", help="resume a saved session")
    p_pick.add_argument("session_id")
    p_pick.add_argument("--output", default=None, help="audio output device (default: follow system default)")
    _add_llm_flags(p_pick)
    p_pick.set_defaults(fn=lambda a: run_live(a, *resolve_llm(a)))

    p_tui = sub.add_parser("tui", help="live TUI: editable script + queued feedback")
    p_tui.add_argument("--prompt", default=None, help="initial vibe guide")
    p_tui.add_argument("--seed", type=int, default=None)
    p_tui.add_argument("--tick", type=int, default=10)
    p_tui.add_argument("--port", type=int, default=8765, help="control server port")
    p_tui.add_argument("--output", default=None, help="audio output device (default: follow system default)")
    p_tui.add_argument("--record", nargs="?", const="auto", default=None,
                       help="save each capture as WAV (default: <session>/audio)")
    _add_llm_flags(p_tui)
    p_tui.set_defaults(fn=lambda a: run_tui(a, *resolve_llm(a)))

    p_list = sub.add_parser("list", help="list saved sessions")
    p_list.set_defaults(fn=cmd_list)

    p_models = sub.add_parser("models", help="list models on the local llama.cpp server")
    p_models.add_argument("--local-url", default=None)
    p_models.set_defaults(fn=cmd_models)

    p_probe = sub.add_parser("probe", help="one-shot listen + decide")
    p_probe.add_argument("--audio", default=None)
    _add_llm_flags(p_probe)
    p_probe.set_defaults(fn=cmd_probe)

    p_dry = sub.add_parser("dry", help="render a random starter, no audio")
    p_dry.add_argument("--seed", type=int, default=None)
    p_dry.set_defaults(fn=cmd_dry)

    args = ap.parse_args(argv)
    args.fn(args)


if __name__ == "__main__":
    main()
