import { afterEach, describe, expect, test } from "bun:test";
import { SAMPLE_MAPS, scaleEventGain, silenceConsole } from "../prelude";

const realLog = console.log;
const realInfo = console.info;
const realDebug = console.debug;
const realWarn = console.warn;
const realError = console.error;

afterEach(() => {
  console.log = realLog;
  console.info = realInfo;
  console.debug = realDebug;
  console.warn = realWarn;
  console.error = realError;
});

describe("strudel prelude", () => {
  test("sample maps cover the palette banks", () => {
    expect(SAMPLE_MAPS.length).toBe(6);
    for (const bank of ["clean-breaks", "Dough-Amen", "eddyflux/crate"]) {
      expect(SAMPLE_MAPS.some((m) => m.includes(bank)), bank).toBe(true);
    }
  });

  test("scaleEventGain mutates in place and leaves master>=1 alone", () => {
    const v: Record<string, unknown> = { gain: 0.8 };
    scaleEventGain(v, 1);
    expect(v.gain).toBe(0.8);
    scaleEventGain(v, 0.5);
    expect(v.gain).toBeCloseTo(0.4, 9);
  });

  test("scaleEventGain sets a missing gain to the master level", () => {
    const v: Record<string, unknown> = {};
    scaleEventGain(v, 0.5);
    expect(v.gain).toBe(0.5);
  });

  test("scaleEventGain leaves string gains alone", () => {
    const v: Record<string, unknown> = { gain: "0.5" };
    scaleEventGain(v, 0.5);
    expect(v.gain).toBe("0.5");
  });

  test("silenceConsole swallows logs and routes warnings", () => {
    const routed: string[] = [];
    silenceConsole((level, text) => routed.push(`${level}:${text}`));
    console.log("hello");
    console.info("hello");
    console.debug("hello");
    expect(routed).toEqual([]);
    console.warn("w");
    console.error("e");
    expect(routed).toEqual(["warn:w", "error:e"]);
  });
});
