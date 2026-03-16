// js/main.js
// ==============================
// OZZY FAN PROJEKT — MAIN (REPAIRED & SLIM)
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  console.log("OZZY LEBT – SYSTEM BOOTET...");

  // -------------------------
  // Helpers: Toast
  // -------------------------
  function createToast(text, timeout = 2000) {
    const t = document.createElement("div");
    t.className = "ozzy-toast";
    t.textContent = text;
    Object.assign(t.style, {
      position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)",
      background: "rgba(0,0,0,0.8)", color: "#fff", padding: "0.6rem 1rem",
      borderRadius: "8px", zIndex: 99999, boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
      fontWeight: 700,
    });
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("ozzy-toast--hide"), timeout - 300);
    setTimeout(() => t.remove(), timeout);
    return t;
  }

  // -------------------------
  // VERTICAL SCROLL PROGRESS (Crazy Train)
  // -------------------------
  (function initScrollProgress() {
    const bar = document.getElementById("scrollProgressBar");
    if (!bar) return;
    window.addEventListener("scroll", () => {
      const winScroll = window.pageYOffset || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      bar.style.height = scrolled + "%";
    });
  })();

  // -------------------------
  // BUTTONS & MODES
  // -------------------------
  (function initButtons() {
    const themeBtn = document.getElementById("themeToggle");
    const moonBtn = document.getElementById("moonToggle");
    const discoBtn = document.getElementById("discoToggle");
    const quoteBtn = document.getElementById("quoteButton");
    const quoteEl = document.getElementById("quote");

    themeBtn?.addEventListener("click", () => {
      document.body.classList.remove("moon-mode");
      document.body.classList.toggle("light-mode");
      document.body.classList.toggle("dark-mode");
      createToast(document.body.classList.contains("light-mode") ? "Light Mode" : "Dark Mode", 800);
    });

    moonBtn?.addEventListener("click", () => {
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
      const active = document.body.classList.toggle("moon-mode");
      createToast(active ? "Moonlight Mode 🌙" : "Standard Mode", 800);
    });

    discoBtn?.addEventListener("click", () => {
      const active = document.body.classList.toggle("disco-mode");
      createToast(active ? "Disco An! 🕺" : "Disco Aus", 800);
    });

    const quotes = [
      "Ich bin Ozzy, Baby!", "Crazy Train fährt nie zu spät.", "Bark at the Moon!",
      "Rock and Roll hält ewig.", "Prince of Darkness lebt weiter!", "I love you all!",
      "Of all the things I've lost, I miss my mind the most."
    ];
    quoteBtn?.addEventListener("click", () => {
      if (quoteEl) quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    });
  })();

  // -------------------------
  // STATS (Bat Counter)
  // -------------------------
  const batCounterEl = document.getElementById("batCounter");
  let batScore = parseInt(localStorage.getItem("ozzyBatScore") || "0");
  if (batCounterEl) batCounterEl.textContent = batScore;

  function updateBatScore() {
    batScore++;
    if (batCounterEl) batCounterEl.textContent = batScore;
    localStorage.setItem("ozzyBatScore", batScore);
  }

  // -------------------------
  // TRIBUTE WALL
  // -------------------------
  (function initTributeWall() {
    const btn = document.getElementById("lightCandle");
    const countEl = document.getElementById("candleCount");
    const container = document.getElementById("candleContainer");
    if (!btn || !countEl || !container) return;

    let count = parseInt(localStorage.getItem("ozzyCandles") || "0");
    countEl.textContent = count;
    for(let i=0; i < Math.min(count, 50); i++) addCandleDOM();

    btn.addEventListener("click", () => {
      count++;
      countEl.textContent = count;
      localStorage.setItem("ozzyCandles", count);
      addCandleDOM();
      createToast("Eine Kerze für Ozzy brennt... 🕯️", 1000);
    });

    function addCandleDOM() {
      const c = document.createElement("span");
      c.className = "candle-emoji";
      c.textContent = "🕯️";
      container.appendChild(c);
      container.scrollTop = container.scrollHeight;
    }
  })();

  // -------------------------
  // FLAME CANVAS
  // -------------------------
  (function initFlameCanvas() {
    const canvas = document.getElementById("flameCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = 0, height = 0;
    const FLAME_COUNT = 60;
    function resize() { width = (canvas.width = window.innerWidth); height = (canvas.height = window.innerHeight); }
    resize();
    window.addEventListener("resize", resize);

    const flames = new Array(FLAME_COUNT).fill(0).map(() => ({
      x: Math.random() * width, y: height + Math.random() * 200,
      size: Math.random() * 14 + 6, speed: Math.random() * 3 + 1.5,
    }));

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const isMoon = document.body.classList.contains("moon-mode");
      flames.forEach((f) => {
        ctx.beginPath();
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 1.6);
        if (isMoon) {
          grad.addColorStop(0, `rgba(173,216,230,0.6)`);
          grad.addColorStop(1, "rgba(0,0,0,0)");
        } else {
          grad.addColorStop(0, `rgba(255,${140 + Math.random() * 70},0,0.8)`);
          grad.addColorStop(1, "rgba(0,0,0,0)");
        }
        ctx.fillStyle = grad;
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();
        f.y -= f.speed;
        f.size *= 0.992;
        if (f.y < -50 || f.size < 0.8) {
          f.x = Math.random() * width; f.y = height + Math.random() * 100; f.size = Math.random() * 14 + 6;
        }
      });
      requestAnimationFrame(draw);
    }
    draw();
  })();

  // -------------------------
  // SHRINE & OFFERINGS
  // -------------------------
  (function initShrine() {
    const container = document.getElementById("offeringsContainer");
    if (!container) return;

    const effects = {
      bier: () => { showEasterText("PROST, OZZY!"); createDrops("🍺"); },
      blood: () => { showEasterText("NO MORE TEARS..."); createDrops("🩸"); },
      bat: () => { spawnSpecialBat(); },
      crazy: () => { document.body.classList.add("train-shake"); setTimeout(() => document.body.classList.remove("train-shake"), 1500); showEasterText("ALL ABOARD!"); },
      iron: () => { document.body.style.filter = "contrast(2) grayscale(1)"; setTimeout(() => document.body.style.filter = "", 2000); showEasterText("I AM IRON MAN!"); },
      headbang: () => { document.body.classList.add("headbang-plus"); setTimeout(() => document.body.classList.remove("headbang-plus"), 2000); showEasterText("🤘 ROCK ON! 🤘"); }
    };

    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".offering-btn");
      if (btn && effects[btn.dataset.id]) effects[btn.dataset.id]();
    });

    function spawnSpecialBat() {
      showEasterText("BARK AT THE MOON!");
      const bat = document.createElement("div");
      bat.textContent = "🦇";
      Object.assign(bat.style, {
        position: "fixed", left: "-100px", top: "50vh", fontSize: "80px", zIndex: 100002,
        cursor: "pointer", transition: "all 3s linear", pointerEvents: "auto"
      });
      document.body.appendChild(bat);
      setTimeout(() => { bat.style.left = "110vw"; bat.style.top = Math.random() * 100 + "vh"; }, 50);

      bat.addEventListener("click", () => {
        updateBatScore();
        document.body.style.background = "red";
        setTimeout(() => document.body.style.background = "", 100);
        createToast("OUCH! 🦇🤘", 2000);
        bat.textContent = "😵";
        bat.style.transform = "rotate(180deg) translateY(500px)";
        setTimeout(() => bat.remove(), 1000);
      });
      setTimeout(() => { if(bat.parentNode) bat.remove(); }, 3100);
    }

    function showEasterText(text) {
      const el = document.getElementById("easterEffect");
      if (!el) return;
      el.innerHTML = `<p class="easter-text" style="color:#ff0000; font-size:2rem; font-weight:bold; text-shadow: 2px 2px #000;">${text}</p>`;
      setTimeout(() => el.innerHTML = "", 2000);
    }

    function createDrops(emoji) {
      for (let i = 0; i < 20; i++) {
        const d = document.createElement("div");
        d.textContent = emoji;
        Object.assign(d.style, {
          position: "fixed", left: Math.random() * 100 + "vw", top: "-50px",
          fontSize: "30px", zIndex: 10000, pointerEvents: "none", animation: "fall 3s linear forwards"
        });
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 3100);
      }
    }
  })();

  // -------------------------
  // GHOST OZZY
  // -------------------------
  (function initGhost() {
    const ghost = document.createElement("div");
    ghost.innerHTML = "👻";
    Object.assign(ghost.style, {
      position: "fixed", bottom: "-100px", right: "20px", fontSize: "50px",
      opacity: "0", transition: "all 1s ease-in-out", zIndex: 1000, cursor: "pointer"
    });
    document.body.appendChild(ghost);

    setInterval(() => {
      if (Math.random() > 0.8) {
        ghost.style.bottom = "20px"; ghost.style.opacity = "0.6";
        setTimeout(() => { ghost.style.bottom = "-100px"; ghost.style.opacity = "0"; }, 4000);
      }
    }, 12000);

    ghost.addEventListener("click", () => {
      createToast("OZZY GHOST: SHAAAARON!!!", 2000);
      ghost.style.transform = "scale(2) rotate(360deg)";
      setTimeout(() => ghost.style.transform = "scale(1) rotate(0deg)", 1000);
    });
  })();

  // -------------------------
  // TIMELINE REVEAL
  // -------------------------
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.style.opacity = "1"; en.target.style.transform = "translateY(0)"; } });
  }, { threshold: 0.1 });
  document.querySelectorAll(".timeline-v2-item").forEach(it => {
    it.style.opacity = "0"; it.style.transform = "translateY(30px)"; it.style.transition = "all 0.6s ease-out"; io.observe(it);
  });

  // Gallery Modal
  document.getElementById("gallery")?.addEventListener("click", (e) => {
      const card = e.target.closest(".gallery-card");
      if (!card) return;
      const img = card.querySelector(".galleryImage");
      const modal = document.createElement("div");
      modal.className = "ozzy-modal ozzy-modal--open";
      modal.innerHTML = `
        <div class="ozzy-modal__backdrop"></div>
        <div class="ozzy-modal__content">
            <button class="ozzy-modal__close">✕</button>
            <img src="${img.dataset.full || img.src}" class="ozzy-modal__img">
            <p class="ozzy-modal__caption">${img.getAttribute("alt")}</p>
        </div>`;
      document.body.appendChild(modal);
      modal.onclick = (e) => { if(e.target.matches(".ozzy-modal__backdrop") || e.target.matches(".ozzy-modal__close")) modal.remove(); };
  });
});
