// js/quiz-data.js – questions + pure quiz helpers

(function (root, factory) {
  const api = factory(root.OzzyUtils);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.OzzyQuizData = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Utils) {
  "use strict";

  const TIME_LIMIT = 15;
  const START_LIVES = 3;

  const questions = [
    {
      question: "Wann wurde Ozzy Osbourne geboren?",
      options: ["1948", "1950", "1952"],
      answer: "1948",
      hint: "Er wurde kurz nach dem Zweiten Weltkrieg geboren.",
    },
    {
      question: "Wie lautet Ozzys bürgerlicher Name?",
      options: ["John Michael Osbourne", "John Ozzy Osbourne", "Michael John Osbourne"],
      answer: "John Michael Osbourne",
      hint: "Vorname John, zweiter Vorname Michael.",
    },
    {
      question: "Wie hieß Ozzys erste Band ursprünglich (vor Black Sabbath)?",
      options: ["Earth", "Heaven & Hell", "Polka Tulk Blues Band"],
      answer: "Earth",
      hint: "Die Band hieß zuerst 'Earth', bevor sie zu Black Sabbath wurde.",
    },
    {
      question: "Welches Tier biss Ozzy auf der Bühne (Des Moines, 1982)?",
      options: ["Fledermaus", "Taube", "Schlange"],
      answer: "Fledermaus",
      hint: "1982 in Des Moines – aus Versehen, aber legendär.",
    },
    {
      question: "Wie heißt Ozzys Album von 2022?",
      options: ["Paranoid", "Patient Number 9", "Ordinary Man"],
      answer: "Patient Number 9",
      hint: "Es kam 2022 heraus.",
    },
    {
      question: "In welchem Jahr verließ Ozzy Black Sabbath zum ersten Mal?",
      options: ["1977", "1979", "1981"],
      answer: "1979",
      hint: "Kurz vor dem Album 'Heaven and Hell' mit Dio.",
    },
    {
      question: "Welcher Ozzy-Song wurde u. a. von Trick Daddy gesampelt?",
      options: ["Crazy Train", "Iron Man", "Mr. Crowley"],
      answer: "Crazy Train",
      hint: "Klassiker mit dem markanten Intro.",
    },
    {
      question: "Wie heißt Ozzys Ehefrau?",
      options: ["Sharon Osbourne", "Kelly Osbourne", "Aimee Osbourne"],
      answer: "Sharon Osbourne",
      hint: "Tochter seines früheren Managers Don Arden.",
    },
    {
      question: "Welche MTV-Show machte die Familie weltberühmt?",
      options: ["The Osbournes", "Ozzy & Friends", "Black Sabbath Family"],
      answer: "The Osbournes",
      hint: "MTV, 2002–2005.",
    },
    {
      question: "Welchen Spitznamen trägt Ozzy?",
      options: ["Prince of Darkness", "King of Rock", "Godfather of Metal"],
      answer: "Prince of Darkness",
      hint: "Dunkle Bühne, Fledermäuse…",
    },
  ];

  function prepareQuestion(q) {
    const shuffle = Utils && Utils.shuffleArray ? Utils.shuffleArray : (a) => [...a];
    return {
      question: q.question,
      options: shuffle(q.options),
      answer: q.answer,
      hint: q.hint,
    };
  }

  function prepareQuiz(sourceQuestions) {
    const shuffle = Utils && Utils.shuffleArray ? Utils.shuffleArray : (a) => [...a];
    const base = Array.isArray(sourceQuestions) ? sourceQuestions : questions;
    return shuffle(base).map(prepareQuestion);
  }

  function evaluateAnswer(selected, correct) {
    return selected === correct;
  }

  function nextLives(lives, correct) {
    if (correct) return lives;
    return Math.max(0, lives - 1);
  }

  function nextScore(score, correct, usedHint) {
    let s = score;
    if (correct) s += 1;
    return s;
  }

  function applyHintCost(score) {
    return Math.max(0, score - 1);
  }

  function isQuizOver(currentIndex, total, lives) {
    return lives <= 0 || currentIndex >= total;
  }

  return {
    TIME_LIMIT,
    START_LIVES,
    questions,
    prepareQuestion,
    prepareQuiz,
    evaluateAnswer,
    nextLives,
    nextScore,
    applyHintCost,
    isQuizOver,
  };
});
