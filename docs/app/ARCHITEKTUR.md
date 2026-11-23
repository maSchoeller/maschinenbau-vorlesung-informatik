# Lern-App: Architektur-Vertrag

Stand: 2026-11-23. Verbindlich für alle, die an `app/`, `api/`, `infra/` und `tests/` arbeiten.
Ergänzend lesen: `KONZEPT.md`, `DESIGN.md`, `docs/ARCHITEKTUR-BACKEND.md` (älterer Entwurf; wo er diesem Dokument widerspricht, gilt dieses), `docs/app/recherche/*.md` (belegte Fakten zu Azure, Pyodide, Claude-API, Astro).

## 1. Ziel und Grundsätze

Aus der statischen Vorlesungs-Website wird eine installierbare Lern-App (PWA) für Studierende des Moduls Informatik (Maschinenbau, DHBW). Sie läuft auf Azure, funktioniert offline, kennt ein Konto (GitHub-Login) mit Abgleich über Geräte, eine Werkbank für eigene Programme mit Teilen per Link und einen Tutor-Chat, der beim Lösen hilft, aber keine Lösungen verrät.

Grundsätze:

1. **`site/` bleibt die Quelle der Inhalte.** Die 43 Lektionsseiten und Werkzeugseiten werden weiter dort gepflegt (Lektions-Sessions und Videoproduktion arbeiten unverändert; `site/` bleibt auch für sich allein über einen einfachen Dateiserver lauffähig). Die App ist eine Build-Schicht darüber: Sie nimmt den Inhalt jeder Seite unverändert und setzt ihn in die gemeinsame Hülle. Eine spätere Umstellung der Inhalte auf MDX ist ausdrücklich nicht Teil dieser Arbeit.
2. **Ohne Login bleibt alles nutzbar** (Lernen, Python, Fortschritt lokal, Werkbank lokal). Konto braucht nur: Abgleich, Teilen, Tutor.
3. **Offline zuerst.** Lesen und Schreiben gehen immer zuerst lokal; das Netz gleicht im Hintergrund ab.
4. **Weniger ist mehr.** Keine Funktion, die nicht in diesem Dokument steht. Keine Punkte, Ranglisten, Abzeichen. Details gehören hinter „Mehr“.
5. **Nur Desktop (ab 1100 px) und Tablet (768 bis 1099 px, quer und hoch).** Nicht für Handys optimieren oder testen. DESIGN.md Regel 11 („Mobil zuerst“) ist überholt; Regeln 1 bis 10 und 12 bis 15 gelten.
6. **Kein Framework im Browser.** Client-Code ist klassisches JavaScript (IIFE, globale Objekte), wie der Bestand. Astro erzeugt nur statisches HTML.
7. **Datensparsam.** Server speichert nur pseudonyme IDs, Lernstand, Programme, Anzeigenamen. Keine Namen, E-Mails, Matrikelnummern. Keine fremden Dienste im Browser (Schriften und Pyodide werden selbst gehostet).
8. Sprache der Oberfläche: Deutsch, Du-Ansprache, ohne Emojis. Icons nur als SVG aus dem Sprite `site/assets/img/icons.svg`.
9. Kosten: Azure höchstens 30 USD im Monat (Ziel: unter 5). Free-Tarif von Static Web Apps, Cosmos DB Serverless, ein kleines Storage-Konto.

## 2. Ordner und Zuständigkeiten

```
site/                    Inhalte (Bestand). Nur die in Abschnitt 11 genannten Dateien dürfen geändert werden.
app/                     Astro-Projekt (Hülle, neue Seiten, Build)
  kurs.yaml              eine Quelle für die 22 Termine (Titel, Hook, Python, Phase, Dateien, Freigabe)
  astro.config.mjs       output static, build.format 'file', outDir dist
  src/layouts/App.astro  die Hülle (Leiste, Kopfzeile, Panel, Skript-Reihenfolge)
  src/components/        Bausteine der Hülle und der neuen Seiten
  src/lib/               Build-Logik: kurs.mjs (kurs.yaml lesen), quelle.mjs (site/-HTML zerlegen), navigation.mjs
  src/pages/             neue Seiten und Durchreich-Routen für site/-Seiten
  public/app/            Client-Skripte und CSS der App (nicht gebündelt, per <script is:inline src>)
  skripte/               Node-Skripte: nach-build.mjs (ruft die folgenden), assets-kopieren, index-bauen, sw-bauen, pyodide-holen
  .cache/                heruntergeladene Fremddateien (Pyodide); nicht in Git
  dist/                  Build-Ausgabe; nicht in Git
api/                     Azure Functions (Node, Programmiermodell v4, CommonJS oder ESM laut Recherche)
  src/functions/         je Endpunktgruppe eine Datei
  src/lib/               auth.js, ablage.js (Cosmos + Datei/Speicher für lokal), pruefen.js, limits.js, antwort.js
  daten/                 beim Build erzeugt: aufgaben.json (Aufgabentexte und Musterlösungen für den Tutor); nicht in Git, nicht öffentlich
  tests/                 node:test
infra/                   main.bicep, Parameter, bereitstellen.ps1, README.md
tests/e2e/               entfällt: die Playwright-Prüfungen liegen in app/skripte/pruefe-*.mjs (Abschnitt 12)
docs/app/                dieses Dokument, recherche/, BETRIEB.md, uebergaben/
```

Dateizuständigkeit ist strikt. Wer etwas außerhalb seines Bereichs braucht, ändert es nicht selbst, sondern schreibt den Wunsch nach `docs/app/uebergaben/<rolle>.md` und meldet ihn im Abschlussbericht. Niemand committet, pusht oder wechselt den Branch; das macht die Koordination.

