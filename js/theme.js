// js/theme.js – shared theme management (browser + Jest)

(function (root, factory) {
  const api = factory(root.OzzyUtils);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.OzzyTheme = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Utils) {
  "use strict";

  const THEME_KEY = (Utils && Utils.STORAGE_KEYS && Utils.STORAGE_KEYS.theme) || "ozzyTheme";
  const DISCO_KEY = (Utils && Utils.STORAGE_KEYS && Utils.STORAGE_KEYS.disco) || "ozzyDisco";
  const VALID = new Set(["dark-mode", "light-mode", "moon-mode"]);

  function normalizeTheme(theme) {
    if (VALID.has(theme)) return theme;
    return "dark-mode";
  }

  function applyTheme(theme, options) {
    const opts = options || {};
    const body = typeof document !== "undefined" ? document.body : null;
    if (!body) return normalizeTheme(theme);

    const t = normalizeTheme(theme);
    body.classList.remove("light-mode", "dark-mode", "moon-mode");
    if (t === "light-mode") {
      body.classList.add("light-mode");
    } else if (t === "moon-mode") {
      body.classList.add("dark-mode", "moon-mode");
    } else {
      body.classList.add("dark-mode");
    }

    if (opts.disco === true) {
      body.classList.add("disco-mode");
    } else if (opts.disco === false) {
      body.classList.remove("disco-mode");
    }

    return t;
  }

  function getSavedTheme() {
    const get = Utils && Utils.safeGetString
      ? Utils.safeGetString.bind(Utils)
      : (k, f) => {
          try {
            return localStorage.getItem(k) || f;
          } catch (e) {
            return f;
          }
        };
    return normalizeTheme(get(THEME_KEY, "dark-mode"));
  }

  function saveTheme(theme) {
    const t = normalizeTheme(theme);
    if (Utils && Utils.safeSet) {
      Utils.safeSet(THEME_KEY, t);
    } else {
      try {
        localStorage.setItem(THEME_KEY, t);
      } catch (e) {
        /* ignore */
      }
    }
    return t;
  }

  function getDiscoEnabled() {
    const get = Utils && Utils.safeGetString
      ? Utils.safeGetString.bind(Utils)
      : (k, f) => {
          try {
            return localStorage.getItem(k) || f;
          } catch (e) {
            return f;
          }
        };
    return get(DISCO_KEY, "0") === "1";
  }

  function saveDisco(enabled) {
    const val = enabled ? "1" : "0";
    if (Utils && Utils.safeSet) {
      Utils.safeSet(DISCO_KEY, val);
    } else {
      try {
        localStorage.setItem(DISCO_KEY, val);
      } catch (e) {
        /* ignore */
      }
    }
    return !!enabled;
  }

  /** Apply saved theme (+ optional disco) to body. */
  function initTheme(options) {
    const opts = options || {};
    const theme = getSavedTheme();
    const disco = opts.includeDisco ? getDiscoEnabled() : false;
    return applyTheme(theme, { disco });
  }

  /** Toggle light ↔ dark (moon becomes dark first). */
  function toggleLightDark() {
    const body = document.body;
    const next = body.classList.contains("light-mode") ? "dark-mode" : "light-mode";
    applyTheme(next);
    saveTheme(next);
    return next;
  }

  /** Toggle moon mode on/off (off → dark). */
  function toggleMoon() {
    const body = document.body;
    const next = body.classList.contains("moon-mode") ? "dark-mode" : "moon-mode";
    applyTheme(next);
    saveTheme(next);
    return next;
  }

  /** Toggle disco; optionally persist. */
  function toggleDisco(persist) {
    const active = document.body.classList.toggle("disco-mode");
    if (persist !== false) saveDisco(active);
    return active;
  }

  return {
    THEME_KEY,
    DISCO_KEY,
    VALID,
    normalizeTheme,
    applyTheme,
    getSavedTheme,
    saveTheme,
    getDiscoEnabled,
    saveDisco,
    initTheme,
    toggleLightDark,
    toggleMoon,
    toggleDisco,
  };
});
