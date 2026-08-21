# 🤘 Tribute to Ozzy Osbourne

Eine düster-epische Fan-Hommage an Ozzy Osbourne mit einer Bio-Timeline, Galerie, Tribute-Wall, Quiz, Schrein und einem starken Heavy-Metal-Charakter.

> Inoffizielle, nicht-kommerzielle Fan-Projektseite ohne Verbindung zu Ozzy Osbourne, seiner Familie oder seinem Management.

## Überblick

Diese Seite ist ein statisches Frontend-Projekt aus HTML, CSS und Vanilla JavaScript. Sie bündelt eine komplette Tribute-Experience in einem dunklen, rockigen Stil:

- Hero-Startsektion mit Feuermotiv und Bühnenatmosphäre
- Lebenszeitlinie mit symbolischen Metal-Marken
- Galerie mit Hover-Effekten und Bild-Details
- Virtuelle Tribute-Wall mit Kerzen und LocalStorage
- Quiz mit Highscore, Timer, Leben und Punktesystem
- Digitaler Schrein mit Drag-and-Drop-Gaben
- Theme-Wechsel zwischen Dark, Light, Moon und Disco
- Scroll-Progress, Reveal-Animationen und Back-to-Top-Button

## Hauptmerkmale

### Landingpage

- Stilvolle, dunkle Hero-Section mit starkem Festival-Feeling
- Timeline mit Jahren, Kategorien, Symbolen und metallic Look
- Interaktive Tribute-Wall-Elemente mit personalisierten Kerzen
- Abschlussbanner mit starkem Finale und emotionalem Abschluss
- Responsive Layout für Desktop und mobile Darstellung

### Quiz

- Zufällige Fragen und Antwortoptionen pro Runde
- Countdown je Frage
- Drei Leben mit Fledermaus-Mechanik
- Punkte- und Streak-System
- Browser-Highscore mit Persistenz
- Ergebnis- und Neustart-Logik

### Weitere Seiten

- Quizseite: `pages/quiz.html`
- Konzert-/Legacy-Seite: `pages/concert.html`
- Datenschutz: `pages/datenschutz.html`
- Impressum: `pages/impressum.html`

## Technologien

- HTML5
- CSS3
- Vanilla JavaScript
- Jest + JSDOM für Frontend-Tests
- Kein Build- oder Bundling-Schritt nötig

## Projektstruktur

```text
.
├── index.html                  # Startseite / Hauptseite
├── README.md                   # Projektbeschreibung
├── IMPROVEMENTS.md             # Qualitäts- und Verbesserungsplan
├── manifest.json               # Web-App-Manifest
├── sw.js                       # Service Worker
├── mkdocs.yml                  # MkDocs-Konfiguration
├── package.json                # Skripte und Projekt-Abhängigkeiten
├── LICENCE                     # Lizenz
├── css/
│   ├── styles.css              # Haupt-Styling der Landingpage
│   ├── quiz.css                # Styling der Quizseite
│   └── cert.css                # Styling der Konzert-/Legacy-Seite
├── js/
│   ├── main.js                 # Hauptseiten-Logik
│   ├── theme.js                # Theme-Handling
│   ├── quiz-data.js            # Quiz-Daten und Fragen
│   ├── quiz.js                 # Quiz-Interaktion
│   ├── cert.js                 # Konzert-/Legacy-Logik
│   ├── utils.js                # Hilfsfunktionen
│   └── ...
├── pages/
│   ├── quiz.html               # Quizseite
│   ├── cert.html               # Zertifikat-/Konzertseite
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
├── coverage/                   # Test-Ergebnisse
├── .gitignore                  # Git-Ignorierung
└── LICENSE                     # zusätzlich hinterlegte Lizenzdatei
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

### 4. Projekt lokal starten

Da es sich um eine statische Website handelt, kann sie direkt im Browser geöffnet werden:

```bash
index.html
```

Alternativ über einen lokalen Webserver:

```bash
python -m http.server 8000
```

Danach im Browser auf `http://localhost:8000` gehen.

## Dokumentation

- Qualitätsplan und Verbesserungen: [IMPROVEMENTS.md](IMPROVEMENTS.md)
- MkDocs-Dokumentation: [docs/index.md](docs/index.md)

## Hinweise

- Das Projekt ist eine inoffizielle Fan-Hommage und kein offizieller Ozzy-Osbourne-Auftritt.
- Die Seite dient rein zu Bildungs-, Fan- und Hobbyzwecken.
- Inhalte, Bilder und visuelle Elemente wurden je nach Quelle entsprechend genutzt bzw. als Teil der Tribute-Umgebung eingesetzt.

## Lizenz

Bitte die Lizenzdatei im Repository beachten. Das Projekt wird unter der hinterlegten Lizenz veröffentlicht.

---

Erstellt mit 🤘 für die Fans des Prince of Darkness.
