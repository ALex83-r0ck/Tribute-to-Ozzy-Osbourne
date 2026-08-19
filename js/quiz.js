// ========== js/quiz.js ==========
// Depends on: OzzyUtils, OzzyTheme, OzzyQuizData

(function () {
  const U = window.OzzyUtils;
  const T = window.OzzyTheme;
  const Q = window.OzzyQuizData;

  if (!U || !T || !Q) {
    console.error("Quiz dependencies missing (OzzyUtils / OzzyTheme / OzzyQuizData).");
    return;
  }

  T.initTheme({ includeDisco: false });

  let currentQuestion = 0;
  let score = 0;
  let lives = Q.START_LIVES;
  let streak = 0;
  let timer = null;
  let shuffledQuestions = [];
  let answeringLocked = false;

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
  const liveRegion = document.getElementById("quizLiveRegion");

  startButton?.addEventListener("click", startQuiz);
  highscoreToggle?.addEventListener("click", toggleHighscore);

  // --- CUSTOM MODALS ---
  const validationModal = document.getElementById("validationModal");
  const endGameModal = document.getElementById("endGameModal");

  function announce(msg) {
    if (liveRegion) liveRegion.textContent = msg;
  }

  function showValidationWarning(text) {
    const msg = document.getElementById("validationMsg");
    if (msg) msg.textContent = text;
    validationModal?.classList.add("ozzy-modal--open");
    validationModal?.setAttribute("aria-hidden", "false");
    document.getElementById("validationCloseBtn")?.focus();
    document.addEventListener("keydown", handleValidationEscape);
  }

  function closeValidationWarning() {
    validationModal?.classList.remove("ozzy-modal--open");
    validationModal?.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", handleValidationEscape);
    playerNameInput?.focus();
  }

  function handleValidationEscape(e) {
    if (e.key === "Escape") closeValidationWarning();
  }

  document.getElementById("validationCloseBtn")?.addEventListener("click", closeValidationWarning);
  document.getElementById("validationCloseCross")?.addEventListener("click", closeValidationWarning);
  document.getElementById("validationBackdrop")?.addEventListener("click", closeValidationWarning);

  function showEndGameModal(name, finalScore, ranking) {
    const endPlayerName = document.getElementById("endPlayerName");
    const endPlayerScore = document.getElementById("endPlayerScore");
    const endPlayerRank = document.getElementById("endPlayerRank");
    if (endPlayerName) endPlayerName.textContent = name;
    if (endPlayerScore) endPlayerScore.textContent = String(finalScore);
    if (endPlayerRank) endPlayerRank.textContent = ranking;

    const highscore = U.loadHighscoreFromStorage();
    const modalHighscoreList = document.getElementById("modalHighscoreList");
    if (modalHighscoreList) {
      modalHighscoreList.replaceChildren();
      highscore.forEach((entry, i) => {
        const li = document.createElement("li");
        li.className = "highscore-row";
        const left = document.createElement("span");
        left.textContent = `${i + 1}. ${entry.name || "Unbekannt"}`;
        const right = document.createElement("span");
        right.textContent = `${entry.score || 0} Pkt.`;
        li.append(left, right);
        modalHighscoreList.appendChild(li);
      });
    }

    endGameModal?.classList.add("ozzy-modal--open");
    endGameModal?.setAttribute("aria-hidden", "false");
    document.getElementById("endGameCloseBtn")?.focus();
    document.addEventListener("keydown", handleEndGameEscape);
    announce(`Quiz beendet. ${finalScore} Punkte. Rang: ${ranking}`);
  }

  function closeEndGameModal() {
    endGameModal?.classList.remove("ozzy-modal--open");
    endGameModal?.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", handleEndGameEscape);
  }

  function handleEndGameEscape(e) {
    if (e.key === "Escape") closeEndGameModal();
  }

  document.getElementById("endGameCloseBtn")?.addEventListener("click", () => {
    closeEndGameModal();
    playerNameInput?.focus();
  });
  document.getElementById("endGameCloseCross")?.addEventListener("click", closeEndGameModal);
  document.getElementById("endGameBackdrop")?.addEventListener("click", closeEndGameModal);

  function startQuiz() {
    const name = U.sanitizeName(playerNameInput?.value || "", 40);
    if (!name) {
      showValidationWarning("Bitte gib einen Namen ein! 🤘");
      return;
    }
    if (playerNameInput) playerNameInput.value = name;

    shuffledQuestions = Q.prepareQuiz(Q.questions);
    document.getElementById("setupArea").style.display = "none";
    document.getElementById("quizArea").style.display = "block";

    currentQuestion = 0;
    score = 0;
    lives = Q.START_LIVES;
    streak = 0;
    answeringLocked = false;
    
    const streakContainer = document.getElementById("streakContainer");
    if (streakContainer) streakContainer.style.display = "none";

    updateStatus();
    showQuestion();
  }

  function updateStatus() {
    if (quizScore) quizScore.textContent = `Punkte: ${score}`;
    if (livesContainer) {
      livesContainer.textContent = "🦇".repeat(lives) || "💀";
      livesContainer.setAttribute("aria-label", `${lives} Leben`);
    }
  }

  function startTimer() {
    if (!timerBar) return;
    let timeLeft = Q.TIME_LIMIT;
    timerBar.style.width = "100%";
    if (timer) clearInterval(timer);

    if (U.prefersReducedMotion()) {
      // slower visual updates still functional
    }

    timer = setInterval(() => {
      timeLeft -= 0.1;
      const percent = Math.max(0, (timeLeft / Q.TIME_LIMIT) * 100);
      timerBar.style.width = percent + "%";

      if (timeLeft <= 0) {
        clearInterval(timer);
        timer = null;
        handleWrongAnswer("Zeit abgelaufen!");
      }
    }, 100);
  }

  function lockOptions() {
    answeringLocked = true;
    quizOptions?.querySelectorAll("button").forEach((b) => {
      b.disabled = true;
    });
    if (hintButton) hintButton.disabled = true;
  }

  function showQuestion() {
    if (Q.isQuizOver(currentQuestion, shuffledQuestions.length, lives)) {
      endQuiz();
      return;
    }

    answeringLocked = false;
    if (hintText) {
      hintText.style.display = "none";
      hintText.textContent = "";
    }
    if (hintContainer) hintContainer.style.display = "block";
    if (quizResult) quizResult.textContent = "";

    const q = shuffledQuestions[currentQuestion];
    if (quizQuestion) quizQuestion.textContent = q.question;
    if (quizOptions) quizOptions.replaceChildren();

    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    if (progressBar) progressBar.style.width = ((currentQuestion + 1) / shuffledQuestions.length * 100) + '%';
    if (progressText) progressText.textContent = `Frage ${currentQuestion + 1} von ${shuffledQuestions.length}`;

    q.options.forEach((option, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.option = option;
      btn.classList.add("quizOption");
      btn.setAttribute("data-key", String(idx + 1));
      btn.setAttribute("aria-label", `Antwort ${idx + 1}: ${option}`);
      
      const prefix = document.createElement('span');
      prefix.className = 'option-prefix';
      prefix.textContent = String.fromCharCode(65 + idx); // A, B, C...
      btn.appendChild(prefix);
      btn.appendChild(document.createTextNode(option));
      
      btn.addEventListener("click", () => checkAnswer(option));
      quizOptions?.appendChild(btn);
    });

    if (hintButton) {
      hintButton.onclick = () => {
        if (answeringLocked || !hintText) return;
        hintText.textContent = q.hint;
        hintText.style.display = "block";
        score = Q.applyHintCost(score);
        updateStatus();
        hintButton.disabled = true;
        announce("Tipp angezeigt, 1 Punkt abgezogen");
      };
      hintButton.disabled = false;
    }

    announce(`Frage ${currentQuestion + 1} von ${shuffledQuestions.length}`);
    startTimer();
  }

  // Keyboard 1–3 for answers
  document.addEventListener("keydown", (e) => {
    if (answeringLocked) return;
    const quizArea = document.getElementById("quizArea");
    if (!quizArea || quizArea.style.display === "none") return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9) {
      const btn = quizOptions?.querySelector(`button[data-key="${n}"]`);
      if (btn && !btn.disabled) btn.click();
    }
  });

  function checkAnswer(selected) {
    if (answeringLocked) return;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    lockOptions();

    const q = shuffledQuestions[currentQuestion];
    const correct = Q.evaluateAnswer(selected, q.answer);

    const buttons = quizOptions?.querySelectorAll("button") || [];
    let clickedBtn = null;
    let correctBtn = null;
    
    buttons.forEach(btn => {
      if (btn.dataset.option === selected) clickedBtn = btn;
      if (btn.dataset.option === q.answer) correctBtn = btn;
    });

    if (correct) {
      if (clickedBtn) clickedBtn.classList.add("correct-answer");
      
      streak++;
      const streakContainer = document.getElementById("streakContainer");
      const streakText = document.getElementById("streakText");
      if (streak >= 2) {
        if (streakContainer) streakContainer.style.display = "block";
        if (streakText) streakText.textContent = `🔥 ${streak} richtig in Folge!`;
      }

      score = Q.nextScore(score, true);
      if (quizResult) {
        quizResult.textContent = "RICHTIG! 🤘";
        quizResult.style.color = "#00ff00";
      }
      createExplosion();
      announce("Richtig!");
      updateStatus();
      currentQuestion++;
      setTimeout(showQuestion, 1500);
    } else {
      if (clickedBtn) clickedBtn.classList.add("wrong-answer");
      if (correctBtn) correctBtn.classList.add("correct-answer");
      
      streak = 0;
      const streakContainer = document.getElementById("streakContainer");
      if (streakContainer) streakContainer.style.display = "none";
      
      handleWrongAnswer(`Falsch! Es war: ${q.answer}`);
    }
  }

  function handleWrongAnswer(msg) {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    lockOptions();
    lives = Q.nextLives(lives, false);
    updateStatus();
    bloodFlash();
    if (quizResult) {
      quizResult.textContent = msg;
      quizResult.style.color = "#ff0000";
    }
    announce(msg);

    if (lives <= 0) {
      setTimeout(endQuiz, 1500);
    } else {
      currentQuestion++;
      setTimeout(showQuestion, 1500);
    }
  }

  function bloodFlash() {
    if (U.prefersReducedMotion()) return;
    const flash = document.createElement("div");
    flash.className = "blood-flash";
    flash.setAttribute("aria-hidden", "true");
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  }

  function createExplosion() {
    if (U.prefersReducedMotion()) return;
    for (let i = 0; i < 10; i++) {
      const p = document.createElement("div");
      p.className = "explosion-particle";
      p.setAttribute("aria-hidden", "true");
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
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    document.getElementById("quizArea").style.display = "none";
    document.getElementById("setupArea").style.display = "block";

    const ranking = U.getRanking(score);
    const playerName = U.sanitizeName(playerNameInput?.value || "", 40) || "Unbekannt";
    U.saveHighscoreEntry(playerName, score);
    loadHighscore();
    showEndGameModal(playerName, score, ranking);
  }

  function loadHighscore() {
    if (!highscoreList || !highscoreDiv) return;
    const highscore = U.loadHighscoreFromStorage();
    highscoreList.replaceChildren();
    highscore.forEach((entry, i) => {
      const li = document.createElement("li");
      const rank = document.createElement("span");
      rank.textContent = `${i + 1}. `;
      const name = document.createElement("span");
      name.textContent = entry.name || "Unbekannt";
      const scoreSpan = document.createElement("span");
      scoreSpan.textContent = `${entry.score || 0} Pkt.`;
      li.append(rank, name, scoreSpan);
      highscoreList.appendChild(li);
    });
    highscoreDiv.style.display = "block";
  }

  function toggleHighscore() {
    if (!highscoreDiv) return;
    highscoreDiv.style.display = highscoreDiv.style.display === "none" ? "block" : "none";
    if (highscoreDiv.style.display === "block") loadHighscore();
  }

  // Expose for tests (optional)
  window.OzzyQuizApp = {
    startQuiz,
    getState: () => ({ currentQuestion, score, lives, shuffledQuestions, answeringLocked }),
    checkAnswer,
    showQuestion,
  };
})();
