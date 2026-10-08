// js/interactive.js – Interaktive Features (v4.0)
// Erfolge, Riff-Maschine, Timeline-Filter, Scrollspy, Konami-Code, Lightbox-Swipe
// Depends on: OzzyUtils (optional in tests). Dual export: window.OzzyInteractive / module.exports

(function (root, factory) {
  const api = factory(root.OzzyUtils);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.OzzyInteractive = api;
  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => api.init());
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (Utils) {
  "use strict";

  const ACHIEVEMENT_KEY = "ozzyAchievements";
  const RIFF_KEY = "ozzyRiff";
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

  /**
   * Achievement definitions. `goal` = how many matching actions are needed.
   * `match(detail, state)` returns true if the action counts.
   */
  const ACHIEVEMENTS = [
    { id: "candle", icon: "🕯️", title: "Lichtbringer", desc: "Zünde eine Kerze an der Tribute Wall an.", action: "candle", goal: 1 },
    { id: "candle10", icon: "🔥", title: "Flammenmeer", desc: "Zünde 10 Kerzen an.", action: "candle", goal: 10 },
    { id: "oracle", icon: "🔮", title: "Orakel", desc: "Befrage die Kristallkugel 5-mal.", action: "quote", goal: 5 },
    { id: "bat", icon: "🦇", title: "Fledermausfänger", desc: "Fange eine fliegende Fledermaus.", action: "bat", goal: 1 },
    { id: "priest", icon: "⛪", title: "Hohepriester", desc: "Lege jede der 6 Gaben auf den Altar.", action: "offering", goal: 6, unique: true },
    { id: "vampire", icon: "🧛", title: "Blutsauger", desc: "Finde die geheime Opfer-Kombination.", action: "vampire", goal: 1, secret: true },
    { id: "ghost", icon: "👻", title: "Geisterjäger", desc: "Erwische Ghost Ozzy.", action: "ghost", goal: 1, secret: true },
    { id: "moon", icon: "🌙", title: "Bark at the Moon", desc: "Aktiviere den Moonlight Mode.", action: "moon", goal: 1 },
    { id: "disco", icon: "🕺", title: "Disco Inferno", desc: "Schalte den Disco Mode ein.", action: "disco", goal: 1 },
    { id: "pyro", icon: "💥", title: "Pyromane", desc: "Klicke 10-mal ins Feuer des Intros.", action: "pyro", goal: 10 },
    { id: "riff", icon: "🎸", title: "Riff Master", desc: "Spiele 30 Power-Chords.", action: "riff", goal: 30 },
    { id: "recorder", icon: "📼", title: "Studio Session", desc: "Nimm ein eigenes Riff auf und spiel es ab.", action: "riffPlayback", goal: 1 },
    { id: "headbang", icon: "🤘", title: "Nackenbrecher", desc: "Bring das Headbang-o-Meter auf 100 %.", action: "headbang", goal: 1 },
    { id: "historian", icon: "📜", title: "Zeitreisender", desc: "Nutze jeden Filter der Timeline.", action: "timelineFilter", goal: 5, unique: true },
    { id: "konami", icon: "🎮", title: "Cheat Code", desc: "↑ ↑ ↓ ↓ ← → ← → B A", action: "konami", goal: 1, secret: true },
  ];

  // -------------------------
  // PURE LOGIC (testable)
  // -------------------------

  function emptyState() {
    return { counts: {}, uniques: {}, unlocked: {} };
  }

  function normalizeState(raw) {
    const s = emptyState();
    if (!raw || typeof raw !== "object") return s;
    if (raw.counts && typeof raw.counts === "object") {
      Object.keys(raw.counts).forEach((k) => {
        s.counts[k] = Math.max(0, Number(raw.counts[k]) || 0);
      });
    }
    if (raw.uniques && typeof raw.uniques === "object") {
      Object.keys(raw.uniques).forEach((k) => {
        if (Array.isArray(raw.uniques[k])) s.uniques[k] = raw.uniques[k].map(String).slice(0, 50);
      });
    }
    if (raw.unlocked && typeof raw.unlocked === "object") {
      ACHIEVEMENTS.forEach((a) => {
        if (raw.unlocked[a.id]) s.unlocked[a.id] = String(raw.unlocked[a.id]);
      });
    }
    return s;
  }

  function progressOf(achievement, state) {
    const value = achievement.unique
      ? (state.uniques[achievement.action] || []).length
      : state.counts[achievement.action] || 0;
    return Math.min(value, achievement.goal);
  }

  /**
   * Record an action. Returns { state, unlocked: [achievements newly unlocked] }.
   * Does not mutate the passed state.
   */
  function recordAction(prevState, type, detail) {
    const state = normalizeState(prevState);
    if (!type) return { state, unlocked: [] };
    state.counts[type] = (state.counts[type] || 0) + 1;
    const key = detail && (detail.id || detail.filter);
    if (key != null) {
      const list = state.uniques[type] || [];
      if (!list.includes(String(key))) list.push(String(key));
      state.uniques[type] = list;
    }
    const unlocked = [];
    ACHIEVEMENTS.forEach((a) => {
      if (a.action !== type || state.unlocked[a.id]) return;
      if (progressOf(a, state) >= a.goal) {
        state.unlocked[a.id] = new Date().toISOString();
        unlocked.push(a);
      }
    });
    return { state, unlocked };
  }

  function countUnlocked(state) {
    return ACHIEVEMENTS.filter((a) => state.unlocked[a.id]).length;
  }

  /** Konami matcher: returns a function(key) → true when sequence completed. */
  function createSequenceMatcher(sequence) {
    let pos = 0;
    return function (key) {
      const k = String(key).length === 1 ? String(key).toLowerCase() : String(key);
      if (k === sequence[pos]) {
        pos++;
        if (pos === sequence.length) {
          pos = 0;
          return true;
        }
      } else {
        pos = k === sequence[0] ? 1 : 0;
      }
      return false;
    };
  }

  /** Headbang meter: value 0..100, +step on hit, decays per tick. */
  function createMeter(step, decay) {
    let value = 0;
    return {
      hit() {
        value = Math.min(100, value + step);
        return value;
      },
      tick() {
        value = Math.max(0, value - decay);
        return value;
      },
      reset() {
        value = 0;
      },
      get value() {
        return value;
      },
    };
  }

  /** Power-chord root frequencies (low octave). */
  const NOTES = { E: 82.41, G: 98.0, A: 110.0, Bb: 116.54, C: 130.81, D: 146.83 };

  /** Short demo riff [note, beatsUntilNext]. Self-composed doom pattern. */
  const DEMO_RIFF = [
    ["E", 2], ["G", 1], ["A", 2], ["E", 1], ["Bb", 1], ["A", 3],
    ["E", 2], ["G", 1], ["A", 2], ["G", 1], ["E", 4], ["squeal", 2],
  ];

  // -------------------------
  // DOM HELPERS
  // -------------------------

  const reduced = () => (Utils && Utils.prefersReducedMotion ? Utils.prefersReducedMotion() : false);
  const toast = (msg, ms) => Utils && Utils.createToast && Utils.createToast(msg, ms);
  const getJSON = (k, f) => (Utils && Utils.safeGetJSON ? Utils.safeGetJSON(k, f) : f);
  const setJSON = (k, v) => Utils && Utils.safeSetJSON && Utils.safeSetJSON(k, v);
  const emit = (type, detail) =>
    document.dispatchEvent(new CustomEvent("ozzy:action", { detail: { type, ...detail } }));

  // -------------------------
  // ACHIEVEMENTS UI
  // -------------------------

  function initAchievements() {
    let state = normalizeState(getJSON(ACHIEVEMENT_KEY, null));
    const countEl = document.getElementById("achievementCount");
    const toggle = document.getElementById("achievementsToggle");
    const panel = document.getElementById("achievementsPanel");
    const list = document.getElementById("achievementList");
    const progressText = document.getElementById("achievementProgressText");
    const progressFill = document.getElementById("achievementProgressFill");
    let lastFocus = null;

    function render() {
      const n = countUnlocked(state);
      if (countEl) {
        countEl.textContent = String(n);
        countEl.classList.toggle("has-unlocks", n > 0);
      }
      if (progressText) progressText.textContent = `${n} / ${ACHIEVEMENTS.length}`;
      if (progressFill) progressFill.style.width = `${(n / ACHIEVEMENTS.length) * 100}%`;
      if (!list) return;
      list.replaceChildren();
      ACHIEVEMENTS.forEach((a) => {
        const done = Boolean(state.unlocked[a.id]);
        const hidden = a.secret && !done;
        const li = document.createElement("li");
        li.className = "achievement" + (done ? " is-unlocked" : "");
        li.dataset.id = a.id;

        const icon = document.createElement("span");
        icon.className = "achievement__icon";
        icon.textContent = hidden ? "❔" : a.icon;
        icon.setAttribute("aria-hidden", "true");

        const body = document.createElement("div");
        body.className = "achievement__body";
        const title = document.createElement("strong");
        title.textContent = hidden ? "Geheimer Erfolg" : a.title;
        const desc = document.createElement("span");
        desc.textContent = hidden ? "Erkunde die Seite, um ihn zu finden." : a.desc;
        body.append(title, desc);

        if (!done && !hidden && a.goal > 1) {
          const prog = document.createElement("span");
          prog.className = "achievement__progress";
          prog.textContent = `${progressOf(a, state)} / ${a.goal}`;
          body.appendChild(prog);
        }

        const status = document.createElement("span");
        status.className = "sr-only";
        status.textContent = done ? "freigeschaltet" : "gesperrt";

        li.append(icon, body, status);
        list.appendChild(li);
      });
    }

    function open() {
      if (!panel) return;
      lastFocus = document.activeElement;
      render();
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add("is-open"));
      panel.querySelector(".achievements-panel__close")?.focus();
    }

    function close() {
      if (!panel || panel.hidden) return;
      panel.classList.remove("is-open");
      panel.hidden = true;
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    toggle?.addEventListener("click", open);
    panel?.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    function celebrate(a) {
      const pop = document.createElement("div");
      pop.className = "achievement-pop";
      pop.setAttribute("role", "status");
      const icon = document.createElement("span");
      icon.className = "achievement-pop__icon";
      icon.textContent = a.icon;
      const text = document.createElement("div");
      const kicker = document.createElement("small");
      kicker.textContent = "Erfolg freigeschaltet";
      const title = document.createElement("strong");
      title.textContent = a.title;
      text.append(kicker, title);
      pop.append(icon, text);
      document.body.appendChild(pop);
      setTimeout(() => pop.classList.add("is-leaving"), 3200);
      setTimeout(() => pop.remove(), 3700);
      toggle?.classList.remove("is-bumped");
      void toggle?.offsetWidth;
      toggle?.classList.add("is-bumped");
    }

    document.addEventListener("ozzy:action", (e) => {
      const detail = e.detail || {};
      const result = recordAction(state, detail.type, detail);
      state = result.state;
      setJSON(ACHIEVEMENT_KEY, state);
      result.unlocked.forEach(celebrate);
      render();
    });

    render();
    return { open, close, getState: () => state };
  }

  // -------------------------
  // TIMELINE FILTER + PROGRESS
  // -------------------------

  function initTimeline() {
    const chips = document.querySelectorAll(".filter-chip");
    const items = document.querySelectorAll(".timeline-v2-item");
    const timeline = document.querySelector(".timeline-v2");

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const filter = chip.dataset.filter || "all";
        chips.forEach((c) => {
          const active = c === chip;
          c.classList.toggle("is-active", active);
          c.setAttribute("aria-pressed", String(active));
        });
        items.forEach((item) => {
          const match = filter === "all" || Boolean(item.querySelector(".badge-" + filter));
          item.classList.toggle("is-dimmed", !match);
        });
        if (filter !== "all") emit("timelineFilter", { filter });
      });
    });

    // Glühende Fortschrittslinie entlang der Kette
    if (!timeline) return;
    const glow = document.createElement("div");
    glow.className = "timeline-progress";
    glow.setAttribute("aria-hidden", "true");
    timeline.appendChild(glow);

    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const passed = vh * 0.6 - rect.top;
      const ratio = rect.height > 0 ? Math.min(1, Math.max(0, passed / rect.height)) : 0;
      glow.style.height = ratio * 100 + "%";
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  // -------------------------
  // SCROLLSPY (aktiver Nav-Link)
  // -------------------------

  function initScrollSpy() {
    const links = [...document.querySelectorAll('.header-nav a[href^="#"]')];
    if (!links.length || !("IntersectionObserver" in window)) return;
    const byId = new Map(links.map((l) => [l.getAttribute("href").slice(1), l]));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          links.forEach((l) => {
            l.classList.remove("is-current");
            l.removeAttribute("aria-current");
          });
          const link = byId.get(en.target.id);
          if (link) {
            link.classList.add("is-current");
            link.setAttribute("aria-current", "true");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    byId.forEach((_, id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  // -------------------------
  // HERO PARALLAX
  // -------------------------

  function initHeroParallax() {
    const hero = document.getElementById("hero");
    const content = hero?.querySelector(".hero-content");
    if (!hero || !content || reduced()) return;
    if (!(window.matchMedia && window.matchMedia("(pointer: fine)").matches)) return;
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      content.style.setProperty("--px", (x * 24).toFixed(1) + "px");
      content.style.setProperty("--py", (y * 18).toFixed(1) + "px");
      content.style.setProperty("--rx", (10 - y * 10).toFixed(1) + "deg");
      content.style.setProperty("--ry", (x * 12).toFixed(1) + "deg");
    });
    hero.addEventListener("pointerleave", () => {
      ["--px", "--py", "--rx", "--ry"].forEach((p) => content.style.removeProperty(p));
    });
  }

  // -------------------------
  // KONAMI CODE → BAT SWARM
  // -------------------------

  function batSwarm() {
    toast("🦇 PRINCE OF DARKNESS MODE 🦇", 2500);
    if (reduced()) return;
    const count = window.innerWidth < 600 ? 14 : 30;
    for (let i = 0; i < count; i++) {
      const bat = document.createElement("span");
      bat.className = "swarm-bat";
      bat.textContent = "🦇";
      bat.setAttribute("aria-hidden", "true");
      bat.style.top = Math.random() * 90 + "vh";
      bat.style.fontSize = 18 + Math.random() * 34 + "px";
      bat.style.animationDuration = 2.5 + Math.random() * 2.5 + "s";
      bat.style.animationDelay = Math.random() * 1.2 + "s";
      document.body.appendChild(bat);
      setTimeout(() => bat.remove(), 6500);
    }
  }

  function initKonami() {
    const match = createSequenceMatcher(KONAMI);
    document.addEventListener("keydown", (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (match(e.key)) {
        batSwarm();
        emit("konami");
      }
    });
  }

  // -------------------------
  // LIGHTBOX SWIPE (Touch)
  // -------------------------

  function initLightboxSwipe() {
    let startX = null;
    document.addEventListener(
      "touchstart",
      (e) => {
        startX = e.target.closest(".ozzy-modal") ? e.touches[0].clientX : null;
      },
      { passive: true }
    );
    document.addEventListener(
      "touchend",
      (e) => {
        if (startX == null) return;
        const dx = e.changedTouches[0].clientX - startX;
        startX = null;
        if (Math.abs(dx) < 50) return;
        const btn = document.querySelector(dx < 0 ? ".ozzy-modal__nav--next" : ".ozzy-modal__nav--prev");
        btn?.click();
      },
      { passive: true }
    );
  }

  // -------------------------
  // RIFF MACHINE (Web Audio)
  // -------------------------

  function initRiffMachine() {
    const padsWrap = document.getElementById("riffPads");
    if (!padsWrap) return null;
    const pads = [...padsWrap.querySelectorAll(".riff-pad")];
    const recordBtn = document.getElementById("riffRecord");
    const playBtn = document.getElementById("riffPlay");
    const demoBtn = document.getElementById("riffDemo");
    const clearBtn = document.getElementById("riffClear");
    const statusEl = document.getElementById("riffStatus");
    const fillEl = document.getElementById("headbangFill");
    const canvas = document.getElementById("riffVisualizer");
    const vctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;

    const AudioCtx = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
    let audio = null;
    let master = null;
    let analyser = null;
    let shaper = null;

    let recording = false;
    let recordStart = 0;
    let recorded = (getJSON(RIFF_KEY, []) || []).filter(
      (n) => Array.isArray(n) && typeof n[0] === "string" && Number.isFinite(n[1])
    );
    let playTimers = [];
    const meter = createMeter(9, 1.2);
    let headbangLocked = false;

    const setStatus = (t) => statusEl && (statusEl.textContent = t);

    function distortionCurve(amount) {
      const n = 1024;
      const curve = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const x = (i * 2) / n - 1;
        curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
      }
      return curve;
    }

    function ensureAudio() {
      if (!AudioCtx) return null;
      if (!audio) {
        audio = new AudioCtx();
        shaper = audio.createWaveShaper();
        shaper.curve = distortionCurve(400);
        shaper.oversample = "4x";
        const tone = audio.createBiquadFilter();
        tone.type = "lowpass";
        tone.frequency.value = 3400;
        master = audio.createGain();
        master.gain.value = 0.35;
        analyser = audio.createAnalyser();
        analyser.fftSize = 256;
        shaper.connect(tone).connect(master).connect(analyser).connect(audio.destination);
        drawVisualizer();
      }
      if (audio.state === "suspended") audio.resume();
      return audio;
    }

    function playChord(note) {
      const ctx = ensureAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      const voice = ctx.createGain();
      voice.connect(shaper);

      if (note === "squeal") {
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(1650, now + 0.25);
        lfo.frequency.value = 7;
        lfoGain.gain.value = 35;
        lfo.connect(lfoGain).connect(osc.frequency);
        voice.gain.setValueAtTime(0.0001, now);
        voice.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
        voice.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
        osc.connect(voice);
        osc.start(now);
        lfo.start(now);
        osc.stop(now + 1.2);
        lfo.stop(now + 1.2);
        return;
      }

      const root = NOTES[note];
      if (!root) return;
      voice.gain.setValueAtTime(0.0001, now);
      voice.gain.exponentialRampToValueAtTime(0.6, now + 0.008);
      voice.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      [root, root * 1.4983, root * 2].forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = f;
        osc.detune.value = (i - 1) * 6;
        osc.connect(voice);
        osc.start(now);
        osc.stop(now + 1);
      });
    }

    function flashPad(note) {
      const pad = pads.find((p) => p.dataset.note === note);
      if (!pad) return;
      pad.classList.remove("is-hit");
      void pad.offsetWidth;
      pad.classList.add("is-hit");
    }

    function hit(note, fromUser) {
      playChord(note);
      flashPad(note);
      emit("riff", { note });
      if (fromUser && recording) {
        recorded.push([note, Math.round(performance.now() - recordStart)]);
      }
      const v = meter.hit();
      if (fillEl) fillEl.style.width = v + "%";
      if (v >= 100 && !headbangLocked) {
        headbangLocked = true;
        setStatus("🤘 HEADBANG LEVEL: MAXIMUM! 🤘");
        emit("headbang");
        if (!reduced()) {
          document.body.classList.add("headbang-plus");
          setTimeout(() => document.body.classList.remove("headbang-plus"), 1600);
        }
      }
    }

    // Meter decay loop
    setInterval(() => {
      if (meter.value <= 0) return;
      const v = meter.tick();
      if (fillEl) fillEl.style.width = v + "%";
      if (v < 40) headbangLocked = false;
    }, 100);

    pads.forEach((pad) => {
      pad.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        hit(pad.dataset.note, true);
      });
      // Keyboard activation (Enter/Space) arrives as click with detail 0
      pad.addEventListener("click", (e) => {
        if (e.detail === 0) hit(pad.dataset.note, true);
      });
    });

    const keyMap = new Map(pads.map((p) => [p.dataset.key, p.dataset.note]));
    document.addEventListener("keydown", (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const note = keyMap.get(e.key);
      if (note) hit(note, true);
    });

    function stopPlayback() {
      playTimers.forEach(clearTimeout);
      playTimers = [];
    }

    function playSequence(seq, label) {
      stopPlayback();
      if (!seq.length) return;
      setStatus(label);
      seq.forEach(([note, at]) => playTimers.push(setTimeout(() => hit(note, false), at)));
      const end = seq[seq.length - 1][1] + 900;
      playTimers.push(setTimeout(() => setStatus("Bereit zum Rocken."), end));
    }

    function updateButtons() {
      if (playBtn) playBtn.disabled = recording || recorded.length === 0;
      if (clearBtn) clearBtn.disabled = recording || recorded.length === 0;
    }

    recordBtn?.addEventListener("click", () => {
      recording = !recording;
      recordBtn.setAttribute("aria-pressed", String(recording));
      recordBtn.classList.toggle("is-recording", recording);
      if (recording) {
        stopPlayback();
        recorded = [];
        recordStart = performance.now();
        recordBtn.textContent = "⏹ Stopp";
        setStatus("🔴 Aufnahme läuft – spiel dein Riff!");
      } else {
        recordBtn.textContent = "⏺ Aufnehmen";
        if (recorded.length) {
          const offset = recorded[0][1];
          recorded = recorded.slice(0, 200).map(([n, t]) => [n, t - offset]);
          setJSON(RIFF_KEY, recorded);
          setStatus(`✅ ${recorded.length} Akkorde aufgenommen.`);
        } else {
          setStatus("Keine Akkorde aufgenommen.");
        }
      }
      updateButtons();
    });

    playBtn?.addEventListener("click", () => {
      if (!recorded.length) return;
      ensureAudio();
      playSequence(recorded, "▶ Dein Riff läuft…");
      emit("riffPlayback");
    });

    demoBtn?.addEventListener("click", () => {
      ensureAudio();
      const beat = 260;
      let t = 0;
      const seq = DEMO_RIFF.map(([note, beats]) => {
        const at = t;
        t += beats * beat;
        return [note, at];
      });
      playSequence(seq, "🎸 Doom-Demo läuft…");
    });

    clearBtn?.addEventListener("click", () => {
      stopPlayback();
      recorded = [];
      setJSON(RIFF_KEY, []);
      setStatus("Riff gelöscht.");
      updateButtons();
    });

    function drawVisualizer() {
      if (!vctx || !analyser) return;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const render = () => {
        const w = (canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1));
        const h = (canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1));
        analyser.getByteFrequencyData(data);
        vctx.clearRect(0, 0, w, h);
        const bars = 48;
        const bw = w / bars;
        for (let i = 0; i < bars; i++) {
          const v = data[Math.floor((i / bars) * data.length * 0.7)] / 255;
          const bh = Math.max(2, v * h);
          const g = vctx.createLinearGradient(0, h, 0, h - bh);
          g.addColorStop(0, "#8b0000");
          g.addColorStop(1, v > 0.7 ? "#ffcc00" : "#ff2a2a");
          vctx.fillStyle = g;
          vctx.fillRect(i * bw + 1, h - bh, bw - 2, bh);
        }
        requestAnimationFrame(render);
      };
      render();
    }

    if (!AudioCtx) setStatus("Dein Browser unterstützt kein Web Audio – die Pads leuchten trotzdem. 🤘");
    updateButtons();
    return { hit, getRecorded: () => recorded };
  }

  // -------------------------
  // INIT
  // -------------------------

  function init() {
    if (typeof document === "undefined") return null;
    return {
      achievements: initAchievements(),
      riff: initRiffMachine(),
      timeline: initTimeline(),
      scrollSpy: initScrollSpy(),
      parallax: initHeroParallax(),
      konami: initKonami(),
      swipe: initLightboxSwipe(),
    };
  }

  return {
    ACHIEVEMENTS,
    ACHIEVEMENT_KEY,
    RIFF_KEY,
    KONAMI,
    NOTES,
    DEMO_RIFF,
    emptyState,
    normalizeState,
    progressOf,
    recordAction,
    countUnlocked,
    createSequenceMatcher,
    createMeter,
    init,
  };
});
