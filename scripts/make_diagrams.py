#!/usr/bin/env python3
"""Generate the README diagrams.

Every image is drawn from primitives, so the diagrams are reproducible, stay in
sync with the docs, and need no design tool. Run:

    python3 scripts/make_diagrams.py

Writes docs/diagrams/*.svg and, when rsvg-convert is available, *.png at 2x for
anywhere that cannot render SVG (chat previews, slides).

The flow and architecture diagrams are emitted in a light and a dark theme so
the README can pick the right one with <picture> + prefers-color-scheme.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "diagrams")

FONT = "Helvetica, Arial, sans-serif"
MONO = "Menlo, Consolas, monospace"

THEMES = {
    "dark": {
        "bg": "#0d0f12", "panel": "#12151a", "panel2": "#1b2028",
        "border": "#2a3138", "text": "#d7e0ea", "muted": "#7f8b99",
        "accent": "#8ad4ff", "green": "#7CFFB2", "amber": "#ffd479",
        "arrow": "#55606d",
    },
    "light": {
        "bg": "#ffffff", "panel": "#f6f8fa", "panel2": "#eaeef2",
        "border": "#d0d7de", "text": "#1f2328", "muted": "#59636e",
        "accent": "#0969da", "green": "#1a7f37", "amber": "#9a6700",
        "arrow": "#8c959f",
    },
}


# -- primitives -------------------------------------------------------------

def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def text(x, y, s, *, size=14, fill="#000", anchor="start", weight="normal",
         family=FONT, opacity=1.0):
    return (f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" '
            f'font-weight="{weight}" fill="{fill}" text-anchor="{anchor}" '
            f'opacity="{opacity}">{esc(s)}</text>')


def rect(x, y, w, h, *, fill="none", stroke="none", rx=10, sw=1.5, dash=None,
         opacity=1.0):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d} '
            f'opacity="{opacity}"/>')


def line(pts, *, stroke="#000", sw=1.6, dash=None, marker="arrow",
         opacity=1.0):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    m = f' marker-end="url(#{marker})"' if marker else ""
    p = " ".join(f"{x},{y}" for x, y in pts)
    return (f'<polyline points="{p}" fill="none" stroke="{stroke}" '
            f'stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"'
            f'{d}{m} opacity="{opacity}"/>')


def label(x, y, s, t, *, size=11.5, color=None, anchor="middle", pad=6):
    """A caption with a background chip so it stays readable over lines."""
    color = color or t["muted"]
    w = len(str(s)) * size * 0.56 + pad * 2
    h = size + 10
    ax = x - w / 2 if anchor == "middle" else (x if anchor == "start" else x - w)
    return (rect(ax, y - h + 3, w, h, fill=t["bg"], rx=5, sw=0, opacity=0.92)
            + text(x, y, s, size=size, fill=color, anchor=anchor))


def node(x, y, w, h, title, sub, t, *, accent=None, tsize=15, ssize=11.5):
    out = [rect(x, y, w, h, fill=t["panel"], stroke=t["border"], rx=11, sw=1.5)]
    cx = x + w / 2
    subs = [] if not sub else ([sub] if isinstance(sub, str) else list(sub))
    if subs:
        ty = y + h / 2 - 4 - (len(subs) - 1) * 8
    else:
        ty = y + h / 2 + 5
    out.append(text(cx, ty, title, size=tsize, fill=t["text"], anchor="middle",
                    weight="600"))
    for i, s in enumerate(subs):
        out.append(text(cx, ty + 20 + i * 16, s, size=ssize, fill=t["muted"],
                        anchor="middle"))
    if accent:
        out.append(rect(x + 2, y + 12, 4, h - 24, fill=accent, rx=2, sw=0))
    return "".join(out)


def svg(w, h, t, body):
    defs = f"""<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7"
          markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="{t['arrow']}"/>
  </marker>
  <marker id="arrow-accent" viewBox="0 0 10 10" refX="8.5" refY="5"
          markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="{t['accent']}"/>
  </marker>
  <marker id="arrow-green" viewBox="0 0 10 10" refX="8.5" refY="5"
          markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="{t['green']}"/>
  </marker>