| Rolle | besitzt |
|---|---|
| Fundament | `app/` Grundgerüst: package.json, astro.config.mjs, `kurs.yaml`, `src/layouts/`, `src/lib/`, Durchreich-Routen, `public/app/kern.js`, `public/app/shell.js`, `public/app/shell.css`, `skripte/nach-build.mjs`, `assets-kopieren.mjs`, `index-bauen.mjs`, `staticwebapp.config.json`, neue Icons im Sprite |
| Navigation | `src/pages/index.astro` (Heute), `lernpfad.astro`, `kurs.astro` (Über den Kurs), `glossar.astro`, `src/components/` für diese Seiten, `public/app/heute.js`, `lernpfad.js`, `suche.js`, `suche.css`, `seiten.css` |
| PWA | `skripte/sw-bauen.mjs`, `sw-vorlage.js`, `pyodide-holen.mjs`, `public/app/pwa.js`, `pwa.css`, `public/manifest.webmanifest`, `public/app/icons/`, `src/pages/offline.astro`, Schriften in `site/assets/fonts/`, die in Abschnitt 11 genannten Änderungen an `site/assets/css/dhbw-base.css` und `site/assets/js/kurs.js` |
| API und Infrastruktur | `api/` (außer Tutor-Dateien), `infra/`, `docs/app/BETRIEB.md` |
| Konto und Abgleich | `public/app/speicher-azure.js`, `konto.js`, `konto.css`, `src/pages/konto.astro` |
| Werkbank | `src/pages/werkbank.astro`, `geteilt.astro`, `public/app/werkbank.js`, `geteilt.js`, `werkbank.css` |
| Tutor | `api/src/functions/tutor.js`, `api/src/lib/tutor/`, `api/tests/tutor*.js` (Tests, Angriffs- und Oberflächenlauf), `api/tests/tutor-angriffe.json`, `public/app/tutor.js`, `tutor.css` |
| Dozent | `api/src/functions/dozent.js`, `api/src/lib/dozent.js`, `gruppenbild.js`, `kursstruktur.js`, `api/tests/dozent.test.js`, `src/pages/dozent.astro`, `public/app/dozent.js`, `dozent.css`, `skripte/pruefe-dozent.mjs` (Abschnitt 14) |
| Integration | Zusammenspiel über alle Bereiche: `app/skripte/pruefe-alles.mjs`, `pruefe-zusammenspiel.mjs`, `skripte/tests/kern.test.mjs`, `docs/app/uebergaben/integration.md`; darf für das Zusammenspiel in `app/`, `api/`, `infra/`, `docs/app/` ändern |
| Tests | `tests/e2e/`, `playwright.config.*`, Wurzel-`package.json` (nur Test-Skripte) |

## 3. Build

`npm run build` in `app/` erzeugt `app/dist/`:

1. **Astro** baut die neuen Seiten und die Durchreich-Routen. URLs bleiben wie im Bestand: `index.html`, `lektionen/v07-funktionen.html`, `bibliothek.html` usw. (build.format `file`). Dadurch bleiben alle relativen Verweise in Inhalten und Skripten (`../assets/...`) gültig.
2. **Durchreichen einer `site/`-Seite** (`src/lib/quelle.mjs`): HTML lesen, zerlegen in
   - `<title>`, `<meta name="description">`, die `<link rel="stylesheet">` des Kopfs (Reihenfolge erhalten),
   - Attribute von `<body>` (`data-page`, `data-lesson`, `data-assist` …),
   - Inhalt von `<body>` **ohne** `<header class="dhbw-header …">`, ohne `<footer class="dhbw-footer …">`, ohne Sprunglink `.k-skip` (die Hülle bringt eigene mit),
   - die `<script src>`-Tags am Ende (Reihenfolge und `defer` erhalten).
   Der Inhalt wird byte-genau übernommen (Leerzeichen in `<pre>`, `<textarea>`, `<script type="text/x-python">` und `application/json` dürfen sich nicht ändern). Nur diese Umschreibungen sind erlaubt: Verweise auf `index.html#lernpfad` → `lernpfad.html`; `<source src="…/assets/video/X.mp4">` → `${VIDEO_BASIS}/X.mp4`, wenn die Umgebungsvariable `VIDEO_BASIS` gesetzt ist.
   `lektionen/v03-training.html` ist nur eine Weiterleitung und wird als solche übernommen. `werkzeuge/labor-test.html` wird nicht veröffentlicht.
3. **`skripte/nach-build.mjs`** (läuft nach Astro, ruft der Reihe nach):
   - `assets-kopieren.mjs`: `site/assets/**` → `dist/assets/**`, `site/notebooks/**` → `dist/notebooks/**`. Mit gesetztem `VIDEO_BASIS` werden `*.mp4` ausgelassen.
   - `index-bauen.mjs`: erzeugt aus `kurs.yaml` und den `site/`-Seiten
     - `dist/app/daten/kurs.json` (Termine, je Lektion Abschnitte und Aufgaben mit id, Titel, Teil, Sternen, Minuten),
     - `dist/app/daten/suche.json` (Lektionen, Abschnitte, Aufgaben, Bibliothekseinträge, Glossarbegriffe),
     - `dist/app/daten/glossar.json` (aus allen `abbr.k-begriff[data-erklaerung]`, je Begriff die erste Lektion),
     - `api/daten/aufgaben.json` (je Aufgabe: Lektion, id, Titel, Aufgabentext als Klartext, Musterlösung aus `script[data-role="solution"]`, erlaubte Konstrukte bis zu dieser Lektion) und im Feld `kurs` die Kursstruktur für das Gruppenbild (je Lektion Abschnitte, Quiz, Stationen mit prüfbaren Teilen; Abschnitt 14). Diese Datei wird nicht nach `dist/` geschrieben.
   - `pyodide-holen.mjs` (PWA): lädt die in `docs/app/recherche/03-pyodide-dateien.json` gelisteten Dateien einmalig nach `app/.cache/pyodide/` und kopiert sie nach `dist/pyodide/`.
   - `sw-bauen.mjs` (PWA): schreibt `dist/sw.js` mit Precache-Liste und Versions-Hash.
   Solange ein Skript der PWA-Rolle fehlt, überspringt `nach-build.mjs` es mit einem Hinweis.
4. Build-Version: Hash über die Ausgabe, verfügbar als `KursApp.seite.version` und im Service Worker.

`npm run dev` darf es geben, getestet wird aber immer der gebaute Stand über den SWA-Emulator: `npx @azure/static-web-apps-cli start app/dist --api-location api --port <port> --api-port <port>`.

## 4. Navigation und Hülle

### 4.1 Aufbau

```
┌──────┬───────────────────────────────────────────────────────────────┐
│ Rail │ Kopfzeile: Kontext (Lektionswähler / Reiter)   Status  Suche  │
│      ├───────────────────────────────────────────────────┬───────────┤
│      │ Inhalt (Bestandsseite oder neue Seite)            │ Panel     │
│      │                                                   │ (Tutor)   │
└──────┴───────────────────────────────────────────────────┴───────────┘
```

