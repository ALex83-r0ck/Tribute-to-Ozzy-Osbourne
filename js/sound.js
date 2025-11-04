// === sound.js ===
// === QUOTE BLOCK ===
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

    if (window.soundEnabled) {
        const sound = Math.random() > 0.5 ? quoteSound : crowdSound;
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
});

// === sound.js ===