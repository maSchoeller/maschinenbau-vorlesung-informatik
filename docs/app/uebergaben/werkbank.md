# Übergabe: Werkbank und Teilen

Stand: 2026-11-23. Rolle Werkbank. Ergänzt `docs/app/ARCHITEKTUR.md`, Abschnitt 8.

## Was gebaut wurde

| Datei | Inhalt |
|---|---|
| `app/src/pages/werkbank.astro` | Seite: links Programmliste, rechts Titel, Aktionen, Editor mit Runner; Teilen-Dialog (`<dialog>`) |
| `app/src/pages/geteilt.astro` | Seite für `geteilt.html?id=<id>`; nutzt `werkbank.css` über `css={['werkbank']}` |
| `app/public/app/werkbank.js` | Liste, Auswahl, Autospeichern, Aktionen, Teilen, Abgleich von außen |
| `app/public/app/werkbank.css` | Stile beider Seiten (Präfix `wb-`) |
| `app/public/app/werkbank-knopf.js` / `.css` | global (jede Seite): `window.KursWerkbank` und der Knopf „In der Werkbank öffnen“ |
| `app/public/app/geteilt.js` | geteiltes Programm laden und anzeigen, „Kopie in meine Werkbank“ |
| `app/skripte/pruefe-werkbank.mjs` | wiederholbare Browser-Prüfung (Playwright) |

Beide Seiten binden `icons.js`, `kurs.js` und `editor.js` selbst ein (`bestandSkripte`), weil die Hülle sie nur bei durchgereichten Bestandsseiten mitbringt.

### Werkbank (`werkbank.html`)

- Speicher: `inf-mb/werkbank/prog:<id>` = `{titel, code, erstellt, geaendert, quelle?, eingaben?}`. Neu gegenüber dem Vertrag ist nur das optionale Feld `eingaben` (Inhalt des „Eingaben“-Felds für `input()`); `quelle` = `{lektion?, seite}`. ID: `p` plus 6 Zeichen `[a-z0-9]`.
- Ausführen, Eingaben, Diagramme, Schritt für Schritt: der Bestands-Runner (`.k-runner` mit `textarea.k-runner__code.py-editor`). Dessen Knopf „Zurücksetzen“ ist in der Werkbank ausgeblendet (er würde den leeren Anfangszustand herstellen).
- Autospeichern 700 ms nach der letzten Änderung (Code, Titel, Eingaben), sofort bei Strg+S, beim Wechseln, Verlassen des Tabs und `pagehide`. 400 ms nach jedem Speichern prüft `pruefeAblage`, ob der Stand wirklich im localStorage (`dhbw-inf-mb:speicher:v2`) liegt (KursSpeicher meldet einen vollen Speicher nicht zurück); sonst sagt die Statuszeile ehrlich, dass der Browser-Speicher voll ist, und rät zum Download als .py. Statuszeile (`aria-live`) sagt „Änderungen werden gespeichert …“ / „Gespeichert um …“.
- Liste: neueste zuerst (nach Schreibzeit des Eintrags), aktuelles Programm mit `aria-current="true"` und rotem Balken. Einträge sind Links `#<id>`; Wechsel über die Adresse, damit Zurück-Knopf, `zuletzt` der Hülle und „Weiter, wo du warst“ funktionieren. Das zuletzt geöffnete Programm merkt sich `localStorage['inf-mb-app:werkbank:aktuell']` (nur Gerät).
- Aktionen: Neu (Fokus im Editor), Duplizieren (Titel + „ (Kopie)“, Fokus im Titel), Herunterladen (`<titel>.py`, UTF-8, Umlaute und Sonderzeichen im Dateinamen ersetzt), Teilen, Löschen. Löschen ohne Rückfrage: Meldung „… wurde gelöscht.“ mit „Rückgängig“ (20 s; stellt den alten Wert wieder her).
- Änderungen von außen (anderer Tab, anderes Gerät über `speicher-azure.js`) laufen über `KursSpeicher.abonnieren`: Liste wird aktualisiert; das offene Programm wird nur ersetzt, wenn lokal nichts Ungespeichertes steht. Wird das offene Programm anderswo gelöscht: Hinweis, ein anderes Programm wird geöffnet. Ein Deep-Link auf ein noch nicht vorhandenes Programm (z. B. Konto-Abgleich läuft noch) öffnet es, sobald es eintrifft.
- Leerer Zustand: ein Satz, ein Knopf „Beispielprogramm anlegen“ (Kreisfläche mit `input()`, Eingabe 25).
- Obergrenzen: Programme über 64 KB (JSON des Eintrags) bekommen einen Hinweis („zu groß für den Abgleich … bleibt auf diesem Gerät“); sie bleiben lokal. Teilen verweist dann auf die Meldung der API (413).

### Teilen

