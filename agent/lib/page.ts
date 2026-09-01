export const PAGE = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>An agent that thinks for itself</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
<script>
  try {
    const saved = localStorage.getItem("nys.theme");
    if (saved === "dark" || saved === "light") document.documentElement.setAttribute("data-theme", saved);
  } catch {}
</script>
<style>
  :root {
    --ink: #1b1a15;
    --dim: #6d6757;
    --faint: #a8a294;
    --bg: #eeece4;
    --panel: #f8f7f2;
    --rule: #dad5c8;
    --hot: #a8481a;
    --cool: #46683f;
    --think: #56488c;
    --note: #7d5f0c;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
    --ink: #e8e3d8;
    --dim: #8b8579;
    --faint: #4a463e;
    --bg: #14130f;
    --panel: #1b1a15;
    --rule: #2c2a23;
    --hot: #d4622a;
    --cool: #6f8f6a;
    --think: #8a7fb8;
    --note: #c9a227;
    }
  }
  :root[data-theme="dark"] {
    --ink: #e8e3d8;
    --dim: #8b8579;
    --faint: #4a463e;
    --bg: #14130f;
    --panel: #1b1a15;
    --rule: #2c2a23;
    --hot: #d4622a;
    --cool: #6f8f6a;
    --think: #8a7fb8;
    --note: #c9a227;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--ink);
    font-family: "Newsreader", Georgia, serif;
    font-size: 17px;
    line-height: 1.5;
    overflow: hidden;
  }
  .frame {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 5px var(--mindlog, 32rem);
    height: 100dvh;
  }
  .pane { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
  .grip {
    background: var(--rule); cursor: col-resize; border: 0; padding: 0;
    touch-action: none; position: relative;
  }
  .grip::after {
    content: ""; position: absolute; inset: 0 -4px; /* a bigger target than the line */
  }
  .grip:hover, .grip:focus-visible { background: var(--hot); outline: none; }

  header {
    display: flex; align-items: baseline; gap: .6rem;
    padding: .9rem 1.2rem; border-bottom: 1px solid var(--rule);
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: .68rem; letter-spacing: .14em; text-transform: uppercase;
    color: var(--dim); flex: 0 0 auto;
  }
  header b { color: var(--ink); font-weight: 700; }
  header .spacer { flex: 1; }
  button {
    font: inherit; font-family: "JetBrains Mono", monospace; font-size: .62rem;
    letter-spacing: .12em; text-transform: uppercase;
    background: transparent; color: var(--dim);
    border: 1px solid var(--rule); border-radius: 2px;
    padding: .3rem .6rem; cursor: pointer;
  }
  button:hover { color: var(--hot); border-color: var(--hot); }
  button:disabled { opacity: .4; cursor: default; }
  .scroll { flex: 1 1 auto; overflow-y: auto; padding: 1.2rem; }
  .msg { margin: 0 0 1.4rem; max-width: 60ch; }
  .msg .who {
    font-family: "JetBrains Mono", monospace; font-size: .62rem;
    letter-spacing: .14em; text-transform: uppercase; color: var(--dim);
    display: block; margin-bottom: .25rem;
  }
  .msg.me .who { color: var(--hot); }
  .msg.it .who { color: var(--cool); }
  .msg .body > * { margin: 0 0 .6rem; }
  .msg .body > *:last-child { margin-bottom: 0; }
  .msg p { white-space: pre-wrap; }
  .msg p.head { font-weight: 600; letter-spacing: .01em; }
  .msg strong { font-weight: 600; }
  .msg em { font-style: italic; }
  .msg ul, .msg ol { padding-left: 1.4rem; }
  .msg li { margin: 0 0 .3rem; }
  .msg code {
    font-family: "JetBrains Mono", ui-monospace, monospace; font-size: .82em;
    background: var(--panel); border: 1px solid var(--rule); border-radius: 2px;
    padding: .05em .3em;
  }
  .msg pre {
    font-family: "JetBrains Mono", ui-monospace, monospace; font-size: .78rem;
    background: var(--panel); border: 1px solid var(--rule); border-radius: 2px;
    padding: .7rem .8rem; overflow-x: auto; white-space: pre;
  }
  form { display: flex; gap: .6rem; padding: 1rem 1.2rem; border-top: 1px solid var(--rule); flex: 0 0 auto; }
  textarea {
    flex: 1; resize: none; rows: 1; font: inherit; color: var(--ink);
    background: var(--panel); border: 1px solid var(--rule); border-radius: 2px;
    padding: .55rem .7rem; min-height: 2.6rem; max-height: 8rem;
  }
  textarea:focus { outline: none; border-color: var(--hot); }
  .entry {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: .82rem; line-height: 1.55;
    padding: .5rem 0; border-bottom: 1px dotted var(--faint);
    display: grid; grid-template-columns: 4.2rem 4rem 1fr; gap: .55rem;
    align-items: start;
  }
  .entry .at { color: var(--faint); }
  .entry .kind { letter-spacing: .1em; text-transform: uppercase; font-size: .7rem; padding-top: .1rem; }
  .entry .text { white-space: pre-wrap; overflow-wrap: anywhere; color: var(--dim); }
  .entry[data-kind="heard"] .kind { color: var(--hot); }
  .entry[data-kind="said"] .kind { color: var(--cool); }
  .entry[data-kind="thought"] .kind { color: var(--think); }
  .entry[data-kind="thought"] .text { color: var(--ink); font-style: italic; }
  .entry[data-kind="note"] .kind, .entry[data-kind="note"] .text { color: var(--note); }
  .entry[data-kind="did"] .kind { color: var(--faint); }
  .entry[data-kind="woke"] .kind, .entry[data-kind="woke"] .text { color: var(--think); }
  .empty { color: var(--faint); font-style: italic; }
  @media (max-width: 800px) {
    body { overflow: auto; }
    .frame { grid-template-columns: 1fr; height: auto; }
    .grip { display: none; }
    .pane { height: 100dvh; }
    .pane + .pane { border-top: 1px solid var(--rule); }
  }
</style>
</head>
<body>
<div class="frame">
  <section class="pane">
    <header><b>an agent that thinks for itself</b><span class="spacer"></span><button id="theme" type="button" title="Switch theme">theme</button><span id="status">idle</span></header>
    <div class="scroll" id="chat"><p class="empty">Say something. It may or may not care.</p></div>
    <form id="composer">
      <textarea id="input" placeholder="…" rows="1"></textarea>
      <button type="submit">Send</button>
    </form>
  </section>
  <div class="grip" role="separator" aria-orientation="vertical" tabindex="0" aria-label="Resize the mindlog"></div>
  <section class="pane">
    <header><b>mindlog</b><span class="spacer"></span><button id="think" type="button">Wake it</button></header>
    <div class="scroll" id="mindlog"><p class="empty">Nothing yet.</p></div>
  </section>
</div>
<script>
const chat = document.getElementById("chat");
const mindlogEl = document.getElementById("mindlog");
const statusEl = document.getElementById("status");
const input = document.getElementById("input");
let sessionId = localStorage.getItem("nys.session");
let live = null;

// The model writes markdown, so render the little of it that it actually uses.
// Every text node goes in as text, never as markup, so a stray < or a pasted
// tag stays a character.
function inline(text, into) {
  const pattern = /\*\*([^*]+)\*\*|(?<!\*)\*([^*\n]+)\*(?!\*)|\u0060([^\u0060]+)\u0060/g;
  let at = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > at) into.append(text.slice(at, match.index));
    const [, bold, italic, code] = match;
    const tag = bold ? "strong" : italic ? "em" : "code";
    const node = document.createElement(tag);
    node.textContent = bold ?? italic ?? code;
    into.append(node);
    at = match.index + match[0].length;
  }
  if (at < text.length) into.append(text.slice(at));
}

