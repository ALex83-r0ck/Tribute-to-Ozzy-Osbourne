// Erweiterte Zitate
const quotes = [
    "I love you all, but you're all f***ing mad!",
    "Rock 'n' roll is my religion!",
    "I’m not a musician, I’m a performer!",
    "All aboard! Ha ha ha!",
    "I’m the Prince of f***ing Darkness!",
    "Sharon, where’s my bloody socks?!",
    "Of all the things I lost, I miss my mind the most.",
    "To be sober and a vegetarian is to live a life of irony.",
    "I used to be scared of cats.",
    "I’m a lunatic. I like to go by the seat of my pants.",
    "I don’t want to go on being a root in the dark.",
    "The bat bit me, so I bit the bat back."
];

// Erweiterte Quiz-Fragen
const quizQuestions = [
    {
        question: "In welchem Jahr wurde Ozzy Osbourne geboren?",
        options: ["1948", "1950", "1952", "1946"],
        correct: "1948"
    },
    {
        question: "Welche Band gründete Ozzy mit?",
        options: ["Led Zeppelin", "Black Sabbath", "Deep Purple", "Iron Maiden"],
        correct: "Black Sabbath"
    },
    {
        question: "Welcher Song ist nicht von Ozzy?",
        options: ["Crazy Train", "Paranoid", "Iron Man", "Stairway to Heaven"],
        correct: "Stairway to Heaven"
    },
    {
        question: "Welches Tier biss Ozzy berühmt auf der Bühne?",
        options: ["Fledermaus", "Hund", "Katze", "Schlange"],
        correct: "Fledermaus"
    },
    {
        question: "Wie heißt Ozzys Frau?",
        options: ["Sharon", "Kelly", "Aimee", "Ozzy Jr."],
        correct: "Sharon"
    },
    {
        question: "Welche Krankheit hatte Ozzy?",
        options: ["Parkinson", "Diabetes", "Asthma", "Keine"],
        correct: "Parkinson"
    }
];

// Elemente
const quoteElement = document.getElementById("quote");
const quoteButton = document.getElementById("quoteButton");
const galleryImages = document.querySelectorAll(".galleryImage");
const flameCanvas = document.getElementById("flameCanvas");
const flameCtx = flameCanvas.getContext("2d");
const spotlightCanvas = document.getElementById("spotlightCanvas");
const spotlightCtx = spotlightCanvas.getContext("2d");
const smokeCanvas = document.getElementById("smokeCanvas");
const smokeCtx = smokeCanvas.getContext("2d");
const themeToggle = document.getElementById("themeToggle");
const discoToggle = document.getElementById("discoToggle");
const headbangToggle = document.getElementById("headbangToggle");
const startButton = document.getElementById("startButton");
const quoteSound = document.getElementById("quoteSound");
const crowdChant = document.getElementById("crowdChant");
const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const quizResult = document.getElementById("quizResult");
const quizScore = document.getElementById("quizScore");
const showHighscore = document.getElementById("showHighscore");
const highscoreDiv = document.getElementById("highscore");
const highscoreList = document.getElementById("highscoreList");
const ozzySprite = document.getElementById("ozzySprite");

// Zufälliges Zitat (dynamisch basierend auf Quiz)
function getRandomQuote(isSuccess = false) {
    if (isSuccess) {
        return "Hell yeah! You're a metal god!";
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
}

function autoQuote() {
    quoteElement.textContent = getRandomQuote();
    quoteSound.play();
}

let currentImageIndex = 0;
function highlightImage() {
    galleryImages.forEach((img, index) => {
        img.classList.remove("active");
        if (index === currentImageIndex) {
            img.classList.add("active");
        }
    });
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
}

flameCanvas.width = window.innerWidth;
flameCanvas.height = window.innerHeight;
spotlightCanvas.width = window.innerWidth;
spotlightCanvas.height = window.innerHeight;
smokeCanvas.width = window.innerWidth;
smokeCanvas.height = window.innerHeight;
let particles = [];
let smokeParticles = [];
let mouseX = 0;
let mouseY = 0;
let isDiscoMode = false;

class Particle {
    constructor() {
        this.x = Math.random() * flameCanvas.width;
        this.y = flameCanvas.height;
        this.size = Math.random() * 5 + 2;
        this.speedY = Math.random() * 3 + 1;
        this.color = `hsl(${Math.random() * 30 + 10}, 100%, 50%)`;
    }

    update() {
        this.y -= this.speedY;
        if (this.y < 0) {
            this.y = flameCanvas.height;
            this.x = Math.random() * flameCanvas.width;
        }
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
            this.size += 0.5;
            this.speedY += 0.2;
        } else if (this.size > 2) {
            this.size -= 0.1;
        }
        if (isDiscoMode) {
            this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        }
    }

    draw() {
        flameCtx.beginPath();
        flameCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        flameCtx.fillStyle = this.color;
        flameCtx.fill();
    }
}

class SmokeParticle {
    constructor() {
        this.x = Math.random() * smokeCanvas.width;
        this.y = smokeCanvas.height;
        this.size = Math.random() * 10 + 5;
        this.speedY = Math.random() * 1 + 0.5;
        this.color = `rgba(100, 100, 100, ${Math.random() * 0.5 + 0.1})`;
    }

    update() {
        this.y -= this.speedY;
        this.x += (Math.random() - 0.5) * 2;
        if (this.y < 0) {
            this.y = smokeCanvas.height;
            this.x = Math.random() * smokeCanvas.width;
        }
    }

    draw() {
        smokeCtx.beginPath();
        smokeCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        smokeCtx.fillStyle = this.color;
        smokeCtx.fill();
    }
}

