// ai-dj TUI — shows the live set (editable), queues feedback.
import {
  BoxRenderable,
  TextRenderable,
  TextareaRenderable,
  createCliRenderer,
  createClipboard,
  createHostClipboard,
  createRendererClipboardAdapter,
} from "@opentui/core"

const URL = process.env.AI_DJ_URL ?? "http://127.0.0.1:8765"
const LOG_PATH = process.env.AI_DJ_LOG ?? ""

// The TUI owns the terminal, so anything it prints is invisible. Mirror errors
// to the run's log file (AI_DJ_LOG, set by the launcher) so a failed run can be
// debugged afterwards.
function logLine(tag: string, text: string) {
  if (!LOG_PATH || !text) return
  try {
    const stamp = new Date().toTimeString().slice(0, 8)
    const body = text
      .split("\n")
      .map((l) => `${stamp} ${tag} ${l}`)
      .join("\n")
    require("fs").appendFileSync(LOG_PATH, body + "\n")
  } catch {}
}

process.on("uncaughtException", (err) => {
  logLine("[tui:uncaught]", err?.stack ?? String(err))
  process.exit(1)
})
process.on("unhandledRejection", (reason) => {
  logLine("[tui:unhandled]", reason instanceof Error ? reason.stack ?? reason.message : String(reason))
})

// Minimal, audible starting point (Strudel — the default backend). The server
// replaces this on the first poll. Edit freely, then shift+enter to apply.
const DEFAULT_SCRIPT = `setcpm(90/4)

stack(
  s("bd*4").gain(0.85)
)`

const renderer = await createCliRenderer({
  exitOnCtrlC: false,
  exitSignals: [],
  backgroundColor: "#0d0f12",
})

const status = new TextRenderable(renderer, {
  id: "status",
  content: "ai-dj  connecting...",
  fg: "#8ad4ff",
  bg: "#12151a",
  height: 1,
  width: "100%",
  wrapMode: "none",
  overflow: "hidden",
})

const scriptArea = new TextareaRenderable(renderer, {
  id: "script",
  initialValue: DEFAULT_SCRIPT,
  wrapMode: "none",
  width: "100%",
  flexGrow: 1,
  textColor: "#d7e0ea",
  backgroundColor: "#0d0f12",
  focusedBackgroundColor: "#11151b",
  cursorColor: "#7CFFB2",
  keyBindings: [
    { name: "return", action: "newline" },
    { name: "return", shift: true, action: "submit" },
    { name: "return", meta: true, action: "submit" },
    { name: "return", ctrl: true, action: "submit" },
  ],
  onSubmit: () => applyScript(),
  onContentChange: () => {
    // Native content-change events are asynchronous, so they can arrive after
    // a programmatic write has already reset its guard. Compare against the
    // last synced script instead of trusting the event source.
    if (applying > 0 || animating) return
    dirty = scriptArea.plainText !== syncedScript
  },
})

// Sized to the panel (not full content height) so TextBuffer's own viewport
// clips lines at the source — native drawTextBuffer does not reliably honor
// ScrollBox scissor rects, which let log lines bleed over the feedback box.
const logView = new TextRenderable(renderer, {
  id: "log",
  content: "",
  fg: "#7f8b99",
  bg: "#0d0f12",
  width: "100%",
  flexGrow: 1,
  flexBasis: 0,
  minWidth: 0,
  wrapMode: "word",
})

const feedback = new TextareaRenderable(renderer, {
  id: "feedback",
  height: 1,
  width: "100%",
  flexGrow: 1,
  placeholder: "feedback: Enter = guide · Shift+Enter = replace the vibe",
  wrapMode: "none",
  backgroundColor: "#12151a",
  focusedBackgroundColor: "#1b2028",
  textColor: "#e6edf3",
  cursorColor: "#7CFFB2",
  keyBindings: [{ name: "return", action: "submit" }],
  onSubmit: () => {
    const value = feedback.plainText.trim()
    feedback.setText("")
    if (!value) return
    void post("/feedback", { text: value, mode: "guide" })
    status.content = `ai-dj  queued feedback: ${value}`
  },
})

const feedbackPanel = new BoxRenderable(renderer, {
  id: "feedbackpanel",
  width: "100%",
  height: 3,
  borderStyle: "rounded",
  borderColor: "#3d4a58",
  title: " feedback ",
  titleAlignment: "left",
  flexDirection: "column",
  overflow: "hidden",
  backgroundColor: "#12151a",
})
feedbackPanel.add(feedback)

