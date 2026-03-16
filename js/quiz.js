// ========== js/quiz.js ==========
// === OZZY FAN PROJEKT – QUIZ (ULTIMATE) ===
const questions = [
    { 
        question: "Wann wurde Ozzy Osbourne geboren?", 
        options: ["1948", "1950", "1952"], 
        answer: "1948",
        hint: "Er wurde kurz nach dem Zweiten Weltkrieg geboren."
    },
    { 
        question: "Wie hieß Ozzy Osbourne noch?", 
        options: ["Ozzy Osbourne", "Ozzy", "Ozzy Osbourne III"], 
        answer: "Ozzy",
        hint: "Sein richtiger Name ist John Michael Osbourne."
    },
    { 
        question: "Wie heißt Ozzys erste Band?", 
        options: ["Black Sabbath", "Earth", "Heaven & Hell"], 
        answer: "Black Sabbath",
        hint: "Die Band hieß zuerst 'Earth'."
    },
    { 
        question: "Welches Tier biss Ozzy auf der Bühne?", 
        options: ["Fledermaus", "Taube", "Schlange"], 
        answer: "Fledermaus",
        hint: "1982 in Des Moines."
    },
    { 
        question: "Wie heißt Ozzy Osbourne's letztes Album?", 
        options: ["Paranoid", "Patient Number 9", "Paranoid II"], 
        answer: "Patient Number 9",
        hint: "Es kam 2022 raus."
    },
    { 
        question: "In welchem Jahr verließ Ozzy Osbourne Black Sabbath zum ersten Mal?", 
        options: ["1977", "1979", "1981"], 
        answer: "1979",
        hint: "Es war kurz vor dem Album 'Heaven and Hell'."
    },
    { 
        question: "Welcher Song von Ozzy wurde durch Trick Daddy gesampelt?", 
        options: ["Crazy Train", "Iron Man", "Mr. Crowley"], 
        answer: "Crazy Train",
        hint: "Ein absoluter Klassiker mit dem 'Ay-Ay-Ay' Intro."
    },
    { 
        question: "Wie heißt Ozzys Ehefrau?", 
        options: ["Sharon Osbourne", "Kelly Osbourne", "Aimee Osbourne"], 
        answer: "Sharon Osbourne",
        hint: "Sie war die Tochter seines Managers."
    },
    { 
        question: "Welche MTV-Show machte die Familie weltberühmt?", 
        options: ["The Osbournes", "Ozzy & Friends", "Black Sabbath Family"], 
        answer: "The Osbournes",
        hint: "MTV, 2002–2005."
    },
    { 
        question: "Welchen Spitznamen trägt Ozzy?", 
        options: ["Prince of Darkness", "King of Rock", "Godfather of Metal"], 
        answer: "Prince of Darkness",
        hint: "Dunkle Bühne, Fledermäuse..."
    }
];

let currentQuestion = 0;
let score = 0;
let lives = 3;
let timer = null;
let shuffledQuestions = [];
const TIME_LIMIT = 15; // Sekunden pro Frage

const startButton = document.getElementById("startButton");
const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const quizResult = document.getElementById("quizResult");
const quizScore = document.getElementById("quizScore");
const livesContainer = document.getElementById("livesContainer");
const timerBar = document.getElementById("timerBar");
const hintContainer = document.getElementById("hintContainer");
const hintButton = document.getElementById("hintButton");
const hintText = document.getElementById("hintText");
const highscoreToggle = document.getElementById("highscoreToggle");
const highscoreDiv = document.getElementById("highscore");
const highscoreList = document.getElementById("highscoreList");
const playerNameInput = document.getElementById("playerName");

startButton?.addEventListener("click", startQuiz);
highscoreToggle?.addEventListener("click", toggleHighscore);

function startQuiz() {
    const name = playerNameInput?.value.trim();
    if (!name) {
        alert("Bitte gib einen Namen ein! 🤘");
        return;
    }
    
    shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    document.getElementById("setupArea").style.display = "none";
    document.getElementById("quizArea").style.display = "block";
    
    currentQuestion = 0;
    score = 0;
    lives = 3;
    updateStatus();
    showQuestion();
}

function updateStatus() {
    quizScore.textContent = `Punkte: ${score}`;
    livesContainer.textContent = "🦇".repeat(lives);
}