function setMessage(body, text) {
  body.replaceChildren();
  const lines = text.split("\n");
  let list = null;
  let para = null;
  let fence = null;

  const endBlocks = () => { list = null; para = null; };

  for (const line of lines) {
    if (line.trimStart().startsWith("\u0060\u0060\u0060")) {
      if (fence) { fence = null; } else {
        endBlocks();
        fence = document.createElement("pre");
        body.append(fence);
      }
      continue;
    }
    if (fence) {
      fence.append(fence.childNodes.length ? "\n" + line : line);
      continue;
    }
    if (line.trim() === "") { endBlocks(); continue; }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (bullet || numbered) {
      const wanted = bullet ? "UL" : "OL";
      if (!list || list.tagName !== wanted) {
        list = document.createElement(wanted === "UL" ? "ul" : "ol");
        body.append(list);
        para = null;
      }
      const item = document.createElement("li");
      inline(bullet ? bullet[1] : numbered[2], item);
      list.append(item);
      continue;
    }

    const heading = line.match(/^\s*#{1,6}\s+(.*)$/);
    if (heading) {
      endBlocks();
      const h = document.createElement("p");
      h.className = "head";
      inline(heading[1], h);
      body.append(h);
      continue;
    }

    if (!para) {
      para = document.createElement("p");
      body.append(para);
      list = null;
    } else {
      para.append("\n");
    }
    inline(line, para);
  }
}

function bubble(cls, who, text) {
  const empty = chat.querySelector(".empty");
  if (empty) empty.remove();
  const el = document.createElement("div");
  el.className = "msg " + cls;
  el.innerHTML = '<span class="who"></span><div class="body"></div>';
  el.querySelector(".who").textContent = who;
  const body = el.querySelector(".body");
  setMessage(body, text);
  chat.append(el);
  chat.scrollTop = chat.scrollHeight;
  return body;
}

async function refreshMindlog() {
  const res = await fetch("/api/mindlog?limit=120");
  const { entries } = await res.json();
  if (entries.length === 0) return;
  const atBottom = mindlogEl.scrollHeight - mindlogEl.scrollTop - mindlogEl.clientHeight < 60;
  mindlogEl.replaceChildren(...entries.map((e) => {
    const row = document.createElement("div");
    row.className = "entry";
    row.dataset.kind = e.kind;
    row.innerHTML = '<span class="at"></span><span class="kind"></span><span class="text"></span>';
    row.querySelector(".at").textContent = new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    row.querySelector(".kind").textContent = e.kind;
    row.querySelector(".text").textContent = e.text;
    return row;
  }));
  if (atBottom) mindlogEl.scrollTop = mindlogEl.scrollHeight;
}

// One long-lived reader per session. A new session starts at 0; an existing one
// resumes at the tail so a reload does not replay old turns into the chat.
async function follow(id, startIndex) {
  while (id === sessionId) {
    try {
      const res = await fetch("/eve/v1/session/" + id + "/stream?startIndex=" + startIndex);
      if (!res.ok) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.trim() === "") continue;
          try { handle(JSON.parse(line)); } catch {}
        }
      }
    } catch {}
    startIndex = -1;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

