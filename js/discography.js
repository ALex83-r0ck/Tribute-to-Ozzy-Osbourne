// js/discography.js – Interaktive Diskografie (v4.1)
// Wendekarten, Plattenspieler, Suche, Era-Filter, Favoriten
// Depends on: OzzyUtils (optional in tests). Dual export: window.OzzyDiscography / module.exports

(function (root, factory) {
  const api = factory(root.OzzyUtils);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.OzzyDiscography = api;
  if (typeof document !== "undefined" && !(typeof module !== "undefined" && module.exports)) {
    document.addEventListener("DOMContentLoaded", () => api.init());
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (Utils) {
  "use strict";

  const FAV_KEY = "ozzyFavAlbums";

  /** Studioalben mit Ozzy am Mikrofon. Cover werden per CSS erzeugt (keine fremden Bildrechte). */
  const ALBUMS = [
    { id: "black-sabbath", title: "Black Sabbath", year: 1970, era: "sabbath", guitarist: "Tony Iommi", emoji: "🌑", colors: ["#2b3a2b", "#0c120c"],
      tracks: ["Black Sabbath", "The Wizard", "N.I.B."], fact: "Erschien an einem Freitag, dem 13. Februar 1970 – die Geburtsstunde des Heavy Metal." },
    { id: "paranoid", title: "Paranoid", year: 1970, era: "sabbath", guitarist: "Tony Iommi", emoji: "⚔️", colors: ["#3d2a52", "#120a1c"],
      tracks: ["War Pigs", "Paranoid", "Iron Man"], fact: "Der Titelsong entstand der Legende nach in wenigen Minuten als Lückenfüller im Studio." },
    { id: "master-of-reality", title: "Master of Reality", year: 1971, era: "sabbath", guitarist: "Tony Iommi", emoji: "🍃", colors: ["#1b1b1b", "#000000"],
      tracks: ["Sweet Leaf", "Children of the Grave", "Into the Void"], fact: "Tony Iommi stimmte seine Gitarre tiefer – ein Grundstein für Doom und Stoner Rock." },
    { id: "vol-4", title: "Vol. 4", year: 1972, era: "sabbath", guitarist: "Tony Iommi", emoji: "🙌", colors: ["#5a4a1a", "#1a1405"],
      tracks: ["Supernaut", "Changes", "Snowblind"], fact: "Mit „Changes“ steht hier eine Piano-Ballade – ungewöhnlich sanft für Sabbath." },
    { id: "sabbath-bloody-sabbath", title: "Sabbath Bloody Sabbath", year: 1973, era: "sabbath", guitarist: "Tony Iommi", emoji: "😈", colors: ["#6a0d0d", "#1a0202"],
      tracks: ["Sabbath Bloody Sabbath", "A National Acrobat", "Killing Yourself to Live"], fact: "Das Titelriff fand Iommi nach einer Schreibblockade in einem alten Schloss in England." },
    { id: "sabotage", title: "Sabotage", year: 1975, era: "sabbath", guitarist: "Tony Iommi", emoji: "🪞", colors: ["#4a3020", "#140c06"],
      tracks: ["Hole in the Sky", "Symptom of the Universe", "Megalomania"], fact: "„Symptom of the Universe“ gilt als früher Vorläufer des Thrash Metal." },
    { id: "technical-ecstasy", title: "Technical Ecstasy", year: 1976, era: "sabbath", guitarist: "Tony Iommi", emoji: "🤖", colors: ["#2a4a5a", "#081419"],
      tracks: ["Back Street Kids", "It's Alright", "Dirty Women"], fact: "Experimenteller Sound mit Keyboards – und Drummer Bill Ward singt „It's Alright“." },
    { id: "never-say-die", title: "Never Say Die!", year: 1978, era: "sabbath", guitarist: "Tony Iommi", emoji: "✈️", colors: ["#3a3a3a", "#0d0d0d"],
      tracks: ["Never Say Die", "Johnny Blade", "A Hard Road"], fact: "Ozzys letztes Sabbath-Studioalbum der 70er – kurz danach trennten sich die Wege." },
    { id: "blizzard-of-ozz", title: "Blizzard of Ozz", year: 1980, era: "solo", guitarist: "Randy Rhoads", emoji: "❄️", colors: ["#5a1a4a", "#1a0514"],
      tracks: ["I Don't Know", "Crazy Train", "Mr. Crowley", "Suicide Solution"], fact: "Das Solo-Debüt mit Gitarren-Wunderkind Randy Rhoads – „Crazy Train“ wird Ozzys bekanntester Song." },
    { id: "diary-of-a-madman", title: "Diary of a Madman", year: 1981, era: "solo", guitarist: "Randy Rhoads", emoji: "📓", colors: ["#4a0a0a", "#120202"],
      tracks: ["Over the Mountain", "Flying High Again", "Diary of a Madman"], fact: "Das letzte Studioalbum mit Randy Rhoads, der 1982 bei einem Flugzeugunglück starb." },
    { id: "bark-at-the-moon", title: "Bark at the Moon", year: 1983, era: "solo", guitarist: "Jake E. Lee", emoji: "🐺", colors: ["#1a2a5a", "#050a1a"],
      tracks: ["Bark at the Moon", "You're No Different", "So Tired"], fact: "Jake E. Lee übernimmt die Gitarre – im Musikvideo verwandelt sich Ozzy in einen Werwolf." },
    { id: "the-ultimate-sin", title: "The Ultimate Sin", year: 1986, era: "solo", guitarist: "Jake E. Lee", emoji: "🔱", colors: ["#5a2a0a", "#1a0a02"],
      tracks: ["The Ultimate Sin", "Shot in the Dark", "Never Know Why"], fact: "Glänzender 80er-Sound und das letzte Album mit Jake E. Lee." },
    { id: "no-rest-for-the-wicked", title: "No Rest for the Wicked", year: 1988, era: "solo", guitarist: "Zakk Wylde", emoji: "⛓️", colors: ["#3a0a2a", "#10020c"],
      tracks: ["Miracle Man", "Crazy Babies", "Fire in the Sky"], fact: "Debüt des damals 21-jährigen Zakk Wylde, der Ozzy jahrzehntelang begleiten sollte." },
    { id: "no-more-tears", title: "No More Tears", year: 1991, era: "solo", guitarist: "Zakk Wylde", emoji: "💧", colors: ["#0a3a4a", "#021014"],
      tracks: ["Mr. Tinkertrain", "No More Tears", "Mama, I'm Coming Home", "Road to Nowhere"], fact: "„Mama, I'm Coming Home“ schrieb Ozzy zusammen mit Motörhead-Legende Lemmy Kilmister." },
    { id: "ozzmosis", title: "Ozzmosis", year: 1995, era: "solo", guitarist: "Zakk Wylde", emoji: "🧬", colors: ["#2a5a2a", "#081a08"],
      tracks: ["Perry Mason", "I Just Want You", "See You on the Other Side"], fact: "Sabbath-Kollege Geezer Butler spielt auf diesem Album Bass." },
    { id: "down-to-earth", title: "Down to Earth", year: 2001, era: "solo", guitarist: "Zakk Wylde", emoji: "🌍", colors: ["#4a3a1a", "#140f05"],
      tracks: ["Gets Me Through", "Dreamer", "That I Never Had"], fact: "Die Ballade „Dreamer“ beschrieb Ozzy selbst als seine Version von „Imagine“." },
    { id: "black-rain", title: "Black Rain", year: 2007, era: "solo", guitarist: "Zakk Wylde", emoji: "🌧️", colors: ["#1a1a2a", "#05050a"],
      tracks: ["Not Going Away", "I Don't Wanna Stop", "Black Rain"], fact: "Laut Ozzy das erste Album, das er komplett nüchtern aufgenommen hat." },
    { id: "scream", title: "Scream", year: 2010, era: "solo", guitarist: "Gus G.", emoji: "😱", colors: ["#5a0a0a", "#1a0202"],
      tracks: ["Let It Die", "Let Me Hear You Scream", "Life Won't Wait"], fact: "Firewind-Gitarrist Gus G. bringt frischen Wind in Ozzys Band." },
    { id: "13", title: "13", year: 2013, era: "sabbath", guitarist: "Tony Iommi", emoji: "🔥", colors: ["#6a3a0a", "#1a0e02"],
      tracks: ["End of the Beginning", "God Is Dead?", "Loner"], fact: "Das Sabbath-Comeback nach 35 Jahren mit Produzent Rick Rubin – Platz 1 in Großbritannien." },
    { id: "ordinary-man", title: "Ordinary Man", year: 2020, era: "solo", guitarist: "Andrew Watt", emoji: "🎹", colors: ["#3a2a4a", "#0c0814"],
      tracks: ["Straight to Hell", "Ordinary Man", "Under the Graveyard"], fact: "Der Titelsong ist ein Duett mit Elton John; Duff McKagan und Chad Smith spielen mit." },
    { id: "patient-number-9", title: "Patient Number 9", year: 2022, era: "solo", guitarist: "Andrew Watt", emoji: "🏥", colors: ["#1a4a3a", "#05140f"],
      tracks: ["Patient Number 9", "Degradation Rules", "One of Those Days"], fact: "Gäste wie Jeff Beck, Eric Clapton und Tony Iommi – ausgezeichnet mit dem Grammy als bestes Rock-Album." },
  ];

  // -------------------------
  // PURE HELPERS
  // -------------------------

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/['\u2019]/g, "")
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** Filter + Suche + Sortierung. Gibt { album, matchedTrack } zurück. */
  function filterAlbums(albums, opts) {
    const o = opts || {};
    const era = o.era || "all";
    const q = normalize(o.query);
    const favs = o.favorites instanceof Set ? o.favorites : new Set(o.favorites || []);
    const out = [];
    albums.forEach((album) => {
      if (era === "fav" && !favs.has(album.id)) return;
      if (era !== "all" && era !== "fav" && album.era !== era) return;
      let matchedTrack = null;
      if (q) {
        const inMeta = [album.title, String(album.year), album.guitarist, album.era === "sabbath" ? "black sabbath" : "solo"]
          .map(normalize)
          .some((t) => t.includes(q));
        matchedTrack = album.tracks.find((t) => normalize(t).includes(q)) || null;
        if (!inMeta && !matchedTrack) return;
      }
      out.push({ album, matchedTrack });
    });
    out.sort((a, b) => (o.desc ? b.album.year - a.album.year : a.album.year - b.album.year));
    return out;
  }

  function stats(albums) {
    const years = albums.map((a) => a.year);
    const guitarists = new Set(albums.map((a) => a.guitarist));
    return {
      albums: albums.length,
      sabbath: albums.filter((a) => a.era === "sabbath").length,
      solo: albums.filter((a) => a.era === "solo").length,
      span: years.length ? Math.max(...years) - Math.min(...years) : 0,
      guitarists: guitarists.size,
    };
  }

  const AUDIO_EXT = /\.(mp3|m4a|aac|ogg|oga|opus|flac|wav|webm)$/i;

  /**
   * Eigene Audiodateien → Playlist. Nur Audio, natürlich sortiert (01, 02 … 10),
   * Titel aus dem Dateinamen ohne Endung und führende Tracknummer.
   */
  function buildPlaylist(files) {
    return Array.from(files || [])
      .filter((f) => f && ((f.type && f.type.startsWith("audio/")) || AUDIO_EXT.test(f.name || "")))
      .sort((a, b) => String(a.name).localeCompare(String(b.name), "de", { numeric: true, sensitivity: "base" }))
      .map((file) => ({
        file,
        title:
          String(file.name)
            .replace(/\.[^.]+$/, "")
            .replace(/^\s*\d{1,3}\s*[-._)]*\s*/, "")
            .replace(/[_]+/g, " ")
            .trim() || String(file.name),
      }));
  }

  function toggleFavorite(set, id) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  }

  // -------------------------
  // VINYL CRACKLE (Web Audio)
  // -------------------------

  function createCrackle() {
    const AudioCtx = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
    let ctx = null;
    let src = null;
    let gain = null;
    return {
      start() {
        if (!AudioCtx) return;
        if (!ctx) ctx = new AudioCtx();
        if (ctx.state === "suspended") ctx.resume();
        this.stop();
        const len = ctx.sampleRate * 2;
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
          const pop = Math.random() < 0.0008 ? (Math.random() * 2 - 1) * 0.9 : 0;
          data[i] = (Math.random() * 2 - 1) * 0.015 + pop;
        }
        src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 900;
        gain = ctx.createGain();
        gain.gain.value = 0.5;
        src.connect(filter).connect(gain).connect(ctx.destination);
        src.start();
      },
      stop() {
        if (src) {
          try {
            src.stop();
          } catch (e) {
            /* already stopped */
          }
          src.disconnect();
          src = null;
        }
      },
    };
  }

  // -------------------------
  // UI
  // -------------------------

  function init() {
    if (typeof document === "undefined") return null;
    const grid = document.getElementById("albumGrid");
    if (!grid) return null;
    const search = document.getElementById("discoSearch");
    const sortBtn = document.getElementById("discoSort");
    const chips = document.querySelectorAll(".disco-filter .filter-chip");
    const empty = document.getElementById("discoEmpty");
    const statsEl = document.getElementById("discoStats");
    const vinyl = document.getElementById("vinyl");
    const vinylLabel = document.getElementById("vinylLabel");
    const tonearm = document.getElementById("tonearm");
    const ttKicker = document.getElementById("turntableKicker");
    const ttTitle = document.getElementById("turntableTitle");
    const ttMeta = document.getElementById("turntableMeta");
    const ttTracks = document.getElementById("turntableTracks");
    const stopBtn = document.getElementById("turntableStop");
    const shuffleBtn = document.getElementById("turntableShuffle");
    const crackleBtn = document.getElementById("turntableCrackle");
    const ownPanel = document.getElementById("turntableOwn");
    const ownLoad = document.getElementById("ownAlbumLoad");
    const ownInput = document.getElementById("ownAlbumInput");
    const ownPause = document.getElementById("ownPlayPause");
    const ownNext = document.getElementById("ownNext");
    const ownNow = document.getElementById("ownNowPlaying");
    const audioEl = document.getElementById("turntableAudio");

    const getJSON = (k, f) => (Utils ? Utils.safeGetJSON(k, f) : f);
    const setJSON = (k, v) => Utils && Utils.safeSetJSON(k, v);
    const emit = (type, detail) =>
      document.dispatchEvent(new CustomEvent("ozzy:action", { detail: { type, ...detail } }));

    const state = {
      era: "all",
      query: "",
      desc: false,
      favorites: new Set((getJSON(FAV_KEY, []) || []).filter((id) => ALBUMS.some((a) => a.id === id))),
      flipped: new Set(),
      playing: null,
      crackle: true,
    };
    const crackle = createCrackle();

    function renderStats() {
      if (!statsEl) return;
      const s = stats(ALBUMS);
      statsEl.replaceChildren();
      [
        [s.albums, "Studioalben"],
        [s.span, "Jahre Musik"],
        [s.guitarists, "Gitarristen"],
        [state.favorites.size, "deine Favoriten"],
      ].forEach(([n, label]) => {
        const box = document.createElement("div");
        box.className = "disco-stat";
        const num = document.createElement("strong");
        num.textContent = String(n);
        const lab = document.createElement("span");
        lab.textContent = label;
        box.append(num, lab);
        statsEl.appendChild(box);
      });
    }

    function card({ album, matchedTrack }) {
      const art = document.createElement("article");
      art.className = "album" + (state.flipped.has(album.id) ? " is-flipped" : "") + (state.playing === album.id ? " is-playing" : "");
      art.dataset.id = album.id;
      art.style.setProperty("--c1", album.colors[0]);
      art.style.setProperty("--c2", album.colors[1]);

      const inner = document.createElement("div");
      inner.className = "album__inner";

      // Front
      const front = document.createElement("button");
      front.type = "button";
      front.className = "album__face album__front";
      front.dataset.action = "flip";
      front.setAttribute("aria-label", `${album.title} (${album.year}) – Details anzeigen`);
      const em = document.createElement("span");
      em.className = "album__emoji";
      em.textContent = album.emoji;
      em.setAttribute("aria-hidden", "true");
      const t = document.createElement("span");
      t.className = "album__title";
      t.textContent = album.title;
      const y = document.createElement("span");
      y.className = "album__year";
      y.textContent = String(album.year);
      const band = document.createElement("span");
      band.className = "album__band";
      band.textContent = album.era === "sabbath" ? "Black Sabbath" : "Ozzy Osbourne";
      front.append(band, em, t, y);
      if (matchedTrack) {
        const hit = document.createElement("span");
        hit.className = "album__hit";
        hit.textContent = `🎵 ${matchedTrack}`;
        front.appendChild(hit);
      }

      // Back
      const back = document.createElement("div");
      back.className = "album__face album__back";
      const bt = document.createElement("h3");
      bt.textContent = `${album.title} · ${album.year}`;
      const g = document.createElement("p");
      g.className = "album__guitar";
      g.textContent = `🎸 ${album.guitarist}`;
      const ul = document.createElement("ul");
      ul.className = "album__tracks";
      album.tracks.forEach((tr) => {
        const li = document.createElement("li");
        li.textContent = tr;
        if (matchedTrack === tr) li.className = "is-match";
        ul.appendChild(li);
      });
      const fact = document.createElement("p");
      fact.className = "album__fact";
      fact.textContent = album.fact;
      const actions = document.createElement("div");
      actions.className = "album__actions";
      const play = document.createElement("button");
      play.type = "button";
      play.className = "album__btn";
      play.dataset.action = "play";
      play.textContent = state.playing === album.id ? "⏹ Läuft" : "💿 Auflegen";
      const fav = document.createElement("button");
      fav.type = "button";
      fav.className = "album__btn album__fav" + (state.favorites.has(album.id) ? " is-fav" : "");
      fav.dataset.action = "fav";
      fav.setAttribute("aria-pressed", String(state.favorites.has(album.id)));
      fav.setAttribute("aria-label", `${album.title} als Favorit markieren`);
      fav.textContent = state.favorites.has(album.id) ? "❤️" : "🤍";
      const flipBack = document.createElement("button");
      flipBack.type = "button";
      flipBack.className = "album__btn";
      flipBack.dataset.action = "flip";
      flipBack.setAttribute("aria-label", "Cover wieder anzeigen");
      flipBack.textContent = "↩";
      actions.append(play, fav, flipBack);
      back.append(bt, g, ul, fact, actions);

      inner.append(front, back);
      art.appendChild(inner);
      return art;
    }

    function render() {
      const list = filterAlbums(ALBUMS, state);
      grid.replaceChildren(...list.map(card));
      if (empty) empty.hidden = list.length > 0;
      renderStats();
    }

    // -------------------------
    // EIGENE PLATTE (nur lokale Dateien des Nutzers)
    // -------------------------
    const own = { list: [], index: -1, url: null };

    function revokeUrl() {
      if (own.url && typeof URL !== "undefined" && URL.revokeObjectURL) URL.revokeObjectURL(own.url);
      own.url = null;
    }

    function updateOwnUI() {
      const active = own.index >= 0 && own.list.length > 0;
      const paused = !audioEl || audioEl.paused;
      if (ownPause) {
        ownPause.disabled = !active;
        ownPause.textContent = active && !paused ? "⏸ Pause" : "▶ Weiter";
      }
      if (ownNext) ownNext.disabled = !active || own.list.length < 2;
      if (ownNow) {
        ownNow.textContent = active
          ? `🎧 ${own.index + 1}/${own.list.length}: ${own.list[own.index].title}`
          : "Noch keine eigene Datei geladen.";
      }
      vinyl?.classList.toggle("is-paused", Boolean(state.playing) && active && paused);
    }

    function stopOwn() {
      if (audioEl) {
        try {
          audioEl.pause();
        } catch (e) {
          /* jsdom */
        }
        audioEl.removeAttribute("src");
      }
      revokeUrl();
      own.list = [];
      own.index = -1;
      if (ownInput) ownInput.value = "";
      updateOwnUI();
    }

    function playOwn(index) {
      if (!audioEl || !own.list[index]) return;
      revokeUrl();
      own.index = index;
      own.url = URL.createObjectURL(own.list[index].file);
      audioEl.src = own.url;
      const p = audioEl.play && audioEl.play();
      if (p && typeof p.catch === "function") p.catch(() => updateOwnUI());
      updateOwnUI();
    }

    ownLoad?.addEventListener("click", () => ownInput?.click());
    ownInput?.addEventListener("change", () => {
      const list = buildPlaylist(ownInput.files);
      if (!list.length) {
        if (ownNow) ownNow.textContent = "Keine Audiodateien gefunden (z. B. MP3, FLAC, M4A).";
        return;
      }
      stopOwn();
      own.list = list;
      // Knistern leiser, damit die eigene Platte im Vordergrund steht
      crackle.stop();
      playOwn(0);
      emit("ownVinyl", { id: state.playing });
    });
    ownPause?.addEventListener("click", () => {
      if (!audioEl || own.index < 0) return;
      if (audioEl.paused) {
        const p = audioEl.play && audioEl.play();
        if (p && typeof p.catch === "function") p.catch(() => updateOwnUI());
      } else audioEl.pause();
      updateOwnUI();
    });
    ownNext?.addEventListener("click", () => playOwn((own.index + 1) % own.list.length));
    audioEl?.addEventListener("ended", () => {
      if (own.index + 1 < own.list.length) playOwn(own.index + 1);
      else updateOwnUI();
    });
    audioEl?.addEventListener("play", updateOwnUI);
    audioEl?.addEventListener("pause", updateOwnUI);

    function setTurntable(album) {
      if (!album || album.id !== state.playing) stopOwn();
      if (ownPanel) ownPanel.hidden = !album;
      state.playing = album ? album.id : null;
      vinyl?.classList.toggle("is-spinning", Boolean(album));
      tonearm?.classList.toggle("is-on", Boolean(album));
      if (stopBtn) stopBtn.disabled = !album;
      if (vinylLabel) {
        vinylLabel.style.background = album ? `radial-gradient(circle, ${album.colors[0]}, ${album.colors[1]})` : "";
        vinylLabel.firstElementChild.textContent = album ? album.emoji : "🦇";
      }
      if (ttKicker) ttKicker.textContent = album ? (album.era === "sabbath" ? "Black Sabbath · " : "Ozzy Osbourne · ") + album.year : "Plattenspieler";
      if (ttTitle) ttTitle.textContent = album ? album.title : "Keine Platte aufgelegt";
      if (ttMeta) ttMeta.textContent = album ? `🎸 ${album.guitarist} – ${album.fact}` : "Wähle unten ein Album und klicke „💿 Auflegen“.";
      if (ttTracks) {
        ttTracks.replaceChildren();
        (album ? album.tracks : []).forEach((tr) => {
          const li = document.createElement("li");
          li.textContent = tr;
          ttTracks.appendChild(li);
        });
      }
      if (album && state.crackle && own.index < 0) crackle.start();
      else crackle.stop();
      if (album) emit("vinyl", { id: album.id });
      render();
    }

    grid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      const art = e.target.closest(".album");
      if (!btn || !art) return;
      const album = ALBUMS.find((a) => a.id === art.dataset.id);
      if (!album) return;
      const action = btn.dataset.action;
      if (action === "flip") {
        if (state.flipped.has(album.id)) state.flipped.delete(album.id);
        else {
          state.flipped.add(album.id);
          emit("albumFlip", { id: album.id });
        }
        art.classList.toggle("is-flipped");
        const target = art.classList.contains("is-flipped")
          ? art.querySelector('.album__back [data-action="play"]')
          : art.querySelector(".album__front");
        target?.focus({ preventScroll: true });
        return;
      }
      if (action === "fav") {
        state.favorites = toggleFavorite(state.favorites, album.id);
        setJSON(FAV_KEY, [...state.favorites]);
        if (state.favorites.has(album.id)) emit("albumFav", { id: album.id });
        render();
        grid.querySelector(`.album[data-id="${album.id}"] .album__fav`)?.focus({ preventScroll: true });
        return;
      }
      if (action === "play") {
        setTurntable(state.playing === album.id ? null : album);
        const deck = document.getElementById("turntable");
        const r = deck && deck.getBoundingClientRect();
        if (r && typeof deck.scrollIntoView === "function" && (r.bottom < 0 || r.top > window.innerHeight)) {
          deck.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        state.era = chip.dataset.era || "all";
        chips.forEach((c) => {
          c.classList.toggle("is-active", c === chip);
          c.setAttribute("aria-pressed", String(c === chip));
        });
        render();
      });
    });

    let searchTimer = null;
    search?.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.query = search.value;
        render();
      }, 120);
    });

    sortBtn?.addEventListener("click", () => {
      state.desc = !state.desc;
      sortBtn.textContent = state.desc ? "⇅ Neu → Alt" : "⇅ Alt → Neu";
      render();
    });

    stopBtn?.addEventListener("click", () => setTurntable(null));
    shuffleBtn?.addEventListener("click", () => {
      const pool = ALBUMS.filter((a) => a.id !== state.playing);
      setTurntable(pool[Math.floor(Math.random() * pool.length)]);
    });
    crackleBtn?.addEventListener("click", () => {
      state.crackle = !state.crackle;
      crackleBtn.setAttribute("aria-pressed", String(state.crackle));
      crackleBtn.textContent = state.crackle ? "🔊 Knistern an" : "🔇 Knistern aus";
      if (state.crackle && state.playing && own.index < 0) crackle.start();
      else crackle.stop();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") crackle.stop();
      else if (state.crackle && state.playing && own.index < 0) crackle.start();
    });

    render();
    return {
      state,
      render,
      play: (id) => setTurntable(ALBUMS.find((a) => a.id === id) || null),
      own,
    };
  }

  return { ALBUMS, FAV_KEY, normalize, filterAlbums, stats, toggleFavorite, buildPlaylist, init };
});