function initFlames() {
    particles = [];
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
}

function initSmoke() {
    smokeParticles = [];
    for (let i = 0; i < 30; i++) {
        smokeParticles.push(new SmokeParticle());
    }
}

function animateFlames() {
    flameCtx.clearRect(0, 0, flameCanvas.width, flameCanvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateFlames);
}

function animateSmoke() {
    smokeCtx.clearRect(0, 0, smokeCanvas.width, smokeCanvas.height);
    smokeParticles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateSmoke);
}

function boostFlames() {
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle());
    }
    setTimeout(() => {
        particles = particles.slice(0, 50);
    }, 2000);
}

function drawSpotlights() {
    spotlightCtx.clearRect(0, 0, spotlightCanvas.width, spotlightCanvas.height);
    const gradient = spotlightCtx.createRadialGradient(mouseX, mouseY, 50, mouseX, mouseY, 200);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.5)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    spotlightCtx.beginPath();
    spotlightCtx.arc(mouseX, mouseY, 200, 0, Math.PI * 2);
    spotlightCtx.fillStyle = gradient;
    spotlightCtx.fill();
}

function animateSpotlights() {
    drawSpotlights();
    requestAnimationFrame(animateSpotlights);
}

function toggleTheme() {
    document.body.classList.toggle("light-mode");
    themeToggle.textContent = document.body.classList.contains("light-mode") ? "Dark Mode" : "Light Mode";
}

function toggleDisco() {
    isDiscoMode = !isDiscoMode;
    discoToggle.textContent = `Disco Mode: ${isDiscoMode ? "On" : "Off"}`;
}

function toggleHeadbang() {
    document.body.classList.toggle("headbang-mode");
    headbangToggle.textContent = `Headbang: ${document.body.classList.contains("headbang-mode") ? "On" : "Off"}`;
}

let currentQuestionIndex = 0;
let score = 0;
let highscores = JSON.parse(localStorage.getItem("ozzyHighscores")) || [];

function startQuiz() {
    const name = prompt("Gib deinen Namen ein:");
    if (!name) return;
    currentPlayerName = name;
    currentQuestionIndex = 0;
    score = 0;
    quizScore.textContent = "Punkte: 0";
    quizQuestion.style.display = "block";
    quizOptions.style.display = "block";
    startButton.style.display = "none";
    loadQuizQuestion();
}

function loadQuizQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    quizQuestion.textContent = question.question;
    quizOptions.innerHTML = "";
    question.options.forEach((option, index) => {
        const button = document.createElement("button");
        button.textContent = option;
        button.classList.add("quizOption");
        button.addEventListener("click", () => checkAnswer(option));
        quizOptions.appendChild(button);
    });
    quizResult.textContent = "";
}

function checkAnswer(selected) {
    const question = quizQuestions[currentQuestionIndex];
    if (selected === question.correct) {
        quizResult.textContent = "Richtig! 🤘";
        score++;
        quizScore.textContent = `Punkte: ${score}`;
        boostFlames();
        autoQuote(true); // Dynamisches Erfolgs-Zitat
        saveHighscore();
        crowdChant.play(); // Crowd Chant bei Erfolg
    } else {
        quizResult.textContent = `Falsch! Richtig wäre: ${question.correct}`;
    }
    currentQuestionIndex = (currentQuestionIndex + 1) % quizQuestions.length;
    setTimeout(loadQuizQuestion, 1000);
}

function saveHighscore() {
    highscores.push({ name: currentPlayerName, score, date: new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" }) });
    highscores.sort((a, b) => b.score - a.score);
    highscores = highscores.slice(0, 5);
    localStorage.setItem("ozzyHighscores", JSON.stringify(highscores));
}

function updateHighscoreList() {
    highscoreList.innerHTML = "";
    highscores.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = `${entry.name}: Punkte ${entry.score} - ${entry.date}`;
        highscoreList.appendChild(li);
    });
}

function handleParallax() {
    const scrollY = window.scrollY;
    document.body.style.backgroundPositionY = `${scrollY * 0.5}px`;
}

// Sprite-Animation mit Sound
function animateSprite() {
    ozzySprite.style.opacity = 1;
    ozzySprite.style.animation = "halfCirclePath 10s ease-in-out";
    setTimeout(() => {
        ozzySprite.style.opacity = 0;
        quoteSound.play(); // Sound bei Verschwinden
    }, 10000); // Nach 10s verschwinden
    setTimeout(animateSprite, 12000); // Verzögert (2s) neu starten
}

// Event-Listener
flameCanvas.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

window.addEventListener("resize", () => {
    flameCanvas.width = window.innerWidth;
    flameCanvas.height = window.innerHeight;
    spotlightCanvas.width = window.innerWidth;
    spotlightCanvas.height = window.innerHeight;
    smokeCanvas.width = window.innerWidth;
    smokeCanvas.height = window.innerHeight;
    initFlames();
    initSmoke();
});

window.addEventListener("scroll", handleParallax);
quoteButton.addEventListener("click", autoQuote);
themeToggle.addEventListener("click", toggleTheme);
discoToggle.addEventListener("click", toggleDisco);
headbangToggle.addEventListener("click", toggleHeadbang);
startButton.addEventListener("click", startQuiz);
showHighscore.addEventListener("click", () => {
    highscoreDiv.style.display = highscoreDiv.style.display === "none" ? "block" : "none";
    updateHighscoreList();
});

// Starten
initFlames();
initSmoke();
animateFlames();
animateSmoke();
animateSpotlights();
animateSprite();
setInterval(highlightImage, 2000);
setInterval(autoQuote, 10000);
autoQuote();
highlightImage();