function startTimer() {
    let timeLeft = TIME_LIMIT;
    timerBar.style.width = "100%";
    
    if (timer) clearInterval(timer);
    
    timer = setInterval(() => {
        timeLeft -= 0.1;
        const percent = (timeLeft / TIME_LIMIT) * 100;
        timerBar.style.width = percent + "%";
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            handleWrongAnswer("Zeit abgelaufen!");
        }
    }, 100);
}

function showQuestion() {
    if (currentQuestion >= shuffledQuestions.length || lives <= 0) {
        endQuiz();
        return;
    }
    
    hintText.style.display = "none";
    hintContainer.style.display = "block";
    quizResult.textContent = "";
    
    const q = shuffledQuestions[currentQuestion];
    quizQuestion.textContent = q.question;
    quizOptions.innerHTML = "";
    
    q.options.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.classList.add("quizOption");
        btn.onclick = () => checkAnswer(option);
        quizOptions.appendChild(btn);
    });
    
    hintButton.onclick = () => {
        hintText.textContent = q.hint;
        hintText.style.display = "block";
        if (score > 0) { score--; updateStatus(); }
        hintButton.disabled = true;
    };
    hintButton.disabled = false;
    
    startTimer();
}

function checkAnswer(selected) {
    clearInterval(timer);
    const q = shuffledQuestions[currentQuestion];
    
    if (selected === q.answer) {
        score++;
        quizResult.textContent = "RICHTIG! 🤘";
        quizResult.style.color = "#00ff00";
        createExplosion();
    } else {
        handleWrongAnswer(`Falsch! Es war: ${q.answer}`);
        return; // handleWrongAnswer ruft showQuestion auf
    }
    
    updateStatus();
    currentQuestion++;
    setTimeout(showQuestion, 1500);
}

function handleWrongAnswer(msg) {
    lives--;
    updateStatus();
    bloodFlash();
    quizResult.textContent = msg;
    quizResult.style.color = "#ff0000";
    
    if (lives <= 0) {
        setTimeout(endQuiz, 1500);
    } else {
        currentQuestion++;
        setTimeout(showQuestion, 1500);
    }
}

function bloodFlash() {
    const flash = document.createElement("div");
    flash.className = "blood-flash";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
}

function createExplosion() {
    for (let i = 0; i < 10; i++) {
        const p = document.createElement("div");
        p.className = "explosion-particle";
        p.textContent = ["🤘", "🔥", "🎸", "⚡"][Math.floor(Math.random() * 4)];
        p.style.left = "50%";
        p.style.top = "50%";
        p.style.setProperty("--tx", (Math.random() - 0.5) * 400 + "px");
        p.style.setProperty("--ty", (Math.random() - 0.5) * 400 + "px");
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1000);
    }
}

function endQuiz() {
    clearInterval(timer);
    document.getElementById("quizArea").style.display = "none";
    document.getElementById("setupArea").style.display = "block";
    
    const ranking = getRanking(score);
    saveHighscore();
    loadHighscore();
    alert(`Quiz beendet!\nPunkte: ${score}\nDein Rang: ${ranking}`);
}

function getRanking(s) {
    if (s <= 3) return "Roadie 🛠️";
    if (s <= 7) return "Bassist 🎸";
    if (s <= 9) return "Prince of Darkness 🦇";
    return "METAL GOD 🤘🔥";
}

function saveHighscore() {
    const playerName = playerNameInput?.value.trim() || "Unbekannt";
    const highscore = JSON.parse(localStorage.getItem("ozzyHighscore") || "[]");
    highscore.push({ name: playerName, score, date: new Date().toLocaleDateString() });
    highscore.sort((a, b) => b.score - a.score);
    highscore.splice(10);
    localStorage.setItem("ozzyHighscore", JSON.stringify(highscore));
}

function loadHighscore() {
    const highscore = JSON.parse(localStorage.getItem("ozzyHighscore") || "[]");
    highscoreList.innerHTML = "";
    highscore.forEach((entry, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${i + 1}. ${entry.name}</span> <span>${entry.score} Pkt.</span>`;
        highscoreList.appendChild(li);
    });
    highscoreDiv.style.display = "block";
}

function toggleHighscore() {
    highscoreDiv.style.display = (highscoreDiv.style.display === "none") ? "block" : "none";
    if (highscoreDiv.style.display === "block") loadHighscore();
}
