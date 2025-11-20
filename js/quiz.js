// ========== js/quiz.js ==========
// === OZZY FAN PROJEKT – QUIZ ===
const questions = [
    { 
        question: "Wann wurde Ozzy Osbourne geboren?", 
        options: ["1948", "1950", "1952"], 
        answer: "1948",
        hint: "Er wurde kurz nach dem Zweiten Weltkrieg geboren – in den späten 40ern."
    },
    { 
        question: "Wie hieß Ozzy Osbourne noch?", 
        options: ["Ozzy Osbourne", "Ozzy", "Ozzy Osbourne III"], 
        answer: "Ozzy",
        hint: "Sein richtiger Name ist John Michael Osbourne – aber alle nennen ihn nur so."
    },
    { 
        question: "Wie heißt Ozzys erste Band?", 
        options: ["Black Sabbath", "Earth", "Heaven & Hell"], 
        answer: "Black Sabbath",
        hint: "Die Band hieß zuerst 'Earth', aber dann kam der Name mit dem schwarzen Sabbat..."
    },
    { 
        question: "Welches Tier biss Ozzy auf der Bühne?", 
        options: ["Fledermaus", "Taube", "Schlange"], 
        answer: "Fledermaus",
        hint: "1982 in Des Moines – es war keine Absicht, aber es wurde legendär!"
    },
    { 
        question: "Wie heißt Ozzy Osbourne's letztes Album?", 
        options: ["Paranoid", "Patient Number 9", "Paranoid II"], 
        answer: "Patient Number 9",
        hint: "Es kam 2022 raus und hat Gäste wie Jeff Beck und Tony Iommi."
    },
    { 
        question: "In welchem Jahr verließ Ozzy Osbourne Black Sabbath zum ersten Mal?", 
        options: ["1977", "1979", "1981"], 
        answer: "1979",
        hint: "Es war kurz vor dem Album 'Heaven and Hell' mit neuem Sänger."
    },
    { 
        question: "Welcher Song von Ozzy Osbourne wurde durch einen Sample in einem Hip-Hop-Hit berühmt?", 
        options: ["Crazy Train", "Iron Man", "Mr. Crowley"], 
        answer: "Crazy Train",
        hint: "Trick Daddy samplete den Riff in 'Let's Go' – ein absoluter Klassiker!"
    },
    { 
        question: "Wie heißt Ozzys Ehefrau und Managerin?", 
        options: ["Sharon Osbourne", "Kelly Osbourne", "Aimee Osbourne"], 
        answer: "Sharon Osbourne",
        hint: "Sie war die Tochter seines Managers und ist heute seine 'bessere Hälfte'."
    },
    { 
        question: "Welche Reality-TV-Show machte die Familie Osbourne weltberühmt?", 
        options: ["The Osbournes", "Ozzy & Friends", "Black Sabbath Family"], 
        answer: "The Osbournes",
        hint: "MTV, 2002–2005 – mit viel Fluchen, Chaos und Hunden."
    },
    { 
        question: "Welchen Spitznamen trägt Ozzy Osbourne aufgrund seiner Bühnenshows?", 
        options: ["Prince of Darkness", "King of Rock", "Godfather of Metal"], 
        answer: "Prince of Darkness",
        hint: "Dunkle Bühne, Fledermäuse, schwarze Kleidung – passt perfekt!"
    }
];

// === VARIABLEN ===
let currentQuestion = 0;
let score = 0;
let hintUsed = false;
let hintTimeout = null;

// === DOM ===
const startButton = document.getElementById("startButton");
const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const quizResult = document.getElementById("quizResult");
const quizScore = document.getElementById("quizScore");
const hintContainer = document.getElementById("hintContainer");
const hintButton = document.getElementById("hintButton");
const hintText = document.getElementById("hintText");
const highscoreToggle = document.getElementById("highscoreToggle");
const highscoreDiv = document.getElementById("highscore");
const highscoreList = document.getElementById("highscoreList");

