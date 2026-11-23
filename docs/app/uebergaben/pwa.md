# Übergabe PWA und Offline

Stand: 2026-11-23. Ergänzt `docs/app/ARCHITEKTUR.md` (Abschnitte 9 und 11); bei Widerspruch gilt der Vertrag.

## Was gebaut wurde

| Datei | Inhalt |
|---|---|
| `site/assets/fonts/` | Source Sans 3 (400/600/700) und Fira Code (400/500), je `latin` und `latin-ext` als woff2 (aus `@fontsource/*` 5.3.x), dazu `LICENSE-*-OFL.txt` |
| `site/assets/css/dhbw-base.css` | Google-Fonts-`@import` ersetzt durch `@font-face` (`font-display: swap`, `unicode-range`) |
| `site/assets/js/kurs.js` | Pyodide-Basis über `window.KURS_PYODIDE_BASIS`; ist sie gesetzt, lädt Jedi per `loadPackage('jedi')` aus dem eigenen Ordner statt `micropip.install` (PyPI). Ohne die Variable unverändert (CDN, GitHub Pages) |
| `app/skripte/pyodide-holen.mjs` | lädt Kern und Pakete einmalig nach `app/.cache/pyodide/`, prüft sha256 gegen `pyodide-lock.json`, wiederaufnehmbar, kopiert nach `<Ausgabe>/pyodide/` und schreibt dort `gruppen.json`. `OHNE_PYODIDE=1` überspringt. Paketliste wird aus dem Lock abgeleitet (Abhängigkeiten rekursiv) |
| `app/skripte/sw-vorlage.js`, `sw-bauen.mjs` | Service Worker und sein Generator (`<Ausgabe>/sw.js`; einzeln aufrufbar: `node skripte/sw-bauen.mjs`) |
| `app/public/app/pwa.js`, `pwa.css` | Registrierung, Netz-Anzeige, Update-Hinweis, Einstellungen, Video-Speichern |
| `app/public/manifest.webmanifest`, `app/public/app/icons/`, `app/skripte/icons-bauen.mjs` | Manifest, Symbole 192/512/maskable 512/apple-touch 180 (Entwurf als SVG, per Playwright zu PNG gerendert, eingecheckt) |
| `app/src/pages/offline.astro` | Rückfallseite |
| `app/skripte/pruefe-offline.mjs` | wiederholbare Beweise (acht Gruppen, 62 Prüfungen) |

### Pyodide: geprüfte Liste
Die Recherche-Liste (28 Dateien, 79,3 MB) stimmt mit der echten `pyodide-lock.json` v0.26.4 überein. Gruppen: Kern 13 MB (5 Dateien) · Rechnen und Diagramme 58 MB (numpy, pandas, matplotlib, pillow, fonttools, kiwisolver, pytz, dateutil, six, cycler, pyparsing, packaging, matplotlib-pyodide) · Netzwerk 1,3 MB (requests, pyodide-http, urllib3, charset-normalizer, idna, certifi) · Editor-Hilfe und SQL 6,5 MB (jedi, parso, sqlite3, micropip). `paho.mqtt` und scipy gibt es nicht im Lock (nicht im Kurs lauffähig, auch online nicht).

### Service Worker (Vertrag 9)
- **Precache** (266 Dateien, **10,52 MB**): Seiten 4,33 · app 0,51 · css 0,31 · data 0,59 · fonts 0,21 · img 1,18 (webp, svg; png nur ohne webp-Zwilling) · js 1,10 · vendor 1,10 · Poster und Untertitel in `assets/video` 1,19 · py 0,01. Ohne Videos, Pyodide, Notebooks. Messung beim Build (`sw-bauen:`-Zeile) und zur Laufzeit (`KursPwa.status()`).
- Dateien unter `app/*.js|css` liegen unter `…?v=<Version>` im Cache (so verlangen sie die Seiten); Treffer sonst auch ohne Abfrage.
- Installation in Blöcken zu 8, je Datei bis 3 Versuche, nicht alles-oder-nichts. Scheitert eine kritische Datei (`index.html`, `offline.html`, `app/kern.js`, `app/shell.js`) oder mehr als 10 % der Dateien, schlägt die Installation fehl und der Browser versucht es später erneut. Kleinere Lücken stehen in `__kurs-meta.json` im Cache und werden beim Besuch nachgeladen. Unveränderte Dateien (gleicher Hash) werden aus dem alten Cache übernommen.
- Seiten: Cache zuerst, Hintergrund-Auffrischung (übernommen nur, wenn die Seite zur selben `?v=`-Version gehört), sonst Netz, sonst `offline.html` (mit `<base>`, damit Stil und Links unter jedem Pfad stimmen).
- `/pyodide/**`: Cache zuerst in `kurs-pyodide-<Version>`, bleibt über App-Versionen erhalten.
- Videos (gleiche oder fremde Herkunft, `*.mp4`): nur aus `kurs-videos-v1`; Range-Anfragen werden aus der gespeicherten Datei mit 206 beantwortet (auch `bytes=-n`, 416 bei ungültig), Content-Type wird auf `video/mp4` korrigiert, falls der Server `octet-stream` liefert. Nicht gespeichert: Weitergabe ans Netz.
- `/api/**` und `/.auth/**`: der Service Worker fasst diese Anfragen nicht an (kein `respondWith`), also nie Cache, auch nicht bei Fehlern.
- Update: kein `skipWaiting`. `pwa.js` zeigt „Neue Version verfügbar – neu laden“ (`KursApp.melde` mit Knopf); der Klick sendet `SKIP_WAITING`, bei `controllerchange` lädt die Seite neu. Beim Aktivieren werden alle `kurs-*`-Caches außer Shell dieser Version, Pyodide dieser Version und Videos gelöscht. Prüfung auf Update beim Laden und bei Sichtbarwerden des Tabs (höchstens alle 30 Minuten).

