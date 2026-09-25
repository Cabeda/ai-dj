/** Instrument palette.
 *
 * The model may only choose instruments from this palette. Each instrument names
 * its realisation per backend, and a backend advertises only the instruments it
 * can actually play — so classical voices (General MIDI soundfonts) are first
 * class on Strudel and simply absent on Sonic Pi.
 *
 * Canonical names are what the model sees; the per-backend ids are what the
 * generated code uses.
 */

export const SONIC_PI = "sonic_pi";
export const STRUDEL = "strudel";

export interface Instrument {
  name: string;
  family: string;
  realisations: Record<string, string>;
}

function i(name: string, family: string, realisations: Record<string, string>): Instrument {
  return { name, family, realisations };
}

// Families group instruments for the model and for building archetypes.
export const FAMILIES = [
  "drums",
  "breaks",
  "bass",
  "keys",
  "synth",
  "strings",
  "brass",
  "woodwind",
  "voice",
  "fx",
] as const;

export type Family = (typeof FAMILIES)[number];

export const PALETTE: readonly Instrument[] = [
  // -- drums --------------------------------------------------------------
  // Real drum-machine kits (tidal-drum-machines) beat one-shot samples.
  i("kick", "drums", { sonic_pi: ":bd_haus", strudel: "RolandTR909_bd" }),
  i("kick_909", "drums", { strudel: "RolandTR909_bd" }),
  i("kick_808", "drums", { strudel: "RolandTR808_bd" }),
  i("snare", "drums", { sonic_pi: ":drum_snare_hard", strudel: "RolandTR909_sd" }),
  i("hat", "drums", { sonic_pi: ":drum_cymbal_open", strudel: "RolandTR909_hh" }),
  i("hat_open", "drums", { strudel: "RolandTR909_oh" }),
  i("rim", "drums", { strudel: "RolandTR909_rim" }),
  i("clap", "drums", { strudel: "RolandTR909_cp" }),
  i("crash", "drums", { strudel: "RolandTR909_cr" }),
  i("ride", "drums", { strudel: "RolandTR909_rd" }),
  i("tom_low", "drums", { strudel: "RolandTR909_lt" }),
  i("perc", "drums", { sonic_pi: ":drum_tom_mid_soft", strudel: "RolandTR808_cb" }),
  i("cowbell", "drums", { strudel: "cowbell" }),
  i("tambourine", "drums", { strudel: "tambourine" }),
  i("woodblock", "drums", { strudel: "woodblock" }),
  i("triangle", "drums", { strudel: "triangle" }),
  i("shaker", "drums", { strudel: "shaker_large" }),
  // -- breaks (whole drum loops, sampled) ---------------------------------
  i("break_amen", "breaks", { strudel: "amen" }),
  i("break_think", "breaks", { strudel: "think" }),
  i("break_apache", "breaks", { strudel: "apache" }),
  i("break_funky_drummer", "breaks", { strudel: "funkydrummer" }),
  i("break_kool", "breaks", { strudel: "kool" }),
  i("break_sesame", "breaks", { strudel: "sesame" }),
  i("break_new_orleans", "breaks", { strudel: "neworleans" }),
  i("break_hotline", "breaks", { strudel: "hotline" }),
  i("break_sport", "breaks", { strudel: "sport" }),
  // -- bass ---------------------------------------------------------------
  i("acid_bass", "bass", { sonic_pi: ":tb303", strudel: "sawtooth" }),
  i("sub_bass", "bass", { sonic_pi: ":sine", strudel: "sine" }),
  i("picked_bass", "bass", { strudel: "gm_acoustic_bass" }),
  // -- synth --------------------------------------------------------------
  i("pad", "synth", { sonic_pi: ":hollow", strudel: "sawtooth" }),
  i("lead", "synth", { sonic_pi: ":prophet", strudel: "sawtooth" }),
  i("arp", "synth", { sonic_pi: ":beep", strudel: "triangle" }),
  i("drone", "synth", { sonic_pi: ":saw", strudel: "saw" }),
  // -- keys (sampled) -----------------------------------------------------
  i("piano", "keys", { strudel: "piano" }),
  i("grand_piano", "keys", { strudel: "steinway" }),
  i("upright_piano", "keys", { strudel: "kawai" }),
  i("electric_piano", "keys", { strudel: "gm_clavinet" }),
  i("celesta", "keys", { strudel: "gm_celesta" }),
  i("harpsichord", "keys", { strudel: "gm_harpsichord" }),
  i("organ", "keys", { strudel: "pipeorgan_loud" }),
  // -- strings (sampled: VCSL, CC0) ---------------------------------------
  i("violin", "strings", { strudel: "gm_violin" }),
  i("viola", "strings", { strudel: "gm_viola" }),
  i("cello", "strings", { strudel: "gm_cello" }),
  i("contrabass", "strings", { strudel: "gm_contrabass" }),
  i("string_ensemble", "strings", { strudel: "gm_string_ensemble_1" }),
  i("tremolo_strings", "strings", { strudel: "gm_tremolo_strings" }),
  i("pizzicato_strings", "strings", { strudel: "gm_pizzicato_strings" }),
  i("harp", "strings", { strudel: "harp" }),
  i("folkharp", "strings", { strudel: "folkharp" }),
  i("timpani", "strings", { strudel: "timpani" }),
  i("nyckelharpa", "strings", { strudel: "dantranh" }),
  // -- brass (sampled) ----------------------------------------------------
  i("trumpet", "brass", { strudel: "gm_trumpet" }),
  i("trombone", "brass", { strudel: "gm_trombone" }),
  i("french_horn", "brass", { strudel: "gm_french_horn" }),
  i("tuba", "brass", { strudel: "gm_tuba" }),
  i("brass_section", "brass", { strudel: "gm_brass_section" }),
  i("sax", "brass", { strudel: "sax" }),
  // -- woodwind (sampled) -------------------------------------------------
  i("flute", "woodwind", { strudel: "gm_flute" }),
  i("piccolo", "woodwind", { strudel: "gm_piccolo" }),
  i("oboe", "woodwind", { strudel: "gm_oboe" }),
  i("english_horn", "woodwind", { strudel: "gm_english_horn" }),
  i("clarinet", "woodwind", { strudel: "gm_clarinet" }),
  i("bassoon", "woodwind", { strudel: "gm_bassoon" }),
  i("recorder", "woodwind", { strudel: "gm_clarinet" }),
  i("ocarina", "woodwind", { strudel: "ocarina" }),
  // -- voice (sampled) ----------------------------------------------------
  i("choir", "voice", { strudel: "gm_choir_aahs" }),
  i("voice_oohs", "voice", { strudel: "gm_voice_oohs" }),
  // -- plucked / mallets (sampled: VCSL) ----------------------------------
  i("marimba", "keys", { strudel: "marimba" }),
  i("vibraphone", "keys", { strudel: "vibraphone" }),
  i("kalimba", "keys", { strudel: "kalimba" }),
  i("glockenspiel", "keys", { strudel: "glockenspiel" }),
  i("tubular_bells", "keys", { strudel: "tubularbells" }),
  // -- fx -----------------------------------------------------------------
  i("noise", "fx", { sonic_pi: ":noise", strudel: "white" }),
];