- **Leiste links** (`.app-rail`, 76 px, immer sichtbar, Symbol mit Text darunter): Heute · Kurs · Werkbank · Bibliothek · Klausur. Unten: Tutor · Konto. Das aktive Ziel trägt `aria-current="page"`.
- **Kopfzeile** (`.app-bar`, 56 px, klebt oben): links der Kontext des Bereichs, rechts Statusanzeige (offline, Abgleich) und die Suche (Schaltfläche „Suchen“, Tastenkürzel Strg+K).
- **Bereiche und ihre Reiter** (eine Quelle: `src/lib/navigation.mjs`):

| Bereich | Reiter in der Kopfzeile | Seiten |
|---|---|---|
| Heute | keine | `index.html` |
| Kurs | Lernpfad · Projekt · Glossar · Über den Kurs | `lernpfad.html`, `projekt.html`, `glossar.html`, `kurs.html` |
| Kurs, in einer Lektion | Lektionswähler „V07 · Zerlegung und Funktionen“ (öffnet Liste aller 22 mit Fortschritt) · Pfeile vorige/nächste Lektion · Umschalter Verstehen / Labor · „Notebook“ als Link | `lektionen/vXX-*.html` |
| Werkbank | Programme · PAP-Editor · 3D-Vorschau | `werkbank.html`, `pap-editor.html`, `werkzeuge/3d-vorschau.html` |
| Bibliothek | keine | `bibliothek.html` |
| Klausur | Klausurtrainer · Probeklausur | `klausurtrainer.html`, `probeklausur-2026-27.html` |
| Konto | keine | `konto.html`, `dozent.html` (Kursübersicht, nur über den Verweis auf der Kontoseite) |

- Pfeile vorige/nächste Lektion bleiben in derselben Ansicht (Labor → Labor der Nachbarlektion; hat die Nachbarlektion kein Labor, dann ihre Lerneinheit). Am Ende jeder Lerneinheit und jedes Labors steht ein klarer nächster Schritt (Lerneinheit → Labor → nächste Lektion); die Hülle ergänzt ihn, falls der Inhalt ihn nicht hat.
- Die Hülle merkt sich die zuletzt besuchte Seite samt Anker unter `inf-mb/app/zuletzt` (über `KursSpeicher`), damit „Heute“ und andere Geräte daran anknüpfen.
- Tablet: gleiche Leiste; das Panel liegt über dem Inhalt statt daneben.
- Tastatur: Sprunglink „Zum Inhalt“, sichtbarer Fokus, alle Ziele per Tab erreichbar, Strg+K Suche, Esc schließt Panel und Dialoge.
- Druck: Leiste, Kopfzeile, Panel ausgeblendet.

### 4.2 DOM-Vertrag der Hülle

```html
<body class="app" data-bereich="kurs" data-page="lerneinheit" data-lesson="V07" …Attribute der Bestandsseite…>
  <a class="app-skip" href="#inhalt">Zum Inhalt springen</a>
  <nav class="app-rail" aria-label="Bereiche">
    … <a data-app-ziel="heute">…  <button type="button" data-app-aktion="tutor">…  <a data-app-ziel="konto" data-app-konto>…
  </nav>
  <header class="app-bar">
    <div class="app-bar__kontext" data-app-slot="kontext">…</div>
    <div class="app-bar__status" data-app-slot="status" aria-live="polite"></div>
    <button type="button" class="app-bar__suche" data-app-aktion="suche">…</button>
  </header>
  <div class="app-flaeche">
    <div class="app-inhalt"> …Inhalt der Seite; enthält das Element mit id="inhalt"… </div>
    <aside class="app-panel" data-app-slot="panel" hidden aria-label="Tutor"></aside>
  </div>
  <div class="app-meldungen" data-app-slot="meldungen" aria-live="polite"></div>
  …Skripte…
</body>
```

Bestandsinhalte setzen teils voraus, dass der Inhalt die volle Fensterbreite hat (z. B. `--lab-w: 90vw` im Labor, `position: sticky; top`). Das Fundament passt das in `shell.css` an (Variablen überschreiben, `scroll-margin-top`, klebende Elemente unter die Kopfzeile), ohne `site/`-CSS zu ändern.

### 4.3 Skript-Reihenfolge auf jeder Seite

1. `assets/js/speicher.js` (Bestand, immer zuerst)
2. `app/kern.js` (definiert `window.KursApp`; setzt vor allem anderen `window.KURS_PYODIDE_BASIS`)
3. `app/speicher-azure.js` (hängt sich nach erfolgreichem Login an)
4. die Skripte der Bestandsseite in Originalreihenfolge
5. mit `defer`: `app/shell.js`, `app/suche.js`, `app/tutor.js`, `app/pwa.js`, `app/werkbank-knopf.js` (falls vorhanden) und seitenspezifische Skripte

Alle Verweise sind relativ zur Seite (wie im Bestand), damit die Seiten auch aus Unterordnern funktionieren. Cache-Busting über `?v=<Build-Hash>` nur für `app/*`-Dateien.

### 4.4 `window.KursApp` (app/kern.js)

```js
KursApp.seite      // { art, bereich, lektion: 'V07'|null, basis: '../'|'./', version }
KursApp.url(p)     // 'lernpfad.html' → relativ zur aktuellen Seite korrekt
KursApp.kurs()     // Promise<kurs.json> (einmal geladen, danach aus dem Speicher)
KursApp.api(pfad, opt)   // fetch auf /api/…; JSON rein/raus; setzt Kopfzeile 'X-Kurs-App: 1';
                         // wirft Error mit .status, .daten; ohne Netz .offline === true
KursApp.konto.status()   // Promise<{angemeldet, anzeigename, benutzerId, dozent}>; zwischengespeichert; offline: letzter bekannter Stand
KursApp.konto.anmelden() // leitet zu /.auth/login/github?post_login_redirect_uri=<aktuelle Seite>
KursApp.konto.abmelden()
KursApp.an(name, fn)     // Ereignisse: 'konto' (Statuswechsel), 'abgleich' ({zustand:'laeuft'|'ok'|'offen'|'fehler', offen:n}), 'netz' ({online})
KursApp.sende(name, daten)
KursApp.melde(text, {art:'info'|'ok'|'fehler', aktion:{text, fn}})   // kurze Meldung unten
KursApp.panel.oeffnen(id) / schliessen() / istOffen()
KursApp.fortschritt.lektion('V07')   // Promise<{abschnitte:{fertig,gesamt}, aufgaben:{geloest,gesamt}, status, …}>
                         // eine Zählregel für alle Anzeigen: Pflichtabschnitte (Deep Dive „freiwillig“ zählt nicht),
                         // Aufgaben je prüfbarem Teil; synchron: fortschritt.termin(terminAusKursJson)
KursApp.icon(id)         // SVG-Element aus dem Sprite
```

