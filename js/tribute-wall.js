// js/tribute-wall.js – Globale Tribute Wall (v4.1)
// Speicher-Adapter: Supabase (REST, live für alle Besucher) oder lokal (localStorage).
// Depends on: OzzyUtils, optional window.OZZY_CONFIG. Dual export: window.OzzyTributeWall / module.exports

(function (root, factory) {
  const api = factory(root.OzzyUtils);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.OzzyTributeWall = api;
  if (typeof document !== "undefined" && !(typeof module !== "undefined" && module.exports)) {
    document.addEventListener("DOMContentLoaded", () => api.init(root.OZZY_CONFIG));
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (Utils) {
  "use strict";

  const ENTRIES_KEY = "ozzyCandleEntries";
  const MINE_KEY = "ozzyMyCandles";
  const LAST_KEY = "ozzyLastCandleAt";
  const MAX_NAME = 20;
  const MAX_MESSAGE = 140;
  const MAX_LOCAL = 200;
  const PAGE_SIZE = 60;
  const COOLDOWN_MS = 20000;
  const POLL_MS = 30000;

  // -------------------------
  // PURE HELPERS
  // -------------------------

  function sanitizeMessage(text) {
    if (text == null) return "";
    return String(text)
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_MESSAGE);
  }

  function sanitizeName(name) {
    if (Utils && Utils.sanitizeName) return Utils.sanitizeName(name, MAX_NAME);
    return String(name == null ? "" : name).trim().slice(0, MAX_NAME);
  }

  function normalizeEntry(raw) {
    if (raw == null) return null;
    if (typeof raw === "string") raw = { name: raw };
    if (typeof raw !== "object") return null;
    const created = raw.created_at && !isNaN(Date.parse(raw.created_at)) ? new Date(raw.created_at).toISOString() : "";
    return {
      id: raw.id != null ? String(raw.id) : "",
      name: sanitizeName(raw.name || ""),
      message: sanitizeMessage(raw.message || ""),
      created_at: created,
    };
  }

  /** "0-59/1234" → 1234 */
  function parseContentRange(header) {
    const m = /\/(\d+)\s*$/.exec(header || "");
    return m ? Number(m[1]) : null;
  }

  function relativeTime(iso, now) {
    if (!iso) return "";
    const diff = (Date.parse(iso) - (now == null ? Date.now() : now)) / 1000;
    const units = [
      ["year", 31536000],
      ["month", 2592000],
      ["day", 86400],
      ["hour", 3600],
      ["minute", 60],
    ];
    let rtf = null;
    try {
      rtf = new Intl.RelativeTimeFormat("de", { numeric: "auto" });
    } catch (e) {
      return "";
    }
    for (const [unit, sec] of units) {
      if (Math.abs(diff) >= sec) return rtf.format(Math.round(diff / sec), unit);
    }
    return "gerade eben";
  }

  function isJwt(key) {
    return /^eyJ[\w-]*\.[\w-]+\.[\w-]*$/.test(String(key || ""));
  }

  function cooldownLeft(lastAt, now, ms) {
    const last = Number(lastAt) || 0;
    return Math.max(0, last + (ms == null ? COOLDOWN_MS : ms) - now);
  }

  // -------------------------
  // STORES
  // -------------------------

  function createLocalStore() {
    const getJSON = (k, f) => (Utils ? Utils.safeGetJSON(k, f) : f);
    const setJSON = (k, v) => Utils && Utils.safeSetJSON(k, v);

    function read() {
      let list = getJSON(ENTRIES_KEY, null);
      if (!Array.isArray(list)) {
        // Migration aus v3 (nur Namen)
        const names = Utils && Utils.loadCandles ? Utils.loadCandles() : [];
        const base = Date.now() - names.length * 1000;
        list = names.map((name, i) => ({ id: "local-" + i, name, created_at: new Date(base + i * 1000).toISOString() }));
      }
      return list.map(normalizeEntry).filter(Boolean).slice(-MAX_LOCAL);
    }

    return {
      mode: "local",
      async list() {
        const all = read();
        return { entries: all.slice(-PAGE_SIZE).reverse(), total: all.length };
      },
      async since() {
        return [];
      },
      async add(entry) {
        const all = read();
        const saved = normalizeEntry({
          ...entry,
          id: "local-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
          created_at: new Date().toISOString(),
        });
        all.push(saved);
        setJSON(ENTRIES_KEY, all.slice(-MAX_LOCAL));
        return saved;
      },
    };
  }

  function createSupabaseStore(options) {
    const base = String(options.url || "").replace(/\/+$/, "") + "/rest/v1/candles";
    const key = options.key;
    const doFetch = options.fetch || (typeof fetch === "function" ? fetch.bind(globalThis) : null);
    // Neue Keys (sb_publishable_…) sind keine JWTs → nur als apikey senden.
    // Legacy anon Keys (JWT, "eyJ…") zusätzlich als Bearer-Token.
    const headers = isJwt(key) ? { apikey: key, Authorization: "Bearer " + key } : { apikey: key };
    const select = "select=id,name,message,created_at&order=created_at.desc";

    async function request(url, init) {
      if (!doFetch) throw new Error("fetch nicht verfügbar");
      const res = await doFetch(url, init);
      if (!res.ok) throw new Error("Supabase " + res.status);
      return res;
    }

    return {
      mode: "remote",
      async list() {
        const res = await request(`${base}?${select}&limit=${PAGE_SIZE}`, {
          headers: { ...headers, Prefer: "count=exact" },
        });
        const rows = await res.json();
        const entries = (Array.isArray(rows) ? rows : []).map(normalizeEntry).filter(Boolean);
        const total = parseContentRange(res.headers && res.headers.get && res.headers.get("content-range"));
        return { entries, total: total == null ? entries.length : total };
      },
      async since(iso) {
        if (!iso) return [];
        const res = await request(`${base}?${select}&limit=${PAGE_SIZE}&created_at=gt.${encodeURIComponent(iso)}`, { headers });
        const rows = await res.json();
        return (Array.isArray(rows) ? rows : []).map(normalizeEntry).filter(Boolean);
      },
      async add(entry) {
        const res = await request(base, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json", Prefer: "return=representation" },
          body: JSON.stringify({ name: entry.name, message: entry.message }),
        });
        const rows = await res.json();
        return normalizeEntry(Array.isArray(rows) ? rows[0] : rows);
      },
    };
  }

  function createStore(config, fetchImpl) {
    const c = config || {};
    if (c.supabaseUrl && c.supabaseAnonKey) {
      return createSupabaseStore({ url: c.supabaseUrl, key: c.supabaseAnonKey, fetch: fetchImpl });
    }
    return createLocalStore();
  }

  // -------------------------
  // UI
  // -------------------------

  function init(config, opts) {
    if (typeof document === "undefined") return null;
    const options = opts || {};
    const form = document.getElementById("candleForm");
    const nameInput = document.getElementById("candleName");
    const msgInput = document.getElementById("candleMessage");
    const msgCount = document.getElementById("candleMessageCount");
    const btn = document.getElementById("lightCandle");
    const countEl = document.getElementById("candleCount");
    const grid = document.getElementById("candleContainer");
    const feed = document.getElementById("candleFeed");
    const spotlight = document.getElementById("candleSpotlight");
    const modeEl = document.getElementById("wallMode");
    if (!form || !grid || !countEl) return null;

    const getJSON = (k, f) => (Utils ? Utils.safeGetJSON(k, f) : f);
    const setJSON = (k, v) => Utils && Utils.safeSetJSON(k, v);
    const toast = (t, ms) => Utils && Utils.createToast && Utils.createToast(t, ms);
    const emit = (type, detail) =>
      document.dispatchEvent(new CustomEvent("ozzy:action", { detail: { type, ...detail } }));
    const now = options.now || (() => Date.now());

    let store = createStore(config, options.fetch);
    let entries = [];
    let total = 0;
    let selectedId = null;
    let pollTimer = null;
    const mine = new Set((getJSON(MINE_KEY, []) || []).map(String));

    function setMode(mode) {
      if (!modeEl) return;
      const labels = {
        remote: "🌍 Live – Kerzen aus aller Welt",
        local: "💾 Lokal – nur in deinem Browser",
        offline: "⚠️ Offline – Kerzen werden lokal gespeichert",
      };
      modeEl.textContent = labels[mode] || labels.local;
      modeEl.dataset.mode = mode;
    }

    function renderCount() {
      countEl.textContent = String(total);
    }

    function showSpotlight(entry) {
      if (!spotlight) return;
      spotlight.replaceChildren();
      if (!entry) {
        const hint = document.createElement("p");
        hint.className = "candle-spotlight__hint";
        hint.textContent = "Klick eine Kerze an, um ihre Botschaft zu lesen.";
        spotlight.appendChild(hint);
        return;
      }
      const flame = document.createElement("span");
      flame.className = "candle-spotlight__flame";
      flame.textContent = "🕯️";
      flame.setAttribute("aria-hidden", "true");
      const name = document.createElement("strong");
      name.textContent = entry.name || "Unbekannter Fan";
      const msg = document.createElement("p");
      msg.className = "candle-spotlight__message";
      msg.textContent = entry.message ? `„${entry.message}“` : "Eine stille Kerze für Ozzy.";
      const time = document.createElement("small");
      time.textContent = relativeTime(entry.created_at, now());
      spotlight.append(flame, name, msg, time);
    }

    function candleNode(entry, isNew) {
      const c = document.createElement("button");
      c.type = "button";
      c.className = "candle-emoji" + (mine.has(entry.id) ? " is-mine" : "") + (isNew ? " is-new" : "");
      c.textContent = "🕯️";
      c.dataset.id = entry.id;
      c.title = entry.name || "Unbekannter Fan";
      c.setAttribute("aria-label", `Kerze von ${entry.name || "einem unbekannten Fan"}` + (entry.message ? " mit Botschaft" : ""));
      if (entry.message) c.classList.add("has-message");
      return c;
    }

    function renderGrid(newIds) {
      grid.replaceChildren();
      // Älteste links oben, neueste unten rechts
      [...entries].reverse().forEach((e) => grid.appendChild(candleNode(e, newIds && newIds.has(e.id))));
      if (selectedId) grid.querySelector(`[data-id="${CSS.escape(selectedId)}"]`)?.classList.add("is-selected");
      grid.scrollTop = grid.scrollHeight;
    }

    function renderFeed() {
      if (!feed) return;
      feed.replaceChildren();
      const recent = entries.slice(0, 5);
      if (!recent.length) {
        const li = document.createElement("li");
        li.className = "candle-feed__empty";
        li.textContent = "Noch keine Kerzen – zünde die erste an! 🔥";
        feed.appendChild(li);
        return;
      }
      recent.forEach((e) => {
        const li = document.createElement("li");
        const who = document.createElement("strong");
        who.textContent = e.name || "Unbekannter Fan";
        const what = document.createElement("span");
        what.textContent = e.message ? ` – „${e.message}“` : " hat eine Kerze angezündet";
        const when = document.createElement("small");
        when.textContent = relativeTime(e.created_at, now());
        li.append(who, what, when);
        feed.appendChild(li);
      });
    }

    function renderAll(newIds) {
      renderCount();
      renderGrid(newIds);
      renderFeed();
    }

    grid.addEventListener("click", (e) => {
      const node = e.target.closest(".candle-emoji");
      if (!node) return;
      selectedId = node.dataset.id;
      grid.querySelectorAll(".is-selected").forEach((n) => n.classList.remove("is-selected"));
      node.classList.add("is-selected");
      showSpotlight(entries.find((x) => x.id === selectedId));
    });

    msgInput?.addEventListener("input", () => {
      if (msgCount) msgCount.textContent = `${msgInput.value.length} / ${MAX_MESSAGE}`;
    });

    function sparks() {
      if (!btn || (Utils && Utils.prefersReducedMotion && Utils.prefersReducedMotion())) return;
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      for (let i = 0; i < 15; i++) {
        const spark = document.createElement("div");
        spark.className = "candle-spark";
        spark.style.left = cx + "px";
        spark.style.top = cy + "px";
        spark.style.position = "fixed";
        spark.style.setProperty("--tx", (Math.random() - 0.5) * 100 + "px");
        spark.style.setProperty("--ty", (Math.random() - 1) * 100 + "px");
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 800);
      }
    }

    let cooldownTimer = null;
    function startCooldownUI() {
      if (!btn || store.mode !== "remote") return;
      clearInterval(cooldownTimer);
      const label = "🔥 Kerze anzünden";
      const tick = () => {
        const left = cooldownLeft(getJSON(LAST_KEY, 0), now());
        btn.disabled = left > 0;
        btn.textContent = left > 0 ? `⏳ ${Math.ceil(left / 1000)} s` : label;
        if (left <= 0) clearInterval(cooldownTimer);
      };
      tick();
      cooldownTimer = setInterval(tick, 1000);
    }

    async function submit() {
      const name = sanitizeName(nameInput?.value || "");
      const message = sanitizeMessage(msgInput?.value || "");
      if (store.mode === "remote" && cooldownLeft(getJSON(LAST_KEY, 0), now()) > 0) {
        toast("Kurz durchatmen – gleich kannst du die nächste Kerze anzünden. 🕯️", 1800);
        return;
      }

      const temp = { id: "pending-" + now(), name, message, created_at: new Date(now()).toISOString() };
      entries.unshift(temp);
      total += 1;
      renderAll(new Set([temp.id]));
      sparks();
      if (nameInput) nameInput.value = "";
      if (msgInput) msgInput.value = "";
      if (msgCount) msgCount.textContent = `0 / ${MAX_MESSAGE}`;

      try {
        const saved = await store.add({ name, message });
        const idx = entries.indexOf(temp);
        if (saved && idx >= 0) entries[idx] = saved;
        if (saved && saved.id) {
          mine.add(saved.id);
          setJSON(MINE_KEY, [...mine].slice(-100));
        }
        setJSON(LAST_KEY, now());
        renderAll(new Set([saved ? saved.id : temp.id]));
        startCooldownUI();
        toast(name ? `🕯️ ${name} zündet eine Kerze für Ozzy an!` : "Eine Kerze für Ozzy brennt… 🕯️", 1600);
        emit("candle", { total });
        if (message) emit("candleMessage");
      } catch (err) {
        entries = entries.filter((e) => e !== temp);
        total = Math.max(0, total - 1);
        renderAll();
        if (nameInput) nameInput.value = name;
        if (msgInput) msgInput.value = message;
        toast("Die Kerze ist im Wind erloschen – bitte später nochmal versuchen. 💨", 2500);
      }
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submit();
    });
    // Enter im Textfeld = absenden, Shift+Enter = neue Zeile
    msgInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    });

    async function poll() {
      if (store.mode !== "remote" || document.visibilityState === "hidden") return;
      try {
        const latest = entries.find((e) => !e.id.startsWith("pending-"));
        const fresh = (await store.since(latest && latest.created_at)).filter(
          (f) => !entries.some((e) => e.id === f.id)
        );
        if (!fresh.length) return;
        entries = [...fresh, ...entries].slice(0, PAGE_SIZE);
        total += fresh.length;
        renderAll(new Set(fresh.map((f) => f.id)));
        const first = fresh[0];
        toast(`🕯️ ${first.name || "Ein Fan"} hat gerade eine Kerze angezündet`, 2200);
      } catch (e) {
        /* still offline – nächster Versuch beim nächsten Poll */
      }
    }

    async function load() {
      setMode(store.mode === "remote" ? "remote" : "local");
      try {
        const res = await store.list();
        entries = res.entries;
        total = res.total;
      } catch (err) {
        store = createLocalStore();
        setMode("offline");
        const res = await store.list();
        entries = res.entries;
        total = res.total;
      }
      renderAll();
      showSpotlight(null);
      startCooldownUI();
      if (store.mode === "remote" && !options.noPoll) {
        pollTimer = setInterval(poll, POLL_MS);
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") poll();
        });
      }
    }

    const ready = load();
    return {
      ready,
      submit,
      poll,
      get mode() {
        return store.mode;
      },
      get entries() {
        return entries;
      },
      get total() {
        return total;
      },
      destroy() {
        clearInterval(pollTimer);
        clearInterval(cooldownTimer);
      },
    };
  }

  return {
    ENTRIES_KEY,
    MINE_KEY,
    LAST_KEY,
    MAX_MESSAGE,
    COOLDOWN_MS,
    sanitizeMessage,
    normalizeEntry,
    parseContentRange,
    isJwt,
    relativeTime,
    cooldownLeft,
    createLocalStore,
    createSupabaseStore,
    createStore,
    init,
  };
});
