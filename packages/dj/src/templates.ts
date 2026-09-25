/** Archetypes: named, curated starting points for a set.
 *
 * Ported from ai_dj/strudel_templates.py. `build()` fills the `{key}` /
 * `{mode}` / chord-quality placeholders for a concrete key and mode; the
 * palette supplies the timbres.
 */

import { FUR_ELISE_BPM, FUR_ELISE_LEFT_HAND, FUR_ELISE_RIGHT_HAND } from "./furEliseScore";

export const KEYS = ["c", "d", "e", "f", "g", "a", "b"];
export const MODES = ["minor", "major", "dorian", "mixolydian", "aeolian"];

const LAYER_BODIES: Record<string, string> = {
  // electronic
  kick: 's("RolandTR909_bd*4").gain(rand.range(0.7,0.9)).room(0.08)',
  kick808: 's("RolandTR808_bd*4").gain(rand.range(0.7,0.9)).room(0.08)',
  hat: 's("RolandTR909_hh*8").gain(rand.range(0.1,0.3)).pan(sine.range(0.3,0.7).slow(4)).room(0.15)',
  shaker: 's("shaker_large*16").gain(rand.range(0.08,0.25)).room(0.1)',
  noise_fx: 's("white").gain(0.03).lpf(perlin.range(600,2400).slow(8)).room(0.5)',
  acid: 'n("0 0 3 5 0 7 5 3").scale("{key}:{mode}").s("sawtooth")'
    + '.lpf(sine.range(300,1400).slow(4)).gain(rand.range(0.3,0.5)).room(0.2)',
  lead: 'n("0 2 4 7").scale("{key}:{mode}").s("sawtooth")'
    + '.lpf(sine.range(700,2200).slow(6)).gain(rand.range(0.2,0.35))'
    + '.room(0.3).superimpose(x => x.gain(0.3).late(0.015).pan(0.3))',
  arp: 'n("0 2 4 7 4 2").scale("{key}:{mode}").s("triangle")'
    + '.gain(rand.range(0.18,0.28)).room(0.2).fast(2)',
  // classical
  pad: 'note("[{root}3,{third}3,{fifth}3]").s("gm_string_ensemble_1")'
    + '.attack(1.2).release(4).gain(rand.range(0.25,0.38)).room(0.55).slow(4)'
    + '.superimpose(x => x.gain(0.35).late(0.012).pan(0.3))',
  violin: 'n("0 2 4 7 4 2").scale("{key}:{mode}").s("gm_violin")'
    + '.attack(0.15).release(1).gain(rand.range(0.25,0.35)).room(0.4)',
  cello: 'n("0 2 4 2").scale("{key}:{mode}").s("gm_cello")'
    + '.attack(0.3).release(1.5).gain(rand.range(0.3,0.4)).room(0.35).slow(2)',
  pizz: 'note("[{root}2,{fifth}2]").s("gm_pizzicato_strings").gain(rand.range(0.25,0.35)).room(0.3)',
  harp: 'n("0 4 2 5 3 7").scale("{key}:{mode}").s("harp")'
    + '.gain(rand.range(0.35,0.5)).room(0.4).slow(2)',
  piano: 'chord("<{key^}{q7} {key^}{q7} {key^}M7 {key^}{q7}>").voicing()'
    + '.s("piano").gain(rand.range(0.22,0.35)).room(0.4).slow(4)',
  flute: 'n("4 2 0 2 4 7").scale("{key}:{mode}").s("gm_flute")'
    + '.attack(0.1).release(1.2).gain(rand.range(0.2,0.3)).room(0.4)',
  timpani: 'note("{root}1").s("timpani").gain(rand.range(0.8,1.0)).room(0.5).slow(4)',
  // extra
  padrich: 'note("[{root}3,{third}3,{fifth}3,{root}4]").s("sawtooth")'
    + '.attack(2).release(5).lpf(perlin.range(400,1600).slow(16))'
    + '.gain(rand.range(0.14,0.22)).room(0.6).slow(8)'
    + '.superimpose(x => x.gain(0.35).late(0.012).pan(0.3))',
  sub: 'note("{root}1").s("sine").gain(rand.range(0.4,0.6)).slow(2)',
  rhodes: 'chord("<{key^}{q9} {key^}{q9} {key^}{q7} {key^}{q9}>").voicing()'
    + '.s("gm_clavinet").gain(rand.range(0.2,0.3)).room(0.4).slow(4)',
  vibes: 'n("0 4 2 5 7 4").scale("{key}:{mode}").s("vibraphone")'
    + '.gain(rand.range(0.28,0.4)).room(0.35).slow(2)',
  marimba: 'n("0 2 4 7").scale("{key}:{mode}").s("marimba")'
    + '.gain(rand.range(0.4,0.6)).room(0.3).slow(2)',
  vinyl: 's("white*16").gain(rand.range(0.01,0.03)).hpf(2000)',
  strings: 'note("[{root}3,{third}3,{fifth}3]").s("gm_string_ensemble_1")'
    + '.attack(2).release(6).gain(rand.range(0.18,0.28)).room(0.55).slow(8)'
    + '.superimpose(x => x.gain(0.35).late(0.012).pan(0.3))',
  strings_trem: 'note("[{root}3,{third}3,{fifth}3]").s("gm_tremolo_strings")'
    + '.attack(1.5).release(5).gain(rand.range(0.16,0.24)).room(0.55).slow(8)',
  folkharp: 'n("0 4 2 5 3 7").scale("{key}:{mode}").s("folkharp")'
    + '.gain(rand.range(0.3,0.45)).room(0.4).slow(2)',
  sax: 'n("4 2 0 2").scale("{key}:{mode}").s("sax").gain(0.3)',
  // a whole break, stretched to the cycle: it already carries kick, snare and
  // hats, so it is the rhythm on its own — do not stack a drum kit on it
  break: 's("amen").fit().gain(rand.range(0.55,0.75)).room(0.15)'
    + '.lpf(perlin.range(2500,5500).slow(16))',
  // complete two-hand score, generated from the public-domain edition
  fur_elise_melody: FUR_ELISE_RIGHT_HAND,
  fur_elise_bass: FUR_ELISE_LEFT_HAND,
};

