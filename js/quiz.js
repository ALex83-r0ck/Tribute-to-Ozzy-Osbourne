// ========== js/quiz.js ==========

const questions = [
    { question: "Wann wurde Ozzy Osbourne geboren?", options: ["1948", "1950", "1952"], answer: "1948" },
    { question: "Wie heißt Ozzys erste Band?", options: ["Black Sabbath", "Earth", "Heaven & Hell"], answer: "Black Sabbath" },
    { question: "Welches Tier biss Ozzy auf der Bühne?", options: ["Fledermaus", "Taube", "Schlange"], answer: "Fledermaus" },
];

let currentQuestion = 0;
let score = 0;

const startButton = document.getElementById("startButton");
const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const quizResult = document.getElementById("quizResult");
const quizScore = document.getElementById("quizScore");

startButton?.addEventListener("click", startQuiz);

function startQuiz() {
    currentQuestion = 0;
    score = 0;
    quizScore.textContent = "Punkte: 0";
    showQuestion();
}

function showQuestion() {
    if (currentQuestion >= questions.length) {
        endQuiz();
        return;
    }

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
}

function checkAnswer(selected) {
    const correct = questions[currentQuestion].answer;
    if (selected === correct) {
        score++;
        quizResult.textContent = "Richtig! 🤘";
    } else {
        quizResult.textContent = `Falsch! Die richtige Antwort war: ${correct}`;
    }

    quizScore.textContent = `Punkte: ${score}`;
    currentQuestion++;
    setTimeout(showQuestion, 1500);
}

function endQuiz() {
    quizQuestion.textContent = "Quiz beendet!";
    quizOptions.style.display = "none";
    quizResult.textContent = `Dein Endstand: ${score} Punkte`;
    saveHighscore();
}

function saveHighscore() {
    const playerName = document.getElementById("playerName")?.value || "Unbekannt";
    const highscore = JSON.parse(localStorage.getItem("ozzyHighscore")) || [];
    highscore.push({ name: playerName, score });
    localStorage.setItem("ozzyHighscore", JSON.stringify(highscore));
}
