// js/utils.js – shared pure helpers (browser + Jest)
// Dual export: window.OzzyUtils / module.exports

(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.OzzyUtils = api;
  root.U = api;
  if (typeof window !== "undefined") {
    api.registerSW();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const STORAGE_KEYS = {
    theme: "ozzyTheme",
    disco: "ozzyDisco",
    batScore: "ozzyBatScore",
    candles: "ozzyCandleNames",
    candlesLegacy: "ozzyCandles",
    highscore: "ozzyHighscore",
  };

  const MAX_CANDLES = 200;
  const MAX_NAME_LENGTH = 20;
  const MAX_HIGHSCORE = 10;

  /** Safe JSON parse from localStorage; returns fallback on error. */
  function safeGetJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (e) {
      return fallback;
    }
  }

  /** Safe string get from localStorage. */
  function safeGetString(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v == null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  /** Safe setItem; returns false on failure (quota etc.). */
  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  function safeSetJSON(key, value) {
    try {
      return safeSet(key, JSON.stringify(value));
    } catch (e) {
      return false;
    }
  }

  /** Trim, strip control/markup chars, enforce max length. */
  function sanitizeName(name, maxLen) {
    const limit = typeof maxLen === "number" ? maxLen : MAX_NAME_LENGTH;
    if (name == null) return "";
    return String(name)
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .replace(/[<>&"`]/g, "")
      .trim()
      .slice(0, limit);
  }

  /** Fisher-Yates shuffle; does not mutate input. */
  function shuffleArray(array) {
    const arr = Array.isArray(array) ? [...array] : [];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /** Quiz ranking from score. */
  function getRanking(score) {
    const s = Number(score) || 0;
    if (s <= 3) return "Roadie 🛠️";
    if (s <= 7) return "Bassist 🎸";
    if (s <= 9) return "Prince of Darkness 🦇";
    return "METAL GOD 🤘🔥";
  }

  /** Parse & normalize highscore list. */
  function parseHighscore(rawOrArray) {
    let list = rawOrArray;
    if (typeof rawOrArray === "string") {
      try {
        list = JSON.parse(rawOrArray);
      } catch (e) {
        return [];
      }
    }
    if (rawOrArray == null && arguments.length === 0) {
      list = safeGetJSON(STORAGE_KEYS.highscore, []);
    }
    if (!Array.isArray(list)) return [];
    return list
      .filter((e) => e && typeof e === "object")
      .map((e) => ({
        name: sanitizeName(e.name || "Unbekannt", 40) || "Unbekannt",
        score: Number(e.score) || 0,
        date: e.date || "",
      }));
  }

  function loadHighscoreFromStorage() {
    return parseHighscore(safeGetJSON(STORAGE_KEYS.highscore, []));
  }

  function saveHighscoreEntry(playerName, score, existing) {
    const list = Array.isArray(existing) ? [...existing] : loadHighscoreFromStorage();
    list.push({
      name: sanitizeName(playerName, 40) || "Unbekannt",
      score: Number(score) || 0,
      date: new Date().toLocaleDateString(),
    });
    list.sort((a, b) => b.score - a.score);
    list.splice(MAX_HIGHSCORE);
    safeSetJSON(STORAGE_KEYS.highscore, list);
    return list;
  }

  /** Load candle names with legacy numeric migration + cap. */
  function loadCandles() {
    let candles = safeGetJSON(STORAGE_KEYS.candles, []);
    if (!Array.isArray(candles)) candles = [];
    if (candles.length === 0) {
      const oldCount = parseInt(safeGetString(STORAGE_KEYS.candlesLegacy, "0"), 10) || 0;
      if (oldCount > 0) {
        candles = Array(Math.min(oldCount, MAX_CANDLES)).fill("");
      }
    }
    return candles
      .map((n) => sanitizeName(n))
      .slice(-MAX_CANDLES);
  }

  function saveCandles(candles) {
    const capped = (Array.isArray(candles) ? candles : [])
      .map((n) => sanitizeName(n))
      .slice(-MAX_CANDLES);
    safeSetJSON(STORAGE_KEYS.candles, capped);
    return capped;
  }

  function prefersReducedMotion() {
    try {
      return (
        typeof matchMedia === "function" &&
        matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    } catch (e) {
      return false;
    }
  }

  /** Create toast notification (DOM). */
  function createToast(text, timeout) {
    const ms = timeout == null ? 2000 : timeout;
    if (typeof document === "undefined") return null;
    const t = document.createElement("div");
    t.className = "ozzy-toast";
    t.setAttribute("role", "status");
    t.textContent = text;
    document.body.appendChild(t);
    const hideAt = Math.max(ms - 300, 0);
    setTimeout(() => t.classList.add("ozzy-toast--hide"), hideAt);
    setTimeout(() => t.remove(), ms);
    return t;
  }

  /** Typewriter with cancel handle. */
  function createTypewriter() {
    let timer = null;
    return {
      run(el, text, speed) {
        if (!el) return;
        const sp = speed == null ? 35 : speed;
        if (timer) clearInterval(timer);
        el.textContent = "";
        if (prefersReducedMotion()) {
          el.textContent = text;
          return;
        }
        let i = 0;
        timer = setInterval(() => {
          el.textContent += text[i++];
          if (i >= text.length) {
            clearInterval(timer);
            timer = null;
          }
        }, sp);
      },
      cancel() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      },
    };
  }

  /** Build a simple modal node with safe DOM APIs (no innerHTML for content). 
   * v3.5: Support gallery navigation (allImages array). 
   */
  function openImageModal(initialSrc, initialCaption, allImages = [], initialIndex = 0) {
    if (typeof document === "undefined") return null;

    let currentIndex = initialIndex;

    const modal = document.createElement("div");
    modal.className = "ozzy-modal ozzy-modal--open";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    const backdrop = document.createElement("div");
    backdrop.className = "ozzy-modal__backdrop";

    const content = document.createElement("div");
    content.className = "ozzy-modal__content";

    const closeBtn = document.createElement("button");
    closeBtn.className = "ozzy-modal__close";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Schließen");
    closeBtn.textContent = "✕";

    const img = document.createElement("img");
    img.className = "ozzy-modal__img";

    const cap = document.createElement("p");
    cap.className = "ozzy-modal__caption";

    const updateContent = (idx) => {
      currentIndex = idx;
      const data = allImages.length > 0 ? allImages[idx] : { src: initialSrc, caption: initialCaption };
      img.src = data.src;
      img.alt = data.caption || "";
      cap.textContent = data.caption || "";
      modal.setAttribute("aria-label", data.caption || "Bildvorschau");

      if (allImages.length > 1) {
        prevBtn.style.display = "block";
        nextBtn.style.display = "block";
      } else {
        if (prevBtn) prevBtn.style.display = "none";
        if (nextBtn) nextBtn.style.display = "none";
      }
    };

    let prevBtn = null;
    let nextBtn = null;

    if (allImages.length > 1) {
      prevBtn = document.createElement("button");
      prevBtn.className = "ozzy-modal__nav ozzy-modal__nav--prev";
      prevBtn.innerHTML = "&#10094;";
      prevBtn.setAttribute("aria-label", "Vorheriges Bild");

      nextBtn = document.createElement("button");
      nextBtn.className = "ozzy-modal__nav ozzy-modal__nav--next";
      nextBtn.innerHTML = "&#10095;";
      nextBtn.setAttribute("aria-label", "Nächstes Bild");

      const showPrev = () => updateContent((currentIndex - 1 + allImages.length) % allImages.length);
      const showNext = () => updateContent((currentIndex + 1) % allImages.length);

      prevBtn.addEventListener("click", (e) => { e.stopPropagation(); showPrev(); });
      nextBtn.addEventListener("click", (e) => { e.stopPropagation(); showNext(); });
    }

    updateContent(currentIndex);

    if (prevBtn) content.appendChild(prevBtn);
    content.append(closeBtn, img, cap);
    if (nextBtn) content.appendChild(nextBtn);

    modal.append(backdrop, content);
    document.body.appendChild(modal);

    const previouslyFocused = document.activeElement;
    closeBtn.focus();

    const closeModal = () => {
      modal.remove();
      document.removeEventListener("keydown", handleKeydown);
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };

    const handleKeydown = (evt) => {
      if (evt.key === "Escape") closeModal();
      if (allImages.length > 1) {
        if (evt.key === "ArrowLeft") updateContent((currentIndex - 1 + allImages.length) % allImages.length);
        if (evt.key === "ArrowRight") updateContent((currentIndex + 1) % allImages.length);
      }
    };

    backdrop.addEventListener("click", closeModal);
    closeBtn.addEventListener("click", closeModal);
    document.addEventListener("keydown", handleKeydown);

    return { modal, closeModal };
  }

  /** Register PWA Service Worker */
  function registerSW() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
        navigator.serviceWorker
          .register(basePath + "sw.js")
          .then((reg) => console.log("Ozzy SW registered", reg))
          .catch((err) => console.log("Ozzy SW registration failed", err));
      });
    }
  }

  return {
    STORAGE_KEYS,
    MAX_CANDLES,
    MAX_NAME_LENGTH,
    MAX_HIGHSCORE,
    safeGetJSON,
    safeGetString,
    safeSet,
    safeSetJSON,
    sanitizeName,
    shuffleArray,
    getRanking,
    parseHighscore,
    loadHighscoreFromStorage,
    saveHighscoreEntry,
    loadCandles,
    saveCandles,
    prefersReducedMotion,
    createToast,
    createTypewriter,
    openImageModal,
    registerSW,
  };
});