const SCALE_DEGREES: Record<string, number[]> = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
};

const PITCH_CLASSES: Record<string, number> = {
  c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11,
};
const NAMES = ["c", "db", "d", "eb", "e", "f", "gb", "g", "ab", "a", "bb", "b"];

// Seventh-chord quality per mode: major modes get major sevenths, minor modes
// get minor sevenths. Without this a "major" archetype sounds minor and clashes
// with its own scale layers.
const MAJOR_MODES = new Set(["major", "mixolydian", "lydian"]);

function triad(key: string, mode: string): { root: string; third: string; fifth: string } {
  const base = PITCH_CLASSES[key];
  const steps = SCALE_DEGREES[mode];
  const names = [0, 2, 4].map((deg) => {
    const iv = steps[deg % steps.length] + 12 * Math.floor(deg / steps.length);
    return NAMES[(base + iv) % 12];
  });
  return { root: names[0], third: names[1], fifth: names[2] };
}

function fill(body: string, key: string, mode: string): string {
  const tri = triad(key, mode);
  const q7 = MAJOR_MODES.has(mode) ? "M7" : "m7";
  const q9 = MAJOR_MODES.has(mode) ? "M9" : "m9";
  return body
    .split("{q7}").join(q7)
    .split("{q9}").join(q9)
    .split("{key^}").join(key.toUpperCase())
    .split("{key}").join(key)
    .split("{mode}").join(mode)
    .split("{root}").join(tri.root)
    .split("{third}").join(tri.third)
    .split("{fifth}").join(tri.fifth);
}

/** Render an archetype's layers into one Strudel script (a stack). */
export function renderLayers(layers: string[]): string {
  return `stack(\n  ${layers.join(",\n  ")}\n)`;
}

export const ARCHETYPE_NAMES = [
  "techno",
  "house",
  "downtempo",
  "synthwave",
  "ambient",
  "deep_focus",
  "drone",
  "lofi_study",
  "piano_study",
  "vibes_room",
  "string_quartet",
  "chamber",
  "orchestral",
  "solo_piano",
  "harp_strings",
  "fur_elise",
  "marimba_room",
] as const;

export type ArchetypeName = (typeof ARCHETYPE_NAMES)[number];

// Display groups for the picker and `ai-dj archetypes`. Every archetype belongs
// to exactly one (a test enforces it) so the picker cannot silently drop one.
export const ARCHETYPE_GROUPS: Record<string, readonly string[]> = {
  electronic: ["techno", "house", "downtempo", "synthwave"],
  focus: ["ambient", "deep_focus", "drone", "lofi_study", "piano_study",
    "vibes_room", "marimba_room"],
  classical: ["string_quartet", "chamber", "orchestral", "solo_piano",
    "harp_strings", "fur_elise"],
};