### Oberfläche (`pwa.js`)
- Kopfzeile: „Offline“-Marke im Statusfeld, `KursApp.sende('netz', …)` auch beim Start ohne Netz.
- `[data-pwa-einstellungen]` (Konto-Seite): Status des Offline-Speichers, „Als App installieren“ (`beforeinstallprompt`; iPad: Hinweis „Teilen, Zum Home-Bildschirm“), „Python offline bereit machen (79 MB)“ mit Gruppenliste, Größen, Fortschrittsbalken, Abbrechen und Wiederaufnahme (bereits gespeicherte Dateien werden übersprungen), Speicherbelegung (`storage.estimate`), „Speicher dauerhaft sichern“ (`persist`), „Offline-Daten löschen“ (zweistufig; Lernstand und Programme bleiben).
- Lerneinheiten mit `#videos`: Block „Videos dieser Lektion offline speichern“ mit Anzahl und Größe (HEAD), Fortschritt, „Wieder entfernen“. Bei fremder Herkunft (`VIDEO_BASIS`) muss der Storage CORS erlauben (`Access-Control-Allow-Origin`), sonst meldet der Knopf einen Fehler.
- Meta-Tags `apple-mobile-web-app-*` setzt `pwa.js` zur Laufzeit (das Layout bindet Manifest, `theme-color` und `apple-touch-icon` schon selbst ein, sobald die Dateien existieren).

## Prüfen

```bash
W=/c/_Data/01_sourcecode/github/maschinenbau-vorlesung-informatik/.claude/worktrees/interactive-learning-platform-c684cf
export PATH="$W/.werkzeuge/node22:$W/.werkzeuge/node_modules/.bin:$PATH"
cd "$W/app" && KURS_AUSGABE=dist-pwa npm run build
cd "$W" && swa start app/dist-pwa --api-location api --port 4322 --api-port 7332      # im Hintergrund
cd "$W/app" && KURS_AUSGABE=dist-pwa node skripte/pruefe-offline.mjs                  # alles; --nur t3,t4; --ohne-update
```
`t7` baut selbst neu (ändert vorübergehend `public/app/pwa.css`, stellt es wieder her und baut zuletzt erneut). Letzter Lauf: **62 von 62 bestanden**; zusätzlich `npm run selbsttest` (52 von 52) und `npm run pruefen` (57 Seiten × 2 Größen, 0 Fehler).

Was die Gruppen beweisen (Chromium, eigener Kontext je Test, `context.setOffline(true)` wirkt auch auf Anfragen des Service Workers, geprüft):
- t1/t2: keine einzige Anfrage an fremde Hosts (alle abgebrochen und gezählt); Schriften aus eigenen Dateien; print, Jedi (Vervollständigung `math.sq` → `sqrt`, Hilfe), numpy, pandas, matplotlib (V14-Code), requests gegen lokale JSON-Daten (V17), sqlite3 (V19).
- t3: nach einem Besuch von `index.html` und fertigem Precache laufen ohne Netz Heute, Lernpfad, Lerneinheit V07, Labor V14, Bibliothek, Glossar, Suche (Strg+K, 21 Treffer „Schleife“) und die Rückfallseite; keine fehlgeschlagene Anfrage an vorhandene Dateien.
- t4: „Python offline bereit machen“ (28 Dateien im Cache), danach ohne Netz alle Fälle aus t2.
- t5: Video speichern, ohne Netz `Range: bytes=100-199` → 206, `bytes=-50` → 206, ohne Range 200 mit `video/mp4`; `<video>` lädt und lässt sich in die Mitte spulen (Test-Chromium spielt H.264). Gleiches mit fremder Herkunft (`127.0.0.1` gegen `localhost`, CORS-Kopf per Route ergänzt). Entfernen leert den Cache.
- t6: online antwortet der Server; in keinem Cache liegt eine `/api`- oder `/.auth`-Antwort; offline scheitern sie mit Netzfehler.
- t7: neuer Build, Hinweis erscheint (Seite bleibt unverändert), nach Klick neue Version in Seite und Service Worker, alter Cache weg, neue Version offline nutzbar.
- t8: Manifest, Symbole mit den richtigen Pixelmaßen, Meta-Tags.

