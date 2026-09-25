/** LLM client with two providers.
 *
 * - "go":  opencode Zen subscription (https://opencode.ai/zen/go/v1). Needs
 *          OPENCODE_API_KEY. The model hears audio via input_audio parts.
 * - "local": a llama.cpp server (default http://127.0.0.1:8080/v1). No key.
 *
 * Frugality rules baked in here (they are the subscription budget):
 * - The system prompt is byte-identical every call (instructions + reference),
 *   so it is fully prompt-cached. Everything variable goes in the user message.
 * - The evolve call asks for ONE layer patch, not the whole script.
 *
 * Ported from ai_dj/llm.py. The server has no audio of its own, so audio is an
 * optional base64 part instead of an ffmpeg pipeline.
 */

import { existsSync, readFileSync } from "node:fs";
import { asMarkdown } from "./palette";

export const ZEN_GO_BASE = "https://opencode.ai/zen/go/v1";
export const LOCAL_BASE_DEFAULT =
  process.env.LLAMA_BASE_URL ?? "http://127.0.0.1:8080/v1";
export const DEFAULT_MODEL = "mimo-v2.6-flash";
export const DEFAULT_LANG = "sonic_pi";
export const LANGS = ["sonic_pi", "strudel"] as const;
export type Lang = (typeof LANGS)[number];

const EVOLVE: Record<string, string> = {
  sonic_pi: `You are the live-coding engine of a generative radio DJ.
You evolve ONE layer of a Sonic Pi live set at a time, smoothly and gradually.

Given: the session state, the layer to change, the direction to take, that
layer's current code (if any), a 10s audio sample, and optional user feedback.

Return ONLY valid JSON, no markdown:
{
  "hearing": {"tempo_bpm": 0, "key": "", "chords": [], "energy": "", "mood": "", "structure": ""},
  "decision": {"action": "", "why": ""},
  "op": {"kind": "add|modify|remove", "layer": "<the given layer>"},
  "ruby": "<ONE live_loop for that layer, with # why comments>"
}

HARD RULES:
- Change ONLY the given layer. Never touch other layers.
- Do NOT set use_bpm; the session tempo is fixed.
- Keep the session key and mode; stay in the current vibe.
- This is one incremental step, not a new song.
- "ruby" must be a single valid Sonic Pi live_loop.
- Precede each musical choice with a "# why" comment.
- No text outside the JSON.

# Sonic Pi Reference
`,
  strudel: `You are the live-coding engine of a generative radio DJ.
You evolve ONE layer of a Strudel live set at a time, smoothly and gradually.

Given: the session state, the layer to change, the direction to take, that
layer's current pattern (if any), a 10s audio sample, and optional user feedback.

Return ONLY valid JSON, no markdown:
{
  "hearing": {"tempo_bpm": 0, "key": "", "chords": [], "energy": "", "mood": "", "structure": ""},
  "decision": {"action": "", "why": ""},
  "op": {"kind": "add|modify|remove", "layer": "<the given layer>"},
  "ruby": "<ONE Strudel pattern expression for that layer>"
}

HARD RULES:
- Change ONLY the given layer. Never touch other layers.
- Do NOT call setcpm/setcps; the session tempo is fixed.
- Keep the session key and mode; stay in the current vibe.
- This is one incremental step, not a new song.
- "ruby" must be a single Strudel pattern expression: no stack(), no $: labels.
- Choose timbres only from the instrument palette.
- Precede each musical choice with a "// why" comment.
- No text outside the JSON.

# Strudel Reference
`,
};

const SEED: Record<string, string> = {
  sonic_pi: `You are the live-coding engine of a generative radio DJ.
Create the FIRST script for a new live set, based on the vibe given.

Return ONLY valid JSON, no markdown:
{
  "hearing": {"tempo_bpm": 0, "key": "", "chords": [], "energy": "", "mood": "", "structure": ""},
  "decision": {"action": "", "why": ""},
  "ruby": "<the complete playable script>"
}

HARD RULES:
- Set one use_bpm at the top and keep it for the whole set.
- Build one live_loop per element (kick, bass, hats, pad, lead, FX) and sync them.
- Every musical choice gets a preceding "# why" comment.
- Valid Sonic Pi DSL only. No text outside the JSON.

# Sonic Pi Reference
`,
  strudel: `You are the live-coding engine of a generative radio DJ.
Create the FIRST set for a new live session, based on the vibe given.

Return ONLY valid JSON, no markdown:
{
  "hearing": {"tempo_bpm": 0, "key": "", "chords": [], "energy": "", "mood": "", "structure": ""},
  "decision": {"action": "", "why": ""},
  "ruby": "<the complete playable Strudel script>"
}

HARD RULES:
- Start with setcpm(<bpm>/4) and keep that tempo for the whole set.
- Build the set as ONE expression: stack(...) with one pattern per layer
  (kick, bass, hats, pad, lead, FX).
- Choose timbres only from the instrument palette.
- Every musical choice gets a preceding "// why" comment.
- Valid Strudel only. No $: labels. No text outside the JSON.

# Strudel Reference
`,
};

