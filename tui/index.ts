// ai-dj TUI — shows the live Sonic Pi script (editable), queues feedback.
import {
  BoxRenderable,
  ScrollBoxRenderable,
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
})

const scriptArea = new TextareaRenderable(renderer, {
  id: "script",
  initialValue: "-- waiting for the dj to start --",
  wrapMode: "none",
  textColor: "#d7e0ea",
  backgroundColor: "#0d0f12",
  focusedBackgroundColor: "#11151b",
  cursorColor: "#7CFFB2",
  onContentChange: () => {
    dirty = true
  },
})

const logView = new TextRenderable(renderer, {
  id: "log",
  content: "",
  fg: "#7f8b99",
  bg: "#0d0f12",
})

const logScroll = new ScrollBoxRenderable(renderer, {
  id: "logscroll",
  flexGrow: 1,
  width: "100%",
  scrollY: true,
  stickyScroll: true,
  stickyStart: "bottom",
})
logScroll.add(logView)

const feedback = new TextareaRenderable(renderer, {
  id: "feedback",
  height: 1,
  width: "100%",
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

const hints = new TextRenderable(renderer, {
  id: "hints",
  content: "drag select  ·  tab switch focus  ·  ctrl+s apply script  ·  ctrl+q quit",
  fg: "#55606d",
  bg: "#12151a",
  height: 1,
})

const scriptPanel = new BoxRenderable(renderer, {
  id: "scriptpanel",
  flexGrow: 3,
  width: "50%",
  borderStyle: "rounded",
  borderColor: "#2a3138",
  title: " Sonic Pi script ",
  titleAlignment: "left",
  flexDirection: "column",
})
scriptPanel.add(scriptArea)

const logPanel = new BoxRenderable(renderer, {
  id: "logpanel",
  flexGrow: 1,
  width: "50%",
  borderStyle: "rounded",
  borderColor: "#2a3138",
  title: " log ",
  titleAlignment: "left",
  flexDirection: "column",
})
logPanel.add(logScroll)

const middle = new BoxRenderable(renderer, {
  id: "middle",
  flexDirection: "row",
  flexGrow: 1,
  width: "100%",
})
middle.add(scriptPanel)
middle.add(logPanel)

const root = new BoxRenderable(renderer, {
  id: "root",
  flexDirection: "column",
  width: "100%",
  height: "100%",
})
root.add(status)
root.add(middle)
root.add(feedback)
root.add(hints)
renderer.root.add(root)

let dirty = false
let lastLog = ""
let scriptFocused = true

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

renderer.keyInput.on("keypress", (key) => {
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

async function poll() {
  try {
    const r = await fetch(URL + "/state")
    const s = (await r.json()) as Record<string, any>
    const state = s.running ? "● playing" : "○ idle"
    status.content =
      `ai-dj ${state}  ${s.bpm ?? "?"}bpm  ${s.key ?? "?"} ${s.mode ?? ""}  ` +
      `energy ${s.energy ?? "?"}  ${s.section ?? ""}  ·  ${s.model ?? ""}  ·  ${s.last_action ?? ""}`

    const log = (s.log ?? []).slice(-80).join("\n")
    if (log !== lastLog) {
      lastLog = log
      logView.content = log
    }
    if (!dirty && typeof s.script === "string" && s.script && s.script !== scriptArea.plainText) {
      scriptArea.setText(s.script)
    }
  } catch {
    status.content = `ai-dj  cannot reach ${URL} — is 'ai-dj tui' running?`
  }
}

scriptArea.focus()
await poll()
setInterval(poll, 1000)