Fortschritt liegt wie bisher in `KursSpeicher`: `inf-mb/<lektion>/done` (Abschnitte), `…/aufg` (gelöste Aufgaben), `…/begonnen`, `…/gesehen`, `…/quiz-<id>`, `…/code:<aufgabe>`.

## 5. Seiten der App (neu)

- **Heute** (`index.html`): 1. „Weiter, wo du warst“ (ein großer Knopf zur letzten Seite). 2. Die aktuelle Lektion (erste nicht abgeschlossene bzw. nach Freigabedatum) mit ihren zwei Schritten Verstehen und Labor und deren Stand. 3. „Warm-up“: drei offene Aufgaben aus früheren, bereits begonnenen Lektionen (Wiederholung). 4. Dezent: Hinweis auf Installation und Konto, solange nicht geschehen. Kein Dashboard, keine Statistikflut.
- **Lernpfad** (`lernpfad.html`): drei Phasen, 22 Stationen mit Titel, Hook, neuem Python, Stand (offen, begonnen, fertig) und direkten Zielen Verstehen/Labor. Noch nicht freigegebene Lektionen (Feld `freigabe` in `kurs.yaml`, Datum) sind sichtbar, aber als „ab TT.MM.“ markiert und nicht gesperrt (Hinweis statt Schloss).
- **Über den Kurs** (`kurs.html`): Leitidee, Wissens-Ampel, Ablauf eines Termins, „Startklar“ (Inhalte der bisherigen Startseite `site/index.html`, redaktionell unverändert).
- **Glossar** (`glossar.html`): alle Begriffe A bis Z mit Erklärung und Link zur Lektion der ersten Einführung; Filterfeld.
- **Suche** (Dialog, Strg+K): durchsucht `suche.json`; Gruppen Lektionen, Aufgaben, Bibliothek, Glossar; Pfeiltasten und Enter.
- **Werkbank**, **Geteilt**, **Konto**, **Offline**: siehe Abschnitte 7 bis 9.
- **Kursübersicht** (`dozent.html`, nur für Dozierende): siehe Abschnitt 14.

## 6. API (`/api/*`, Azure Functions)

Allgemein:
- Antworten sind JSON (`content-type: application/json; charset=utf-8`), Fehler als `{fehler: 'kurzcode', meldung: 'deutscher Satz'}`.
- Benutzer ergibt sich nur aus dem Header `x-ms-client-principal` (Base64-JSON), nie aus Pfad oder Body. `benutzerId = HMAC-SHA256(identityProvider + ':' + userId, BENUTZER_SALT)` als Hex (32 Zeichen). Nur der Anbieter `github` wird akzeptiert.
- Ändernde Anfragen (POST, PUT, DELETE) verlangen die Kopfzeile `X-Kurs-App: 1` und `content-type: application/json` (Schutz gegen fremde Seiten), sonst 400.
- Größen: Body höchstens 256 KB; ein Eintrag höchstens 64 KB; je Benutzer höchstens 5000 Einträge und 50 geteilte Programme.
- Alle Eingaben werden geprüft (`api/src/lib/pruefen.js`). Pfade: `^inf-mb/[a-z0-9-]{1,40}/[A-Za-z0-9:._-]{1,120}$`.
- Nichts Personenbezogenes in Logs (keine userDetails, keine Inhalte).

| Methode und Route | Login | Zweck |
|---|---|---|
| `GET /api/status` | nein | `{ok, version, tutor: true|false, ablage: 'cosmos'|'datei'}` |
| `GET /api/ich` | nein | ohne Login `{angemeldet:false}`; mit Login `{angemeldet:true, benutzerId, anzeigename, neu, freigeschaltet, dozent}`; legt beim ersten Aufruf das Benutzerdokument an (Anzeigename leer) |
| `PUT /api/ich` | ja | `{anzeigename}` (2 bis 30 Zeichen, Buchstaben, Ziffern, Leerzeichen, `-_.`) |
| `GET /api/eintraege?seit=<ISO>` | ja | `{eintraege:[{pfad, wert, geaendert, geloescht}], serverzeit}`; mit `seit` nur Änderungen danach (nach Server-Schreibzeit) |
| `PUT /api/eintraege/{*pfad}` | ja | Body `{wert, geaendert}`; legt an oder überschreibt, wenn `geaendert` neuer ist; 200 `{eintrag}`; 409 `{eintrag}` mit dem neueren Serverstand |
| `DELETE /api/eintraege/{*pfad}?geaendert=<ISO>` | ja | Löschmarke (gleiche Regel „neuester gewinnt“) |
| `POST /api/abgleich` | ja | Body `{eintraege:[{pfad, wert, geaendert, geloescht?}], seit}`; wendet alle an (höchstens 500 je Aufruf) und liefert `{uebernommen, eintraege:[alles, was auf dem Server neuer ist bzw. seit 'seit' geändert wurde], serverzeit}` |
| `GET /api/konto/export` | ja | alle Daten des Benutzers als JSON (Einträge, geteilte Programme, Profil) |
| `DELETE /api/konto` | ja | löscht alle Daten des Benutzers endgültig (Einträge, geteilte Programme, Profil, Tutor-Zähler) |
| `POST /api/geteilt` | ja | Body `{titel, code, lektion?}` → `{id, erstellt}`; unveränderlicher Schnappschuss; `id` ist 10 Zeichen, zufällig, nicht erratbar; verlangt gesetzten Anzeigenamen |
| `GET /api/geteilt/{id}` | nein | `{id, titel, code, lektion, autor (Anzeigename), erstellt}` oder 404 |
| `GET /api/geteilt` | ja | eigene geteilte Programme `{eintraege:[{id, titel, erstellt}]}` |
| `DELETE /api/geteilt/{id}` | ja | nur eigene |
| `POST /api/tutor` | ja | siehe Abschnitt 10 |
| `GET /api/dozent/uebersicht` | ja, Dozent | Gruppenbild, siehe Abschnitt 14 |

