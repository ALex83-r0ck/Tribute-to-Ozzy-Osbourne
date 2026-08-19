# 🤘 Tribute to Ozzy Osbourne

Eine interaktive, stilvoll gestaltete Fan-Hommage an Ozzy Osbourne mit einer Bio-Timeline, Galerie, Tribute-Wall, Quiz und einem digitalen Schrein.

> Inoffizielle, nicht-kommerzielle Fan-Projektseite ohne Verbindung zu Ozzy Osbourne, seiner Familie oder seinem Management.

## Überblick

Diese Website ist ein statisches Frontend-Projekt, das mit HTML, CSS und Vanilla JavaScript umgesetzt wurde. Es vereint mehrere thematische Bereiche in einer dunklen, gothic-metaligen Erlebniswelt:

- Bio-/Lebenszeitlinie der Legende
- Galerie mit Modal-Ansicht
- Virtuelle Tribute-Wall mit personalisierten Kerzen
- Quiz mit Zeitlimit, Highscore und Lebenssystem
- Digitaler Schrein mit visuellen Effekten
- Dark-/Light-/Moon-/Disco-Theme-Wechsel

## Funktionen

### Hauptseite

- Bio-Timeline mit unterschiedlichen Kategorien und Icons
- Galerie mit Hover-Effekten und Lightbox-Ansicht
- Tribute Wall mit Namen, Kerzen und LocalStorage-Persistenz
- "Wisdom of Ozzy"-Zitatbereich mit Tastenkürzel
- Digitaler Schrein mit CSS-Animationen und Drag-and-Drop
- Visueller Scroll-Fortschritt und dynamische Theme-Optionen

### Quiz

- 3 Leben mit Fledermaus-System
- 15 Sekunden pro Frage
- Punktesystem mit Streaks und Rangfolge
- Highscore-Speicherung im Browser
- Zufällige Reihenfolge der Fragen und Antwortoptionen

### Weitere Seiten

- Quiz-Seite in `pages/quiz.html`
- Album-/Tour-/Legacy-Bereich in `pages/concert.html`
- Datenschutz- und Impressumsseiten in `pages/`

## Technologie

- HTML5
- CSS3
- Vanilla JavaScript
- Jest + JSDOM für Tests
- Kein Build- oder Bundling-Schritt nötig

## Projektstruktur

```text
.
├── index.html                  # Startseite / Haupt-Dashboard
├── IMPROVEMENTS.md             # Qualitäts- und Verbesserungsplan
├── manifest.json               # Web-App-Manifest
├── sw.js                       # Service Worker
├── mkdocs.yml                  # Dokumentations-Konfiguration
├── package.json                # Projekt-Definition und Test-Skripte
├── README.md                   # Projektbeschreibung
├── css/
│   ├── styles.css              # Haupt-Styling
│   ├── quiz.css                # Quiz-Styling
│   └── cert.css                # Zertifikat-/Concert-Styles
├── js/
│   ├── main.js                 # Hauptseiten-Logik
│   ├── theme.js                # Theme-Handling
│   ├── quiz-data.js            # Quiz-Daten und Logik
│   ├── quiz.js                 # Quiz-Interaktion
│   ├── cert.js                 # Album-/Concert-Logik
│   ├── utils.js                # Shared Helper
│   └── ...
├── pages/
│   ├── quiz.html               # Quiz-Seite
│   ├── concert.html            # Legacy-/Concert-Seite
│   ├── impressum.html          # Impressum
│   └── datenschutz.html        # Datenschutz
├── assets/
│   ├── gif/
│   └── images/
├── docs/
│   ├── index.md
│   └── quiz.md
├── tests/
│   ├── main.test.js
│   ├── quiz.test.js
│   ├── quiz-data.test.js
│   ├── theme.test.js
│   ├── utils.test.js
│   └── cert.test.js
├── coverage/                   # Test-Abdeckung (bei Ausführung erzeugt)
└── LICENSE                     # Lizenz
```

## Installation und Start

### 1. Repository klonen

```bash
git clone https://github.com/ALex83-r0ck/Tribute-to-Ozzy-Osbourne.git
cd Tribute-to-Ozzy-Osbourne-new
```

### 2. Abhängigkeiten installieren

```bash
npm install
```

### 3. Tests ausführen

```bash
npm test
```

### 4. Projekt lokal öffnen

Da es sich um eine statische Website handelt, kann sie direkt im Browser geöffnet werden:

```bash
# einfach im Browser öffnen
index.html
```

Alternativ kann ein lokaler Webserver verwendet werden:

```bash
python -m http.server 8000
```

Danach im Browser auf `http://localhost:8000` gehen.

## Dokumentation

- Projektplan und Qualitäts-Verbesserungen: [IMPROVEMENTS.md](IMPROVEMENTS.md)
- MkDocs-Dokumentation: [docs/index.md](docs/index.md)

## Hinweise

- Das Projekt ist rein fanorientiert und nicht kommerziell.
- Die Inhalte sind für eine hommageschaffende, nicht gewerbliche Nutzung gedacht.
- Bilder und Inhalte wurden je nach Quelle als frei nutzbar oder KI-generiert gekennzeichnet.

## Lizenz

Das Projekt verwendet die in der Repository-Lizenz hinterlegte Open-Source-Lizenz. Bitte die Datei [LICENCE](LICENCE) beachten.

---

Erstellt mit 🤘 für die Fans des Prince of Darkness.