- Dialog „Programm teilen“. Ohne Login: Satz + Knopf „Mit GitHub anmelden“ (`KursApp.konto.anmelden()`; nach der Rückkehr ist dasselbe Programm offen). Angemeldet ohne Anzeigenamen: Satz + Link „Zum Konto“ (`konto.html`). Sonst: der Hinweis aus dem Vertrag („Teile keine Lösungen von Trainingsaufgaben, bevor andere sie selbst versucht haben.“), ein Satz zur Funktionsweise, Knopf „Link erstellen“ → Link im Feld, automatisch kopiert, zusätzlich „Link kopieren“.
- „Deine geteilten Links“ im selben Dialog (`GET /api/geteilt`): Titel (öffnet die Seite), Datum, Kopieren, Löschen. Löschen verlangt einen zweiten Klick („Wirklich löschen?“, 6 s), weil ein gelöschter Link nicht zurückkommt.
- Es wird `titel`, `code` und (falls bekannt) `lektion` gesendet, nicht `eingaben` (die API kennt das Feld nicht).
- `DELETE` sendet `body: {}`, damit `KursApp.api` den `content-type` setzt (siehe Wünsche).

### Geteiltes Programm (`geteilt.html?id=…`)

Titel, „geteilt von <Name> · Datum · aus Lektion V07“, Hinweis „Schnappschuss“, ausführbarer Code (Runner mit `KursRunner.make`, Eingaben tippt die lesende Person selbst), „Kopie in meine Werkbank“ (Titel, Code, `quelle`). Ohne Login nutzbar. Meldungen mit klarem Titel: Link ohne id, unbekannte/gelöschte id (404), offline (mit „Erneut versuchen“), Mengenbremse, Serverfehler. In `geteilt.js` gibt es kein `innerHTML`; Titel, Autor, Lektion, Datum und Code werden nur über `textContent`, `value` und `document.title` gesetzt. Der Autor steht neutral als „geteilt von …“ (Anzeigenamen sind nicht geprüft).

### „In der Werkbank öffnen“ (`werkbank-knopf.js`)

- Erscheint nur auf Seiten mit `data-page="lerneinheit"` und `data-page="bibliothek"`, in der Knopfleiste des Runners (Linkknopf mit Symbol, nach „Zurücksetzen“; sichtbarer Text „Werkbank“, Name und Tooltip „In der Werkbank öffnen“, damit die Leiste auch in schmalen Spalten einzeilig bleibt). Legt eine Kopie des aktuellen Editorinhalts (auch eigener Änderungen) samt Eingaben an, Titel „V07 · <nächste Überschrift davor>“ (Bibliothek: „Bibliothek · Spielwiese“), und öffnet `werkbank.html#<id>`. Leerer Code legt nichts an, sondern meldet es.
- **Abgrenzung (Begründung):** nicht im Labor und nicht in Aufgaben ([data-a], [data-id], `.a-task`, `.l-task`, Quizfragen). Dort schreiben Studierende Lösungen für Trainingsaufgaben; ein Knopf würde sie nebenbei zu „Programmen“ machen, die dann unbedacht geteilt oder per Konto auf alle Geräte kopiert werden. Beispielcode in den Lektionen dagegen ist zum Ausprobieren da.
- Technik: ein `MutationObserver` auf `document.body`, der Editor-, Ausgabe- und Eingabeknoten ignoriert und höchstens einmal pro Animationsbild sucht (`.k-runner:not([data-wb-knopf])`); Marke `data-wb-knopf` verhindert Doppelknöpfe. In V07 (15 Runner) entstehen 15 Knöpfe, keiner doppelt.
- `window.KursWerkbank` (gleiche Datei, global): `anlegen({titel, code, eingaben?, quelle?}) → id`, `url(id)`, `pfad(id)`, `neueId()`, `titel(text)` (bereinigt auf 80 Zeichen ohne Steuer- und Formatzeichen), `merkeAktuell(id)`, `aktuell()`.

## Prüfen

```bash
W=/c/_Data/01_sourcecode/github/maschinenbau-vorlesung-informatik/.claude/worktrees/interactive-learning-platform-c684cf
export PATH="$W/.werkzeuge/node22:$W/.werkzeuge/node_modules/.bin:$PATH"
cd "$W/app" && KURS_AUSGABE=dist-werkbank npm run build
cd "$W" && ABLAGE=datei ABLAGE_DATEI="$W/api/.daten/werkbank/ablage.json" \
  swa start app/dist-werkbank --api-location api --port 4325 --api-port 7335     # im Hintergrund
cd "$W/app" && node skripte/pruefe-werkbank.mjs http://localhost:4325
```