**Nachtrag 2026-11-23 (nach der Sicherheitsprüfung der API; maßgeblich sind die Details in `docs/app/uebergaben/api.md`, Abschnitte 2, 3 und 7):**
- `POST /api/abgleich` liefert zusätzlich `abgelehnt: [{pfad, fehler, meldung}]`; ungültige Einträge werden einzeln abgelehnt, der Rest wird angewendet.
- Obergrenzen je Konto: 5000 lebende Einträge, 10 MB Werte, 50 geteilte Programme (atomar; 403 `grenze-erreicht`). Löschmarken zählen nicht und verfallen nach 180 Tagen.
- Mengenbremse auf allen Routen außer Tutor und Status: 429 `mengenbremse` (Client: wie offline behandeln).
- Nach „Konto löschen“ lehnt der Server 30 Tage lang ältere Stände ab (410 `konto-geloescht`), damit andere Geräte das Konto nicht wieder auffüllen. Die Tageszähler des Tutors bleiben dabei bis zum Tagesende stehen (sonst ließe sich das Kontingent durch Löschen zurücksetzen).
- Anzeigenamen mit Rollenwörtern (Prof, Dozent, Tutor, Admin, DHBW) sind gesperrt.

**Nachtrag 2026-11-23 (Integration, nach den Gesamtprüfungen):**
- `POST /api/geteilt` nimmt optional `eingaben` (Text für `input()`, höchstens 4 KB); `GET /api/geteilt/{id}` liefert `eingaben` (leer, wenn keine).
- Tutor-Freischaltung: Ist die Einstellung `KURS_CODE` gesetzt, antwortet `POST /api/tutor` ohne Freischaltung mit 403 `{fehler:'freischaltung'}`. `POST /api/ich/freischalten {code}` schaltet das Konto einmalig frei (200; falscher Code 403 `code-falsch`; höchstens 10 Versuche je Konto und Tag, sonst 429). `GET /api/ich` meldet `freigeschaltet`. Ohne `KURS_CODE` ist nichts freizuschalten. Gespeichert wird nur `freigeschaltet: true` im Profil, nie der Code.
- Python-Worker: `app/kern.js` startet jeden Worker der Seite mit einem Vorspiel, das ihm Netz nur zu `assets/` und `pyodide/` derselben Herkunft lässt (kein `/api/`, kein `/.auth/`) und Cache Storage, IndexedDB, weitere Worker und Kanäle entfernt. Grund: Geteilte Programme sind fremder Code und liefen sonst mit der Sitzung der Person.
- CSP: `connect-src` und `media-src` erlauben nur das eine Storage-Konto aus `VIDEO_BASIS` (beim Build eingesetzt, `skripte/assets-kopieren.mjs`), ohne `VIDEO_BASIS` keines.

Zeitstempel: ISO-8601 UTC. Der Server verwirft `geaendert` mehr als 5 Minuten in der Zukunft und setzt dann die Serverzeit. Bei Gleichstand bleibt der Serverstand.

Ablage (`api/src/lib/ablage.js`), eine Schnittstelle, zwei Umsetzungen:
- **Cosmos DB** (Produktion; Einstellung `COSMOS_VERBINDUNG`), Datenbank `lernapp`, Container:
  - `eintraege` (Partition `/benutzerId`; id = Pfad mit `/` ersetzt durch `|`; Felder `pfad, wert, geaendert, geschrieben (Serverzeit), geloescht`)
  - `benutzer` (Partition `/id`; `anzeigename, angelegt, letzterZugriff`; Tutor-Zähler je Tag als eigene Dokumente `tutor:<datum>` in derselben Partition wie der Benutzer oder in `zaehler`)
  - `geteilt` (Partition `/id`; `benutzerId, titel, code, lektion, autor, erstellt`)
  - `zaehler` (Partition `/id`; kursweite Tageszähler für den Tutor)
- **Datei** (lokal und Tests; `ABLAGE=datei`, JSON-Datei unter `api/.daten/`, bzw. `ABLAGE=speicher` rein im Arbeitsspeicher). Fehlt in Produktion `COSMOS_VERBINDUNG`, antwortet die API mit 503 statt still in den Arbeitsspeicher zu schreiben.

App-Einstellungen: `COSMOS_VERBINDUNG`, `BENUTZER_SALT`, `ANTHROPIC_API_KEY` (vom Besitzer gesetzt), `TUTOR_MODELL`, `TUTOR_LIMIT_NUTZER_TAG` (Standard 40), `TUTOR_LIMIT_KURS_TAG` (Standard 1500), `TUTOR_PRUEFER` (`an`/`aus`, Standard `an`), `KURS_CODE` (optional, Tutor-Freischaltung, vom Besitzer gesetzt), `DOZENT_IDS` (Kennungen der Dozierenden, vom Besitzer gesetzt; Abschnitt 14).

## 7. Konto und Abgleich (Client)

- Anmelden über GitHub (`/.auth/login/github`). Der Entra-Anbieter ist per Routenregel gesperrt.
- `konto.html`: Status (angemeldet oder nicht), Anzeigename ändern, „Arbeitsstand sichern / laden“ (Datei, wie bisher über `KursSpeicher.exportieren/importieren`), „Meine Daten herunterladen“ (`/api/konto/export`), „Konto und Daten löschen“ (mit Bestätigung), Abschnitt „Offline nutzen“ (Platzhalter, den die PWA-Rolle füllt: Element `<div data-pwa-einstellungen>`), kurzer Datenschutzhinweis (was gespeichert wird: pseudonyme Kennung, Lernstand, Programme, Anzeigename; keine Namen/E-Mails; Region EU; Tutor-Fragen gehen an Anthropic; Dozierende sehen nur Zahlen der ganzen Gruppe). Für Dozierende zusätzlich der Verweis „Kursübersicht für Dozierende“.
- `speicher-azure.js`: Adapter für `KursSpeicher` nach `site/assets/js/speicher.js`. Wichtig: Jede Seite ist ein eigener Seitenaufruf und liest beim Start synchron (`sofort.lesen`). Der Adapter muss deshalb **lokal zuerst** arbeiten: Er behält den localStorage-Stand als synchrone Quelle (`alleSync`) und gleicht zusätzlich mit dem Server ab. Schreibvorgänge gehen sofort lokal und werden gebündelt (kurze Wartezeit, z. B. 1,5 s) per `POST /api/abgleich` übertragen. Nicht Übertragenes bleibt als „offen“ markiert (eigener localStorage-Schlüssel) und wird bei Start, `online`, Tab-Fokus und alle 60 s (nur sichtbarer Tab) nachgereicht; dabei holt derselbe Aufruf Änderungen anderer Geräte (`seit`). Änderungen von außen erreichen die Seite über den Abonnenten-Mechanismus des Kerns.
- Erster Login auf einem Gerät mit lokalem Stand: Dialog „Deinen bisherigen Arbeitsstand aus diesem Browser in dein Konto übernehmen?“ mit Anzahl der Einträge. Ja: zusammenführen (neuester gewinnt). Nein: lokaler Stand bleibt lokal und wird nicht hochgeladen, der Kontostand wird geladen.
- Abmelden: Abgleich stoppen; fragen, ob der Stand auf diesem Gerät bleiben oder entfernt werden soll.
- Anzeige in der Kopfzeile (`data-app-slot="status"`): nichts, wenn alles in Ordnung ist; „Offline“ bzw. „n Änderungen warten auf Abgleich“, wenn nicht.

