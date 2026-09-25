import { describe, expect, test } from "bun:test";
import { DJState, WHOLE_LAYER, parseLayers } from "../src/state";

const PASTED =
  "// \"Night ride\"\n" +
  "samples('github:eddyflux/crate')\n" +
  "setcps(.75)\n" +
  "stack(\n" +
  "  s(\"bd\").bank('crate'),\n" +
  "  note(\"c3 e3\").s(\"gm_epiano1\")\n" +
  ")\n";

function oldLayers() {
  return {
    kick: 's("RolandTR909_bd")',
    bass: 'note("c2").s("sawtooth")',
  };
}

describe("state render and parse", () => {
  test("strudel render and parse round-trips", () => {
    const state = new DJState({
      bpm: 120, key: "c", mode: "minor", lang: "strudel", layers: oldLayers(),
    });
    const script = state.render();
    expect(script).toContain("setcpm(");
    expect(script).toContain("stack(");
    const back = DJState.fromScript(script, "", "strudel");
    expect(new Set(Object.keys(back.layers))).toEqual(new Set(["kick", "bass"]));
    expect(back.bpm).toBe(120);
    expect(back.key).toBe("c");
  });

  test("parsed layers are single expressions", () => {
    const state = new DJState({
      bpm: 100, key: "d", mode: "dorian", lang: "strudel",
      layers: {
        a: 'note("c3").s("sawtooth")',
        b: 's("bd*4").gain(0.9)',
      },
    });
    const back = DJState.fromScript(state.render(), "", "strudel");
    for (const code of Object.values(back.layers)) {
      expect(code.endsWith(",")).toBe(false);
      expect(code).not.toContain("// layer:");
    }
  });

  test("sonic_pi render is unchanged", () => {
    const state = new DJState({
      bpm: 90, key: "a", mode: "minor",
      layers: { kick: "live_loop :kick do\n  play 60\nend" },
    });
    const script = state.render();
    expect(script).toContain("use_bpm");
    expect(script).toContain("live_loop :kick");
  });

  test("sonic parse splits live_loop blocks", () => {
    const layers = parseLayers(
      "use_bpm 90\n\nlive_loop :kick do\n  play 60\nend\n\nlive_loop :hats do\n  play 70\nend",
    );
    expect(new Set(Object.keys(layers))).toEqual(new Set(["kick", "hats"]));
  });

  test("single layer does not swallow the closing paren", () => {
    const back = DJState.fromScript(
      'stack(\n  // layer: harp\n  n("0 4").s("gm_harp")\n)\n', "", "strudel");
    expect(Object.keys(back.layers)).toEqual(["harp"]);
    expect(back.layers["harp"]).toBe('n("0 4").s("gm_harp")');
  });

  test("multi layer round trip keeps bodies intact", () => {
    const state = new DJState({
      bpm: 110, key: "g", mode: "minor", lang: "strudel", layers: oldLayers(),
    });
    const back = DJState.fromScript(state.render(), "", "strudel");
    expect(new Set(Object.keys(back.layers))).toEqual(new Set(["kick", "bass"]));
    for (const code of Object.values(back.layers)) {
      expect(code).not.toContain("\n)");
    }
  });

  test("header round-trips identity", () => {
    const state = new DJState({
      bpm: 128, key: "f#", mode: "dorian", lang: "strudel",
      layers: { kick: 's("bd")' }, energy: 0.62,
    });
    const back = DJState.fromScript(state.render(), "", "strudel");
    expect(back.bpm).toBe(128);
    expect(back.key).toBe("f#");
    expect(back.mode).toBe("dorian");
    expect(back.energy).toBeCloseTo(0.62, 6);
  });
});

describe("state variation", () => {
  test("bumps a sonic_pi kwarg", () => {
    const state = new DJState({
      bpm: 120, key: "a", mode: "minor",
      layers: { kick: "live_loop :kick do\n  play 60, amp: 0.5\nend" },
    });
    expect(state.variation()).toBe(true);
    expect(state.layers["kick"]).not.toBe(
      "live_loop :kick do\n  play 60, amp: 0.5\nend");
    expect(state.layers["kick"]).toContain("amp:");
  });

  test("bumps a strudel method param", () => {
    const state = new DJState({
      bpm: 120, key: "c", mode: "minor", lang: "strudel",
      layers: { piano: 'note("c3 e3").s("gm_piano").gain(0.4)' },
    });
    expect(state.variation()).toBe(true);
    expect(state.layers["piano"]).not.toBe(
      'note("c3 e3").s("gm_piano").gain(0.4)');
    expect(state.layers["piano"]).toContain(".gain(");
  });

  test("is a safe no-op when nothing matches", () => {
    const state = new DJState({
      bpm: 120, key: "c", mode: "minor", lang: "strudel",
      layers: { kick: 's("bd")' },
    });
    expect(state.variation()).toBe(false);
    expect(state.layers["kick"]).toBe('s("bd")');
  });
});

