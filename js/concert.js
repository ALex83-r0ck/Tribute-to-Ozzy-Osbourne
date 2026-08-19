// ========== js/concert.js ==========
// Depends on: OzzyUtils, OzzyTheme

document.addEventListener("DOMContentLoaded", () => {
  const U = window.OzzyUtils;
  const T = window.OzzyTheme;
  if (!U || !T) {
    console.error("Concert dependencies missing.");
    return;
  }

  T.initTheme({ includeDisco: false });

  // --- STAGE LIGHTS ---
  const lightBtns = document.querySelectorAll(".light-btn");
  lightBtns.forEach((btn) => {
    btn.setAttribute("aria-pressed", btn.classList.contains("active") ? "true" : "false");
    btn.addEventListener("click", () => {
      const color = btn.dataset.color;
      document.body.setAttribute("data-theme", color);
      lightBtns.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    });
  });

  // --- RESET (only app keys, not entire origin storage blindly if possible) ---
  document.getElementById("resetApp")?.addEventListener("click", () => {
    if (confirm("Alles zurücksetzen? 🤘")) {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach((k) => {
          if (k.startsWith("ozzy") || k.startsWith("votes_") || k.startsWith("albumvotes_")) localStorage.removeItem(k);
        });
      } catch (e) {
        /* ignore */
      }
      location.reload();
    }
  });

  // --- CARD FLIP (Tours) ---
  document.querySelectorAll(".legacy-card").forEach((card) => {
    card.setAttribute("aria-expanded", "false");

    card.addEventListener("click", (e) => {
      if (!e.target.closest(".vote-btn") && !e.target.closest(".close-card-btn")) {
        const flipped = card.classList.toggle("is-flipped");
        card.setAttribute("aria-expanded", flipped ? "true" : "false");
      }
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (e.target.closest(".vote-btn") || e.target.closest(".close-card-btn")) return;
        if (e.key === " ") e.preventDefault();
        const flipped = card.classList.toggle("is-flipped");
        card.setAttribute("aria-expanded", flipped ? "true" : "false");
      }
    });

    card.querySelector(".close-card-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      card.classList.remove("is-flipped");
      card.setAttribute("aria-expanded", "false");
    });
  });

  // --- VOTING (one vote per tour per session via storage flag) ---
  document.querySelectorAll(".legacy-card").forEach((card) => {
    const id = card.dataset.tour;
    const btn = card.querySelector(".vote-btn");
    const countEl = card.querySelector(".vote-count");
    if (!id || !btn || !countEl) return;

    let count = parseInt(U.safeGetString(`votes_${id}`, "0"), 10) || 0;
    const votedKey = `votes_done_${id}`;
    let voted = U.safeGetString(votedKey, "0") === "1";
    countEl.textContent = String(count);
    if (voted) {
      btn.disabled = true;
      btn.setAttribute("aria-label", "Bereits gevotet");
    }

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (voted) {
        U.createToast("Schon gevotet! 🤘", 1200);
        return;
      }
      count++;
      voted = true;
      countEl.textContent = String(count);
      U.safeSet(`votes_${id}`, String(count));
      U.safeSet(votedKey, "1");
      btn.disabled = true;
      btn.setAttribute("aria-label", "Bereits gevotet");
      if (!U.prefersReducedMotion()) {
        card.classList.add("shake");
        setTimeout(() => card.classList.remove("shake"), 300);
      }
      U.createToast("Vote gespeichert!", 1000);
    });
  });

  // --- ALBUM VOTING ---
  document.querySelectorAll('.album-vote-btn').forEach(btn => {
    const id = btn.dataset.albumId;
    const countEl = btn.querySelector('.album-vote-count');
    if (!id || !countEl) return;
    
    let count = parseInt(U.safeGetString(`albumvotes_${id}`, '0'), 10) || 0;
    const votedKey = `albumvotes_done_${id}`;
    let voted = U.safeGetString(votedKey, '0') === '1';
    countEl.textContent = String(count);
    if (voted) { btn.disabled = true; btn.setAttribute('aria-label', 'Bereits gevotet'); }
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (voted) { U.createToast('Schon gevotet! 🤘', 1200); return; }
      count++;
      voted = true;
      countEl.textContent = String(count);
      U.safeSet(`albumvotes_${id}`, String(count));
      U.safeSet(votedKey, '1');
      btn.disabled = true;
      btn.setAttribute('aria-label', 'Bereits gevotet');
      U.createToast('Album-Vote gespeichert! 💿', 1000);
    });
  });

  // --- ALBUM MODAL ---
  const modal = document.getElementById("albumModal");
  const mTitle = document.getElementById("modalTitle");
  const mTracks = document.getElementById("trackList");

  let previouslyFocusedElement = null;

  const closeModal = () => {
    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
      previouslyFocusedElement.focus();
    }
    modal?.classList.remove("ozzy-modal--open");
    modal?.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", handleEscapeClose);
  };

  const openModal = () => {
    previouslyFocusedElement = document.activeElement;
    modal?.classList.add("ozzy-modal--open");
    modal?.setAttribute("aria-hidden", "false");
    document.getElementById("modalCloseBtn")?.focus();
    document.addEventListener("keydown", handleEscapeClose);
  };

  const handleEscapeClose = (e) => {
    if (e.key === "Escape") closeModal();
  };

  document.querySelectorAll(".album-card").forEach((card) => {
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    const open = () => {
      const title = card.querySelector("h3")?.textContent || "Album";
      const tracks = (card.dataset.tracks || "").split(",").map((t) => t.trim()).filter(Boolean);
      if (mTitle) mTitle.textContent = title;
      if (mTracks) {
        mTracks.replaceChildren();
        tracks.forEach((t) => {
          const li = document.createElement("li");
          li.textContent = t;
          mTracks.appendChild(li);
        });
      }
      openModal();
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

  document.getElementById("modalCloseBtn")?.addEventListener("click", closeModal);
  document.getElementById("modalCloseBackdrop")?.addEventListener("click", closeModal);

  // --- CHEER ---
  document.getElementById("cheerBtn")?.addEventListener("click", () => {
    if (U.prefersReducedMotion()) {
      U.createToast("🤘 ROCK ON! 🤘", 1200);
      return;
    }
    const n = window.innerWidth < 600 ? 8 : 15;
    for (let i = 0; i < n; i++) {
      const el = document.createElement("div");
      el.className = "cheer-emoji";
      el.setAttribute("aria-hidden", "true");
      el.textContent = ["🤘", "🔥", "🎸", "⚡"][Math.floor(Math.random() * 4)];
      el.style.left = Math.random() * 100 + "vw";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    }
  });

  // --- SCROLL REVEAL ---
  if (window.IntersectionObserver) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) en.target.classList.add('revealed');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.legacy-section').forEach(s => revealObserver.observe(s));
  } else {
    document.querySelectorAll('.legacy-section').forEach(s => s.classList.add('revealed'));
  }

  // --- STAGE LIGHT EASTER EGG ---
  const eggSequence = ['red', 'blue', 'purple', 'gold'];
  let eggProgress = 0;
  lightBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.color === eggSequence[eggProgress]) {
        eggProgress++;
        if (eggProgress >= eggSequence.length) {
          eggProgress = 0;
          // Special effect: rainbow flash
          document.body.style.transition = 'background 0.3s';
          ['#ff0000','#0000ff','#800080','#ffd700','#00ff00','#ff6600',''].forEach((c, i) => {
            setTimeout(() => { document.body.style.backgroundColor = c || ''; }, i * 200);
          });
          U.createToast('🌈 RAINBOW SABBATH ACTIVATED! 🌈', 2500);
        }
      } else {
        eggProgress = btn.dataset.color === eggSequence[0] ? 1 : 0;
      }
    });
  });
});