const BY_NAME: Record<string, Instrument> = Object.fromEntries(
  PALETTE.map((ins) => [ins.name, ins]),
);

export function allInstruments(): readonly Instrument[] {
  return PALETTE;
}

export function families(): readonly string[] {
  return FAMILIES;
}

/** Instruments the given backend can actually play. */
export function forBackend(backend: string): Instrument[] {
  return PALETTE.filter((ins) => backend in ins.realisations);
}

export function isSupported(name: string, backend: string): boolean {
  const ins = BY_NAME[name];
  return Boolean(ins && backend in ins.realisations);
}

/** Return the Instrument for a canonical name, or throw. */
export function resolve(name: string): Instrument {
  const ins = BY_NAME[name];
  if (!ins) throw new Error(`unknown instrument: ${name}`);
  return ins;
}

/** Return the backend-specific id for an instrument, or throw. */
export function realisation(name: string, backend: string): string {
  const ins = BY_NAME[name];
  const id = ins?.realisations[backend];
  if (id == null) throw new Error(`no ${backend} realisation for ${name}`);
  return id;
}

export function names(backend?: string): string[] {
  const list = backend == null ? PALETTE : forBackend(backend);
  return list.map((ins) => ins.name);
}

/** Markdown table of every instrument and its Strudel id.
 *
 * Appended to the LLM reference so the model always sees the current palette,
 * not a hand-copied snapshot that drifts.
 */
export function asMarkdown(): string {
  const lines = ["| Canonical | Family | Strudel id |", "| --- | --- | --- |"];
  for (const ins of PALETTE) {
    const sid = ins.realisations[STRUDEL] ?? "—";
    lines.push(`| ${ins.name} | ${ins.family} | \`${sid}\` |`);
  }
  return lines.join("\n");
}

/** A compact, model-facing list of what the backend can play. */
export function describe(backend: string): string {
  const lines: string[] = [];
  for (const fam of FAMILIES) {
    const items = forBackend(backend).filter((i) => i.family === fam).map((i) => i.name);
    if (items.length) lines.push(`${fam}: ${items.join(", ")}`);
  }
  return lines.join("\n");
}
