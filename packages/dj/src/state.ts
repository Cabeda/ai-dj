/** Deterministic DJ state.
 *
 * Everything that does not need a model lives here: tempo, key, mode, energy,
 * the section plan, which layer to change next, and a deterministic variation
 * used between model calls. The LLM only ever produces one small layer patch.
 *
 * State is the single source of truth for the live set. It renders the full
 * script on demand and can parse a saved script back into layers so a session
 * can be resumed.
 *
 * Ported from ai_dj/state.py — same behaviour, idiomatic names.
 */

// (name, seconds, target_energy) — a deterministic energy arc that loops.
export const SECTIONS: Array<readonly [string, number, number]> = [
  ["intro", 60, 0.3],
  ["build", 75, 0.55],
  ["peak", 90, 0.85],
  ["breakdown", 45, 0.25],
  ["peak", 90, 0.9],
  ["outro", 45, 0.35],
];

// Layer priorities for deterministic decisions.
export const BUILD_ORDER = ["hats", "perc", "bass", "pad", "arp", "lead", "fx", "sub", "drone"];
export const REDUCE_ORDER = ["lead", "arp", "fx", "perc", "hats", "drone", "sub", "pad", "bass"];
export const CORE_LAYERS = new Set(["kick", "bass"]);

// The single "layer" an opaque set is evolved as.
export const WHOLE_LAYER = "set";

const VARIATION_FACTORS = [0.9, 0.95, 1.05, 1.1];
const STRUDEL_PARAMS = ["gain", "room", "lpf", "hpf", "attack", "release", "delay", "pan", "shape"];
const SONIC_PARAMS = ["amp", "cutoff", "release"];

/** Deterministic PRNG (mulberry32) — the tests never depend on its sequence,
 * only on the fact that choices vary; mirrors random.Random's role. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function alignStrudelIdentity(code: string, key: string, mode: string): string {
  // Rewrite a Strudel layer so its tonality matches the session: the model is
  // told to stay in key, but a seed can still emit another root.
  const fix = (_m: string, g1: string) => `${g1}"${key}:${mode}"`;
  return code
    .replace(/(\.scale\()"[^"]*"/g, fix)
    .replace(/(\.chord\()"[^"]*"/g, fix);
}

export function parseLayers(script: string, lang = "sonic_pi"): Record<string, string> {
  if (lang === "strudel") return parseLayersStrudel(script);
  const matches = [...script.matchAll(/^live_loop\s+:(\w+)\s+do/gm)];
  const layers: Record<string, string> = {};
  for (let idx = 0; idx < matches.length; idx++) {
    const m = matches[idx];
    const start = m.index ?? 0;
    const end = idx + 1 < matches.length ? (matches[idx + 1].index ?? script.length) : script.length;
    layers[m[1]] = script.slice(start, end).trim();
  }
  return layers;
}

function parseLayersStrudel(script: string): Record<string, string> {
  const matches = [...script.matchAll(/^\s*\/\/\s*layer:\s*(\w+)\s*$/gm)];
  const layers: Record<string, string> = {};
  for (let idx = 0; idx < matches.length; idx++) {
    const m = matches[idx];
    const start = (m.index ?? 0) + m[0].length;
    const end = idx + 1 < matches.length ? (matches[idx + 1].index ?? script.length) : script.length;
    let body = script.slice(start, end).trim().replace(/,$/, "").trim();
    if (idx + 1 === matches.length) {
      // the last layer runs to the end of the script, which includes the
      // stack's closing paren — drop it (and any blank lines before it)
      body = body.replace(/\n\s*\)\s*$/, "").trim();
    }
    if (body) layers[m[1]] = body;
  }
  return layers;
}

export function parseHeader(script: string): Record<string, string> {
  const m = script.match(/^(?:#|\/\/)\s*state\s+(.+)$/m);
  if (!m) return {};
  const out: Record<string, string> = {};
  for (const tok of m[1].split(/\s+/)) {
    const eq = tok.indexOf("=");
    if (eq >= 0) out[tok.slice(0, eq)] = tok.slice(eq + 1);
  }
  return out;
}

export interface DJStateOptions {
  bpm: number;
  key: string;
  mode: string;
  layers: Record<string, string>;
  energy?: number;
  mood?: string;
  sectionIndex?: number;
  model?: string;
  lang?: string;
  opaque?: boolean;
}

export interface Plan {
  direction: string;
  layer: string | null;
  energyNow: number;
  targetEnergy: number;
  section: string;
}

export interface OpDecision {
  op?: { kind?: string; layer?: string };
  ruby?: string;
  decision?: { action?: string };
  hearing?: { mood?: string };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Like Python's str(round(x, 3)) for the bumped values we produce. */
function formatBump(v: number): string {
  const r = Math.round(v * 1000) / 1000;
  return Number.isInteger(r) ? r.toFixed(1) : String(r);
}