// Variant used when the session already has an identity (an archetype, or the
// set being replaced): the model composes inside that tempo/key/mode.
const SEED_ANCHORED: Record<string, string> = {
  sonic_pi: `You are the live-coding engine of a generative radio DJ.
Write the music for an EXISTING live set, based on the vibe given.

The session already has a fixed tempo, key and mode. Compose inside them.

Return ONLY valid JSON, no markdown:
{
  "hearing": {"tempo_bpm": 0, "key": "", "chords": [], "energy": "", "mood": "", "structure": ""},
  "decision": {"action": "", "why": ""},
  "ruby": "<the complete playable script>"
}

HARD RULES:
- Do NOT set use_bpm; keep the session's tempo.
- Keep the session's key and mode; stay in the current vibe.
- Build one live_loop per element (kick, bass, hats, pad, lead, FX) and sync them.
- Every musical choice gets a preceding "# why" comment.
- Valid Sonic Pi DSL only. No text outside the JSON.

# Sonic Pi Reference
`,
  strudel: `You are the live-coding engine of a generative radio DJ.
Write the music for an EXISTING set, based on the vibe given.

The session already has a fixed tempo, key and mode. Compose inside them.

Return ONLY valid JSON, no markdown:
{
  "hearing": {"tempo_bpm": 0, "key": "", "chords": [], "energy": "", "mood": "", "structure": ""},
  "decision": {"action": "", "why": ""},
  "ruby": "<the complete playable Strudel script>"
}

HARD RULES:
- Do NOT call setcpm; keep the session's tempo.
- Keep the session's key and mode; stay in the current vibe.
- Build the set as ONE expression: stack(...) with one pattern per layer
  (kick, bass, hats, pad, lead, FX).
- Choose timbres only from the instrument palette.
- Every musical choice gets a preceding "// why" comment.
- Valid Strudel only. No $: labels. No text outside the JSON.

# Strudel Reference
`,
};

export interface SystemPromptOptions {
  referenceText?: string;
  anchored?: boolean;
}

export function systemPrompt(
  kind: "evolve" | "seed",
  lang: string = DEFAULT_LANG,
  opts: SystemPromptOptions = {},
): string {
  const prompts = opts.anchored ? SEED_ANCHORED : kind === "evolve" ? EVOLVE : SEED;
  const base = prompts[lang] ?? prompts[DEFAULT_LANG];
  if (opts.referenceText == null) return base; // without the (large) reference
  let text = base + opts.referenceText;
  if (lang === "strudel") {
    // always append the current palette so the model cannot generate
    // instrument ids that render silence
    text += "\n\n# Current instrument palette\n" + asMarkdown();
  }
  return text;
}

export function loadEnvKey(envPath?: string | null): string {
  if (envPath) {
    try {
      if (existsSync(envPath)) {
        for (const line of readFileSync(envPath, "utf8").split("\n")) {
          const m = line.match(/export\s+OPENCODE_API_KEY\s*=\s*(.+)/);
          if (m) return m[1].trim().replace(/^["']|["']$/g, "");
        }
      }
    } catch { /* fall through to the environment */ }
  }
  return process.env.OPENCODE_API_KEY ?? "";
}

/** Tolerate leading prose; the model often chats before the JSON. Like the
 * decoder the Python client uses, parse one object and ignore trailing text.
 */
export function extractJson(text: string): Record<string, unknown> {
  const idx = text.indexOf("{");
  if (idx < 0) throw new Error(`no JSON in model reply: ${text.slice(0, 300)}`);
  const src = text.slice(idx);
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
    } else if (ch === '"') {
      inString = true;
    } else if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) return JSON.parse(src.slice(0, i + 1)) as Record<string, unknown>;
    }
  }
  throw new Error(`no complete JSON object in model reply: ${text.slice(0, 300)}`);
}

export type FetchFn = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

export interface CallOptions {
  provider?: string;
  baseUrl?: string;
  reasoning?: string;
  sessionId?: string;
  fetchFn?: FetchFn;
}

function resolveBaseUrl(provider: string, baseUrl?: string): string {
  if (baseUrl) return baseUrl;
  return provider === "local" ? LOCAL_BASE_DEFAULT : ZEN_GO_BASE;
}

async function postChat(
  provider: string,
  baseUrl: string | undefined,
  apiKey: string,
  body: Record<string, unknown>,
  opts: { sessionId?: string; fetchFn?: FetchFn } = {},
): Promise<Record<string, unknown>> {
  const url = `${resolveBaseUrl(provider, baseUrl).replace(/\/$/, "")}/chat/completions`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
  const sid = opts.sessionId ?? `ai-dj-${process.pid}`;
  if (sid) headers["x-opencode-session"] = sid;
  const run = opts.fetchFn ?? fetch;
  const res = await run(url, { method: "POST", headers, body: JSON.stringify(body) });
  const data = (await res.json()) as Record<string, unknown>;
  if ("error" in data) throw new Error(`API error: ${JSON.stringify(data["error"])}`);
  return data;
}

