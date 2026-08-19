// js/main.js – Ozzy Tribute Dashboard
// Depends on: OzzyUtils, OzzyTheme (loaded before this script)

document.addEventListener("DOMContentLoaded", () => {
  const U = window.OzzyUtils;
  const T = window.OzzyTheme;
  if (!U || !T) {
    console.error("OzzyUtils / OzzyTheme missing – check script order.");
    return;
  }

  // Theme + disco restore
  T.initTheme({ includeDisco: true });

  // -------------------------
  // VERTICAL SCROLL PROGRESS
  // -------------------------
  (function initScrollProgress() {
    const bar = document.getElementById("scrollProgressBar");
    if (!bar) return;
    let ticking = false;

    const update = () => {
      const winScroll = window.scrollY || document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      bar.style.height = scrolled + "%";
      ticking = false;
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
  })();

  // -------------------------
  // MOBILE NAV + BACK TO TOP
  // -------------------------
  (function initNavigation() {
    const navToggle = document.getElementById("mobileNavToggle");
    const nav = document.getElementById("mainHeaderNav");
    const backToTop = document.getElementById("backToTop");

    navToggle?.addEventListener("click", () => {
      const isOpen = nav?.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
      navToggle.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
    });

    nav?.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("nav-open");
        navToggle?.setAttribute("aria-expanded", "false");
        navToggle?.setAttribute("aria-label", "Menü öffnen");
      });
    });

    const toggleBackToTop = () => {
      if (!backToTop) return;
      const shouldShow = window.scrollY > 300;
      backToTop.classList.toggle("visible", shouldShow);
    };

    toggleBackToTop();
    window.addEventListener("scroll", toggleBackToTop, { passive: true });

    backToTop?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  })();

  // -------------------------
  // REVEAL ANIMATIONS
  // -------------------------
  (function initRevealAnimations() {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    if (!elements.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      elements.forEach((element) => observer.observe(element));
      return;
    }

    elements.forEach((element) => element.classList.add('is-visible'));
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
    const typewriter = U.createTypewriter();

    const quotes = [
      "Ich bin Ozzy, Baby!",
      "Crazy Train fährt nie zu spät.",
      "Bark at the Moon!",
      "Rock and Roll hält ewig.",
      "Prince of Darkness lebt weiter!",
      "I love you all!",
      "Of all the things I've lost, I miss my mind the most.",
      "You can't kill Rock and Roll.",
      "I'm not a politician, I'm a Rock and Roller.",
      "I got news for you: I am crazy.",
      "Just 'cause you got the monkey off your back doesn't mean the circus has left town.",
      "The bat thing will haunt me till my dying day.",
    ];

    themeBtn?.addEventListener("click", () => {
      const next = T.toggleLightDark();
      U.createToast(next === "light-mode" ? "Light Mode" : "Dark Mode", 800);
    });

    moonBtn?.addEventListener("click", () => {
      const next = T.toggleMoon();
      U.createToast(next === "moon-mode" ? "Moonlight Mode 🌙" : "Standard Mode", 800);
    });

    discoBtn?.addEventListener("click", () => {
      const active = T.toggleDisco(true);
      U.createToast(active ? "Disco An! 🕺" : "Disco Aus", 800);
    });

    function showRandomQuote() {
      if (!quoteEl) return;
      quoteEl.classList.add('glitch-text');
      setTimeout(() => {
        quoteEl.classList.remove('glitch-text');
        typewriter.run(quoteEl, quotes[Math.floor(Math.random() * quotes.length)]);
      }, 500);
    }

    quoteBtn?.addEventListener("click", showRandomQuote);

    document.addEventListener("keydown", (e) => {
      const tag = document.activeElement?.tagName.toLowerCase();
      if ((e.key === "q" || e.key === "Q") && tag !== "input" && tag !== "textarea") {
        showRandomQuote();
      }
    });
  })();

  // -------------------------
  // STATS (Bat Counter)
  // -------------------------
  const batCounterEl = document.getElementById("batCounter");
  let batScore = parseInt(U.safeGetString(U.STORAGE_KEYS.batScore, "0"), 10) || 0;
  if (batCounterEl) batCounterEl.textContent = String(batScore);

  function updateBatScore() {
    batScore++;
    if (batCounterEl) batCounterEl.textContent = String(batScore);
    U.safeSet(U.STORAGE_KEYS.batScore, String(batScore));
  }

  // -------------------------
  // TRIBUTE WALL
  // -------------------------
  (function initTributeWall() {
    const btn = document.getElementById("lightCandle");
    const nameInput = document.getElementById("candleName");
    const countEl = document.getElementById("candleCount");
    const container = document.getElementById("candleContainer");
    if (!btn || !countEl || !container) return;

    let candles = U.loadCandles();
    countEl.textContent = String(candles.length);
    candles.slice(-50).forEach((name) => addCandleDOM(name));

    function lightCandle(e) {
      const name = U.sanitizeName(nameInput?.value || "");
      candles.push(name);
      candles = U.saveCandles(candles);
      countEl.textContent = String(candles.length);
      addCandleDOM(name);
      
      if (e && !U.prefersReducedMotion()) {
        const cx = e.clientX || btn.getBoundingClientRect().left + btn.offsetWidth / 2;
        const cy = e.clientY || btn.getBoundingClientRect().top + btn.offsetHeight / 2;
        for (let i = 0; i < 15; i++) {
          const spark = document.createElement("div");
          spark.className = "candle-spark";
          spark.style.left = cx + "px";
          spark.style.top = cy + "px";
          const tx = (Math.random() - 0.5) * 100 + "px";
          const ty = (Math.random() - 1) * 100 + "px";
          spark.style.setProperty("--tx", tx);
          spark.style.setProperty("--ty", ty);
          document.body.appendChild(spark);
          setTimeout(() => spark.remove(), 800);
        }
      }

      if (nameInput) nameInput.value = "";
      U.createToast(
        name ? `🕯️ ${name} zündet eine Kerze für Ozzy an!` : "Eine Kerze für Ozzy brennt... 🕯️",
        1600
      );
    }

    btn.addEventListener("click", lightCandle);
    nameInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        lightCandle();
      }
    });

    function addCandleDOM(name) {
      const c = document.createElement("span");
      c.className = "candle-emoji";
      c.textContent = "🕯️";
      if (name) c.title = name;
      c.setAttribute("aria-hidden", "true");
      container.appendChild(c);
      // Keep DOM light: only last 50
      while (container.children.length > 50) {
        container.removeChild(container.firstChild);
      }
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
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let running = true;
    let rafId = 0;
    const isMobile = () => window.innerWidth < 768;
    const FLAME_COUNT = () => (isMobile() ? 28 : 60);

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let flames = makeFlames(FLAME_COUNT());

    function makeFlames(n) {
      return new Array(n).fill(0).map(() => ({
        x: Math.random() * Math.max(width, 1),
        y: height + Math.random() * 200,
        size: Math.random() * 14 + 6,
        speed: Math.random() * 3 + 1.5,
      }));
    }

    function shouldAnimate() {
      if (U.prefersReducedMotion()) return false;
      if (document.visibilityState === "hidden") return false;
      return running;
    }

    function draw() {
      if (!shouldAnimate()) {
        rafId = 0;
        return;
      }
      ctx.clearRect(0, 0, width, height);
      const isMoon = document.body.classList.contains("moon-mode");
      flames.forEach((f) => {
        ctx.beginPath();
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 1.6);
        if (isMoon) {
          grad.addColorStop(0, "rgba(173,216,230,0.6)");
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
          f.x = Math.random() * width;
          f.y = height + Math.random() * 100;
          f.size = Math.random() * 14 + 6;
        }
      });
      rafId = requestAnimationFrame(draw);
    }

    function start() {
      if (rafId) return;
      if (!shouldAnimate()) return;
      if (flames.length !== FLAME_COUNT()) flames = makeFlames(FLAME_COUNT());
      rafId = requestAnimationFrame(draw);
    }

    function stop() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      ctx.clearRect(0, 0, width, height);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") stop();
      else start();
    });

    if (U.prefersReducedMotion()) {
      // static soft glow instead of animation
      ctx.clearRect(0, 0, width, height);
    } else {
      start();
    }
  })();

  // -------------------------
  // SHRINE & OFFERINGS
  // -------------------------
  (function initShrine() {
    const container = document.getElementById("offeringsContainer");
    const altar = document.getElementById("altar");
    const offeringDsp = document.getElementById("altarOfferingDisplay");
    if (!container) return;

    const offeringEmoji = {
      bier: "🍺",
      blood: "🩸",
      bat: "🦇",
      crazy: "🚂",
      iron: "🤖",
      headbang: "🤘",
    };

    const effects = {
      bier: () => {
        showEasterText("PROST, OZZY!");
        createDrops("🍺");
      },
      blood: () => {
        showEasterText("NO MORE TEARS...");
        createDrops("🩸");
      },
      bat: () => {
        spawnSpecialBat();
      },
      crazy: () => {
        if (!U.prefersReducedMotion()) {
          document.body.classList.add("train-shake");
          setTimeout(() => document.body.classList.remove("train-shake"), 1500);
        }
        showEasterText("ALL ABOARD!");
      },
      iron: () => {
        document.body.style.filter = "contrast(2) grayscale(1)";
        setTimeout(() => {
          document.body.style.filter = "";
        }, 2000);
        showEasterText("I AM IRON MAN!");
      },
      headbang: () => {
        if (!U.prefersReducedMotion()) {
          document.body.classList.add("headbang-plus");
          setTimeout(() => document.body.classList.remove("headbang-plus"), 2000);
        }
        showEasterText("🤘 ROCK ON! 🤘");
      },
    };

    let dropHistory = [];

    function applyOffering(id) {
      if (!effects[id]) return;
      effects[id]();
      
      dropHistory.push(id);
      if (dropHistory.length > 3) dropHistory.shift();
      if (dropHistory.join(',') === 'bat,blood,bier') {
        document.body.classList.add('vampire-mode');
        showEasterText("VAMPIRE MODE UNLOCKED!");
        setTimeout(() => document.body.classList.remove('vampire-mode'), 5000);
        dropHistory = [];
      }

      if (offeringDsp && offeringEmoji[id]) {
        offeringDsp.classList.remove("visible");
        void offeringDsp.offsetWidth;
        offeringDsp.textContent = offeringEmoji[id];
        offeringDsp.classList.add("visible");
        setTimeout(() => offeringDsp.classList.remove("visible"), 2500);
      }
    }

    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".offering-btn");
      if (btn && btn.dataset.id) applyOffering(btn.dataset.id);
    });

    container.querySelectorAll(".offering-btn").forEach((btn) => {
      btn.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", btn.dataset.id);
        e.dataTransfer.effectAllowed = "copy";
        btn.classList.add("dragging");
      });
      btn.addEventListener("dragend", () => btn.classList.remove("dragging"));
    });

    if (altar) {
      altar.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        altar.classList.add("drag-over");
      });
      altar.addEventListener("dragleave", () => altar.classList.remove("drag-over"));
      altar.addEventListener("drop", (e) => {
        e.preventDefault();
        altar.classList.remove("drag-over");
        const id = e.dataTransfer.getData("text/plain");
        if (id) applyOffering(id);
      });
    }

    function spawnSpecialBat() {
      showEasterText("BARK AT THE MOON!");
      const bat = document.createElement("div");
      bat.textContent = "🦇";
      bat.setAttribute("role", "button");
      bat.setAttribute("aria-label", "Spezial-Fledermaus fangen");
      bat.tabIndex = 0;
      Object.assign(bat.style, {
        position: "fixed",
        left: "-100px",
        top: "50vh",
        fontSize: "80px",
        zIndex: 100002,
        cursor: "pointer",
        transition: U.prefersReducedMotion() ? "none" : "all 3s linear",
        pointerEvents: "auto",
      });
      document.body.appendChild(bat);
      setTimeout(() => {
        bat.style.left = "110vw";
        bat.style.top = Math.random() * 100 + "vh";
      }, 50);

      const catchBat = () => {
        updateBatScore();
        document.body.style.background = "red";
        setTimeout(() => {
          document.body.style.background = "";
        }, 100);
        U.createToast("OUCH! 🦇🤘", 2000);
        bat.textContent = "😵";
        bat.style.transform = "rotate(180deg) translateY(500px)";
        setTimeout(() => bat.remove(), 1000);
      };

      bat.addEventListener("click", catchBat);
      bat.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          catchBat();
        }
      });
      setTimeout(() => {
        if (bat.parentNode) bat.remove();
      }, 3100);
    }

    function showEasterText(text) {
      const el = document.getElementById("easterEffect");
      if (!el) return;
      el.replaceChildren();
      const p = document.createElement("p");
      p.className = "easter-text";
      p.textContent = text;
      el.appendChild(p);
      setTimeout(() => el.replaceChildren(), 2000);
    }

    function createDrops(emoji) {
      if (U.prefersReducedMotion()) return;
      const count = window.innerWidth < 600 ? 10 : 20;
      for (let i = 0; i < count; i++) {
        const d = document.createElement("div");
        d.textContent = emoji;
        d.setAttribute("aria-hidden", "true");
        Object.assign(d.style, {
          position: "fixed",
          left: Math.random() * 100 + "vw",
          top: "-50px",
          fontSize: "30px",
          zIndex: 10000,
          pointerEvents: "none",
          animation: "fall 3s linear forwards",
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
    if (U.prefersReducedMotion()) return;

    const ghost = document.createElement("div");
    ghost.textContent = "👻";
    ghost.setAttribute("role", "button");
    ghost.setAttribute("aria-label", "Ghost Ozzy");
    ghost.tabIndex = 0;
    Object.assign(ghost.style, {
      position: "fixed",
      bottom: "-100px",
      right: "20px",
      fontSize: "50px",
      opacity: "0",
      transition: "all 1s ease-in-out",
      zIndex: 1000,
      cursor: "pointer",
    });
    document.body.appendChild(ghost);

    let intervalId = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      if (Math.random() > 0.8) {
        ghost.style.bottom = "20px";
        ghost.style.opacity = "0.6";
        setTimeout(() => {
          ghost.style.bottom = "-100px";
          ghost.style.opacity = "0";
        }, 4000);
      }
    }, 12000);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      } else if (!intervalId) {
        intervalId = setInterval(() => {
          if (Math.random() > 0.8) {
            ghost.style.bottom = "20px";
            ghost.style.opacity = "0.6";
            setTimeout(() => {
              ghost.style.bottom = "-100px";
              ghost.style.opacity = "0";
            }, 4000);
          }
        }, 12000);
      }
    });

    const greet = () => {
      U.createToast("OZZY GHOST: SHAAAARON!!!", 2000);
      ghost.style.transform = "scale(2) rotate(360deg)";
      setTimeout(() => {
        ghost.style.transform = "scale(1) rotate(0deg)";
      }, 1000);
    };

    ghost.addEventListener("click", greet);
    ghost.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        greet();
      }
    });
  })();

  // -------------------------
  // TIMELINE REVEAL
  // -------------------------
  const items = document.querySelectorAll(".timeline-v2-item");
  if (U.prefersReducedMotion()) {
    items.forEach((it) => {
      it.style.opacity = "1";
      it.style.transform = "none";
    });
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.style.opacity = "1";
            en.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1 }
    );
    items.forEach((it) => {
      it.style.opacity = "0";
      it.style.transform = "translateY(30px)";
      it.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
      io.observe(it);
    });
  }

  // Gallery Modal (safe DOM) with Navigation
  document.getElementById("gallery")?.addEventListener("click", (e) => {
    const card = e.target.closest(".gallery-card");
    if (!card) return;
    
    // Collect all gallery images for navigation
    const allCards = [...document.querySelectorAll(".gallery-card")];
    const images = allCards.map(c => {
      const i = c.querySelector(".galleryImage");
      return {
        src: i.dataset.full || i.src,
        caption: i.getAttribute("alt") || ""
      };
    });
    
    const currentIndex = allCards.indexOf(card);
    const img = card.querySelector(".galleryImage");
    if (!img) return;

    U.openImageModal(img.dataset.full || img.src, img.getAttribute("alt") || "", images, currentIndex);
  });

  // Keyboard open for gallery cards
  document.querySelectorAll(".gallery-card").forEach((card) => {
    if (!card.hasAttribute("tabindex")) card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });

    if (!U.prefersReducedMotion() && window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -15;
        const rotateY = ((x - centerX) / centerX) * 15;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      });
    }
  });

  // -------------------------
  // HERO TYPEWRITER
  // -------------------------
  const heroSubtitle = document.getElementById('heroSubtitle');
  if (heroSubtitle) {
    const heroTw = U.createTypewriter();
    setTimeout(() => {
      heroTw.run(heroSubtitle, "Of all the things I've lost, I miss my mind the most.");
    }, 1500);
  }
});

// Sammle alle Galerie-Karten für die Lightbox
document.addEventListener('DOMContentLoaded', () => {
    const galleryCards = document.querySelectorAll('.gallery-card');
    
    // Alle Bilder & Bildunterschriften im Voraus als Array extrahieren
    const galleryImages = Array.from(galleryCards).map(card => {
        const img = card.querySelector('img');
        const info = card.querySelector('.gallery-info');
        return {
            src: img ? img.src : '',
            caption: info ? info.textContent.trim() : (img ? img.alt : 'Ozzy Tribute')
        };
    });

    galleryCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            const img = card.querySelector('img');
            if (!img) return;
            const currentSrc = img.src;
            const caption = galleryImages[index] ? galleryImages[index].caption : '';

            // Übergabe an unsere neue Lightbox inklusive kompletter Liste & Index
            if (window.OzzyUtils && window.OzzyUtils.openImageModal) {
                window.OzzyUtils.openImageModal(currentSrc, caption, galleryImages, index);
            }
        });
    });
});