const hints = new TextRenderable(renderer, {
  id: "hints",
  content: "shift+enter apply  ·  drag select + ctrl+c copy  ·  ctrl+k commands  ·  ctrl+q quit",
  fg: "#55606d",
  bg: "#12151a",
  height: 1,
  width: "100%",
  wrapMode: "none",
  overflow: "hidden",
})

const scriptPanel = new BoxRenderable(renderer, {
  id: "scriptpanel",
  flexGrow: 3,
  flexBasis: 0,
  minWidth: 0,
  borderStyle: "rounded",
  borderColor: "#2a3138",
  title: " live set ",
  titleAlignment: "left",
  flexDirection: "column",
  overflow: "hidden",
})
scriptPanel.add(scriptArea)

const logPanel = new BoxRenderable(renderer, {
  id: "logpanel",
  flexGrow: 1,
  flexBasis: 0,
  minWidth: 0,
  borderStyle: "rounded",
  borderColor: "#2a3138",
  title: " log ",
  titleAlignment: "left",
  flexDirection: "column",
  overflow: "hidden",
})
logPanel.add(logView)

const middle = new BoxRenderable(renderer, {
  id: "middle",
  flexDirection: "row",
  flexGrow: 1,
  flexBasis: 0,
  minWidth: 0,
  width: "100%",
  overflow: "hidden",
})
middle.add(scriptPanel)
middle.add(logPanel)

const root = new BoxRenderable(renderer, {
  id: "root",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  overflow: "hidden",
})
root.add(status)
root.add(middle)
root.add(feedbackPanel)
root.add(hints)
renderer.root.add(root)

// Command palette overlay (ctrl+k). Rendered on top; keys are handled by the
// global keypress handler while open, so no input widget steals them.
const paletteBox = new BoxRenderable(renderer, {
  id: "palettebox",
  position: "absolute",
  top: 2,
  left: "15%",
  width: "70%",
  height: 12,
  borderStyle: "rounded",
  borderColor: "#7CFFB2",
  title: " commands ",
  titleAlignment: "left",
  flexDirection: "column",
  overflow: "hidden",
  backgroundColor: "#12151a",
  zIndex: 100,
  visible: false,
})
const paletteView = new TextRenderable(renderer, {
  id: "paletteview",
  content: "",
  fg: "#d7e0ea",
  bg: "#12151a",
  width: "100%",
  flexGrow: 1,
  wrapMode: "none",
})
paletteBox.add(paletteView)
renderer.root.add(paletteBox)

let dirty = false
let lastLog = ""
let scriptFocused = true
let animating = false
let animTimer: ReturnType<typeof setInterval> | null = null
let animTarget = ""
let animPos = 0
let animChunk = 4
let stickBottom = true
let destroyed = false
let pollTimer: ReturnType<typeof setInterval> | null = null
let applying = 0
let syncedScript = DEFAULT_SCRIPT
let paletteOpen = false
let paletteQuery = ""
let paletteIndex = 0

const SCRIPT_TITLE = " live set "
const CURSOR = "▌"

function setScriptText(text: string) {
  applying++
  try {
    scriptArea.setText(text)
  } finally {
    applying--
  }
}

function setScriptTitle(suffix?: string) {
  scriptPanel.title = suffix ? ` live set · ${suffix} ` : SCRIPT_TITLE
}

function setLog(text: string) {
  if (logView.height > 1 && logView.scrollY < logView.maxScrollY - 1) {
    stickBottom = false
  } else {
    stickBottom = true
  }
  logView.content = text
  if (stickBottom) {
    logView.scrollY = logView.maxScrollY
  }
}

