import { describe, expect, test } from "bun:test";
import {
  SONIC_PI,
  STRUDEL,
  allInstruments,
  describe as describePalette,
  families,
  forBackend,
  isSupported,
  names,
  realisation,
  resolve,
} from "../src/palette";

describe("palette", () => {
  test("names are unique", () => {
    const all = names();
    expect(new Set(all).size).toBe(all.length);
  });

  test("every instrument has a realisation and a known family", () => {
    for (const ins of allInstruments()) {
      expect(Object.keys(ins.realisations).length > 0, `${ins.name} has no backend`).toBe(true);
      expect(families()).toContain(ins.family);
    }
  });

  test("strudel supports classical instruments", () => {
    const strudel = names(STRUDEL);
    for (const name of ["violin", "cello", "flute", "trumpet", "piano", "timpani"]) {
      expect(strudel).toContain(name);
    }
    // classical voices are sampled (GM soundfont or a real recorded library)
    expect(realisation("violin", STRUDEL)).toBe("gm_violin");
    expect(realisation("timpani", STRUDEL)).toBe("timpani");
  });

  test("prefers recorded instruments over soundfonts", () => {
    // VCSL and the piano/drum-machine packs sound better than GM, so the
    // headline instruments from those families must not be GM soundfonts.
    for (const name of ["piano", "grand_piano", "harp", "timpani", "vibraphone",
      "marimba", "kick", "snare", "hat", "shaker"]) {
      expect(realisation(name, STRUDEL).startsWith("gm_")).toBe(false);
    }
  });

  test("sonic_pi does not support classical", () => {
    const sonic = names(SONIC_PI);
    expect(sonic).not.toContain("violin");
    expect(isSupported("violin", SONIC_PI)).toBe(false);
    // but the electronic core is there
    expect(sonic).toContain("kick");
    expect(sonic).toContain("acid_bass");
  });

  test("forBackend filters", () => {
    // every backend the sonic side can play, strudel can play too
    for (const n of names(SONIC_PI)) expect(names(STRUDEL)).toContain(n);
    expect(names(STRUDEL).length).toBeGreaterThan(names(SONIC_PI).length);
  });

  test("resolve and realisation", () => {
    const ins = resolve("kick");
    expect(ins.family).toBe("drums");
    expect(realisation("kick", SONIC_PI)).toBe(":bd_haus");
    expect(realisation("kick", STRUDEL)).toBe("RolandTR909_bd");
    expect(() => resolve("nope")).toThrow();
    expect(() => realisation("violin", SONIC_PI)).toThrow();
  });

  test("describe lists only supported", () => {
    const text = describePalette(SONIC_PI);
    expect(text).toContain("drums:");
    expect(text).not.toContain("violin");
    expect(describePalette(STRUDEL)).toContain("violin");
  });

  test("forBackend returns instrument objects", () => {
    expect(forBackend(STRUDEL).length).toBeGreaterThan(0);
    for (const ins of forBackend(SONIC_PI)) {
      expect(ins.realisations[SONIC_PI]).toBeDefined();
    }
  });
});
