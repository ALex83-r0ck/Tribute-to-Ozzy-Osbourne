// ========== js/main.js ==========

// Theme Toggle
const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const discoToggle = document.getElementById("discoToggle");
const headbangToggle = document.getElementById("headbangToggle");

// Theme-Wechsel
themeToggle?.addEventListener("click", () => {
    body.classList.toggle("light-mode");
    themeToggle.textContent = body.classList.contains("light-mode") 
        ? "Dark Mode" 
        : "Light Mode";
});

// Disco Mode mit Farbwechsel
discoToggle?.addEventListener("click", () => {
    const isActive = discoToggle.classList.toggle("active");
    discoToggle.textContent = isActive ? "Disco Mode: On" : "Disco Mode: Off";

    if (isActive) {
        document.body.classList.add("disco-mode");
        startDisco();
    } else {
        document.body.classList.remove("disco-mode");
        stopDisco();
    }
});

let discoInterval;
function startDisco() {
    const colors = ["#ff0000", "#ff00ff", "#00ffff", "#ffff00", "#00ff00", "#ff6600"];
    let i = 0;
    discoInterval = setInterval(() => {
        const color = colors[i % colors.length];
        document.documentElement.style.setProperty('--color-accent-dark', color);
        i++;
    }, 400);
}

function stopDisco() {
    clearInterval(discoInterval);
    document.documentElement.style.setProperty('--color-accent-dark', '#ff0000');
}

// Headbang Toggle mit Klick auf Body stoppen
let headbangActive = false;
headbangToggle?.addEventListener("click", () => {
    headbangActive = !headbangActive;
    headbangToggle.classList.toggle("active", headbangActive);
    headbangToggle.textContent = headbangActive ? "Headbang: On" : "Headbang: Off";
    document.body.classList.toggle("headbang-mode", headbangActive);
});

// Stop bei Klick/Touch auf Body
document.body.addEventListener("click", (e) => {
    if (headbangActive && !e.target.closest("#headbangToggle")) {
        headbangActive = false;
        headbangToggle.classList.remove("active");
        headbangToggle.textContent = "Headbang: Off";
        document.body.classList.remove("headbang-mode");
    }
});

// Beim Laden Konsole Info
console.log("%c🤘 Welcome to Ozzy's Tribute Page! 🤘", "color: red; font-size: 16px;");

// Ozzy Sprite mit zufälliger Position + Song-Wechsel
const sprite = document.getElementById("ozzySprite");
const paranoidRiff = document.getElementById("paranoidRiff");
const timesHaveChanged = document.getElementById("timesHaveChanged");
const songs = [
    { audio: paranoidRiff, duration: 20000, start: 6 },
    { audio: timesHaveChanged, duration: 15000, start: 0 }
];

let isPlaying = false;

function playRandomOzzy() {
    if (isPlaying) return;
    isPlaying = true;

    const song = songs[Math.floor(Math.random() * songs.length)];
    const top = Math.random() * 70 + 15; // 15-85vh
    const left = Math.random() * 70 + 15; // 15-85vw

    sprite.style.top = `${top}vh`;
    sprite.style.left = `${left}vw`;
    sprite.style.transform = `translate(-50%, -50%) scaleX(${Math.random() > 0.5 ? -1 : 1})`;

    song.audio.currentTime = song.start;
    song.audio.play().catch(() => {});

    setTimeout(() => {
        isPlaying = false;
    }, song.duration);
}

// Starte alle 25–45 Sekunden
setInterval(() => {
    if (Math.random() > 0.6) playRandomOzzy();
}, 30000);

// Erster Start nach 6s
setTimeout(playRandomOzzy, 6000);

// Easter Egg
let konami = "";
document.addEventListener("keydown", (e) => {
    konami += e.key.toLowerCase();
    if (konami.slice(-11) === "ozzyozzyozzy") {
        triggerNoMoreTears();
        konami = "";
    }
    if (konami.length > 20) konami = konami.slice(-20);
});

function triggerNoMoreTears() {
    document.body.style.filter = "sepia(1) hue-rotate(180deg) brightness(0.8)";
    const tears = setInterval(() => {
        const tear = document.createElement("div");
        tear.textContent = "tear";
        tear.style.cssText = `
            position: fixed;
            left: ${Math.random() * 100}vw;
            top: -20px;
            font-size: ${15 + Math.random() * 15}px;
            color: #00f;
            animation: fall 3s linear forwards;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(tear);
        setTimeout(() => tear.remove(), 3000);
    }, 80);

    setTimeout(() => {
        clearInterval(tears);
        document.body.style.filter = "";
        alert("NO MORE TEARS! Secret gefunden! 🤘");
    }, 5000);
}