import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  DEFAULT_MODEL,
  evolveLayer,
  extractJson,
  loadEnvKey,
  seedScript,
  systemPrompt,
} from "../src/llm";

const COMPLETION = {
  choices: [{
    message: {
      content: JSON.stringify({
        hearing: { mood: "dark" },
        decision: { action: "added hats", why: "energy" },
        op: { kind: "modify", layer: "hats" },
        ruby: 's("hh*8")',
      }),
      finish_reason: "stop",
    },
  }],
  usage: { prompt_tokens: 10 },
};

interface Captured {
  url: string;
  init: { headers: Record<string, string>; body: string };
}

function stubFetch(captured: Captured[], failTimes = 0) {
  let calls = 0;
  return async (url: string, init: { headers: Record<string, string>; body: string }) => {
    calls++;
    captured.push({ url, init });
    if (calls <= failTimes) throw new Error("network down");
    return { ok: true, json: async () => COMPLETION };
  };
}

const BASE = {
  key: "k",
  model: DEFAULT_MODEL,
  stateContext: "bpm=120 key=c mode=minor energy=0.5 section=build",
};

describe("llm prompts", () => {
  test("the system prompt is byte-stable across calls", async () => {
    // prompt caching only works if the system message never varies: everything
    // variable must live in the user message
    const a: Captured[] = [];
    const b: Captured[] = [];
    await evolveLayer({ ...BASE, layer: "hats", direction: "build", fetchFn: stubFetch(a) as never });
    await evolveLayer({ ...BASE, layer: "bass", direction: "reduce", fetchFn: stubFetch(b) as never });
    const sysA = JSON.parse(a[0].init.body).messages[0].content as string;
    const sysB = JSON.parse(b[0].init.body).messages[0].content as string;
    expect(sysA).toBe(sysB);
    expect(sysA.length).toBeGreaterThan(100);
  });

  test("lean mode omits the reference", () => {
    const ref = "# Strudel Reference\nSOME REFERENCE BODY";
    const lean = systemPrompt("seed", "strudel", {});
    const full = systemPrompt("seed", "strudel", { referenceText: ref });
    expect(full.length).toBeGreaterThan(lean.length);
    expect(lean).not.toContain("SOME REFERENCE BODY");
    expect(full).toContain("SOME REFERENCE BODY");
  });

  test("the strudel prompt appends the live palette", () => {
    const text = systemPrompt("evolve", "strudel", { referenceText: "# ref" });
    expect(text).toContain("# Current instrument palette");
    expect(text).toContain("| break_amen |");
  });

  test("evolve body shape", async () => {
    const captured: Captured[] = [];
    await evolveLayer({
      ...BASE, layer: "hats", direction: "build",
      layerCode: 's("hh")', feedback: "more",
      audioBase64: "AAAA",
      fetchFn: stubFetch(captured) as never,
    });
    const body = JSON.parse(captured[0].init.body);
    expect(body.model).toBe(DEFAULT_MODEL);
    expect(body.max_tokens).toBe(8000);
    expect(body.temperature).toBe(0.8);
    expect(body.reasoning_effort).toBe("none");
    const user = body.messages[1].content;
    expect(JSON.stringify(user)).toContain("hats");
    expect(JSON.stringify(user)).toContain("build");
    expect(JSON.stringify(user)).toContain("more");
    expect(JSON.stringify(user)).toContain("input_audio");
    expect(captured[0].url).toContain("/chat/completions");
    expect(captured[0].init.headers["Authorization"]).toBe("Bearer k");
  });

  test("evolve without audio is text-only", async () => {
    const captured: Captured[] = [];
    await evolveLayer({ ...BASE, layer: "hats", direction: "build", fetchFn: stubFetch(captured) as never });
    const body = JSON.parse(captured[0].init.body);
    expect(typeof body.messages[1].content).toBe("string");
    expect(body.messages[1].content).not.toContain("input_audio");
  });

  test("whole-set evolve asks for a complete script", async () => {
    const captured: Captured[] = [];
    await evolveLayer({
      ...BASE, layer: "set", direction: "vary", lang: "strudel",
      layerCode: "stack(s('bd'))", wholeSet: true,
      fetchFn: stubFetch(captured) as never,
    });
    const body = JSON.parse(captured[0].init.body);
    expect(body.messages[0].content).toContain("EXISTING set");
    expect(body.messages[1].content).toContain("complete updated script");
  });

  test("seed anchors the session identity", async () => {
    const captured: Captured[] = [];
    await seedScript({
      prompt: "dark", key: "k", lang: "strudel",
      session: { bpm: 120, key: "c", mode: "minor" },
      fetchFn: stubFetch(captured) as never,
    });
    const body = JSON.parse(captured[0].init.body);
    expect(body.max_tokens).toBe(16000);
    expect(body.messages[1].content).toContain("120bpm");
    expect(body.messages[0].content).toContain("EXISTING set");
  });

  test("parsed result carries the patch plus usage", async () => {
    const captured: Captured[] = [];
    const out = await evolveLayer({
      ...BASE, layer: "hats", direction: "build", fetchFn: stubFetch(captured) as never,
    }) as Record<string, unknown>;
    expect(out["ruby"]).toContain("hh");
    expect((out["decision"] as { action: string }).action).toBe("added hats");
    expect((out["_usage"] as { prompt_tokens: number }).prompt_tokens).toBe(10);
    expect(out["_model"]).toBe(DEFAULT_MODEL);
  });

  test("local audio failure retries text-only", async () => {
    const captured: Captured[] = [];
    await evolveLayer({
      ...BASE, layer: "hats", direction: "build", layerCode: 's("hh")',
      provider: "local", fetchFn: stubFetch(captured, 1) as never,
    });
    expect(captured).toHaveLength(2);
    const retry = JSON.parse(captured[1].init.body);
    expect(typeof retry.messages[1].content).toBe("string");
    expect(retry.messages[1].content).toContain("cannot hear audio");
  });
});

describe("llm parsing and keys", () => {
  test("extractJson tolerates leading prose", () => {
    const out = extractJson('here you go:\n{"ruby": "x", "op": {}} trailing');
    expect(out["ruby"]).toBe("x");
  });

  test("extractJson without JSON throws", () => {
    expect(() => extractJson("no braces here")).toThrow();
  });

  test("loadEnvKey reads an export line and strips quotes", () => {
    const dir = mkdtempSync(join(tmpdir(), "aidj-env-"));
    try {
      const f = join(dir, "env");
      writeFileSync(f, '# comment\nexport OPENCODE_API_KEY="sk-live"\n');
      expect(loadEnvKey(f)).toBe("sk-live");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("loadEnvKey falls back to the environment", () => {
    const prev = process.env.OPENCODE_API_KEY;
    process.env.OPENCODE_API_KEY = "sk-env";
    try {
      expect(loadEnvKey("/does/not/exist")).toBe("sk-env");
    } finally {
      if (prev === undefined) delete process.env.OPENCODE_API_KEY;
      else process.env.OPENCODE_API_KEY = prev;
    }
  });
});