## 8. Werkbank und Teilen

- `werkbank.html`: links Liste der eigenen Programme (Titel, zuletzt geändert), Mitte Editor mit Ausführen (bestehender Runner: `.k-runner` mit `textarea.k-runner__code.py-editor`, `KursRunner`, `KursEditor`), darüber Titel und Aktionen: Neu · Duplizieren · Löschen · Herunterladen (.py) · Teilen. Leerer Zustand mit einem Beispiel und einem Satz Erklärung.
- Speicherung über `KursSpeicher`: `inf-mb/werkbank/prog:<id>` → `{titel, code, erstellt, geaendert, quelle?}`; Liste über `KursSpeicher.liste('inf-mb/werkbank/')`. Dadurch gleicht das Konto Programme automatisch ab. Automatisches Speichern beim Tippen (entprellt).
- „In der Werkbank öffnen“: kleiner Knopf an jedem ausführbaren Codeblock der Lektionen (per `app/werkbank-knopf.js`, ohne `kurs.js` zu ändern); legt eine Kopie als neues Programm an (Titel aus Lektion und Abschnitt) und öffnet sie.
- Teilen: verlangt Login und Anzeigenamen (sonst freundlicher Hinweis mit Weg zum Konto). `POST /api/geteilt` → Link `geteilt.html?id=<id>` wird angezeigt und kopiert. Der Schnappschuss ändert sich nicht mehr; erneutes Teilen erzeugt einen neuen Link. Eigene Links lassen sich in der Werkbank auflisten und löschen.
- `geteilt.html?id=…`: Titel, „von <Anzeigename>“, Datum, Code ausführbar, Knopf „Kopie in meine Werkbank“. Geht ohne Login. Unbekannte id: klare Meldung. Inhalte werden nur als Text eingesetzt (kein HTML).
- Hinweis beim Teilen: „Teile keine Lösungen von Trainingsaufgaben, bevor andere sie selbst versucht haben.“ (ein Satz, keine Sperre).

## 9. PWA und Offline

- Manifest (`manifest.webmanifest`): Name „Informatik Maschinenbau“, Kurzname „Informatik“, `display: standalone`, `start_url: index.html`, DHBW-Rot als Akzent, Icons 192/512 und maskable, Verknüpfungen Heute, Lernpfad, Werkbank.
- Service Worker `sw.js` (Wurzel, Geltungsbereich `/`):
  - **Precache** bei der Installation: alle HTML-Seiten, `assets/css`, `assets/js`, `assets/vendor`, `assets/data`, `assets/py`, `assets/fonts`, Bilder (webp, svg; png nur, wenn kein webp existiert), `app/**`, `notebooks` nicht.
  - **Seitenaufrufe**: aus dem Cache, im Hintergrund aktualisieren; ohne Cache und ohne Netz → `offline.html`.
  - **`/pyodide/**`**: Cache zuerst (eigener, versionierter Cache), sonst Netz und dann ablegen.
  - **Videos**: nie automatisch. Nur nach „Videos dieser Lektion offline speichern“ vollständig in den Cache; der Service Worker beantwortet Range-Anfragen aus der gespeicherten Datei (206).
  - **`/api/**`, `/.auth/**`**: immer Netz, nie Cache.
  - **Aktualisierung**: neue Version wartet; Meldung „Neue Version verfügbar – neu laden“ (`KursApp.melde` mit Aktion). Alte Caches werden beim Aktivieren entfernt.
- `pwa.js`: registriert den Service Worker, zeigt Offline-Status (`KursApp.sende('netz', …)`), füllt `<div data-pwa-einstellungen>` auf der Kontoseite: „Als App installieren“ (wo der Browser es anbietet; für iPad kurzer Hinweis „Teilen → Zum Home-Bildschirm“), „Python offline bereit machen“ (lädt die Pyodide-Gruppen mit Fortschritt und Größenangabe), „Videos dieser Lektion offline speichern“ (auf Lektionsseiten als Aktion im Abschnitt Videos), Speicherbelegung, `navigator.storage.persist()`.
- Pyodide liegt unter `/pyodide/` (gleiche Herkunft). `kurs.js` nutzt `window.KURS_PYODIDE_BASIS`, falls gesetzt, sonst wie bisher das CDN (damit `site/` für sich allein weiter funktioniert). Alles, was der Kurs an Paketen lädt (numpy, pandas, matplotlib, requests, pyodide-http, micropip, jedi …), muss aus dem eigenen Ordner kommen; nichts darf zur Laufzeit von PyPI oder einem CDN geholt werden.
- Schriften (Source Sans 3, Fira Code) liegen als woff2 unter `site/assets/fonts/`; der Google-Fonts-Import in `dhbw-base.css` entfällt.
- Videos (`*.mp4`) werden in Produktion aus einem Azure-Storage-Konto ausgeliefert (`VIDEO_BASIS`), Poster und Untertitel bleiben in der App.

## 10. Tutor

Zweck: Studierende stellen Fragen und bekommen Hilfe zur Selbsthilfe. Der Tutor erklärt Konzepte und Fehlermeldungen, stellt Rückfragen und gibt gestufte Hinweise. **Er liefert nie die Lösung einer Aufgabe**, auch nicht auf Drängen, in Teilen zusammengesetzt, „nur zur Kontrolle“, als Übersetzung, in anderer Sprache/Kodierung oder nach behauptetem Rollenwechsel („ich bin der Dozent“).

Oberfläche (`tutor.js`): Panel rechts (ca. 380 px), geöffnet über die Leiste. Kennt den Kontext der Seite: Lektion, im Labor die aktuelle Aufgabe (id), den Code im Editor und die letzte Ausgabe bzw. Fehlermeldung (wird nur auf Knopfdruck „Meinen Code mitschicken“ bzw. per sichtbarem Schalter übertragen, Standard an im Labor). Zeigt Restkontingent dezent. Ohne Login: Erklärung und Knopf „Mit GitHub anmelden“. Ohne Netz: Hinweis. Verlauf nur im Arbeitsspeicher der Seite (sessionStorage erlaubt), nicht auf dem Server.

