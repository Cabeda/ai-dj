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
  restoreTerminal()
  process.exit(1)
})
process.on("unhandledRejection", (reason) => {
  logLine("[tui:unhandled]", reason instanceof Error ? reason.stack ?? reason.message : String(reason))
})

// The launcher terminates us with SIGTERM on teardown; without a handler Bun
// exits without restoring the terminal.
for (const sig of ["SIGTERM", "SIGHUP", "SIGINT"] as const) {
  process.on(sig, () => {
    restoreTerminal()
    process.exit(0)
  })
}

// Minimal, audible starting point (Strudel — the default backend). The server
// replaces this on the first poll. Edit freely, then shift+enter to apply.
const DEFAULT_SCRIPT = `setcpm(90/4)

stack(
  chord("<Am7 Am7 CM7 Am7>").voicing().s("piano").gain(0.3).room(0.4).slow(4)
)`

const renderer = await createCliRenderer({
  // ctrl+c quits (we handle it so we can restore the terminal ourselves), and
  // no signal shortcuts, so the quit path is always ours
  exitOnCtrlC: false,
  exitSignals: [],
  backgroundColor: "#0d0f12",
  // Capture the mouse so a drag is an *in-app* selection: that is what lets you
  // select a passage and delete just that. Copy-on-select (below) keeps the
  // terminal behaviour of copying what you highlight; Shift+drag still hands
  // the selection to the terminal itself.
  useMouse: true,
  enableMouseMovement: false,
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
    // Ctrl+A is the terminal-native select-all; the default binding is Cmd+A
    // (super), which the palette also exposes.
    { name: "a", ctrl: true, action: "select-all" },
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
  content: "shift+enter apply  ·  ctrl+p pause  ·  ctrl+= / ctrl+- volume  ·  ctrl+u mute  ·  ctrl+k commands  ·  ctrl+q quit",
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
  // Hidden by default: the music is the point, the log is a diagnostic. Toggle
  // it from the command palette (ctrl+k).
  visible: false,
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

// Sessions browser (ctrl+l): the saved sets on the left, the selected script
// on the right. Rendered on top; keys are handled by the global handler.
const sessionsBox = new BoxRenderable(renderer, {
  id: "sessionsbox",
  position: "absolute",
  top: 2,
  left: "8%",
  width: "84%",
  height: "72%",
  borderStyle: "rounded",
  borderColor: "#8ad4ff",
  title: " sessions ",
  titleAlignment: "left",
  flexDirection: "row",
  overflow: "hidden",
  backgroundColor: "#12151a",
  zIndex: 100,
  visible: false,
})
const sessionsListView = new TextRenderable(renderer, {
  id: "sessionslist",
  content: "",
  fg: "#d7e0ea",
  bg: "#12151a",
  width: "44%",
  height: "100%",
  wrapMode: "none",
  overflow: "hidden",
})
const sessionsPreviewView = new TextRenderable(renderer, {
  id: "sessionspreview",
  content: "",
  fg: "#8b96a3",
  bg: "#12151a",
  width: "56%",
  height: "100%",
  wrapMode: "none",
  overflow: "hidden",
})
sessionsBox.add(sessionsListView)
sessionsBox.add(sessionsPreviewView)
renderer.root.add(sessionsBox)

// Starting-point picker, shown before anything plays: a template, a saved
// session, or let the model write it from scratch.
const startBox = new BoxRenderable(renderer, {
  id: "startbox",
  position: "absolute",
  top: 1,
  left: "12%",
  width: "76%",
  height: "86%",
  borderStyle: "rounded",
  borderColor: "#7CFFB2",
  title: " start ",
  titleAlignment: "left",
  flexDirection: "column",
  overflow: "hidden",
  backgroundColor: "#12151a",
  zIndex: 110,
  visible: false,
})
const startView = new TextRenderable(renderer, {
  id: "startview",
  content: "",
  fg: "#d7e0ea",
  bg: "#12151a",
  width: "100%",
  height: "100%",
  wrapMode: "none",
  overflow: "hidden",
})
startBox.add(startView)
renderer.root.add(startBox)

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
let seenScriptRev = -1
let logVisible = false
let paused = false
let autopilot = true
let volume = 1
let lastAudibleVolume = 0.7
let currentSessionId = ""
let sessionsOpen = false
let sessions: SessionRow[] = []
let sessionsIndex = 0
let startOpen = false
let startRows: StartRow[] = []
let startIndex = 0
let paletteOpen = false
let palettePrompt: { label: string; submit: (value: string) => void } | null = null
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

// The log panel starts hidden; the palette toggles it. Keeping the label on a
// shared object lets the palette re-render it without rebuilding the list.
function setLogVisible(value: boolean) {
  logVisible = value
  logPanel.visible = value
  toggleLogsCommand.label = value ? "Hide logs" : "Show logs"
  status.content = `ai-dj  logs ${value ? "shown" : "hidden"}`
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
  // don't claim success: the engine may reject it, and the status line will
  // say so (manual edit / manual edit failed: ...)
  status.content = "ai-dj  sent script to the engine"
}

function selectAllScript() {
  scriptArea.focus()
  scriptArea.selectAll()
  status.content = "ai-dj  selected the whole script — type or paste to replace"
}

// Pause silences the set and freezes the loop (no capture, no model call)
// until continued. The server owns the truth; we set it optimistically so the
// key feels instant, and the poll corrects us.
function togglePause() {
  paused = !paused
  void post("/command", { cmd: paused ? "pause" : "resume" })
  status.content = paused ? "ai-dj  paused" : "ai-dj  playing"
}

// Freeze keeps the set playing but stops the DJ changing it: the script only
// moves when you edit it. Different from pause, which also silences the audio.
function toggleAutopilot() {
  autopilot = !autopilot
  void post("/command", { cmd: autopilot ? "autopilot-on" : "autopilot-off" })
  status.content = autopilot
    ? "ai-dj  autopilot on — the DJ is evolving the set"
    : "ai-dj  frozen — only your edits change the script"
}

// Volume: the loop owns the value and scales the whole mix. Stepped, not
// continuous, so a held key cannot run away.
function changeVolume(step: number) {
  volume = Math.max(0, Math.min(1, Math.round((volume + step) * 100) / 100))
  void post("/command", { cmd: `volume ${volume}` })
  status.content = volume <= 0
    ? "ai-dj  muted"
    : `ai-dj  volume ${Math.round(volume * 100)}%`
}

function toggleMute() {
  volume = volume > 0 ? 0 : lastAudibleVolume
  if (volume > 0) lastAudibleVolume = volume
  void post("/command", { cmd: `volume ${volume}` })
  status.content = volume <= 0 ? "ai-dj  muted" : "ai-dj  unmuted"
}

// Replace the whole script with the clipboard's text in one step. The
// terminal's own paste works too, but only after select-all.
async function pasteScript() {
  try {
    const res = await clipboard.read({ preferredTypes: ["text/plain"] })
    if (res.status !== "read") {
      status.content = `ai-dj  clipboard ${res.status} — press ctrl+a, then paste`
      return
    }
    const text = new TextDecoder().decode(res.representation.bytes)
    if (!text.trim()) {
      status.content = "ai-dj  clipboard is empty"
      return
    }
    setScriptText(text)
    scriptArea.gotoBufferEnd()
    dirty = false
    applyScript()
  } catch {
    status.content = "ai-dj  could not read the clipboard — press ctrl+a, then paste"
  }
}

// -- command palette --------------------------------------------------------

interface PaletteCommand {
  label: string
  run: () => void
}

const toggleLogsCommand: PaletteCommand = {
  label: "Show logs",
  run: () => setLogVisible(!logVisible),
}

const volumeUpCommand: PaletteCommand = {
  label: "Volume up",
  run: () => changeVolume(0.1),
}

const volumeDownCommand: PaletteCommand = {
  label: "Volume down",
  run: () => changeVolume(-0.1),
}

const muteCommand: PaletteCommand = {
  label: "Mute / unmute",
  run: () => toggleMute(),
}

const togglePauseCommand: PaletteCommand = {
  label: "Pause music",
  run: () => togglePause(),
}

const toggleAutopilotCommand: PaletteCommand = {
  label: "Freeze the script (AI off)",
  run: () => toggleAutopilot(),
}

const paletteCommands: PaletteCommand[] = [
  { label: "Apply script", run: () => applyScript() },
  { label: "Paste script from clipboard", run: () => void pasteScript() },
  { label: "Select all script", run: () => selectAllScript() },
  { label: "Copy script", run: () => void copyText(scriptArea.plainText, "script") },
  { label: "Copy log", run: () => void copyText(lastLog, "log") },
  { label: "Copy script + log", run: () => void copyText(`${scriptArea.plainText}\n\n--- log ---\n${lastLog}`, "script + log") },
  { label: "Copy log file path", run: () => void copyText(LOG_PATH, "log file path") },
  toggleLogsCommand,
  {
    label: "Reset to default script",
    run: () => {
      setScriptText(DEFAULT_SCRIPT)
      scriptArea.gotoBufferEnd()
      dirty = false
      applyScript()
    },
  },
  togglePauseCommand,
  toggleAutopilotCommand,
  volumeUpCommand,
  volumeDownCommand,
  muteCommand,
  { label: "Browse sessions", run: () => void openSessions() },
  { label: "Name this session", run: () => promptNameSession(currentSessionId, "session") },
  { label: "Favorite this session", run: () => void toggleFavoriteCurrent() },
  { label: "Quit", run: () => destroyAll() },
]

function paletteMatches(): PaletteCommand[] {
  const q = paletteQuery.trim().toLowerCase()
  return q ? paletteCommands.filter((c) => c.label.toLowerCase().includes(q)) : paletteCommands
}

function renderPalette() {
  if (palettePrompt) {
    paletteView.content = `> ${palettePrompt.label}: ${paletteQuery}`
    paletteBox.height = 4
    return
  }
  const items = paletteMatches()
  if (paletteIndex >= items.length) paletteIndex = Math.max(0, items.length - 1)
  const lines = items.map((c, i) => (i === paletteIndex ? `▶ ${c.label}` : `  ${c.label}`))
  paletteView.content = `> ${paletteQuery}\n\n${lines.join("\n")}`
  // grow to fit the filtered list (query + blank + items + border) so the last
  // commands are never clipped, but never taller than the screen
  paletteBox.height = Math.min(items.length + 4, Math.max(6, renderer.height - 6))
}

function openPalette() {
  paletteOpen = true
  palettePrompt = null
  paletteQuery = ""
  paletteIndex = 0
  paletteBox.visible = true
  renderPalette()
}

// A command that needs a value: reuse the palette's input line as a prompt.
function openPalettePrompt(label: string, submit: (value: string) => void) {
  openPalette()
  palettePrompt = { label, submit }
  renderPalette()
}

function closePalette() {
  paletteOpen = false
  palettePrompt = null
  paletteBox.visible = false
  // a prompt can be opened from inside the sessions browser; stay there
  if (!sessionsOpen) scriptArea.focus()
}

function paletteMove(delta: number) {
  const items = paletteMatches()
  if (!items.length) return
  paletteIndex = (paletteIndex + delta + items.length) % items.length
  renderPalette()
}

function paletteRun() {
  if (palettePrompt) {
    const { submit } = palettePrompt
    const value = paletteQuery.trim()
    closePalette()
    if (value) submit(value)
    return
  }
  const cmd = paletteMatches()[paletteIndex]
  closePalette()
  if (cmd) cmd.run()
}

// -- sessions browser -------------------------------------------------------

interface SessionRow {
  id: string
  name: string
  favorite: boolean
  created: number
  latest: string | null
  preview: string
}

function fmtDate(ts: number): string {
  if (!ts) return "—"
  const d = new Date(ts * 1000)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
    `${p(d.getHours())}:${p(d.getMinutes())}`
}

async function fetchSessions(): Promise<SessionRow[]> {
  try {
    const r = await fetch(URL + "/sessions")
    const s = (await r.json()) as { sessions?: SessionRow[] }
    return s.sessions ?? []
  } catch {
    return []
  }
}

async function openSessions() {
  sessions = await fetchSessions()
  // start on the set we are playing, if it is in the list
  const here = sessions.findIndex((s) => s.id === currentSessionId)
  sessionsIndex = here >= 0 ? here : 0
  sessionsOpen = true
  sessionsBox.visible = true
  renderSessions()
}

function closeSessions() {
  sessionsOpen = false
  sessionsBox.visible = false
  scriptArea.focus()
}

function renderSessions() {
  const width = Math.max(18, Math.floor(renderer.width * 0.84 * 0.44) - 4)
  const titleWidth = Math.max(8, width - 18)
  const rows = sessions.map((s, i) => {
    const mark = i === sessionsIndex ? "▶" : " "
    const fav = s.favorite ? "♥" : " "
    const title = (s.name || s.id).slice(0, titleWidth)
    return `${mark}${fav} ${title.padEnd(titleWidth)}  ${fmtDate(s.created)}`
  })
  sessionsListView.content =
    `${sessions.length} saved\n` +
    "↑/↓ move · enter load\n" +
    "f favorite · n name · esc\n\n" +
    (rows.join("\n") || "(no sessions yet)")

  const cur = sessions[sessionsIndex]
  sessionsPreviewView.content = cur
    ? `${cur.name || cur.id}\n${fmtDate(cur.created)}${cur.favorite ? "   ♥" : ""}\n\n` +
      (cur.preview || "(empty)")
    : ""
}

function sessionsMove(delta: number) {
  if (!sessions.length) return
  sessionsIndex = (sessionsIndex + delta + sessions.length) % sessions.length
  renderSessions()
}

function sessionsToggleFavorite() {
  const cur = sessions[sessionsIndex]
  if (!cur) return
  cur.favorite = !cur.favorite
  void post("/session/favorite", { id: cur.id, favorite: cur.favorite })
  // keep favourites on top, the way the server sorts them
  sessions.sort((a, b) =>
    a.favorite === b.favorite ? b.created - a.created : a.favorite ? -1 : 1)
  sessionsIndex = Math.max(0, sessions.findIndex((s) => s.id === cur.id))
  renderSessions()
}

function promptNameSession(id: string, label: string) {
  if (!id) return
  openPalettePrompt("name this session", (value) => {
    void post("/session/name", { id, name: value })
    const row = sessions.find((s) => s.id === id)
    if (row) {
      row.name = value
      renderSessions()
    }
    status.content = `ai-dj  ${label} named "${value}"`
  })
}

async function sessionsLoad() {
  const cur = sessions[sessionsIndex]
  if (!cur) return
  await post("/session/load", { id: cur.id })
  status.content = `ai-dj  loading ${cur.name || cur.id}`
  closeSessions()
}

// -- starting-point picker --------------------------------------------------

interface StartRow {
  kind: "header" | "surprise" | "archetype" | "session"
  label: string
  detail: string
  payload: Record<string, unknown>
}

async function fetchArchetypes(): Promise<any[]> {
  try {
    const r = await fetch(URL + "/archetypes")
    const s = (await r.json()) as { archetypes?: any[] }
    return s.archetypes ?? []
  } catch {
    return []
  }
}

async function openStart() {
  const [archetypes, saved] = await Promise.all([fetchArchetypes(), fetchSessions()])
  const rows: StartRow[] = [
    { kind: "surprise", label: "Surprise me", detail: "let the model write the opening set",
      payload: { prompt: "surprise me — pick a mood and write the opening set" } },
  ]
  let group = ""
  for (const a of archetypes) {
    if (a.group !== group) {
      group = a.group
      rows.push({ kind: "header", label: group, detail: "", payload: {} })
    }
    rows.push({
      kind: "archetype",
      label: String(a.name).replace(/_/g, " "),
      detail: `${a.bpm[0]}-${a.bpm[1]}bpm · ${(a.layers ?? []).join(", ")}`,
      payload: { archetype: a.name },
    })
  }
  if (saved.length) {
    rows.push({ kind: "header", label: "recent sets", detail: "", payload: {} })
    for (const s of saved.slice(0, 8)) {
      rows.push({ kind: "session", label: s.name || s.id, detail: fmtDate(s.created),
                  payload: { session_id: s.id } })
    }
  }
  startRows = rows
  startIndex = rows.findIndex((r) => r.kind !== "header")
  startOpen = true
  startBox.visible = true
  renderStart()
}

function renderStart() {
  const lines = startRows.map((r, i) => {
    if (r.kind === "header") return `\n  ${r.label}`
    const mark = i === startIndex ? "▶" : " "
    return `${mark} ${r.label.padEnd(16)}  ${r.detail}`
  })
  startView.content =
    "Pick a starting point — nothing is playing yet.\n" +
    "↑/↓ move · enter start · ctrl+l browse all sessions · ctrl+q quit\n" +
    lines.join("\n")
}

function startMove(delta: number) {
  if (!startRows.length) return
  let i = startIndex
  for (let n = 0; n < startRows.length; n++) {
    i = (i + delta + startRows.length) % startRows.length
    const row = startRows[i]
    if (row && row.kind !== "header") {
      startIndex = i
      renderStart()
      return
    }
  }
}

async function startChoose() {
  const row = startRows[startIndex]
  if (!row || row.kind === "header") return
  startOpen = false
  startBox.visible = false
  status.content = row.kind === "session"
    ? `ai-dj  resuming ${row.label}`
    : `ai-dj  starting — ${row.label}`
  await post("/start", row.payload)
}

async function toggleFavoriteCurrent() {
  if (!currentSessionId) return
  const all = await fetchSessions()
  const row = all.find((s) => s.id === currentSessionId)
  const next = !row?.favorite
  await post("/session/favorite", { id: currentSessionId, favorite: next })
  status.content = next ? "ai-dj  added to favourites" : "ai-dj  removed from favourites"
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

// Select-to-copy: a drag highlights a passage and the clipboard gets it, the
// way a terminal behaves. The selection stays live, so Backspace/Delete then
// removes just that passage.
scriptArea.onMouseUp = () => {
  if (scriptArea.hasSelection()) void copyText(scriptArea.getSelectedText(), "selection")
}
logView.onMouseUp = () => {
  if (logView.hasSelection()) void copyText(logView.getSelectedText(), "log selection")
}
feedback.onMouseUp = () => {
  if (feedback.hasSelection()) void copyText(feedback.getSelectedText(), "feedback selection")
}

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
  restoreTerminal()
  // renderer.destroy() can hang on an active render pass; leave immediately.
  process.exit(0)
}

// OpenTUI restores the terminal inside destroy(), but destroy() can block on an
// active render pass — and process.exit() skips cleanup entirely. Quitting then
// left the terminal in the alternate screen with mouse reporting still on (an
// earlier build enabled it), so the shell echoed mouse escapes as garbage.
// Restore the modes ourselves: it cannot hang, and it is idempotent.
function restoreTerminal() {
  try {
    if (process.stdin.isTTY) process.stdin.setRawMode(false)
  } catch {}
  try {
    require("fs").writeSync(
      1,
      "\x1b[?1000l\x1b[?1002l\x1b[?1003l\x1b[?1006l" + // mouse reporting off
        "\x1b[?2004l" + // bracketed paste off
        "\x1b[?1004l" + // focus reporting off
        "\x1b[?2026l" + // synchronized output off
        "\x1b[?25h" + // show the cursor
        "\x1b[0m" + // reset attributes
        "\x1b[?1049l", // leave the alternate screen
    )
  } catch {}
}

// belt-and-suspenders: any external destroy path also exits the process
renderer.on("destroy", () => {
  stopTimers()
  restoreTerminal()
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
  if (key.ctrl && (key.name === "l" || key.sequence === "\u000c")) {
    if (sessionsOpen) closeSessions()
    else void openSessions()
    key.stopPropagation()
    return
  }
  if (startOpen) {
    if (key.name === "up" || key.name === "k") startMove(-1)
    else if (key.name === "down" || key.name === "j") startMove(1)
    else if (key.name === "return" || key.name === "kpenter") void startChoose()
    key.stopPropagation()
    return
  }
  if (sessionsOpen) {
    if (key.name === "escape") closeSessions()
    else if (key.name === "up" || key.name === "k") sessionsMove(-1)
    else if (key.name === "down" || key.name === "j") sessionsMove(1)
    else if (key.name === "return" || key.name === "kpenter") void sessionsLoad()
    else if (key.name === "f") sessionsToggleFavorite()
    else if (key.name === "n") {
      const cur = sessions[sessionsIndex]
      if (cur) promptNameSession(cur.id, cur.name || cur.id)
    }
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
  } else if (key.ctrl && (key.name === "p" || key.sequence === "\u0010")) {
    togglePause()
  } else if (key.ctrl && (key.name === "o" || key.sequence === "\u000f")) {
    toggleAutopilot()
  } else if (key.ctrl && (key.name === "]" || key.name === "=" || key.sequence === "\u001d")) {
    // terminals report ctrl+= as "]" (byte 0x1d)
    changeVolume(0.1)
  } else if (key.ctrl && (key.name === "_" || key.name === "-" || key.sequence === "\u001f")) {
    changeVolume(-0.1)
  } else if (key.ctrl && key.name === "u") {
    // not ctrl+m: that byte is identical to Enter, so it would swallow Enter
    toggleMute()
  } else if (key.ctrl && (key.name === "y" || key.sequence === "\u0019")) {
    copySelection()
  } else if (key.ctrl && (key.name === "c" || key.sequence === "\u0003")) {
    // ctrl+c quits, as everywhere else — copy is ctrl+y, or your terminal's
    // own select-to-copy (the TUI does not capture the mouse)
    destroyAll()
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
    // nothing is playing until a starting point is chosen: show the picker
    if (s.awaiting_start && !startOpen) void openStart()
    paused = !!s.paused
    autopilot = s.autopilot !== false
    volume = typeof s.volume === "number" ? s.volume : volume
    currentSessionId = typeof s.session_id === "string" ? s.session_id : currentSessionId
    togglePauseCommand.label = paused ? "Continue music" : "Pause music"
    toggleAutopilotCommand.label = autopilot
      ? "Freeze the script (AI off)"
      : "Unfreeze the script (AI on)"
    const state = paused ? "⏸ paused" : s.running ? "● playing" : "○ idle"
    const line =
      `ai-dj ${state}${autopilot ? "" : " · frozen"}  ${s.bpm ?? "?"}bpm  ` +
      `${s.key ?? "?"} ${s.mode ?? ""}  ` +
      `energy ${s.energy ?? "?"}  ${s.section ?? ""}  vol ${Math.round(volume * 100)}%  ` +
      `·  ${s.model ?? ""}  ·  ${s.last_action ?? ""}`
    status.content = truncate(line, renderer.width)

    const log = (s.log ?? []).slice(-80).join("\n")
    if (log !== lastLog) {
      lastLog = log
      setLog(log)
    }
    // Adopt the server's script only when it actually changed (script_rev).
    // Otherwise a manual edit the engine rejected — same script, same revision
    // — would revert the text the user just pasted.
    const rev = typeof s.script_rev === "number" ? s.script_rev : 0
    if (rev !== seenScriptRev) {
      seenScriptRev = rev
      if (!dirty && typeof s.script === "string" && s.script && s.script !== scriptArea.plainText) {
        animateScript(s.script)
      }
    }
  } catch {
    if (destroyed) return
    status.content = truncate(`ai-dj  cannot reach ${URL} — is 'ai-dj tui' running?`, renderer.width)
  }
}

scriptArea.focus()
await poll()
pollTimer = setInterval(poll, 1000)