async function post(path: string, body: unknown) {
  try {
    await fetch(URL + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  } catch {
    // server gone; the poll loop will show it
  }
}

// -- clipboard --------------------------------------------------------------
// Host clipboard (native) with an OSC 52 terminal fallback, so copy works both
// locally and over SSH/remote terminals.
const clipboard = createClipboard({
  host: createHostClipboard(),
  terminal: createRendererClipboardAdapter(renderer),
})

async function copyText(text: string, label: string) {
  if (!text.trim()) {
    status.content = `ai-dj  nothing to copy (${label})`
    return
  }
  try {
    await clipboard.writeText(text, { destination: "best-available" })
    const lines = text.split("\n").length
    status.content = `ai-dj  copied ${label} (${lines} line${lines === 1 ? "" : "s"})`
  } catch {
    status.content = `ai-dj  could not copy ${label}`
  }
}

// The focused editor's selection, else the whole focused editor, else the log.
function copySelection() {
  if (scriptArea.hasSelection()) {
    void copyText(scriptArea.getSelectedText(), "script selection")
  } else if (feedback.hasSelection()) {
    void copyText(feedback.getSelectedText(), "feedback selection")
  } else if (scriptArea.focused) {
    void copyText(scriptArea.plainText, "script")
  } else if (feedback.focused) {
    void copyText(feedback.plainText, "feedback")
  } else {
    void copyText(lastLog, "log")
  }
}

function applyScript() {
  if (animTimer) cancelAnim(true)
  const ruby = scriptArea.plainText
  syncedScript = ruby
  dirty = false
  void post("/script", { ruby })
  status.content = "ai-dj  applied script"
}

// -- command palette --------------------------------------------------------

interface PaletteCommand {
  label: string
  run: () => void
}

const paletteCommands: PaletteCommand[] = [
  { label: "Apply script", run: () => applyScript() },
  { label: "Copy script", run: () => void copyText(scriptArea.plainText, "script") },
  { label: "Copy log", run: () => void copyText(lastLog, "log") },
  { label: "Copy script + log", run: () => void copyText(`${scriptArea.plainText}\n\n--- log ---\n${lastLog}`, "script + log") },
  { label: "Copy log file path", run: () => void copyText(LOG_PATH, "log file path") },
  {
    label: "Reset to default script",
    run: () => {
      setScriptText(DEFAULT_SCRIPT)
      scriptArea.gotoBufferEnd()
      dirty = false
      applyScript()
    },
  },
  { label: "Stop music", run: () => void post("/command", { cmd: "stop" }) },
  { label: "Resume music", run: () => void post("/command", { cmd: "resume" }) },
  { label: "Quit", run: () => destroyAll() },
]

function paletteMatches(): PaletteCommand[] {
  const q = paletteQuery.trim().toLowerCase()
  return q ? paletteCommands.filter((c) => c.label.toLowerCase().includes(q)) : paletteCommands
}

function renderPalette() {
  const items = paletteMatches()
  if (paletteIndex >= items.length) paletteIndex = Math.max(0, items.length - 1)
  const lines = items.map((c, i) => (i === paletteIndex ? `▶ ${c.label}` : `  ${c.label}`))
  paletteView.content = `> ${paletteQuery}\n\n${lines.join("\n")}`
}

function openPalette() {
  paletteOpen = true
  paletteQuery = ""
  paletteIndex = 0
  paletteBox.visible = true
  renderPalette()
}

function closePalette() {
  paletteOpen = false
  paletteBox.visible = false
  scriptArea.focus()
}

function paletteMove(delta: number) {
  const items = paletteMatches()
  if (!items.length) return
  paletteIndex = (paletteIndex + delta + items.length) % items.length
  renderPalette()
}

function paletteRun() {
  const cmd = paletteMatches()[paletteIndex]
  closePalette()
  if (cmd) cmd.run()
}

function cancelAnim(complete: boolean) {
  if (animTimer) {
    clearInterval(animTimer)
    animTimer = null
  }
  if (complete && animTarget) {
    // programmatic write of server content — not a user edit
    syncedScript = animTarget
    setScriptText(animTarget)
    scriptArea.gotoBufferEnd()
  }
  animating = false
  animTarget = ""
  setScriptTitle()
}

function animateScript(next: string) {
  if (dirty) return
  if (scriptArea.plainText === next) return
  cancelAnim(false)

  const from = scriptArea.plainText
  let i = 0
  while (i < from.length && i < next.length && from[i] === next[i]) i++

  animating = true
  animTarget = next
  animPos = i
  // adaptive: rewrite finishes in ~1s regardless of script size
  animChunk = Math.max(2, Math.ceil((next.length - i) / 70))
  setScriptTitle("rewriting…")
  setScriptText(next.slice(0, animPos) + CURSOR)
  scriptArea.gotoBufferEnd()

  animTimer = setInterval(() => {
    animPos = Math.min(animPos + animChunk, animTarget.length)
    const done = animPos >= animTarget.length
    setScriptText(done ? animTarget : animTarget.slice(0, animPos) + CURSOR)
    scriptArea.gotoBufferEnd()
    if (done) {
      syncedScript = animTarget
      cancelAnim(false)
    }
  }, 16)
}

scriptArea.on("focused", () => {
  if (animTimer) cancelAnim(true)
})

function stopTimers() {
  destroyed = true
  if (animTimer) {
    clearInterval(animTimer)
    animTimer = null
  }
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

function destroyAll() {
  if (destroyed) return
  stopTimers()
  // clipboard.dispose() is async but must not block quitting; fire and forget.
  void clipboard.dispose().catch(() => {})
  // renderer.destroy() can hang on an active render pass; leave immediately.
  process.exit(0)
}

// belt-and-suspenders: any external destroy path also exits the process
renderer.on("destroy", () => {
  stopTimers()
  setTimeout(() => process.exit(0), 50)
})

renderer.keyInput.on("keypress", (key) => {
  // command palette captures every key while it is open
  if (key.ctrl && (key.name === "k" || key.sequence === "\u000b")) {
    if (paletteOpen) closePalette()
    else openPalette()
    key.stopPropagation()
    return
  }
  if (paletteOpen) {
    if (key.name === "escape") {
      closePalette()
    } else if (key.name === "up") {
      paletteMove(-1)
    } else if (key.name === "down") {
      paletteMove(1)
    } else if (key.name === "return" || key.name === "kpenter" || key.name === "linefeed") {
      paletteRun()
    } else if (key.name === "backspace") {
      paletteQuery = paletteQuery.slice(0, -1)
      paletteIndex = 0
      renderPalette()
    } else if (
      !key.ctrl &&
      !key.meta &&
      key.sequence &&
      key.sequence.length === 1 &&
      key.sequence.charCodeAt(0) >= 32
    ) {
      paletteQuery += key.sequence
      paletteIndex = 0
      renderPalette()
    }
    key.stopPropagation()
    return
  }

  // feedback box: Enter = guide, Shift+Enter = full replace
  if (
    feedback.focused &&
    (key.name === "return" || key.name === "kpenter" || key.name === "linefeed")
  ) {
    const value = feedback.plainText.trim()
    feedback.setText("")
    if (value) {
      const mode = key.shift || key.meta ? "replace" : "guide"
      void post("/feedback", { text: value, mode })
      status.content =
        mode === "replace"
          ? `ai-dj  replace vibe: ${value}`
          : `ai-dj  queued feedback: ${value}`
    }
    key.stopPropagation()
    return
  }

  if (animTimer && scriptArea.focused && !key.ctrl && !key.meta) {
    cancelAnim(true)
  }
  if (key.ctrl && (key.name === "s" || key.sequence === "\u0013")) {
    applyScript()
  } else if (key.ctrl && (key.name === "y" || key.sequence === "\u0019")) {
    copySelection()
  } else if (key.ctrl && (key.name === "c" || key.sequence === "\u0003")) {
    // a selection means "copy"; otherwise copy the focused pane
    copySelection()
  } else if (key.ctrl && (key.name === "q" || key.sequence === "\u0011")) {
    destroyAll()
  } else if (key.name === "tab") {
    scriptFocused = !scriptFocused
    if (scriptFocused) scriptArea.focus()
    else feedback.focus()
  }
})

function truncate(s: string, n: number): string {
  if (n <= 1) return s.slice(0, 1)
  return s.length <= n ? s : s.slice(0, n - 1) + "…"
}

async function poll() {
  if (destroyed) return
  try {
    const r = await fetch(URL + "/state")
    const s = (await r.json()) as Record<string, any>
    if (destroyed) return
    const state = s.running ? "● playing" : "○ idle"
    const line =
      `ai-dj ${state}  ${s.bpm ?? "?"}bpm  ${s.key ?? "?"} ${s.mode ?? ""}  ` +
      `energy ${s.energy ?? "?"}  ${s.section ?? ""}  ·  ${s.model ?? ""}  ·  ${s.last_action ?? ""}`
    status.content = truncate(line, renderer.width)

    const log = (s.log ?? []).slice(-80).join("\n")
    if (log !== lastLog) {
      lastLog = log
      setLog(log)
    }
    if (!dirty && typeof s.script === "string" && s.script && s.script !== scriptArea.plainText) {
      animateScript(s.script)
    }
  } catch {
    if (destroyed) return
    status.content = truncate(`ai-dj  cannot reach ${URL} — is 'ai-dj tui' running?`, renderer.width)
  }
}

scriptArea.focus()
await poll()
pollTimer = setInterval(poll, 1000)
