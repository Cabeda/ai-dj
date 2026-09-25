import { describe, expect, test } from "bun:test";
import { STRUDEL, allInstruments } from "../src/palette";
import {
  ARCHETYPE_GROUPS,
  ARCHETYPE_NAMES,
  archetypeName,
  build,
  catalogue,
  layersFor,
} from "../src/templates";

const VOCAL_PATCHES = ["choir", "voice_oohs", "gm_choir_aahs", "gm_voice_oohs"];
const BUILTIN = new Set([
  "sawtooth", "sine", "triangle", "square", "supersaw", "saw",
  "white", "pink", "brown",
]);

describe("archetype catalogue", () => {
  test("covers every archetype exactly once across groups", () => {
    const listed = Object.values(ARCHETYPE_GROUPS).flat();
    expect([...listed].sort()).toEqual([...ARCHETYPE_NAMES].sort());
    expect(new Set(listed).size).toBe(listed.length);
  });

  test("each entry carries bpm, modes, layers and group", () => {
    const entries = catalogue();
    expect(entries).toHaveLength(ARCHETYPE_NAMES.length);
    for (const e of entries) {
      expect(e.bpm.length).toBe(2);
      expect(e.modes.length).toBeGreaterThan(0);
      expect(e.layers.length).toBeGreaterThan(0);
      expect(Object.keys(ARCHETYPE_GROUPS)).toContain(e.group);
    }
  });
});

describe("archetype builds", () => {
  test("every archetype builds with identity and ranges", () => {
    for (const name of ARCHETYPE_NAMES) {
      const { layers, info } = build(name, { seed: 1 });
      expect(Object.keys(layers).length > 0, name).toBe(true);
      expect(info.archetype).toBe(name);
      expect(info.bpm).toBeGreaterThanOrEqual(info.bpmRange[0]);
      expect(info.bpm).toBeLessThanOrEqual(info.bpmRange[1]);
    }
  });

  test("explicit bpm, key and mode are respected", () => {
    const { info } = build("techno", { bpm: 130, key: "f", mode: "dorian" });
    expect(info.bpm).toBe(130);
    expect(info.key).toBe("f");
    expect(info.mode).toBe("dorian");
  });

  test("layers have no tempo or stack", () => {
    // layers render inside a stack; they must not set tempo themselves
    for (const name of ARCHETYPE_NAMES) {
      const { layers } = build(name, { seed: 2 });
      for (const [layer, code] of Object.entries(layers)) {
        expect(code, `${name}/${layer}`).not.toContain("setcpm");
        expect(code, `${name}/${layer}`).not.toContain("stack");
      }
    }
  });

  test("chord quality follows the mode", () => {
    const major = layersFor("solo_piano", "c", "major")["piano"] ?? "";
    const minor = layersFor("solo_piano", "c", "minor")["piano"] ?? "";
    expect(major).toContain("CM7");
    expect(major).not.toContain("Cm7");
    expect(minor).toContain("Cm7");
  });

  test("tempo matches the archetype", () => {
    const techno = catalogue().find((e) => e.name === "techno")!;
    const classical = catalogue().find((e) => e.name === "orchestral")!;
    expect(techno.bpm[0]).toBeGreaterThan(classical.bpm[1]);
  });

  test("seeds vary", () => {
    const a = build("techno", { seed: 1 });
    const b = build("techno", { seed: 2 });
    expect(a.layers).not.toEqual(b.layers);
  });

  test("classical archetype uses gm instruments", () => {
    const { layers } = build("string_quartet", { seed: 1 });
    expect(Object.values(layers).join(" ")).toContain("gm_");
  });

  test("strudel instrument ids are in the palette", () => {
    const known = new Set(
      allInstruments()
        .filter((ins) => STRUDEL in ins.realisations)
        .map((ins) => ins.realisations[STRUDEL]),
    );
    const unknown: string[] = [];
    for (const name of ARCHETYPE_NAMES) {
      const { layers } = build(name, { seed: 3 });
      for (const [layer, code] of Object.entries(layers)) {
        for (const m of code.matchAll(/s\("([^"]+)"\)/g)) {
          for (const token of m[1].split(/[,\s]+/)) {
            const base = token.split("*")[0].split(":")[0].trim();
            if (base && !known.has(base) && !BUILTIN.has(base)) {
              unknown.push(`${name}/${layer}: ${base}`);
            }
          }
        }
      }
    }
    expect(unknown).toEqual([]);
  });

  test("no archetype uses a voice patch", () => {
    // the station replaces non-vocal radio: vocals pull attention from work
    const offenders: string[] = [];
    for (const name of ARCHETYPE_NAMES) {
      const { layers } = build(name, { seed: 1 });
      const joined = Object.values(layers).join(" ");
      for (const patch of VOCAL_PATCHES) {
        if (joined.includes(patch)) offenders.push(`${name}/${patch}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  test("archetypeName is deterministic per seed", () => {
    expect(archetypeName(7)).toBe(archetypeName(7));
    expect(ARCHETYPE_NAMES).toContain(archetypeName(7));
  });
});