describe("state opaque sets", () => {
  test("a pasted script is kept verbatim", () => {
    const state = new DJState({
      bpm: 120, key: "c", mode: "minor", lang: "strudel", layers: oldLayers(),
    });
    state.setManual(PASTED);
    expect(state.opaque).toBe(true);
    expect(state.render()).toBe(PASTED);
  });

  test("a pasted script does not resurrect the old layers", () => {
    const state = new DJState({
      bpm: 120, key: "c", mode: "minor", lang: "strudel", layers: oldLayers(),
    });
    state.setManual(PASTED);
    expect(state.render()).not.toContain("RolandTR909_bd");
    expect(state.render()).not.toContain("sawtooth");
  });

  test("a script with markers stays layer-based", () => {
    const marked = 'stack(\n  // layer: kick\n  s("bd"),\n  // layer: bass\n  note("c2")\n)\n';
    const state = new DJState({
      bpm: 120, key: "c", mode: "minor", lang: "strudel", layers: { pad: "old" },
    });
    state.setManual(marked);
    expect(state.opaque).toBe(false);
    expect(new Set(Object.keys(state.layers))).toEqual(new Set(["kick", "bass"]));
  });

  test("an opaque set is planned as one piece", () => {
    const low = new DJState({
      bpm: 120, key: "c", mode: "minor", lang: "strudel",
      layers: { [WHOLE_LAYER]: PASTED }, opaque: true, energy: 0.0,
    });
    expect(low.planNext().layer).toBe(WHOLE_LAYER);
    expect(low.planNext().direction).toBe("build");
    const high = new DJState({
      bpm: 120, key: "c", mode: "minor", lang: "strudel",
      layers: { [WHOLE_LAYER]: PASTED }, opaque: true, energy: 1.0,
    });
    expect(high.planNext().layer).toBe(WHOLE_LAYER);
    expect(high.planNext().direction).toBe("reduce");
    const even = new DJState({
      bpm: 120, key: "c", mode: "minor", lang: "strudel",
      layers: { [WHOLE_LAYER]: PASTED }, opaque: true, energy: 0.3,
    });
    expect(even.planNext().layer).toBe(WHOLE_LAYER);
    expect(even.planNext().direction).toBe("vary");
  });

  test("evolving an opaque set replaces the whole script", () => {
    const state = new DJState({
      bpm: 120, key: "c", mode: "minor", lang: "strudel", layers: oldLayers(),
    });
    state.setManual(PASTED);
    // a model naming some other layer must still replace the whole set,
    // or render() would ignore the change
    state.applyOp({ op: { kind: "modify", layer: "kick" }, ruby: "stack(s('bd*4'))" });
    expect(state.render()).toBe("stack(s('bd*4'))");
  });

  test("resuming an opaque script is detected", () => {
    const state = DJState.fromScript(PASTED, "", "strudel");
    expect(state.opaque).toBe(true);
    expect(state.render()).toBe(PASTED);
  });
});

describe("state planning and patches", () => {
  test("planNext returns a layer from the set", () => {
    const state = new DJState({
      bpm: 120, key: "c", mode: "minor", lang: "strudel", layers: oldLayers(),
    });
    const plan = state.planNext();
    expect(plan.layer).not.toBeNull();
    expect(Object.keys(oldLayers())).toContain(plan.layer!);
    expect(["build", "reduce", "intensify", "vary"]).toContain(plan.direction);
  });

  test("applyOp modify replaces a layer", () => {
    const state = new DJState({
      bpm: 120, key: "c", mode: "minor", lang: "strudel", layers: oldLayers(),
    });
    state.applyOp({ op: { kind: "modify", layer: "kick" }, ruby: 's("bd*8")' });
    expect(state.layers["kick"]).toBe('s("bd*8")');
    expect(state.layers["bass"]).toBe('note("c2").s("sawtooth")');
  });

  test("applyOp remove drops a layer", () => {
    const state = new DJState({
      bpm: 120, key: "c", mode: "minor", lang: "strudel", layers: oldLayers(),
    });
    state.applyOp({ op: { kind: "remove", layer: "bass" }, ruby: "" });
    expect("bass" in state.layers).toBe(false);
    expect("kick" in state.layers).toBe(true);
  });

  test("sonic state defaults to sonic_pi", () => {
    const state = new DJState({
      bpm: 100, key: "a", mode: "minor", layers: { kick: "play 60" },
    });
    expect(state.lang).toBe("sonic_pi");
    expect(state.opaque).toBe(false);
  });
});
