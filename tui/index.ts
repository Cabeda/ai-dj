// ai-dj TUI — shows the live Sonic Pi script (editable), queues feedback.
import {
  BoxRenderable,
  TextRenderable,
  TextareaRenderable,
  createCliRenderer,
} from "@opentui/core"

const URL = process.env.AI_DJ_URL ?? "http://127.0.0.1:8765"

const renderer = await createCliRenderer({ exitOnCtrlC: true, backgroundColor: "#0d0f12" })

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
  initialValue: "-- waiting for the dj to start --",
  wrapMode: "none",
  width: "100%",
  flexGrow: 1,
  textColor: "#d7e0ea",
  backgroundColor: "#0d0f12",
  focusedBackgroundColor: "#11151b",
  cursorColor: "#7CFFB2",
  onContentChange: () => {
    if (!animating) dirty = true
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
  placeholder: "type feedback, Enter to queue (e.g. 'more bass', 'add hats')",
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
    void post("/feedback", { text: value })
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
  content: "drag select  ·  tab switch focus  ·  ctrl+s apply script  ·  ctrl+q quit",
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
  title: " Sonic Pi script ",
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

let dirty = false
let lastLog = ""
let scriptFocused = true
let animating = false
let animTimer: ReturnType<typeof setInterval> | null = null
let animTarget = ""
let animPos = 0
let stickBottom = true

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

const ANIM_MS = 14
const ANIM_CHUNK = 4

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

function applyScript() {
  const ruby = scriptArea.plainText
  dirty = false
  void post("/script", { ruby })
  status.content = "ai-dj  applied manual edit"
}

function cancelAnim(complete: boolean) {
  if (animTimer) {
    clearInterval(animTimer)
    animTimer = null
  }
  if (complete && animTarget) {
    animating = false
    scriptArea.setText(animTarget)
    scriptArea.gotoBufferEnd()
  }
  animating = false
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
  scriptArea.setText(next.slice(0, animPos))
  scriptArea.gotoBufferEnd()

  animTimer = setInterval(() => {
    animPos = Math.min(animPos + ANIM_CHUNK, animTarget.length)
    scriptArea.setText(animTarget.slice(0, animPos))
    scriptArea.gotoBufferEnd()
    if (animPos >= animTarget.length) cancelAnim(false)
  }, ANIM_MS)
}

scriptArea.on("focused", () => {
  if (animTimer) cancelAnim(true)
})

renderer.keyInput.on("keypress", (key) => {
  if (animTimer && scriptArea.focused && !key.ctrl && !key.meta) {
    cancelAnim(true)
  }
  if (key.ctrl && key.name === "s") {
    applyScript()
  } else if (key.ctrl && key.name === "q") {
    renderer.destroy()
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
  try {
    const r = await fetch(URL + "/state")
    const s = (await r.json()) as Record<string, any>
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
    status.content = truncate(`ai-dj  cannot reach ${URL} — is 'ai-dj tui' running?`, renderer.width)
  }
}

scriptArea.focus()
await poll()
setInterval(poll, 1000)