function handle(event) {
  const data = event.data || {};
  switch (event.type) {
    case "turn.started":
      statusEl.textContent = "thinking";
      break;
    case "message.appended":
      if (!live) live = bubble("it", "it", "");
      setMessage(live, data.messageSoFar || "");
      chat.scrollTop = chat.scrollHeight;
      break;
    case "message.completed":
      if (data.message) {
        if (!live) live = bubble("it", "it", "");
        setMessage(live, data.message);
      }
      live = null;
      void refreshMindlog();
      break;
    case "turn.failed":
      bubble("it", "it", "[" + (data.message || "turn failed") + "]");
      live = null;
      statusEl.textContent = "error";
      break;
    case "turn.completed":
    case "session.waiting":
      statusEl.textContent = "idle";
      void refreshMindlog();
      break;
  }
}

async function send(text) {
  bubble("me", "you", text);
  statusEl.textContent = "thinking";

  const fresh = sessionId === null;
  const url = fresh ? "/eve/v1/session" : "/eve/v1/session/" + sessionId;
  let res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: text }),
  });

  if (res.status === 409) {
    // The session expired or was retired. Start a new one with the same message.
    sessionId = null;
    localStorage.removeItem("nys.session");
    res = await fetch("/eve/v1/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
  }

  const started = await res.json();
  if (!started.ok) {
    bubble("it", "it", "[" + (started.error || res.status) + "]");
    statusEl.textContent = "error";
    return;
  }

  if (started.sessionId !== sessionId) {
    sessionId = started.sessionId;
    localStorage.setItem("nys.session", sessionId);
    void follow(sessionId, 0);
  }
}