export class DJState {
  bpm: number;
  key: string;
  mode: string;
  lang: string;
  layers: Record<string, string>;
  energy: number;
  mood: string;
  sectionIndex: number;
  sectionStarted: number;
  model: string;
  lastAction = "";
  lastLayer: string | null = null;
  history: string[] = [];
  opaque: boolean;
  private rng: () => number;

  constructor(opts: DJStateOptions) {
    this.bpm = Math.trunc(opts.bpm);
    this.key = opts.key;
    this.mode = opts.mode;
    this.lang = opts.lang ?? "sonic_pi";
    this.layers = { ...opts.layers };
    this.energy = opts.energy ?? 0.35;
    this.mood = opts.mood ?? "";
    this.sectionIndex = (opts.sectionIndex ?? 0) % SECTIONS.length;
    this.sectionStarted = Date.now();
    this.model = opts.model ?? "";
    this.opaque = opts.opaque ?? false;
    this.rng = mulberry32(this.bpm * 1000 + Object.keys(this.layers).length);
  }

  get section(): string {
    return SECTIONS[this.sectionIndex][0];
  }

  targetEnergy(): number {
    return SECTIONS[this.sectionIndex][2];
  }

  sectionSeconds(): number {
    return SECTIONS[this.sectionIndex][1];
  }

  sectionElapsed(): number {
    return (Date.now() - this.sectionStarted) / 1000;
  }

  advanceSection(): void {
    this.sectionIndex = (this.sectionIndex + 1) % SECTIONS.length;
    this.sectionStarted = Date.now();
  }

  private pickExisting(excludeLast = true): string | null {
    let names = Object.keys(this.layers).filter(
      (n) => !(excludeLast && n === this.lastLayer),
    );
    if (!names.length) names = Object.keys(this.layers);
    if (!names.length) return null;
    return names[Math.floor(this.rng() * names.length)];
  }

  planNext(): Plan {
    const target = this.targetEnergy();
    const delta = target - this.energy;
    if (this.opaque) {
      // one piece: never add or drop "layers" it does not have
      const direction = delta > 0.08 ? "build" : delta < -0.08 ? "reduce" : "vary";
      return {
        direction, layer: WHOLE_LAYER,
        energyNow: round2(this.energy), targetEnergy: round2(target),
        section: this.section,
      };
    }
    let direction: string;
    let layer: string | null;
    if (delta > 0.08) {
      direction = "build";
      const found = BUILD_ORDER.find((l) => !(l in this.layers));
      layer = found ?? null;
      if (layer === null) {
        direction = "intensify";
        layer = this.pickExisting();
      }
    } else if (delta < -0.08) {
      direction = "reduce";
      const found = REDUCE_ORDER.find(
        (l) => l in this.layers && !CORE_LAYERS.has(l));
      layer = found ?? null;
      if (layer === null) {
        direction = "vary";
        layer = this.pickExisting();
      }
    } else {
      direction = "vary";
      layer = this.pickExisting();
    }
    return {
      direction, layer,
      energyNow: round2(this.energy), targetEnergy: round2(target),
      section: this.section,
    };
  }

  applyOp(decided: OpDecision): void {
    const op = decided.op ?? {};
    let kind = op.kind ?? "modify";
    let layer = op.layer ?? this.lastLayer;
    const ruby = (decided.ruby ?? "").trim();
    if (this.opaque) {
      // the set is one piece: a patch can only replace it wholesale, and
      // a model that names some other "layer" must not add one (render()
      // would ignore it and the change would silently vanish)
      kind = "modify";
      layer = WHOLE_LAYER;
    }
    if (kind === "remove" && layer) {
      delete this.layers[layer];
    } else if (layer && ruby) {
      this.layers[layer] = ruby;
    }
    this.lastLayer = layer;
    const action = decided.decision?.action ?? "";
    this.lastAction = action;
    this.history.push(action);
    this.history = this.history.slice(-5);
    this.mood = decided.hearing?.mood ?? this.mood;
    // step energy toward the section target
    if (kind === "remove") {
      this.energy = Math.max(0, this.energy - 0.15);
    } else {
      this.energy += 0.2 * (this.targetEnergy() - this.energy);
    }
    this.energy = Math.max(0, Math.min(1, this.energy));
  }

  /** Nudge one layer's numeric params. Safe no-op if nothing matches. */
  variation(): boolean {
    const layer = this.pickExisting();
    if (!layer) return false;
    const code = this.layers[layer];

    const bump = (m: string, g1: string, g2: string) => {
      const val = parseFloat(g2);
      const factor = VARIATION_FACTORS[Math.floor(this.rng() * VARIATION_FACTORS.length)];
      return `${g1}${formatBump(val * factor)}`;
    };

    const params = this.lang === "strudel"
      ? STRUDEL_PARAMS // method-call params, e.g. .gain(0.3) .room(0.4)
      : SONIC_PARAMS; // Sonic Pi keyword args, e.g. amp: 0.5

    let next = code;
    for (const param of params) {
      const pat = this.lang === "strudel"
        ? new RegExp(`(\\.${param}\\(\\s*)([0-9.]+)`)
        : new RegExp(`(\\b${param}:\\s*)([0-9.]+)`);
      next = code.replace(pat, bump);
      if (next !== code) break;
    }
    if (next !== code) {
      this.layers[layer] = next;
      this.lastLayer = layer;
      return true;
    }
    return false;
  }

