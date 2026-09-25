/** Shared prelude for the Strudel host and the offline renderer.
 *
 * These two processes are intentionally separate (in-process capture raced the
 * live scheduler and rendered silence), but they must agree on everything else:
 * which sample banks exist, what may write to stdout, which DOM globals exist,
 * and how master volume scales an event. One copy lives here; both import it.
 */

// Banks the palette names directly. Prebaking registers the sample URLs at
// boot (cheap — the audio still loads lazily), so a set can use them without
// its own `samples(...)` call, and the capture renderer does not have to
// fetch them mid-render.
export const SAMPLE_MAPS = [
  "https://raw.githubusercontent.com/felixroos/dough-samples/main/tidal-drum-machines.json",
  "https://raw.githubusercontent.com/felixroos/dough-samples/main/vcsl.json",
  "https://raw.githubusercontent.com/felixroos/dough-samples/main/piano.json",
  "github:yaxu/clean-breaks",
  "github:Bubobubobubobubo/Dough-Amen",
  "github:eddyflux/crate",
];

/** Silence `console.*` so library chatter never touches stdout (the JSON
 * protocol). Warnings and errors are routed to the caller's handler. */
export function silenceConsole(
  route: (level: "warn" | "error", text: string) => void,
): void {
  const quiet = () => {};
  console.log = quiet;
  console.info = quiet;
  console.debug = quiet;
  console.warn = (...a: unknown[]) => route("warn", a.map(String).join(" "));
  console.error = (...a: unknown[]) => route("error", a.map(String).join(" "));
}

/** The few DOM globals Strudel's draw/scope modules touch at import time. */
export function installDomShims(): void {
  const g = globalThis as any;
  const noop = () => {};
  g.document ??= {
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => true,
    createElement: () => ({ style: {}, getContext: () => null, appendChild: noop, click: noop }),
    createElementNS: () => ({ style: {}, appendChild: noop }),
    body: { appendChild: noop, removeChild: noop },
    documentElement: { style: {} },
  };
  g.CustomEvent ??= class CustomEvent {
    type: string;
    detail: unknown;
    constructor(type: string, opts?: { detail?: unknown }) {
      this.type = type;
      this.detail = opts?.detail;
    }
  };
  g.navigator ??= { userAgent: "bun" };
  if (g.window) {
    g.window.addEventListener ??= noop;
    g.window.removeEventListener ??= noop;
    g.window.dispatchEvent ??= () => true;
  }
  g.requestAnimationFrame ??= (fn: (t: number) => void) => setTimeout(() => fn(Date.now()), 16);
  g.cancelAnimationFrame ??= (id: number) => clearTimeout(id);
}

/** Scale one event's gain in place.
 *
 * `hap.value` is the control object superdough reads directly — not a plain
 * record — so it must be mutated rather than spread into a copy. A string or
 * signal gain cannot be scaled without evaluating it, so it is left alone.
 */
export function scaleEventGain(value: any, master: number): void {
  if (master >= 1 || !value || typeof value !== "object") return;
  const g = value.gain;
  if (g == null) value.gain = master;
  else if (typeof g === "number") value.gain = g * master;
}