// Typing anywhere on the page goes to the composer, so there is nothing to
// click first. Modifier combos, real fields, and button keys are left alone.
input.focus();

document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;

  const active = document.activeElement;
  if (active === input) return;
  if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return;
  if (active instanceof HTMLElement && active.isContentEditable) return;
  if (active instanceof HTMLButtonElement && (e.key === " " || e.key === "Enter")) return;

  if (e.key.length === 1 || e.key === "Backspace") input.focus();
});

document.getElementById("composer").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  void send(text);
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    document.getElementById("composer").requestSubmit();
  }
});

const frame = document.querySelector(".frame");
const grip = document.querySelector(".grip");
const MIN = 280;

function setMindlog(px) {
  const max = Math.max(MIN, window.innerWidth - 360);
  const width = Math.min(Math.max(px, MIN), max);
  frame.style.setProperty("--mindlog", width + "px");
  try { localStorage.setItem("nys.mindlog", String(width)); } catch {}
}

grip.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  const move = (ev) => setMindlog(window.innerWidth - ev.clientX);
  const up = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", up);
    document.body.style.userSelect = "";
  };
  document.body.style.userSelect = "none";
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
});

grip.addEventListener("keydown", (e) => {
  const step = e.shiftKey ? 64 : 16;
  if (e.key === "ArrowLeft") setMindlog(mindlogEl.parentElement.getBoundingClientRect().width + step);
  else if (e.key === "ArrowRight") setMindlog(mindlogEl.parentElement.getBoundingClientRect().width - step);
  else return;
  e.preventDefault();
});

try {
  const saved = Number(localStorage.getItem("nys.mindlog"));
  if (Number.isFinite(saved) && saved > 0) setMindlog(saved);
} catch {}

const themeButton = document.getElementById("theme");

function currentTheme() {
  const stamped = document.documentElement.getAttribute("data-theme");
  if (stamped) return stamped;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function paintThemeButton() {
  themeButton.textContent = currentTheme() === "dark" ? "light" : "dark";
}

themeButton.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try { localStorage.setItem("nys.theme", next); } catch {}
  paintThemeButton();
});

matchMedia("(prefers-color-scheme: dark)").addEventListener("change", paintThemeButton);
paintThemeButton();

document.getElementById("think").addEventListener("click", async (e) => {
  const button = e.currentTarget;
  button.disabled = true;
  button.textContent = "waking";
  try {
    const res = await fetch("/api/think", { method: "POST" });
    if (!res.ok) button.textContent = "failed";
  } finally {
    setTimeout(() => { button.disabled = false; button.textContent = "Wake it"; }, 4000);
  }
});

// Replay the session from the start so a refresh shows the conversation again,
// then pick the live stream up at the tail. eve already stores every event; the
// page keeps no transcript of its own.
async function restore(id) {
  statusEl.textContent = "loading";
  try {
    const res = await fetch("/eve/v1/session/" + id + "/stream?startIndex=0&includeTailIndex=1");
    if (res.status === 409) {
      sessionId = null;
      localStorage.removeItem("nys.session");
      statusEl.textContent = "idle";
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.trim() === "") continue;
        let event;
        try { event = JSON.parse(line); } catch { continue; }
        const data = event.data || {};
        if (event.type === "message.received") bubble("me", "you", data.message || "");
        else if (event.type === "message.completed" && data.message) bubble("it", "it", data.message);
      }
    }
  } catch {}
  statusEl.textContent = "idle";
  void follow(id, -1);
}

if (sessionId !== null) void restore(sessionId);
void refreshMindlog();
setInterval(refreshMindlog, 3000);
</script>
</body>
</html>`;
