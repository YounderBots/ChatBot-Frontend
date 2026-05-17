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
    document.querySelector('script[data-api-key]');

  const API_KEY  = scriptTag?.dataset?.apiKey  || "";
  const POSITION = scriptTag?.dataset?.position || "bottom-right";
  const COLOR    = scriptTag?.dataset?.color    || "#6366f1";

  // Backend URLs are injected by the server into the embed snippet via data-* attributes.
  // They must never be hardcoded here to avoid localhost leaking into production.
  const ADMIN_BASE = scriptTag?.dataset?.adminUrl || "";
  const CHAT_BASE  = scriptTag?.dataset?.chatUrl  || "";
  const WS_BASE    = scriptTag?.dataset?.wsUrl    || "";

  if (!API_KEY) {
    console.warn("[ChatViq] No data-api-key found on the script tag.");
    return;
  }

  if (!ADMIN_BASE || !CHAT_BASE || !WS_BASE) {
    console.error(
      "[ChatViq] data-admin-url, data-chat-url, and data-ws-url are required on the script tag. " +
      "Regenerate your embed snippet from the ChatViq dashboard."
    );
    return;
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
    .cvq-msg.bot { align-self:flex-start; }
    .cvq-msg.user { align-self:flex-end; align-items:flex-end; }
    .cvq-bubble {
      padding:10px 13px; border-radius:16px; font-size:14px; line-height:1.45;
      word-wrap:break-word;
    }
    .cvq-msg.bot  .cvq-bubble { background:#fff; color:#1f2937; box-shadow:0 1px 4px rgba(0,0,0,.1); border-bottom-left-radius:4px; }
    .cvq-msg.user .cvq-bubble { background:var(--cvq-color,${COLOR}); color:#fff; border-bottom-right-radius:4px; }
    .cvq-ts { font-size:10px; color:#9ca3af; margin-top:3px; }

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

    @media (max-width:480px) {
      #cvq-window { width:calc(100vw - 24px); height:70vh; right:0 !important; left:0 !important; margin:0 12px; }
    }
  `;

  // ── DOM builders ──────────────────────────────────────────────────────────
  function injectStyles() {
    const s = document.createElement("style");
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
          appendMessage("bot", data.response.message || data.response.text || "");
        }
      } catch (err) {
        console.error("[ChatViq] WS message parse error:", err);
      }
    };

    ws.onclose = () => {
      wsReady = false;
      const delay = Math.min(1000 * 2 ** reconnectN, 30000);
      reconnectN++;
      if (reconnectN < 8) setTimeout(connectWS, delay);
    };

    ws.onerror = () => ws.close();
  }

  // ── Send message ──────────────────────────────────────────────────────────
  function handleSend() {
    const input = document.getElementById("cvq-input");
    const text  = input?.value.trim();
    if (!text) return;

    input.value = "";
    input.style.height = "auto";
    appendMessage("user", text);

    const msg = { session_id: sessionId, text };
    if (wsReady && ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    } else {
      msgQueue.push(msg);
      if (!sessionKey) initSession();
    }

    showTyping();
  }

  // ── Message rendering ─────────────────────────────────────────────────────
  function appendMessage(sender, text, ts) {
    const msgs    = document.getElementById("cvq-messages");
    const wrapper = document.createElement("div");
    wrapper.className = `cvq-msg ${sender}`;

    const bubble = document.createElement("div");
    bubble.className = "cvq-bubble";
    bubble.textContent = text;

    const timestamp = document.createElement("span");
    timestamp.className = "cvq-ts";
    timestamp.textContent = ts
      ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    wrapper.appendChild(bubble);
    wrapper.appendChild(timestamp);
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
    if (isOpen || proactiveTriggered) return;
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
      setTimeout(() => {
        if (!isOpen) toggleWidget();
        if (trigger.message) {
          setTimeout(() => appendMessage("bot", trigger.message), 300);
        }
      }, delay);
    } catch (_) {
      // Non-fatal: proactive triggers are best-effort
    }
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  async function init() {
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

    // Re-evaluate on scroll (scroll-depth based triggers)
    let _scrollTimer = null;
    window.addEventListener("scroll", () => {
      clearTimeout(_scrollTimer);
      _scrollTimer = setTimeout(() => checkProactiveTrigger(_getScrollPct()), 500);
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
