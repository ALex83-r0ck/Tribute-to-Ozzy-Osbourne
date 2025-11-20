// js/sound.js
// === SOUND + THEME + QUOTE ===
export function initSound() {
    const body = document.body;
    const themeToggle = document.getElementById("themeToggle");
    const soundToggle = document.getElementById("soundToggle");
    const discoToggle = document.getElementById("discoToggle");
    const headbangToggle = document.getElementById("headbangToggle");

    let soundEnabled = false;
    window.soundEnabled = soundEnabled;

    // === THEME TOGGLE ===
    themeToggle?.addEventListener("click", () => {
        const isLight = body.classList.toggle("light-mode");
        body.classList.toggle("dark-mode", !isLight);
        themeToggle.textContent = isLight ? "Dark Mode" : "Light Mode";
        themeToggle.setAttribute("aria-pressed", isLight);
        localStorage.setItem("theme", isLight ? "light" : "dark");
    });

    // === SOUND TOGGLE ===
    soundToggle?.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        window.soundEnabled = soundEnabled;
        soundToggle.textContent = soundEnabled ? "Ton: An" : "Ton: Aus";
        soundToggle.classList.toggle("active", soundEnabled);
        soundToggle.setAttribute("aria-pressed", soundEnabled);
    });

    // === DISCO ===
    let discoInterval;
    discoToggle?.addEventListener("click", () => {
        const active = discoToggle.classList.toggle("active");
        discoToggle.textContent = active ? "Disco: An" : "Disco: Aus";
        discoToggle.setAttribute("aria-pressed", active);
        if (active) {
            const colors = ["#ff0000", "#ff00ff", "#00ffff", "#ffff00", "#00ff00", "#ff6600"];
            let i = 0;
            discoInterval = setInterval(() => {
                document.documentElement.style.setProperty('--color-accent-dark', colors[i % colors.length]);
                i++;
            }, 400);
            body.classList.add("disco-mode");
        } else {
            clearInterval(discoInterval);
            document.documentElement.style.setProperty('--color-accent-dark', '#ff0000');
            body.classList.remove("disco-mode");
        }
    });

    // === HEADBANG ===
    let headbangActive = false;
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

    // === QUOTE ===
    const quoteButton = document.getElementById("quoteButton");
    const quoteText = document.getElementById("quote");
    const quoteSound = document.getElementById("quoteSound");
    const crowdSound = document.getElementById("crowdSound");

    const quotes = [
        "Of all the things I've lost, I miss my mind the most.",
        "I love you all... except you, you can fuck off.",
        "BARK AT THE MOON!",
        "I don't do drugs. I am drugs.",
        "I'm the Prince of fucking Darkness!"
    ];

    quoteButton?.addEventListener("click", () => {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteText.textContent = randomQuote;

        if (soundEnabled) {
            const sound = Math.random() > 0.5 ? quoteSound : crowdSound;
            sound.currentTime = 0;
            sound.play().catch(() => {});
        }
    });
}