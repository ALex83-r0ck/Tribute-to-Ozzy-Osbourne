# Ozzy Tribute – Verbesserungs-Roadmap

Tracking-Dokument für die systematische Qualitätsarbeit.
Stand: 2026-07-21 · Version **3.1.0**

---

## Status-Legende

| Symbol | Bedeutung |
|--------|-----------|
| ✅ | Erledigt |
| 🔄 | In Arbeit |
| ⬜ | Offen |
| ⏸️ | Verschoben |

---

## Phase 1 – Fundament & Hotfixes

| ID | Aufgabe | Status | Tests |
|----|---------|--------|-------|
| P1-01 | Roadmap-Dokument anlegen | ✅ | — |
| P1-02 | Shared Utils (`storage`, `sanitize`, `shuffle`, `toast`) | ✅ | `utils.test.js` |
| P1-03 | Shared Theme-Modul (DRY über alle Seiten) | ✅ | `theme.test.js` |
| P1-04 | Galerie-Bug: falsches `data-full` / Alt-Text | ✅ | `main.test.js` |
| P1-05 | Dateiname mit Leerzeichen bereinigen | ✅ | `main.test.js` |
| P1-06 | Quiz-Fragen korrigieren (Name, Fakten) | ✅ | `quiz-data.test.js` |
| P1-07 | XSS: kein `innerHTML` mit User-/Alt-Daten | ✅ | DOM via `textContent` / `createElement` |
| P1-08 | LocalStorage robust parsen (try/catch überall) | ✅ | `utils.test.js` |

## Phase 2 – a11y, Performance, UX

| ID | Aufgabe | Status | Tests |
|----|---------|--------|-------|
| P2-01 | `aria-label` + `:focus-visible` für Icon-Buttons | ✅ | CSS + HTML |
| P2-02 | Galerie-Modal: role=dialog, Escape, Focus | ✅ | `utils.openImageModal` |
| P2-03 | `prefers-reduced-motion` (Canvas, Disco, Ghost, Animations) | ✅ | CSS + JS helpers |
| P2-04 | Canvas pausieren bei hidden tab / reduced motion | ✅ | `main.js` |
| P2-05 | Typewriter: parallele Starts abbrechen | ✅ | `createTypewriter` |
| P2-06 | Disco-Mode optional persistent | ✅ | `theme.test.js` |
| P2-07 | Kerzen-Cap im Storage + sanitisierte Namen | ✅ | `utils.test.js`, `main.test.js` |
| P2-08 | Quiz: Optionen shuffeln, Buttons disablen nach Antwort | ✅ | `quiz.test.js` |
| P2-09 | Concert: Vote-Feedback / Double-Click-Schutz | ✅ | `concert.test.js` |

## Phase 3 – Responsive Design

| ID | Aufgabe | Status | Tests |
|----|---------|--------|-------|
| P3-01 | Header/Nav auf schmalen Viewports verbessern | ✅ | CSS ≤600/480 |
| P3-02 | Timeline, Galerie, CTA, Schrein Mobile-Feinschliff | ✅ | CSS |
| P3-03 | Quiz + Concert Layouts (Options-Grid, Cards) | ✅ | `quiz.css`, `concert.css` |
| P3-04 | Touch-Targets min. ~44px wo sinnvoll | ✅ | Buttons / Options |

## Phase 4 – Tests (Use Cases)

| ID | Use Case | Status |
|----|----------|--------|
| T-01 | Theme default dark | ✅ |
| T-02 | Theme aus localStorage laden (light/moon) | ✅ |
| T-03 | Theme-Toggle speichert Preference | ✅ |
| T-04 | Moon-Mode + Disco-Toggle | ✅ |
| T-05 | Fisher-Yates shuffle (Länge, Elemente, Mutation) | ✅ |
| T-06 | Ranking-Grenzen (Roadie → METAL GOD) | ✅ |
| T-07 | Highscore: speichern, sortieren, Cap 10, korrupt | ✅ |
| T-08 | Quiz start ohne Name → Validation Modal | ✅ |
| T-09 | Quiz start mit Name → Area-Switch | ✅ |
| T-10 | Falsche Antwort → Leben −1 | ✅ |
| T-11 | Richtige Antwort → Score +1 | ✅ |
| T-12 | Storage: safeParse/safeSet | ✅ |
| T-13 | sanitizeName (Trim, Max-Länge, Steuerzeichen) | ✅ |
| T-14 | Tribute Wall: Kerze mit Name, Persistenz | ✅ |
| T-15 | Galerie Modal öffnen/schließen (Escape) | ✅ (Helper + Concert Escape) |
| T-16 | prefersReducedMotion Helper | ✅ |
| T-17 | Concert Vote inkrementiert & speichert | ✅ |

