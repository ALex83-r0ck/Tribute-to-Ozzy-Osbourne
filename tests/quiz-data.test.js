/**
 * Pure quiz logic use cases
 */
const Utils = require('../js/utils.js');
// Ensure quiz-data sees OzzyUtils on global
global.OzzyUtils = Utils;
const Q = require('../js/quiz-data.js');

describe('OzzyQuizData – questions integrity', () => {
  test('every question has answer inside options', () => {
    Q.questions.forEach((q) => {
      expect(q.options).toContain(q.answer);
      expect(q.question.length).toBeGreaterThan(5);
      expect(q.hint.length).toBeGreaterThan(0);
    });
  });

  test('has expected count', () => {
    expect(Q.questions.length).toBe(10);
  });

  test('birth name question is factually set', () => {
    const q = Q.questions.find((x) => x.answer === 'John Michael Osbourne');
    expect(q).toBeTruthy();
  });
});

describe('OzzyQuizData – prepareQuiz / prepareQuestion', () => {
  test('prepareQuiz returns same length, shuffled options per question', () => {
    const prepared = Q.prepareQuiz(Q.questions);
    expect(prepared).toHaveLength(Q.questions.length);
    prepared.forEach((q) => {
      expect(q.options).toContain(q.answer);
      expect(q.options).toHaveLength(3);
    });
  });

  test('prepareQuestion keeps answer valid', () => {
    const sample = Q.questions[0];
    const p = Q.prepareQuestion(sample);
    expect(p.answer).toBe(sample.answer);
    expect(p.options.sort()).toEqual([...sample.options].sort());
  });
});

describe('OzzyQuizData – scoring helpers', () => {
  test('evaluateAnswer', () => {
    expect(Q.evaluateAnswer('1948', '1948')).toBe(true);
    expect(Q.evaluateAnswer('1950', '1948')).toBe(false);
  });

  test('nextLives only drops on wrong', () => {
    expect(Q.nextLives(3, true)).toBe(3);
    expect(Q.nextLives(3, false)).toBe(2);
    expect(Q.nextLives(1, false)).toBe(0);
    expect(Q.nextLives(0, false)).toBe(0);
  });

  test('nextScore increments on correct', () => {
    expect(Q.nextScore(2, true)).toBe(3);
    expect(Q.nextScore(2, false)).toBe(2);
  });

  test('applyHintCost floors at 0', () => {
    expect(Q.applyHintCost(2)).toBe(1);
    expect(Q.applyHintCost(0)).toBe(0);
  });

  test('isQuizOver', () => {
    expect(Q.isQuizOver(10, 10, 3)).toBe(true);
    expect(Q.isQuizOver(5, 10, 0)).toBe(true);
    expect(Q.isQuizOver(5, 10, 2)).toBe(false);
  });
});