const ARCHETYPES: Record<string, string[]> = {
  techno: ["kick808", "hat", "acid", "vinyl"],
  house: ["kick", "hat", "acid", "rhodes"],
  downtempo: ["break", "rhodes", "sub", "vinyl"],
  synthwave: ["kick808", "hat", "acid", "lead", "arp"],
  ambient: ["padrich", "strings", "vibes", "vinyl"],
  deep_focus: ["padrich", "sub", "vibes", "vinyl"],
  drone: ["padrich", "strings", "sub", "vinyl"],
  lofi_study: ["kick808", "shaker", "rhodes", "vinyl"],
  piano_study: ["piano", "sub", "vinyl"],
  vibes_room: ["vibes", "sub", "piano", "vinyl"],
  string_quartet: ["strings", "cello", "violin", "pizz"],
  chamber: ["cello", "piano", "violin"],
  orchestral: ["strings", "strings_trem", "violin", "timpani", "flute"],
  solo_piano: ["piano", "harp"],
  harp_strings: ["harp", "strings", "flute"],
  fur_elise: ["fur_elise_melody", "fur_elise_bass"],
  marimba_room: ["marimba", "sub", "vibes", "vinyl"],
};

const ARCHETYPE_BPM: Record<string, [number, number]> = {
  techno: [126, 140],
  house: [118, 128],
  downtempo: [78, 96],
  synthwave: [100, 118],
  ambient: [60, 80],
  deep_focus: [58, 74],
  drone: [54, 68],
  lofi_study: [70, 86],
  piano_study: [58, 76],
  vibes_room: [60, 78],
  marimba_room: [66, 84],
  string_quartet: [62, 84],
  chamber: [66, 92],
  orchestral: [58, 80],
  solo_piano: [60, 90],
  harp_strings: [64, 88],
  fur_elise: [FUR_ELISE_BPM, FUR_ELISE_BPM],
};

const ARCHETYPE_MODES: Record<string, string[]> = {
  techno: ["minor", "dorian"],
  house: ["minor", "dorian", "mixolydian"],
  downtempo: ["minor", "dorian", "mixolydian"],
  synthwave: ["minor", "aeolian"],
  ambient: ["minor", "dorian", "aeolian"],
  deep_focus: ["minor", "dorian", "aeolian"],
  drone: ["minor", "aeolian", "dorian"],
  lofi_study: ["minor", "dorian", "major"],
  piano_study: ["major", "minor", "dorian"],
  vibes_room: ["major", "minor", "dorian"],
  marimba_room: ["major", "dorian", "minor"],
  string_quartet: ["minor", "major", "dorian"],
  chamber: ["major", "minor", "dorian"],
  orchestral: ["minor", "major", "aeolian"],
  solo_piano: ["major", "minor", "dorian"],
  harp_strings: ["major", "minor", "aeolian"],
  fur_elise: ["minor"],
};

/** Return {layer_name: pattern} for an archetype. */
export function layersFor(archetype: string, key: string, mode: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of ARCHETYPES[archetype]) {
    out[name] = fill(LAYER_BODIES[name], key, mode);
  }
  return out;
}

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

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export interface BuildInfo {
  archetype: string;
  seed: number | null;
  bpm: number;
  key: string;
  mode: string;
  layers: string[];
  bpmRange: [number, number];
}

/** Build an archetype's layers for a key and mode. */
export function build(
  archetype: string,
  opts: { seed?: number | null; bpm?: number; key?: string; mode?: string } = {},
): { layers: Record<string, string>; info: BuildInfo } {
  const { seed = null } = opts;
  const rng = mulberry32(seed ?? ((Math.random() * 0xffffffff) >>> 0));
  const [lo, hi] = ARCHETYPE_BPM[archetype];
  const bpm = opts.bpm ?? lo + Math.floor(rng() * (hi - lo + 1));
  const key = opts.key ?? (archetype === "fur_elise" ? "a" : pick(rng, KEYS));
  const mode = opts.mode ?? pick(rng, ARCHETYPE_MODES[archetype]);
  const layers = layersFor(archetype, key, mode);
  return {
    layers,
    info: {
      archetype, seed, bpm, key, mode,
      layers: Object.keys(layers), bpmRange: [lo, hi],
    },
  };
}

/** Deterministically choose an archetype name for a seed. */
export function archetypeName(seed: number | null = null): ArchetypeName {
  return pick(mulberry32(seed ?? ((Math.random() * 0xffffffff) >>> 0)), ARCHETYPE_NAMES);
}

export interface CatalogueEntry {
  name: string;
  group: string;
  bpm: [number, number];
  modes: string[];
  layers: string[];
}

/** The starting points, for the picker and `ai-dj archetypes`. */
export function catalogue(): CatalogueEntry[] {
  const groupOf: Record<string, string> = {};
  for (const [g, names] of Object.entries(ARCHETYPE_GROUPS)) {
    for (const n of names) groupOf[n] = g;
  }
  return ARCHETYPE_NAMES.map((n) => ({
    name: n,
    group: groupOf[n] ?? "other",
    bpm: ARCHETYPE_BPM[n],
    modes: ARCHETYPE_MODES[n],
    layers: ARCHETYPES[n],
  }));
}
