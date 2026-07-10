/**
 * ChatViq Embeddable Widget
 * -------------------------
 * Drop-in customer-facing chat widget. Embed with:
 *
 *   <script src="https://your-domain.com/widget/chatviq.js"
 *           data-api-key="cvq_..."
 *           data-position="bottom-right"
 *           data-color="#6366f1"
 *           async></script>
 *
 * All config is loaded dynamically from the API key — no hard-coded values needed.
 */

(function () {
  "use strict";

  // ── Config ────────────────────────────────────────────────────────────────
  const scriptTag = document.currentScript ||
    document.querySelector('script[data-api-key]') ||
    document.querySelector('script[src*="chatviq.js"]');

  const POSITION = scriptTag?.dataset?.position || "bottom-right";
  const COLOR    = scriptTag?.dataset?.color    || "#6366f1";

  // First-run setup persistence. When the downloadable SDK is opened without a
  // baked-in key/URLs (e.g. a site owner testing the standalone HTML), the
  // widget prompts for them once and remembers the choice here so the visitor
  // is never asked again on the same origin.
  const STORE_PREFIX = "cvq_setup_";
  function stored(name) {
    try { return localStorage.getItem(STORE_PREFIX + name) || ""; } catch (_) { return ""; }
  }
  function store(name, val) {
    try { localStorage.setItem(STORE_PREFIX + name, val); } catch (_) { /* private mode */ }
  }

  // Config precedence: script data-* attribute → previously-saved setup value.
  // Backend URLs are injected by the server into the embed snippet via data-*
  // attributes and must never be hardcoded here to avoid localhost leaking into
  // production; when absent they fall back to whatever was entered at setup.
  let API_KEY    = scriptTag?.dataset?.apiKey   || stored("key")      || "";
  let ADMIN_BASE = scriptTag?.dataset?.adminUrl || stored("adminUrl") || "";
  let CHAT_BASE  = scriptTag?.dataset?.chatUrl  || stored("chatUrl")  || "";
  let WS_BASE    = scriptTag?.dataset?.wsUrl    || stored("wsUrl")    || "";

  // Which required fields are still missing? Drives the first-run setup panel.
  function missingConfig() {
    const missing = [];
    if (!API_KEY)    missing.push("key");
    if (!ADMIN_BASE) missing.push("adminUrl");
    if (!CHAT_BASE)  missing.push("chatUrl");
    if (!WS_BASE)    missing.push("wsUrl");
    return missing;
  }

  // ── State ─────────────────────────────────────────────────────────────────
  let isOpen       = false;
  let sessionKey   = null;
  let sessionId    = null;
  let ws           = null;
  let wsReady      = false;
  let msgQueue     = [];
  let reconnectN   = 0;
  let config       = {};
  let proactiveTriggered = false;

  // Teardown bookkeeping. Everything the widget attaches to the page or the
  // event loop is tracked here so window.__chatviq.destroy() can undo it.
  let destroyed      = false;
  let scrollHandler  = null;
  let scrollDebounce = null;
  let pendingTimers  = [];
  function track(id) { pendingTimers.push(id); return id; }

  // ── CSS ───────────────────────────────────────────────────────────────────
  const css = `
    #cvq-widget-container * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #cvq-widget-container { position: fixed; z-index: 2147483647; ${POSITION.includes("right") ? "right:20px" : "left:20px"}; ${POSITION.includes("top") ? "top:20px" : "bottom:20px"}; }

    #cvq-toggle-btn {
      width: 56px; height: 56px; border-radius: 50%;
      background: var(--cvq-color, ${COLOR}); color: #fff;
      border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,.25);
      display: flex; align-items: center; justify-content: center;
      transition: transform .2s, box-shadow .2s;
      font-size: 24px;
    }
    #cvq-toggle-btn:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(0,0,0,.3); }

    #cvq-badge {
      position: absolute; top:-4px; right:-4px;
      background:#ef4444; color:#fff; border-radius:50%;
      width:18px; height:18px; font-size:11px; font-weight:700;
      display:flex; align-items:center; justify-content:center;
    }

    #cvq-window {
      position: absolute; ${POSITION.includes("right") ? "right:0" : "left:0"}; bottom: 68px;
      width: 360px; height: 520px; border-radius: 16px;
      background: #fff; box-shadow: 0 12px 48px rgba(0,0,0,.2);
      display: flex; flex-direction: column; overflow: hidden;
      transform-origin: bottom ${POSITION.includes("right") ? "right" : "left"};
      animation: cvq-open .2s ease-out;
    }
    @keyframes cvq-open {
      from { transform: scale(.9); opacity:0; }
      to   { transform: scale(1);  opacity:1; }
    }

    #cvq-header {
      background: var(--cvq-color, ${COLOR}); color: #fff;
      padding: 14px 16px; display: flex; align-items: center; gap: 10px;
    }
    #cvq-header-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,.25); display: flex; align-items:center; justify-content:center;
      overflow: hidden; flex-shrink:0;
    }
    #cvq-header-avatar img { width:100%; height:100%; object-fit:cover; }
    #cvq-header-info { flex:1; }
    #cvq-header-name { font-weight:700; font-size:15px; }
    #cvq-header-status { font-size:11px; opacity:.85; }
    #cvq-close-btn { background:none; border:none; color:#fff; cursor:pointer; opacity:.8; font-size:18px; padding:4px; }
    #cvq-close-btn:hover { opacity:1; }

    #cvq-messages {
      flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:10px;
      background: #f8f9fa;
    }
    #cvq-messages::-webkit-scrollbar { width:4px; }
    #cvq-messages::-webkit-scrollbar-thumb { background:#ddd; border-radius:4px; }

    .cvq-msg { display:flex; flex-direction:column; max-width:80%; }
    /* Rich bot answers (lists/tables) need more room than a plain reply. */
    .cvq-msg.bot.cvq-rich { max-width:94%; }
    .cvq-msg.bot { align-self:flex-start; }
    .cvq-msg.user { align-self:flex-end; align-items:flex-end; }
    .cvq-bubble {
      padding:10px 13px; border-radius:16px; font-size:14px; line-height:1.45;
      word-wrap:break-word;
    }
    .cvq-msg.bot  .cvq-bubble { background:#fff; color:#1f2937; box-shadow:0 1px 4px rgba(0,0,0,.1); border-bottom-left-radius:4px; }
    .cvq-msg.user .cvq-bubble { background:var(--cvq-color,${COLOR}); color:#fff; border-bottom-right-radius:4px; }
    .cvq-ts { font-size:10px; color:#9ca3af; margin-top:3px; }
    .cvq-quick { display:flex; flex-wrap:wrap; gap:6px; margin-top:6px; }
    .cvq-qr-btn { font:inherit; font-size:13px; padding:6px 12px; border-radius:16px; cursor:pointer;
      background:#fff; color:var(--cvq-color,${COLOR}); border:1px solid var(--cvq-color,${COLOR}); transition:background .15s,color .15s; }
    .cvq-qr-btn:hover:not(:disabled) { background:var(--cvq-color,${COLOR}); color:#fff; }
    .cvq-qr-btn:disabled { opacity:.5; cursor:default; }
    /* ── Rich HTML content (authored intent responses: lists, tables, links) ── */
    .cvq-bubble { overflow-wrap:anywhere; }
    .cvq-bubble > *:first-child { margin-top:0; }
    .cvq-bubble > *:last-child  { margin-bottom:0; }
    .cvq-bubble p  { margin:6px 0; }
    .cvq-bubble ul, .cvq-bubble ol { margin:6px 0; padding-left:18px; }
    .cvq-bubble li { margin:3px 0; }
    .cvq-bubble li > p { margin:0; }                 /* tighten <li><p>…</p></li> */
    /* Tables scroll horizontally inside their own wrapper so the bubble never
       stretches the chat window or crushes columns. */
    .cvq-table-wrap { overflow-x:auto; margin:8px 0; -webkit-overflow-scrolling:touch; }
    .cvq-table-wrap::-webkit-scrollbar { height:6px; }
    .cvq-table-wrap::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:4px; }
    .cvq-bubble table { border-collapse:collapse; width:auto; min-width:100%; font-size:12.5px; }
    .cvq-bubble th, .cvq-bubble td { border:1px solid #e5e7eb; padding:6px 9px; text-align:left; vertical-align:top; }
    .cvq-bubble th { background:#f3f4f6; font-weight:600; white-space:nowrap; }
    .cvq-bubble td p, .cvq-bubble th p { margin:0; }
    .cvq-bubble img { max-width:100%; height:auto; border-radius:6px; }
    .cvq-bubble a { color:var(--cvq-color,${COLOR}); text-decoration:underline; }

    .cvq-typing { display:flex; gap:4px; padding:10px 13px; background:#fff; border-radius:16px; border-bottom-left-radius:4px; box-shadow:0 1px 4px rgba(0,0,0,.1); align-self:flex-start; }
    .cvq-typing span { width:7px; height:7px; background:#9ca3af; border-radius:50%; animation:cvq-bounce 1.2s infinite; }
    .cvq-typing span:nth-child(2) { animation-delay:.2s; }
    .cvq-typing span:nth-child(3) { animation-delay:.4s; }
    @keyframes cvq-bounce { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-6px); } }

    #cvq-footer {
      padding:10px 12px; background:#fff; border-top:1px solid #f1f5f9;
      display:flex; gap:8px; align-items:flex-end;
    }
    #cvq-input {
      flex:1; border:1px solid #e2e8f0; border-radius:10px;
      padding:9px 12px; font-size:14px; outline:none; resize:none;
      max-height:100px; overflow-y:auto; line-height:1.4;
    }
    #cvq-input:focus { border-color:var(--cvq-color,${COLOR}); }
    #cvq-send-btn {
      background:var(--cvq-color,${COLOR}); color:#fff;
      border:none; border-radius:10px; padding:9px 14px;
      cursor:pointer; font-size:16px; flex-shrink:0;
      transition:opacity .15s;
    }
    #cvq-send-btn:disabled { opacity:.5; cursor:not-allowed; }
    #cvq-send-btn:hover:not(:disabled) { opacity:.9; }

    #cvq-powered { text-align:center; font-size:10px; color:#9ca3af; padding:6px 0 4px; background:#fff; }
    #cvq-powered a { color:#6366f1; text-decoration:none; }

    /* First-run setup panel */
    #cvq-setup {
      position:absolute; ${POSITION.includes("right") ? "right:0" : "left:0"}; bottom:68px;
      width:340px; border-radius:16px; background:#fff;
      box-shadow:0 12px 48px rgba(0,0,0,.2); overflow:hidden;
      transform-origin:bottom ${POSITION.includes("right") ? "right" : "left"};
      animation:cvq-open .2s ease-out;
    }
    #cvq-setup-head { background:var(--cvq-color,${COLOR}); color:#fff; padding:16px; }
    #cvq-setup-head h4 { margin:0 0 4px; font-size:15px; font-weight:700; }
    #cvq-setup-head p  { margin:0; font-size:12px; opacity:.9; line-height:1.4; }
    #cvq-setup-body { padding:16px; display:flex; flex-direction:column; gap:12px; }
    .cvq-field label { display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:4px; }
    .cvq-field input {
      width:100%; border:1px solid #e2e8f0; border-radius:9px; padding:9px 11px;
      font-size:13px; outline:none; font-family:inherit;
    }
    .cvq-field input:focus { border-color:var(--cvq-color,${COLOR}); }
    #cvq-setup-err { color:#ef4444; font-size:12px; min-height:0; margin:0; }
    #cvq-setup-connect {
      background:var(--cvq-color,${COLOR}); color:#fff; border:none; border-radius:10px;
      padding:10px; font-size:14px; font-weight:600; cursor:pointer; transition:opacity .15s;
    }
    #cvq-setup-connect:disabled { opacity:.6; cursor:not-allowed; }
    #cvq-setup-connect:hover:not(:disabled) { opacity:.9; }
    #cvq-setup .cvq-setup-hint { font-size:11px; color:#9ca3af; margin:0; line-height:1.4; }

    @media (max-width:480px) {
      #cvq-window, #cvq-setup { width:calc(100vw - 24px); right:0 !important; left:0 !important; margin:0 12px; }
      #cvq-window { height:70vh; }
    }
  `;

  // ── DOM builders ──────────────────────────────────────────────────────────
  let _stylesInjected = false;
  function injectStyles() {
    // Keyed by id so framework wrappers (e.g. @chatviq/react) can remove it on
    // unmount and so a re-mount never stacks duplicate <style> blocks.
    if (_stylesInjected || document.getElementById("cvq-styles")) {
      _stylesInjected = true;
      return;
    }
    _stylesInjected = true;
    const s = document.createElement("style");
    s.id = "cvq-styles";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function buildWidget() {
    const container = document.createElement("div");
    container.id = "cvq-widget-container";
    container.style.setProperty("--cvq-color", config.primary_color || COLOR);

    // Toggle button
    const btn = document.createElement("button");
    btn.id   = "cvq-toggle-btn";
    btn.title = "Chat with us";
    btn.innerHTML = "💬";
    btn.addEventListener("click", toggleWidget);

    const badge = document.createElement("span");
    badge.id   = "cvq-badge";
    badge.style.display = "none";
    badge.textContent   = "1";
    btn.appendChild(badge);

    // Chat window
    const win = document.createElement("div");
    win.id    = "cvq-window";
    win.style.display = "none";

    // Header
    const avatarSrc = config.bot_avatar_url;
    win.innerHTML = `
      <div id="cvq-header">
        <div id="cvq-header-avatar">
          ${avatarSrc ? `<img src="${avatarSrc}" alt="bot">` : "🤖"}
        </div>
        <div id="cvq-header-info">
          <div id="cvq-header-name">${config.bot_name || "Support Bot"}</div>
          <div id="cvq-header-status">● Online</div>
        </div>
        <button id="cvq-close-btn" title="Close">✕</button>
      </div>
      <div id="cvq-messages"></div>
      <div id="cvq-footer">
        <textarea id="cvq-input" placeholder="Type a message…" rows="1"></textarea>
        <button id="cvq-send-btn">➤</button>
      </div>
      <div id="cvq-powered">Powered by <a href="#" target="_blank">ChatViq</a></div>
    `;

    container.appendChild(win);
    container.appendChild(btn);
    document.body.appendChild(container);

    // Events
    container.querySelector("#cvq-close-btn").addEventListener("click", toggleWidget);
    const sendBtn = container.querySelector("#cvq-send-btn");
    const input   = container.querySelector("#cvq-input");
    sendBtn.addEventListener("click", handleSend);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 100) + "px";
    });

    // Greeting message
    if (config.greeting_message) {
      appendMessage("bot", config.greeting_message);
    }
  }

  // ── Widget open/close ──────────────────────────────────────────────────────
  function toggleWidget() {
    isOpen = !isOpen;
    const win = document.getElementById("cvq-window");
    const btn = document.getElementById("cvq-toggle-btn");
    const badge = document.getElementById("cvq-badge");

    if (isOpen) {
      win.style.display = "flex";
      btn.innerHTML = "✕";
      badge.style.display = "none";
      document.getElementById("cvq-input")?.focus();
      initSession();
    } else {
      win.style.display = "none";
      btn.innerHTML = "💬";
    }
  }

  // ── Session management ────────────────────────────────────────────────────
  async function initSession() {
    if (sessionKey) {
      connectWS();
      return;
    }
    try {
      const resp = await fetch(`${CHAT_BASE}/chat/session`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "X-Widget-Key":  API_KEY,
        },
        body: JSON.stringify({
          name:     "Website Visitor",
          email:    "",
          platform: "widget",
        }),
      });
      if (!resp.ok) throw new Error("Session init failed");
      const data = await resp.json();
      sessionKey = data.session_key;
      sessionId  = data.session_id;
      connectWS();
    } catch (err) {
      console.error("[ChatViq] Session init error:", err);
      appendMessage("bot", "Sorry, I couldn't connect. Please try again.");
    }
  }

  // ── WebSocket ─────────────────────────────────────────────────────────────
  function connectWS() {
    if (destroyed) return;
    if (ws && ws.readyState === WebSocket.OPEN) return;
    ws = new WebSocket(`${WS_BASE}/chat/ws/chat`);

    ws.onopen = () => {
      wsReady = true;
      reconnectN = 0;
      // Authenticate
      ws.send(JSON.stringify({ type: "AUTH", token: sessionKey }));
      // Flush queued messages
      msgQueue.forEach(m => ws.send(JSON.stringify(m)));
      msgQueue = [];
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "HISTORY") {
          (data.messages || []).forEach(m => {
            if (m.sender !== "user") appendMessage("bot", m.message_text, m.created_at);
          });
        } else if (data.type === "TYPING") {
          showTyping();
        } else if (data.response) {
          hideTyping();
          appendMessage("bot", data.response.message || data.response.text || "", null, data.response.format, data.response.quick_replies);
        }
      } catch (err) {
        console.error("[ChatViq] WS message parse error:", err);
      }
    };

    ws.onclose = () => {
      wsReady = false;
      if (destroyed) return;
      const delay = Math.min(1000 * 2 ** reconnectN, 30000);
      reconnectN++;
      if (reconnectN < 8) track(setTimeout(connectWS, delay));
    };

    ws.onerror = () => ws.close();
  }

  // ── Send message ──────────────────────────────────────────────────────────
  // Send arbitrary text to the bot. `displayText` is what the visitor sees in
  // history (e.g. a quick-reply's friendly label), while `text` is the payload
  // sent to the backend (e.g. the reply's message_value / intent name).
  function sendText(text, displayText) {
    if (!text) return;
    appendMessage("user", displayText || text);

    const msg = { session_id: sessionId, text };
    if (wsReady && ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    } else {
      msgQueue.push(msg);
      if (!sessionKey) initSession();
    }
    showTyping();
  }

  function handleSend() {
    const input = document.getElementById("cvq-input");
    const text  = input?.value.trim();
    if (!text) return;
    input.value = "";
    input.style.height = "auto";
    sendText(text);
  }

  // ── HTML sanitiser (allowlist) ────────────────────────────────────────────
  // Rich intent responses (response_format="html") may include formatting,
  // tables and images. We render them as HTML but scrub anything unsafe first —
  // scripts, event handlers, javascript: URLs, unknown tags — so an authored
  // response can never inject active content into a visitor's page.
  const CVQ_ALLOWED = {
    A: ["href", "title", "target", "rel"], B: [], STRONG: [], I: [], EM: [], U: [],
    BR: [], P: [], SPAN: [], DIV: [], H2: [], H3: [], H4: [], UL: [], OL: [], LI: [],
    BLOCKQUOTE: [], CODE: [], PRE: [], HR: [],
    TABLE: [], THEAD: [], TBODY: [], TR: [], TH: ["colspan", "rowspan"], TD: ["colspan", "rowspan"],
    IMG: ["src", "alt", "width", "height"],
  };
  const CVQ_DANGEROUS = ["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "LINK", "META", "SVG", "FORM", "INPUT", "BUTTON", "TEXTAREA"];

  function cvqSafeUrl(name, value) {
    const v = (value || "").trim().toLowerCase();
    if (name === "src") return /^(https?:|\/|\.\/)/.test(v) || v.startsWith("data:image/");
    return /^(https?:|mailto:|\/|\.\/|#)/.test(v);   // href
  }

  function cvqClean(node) {
    Array.prototype.slice.call(node.childNodes).forEach((child) => {
      if (child.nodeType === 3) return;                 // text — keep
      if (child.nodeType !== 1) { child.remove(); return; }  // comments etc — drop
      const tag = child.tagName;
      if (CVQ_DANGEROUS.indexOf(tag) !== -1) { child.remove(); return; }
      if (!CVQ_ALLOWED[tag]) {                          // unknown tag — unwrap
        cvqClean(child);
        const parent = child.parentNode;
        while (child.firstChild) parent.insertBefore(child.firstChild, child);
        child.remove();
        return;
      }
      Array.prototype.slice.call(child.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (name.indexOf("on") === 0 || CVQ_ALLOWED[tag].indexOf(name) === -1) {
          child.removeAttribute(attr.name);
        } else if ((name === "href" || name === "src") && !cvqSafeUrl(name, attr.value)) {
          child.removeAttribute(attr.name);
        }
      });
      if (tag === "A") { child.setAttribute("target", "_blank"); child.setAttribute("rel", "noopener noreferrer"); }
      cvqClean(child);
    });
  }

  function cvqSanitize(html) {
    const tmpl = document.createElement("template");
    tmpl.innerHTML = html || "";
    cvqClean(tmpl.content);
    cvqTidy(tmpl.content);
    return tmpl.innerHTML;
  }

  // Post-sanitize tidy-up for rich authored responses:
  //  • drop empty <p></p> the editor leaves behind (dead vertical space)
  //  • fix invalid colspan/rowspan="undefined" so cells span 1 (not the literal)
  //  • wrap every <table> in a scroll container so wide tables scroll instead of
  //    stretching or crushing the chat bubble.
  function cvqTidy(root) {
    root.querySelectorAll("p").forEach((p) => {
      if (!p.textContent.trim() && !p.querySelector("img")) p.remove();
    });
    root.querySelectorAll("th, td").forEach((cell) => {
      ["colspan", "rowspan"].forEach((a) => {
        const v = parseInt(cell.getAttribute(a), 10);
        if (cell.hasAttribute(a) && !(v > 1)) cell.removeAttribute(a);
      });
    });
    root.querySelectorAll("table").forEach((table) => {
      table.removeAttribute("style");
      const wrap = document.createElement("div");
      wrap.className = "cvq-table-wrap";
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  // ── Message rendering ─────────────────────────────────────────────────────
  function appendMessage(sender, text, ts, format, quickReplies) {
    const msgs    = document.getElementById("cvq-messages");
    const wrapper = document.createElement("div");
    wrapper.className = `cvq-msg ${sender}`;

    const bubble = document.createElement("div");
    bubble.className = "cvq-bubble";
    if (sender === "bot" && format === "html") {
      bubble.innerHTML = cvqSanitize(text);
      // Widen the message when it carries block content (tables/lists) so it
      // isn't crammed into the default narrow bubble.
      if (bubble.querySelector("table, ul, ol")) wrapper.classList.add("cvq-rich");
    } else {
      bubble.textContent = text;
    }

    const timestamp = document.createElement("span");
    timestamp.className = "cvq-ts";
    timestamp.textContent = ts
      ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    wrapper.appendChild(bubble);
    wrapper.appendChild(timestamp);

    // Quick-reply buttons (intent menus + no-match re-prompts). Clicking sends
    // the reply's payload; buttons disable after a choice so history stays clean.
    if (sender === "bot" && Array.isArray(quickReplies) && quickReplies.length) {
      const row = document.createElement("div");
      row.className = "cvq-quick";
      quickReplies.forEach((qr) => {
        const label = qr.button_text || qr.text || qr.message_value || "";
        const value = qr.message_value || qr.value || label;
        if (!label) return;
        const b = document.createElement("button");
        b.className = "cvq-qr-btn";
        b.textContent = label;
        b.addEventListener("click", () => {
          row.querySelectorAll("button").forEach((x) => { x.disabled = true; });
          sendText(value, label);
        });
        row.appendChild(b);
      });
      if (row.childNodes.length) wrapper.appendChild(row);
    }

    msgs.appendChild(wrapper);
    msgs.scrollTop = msgs.scrollHeight;

    // Unread badge when closed
    if (!isOpen && sender === "bot") {
      const badge = document.getElementById("cvq-badge");
      if (badge) badge.style.display = "flex";
    }
  }

  let typingEl = null;
  function showTyping() {
    if (typingEl) return;
    const msgs = document.getElementById("cvq-messages");
    typingEl = document.createElement("div");
    typingEl.className = "cvq-typing";
    typingEl.innerHTML = "<span></span><span></span><span></span>";
    msgs.appendChild(typingEl);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    if (typingEl) { typingEl.remove(); typingEl = null; }
  }

  // ── Proactive triggers ────────────────────────────────────────────────────
  function _getVisitCount() {
    const key = `cvq_visits_${API_KEY}`;
    const n = parseInt(localStorage.getItem(key) || "0", 10) + 1;
    localStorage.setItem(key, String(n));
    return n;
  }

  function _getScrollPct() {
    const body = document.body;
    const html = document.documentElement;
    const docH = Math.max(body.scrollHeight, html.scrollHeight, body.offsetHeight, html.offsetHeight) - window.innerHeight;
    return docH > 0 ? Math.round((window.scrollY / docH) * 100) : 0;
  }

  async function checkProactiveTrigger(scrollPct) {
    if (destroyed || isOpen || proactiveTriggered) return;
    if (!config.organization_id) return;
    try {
      const params = new URLSearchParams({
        page_url:    window.location.href,
        scroll_pct:  scrollPct ?? _getScrollPct(),
        visit_count: _getVisitCount(),
        org_id:      config.organization_id,
      });
      const resp = await fetch(`${ADMIN_BASE}/proactive/match?${params}`, {
        headers: { "X-Widget-Key": API_KEY },
      });
      if (!resp.ok) return;
      const trigger = await resp.json();
      if (!trigger || !trigger.is_active) return;

      proactiveTriggered = true;
      const delay = (trigger.delay_seconds || 0) * 1000;
      track(setTimeout(() => {
        if (destroyed) return;
        if (!isOpen) toggleWidget();
        if (trigger.message) {
          track(setTimeout(() => { if (!destroyed) appendMessage("bot", trigger.message); }, 300));
        }
      }, delay));
    } catch (_) {
      // Non-fatal: proactive triggers are best-effort
    }
  }

  // ── First-run setup panel ───────────────────────────────────────────────────
  // Shown when the widget loads without a complete config (missing key or
  // backend URLs) — e.g. a site owner opening the downloadable SDK's standalone
  // HTML. It prompts for the missing values, validates the key against the API,
  // then remembers them (localStorage) so the visitor is never asked again.
  const FIELD_META = {
    key:      { label: "Widget API Key", placeholder: "cvq_..." },
    adminUrl: { label: "Admin API URL",  placeholder: "https://api.yoursite.com/admin" },
    chatUrl:  { label: "Chat API URL",   placeholder: "https://api.yoursite.com/chat" },
    wsUrl:    { label: "WebSocket URL",  placeholder: "wss://api.yoursite.com" },
  };

  function renderSetup() {
    injectStyles();

    const container = document.createElement("div");
    container.id = "cvq-widget-container";
    container.style.setProperty("--cvq-color", COLOR);

    const btn = document.createElement("button");
    btn.id = "cvq-toggle-btn";
    btn.title = "Set up chat";
    btn.innerHTML = "💬";

    const panel = document.createElement("div");
    panel.id = "cvq-setup";
    panel.style.display = "none";

    const missing = missingConfig();
    const fieldsHtml = missing.map((name) => {
      const m = FIELD_META[name];
      return `<div class="cvq-field">
        <label for="cvq-f-${name}">${m.label}</label>
        <input id="cvq-f-${name}" type="text" placeholder="${m.placeholder}" autocomplete="off" spellcheck="false" />
      </div>`;
    }).join("");

    panel.innerHTML = `
      <div id="cvq-setup-head">
        <h4>Connect your chat widget</h4>
        <p>Enter your ChatViq widget key to activate chat on this page.</p>
      </div>
      <div id="cvq-setup-body">
        ${fieldsHtml}
        <p id="cvq-setup-err"></p>
        <button id="cvq-setup-connect" type="button">Connect</button>
        <p class="cvq-setup-hint">Find your key under Channels → Embeddable Widget in the ChatViq dashboard.</p>
      </div>
    `;

    container.appendChild(panel);
    container.appendChild(btn);
    document.body.appendChild(container);

    btn.addEventListener("click", () => {
      const isShown = panel.style.display === "block";
      panel.style.display = isShown ? "none" : "block";
      btn.innerHTML = isShown ? "💬" : "✕";
      if (!isShown) container.querySelector("input")?.focus();
    });

    const connectBtn = panel.querySelector("#cvq-setup-connect");
    const errEl = panel.querySelector("#cvq-setup-err");

    async function connect() {
      errEl.textContent = "";
      const vals = {};
      for (const name of missing) {
        const raw = panel.querySelector(`#cvq-f-${name}`).value.trim();
        if (!raw) { errEl.textContent = "Please fill in every field."; return; }
        // Normalise URLs (strip trailing slashes); the key is used verbatim.
        vals[name] = name === "key" ? raw : raw.replace(/\/+$/, "");
      }

      // Apply candidate values, then validate the key against the API.
      if (vals.key)      API_KEY    = vals.key;
      if (vals.adminUrl) ADMIN_BASE = vals.adminUrl;
      if (vals.chatUrl)  CHAT_BASE  = vals.chatUrl;
      if (vals.wsUrl)    WS_BASE    = vals.wsUrl;

      connectBtn.disabled = true;
      connectBtn.textContent = "Connecting…";
      let ok = false;
      try {
        const resp = await fetch(`${ADMIN_BASE}/widget/config`, {
          headers: { "X-Widget-Key": API_KEY },
        });
        ok = resp.ok;
      } catch (_) {
        ok = false;
      }

      if (!ok) {
        connectBtn.disabled = false;
        connectBtn.textContent = "Connect";
        errEl.textContent = "Couldn't connect with those details. Check your key and URLs, then try again.";
        return;
      }

      // Persist and swap the setup panel for the real chat widget. Await boot()
      // so the chat DOM exists before we open it.
      for (const name of missing) store(name, vals[name]);
      container.remove();
      await boot();
      toggleWidget();  // open chat immediately after a successful setup
    }

    connectBtn.addEventListener("click", connect);
    panel.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !connectBtn.disabled) { e.preventDefault(); connect(); }
    });
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  async function boot() {
    try {
      // Load widget config from API key
      const resp = await fetch(`${ADMIN_BASE}/widget/config`, {
        headers: { "X-Widget-Key": API_KEY },
      });
      if (resp.ok) {
        config = await resp.json();
      }
    } catch (err) {
      console.warn("[ChatViq] Could not load widget config, using defaults.");
    }

    injectStyles();
    buildWidget();

    // Evaluate proactive triggers on load (URL + time-on-page based)
    checkProactiveTrigger(0);

    // Re-evaluate on scroll (scroll-depth based triggers). Kept in a named
    // handler ref so destroy() can detach it.
    scrollHandler = () => {
      clearTimeout(scrollDebounce);
      scrollDebounce = track(setTimeout(() => checkProactiveTrigger(_getScrollPct()), 500));
    };
    window.addEventListener("scroll", scrollHandler, { passive: true });
  }

  // ── Teardown ────────────────────────────────────────────────────────────────
  // Fully removes the widget: stops reconnects and pending timers, closes the
  // socket, and strips the injected DOM/styles. Exposed as
  // window.__chatviq.destroy() so framework wrappers (e.g. @chatviq/react) can
  // clean up on unmount. Safe to call more than once.
  function destroy() {
    destroyed = true;

    // Detach the scroll-trigger listener and its debounce.
    if (scrollHandler) {
      window.removeEventListener("scroll", scrollHandler);
      scrollHandler = null;
    }
    clearTimeout(scrollDebounce);
    scrollDebounce = null;

    // Cancel every pending proactive / reconnect timer.
    pendingTimers.forEach(clearTimeout);
    pendingTimers = [];

    // Close the socket without letting onclose schedule a reconnect.
    if (ws) {
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
      try { ws.close(); } catch (_) { /* already closing */ }
      ws = null;
    }
    wsReady = false;

    // Remove injected DOM (covers both the chat widget and the setup panel).
    document.getElementById("cvq-widget-container")?.remove();
    document.getElementById("cvq-styles")?.remove();

    // Reset transient state so a fresh init() can cleanly re-mount later.
    isOpen = false;
    sessionKey = null;
    sessionId = null;
    msgQueue = [];
    reconnectN = 0;
    proactiveTriggered = false;
    typingEl = null;
    _stylesInjected = false;

    if (window.__chatviq && window.__chatviq.destroy === destroy) {
      try { delete window.__chatviq; } catch (_) { window.__chatviq = undefined; }
    }
  }

  // Decide between first-run setup and the live chat widget.
  function init() {
    if (missingConfig().length) {
      renderSetup();
    } else {
      boot();
    }
  }

  // Public programmatic API.
  window.__chatviq = window.__chatviq || {};
  window.__chatviq.destroy = destroy;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