// === EVENTS ===
startButton?.addEventListener("click", startQuiz);
highscoreToggle?.addEventListener("click", toggleHighscore);

// === FUNKTIONEN ===
function startQuiz() {
    currentQuestion = 0;
    score = 0;
    quizScore.textContent = "Punkte: 0";
    quizResult.textContent = "";
    hintContainer.style.display = "none";
    highscoreDiv.style.display = "none";
    showQuestion();
}

function showQuestion() {
    if (currentQuestion >= questions.length) {
        endQuiz();
        return;
    }

    // Reset Hint
    hintUsed = false;
    if (hintTimeout) clearTimeout(hintTimeout);
    hintText.style.display = "none";
    hintButton.textContent = "Tipp anzeigen (-1 Punkt)";
    hintButton.disabled = false;
    hintContainer.style.display = "none";

    const q = questions[currentQuestion];
    quizQuestion.textContent = q.question;
    quizQuestion.style.display = "block";

    quizOptions.innerHTML = "";
    q.options.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.classList.add("quizOption");
        btn.onclick = () => checkAnswer(option);
        quizOptions.appendChild(btn);
    });
    quizOptions.style.display = "block";

    // Hint-Button nach 2 Sekunden anzeigen
    hintTimeout = setTimeout(() => {
        hintContainer.style.display = "block";
    }, 2000);

    // Hint-Button Click
    hintButton.onclick = () => {
        if (hintUsed) return;
        hintUsed = true;
        hintButton.disabled = true;
        hintButton.textContent = "Tipp genutzt";

        hintText.textContent = q.hint;
        hintText.style.display = "block";

        if (score > 0) {
            score--;
            quizScore.textContent = `Punkte: ${score}`;
        }
    };
}

function checkAnswer(selected) {
    const q = questions[currentQuestion];
    const correct = q.answer;

    // Hint-Container verstecken
    hintContainer.style.display = "none";

    if (selected === correct) {
        if (!hintUsed) score++;  // Nur Punkt, wenn kein Hint
        quizResult.textContent = "Richtig!";
    } else {
        quizResult.textContent = `Falsch! Richtig: ${correct}`;
    }

    quizScore.textContent = `Punkte: ${score}`;
    currentQuestion++;
    setTimeout(showQuestion, 1500);
}

function endQuiz() {
    quizQuestion.textContent = "Quiz beendet!";
    quizOptions.style.display = "none";
    hintContainer.style.display = "none";
    quizResult.textContent = `Dein Endstand: ${score} von ${questions.length} Punkten`;
    saveHighscore();
    loadHighscore(); // Zeige Highscore direkt an
}

function saveHighscore() {
    const playerName = document.getElementById("playerName")?.value.trim() || "Unbekannt";
    const highscore = JSON.parse(localStorage.getItem("ozzyHighscore") || "[]");
    highscore.push({ name: playerName, score, date: new Date().toLocaleDateString() });
    highscore.sort((a, b) => b.score - a.score);
    highscore.splice(10); // Nur Top 10
    localStorage.setItem("ozzyHighscore", JSON.stringify(highscore));
}

function loadHighscore() {
    const highscore = JSON.parse(localStorage.getItem("ozzyHighscore") || "[]");
    highscoreList.innerHTML = "";
    highscore.forEach((entry, i) => {
        const li = document.createElement("li");
        li.textContent = `${i + 1}. ${entry.name} – ${entry.score} Punkte (${entry.date})`;
        highscoreList.appendChild(li);
    });
    highscoreDiv.style.display = "block";
    highscoreToggle.textContent = "Highscore verstecken";
}

function toggleHighscore() {
    if (highscoreDiv.style.display === "none" || !highscoreDiv.style.display) {
        loadHighscore();
    } else {
        highscoreDiv.style.display = "none";
        highscoreToggle.textContent = "Highscore anzeigen";
    }
}

// Beim Laden: Highscore-Button-Text setzen
document.addEventListener("DOMContentLoaded", () => {
    highscoreToggle.textContent = "Highscore anzeigen";
});