function parseCompletion(data: Record<string, unknown>, model: string): Record<string, unknown> {
  const choice = (data["choices"] as Array<Record<string, unknown>>)[0];
  const msg = choice["message"] as Record<string, unknown>;
  const content = msg["content"];
  if (!content || typeof content !== "string") {
    throw new Error(`model returned no content (finish=${choice["finish_reason"]})`);
  }
  const parsed = extractJson(content) as Record<string, unknown>;
  parsed["_usage"] = (data["usage"] as unknown) ?? {};
  parsed["_model"] = model;
  return parsed;
}

export interface EvolveOptions extends CallOptions {
  key: string;
  model?: string;
  stateContext?: string;
  layer?: string;
  direction?: string;
  layerCode?: string | null;
  feedback?: string | null;
  referenceText?: string;
  lang?: string;
  wholeSet?: boolean;
  audioBase64?: string | null;
}

export async function evolveLayer(opts: EvolveOptions): Promise<Record<string, unknown>> {
  const {
    key, model = DEFAULT_MODEL, stateContext = "", layer = "", direction = "",
    layerCode = null, feedback = null, provider = "go", baseUrl,
    referenceText, reasoning = "none", lang = DEFAULT_LANG, wholeSet = false,
    audioBase64 = null,
  } = opts;

  let system: string;
  let lines: string[];
  if (wholeSet) {
    system = systemPrompt("seed", lang, { referenceText, anchored: true });
    lines = [
      `Session state: ${stateContext}`,
      `Evolve the whole set — direction: ${direction}.`,
      "The set is ONE script. Change it in that direction and return the "
      + "complete updated script, keeping everything you are not changing "
      + "(including any samples()/setcps() lines and the overall structure).",
      `Current script:\n\`\`\`\n${layerCode ?? ""}\n\`\`\``,
    ];
    if (feedback) lines.push(`User feedback (act on it): ${feedback}`);
    lines.push("Here is a 10s sample of the current output.");
  } else {
    system = systemPrompt("evolve", lang, { referenceText });
    lines = [
      `Session state: ${stateContext}`,
      `Change layer: ${layer}`,
      `Direction: ${direction}`,
    ];
    lines.push(layerCode
      ? `Current code for '${layer}':\n\`\`\`ruby\n${layerCode}\n\`\`\``
      : `Current code for '${layer}': none yet — create it.`);
    if (feedback) lines.push(`User feedback (act on it): ${feedback}`);
    lines.push("Here is a 10s sample of the current output.");
  }

  const userContent: unknown = audioBase64
    ? [
      { type: "text", text: lines.join("\n\n") },
      { type: "input_audio", input_audio: { data: audioBase64, format: "mp3" } },
    ]
    : lines.join("\n\n");

  const body = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userContent },
    ],
    max_tokens: 8000,
    temperature: 0.8,
    reasoning_effort: reasoning,
  };
  const sid = opts.sessionId ?? `ai-dj-${process.pid}`;
  try {
    const data = await postChat(provider, baseUrl, key, body,
      { sessionId: sid, fetchFn: opts.fetchFn });
    return parseCompletion(data, model);
  } catch (e) {
    if (provider !== "local" || !layerCode) throw e;
    const fallback = {
      ...body,
      messages: [
        body.messages[0],
        {
          role: "user",
          content:
            `Your model cannot hear audio. Evolve layer '${layer}' ` +
            `(${direction}) of this set.\n\n\`\`\`ruby\n${layerCode}\n\`\`\``,
        },
      ],
    };
    const data = await postChat(provider, baseUrl, key, fallback,
      { sessionId: sid, fetchFn: opts.fetchFn });
    return parseCompletion(data, model);
  }
}

export interface SeedOptions extends CallOptions {
  prompt: string;
  key: string;
  model?: string;
  referenceText?: string;
  lang?: string;
  session?: { bpm: number; key: string; mode: string } | null;
}

/** Write the music for a vibe prompt.
 *
 * session: an optional {bpm, key, mode} identity to compose inside (an
 * archetype the session was cast from). Without it the model chooses freely.
 */
export async function seedScript(opts: SeedOptions): Promise<Record<string, unknown>> {
  const {
    prompt, key, model = DEFAULT_MODEL, sessionId, provider = "go", baseUrl,
    referenceText, reasoning = "none", lang = DEFAULT_LANG, session = null,
  } = opts;
  const anchored = Boolean(session);
  const system = systemPrompt("seed", lang, { referenceText, anchored });
  let user = `Write the music for a live set with this vibe: "${prompt}".`;
  if (anchored && session) {
    user += `\n\nSession identity (compose inside it): ${session.bpm}bpm, ` +
      `key ${session.key}, ${session.mode}.`;
  }
  const body = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    max_tokens: 16000,
    temperature: 0.8,
    reasoning_effort: reasoning,
  };
  const data = await postChat(provider, baseUrl, key, body,
    { sessionId, fetchFn: opts.fetchFn });
  return parseCompletion(data, model);
}