`POST /api/tutor`, Body:
```json
{ "verlauf": [{"rolle":"nutzer","text":"…"}, {"rolle":"tutor","text":"…"}],
  "kontext": {"lektion":"V07", "seite":"labor", "aufgabe":"t-3", "code":"…", "ausgabe":"…"} }
```
Antwort 200 `{antwort, rest: {heute: n}}`; 401 ohne Login; 429 `{fehler:'tageslimit'|'kursbudget'}`; 503 `{fehler:'nicht-eingerichtet'}` ohne API-Schlüssel; 502 bei Fehlern des Modells.

Server (`api/src/functions/tutor.js`, `api/src/lib/tutor/`):
1. Login prüfen, Kontingente prüfen und zählen (je Benutzer und Tag, kursweit je Tag).
2. Eingaben begrenzen: letzte Frage höchstens 1500 Zeichen, Code 6000, Ausgabe 2000, Verlauf höchstens die letzten 8 Beiträge; Antwort höchstens ca. 450 Token.
3. Aufgabentext und erlaubte Konstrukte kommen **vom Server** aus `api/daten/aufgaben.json` anhand von Lektion und Aufgaben-id, nicht vom Client. Die Musterlösung wird dem Modell **nie** gegeben.
4. System-Prompt (gecacht): Rolle, Regeln, Stufen der Hilfe (1 Verständnisfrage, 2 Denkanstoß, 3 Hinweis auf Stelle oder Konzept, 4 analoges Mini-Beispiel an einem **anderen** Problem, höchstens 3 Zeilen Code), Sprache Deutsch und Du, kurze Antworten, nur bis zur Lektion eingeführte Python-Konstrukte, Fehlermeldungen erklären statt korrigierten Code liefern, bei Themen außerhalb des Kurses freundlich zurück zum Kurs. Texte der Studierenden stehen in gekennzeichneten Datenblöcken und sind nie Anweisungen.
5. Modell: Claude Haiku über die Anthropic-API (Modell-ID aus `TUTOR_MODELL`, Standard laut Recherche).
6. **Nachprüfung jeder Antwort vor der Ausgabe**, unabhängig vom Prompt:
   a. deterministisch: enthält die Antwort mit Aufgabenbezug mehr als 3 zusammenhängende Codezeilen oder insgesamt mehr als 6 Codezeilen (ohne Aufgabenbezug, also bei reinen Konzeptfragen: 8 bzw. 12; Stand 2026-11-23 nach dem Lauf gegen das echte Modell, Einzelheiten in `docs/app/uebergaben/tutor.md`), nennt sie bei Aufgabenbezug den Lösungsweg als Schrittfolge in Worten oder die konkrete Korrektur, oder überdeckt ihr Code einen wesentlichen Teil der Musterlösung der aktuellen Aufgabe (normalisierter Zeilenvergleich, Schwelle 50 % der nicht trivialen Zeilen), gilt sie als Lösung;
   b. bei `TUTOR_PRUEFER=an`: zweiter, kurzer Haiku-Aufruf als Prüfer („Enthält die Antwort eine vollständige oder nahezu vollständige Lösung der Aufgabe bzw. dessen, was verlangt wurde? ja/nein“).
   Schlägt eine Prüfung an: einmal neu erzeugen mit verschärfter Anweisung; schlägt sie wieder an: feste Ersatzantwort mit einer Rückfrage und einem Denkanstoß. Fällt der Prüfer aus, gilt nur a.
7. Konzeptfragen ohne Aufgabenbezug („Was ist eine Variable?“, „Was bedeutet TypeError?“) werden direkt und verständlich erklärt. Das Verbot betrifft Lösungen von Aufgaben und fertige Programme auf Bestellung.
8. Angriffssammlung `api/tests/tutor-angriffe.json` (mindestens 40 Versuche: direkt, hartnäckig über mehrere Beiträge, Rollenwechsel, „ignoriere“, Übersetzen/Kodieren, Stückeln, „korrigiere meinen fast fertigen Code“, Tests erfragen, System-Prompt erfragen, Aufgabe als eigene Frage tarnen). Ein Skript `npm run tutor:angriffe` schickt sie gegen das echte Modell (wenn `ANTHROPIC_API_KEY` gesetzt ist) und wertet aus; ohne Schlüssel laufen die Tests mit einem Modell-Doppel.

## 11. Erlaubte Änderungen in `site/`

Nur diese (alle so, dass `site/` für sich allein weiter funktioniert):
- `site/assets/css/dhbw-base.css`: Google-Fonts-`@import` ersetzen durch `@font-face` auf `../fonts/*.woff2` (PWA-Rolle).
- `site/assets/fonts/`: neue Schriftdateien samt Lizenzhinweis (PWA-Rolle).
- `site/assets/js/kurs.js`: Pyodide-Basis über `window.KURS_PYODIDE_BASIS` überschreibbar machen; sicherstellen, dass keine Laufzeit-Abhängigkeit zu fremden Hosts bleibt, wenn die Basis gesetzt ist (PWA-Rolle). Gleiches in `editor.js`, falls dort Pakete nachgeladen werden.
- `site/assets/img/icons.svg`: neue Symbole für die Hülle im vorhandenen Stil (Fundament).
Alles andere in `site/` ist tabu. Fällt ein Fehler im Bestand auf, wird er gemeldet, nicht nebenbei behoben.

## 12. Tests und Abnahme

- `api/tests`: jede Route (Erfolg, ohne Login, fremde Daten, Grenzen, Konfliktregel), mit `ABLAGE=speicher`.
- Ende-zu-Ende-Prüfungen (Playwright, Chromium, 1440×900 und 1024×768; umgesetzt als `app/skripte/pruefe-*.mjs`, gesammelt über `npm run pruefen:alles`, siehe `docs/app/uebergaben/integration.md`; einen eigenen Ordner `tests/e2e` gibt es nicht): Navigation (Leiste, Lektionswähler, vor/zurück, Suche), eine Lerneinheit und ein Labor laufen wie im Bestand (Python ausführen über lokales Pyodide, Aufgabe prüfen, Fortschritt sichtbar), Login über den Emulator, Abgleich zwischen zwei Browser-Kontexten, Werkbank speichern und teilen, geteilten Link ohne Login öffnen, Offline (nach Installation des Service Workers: Lektion neu laden, Python läuft), Tutor mit Modell-Doppel, Kursübersicht für Dozierende (`pruefe-dozent.mjs`: Gast, fremdes Konto, unter fünf Konten, Gruppenbild gegen angelegten Lernstand, Tablet).
- Bestandsprüfung (`pruefe-seiten.mjs`): alle veröffentlichten Seiten laden ohne Konsolenfehler und ohne fehlgeschlagene Anfragen; je Seite, dass die Bausteine initialisiert sind (Quiz, Explorables, Begriffs-Erklärungen, Labor-Liste), eine h1 und auf dem Tablet Ziele ab 44 px.
- Ports: Jeder Agent benutzt die ihm zugewiesenen Ports und beendet seine Prozesse am Ende.

