/** Session storage.
 *
 * A session is a directory of versioned scripts; the decision rationale lives in
 * comments inside the scripts. The filename encodes the version.
 *
 * Ported from ai_dj/session.py — same layout, same guarantees.
 */

import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  readdirSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join } from "node:path";

export let baseDir: string =
  process.env.AI_DJ_SESSIONS ??
  join(dirname(import.meta.dir), "..", "sessions");

/** Override the session root (tests). */
export function setBaseDir(dir: string): void {
  baseDir = dir;
}

// Enough history to resume or diagnose, bounded so a day-long run cannot fill
// the disk. At ~1 save/30s that is a few hours of scrollback.
export const KEEP_VERSIONS = 200;

const EXT: Record<string, string> = { sonic_pi: "rb", strudel: "mjs" };
export const META = "meta.json";

export interface SeedInfo {
  seed?: unknown;
  bpm?: number;
  key?: string;
  mode?: string;
  scale?: string;
  archetype?: string;
}

export interface SessionEntry {
  id: string;
  path: string;
  latest: string | null;
  name: string;
  favorite: boolean;
  created: number;
}

function slug(seedInfo: SeedInfo): string {
  // seed may be model text; keep it to a safe filename fragment
  const seed = String(seedInfo.seed ?? "").replace(/[^A-Za-z0-9_-]+/g, "-").slice(0, 24);
  return `${Math.floor(Date.now() / 1000)}-${seed}-b${seedInfo.bpm}`;
}

function versionOf(name: string): number {
  // any number of digits: a day-long run can exceed 9999 versions
  const m = name.match(/^(\d+)\.(?:rb|mjs)$/);
  return m ? parseInt(m[1], 10) : 0;
}

export function createSession(seedInfo: SeedInfo = {}): string {
  const name = slug(seedInfo);
  const path = join(baseDir, name);
  mkdirSync(path, { recursive: true });
  saveMeta(path, {
    bpm: seedInfo.bpm,
    key: seedInfo.key,
    mode: seedInfo.mode ?? seedInfo.scale,
    archetype: seedInfo.archetype,
    created: Date.now() / 1000,
  });
  return path;
}

function nextVersion(sessionPath: string): number {
  // Next version number, read from the symlinks rather than a dir scan.
  let best = 0;
  for (const ext of ["rb", "mjs"]) {
    const last = join(sessionPath, `last.${ext}`);
    try {
      if (lstatSync(last).isSymbolicLink()) {
        best = Math.max(best, versionOf(readlinkSync(last)));
      }
    } catch { /* absent */ }
  }
  return best + 1;
}

/** Drop old versions, keeping the newest `keep` per extension. */
export function prune(sessionPath: string, keep: number = KEEP_VERSIONS): void {
  // prune per extension: last.<ext> always points at the newest file of that
  // extension, so pruning the oldest of each extension can never delete the
  // file a symlink still targets
  for (const ext of Object.values(EXT)) {
    const files = readdirSync(sessionPath)
      .filter((f) => versionOf(f) > 0 && f.endsWith(`.${ext}`))
      .sort((a, b) => versionOf(a) - versionOf(b));
    if (files.length <= keep) continue;
    for (const old of files.slice(0, files.length - keep)) {
      try {
        unlinkSync(join(sessionPath, old));
      } catch { /* already gone */ }
    }
  }
}

export function saveScript(sessionPath: string, script: string, lang = "sonic_pi"): string {
  const ext = EXT[lang] ?? "rb";
  const nxt = nextVersion(sessionPath);
  const name = `${String(nxt).padStart(4, "0")}.${ext}`;
  writeFileSync(join(sessionPath, name), script);
  const last = join(sessionPath, `last.${ext}`);
  try {
    lstatSync(last);
    unlinkSync(last);
  } catch { /* absent */ }
  symlinkSync(name, last);
  prune(sessionPath);
  return name;
}

export function listSessions(): SessionEntry[] {
  if (!existsSync(baseDir) || !lstatSync(baseDir).isDirectory()) return [];
  const out: SessionEntry[] = [];
  for (const d of readdirSync(baseDir).sort()) {
    const p = join(baseDir, d);
    try {
      if (!lstatSync(p).isDirectory()) continue;
    } catch {
      continue;
    }
    let latest: string | null = null;
    for (const ext of ["rb", "mjs"]) {
      const last = join(p, `last.${ext}`);
      try {
        if (lstatSync(last).isSymbolicLink() && existsSync(join(p, readlinkSync(last)))) {
          latest = readlinkSync(last);
          break;
        }
      } catch { /* absent */ }
    }
    const meta = loadMeta(p);
    out.push({
      id: d,
      path: p,
      latest,
      name: meta.name,
      favorite: meta.favorite,
      created: createdOf(d),
    });
  }
  // newest first, favourites on top
  out.sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.created - a.created);
  return out;
}

function createdOf(name: string): number {
  // The unix timestamp the slug starts with, or 0.
  const m = (name ?? "").match(/^(\d{9,})-/);
  return m ? parseFloat(m[1]) : 0;
}

export function metaPath(sessionPath: string): string {
  return join(sessionPath, META);
}

export interface SessionMeta {
  name: string;
  favorite: boolean;
  [key: string]: unknown;
}

/** Metadata for a session dir. Never raises; missing means 'no name'. */
export function loadMeta(sessionPath: string): SessionMeta {
  let meta: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(readFileSync(metaPath(sessionPath), "utf8"));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      meta = parsed as Record<string, unknown>;
    }
  } catch { /* absent or corrupt */ }
  return {
    ...meta,
    name: typeof meta.name === "string" ? meta.name : "",
    favorite: Boolean(meta.favorite),
  };
}

/** Merge fields into a session's metadata. Ignores null/undefined (no
 * accidental clears) and never raises — losing a name is not worth crashing
 * a run. */
export function saveMeta(sessionPath: string, fields: Record<string, unknown>): SessionMeta {
  const meta = loadMeta(sessionPath);
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined && v !== null) meta[k] = v;
  }
  try {
    writeFileSync(metaPath(sessionPath), JSON.stringify(meta, null, 2));
  } catch { /* unwritable */ }
  return meta;
}

/** The beginning of a session's latest script, for the browser. */
export function preview(sessionPath: string, limit = 2000): string {
  try {
    const [, script] = loadLatest(basename(sessionPath));
    return script.slice(0, limit);
  } catch {
    return "";
  }
}

export function loadLatest(sessionId: string): [string, string] {
  const d = join(baseDir, sessionId);
  for (const ext of ["rb", "mjs"]) {
    const p = join(d, `last.${ext}`);
    try {
      if (lstatSync(p).isSymbolicLink() && existsSync(join(d, readlinkSync(p)))) {
        const target = readlinkSync(p);
        return [target, readFileSync(join(d, target), "utf8")];
      }
    } catch { /* absent */ }
  }
  throw new Error(`no session ${sessionId}`);
}
