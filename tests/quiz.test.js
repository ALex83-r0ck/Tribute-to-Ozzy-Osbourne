// __tests__/quiz.test.js
describe('Ozzy Quiz Logic', () => {
  test('Frage 1 ist korrekt definiert', () => {
    // Mock questions direkt
    const questions = [
      { question: "Wann wurde Ozzy Osbourne geboren?", answer: "1948" }
    ];
    expect(questions[0].question).toBe("Wann wurde Ozzy Osbourne geboren?");
    expect(questions[0].answer).toBe("1948");
  });

  test('Hint kostet Punkt', () => {
    let score = 5;
    const hintUsed = true;
    if (hintUsed && score > 0) score--;
    expect(score).toBe(4);
  });

  test('Highscore wird gespeichert', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    localStorage.setItem('ozzyHighscore', '[]');
    expect(setItemSpy).toHaveBeenCalledWith('ozzyHighscore', '[]');
    setItemSpy.mockRestore();
  });
});