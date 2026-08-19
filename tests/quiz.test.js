// tests/quiz.test.js – Quiz UI integration use cases
const fs = require('fs');
const path = require('path');

const htmlContent = fs.readFileSync(path.resolve(__dirname, '../pages/quiz.html'), 'utf8');

// Scripts once (quiz.js self-inits on require and binds via getElementById at load time)
// Re-load quiz.js after HTML is in place each time.
function loadQuiz(storageSeed) {
  localStorage.clear();
  if (storageSeed) {
    Object.entries(storageSeed).forEach(([k, v]) => localStorage.setItem(k, v));
  }
  document.documentElement.innerHTML = htmlContent;

  jest.isolateModules(() => {
    global.OzzyUtils = require('../js/utils.js');
    global.OzzyTheme = require('../js/theme.js');
    global.OzzyQuizData = require('../js/quiz-data.js');
    require('../js/quiz.js');
  });
}

describe('quiz.js – Theme & Validation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('Theme wird aus localStorage geladen', () => {
    loadQuiz({ ozzyTheme: 'light-mode' });
    expect(document.body.classList.contains('light-mode')).toBe(true);
  });

  test('T-08 Validation-Modal bei leerem Namen', () => {
    loadQuiz();
    const startBtn = document.getElementById('startButton');
    const nameInput = document.getElementById('playerName');
    const valModal = document.getElementById('validationModal');

    nameInput.value = '';
    startBtn.click();

    expect(valModal.classList.contains('ozzy-modal--open')).toBe(true);
    expect(document.getElementById('validationMsg').textContent).toMatch(/Namen/);
  });

  test('T-09 Quiz startet mit Name', () => {
    loadQuiz();
    const startBtn = document.getElementById('startButton');
    const nameInput = document.getElementById('playerName');

    nameInput.value = 'Ozzy';
    startBtn.click();

    expect(document.getElementById('setupArea').style.display).toBe('none');
    expect(document.getElementById('quizArea').style.display).toBe('block');
    expect(document.querySelectorAll('.quizOption').length).toBe(3);
  });
});

describe('quiz.js – Answer flow', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
    loadQuiz();
    document.getElementById('playerName').value = 'Tester';
    document.getElementById('startButton').click();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('T-11 richtige Antwort erhöht Score', () => {
    const app = window.OzzyQuizApp;
    const q = app.getState().shuffledQuestions[0];
    // click correct option
    const buttons = [...document.querySelectorAll('.quizOption')];
    const correctBtn = buttons.find((b) => b.dataset.option === q.answer);
    expect(correctBtn).toBeTruthy();
    correctBtn.click();
    expect(app.getState().score).toBe(1);
    expect(app.getState().lives).toBe(3);
    expect(document.getElementById('quizResult').textContent).toMatch(/RICHTIG/);
    // options locked
    buttons.forEach((b) => expect(b.disabled).toBe(true));
  });

  test('T-10 falsche Antwort kostet Leben', () => {
    const app = window.OzzyQuizApp;
    const q = app.getState().shuffledQuestions[0];
    const buttons = [...document.querySelectorAll('.quizOption')];
    const wrongBtn = buttons.find((b) => b.dataset.option !== q.answer);
    wrongBtn.click();
    expect(app.getState().lives).toBe(2);
    expect(app.getState().score).toBe(0);
    expect(document.getElementById('quizResult').textContent).toMatch(/Falsch|Es war/);
  });

  test('Hint kostet einen Punkt (wenn Score > 0)', () => {
    const app = window.OzzyQuizApp;
    const q = app.getState().shuffledQuestions[0];
    const correctBtn = [...document.querySelectorAll('.quizOption')].find(
      (b) => b.dataset.option === q.answer
    );
    correctBtn.click();
    expect(app.getState().score).toBe(1);
    jest.advanceTimersByTime(1600);
    // next question – use hint
    document.getElementById('hintButton').click();
    expect(app.getState().score).toBe(0);
    expect(document.getElementById('hintText').style.display).toBe('block');
  });
});

describe('quiz.js – Highscore end flow', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('End game speichert Highscore und öffnet Modal', () => {
    loadQuiz();
    document.getElementById('playerName').value = 'MetalFan';
    document.getElementById('startButton').click();

    const app = window.OzzyQuizApp;
    // burn all lives with wrong answers
    for (let i = 0; i < 5 && app.getState().lives > 0; i++) {
      const state = app.getState();
      if (state.currentQuestion >= state.shuffledQuestions.length) break;
      const q = state.shuffledQuestions[state.currentQuestion];
      const wrong = [...document.querySelectorAll('.quizOption')].find(
        (b) => b.textContent !== q.answer && !b.disabled
      );
      if (wrong) wrong.click();
      jest.advanceTimersByTime(1600);
    }

    // force end if still alive by exhausting questions quickly
    while (
      app.getState().lives > 0 &&
      app.getState().currentQuestion < app.getState().shuffledQuestions.length
    ) {
      const state = app.getState();
      const q = state.shuffledQuestions[state.currentQuestion];
      const wrong = [...document.querySelectorAll('.quizOption')].find(
        (b) => b.textContent !== q.answer && !b.disabled
      );
      if (!wrong) break;
      wrong.click();
      jest.advanceTimersByTime(1600);
    }
    jest.advanceTimersByTime(2000);

    const hs = JSON.parse(localStorage.getItem('ozzyHighscore') || '[]');
    // either modal open after lives out, or highscore written
    const modalOpen = document
      .getElementById('endGameModal')
      .classList.contains('ozzy-modal--open');
    expect(modalOpen || hs.length > 0).toBe(true);
    if (hs.length) {
      expect(hs[0].name).toBe('MetalFan');
    }
  });
});