**Ergebnis:** `npm test` → **6 Suites, 57 Tests, alle grün** (Stand 2026-07-21).

## Phase 5 – CI / Deploy / Repo-Hygiene

| ID | Aufgabe | Status |
|----|---------|--------|
| P5-01 | `.gitignore` reparieren (`.github\` nicht pauschal) | ✅ |
| P5-02 | Deploy nur Publish-Artefakte (kein node_modules/coverage) | ✅ |
| P5-03 | Doppel-Deploy bereinigen | ✅ (`workflows/ci.yml` + `pages.yml`) |
| P5-04 | Node 20+ in CI | ✅ |
| P5-05 | LICENCE MIT-Text | ✅ |

---

## Architektur (aktuell)

```
js/
  utils.js       ← pure helpers (storage, sanitize, shuffle, toast, modal)
  theme.js       ← Theme apply/load/save + disco
  quiz-data.js   ← Fragen + pure Quiz-Logik
  main.js        ← Dashboard
  quiz.js        ← Quiz UI
  concert.js     ← Legacy page
tests/
  utils.test.js
  theme.test.js
  quiz-data.test.js
  main.test.js
  quiz.test.js
  concert.test.js
```

Script-Reihenfolge in HTML:

```html
<script src="js/utils.js"></script>
<script src="js/theme.js"></script>
<!-- + quiz-data.js auf Quiz-Seite -->
<script src="js/main.js|quiz.js|concert.js"></script>
```

---

## Noch offen / nächste Iteration (optional)

| ID | Idee | Priorität |
|----|------|-----------|
| N-01 | PWA Manifest + Offline-Cache | ✅ |
| N-02 | Open Graph / Favicon | low |
| N-03 | Galerie Lightbox Vor/Zurück | ✅ |
| N-04 | Mehr Timeline-Events (Blizzard, No More Tears, Back to the Beginning) | content |
| N-05 | Canvas-Coverage / E2E (Playwright) | low |
| N-06 | Quiz-Timer-Test mit Fake-Timers (Ablauf) | low |
| N-07 | package-lock bewusst versionieren (npm ci) | ops |

---

## Changelog dieser Iteration (v3.1.0)

### 2026-07-21

- Shared Modules: `utils.js`, `theme.js`, `quiz-data.js`
- Hotfixes: Galerie-`data-full`, Alt-Texte, Dateiname `ozzy-osbourne-on-stage-rip.png`
- Quiz-Fragen korrigiert (bürgerlicher Name, Earth, etc.)
- XSS-Härtung: `textContent`/`createElement`, `sanitizeName` strippt Markup
- a11y: focus-visible, aria-labels, dialog roles, live regions, reduced-motion
- Performance: Canvas pause, weniger Partikel mobil, Scroll-RAF
- UX: Disco persistent, Kerzen-Cap, Quiz Option-Lock + Shuffle, Vote once
- Responsive: Header, Galerie, Quiz-Options, Concert-Cards, Touch-Targets
- Tests: 57 Use-Case-Tests
- CI: Node 20, sauberes Pages-Publish-Dir, `.gitignore` fix, MIT LICENCE

---

## Definition of Done (v3.1)

- [x] Code lauffähig im Browser (index, quiz, concert)
- [x] `npm test` grün (57/57)
- [x] Relevante Use Cases abgedeckt
- [x] Responsive CSS für ≤768 / ≤600 / ≤480
- [x] Dieses Dokument aktualisiert