</defs>"""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {w} {h}" role="img">\n{defs}\n'
            f'<rect width="{w}" height="{h}" fill="{t["bg"]}"/>\n{body}\n</svg>\n')


# -- diagrams ---------------------------------------------------------------

def flow(t):
    """How a set evolves: cast, play, then listen -> decide -> patch -> play."""
    b = [text(48, 46, "How a set evolves", size=21, fill=t["text"], weight="700")]
    b.append(text(48, 70, "one small change at a time, with you in the loop",
                  size=13, fill=t["muted"]))

    # row 1 — casting
    y1, h1 = 104, 80
    xs = [50, 375, 700]
    b.append(node(xs[0], y1, 230, h1, "vibe prompt", '"deep focus" · "synthwave"', t,
                  accent=t["accent"]))
    b.append(node(xs[1], y1, 230, h1, "Casting", "archetype + tempo, key, mode", t))
    b.append(node(xs[2], y1, 230, h1, "Starter", "plays at once, no model wait", t))
    for a, c in ((xs[0], xs[1]), (xs[1], xs[2])):
        b.append(line([(a + 230, y1 + h1 / 2), (c, y1 + h1 / 2)], stroke=t["arrow"]))
    b.append(line([(xs[2] + 115, y1 + h1), (xs[2] + 115, 250)], stroke=t["arrow"]))

    # row 2 — the loop
    lx, ly, lw, lh = 40, 250, 900, 296
    b.append(rect(lx, ly, lw, lh, fill=t["panel2"], stroke=t["border"], rx=16,
                  sw=1.5, dash="7 7", opacity=0.55))
    b.append(text(lx + 24, ly + 30, "the loop  ·  a tick every ~10 s", size=12.5,
                  fill=t["muted"], family=MONO))

    ly2, lh2 = 322, 98
    xs2 = [90, 385, 680]
    b.append(node(xs2[0], ly2, 210, lh2, "Listen",
                  ["capture 10 s of", "its own output"], t, accent=t["accent"]))
    b.append(node(xs2[1], ly2, 210, lh2, "Decide",
                  ["the LLM hears the", "audio + the state"], t))
    b.append(node(xs2[2], ly2, 210, lh2, "Patch",
                  ["one layer, checked", "before it is applied"], t))
    b.append(line([(xs2[0] + 210, ly2 + 49), (xs2[1], ly2 + 49)], stroke=t["arrow"]))
    b.append(line([(xs2[1] + 210, ly2 + 49), (xs2[2], ly2 + 49)], stroke=t["arrow"]))

    # the return leg
    py = 458
    b.append(node(xs2[1], py, 210, 66, "Play", "render & schedule", t,
                  accent=t["green"]))
    b.append(line([(785, ly2 + lh2), (785, py + 33), (595, py + 33)],
                  stroke=t["arrow"]))
    b.append(line([(385, py + 33), (195, py + 33), (195, ly2 + lh2)],
                  stroke=t["arrow"]))
    b.append(label(785, py - 12, "render & schedule", t))
    b.append(label(195, py - 12, "next tick", t))

    # the human
    hy = 606
    b.append(node(340, hy, 300, 74, "You · TUI",
                  ["guide / replace feedback", "or edit the script"], t,
                  accent=t["green"]))
    b.append(line([(490, hy), (490, ly + lh)], stroke=t["green"],
                  marker="arrow-green"))
    b.append(label(490, hy - 12, "feedback & edits", t, color=t["green"]))
    return svg(980, 716, t, "\n".join(b))


def architecture(t):
    """Components and the backend seam."""
    b = [text(48, 46, "Architecture", size=21, fill=t["text"], weight="700")]
    b.append(text(48, 70, "the orchestrator never depends on a sound engine",
                  size=13, fill=t["muted"]))

    # the orchestrator chain
    b.append(node(40, 112, 175, 88, "TUI", "OpenTUI · Bun", t, accent=t["accent"]))
    b.append(node(255, 112, 175, 88, "Control server", ["HTTP /state", "/feedback"], t))
    b.append(node(470, 96, 195, 120, "DJ loop",
                  ["state · sections", "casting · evolve"], t, accent=t["accent"]))
    b.append(line([(215, 146), (255, 146)], stroke=t["arrow"], marker="arrow"))
    b.append(line([(255, 166), (215, 166)], stroke=t["arrow"], marker="arrow"))
    b.append(label(235, 132, "poll", t, size=10.5))
    b.append(line([(430, 156), (470, 156)], stroke=t["arrow"]))

    # the seam
    b.append(line([(665, 132), (700, 132), (700, 102), (735, 102)], stroke=t["arrow"]))
    b.append(line([(665, 180), (700, 180), (700, 238), (735, 238)], stroke=t["arrow"]))
    b.append(label(674, 150, "SoundBackend seam", t, color=t["accent"], size=11,
                   anchor="start"))
    b.append(node(735, 60, 205, 84, "Strudel host", ["Bun · stdio JSON"], t,
                  accent=t["green"]))
    b.append(node(735, 196, 205, 84, "Sonic Pi", ["daemon · OSC"], t))

    # helpers the loop calls
    b.append(node(360, 300, 180, 80, "Sessions", ["versioned scripts"], t))
    b.append(node(580, 300, 180, 80, "LLM client", ["audio + state → patch"], t))
    b.append(line([(520, 216), (520, 300)], stroke=t["arrow"]))
    b.append(line([(620, 216), (620, 300)], stroke=t["arrow"]))
    b.append(text(670, 400, "opencode Zen Go · llama.cpp", size=11, fill=t["muted"],
                  anchor="middle", family=MONO))
    return svg(980, 440, t, "\n".join(b))


TUI_LINES = [
    ("// ai-dj live — generated script", "muted"),
    ("// state bpm=92 key=f# mode=minor energy=0.62 section=build", "muted"),
    ("", "muted"),
    ("setcpm(92/4)", "text"),
    ("", "muted"),
    ("stack(", "text"),
    ("  // layer: kick", "muted"),
    ('  s("RolandTR909_bd*4").gain(0.9).room(0.1),', "green"),
    ("  // layer: bass", "muted"),
    ('  note("<f#1 f#1 a#1 c#2>").s("sawtooth")', "text"),
    ("    .lpf(sine.range(400, 1200).slow(8)).gain(0.45),", "text"),
    ("  // layer: pad", "muted"),
    ('  chord("<F#m F#m D A>").voicing().s("gm_piano")', "green"),
    ("    .gain(0.3).room(0.5).slow(4)", "green"),
    (")", "text"),
    ("", "text"),
]


def tui_mock(t, palette=False):
    """A faithful mock of the TUI layout (always dark — it is a terminal).

    The log panel is hidden by default, so the live set spans the full width.
    With palette=True the command palette is drawn open, filtered to the log
    toggle.
    """
    W, H = 900, 600
    b = [rect(12, 12, W - 24, H - 24, fill=t["bg"], stroke=t["border"], rx=12, sw=1.5)]

    # status bar
    b.append(rect(12, 12, W - 24, 34, fill=t["panel"], rx=12, sw=0))
    b.append(rect(12, 34, W - 24, 12, fill=t["panel"], rx=0, sw=0))
    b.append(text(28, 34, "ai-dj", size=13, fill=t["accent"], weight="700"))
    b.append(text(76, 34, "● playing   92bpm   f# minor   energy 0.62   build",
                  size=12.5, fill=t["text"]))
    b.append(text(W - 28, 34, "mimo-v2.6-flash", size=12.5, fill=t["muted"],
                  anchor="end"))

    # live set panel — full width, the log is hidden by default
    px, py, pw, ph = 24, 56, 852, 402
    b.append(rect(px, py, pw, ph, fill=t["bg"], stroke=t["border"], rx=10))
    b.append(rect(px + 16, py - 9, 84, 18, fill=t["bg"], rx=6, sw=0))
    b.append(text(px + 22, py + 4, "live set", size=12, fill=t["muted"]))
    for i, (ln, kind) in enumerate(TUI_LINES):
        col = {"muted": t["muted"], "text": t["text"], "green": t["green"]}[kind]
        b.append(text(px + 20, py + 34 + i * 24, ln, size=13, fill=col, family=MONO))
    # the editor cursor sits on the trailing empty line
    b.append(rect(px + 20, py + 34 + (len(TUI_LINES) - 1) * 24 - 11, 9, 15,
                  fill=t["green"], rx=1, sw=0))

    # feedback box
    fy = 474
    b.append(rect(24, fy, W - 48, 40, fill=t["panel"], stroke=t["border"], rx=10))
    b.append(rect(40, fy - 9, 84, 18, fill=t["bg"], rx=6, sw=0))
    b.append(text(46, fy + 4, "feedback", size=12, fill=t["muted"]))
    b.append(text(40, fy + 26, "more bass, and bring the hats up",
                  size=12.5, fill=t["text"], family=MONO))
    b.append(rect(292, fy + 12, 9, 15, fill=t["green"], rx=1, sw=0))

    # hints
    b.append(text(28, H - 30,
                  "shift+enter apply   ·   select text to copy   ·   "
                  "ctrl+k commands   ·   ctrl+q quit",
                  size=11.5, fill=t["muted"]))

    if palette:
        ox, oy, ow, oh = 135, 74, 630, 176
        b.append(rect(ox, oy, ow, oh, fill=t["panel"], stroke=t["green"], rx=10))
        b.append(rect(ox + 16, oy - 9, 92, 18, fill=t["bg"], rx=6, sw=0))
        b.append(text(ox + 22, oy + 4, "commands", size=12, fill=t["green"]))
        b.append(text(ox + 20, oy + 40, "> logs", size=13, fill=t["text"],
                      family=MONO))
        b.append(text(ox + 20, oy + 84, "▶ Show logs", size=13, fill=t["green"],
                      family=MONO))
        b.append(text(ox + 20, oy + 122,
                      "enter to toggle the log panel", size=11.5,
                      fill=t["muted"], family=MONO))
    return svg(W, H, t, "\n".join(b))


# -- driver -----------------------------------------------------------------

def write(name, content):
    path = os.path.join(OUT, name)
    with open(path, "w") as f:
        f.write(content)
    return path


def rasterize(svg_path, scale=2):
    if not shutil.which("rsvg-convert"):
        return None
    png = svg_path[:-4] + ".png"
    subprocess.run(["rsvg-convert", "-z", str(scale), "-o", png, svg_path],
                   check=True)
    return png


def main():
    os.makedirs(OUT, exist_ok=True)
    written = []
    for theme_name, t in THEMES.items():
        for kind, fn in (("flow", flow), ("architecture", architecture)):
            written.append(write(f"{kind}-{theme_name}.svg", fn(t)))
    # the TUI is always dark; one mock per view is enough
    written.append(write("tui.svg", tui_mock(THEMES["dark"])))
    written.append(write("tui-palette.svg", tui_mock(THEMES["dark"], palette=True)))

    for p in written:
        png = rasterize(p)
        print(f"wrote {os.path.relpath(p, ROOT)}"
              + (f" + {os.path.basename(png)}" if png else ""))
    if not shutil.which("rsvg-convert"):
        print("(rsvg-convert not found — SVG only)", file=sys.stderr)


if __name__ == "__main__":
    main()
