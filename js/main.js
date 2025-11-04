// === TOGGLES ===
const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const discoToggle = document.getElementById("discoToggle");
const headbangToggle = document.getElementById("headbangToggle");
const soundToggle = document.getElementById("soundToggle");

let soundEnabled = false;
let headbangActive = false;
let isPlaying = false;
let quoteActive = false;

// Theme
themeToggle?.addEventListener("click", () => {
    const isLight = body.classList.toggle("light-mode");
    themeToggle.textContent = isLight ? "Dark Mode" : "Light Mode";
    themeToggle.setAttribute("aria-pressed", isLight);
});

// Disco
discoToggle?.addEventListener("click", () => {
    const active = discoToggle.classList.toggle("active");
    discoToggle.textContent = active ? "Disco: An" : "Disco: Aus";
    discoToggle.setAttribute("aria-pressed", active);
    active ? startDisco() : stopDisco();
    body.classList.toggle("disco-mode", active);
});

let discoInterval;
function startDisco() {
    const colors = ["#ff0000", "#ff00ff", "#00ffff", "#ffff00", "#00ff00", "#ff6600"];
    let i = 0;
    discoInterval = setInterval(() => {
        document.documentElement.style.setProperty('--color-accent-dark', colors[i % colors.length]);
        i++;
    }, 400);
}
function stopDisco() {
    clearInterval(discoInterval);
    document.documentElement.style.setProperty('--color-accent-dark', '#ff0000');
}

// Headbang
headbangToggle?.addEventListener("click", () => {
    headbangActive = !headbangActive;
    headbangToggle.classList.toggle("active", headbangActive);
    headbangToggle.textContent = headbangActive ? "Headbang: An" : "Headbang: Aus";
    headbangToggle.setAttribute("aria-pressed", headbangActive);
    body.classList.toggle("headbang-mode", headbangActive);
});

document.body.addEventListener("click", (e) => {
    if (headbangActive && !e.target.closest("#headbangToggle")) {
        headbangActive = false;
        headbangToggle.classList.remove("active");
        headbangToggle.textContent = "Headbang: Aus";
        headbangToggle.setAttribute("aria-pressed", false);
        body.classList.remove("headbang-mode");
    }
});

// Sound
soundToggle?.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? "Ton: An" : "Ton: Aus";
    soundToggle.classList.toggle("active", !soundEnabled);
    soundToggle.setAttribute("aria-pressed", soundEnabled);
});

// === OZZY SPRITE ===
const ozzyEvents = [
    { sprite: document.getElementById("ozzyDriving"), audio: document.getElementById("paranoidRiff"), duration: 14000, start: 6 },
    { sprite: document.getElementById("ozzyBanging"), audio: document.getElementById("timesHaveChanged"), duration: 14000, start: 0 }
];

function triggerOzzyEvent() {
    if (isPlaying || quoteActive) return;
    isPlaying = true;

    const event = ozzyEvents[Math.floor(Math.random() * ozzyEvents.length)];
    const top = Math.random() * 60 + 20;
    const left = Math.random() * 70 + 15;
    const direction = Math.random() > 0.5 ? 1 : -1;

    event.sprite.classList.remove("active");
    void event.sprite.offsetWidth;
    event.sprite.style.top = `${top}vh`;
    event.sprite.style.left = `${left}vw`;
    event.sprite.style.transform = `translate(-50%, -50%) scaleX(${direction})`;
    event.sprite.classList.add("active");

    if (soundEnabled) {
        event.audio.currentTime = event.start;
        event.audio.play().catch(() => {});
    }

    setTimeout(() => {
        event.sprite.classList.remove("active");
        isPlaying = false;
    }, event.duration);
}

setTimeout(triggerOzzyEvent, 8000);
setInterval(() => Math.random() > 0.55 && triggerOzzyEvent(), 30000);

// === CUSTOM LIGHTBOX ===
document.querySelectorAll(".galleryImage").forEach(img => {
    img.addEventListener("click", () => {
        const modal = document.createElement("div");
        modal.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;z-index:10000;cursor:zoom-out;`;
        const full = document.createElement("img");
        full.src = img.dataset.full;
        full.style.cssText = `max-width:90%;max-height:90%;border-radius:16px;box-shadow:0 0 60px #ff0000;`;
        modal.appendChild(full);

        const close = () => { modal.remove(); document.removeEventListener("keydown", escHandler); };
        const escHandler = e => e.key === "Escape" && close();
        modal.addEventListener("click", close);
        document.addEventListener("keydown", escHandler);
        document.body.appendChild(modal);
    });
});

// === KONAMI CODE ===
let konami = "";
const code = "ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba";
document.addEventListener("keydown", e => {
    konami += e.key;
    if (1984 > code.length) konami = konami.slice(-code.length);
    if (konami.toLowerCase() === code) {
        triggerNoMoreTears();
        konami = "";
    }
});

function triggerNoMoreTears() {
    body.style.filter = "sepia(1) hue-rotate(180deg) brightness(0.8)";
    const tears = setInterval(() => {
        const tear = document.createElement("div");
        tear.textContent = "tear";
        tear.style.cssText = `position:fixed;left:${Math.random()*100}vw;top:-20px;font-size:${15+Math.random()*15}px;color:#00f;animation:fall 3s linear forwards;pointer-events:none;z-index:9999;`;
        document.body.appendChild(tear);
        setTimeout(() => tear.remove(), 3000);
    }, 80);
    setTimeout(() => {
        clearInterval(tears);
        body.style.filter = "";
        alert("NO MORE TEARS! Secret gefunden!");
    }, 5000);
}

// === QUOTE BLOCK ===
document.getElementById("quoteButton")?.addEventListener("click", () => {
    quoteActive = true;
    setTimeout(() => quoteActive = false, 3000);
});