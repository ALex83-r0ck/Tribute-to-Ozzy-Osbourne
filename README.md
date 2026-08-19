# 🤘 Ozzy Osbourne – Legendary Fan Tribute (v3.1)

Willkommen im **Ozzy Empire**! Eine hochgradig interaktive Fan-Hommage an den Prince of Darkness, Ozzy Osbourne. Entwickelt mit Leidenschaft, HTML5, CSS3 und modernem Vanilla-JavaScript.

> Qualitäts-Roadmap & Status: siehe [`IMPROVEMENTS.md`](./IMPROVEMENTS.md)

> **Inoffizielle, nicht-kommerzielle Fan-Hommage.** Keine Verbindung zu Ozzy Osbourne, seiner Familie oder seinem Management. Alle verwendeten Bilder sind CC0-lizenzfrei oder KI-generiert.

---

## 🚀 Features

### 🎸 Hauptseite (The Dashboard)

| Feature | Details |
|---|---|
| **Bio-Timeline v3** | Zick-Zack-Layout mit farbigen Kategorie-Badges (Lebensabschnitt, Musikalische Ära, Kult-Moment, Medien & Kultur, Vermächtnis), dynamischen Emoji-Icons per `data-icon`-Attribut und Scroll-Reveal-Animation. |
| **Galerie v3** | Hover-Overlay mit Titel-Slide-In, Zoom-Effekt, Klick-to-Modal mit Escape-/Backdrop-Schließung. |
| **Tribute Wall v3** | Personalisierte Kerzen: Name eingeben → 🕯️ mit Name-Tooltip. Persistenz via LocalStorage (Array statt Zähler). Enter-Taste unterstützt. |
| **Wisdom of Ozzy v3** | Typewriter-Effekt für Zitate. Shortcut-Taste **Q** zeigt neues Zitat. Erweiterter Zitatpool (12 Quotes). |
| **Digitaler Schrein v3** | Vollständig in reinem CSS gebaut (kein Video). Animierte CSS-Flammen, pulsierende 👁️-Eye, Offering-Display im Altar. Drag & Drop: Gaben auf den Altar ziehen → visuelle Reaction. |
| **CTA-Section** | Großformatige Link-Karten zu Quiz und Legendary Live Legacy mit Hover-Animation, Pfeil-Effekt und Icon-Spin. |
| **Scroll-Indikator** | Lokomotive 🚂 begleitet vertikal durch die Seite. |
| **Design-Modi** | Light Mode, Dark Mode, Moonlight Mode 🌙, Disco Mode. Persistenz via LocalStorage. |
| **Ghost Ozzy** | Geisterhafter Ozzy 👻 erscheint zufällig und reagiert auf Klick. |

### 🎮 Ultimate Quiz

- **Bat-Lives System:** 3 Leben (🦇) – jede falsche Antwort kostet eine Fledermaus.
- **Crazy Train Timer:** 15 Sekunden pro Frage.
- **Rockstar Ranking:** Titel vom „Roadie" bis zum „METAL GOD".
- **Highscore Hall of Fame:** Lokal gespeicherte Bestenliste.
- **Fisher-Yates Shuffle:** Fragen und Antworten jedes Mal in anderer Reihenfolge.

### 💿 Legendary Live Legacy

- **Vinyl-Masterpieces:** Interaktive Album-Cover mit Vinyl-Spin-Effekt und Tracklisten.
- **Legendary Tours:** Vote für Lieblingstournee.
- **Stage Light Sync:** Bühnenbeleuchtung der gesamten Seite steuern.
- **Trophy Case:** Schwebende Sidebar mit Ozzys größten Auszeichnungen.

---

## 🛠️ Installation & Start

1. Repository klonen oder ZIP herunterladen.
2. `index.html` in einem modernen Webbrowser öffnen.
3. **Kein Webserver nötig** – alles läuft Client-seitig.

```bash
git clone https://github.com/ALex83-r0ck/Tribute-to-Ozzy-Osbourne.git
cd Tribute-to-Ozzy-Osbourne-new
# Öffne index.html direkt im Browser (kein Build-Schritt nötig)
```

### Tests

```bash
npm install
npm test
```

---

## 📁 Projektstruktur

```
/
├── index.html            ← Hauptseite
├── IMPROVEMENTS.md       ← Qualitäts-Roadmap
├── css/
│   ├── styles.css        ← Globale Styles (Dark, Light, Moon, Disco)
│   ├── quiz.css
│   └── concert.css
├── js/
│   ├── utils.js          ← Shared Helpers (Storage, Sanitize, Toast…)
│   ├── theme.js          ← Theme-Modul
│   ├── quiz-data.js      ← Fragen + pure Quiz-Logik
│   ├── main.js           ← Dashboard-Logik
│   ├── quiz.js
│   └── concert.js
├── pages/
│   ├── quiz.html
│   ├── concert.html
│   ├── impressum.html
│   └── datenschutz.html
├── assets/
│   ├── images/           ← CC0/KI-generierte Gothic-Grafiken
│   └── gif/
├── tests/                ← Jest Use-Case-Tests (57)
└── package.json          ← v3.1.0
```

---

## 🗓️ Changelog

### v3.1.0 (2026-07)

- Shared Modules (`utils`, `theme`, `quiz-data`), robustes LocalStorage
- a11y (`focus-visible`, Dialoge, Live-Regions), `prefers-reduced-motion`
- Responsive Feinschliff, Touch-Targets, Canvas-Performance
- Quiz: Option-Shuffle, Answer-Lock, korrigierte Fragen
- Concert: One-Vote-Schutz, sicheres DOM
- 57 Jest-Tests, CI Node 20, sauberes GitHub-Pages-Deploy
- Details: `IMPROVEMENTS.md`

### v3.0.0 (2026-07)

- **Timeline:** Kategorie-Badges + dynamische Emoji-Knoten via `data-icon`, verbesserte Mobile-Responsiveness.
- **Galerie:** Hover-Titel-Overlay, Zoom-Effekt, Gallery-Card-Struktur.
- **Tribute Wall:** Namens-Eingabe, personalisieter Candle-Toast, Enter-Taste-Support, Array-basierte Persistenz.
- **Wisdom of Ozzy:** Typewriter-Effekt, `Q`-Tastaturshortcut, erweiterter Zitatpool.
- **Digitaler Schrein:** CSS-Altar ersetzt Video (keine Copyright-Abhängigkeit), animierte Flammen, Drag & Drop für Offerings, Offering-Display im Altar-Zentrum.
- **CTA-Section:** Neue vollwertige Karten-Links zu Quiz und Legacy mit Premium-Hover-Effekten.
- **Responsive:** Gezielte Media-Queries für alle neuen Komponenten.
- **Versioning:** `package.json` auf `3.0.0` angehoben.

### v2.0.0 (2026-07)

- Globale Theme-Synchronisation (localStorage).
- Custom Modals für Quiz/Empire.
- Barrierefreiheit: Keyboard-Navigation (Tab/Enter/Space/Escape).
- Fisher-Yates Shuffle für Quiz.
- Jest/JSDOM Integrationstests.
- Neue gothic-thematische CC0/KI-Bilder für die Galerie.

### v1.0.0

- Grundstruktur: Timeline, Tribute Wall, Quiz, Concert.

---

*Erstellt mit 🤘 von Alexander Rothe. Ein Fan-Projekt – nicht kommerziell.*