Das Skript prüft bei 1440×900 und 1024×768 (je ca. 70 Aussagen): leerer Zustand, Anlegen, Tippen und Neuladen, Ausführen (print, `input`, Traceback mit `ZeroDivisionError`), Umbenennen, Duplizieren, Neu, Löschen mit Rückgängig, Herunterladen, Programm über 64 KB, Strg+S, Deep-Link und unbekannte ID, Änderungen und Löschen aus einem anderen Tab, Tastatur (Fokusumriss, Enter, Tab-Reihenfolge, Namen aller Bedienelemente), kein waagerechtes Scrollen, „In der Werkbank öffnen“ (Lerneinheit mit 15 Runnern, nicht im Labor, Bibliothek), Teilen ohne Login (Anmeldung im Emulator, Rückkehr zum selben Programm), ohne Anzeigenamen, mit Anzeigenamen (Link, Zwischenablage), Link in frischem Kontext öffnen und ausführen, Kopie in die Werkbank, unbekannte/gelöschte id, Offline-Fall, XSS-Probe (Titel, Code, Autor, Lektion mit `<img onerror>` und `<script>`), eigenen Link löschen, zweites Gerät mit demselben Konto (Abgleich über `KursAbgleich.jetzt()`). Fotos: `app/.cache/pruefung-werkbank/`.

Der Emulator vergibt bei jeder Anmeldung eine neue Kennung; das zweite Gerät im Test bekommt deshalb das Anmelde-Cookie des ersten.

## Wünsche an andere Rollen

0. **Fundament (klein):** `KursSpeicher.sofort.schreiben` kann einen vollen localStorage nicht melden (`speicher.js` schluckt den Quota-Fehler, alle Daten liegen in einem Schlüssel). Ein Rückgabewert oder Ereignis „Ablage voll“ würde allen Seiten helfen; die Werkbank prüft bis dahin selbst nach.
1. **Fundament / Bestand (wichtig, betrifft alle Runner):** Klickt man in einen Runner-Editor und danach direkt auf „Ausführen“, geht der erste Klick verloren. Ursache: `kurs.css`/`runner.css` blenden `.k-runner--auto .ke__status` aus und nur bei `:focus-within` ein; beim Klick verliert der Editor den Fokus, die Hinweiszeile verschwindet, die Knopfleiste rutscht nach oben, und `mouseup` landet auf der Leiste statt auf dem Knopf (geprüft in `v07-funktionen.html` mit Playwright: erster Klick ohne Wirkung, zweiter läuft). Vorschlag: Hinweiszeile in `.k-runner--auto` dauerhaft zeigen oder ihren Platz reservieren (`min-height`) oder per `visibility` statt `display` ausblenden. In der Werkbank umgangen (Hinweiszeile dauerhaft sichtbar).
2. **Fundament:** `KursApp.api` sollte bei `DELETE` ohne Body ebenfalls `content-type: application/json` senden (steht schon in `api.md`, Abschnitt 4). Die Werkbank sendet `body: {}` als Umgehung.
3. **Konto:** Seite `konto.html` muss existieren und einen Anzeigenamen setzen lassen; die Werkbank verlinkt „Zum Konto“. Beim Hinweis dort: Geteilte Links werden mit dem Konto gelöscht (API löscht sie); die Werkbank kennt keinen eigenen Aufräumweg dafür.
4. **Konto:** `abgelehnt`-Meldungen der API (Eintrag über 64 KB, Grenzen) sollte `speicher-azure.js` einmal anzeigen; die Werkbank warnt vorher selbst, nur für die 64-KB-Grenze.

## Bekannte Grenzen

- Geteilte Programme brauchen Netz (kein Offline-Cache für `/api/geteilt/*`, laut Vertrag so). Offline zeigt die Seite eine klare Meldung mit „Erneut versuchen“.
- Eingaben (`eingaben`) werden mit dem Programm gespeichert und abgeglichen, aber nicht mitgeteilt (API-Schnittstelle kennt sie nicht; Wunsch an die API-Rolle: optionales Feld `eingaben` in `POST /api/geteilt`); wer ein Programm mit `input()` teilt, sieht beim Empfänger ein leeres Eingabefeld.
- Löschen in einem Tab und gleichzeitiges Bearbeiten desselben Programms in einem zweiten Tab: der Tab mit Ungespeichertem gewinnt beim nächsten Speichern („neuester gewinnt“, wie überall).
- Rückgängig-Meldung gilt nur, solange die Seite offen ist und die Meldung steht (20 s).
- Tablet: Die Liste steht über dem Editor (höchstens drei Einträge sichtbar, dann Scrollen); ab 1100 px steht sie links und klebt unter der Kopfzeile.
- Der schwebende Knopf „Befehls-Bibliothek“ (editor.js) kann unten rechts die Ausgabe überdecken; er gehört dem Bestand.
- Nicht geprüft: echte Azure-Umgebung (nur Emulator mit Datei-Ablage), Safari/Firefox, Bildschirmleser (nur Namen, Rollen und `aria-live`-Texte per Skript geprüft), Kopieren der Zwischenablage auf iPad.