## 13. Betrieb

- Azure: Ressourcengruppe `rg-informatik-lernapp`, Region West Europe für Static Web Apps (Functions), Cosmos DB und Storage in Germany West Central (falls für Serverless nicht verfügbar: West Europe).
- Bereitstellung automatisch per GitHub Action (`.github/workflows/lernapp.yml`): Pull Requests werden gebaut und geprüft, jeder Push auf `main` wird nach Azure ausgerollt. Infrastruktur (Bicep, Salt, Key Vault) und das Hochladen von Videos bleiben bei `infra/bereitstellen.ps1`. GitHub Pages ist abgeschaltet (2026-11-23); `site/` wird nur noch über die App veröffentlicht.
- Kostenbudget 30 USD im Monat mit Warnung per E-Mail.
- `BENUTZER_SALT` ist im Key Vault der Ressourcengruppe gesichert (Geheimnis `benutzer-salt`, RBAC, Soft-Delete 90 Tage, Purge-Schutz). Quelle der Wahrheit: Tresor vor SWA-Einstellung vor neuem Zufallswert (nur beim Erstdeployment); die Fallunterscheidung macht `infra/bereitstellen.ps1` (`infra/salt-fall.ps1`), Einzelheiten in `docs/app/BETRIEB.md`, Abschnitt 5.
- `docs/app/BETRIEB.md` beschreibt: Ressourcen, Kosten, Bereitstellen, API-Schlüssel setzen, Einstellungen, Datenexport und Löschung, Aufräumen nach dem Semester.

## 14. Kursübersicht für Dozierende (Gruppenbild)

Zweck: Vor einem Termin drei Fragen beantworten. Wie viele haben das Training der Lektion gemacht? An welcher Aufgabe hängt die Gruppe? Wie lief der Selbstcheck? Die Seite zeigt **nur Anzahlen über alle Konten, nie einzelne Personen** (Entscheidung des Dozenten vom 2026-11-23: Gruppenbild statt Kontrolle je Person).

Regeln:
- **Wer ist Dozent:** Die Einstellung `DOZENT_IDS` nennt pseudonyme Kennungen (benutzerId), getrennt durch Komma, Semikolon oder Leerzeichen. Ohne Wert ist niemand Dozent. `GET /api/ich` meldet `dozent: true|false`. Die eigene Kennung zeigt `dozent.html`, solange das Konto nicht eingetragen ist (Einrichten: `docs/app/BETRIEB.md`, Abschnitt 5).
- **Was gezählt wird:** nur Konten (Gäste haben keinen Stand auf dem Server). Gelesen werden je Lektion genau die Einträge `aufg`, `begonnen`, `done` und `quiz-<id>`; Code, Programme und alles andere bleiben unberührt.
- **Mindestgröße:** Unter 5 Konten mit Lernstand liefert die API nur die Zahl der Konten (`genug: false`, `lektionen: []`).
- **Zählregel wie in der App** (4.4, Fortschritt): Eine Station gilt als gelöst, wenn alle ihre prüfbaren Teile gelöst sind; als begonnen, wenn mindestens ein Teil gelöst oder angefangen ist, aber nicht alle gelöst sind. Stationen ohne prüfbaren Teil (Werkzeugkasten, vorgerechnetes Beispiel) kommen nicht vor.
- **Nur die Kursstruktur zählt:** Die Eimer schreibt der Browser der Studierenden. Der Server wertet sie gegen `api/daten/aufgaben.json`, Feld `kurs`, aus; unbekannte Schlüssel zählen nirgends mit und machen kein Konto „aktiv“.
- Die Antwort enthält keine Kennungen. Der Server bewahrt das Bild je Function-Instanz 30 Sekunden auf; die Abfrage ist die einzige partitionsübergreifende auf `eintraege` (feste Pfadliste, höchstens 4 Pfade je Lektion).

`GET /api/dozent/uebersicht` → 200
```json
{ "stand": "2026-11-23T18:17:02.120Z", "mindest": 5, "konten": 23, "genug": true,
  "lektionen": [ { "nr": "V07", "konten": 17,
      "abschnitte": [{"id": "warum", "n": 17}],
      "stationen":  [{"id": "t-3", "geloest": 5, "begonnen": 4}],
      "teile": {"A": {"stationen": 5, "alle": 14, "begonnen": 3}, "B": {"stationen": 8, "alle": 0, "begonnen": 11}},
      "quiz": {"konten": 12, "anteil": 0.83} } ] }
```
`konten` (oben) = Konten mit Lernstand in irgendeiner Lektion; je Lektion = dort aktive Konten. `teile.X.alle` = Konten, die alle Stationen des Teils gelöst haben, `begonnen` = angefangen, aber nicht alle. `quiz.anteil` = Mittel aus erreichten durch mögliche Punkte. 401 ohne Login; 403 `kein-dozent`; 503 `nicht-eingerichtet`, wenn die Kursstruktur fehlt.

Seite `dozent.html` (`dozent.js`): Lektionswahl (Vorauswahl aus der Adresse `#v07`, sonst die späteste Lektion, in der mindestens ein Viertel der Konten aktiv ist), dann drei Abschnitte: „Wie weit ist die Gruppe?“ (vier Kennzahlen), „Wo hängt es?“ (die drei am häufigsten begonnenen, nicht gelösten Aufgaben und die Tabelle aller Stationen mit Verweis ins Labor), „Lerneinheit“ (abgehakte Abschnitte). Titel und Reihenfolge kommen aus `kurs.json`. Die Seite ruft die API nur, wenn `/api/ich` das Konto als Dozent meldet; Gäste sehen den Anmelde-Hinweis. Kein Eintrag in der Leiste: Der Weg führt über den Verweis auf der Kontoseite, den nur Dozierende sehen.

Nicht umgesetzt (bewusst): Ansicht je Person, Verlauf über die Zeit, Auswertung je Quizfrage (gespeichert wird nur das Gesamtergebnis je Quiz), Live-Modus für die Präsenz.
