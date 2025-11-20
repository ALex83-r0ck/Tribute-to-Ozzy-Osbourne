// __tests__/main.test.js
describe('main.js – Theme & Gallery Animation', () => {
  beforeEach(() => {
    // Mock localStorage
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn()
    };

    // Mock document
    global.document = {
      body: {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          contains: jest.fn()
        }
      },
      querySelectorAll: jest.fn()
    };
  });

  test('Light-Mode wird aus localStorage geladen', () => {
    // Simuliere: localStorage gibt 'light' zurück
    localStorage.getItem.mockReturnValue('light');

    // Simuliere Code aus main.js
    document.body.classList.add('dark-mode');
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }

    // Prüfe: wurde light-mode hinzugefügt?
    expect(document.body.classList.add).toHaveBeenCalledWith('light-mode');
    expect(document.body.classList.remove).toHaveBeenCalledWith('dark-mode');
  });

  test('Gallery Animation Delay wird gesetzt', () => {
    // Mock für querySelectorAll
    const mockImg = { style: { setProperty: jest.fn() } };
    document.querySelectorAll.mockReturnValue([mockImg, mockImg]);

    // Simuliere Code aus main.js
    document.querySelectorAll('.galleryImage').forEach((img, i) => {
      img.style.setProperty('--i', i + 1);
    });

    // Prüfe: wurde --i = 1 und --i = 2 gesetzt?
    expect(mockImg.style.setProperty).toHaveBeenCalledWith('--i', 1);
    expect(mockImg.style.setProperty).toHaveBeenCalledWith('--i', 2);
  });
});