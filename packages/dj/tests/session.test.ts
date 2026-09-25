import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import {
  baseDir,
  createSession,
  listSessions,
  loadLatest,
  loadMeta,
  metaPath,
  preview,
  prune,
  saveMeta,
  saveScript,
  setBaseDir,
} from "../src/session";

let dir = "";
let savedBase = "";

beforeEach(() => {
  savedBase = baseDir;
  dir = mkdtempSync(join(tmpdir(), "aidj-test-"));
  setBaseDir(dir);
});

afterEach(() => {
  setBaseDir(savedBase);
  rmSync(dir, { recursive: true, force: true });
});

describe("session storage", () => {
  test("versions increment and last points at newest", () => {
    const path = createSession({ seed: 1, bpm: 90 });
    expect(saveScript(path, "script 1")).toBe("0001.rb");
    expect(saveScript(path, "script 2")).toBe("0002.rb");
    expect(saveScript(path, "script 3")).toBe("0003.rb");
    const [ver, text] = loadLatest(basename(path));
    expect(ver).toBe("0003.rb");
    expect(text).toBe("script 3");
  });

  test("old versions are pruned", () => {
    const path = createSession({ seed: 1, bpm: 90 });
    for (let i = 0; i < 5; i++) saveScript(path, `v${i}`);
    prune(path, 2);
    const [ver] = loadLatest(basename(path));
    expect(ver).toBe("0005.rb");
  });

  test("pruning never orphans a symlink", () => {
    const path = createSession({ seed: 1, bpm: 90 });
    for (let i = 0; i < 5; i++) saveScript(path, `v${i}`);
    prune(path, 2);
    // last.rb still resolves to an existing file
    const [ver, text] = loadLatest(basename(path));
    expect(ver).toBe("0005.rb");
    expect(text).toBe("v4");
  });

  test("slug is safe for model text", () => {
    const path = createSession({ seed: "../../etc/passwd", bpm: 90 });
    const base = basename(path);
    expect(base).not.toContain("..");
    expect(base).not.toContain("/");
  });

  test("list sessions reports latest", () => {
    const path = createSession({ seed: 1, bpm: 90 });
    saveScript(path, "one");
    saveScript(path, "two");
    const entries = listSessions();
    expect(entries).toHaveLength(1);
    expect(entries[0].latest).toBe("0002.rb");
  });

  test("mixed extensions share one version sequence", () => {
    const path = createSession({ seed: 1, bpm: 90 });
    expect(saveScript(path, "ruby", "sonic_pi")).toBe("0001.rb");
    expect(saveScript(path, "js", "strudel")).toBe("0002.mjs");
    expect(saveScript(path, "ruby2", "sonic_pi")).toBe("0003.rb");
  });

  test("strudel sessions use mjs", () => {
    const path = createSession({ seed: 1, bpm: 120 });
    expect(saveScript(path, "stack()", "strudel")).toBe("0001.mjs");
  });

  test("versions beyond 9999 still increment", () => {
    const path = createSession({ seed: 1, bpm: 90 });
    writeFileSync(join(path, "10000.rb"), "big");
    try { unlinkSync(join(path, "last.rb")); } catch { /* absent */ }
    symlinkSync("10000.rb", join(path, "last.rb"));
    expect(saveScript(path, "next")).toBe("10001.rb");
  });

  test("loading a missing session throws", () => {
    expect(() => loadLatest("nope")).toThrow();
  });
});

describe("session metadata", () => {
  function entryFor(path: string) {
    const found = listSessions().find((e) => e.id === basename(path));
    if (!found) throw new Error(`session missing: ${path}`);
    return found;
  }

  test("name and favourite round-trip", () => {
    const path = createSession({ seed: "night", bpm: 92 });
    saveMeta(path, { name: "Night ride", favorite: true });
    const entry = entryFor(path);
    expect(entry.name).toBe("Night ride");
    expect(entry.favorite).toBe(true);
  });

  test("a session without meta still lists", () => {
    const path = createSession({ seed: "old", bpm: 90 });
    unlinkSync(metaPath(path));
    const entry = entryFor(path);
    expect(entry.name).toBe("");
    expect(entry.favorite).toBe(false);
  });

  test("favourites sort first", () => {
    const oldPath = createSession({ seed: "a", bpm: 90 });
    const newPath = createSession({ seed: "b", bpm: 91 });
    saveMeta(oldPath, { favorite: true });
    const rows = listSessions();
    expect(rows[0].id).toBe(basename(oldPath));
    expect(rows[1].id).toBe(basename(newPath));
  });

  test("created is read from the slug", () => {
    const path = createSession({ seed: "x", bpm: 90 });
    expect(entryFor(path).created).toBeGreaterThan(0);
  });

  test("preview is the latest script", () => {
    const path = createSession({ seed: "x", bpm: 90 });
    saveScript(path, "stack(s('bd'))\n", "strudel");
    expect(preview(path)).toContain("stack");
  });

  test("corrupt meta is ignored", () => {
    const path = createSession({ seed: "x", bpm: 90 });
    writeFileSync(metaPath(path), "{not json");
    expect(entryFor(path).name).toBe("");
  });

  test("load_meta never raises", () => {
    expect(loadMeta("/does/not/exist").name).toBe("");
  });

  test("saving null does not clear", () => {
    const path = createSession({ seed: "x", bpm: 90 });
    saveMeta(path, { name: "kept" });
    saveMeta(path, { name: null, favorite: null });
    expect(loadMeta(path).name).toBe("kept");
  });
});