## Wünsche an andere Rollen

- **Fundament** (`app/staticwebapp.config.json`): `".mp4": "video/mp4"` bei `mimeTypes` ergänzen (der Emulator liefert sonst `application/octet-stream`; der Service Worker gleicht das für gespeicherte Videos aus, für gestreamte nicht). Optional `Cache-Control` für `/sw.js` bleibt `no-cache` (ist schon so).
- **Fundament**: `<meta name="apple-mobile-web-app-capable">` und `-title` gehören eigentlich in den `<head>` der Hülle; `pwa.js` setzt sie bis dahin zur Laufzeit (für iPadOS-Installation noch mit echtem Gerät zu prüfen).
- **Konto**: Abschnitt „Offline nutzen“ der Kontoseite: `pwa.js` rendert eigene Überschrift „Offline nutzen“, außer unmittelbar vor `<div data-pwa-einstellungen>` steht schon eine Überschrift mit „offline“ im Text. Das `div` bitte erhalten.
- **Betrieb** (`BETRIEB.md`): Free-Tarif von Static Web Apps begrenzt die Größe der App; Pyodide liegt mit 79 MB in `dist/pyodide/`. Videos müssen mit `VIDEO_BASIS` aus dem Storage kommen; das Storage-Konto braucht CORS für die App-Herkunft (`GET, HEAD`, Header `Range`, `Content-Type` freigeben), sonst funktioniert „Videos offline speichern“ nicht.

## Bekannte Grenzen

- Nicht auf echten iPads geprüft (Installation, 7-Tage-Regel, `persist`). Der Hinweistext folgt der Recherche; `apple-touch-icon` und Manifest sind vorhanden.
- Nur Chromium getestet (Playwright). Firefox und Safari nicht.
- Die Cross-Origin-Videoprüfung simuliert die Fremdherkunft über einen zweiten Hostnamen desselben Servers; ein echter Azure-Storage mit CORS ist nicht geprüft.
- Ob Azure Static Web Apps `.wasm` und `.whl` mit den erwarteten MIME-Typen ausliefert, wurde nur im Emulator mit der Konfiguration aus `staticwebapp.config.json` geprüft (UNBELEGT in Produktion; nach dem Deploy `curl -sI …/pyodide/pyodide.asm.wasm`).
- Seiten ohne Treffer im Cache und ohne Netz zeigen die Rückfallseite; `scipy` und andere Pakete außerhalb der Kursliste gibt es offline nicht (online ebenfalls nur, wenn sie im Lock stehen und die Dateien im Ordner liegen, d. h. nur die 28 Dateien).
- Der Precache enthält die Poster (`*.png`) und Untertitel (`*.vtt`) aller vorhandenen Videos (1,2 MB), damit Seiten offline vollständig aussehen.
- Der Service Worker braucht eine sichere Herkunft (https oder localhost); auf `http://<IP>` im Netz gibt es keinen Offline-Betrieb.
- Die Netzanzeige beruht auf `navigator.onLine` (Browserangabe), nicht auf einer Erreichbarkeitsprüfung.

## Korrekturrunde 1
- Offline-Bereich auf konto.html ohne Kartenrahmen (nur Zeilen-Trennlinien), Videoblock als schlichte Zeile ohne Linie und Grund.
- Speicherbelegung wird nach dem Python-Download neu gemessen (Ereignis `pwa-speicher`).
- Kritische Dateien des Precache jetzt auch icons.svg, dhbw-base.css, kurs.css, kurs.js, speicher.js: fehlt eine, scheitert die Installation und der Browser versucht es erneut.
- Weitere offene Tabs erhalten bei einem Wechsel des Service Workers den Hinweis "Neue Version aktiv – neu laden".
- pruefe-offline.mjs: neue Prüfungen in t4, t5, t7 und t9 (67 von 67 bestanden).