  toContext(): string {
    return (
      `bpm=${this.bpm} key=${this.key} mode=${this.mode} ` +
      `energy=${this.energy.toFixed(2)} section=${this.section}\n` +
      `active layers: ${Object.keys(this.layers).join(", ") || "none"}\n` +
      `last action: ${this.lastAction || "none"}`
    );
  }

  render(): string {
    if (this.opaque) {
      // the user's own script, played as-is
      return this.layers[WHOLE_LAYER] ?? "";
    }
    if (this.lang === "strudel") return this.renderStrudel();
    const header =
      "# ai-dj live - generated script\n" +
      `# model: ${this.model}\n` +
      `# state bpm=${this.bpm} key=${this.key} mode=${this.mode} ` +
      `energy=${this.energy.toFixed(2)} section=${this.section}\n` +
      `# last: ${this.lastAction}\n` +
      "\n";
    return header + `use_bpm ${this.bpm}\n\n` + Object.values(this.layers).join("\n\n");
  }

  private renderStrudel(): string {
    const header =
      "// ai-dj live - generated script\n" +
      `// model: ${this.model}\n` +
      `// state bpm=${this.bpm} key=${this.key} mode=${this.mode} ` +
      `energy=${this.energy.toFixed(2)} section=${this.section}\n` +
      `// last: ${this.lastAction}\n` +
      `\nsetcpm(${this.bpm}/4)\n\n` +
      "stack(\n";
    const parts = Object.entries(this.layers).map(
      ([name, code]) => `  // layer: ${name}\n  ${code}`,
    );
    return header + parts.join(",\n") + "\n)\n";
  }

  setManual(script: string): void {
    // Adopt a script the user wrote. If it decomposes into `// layer:` blocks
    // we keep evolving it layer by layer. Otherwise it is opaque: kept
    // verbatim, and evolved as one piece. Either way the previous layer model
    // is dropped — otherwise the next render would resurrect the old set.
    const layers = parseLayers(script, this.lang);
    if (Object.keys(layers).length) {
      this.layers = layers;
      this.opaque = false;
    } else {
      this.layers = { [WHOLE_LAYER]: script };
      this.opaque = true;
    }
    this.lastLayer = null;
  }

  static fromScript(script: string, model = "", lang = "sonic_pi"): DJState {
    const layers = parseLayers(script, lang);
    const h = parseHeader(script);
    const hasLayers = Object.keys(layers).length > 0;
    return new DJState({
      bpm: h.bpm !== undefined ? parseInt(h.bpm, 10) : 120,
      key: h.key ?? "a",
      mode: h.mode ?? "minor",
      layers: hasLayers ? layers : script.trim() ? { [WHOLE_LAYER]: script } : {},
      energy: h.energy !== undefined ? parseFloat(h.energy) : 0.35,
      model,
      lang,
      opaque: !hasLayers && script.trim().length > 0,
    });
  }

  adoptSeed(ruby: string, hearing?: { key?: string; mood?: string } | null,
    lang?: string, keepIdentity = false): void {
    // Replace layers with those parsed from a seed script. With keepIdentity
    // the session keeps its tempo/key/mode and only takes the seed's musical
    // content — used for prompt seeding and replace feedback.
    const l = lang ?? this.lang;
    let layers = parseLayers(ruby ?? "", l);
    if (Object.keys(layers).length && keepIdentity && l === "strudel") {
      // the model may still emit another key; make the music agree with
      // the session so the set cannot contradict itself
      const aligned: Record<string, string> = {};
      for (const [n, c] of Object.entries(layers)) {
        aligned[n] = alignStrudelIdentity(c, this.key, this.mode);
      }
      layers = aligned;
    }
    if (Object.keys(layers).length) this.layers = layers;
    if (!keepIdentity) {
      const m = (ruby ?? "").match(/(?:use_bpm|setcpm\()\s*(\d+)/);
      if (m) this.bpm = parseInt(m[1], 10);
    }
    if (hearing) {
      if (!keepIdentity) {
        const root = (hearing.key ?? "").match(/\b([a-gA-G])/);
        if (root) this.key = root[1].toLowerCase();
        const low = (hearing.key ?? "").toLowerCase();
        if (low.includes("minor")) this.mode = "minor";
        else if (low.includes("major")) this.mode = "major";
      }
      this.mood = hearing.mood ?? this.mood;
    }
    this.lastAction = "seed";
  }
}
