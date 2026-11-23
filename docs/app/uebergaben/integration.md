# Übergabe Integration

Stand: 2026-11-23. Rolle Integration: Zusammenspiel aller Bereiche, rollenübergreifende Wünsche, Gesamtprüfung. Ergänzt `docs/app/ARCHITEKTUR.md`; bei Widerspruch gilt der Vertrag.

## Alles prüfen (ein Befehl)

```bash
W=/c/_Data/01_sourcecode/github/maschinenbau-vorlesung-informatik/.claude/worktrees/interactive-learning-platform-c684cf
export PATH="$W/.werkzeuge/node22:$W/.werkzeuge/node_modules/.bin:$PATH"
cd "$W/app" && npm run pruefen:alles -- --ausgabe dist-int --port 4340 --api-port 7340
#   --ohne-build   vorhandenen Build nehmen    --nur seiten,zusammenspiel   --ohne offline
```

`skripte/pruefe-alles.mjs` baut nach `app/<ausgabe>`, führt `api npm test` und `selbsttest` aus, startet den Emulator mit API (`TUTOR_DOPPEL=1`, `ABLAGE=datei`, frische Ablage `api/.daten/<ausgabe>/ablage.json`, `ANTHROPIC_API_KEY` entfernt; Log `app/.cache/emulator-<ausgabe>.log`) und ruft nacheinander auf: `pruefe-seiten`, `pruefe-navigation`, `pruefe-offline`, `pruefe-abgleich`, `pruefe-werkbank`, Tutor-Oberfläche, `pruefe-zusammenspiel`, Tutor-Angriffe (Trockenlauf). Ergebnis je Teil mit Zahl der Prüfungen und Dauer; beendet alle Prozesse (taskkill des Baums, danach alles auf den eigenen Ports), auch bei Fehlern und Strg+C; Exit-Code 1 bei Fehlern. Nach `app/dist` prüft es nur mit `--dist-erlaubt`. Dauer etwa 20 Minuten.

Einheitliche Parameter: Alle Browser-Skripte nehmen die Basis-URL als erstes Argument. `pruefe-navigation.mjs` und `api/tests/tutor-oberflaeche-lauf.js` starten ihren eigenen Dateiserver nur noch, wenn statt einer URL ein Ausgabeordner übergeben wird.

Letzter Lauf (2026-11-23, Korrekturrunde, 17,5 min, alle 11 Teile bestanden): bauen · api 215/215 · selbsttest 111/111 (inkl. `kern.test.mjs`, gebautes HTML als eigene Tests) · pruefe-seiten 114 (57 Seiten × 2 Größen, 0 Fehler; jetzt auch Explorables, Begriffe, h1, Labor-„Weiter“, 44-px-Ziele auf dem Tablet) · pruefe-navigation 38 · pruefe-offline 67/67 · pruefe-abgleich 103/103 · pruefe-werkbank 182 · Tutor-Oberfläche 36/36 · pruefe-zusammenspiel 89/89 · Tutor-Angriffe Trockenlauf 55/55 abgewehrt, 18/18 legitime hilfreich. Der Emulator startet mit `--swa-config-location app/<ausgabe>` (sonst nimmt die SWA-CLI `app/staticwebapp.config.json` und prüft nicht die gebaute CSP).

## Was geändert wurde

| Punkt | Änderung |
|---|---|
| SDK | `api/package.json`: `@anthropic-ai/sdk ^1.12.0`, Skripte `tutor:angriffe`, `tutor:oberflaeche`. `bereitstellen.ps1`: Paket prüft `node_modules/@anthropic-ai/sdk` und `daten/aufgaben.json` (mit Aufgabenzahl) und bricht sonst ab; Schritt Bauen bricht ab, wenn `aufgaben.json` fehlt. Schritt Paket real ausgeführt: 22 Dateien ohne node_modules, SDK vorhanden, 208 Aufgaben; Gegenprobe ohne `aufgaben.json` bricht ab. |
| Status | `/api/status` meldet `tutor: true`, sobald ein Modell-Client bereitsteht (Schlüssel und SDK, lokal auch `TUTOR_DOPPEL=1`; in Azure wird das Doppel ignoriert). Test in `api.test.js`. |
| kern.js | `KursApp.api`: ändernde Anfragen ohne Body senden `content-type: application/json` (Umgehungen `body: {}` in `werkbank.js`, `konto.js` entfernt); Option `keepalive`. `speicher-azure.js` sendet beim Verlassen der Seite (`visibilitychange` hidden, `pagehide`) mit `keepalive`, wenn das Bündel unter 60 KB liegt. Gäste: `/api/ich` meldet einmal „nicht angemeldet“, danach fragt der Tab beim Weiterklicken innerhalb der App nicht erneut (sessionStorage `inf-mb-app:gast`). Frisch gefragt wird immer auf `konto.html`, nach Neuladen, ohne Referrer oder von fremder Herkunft, nach Rückkehr von `/.auth/`, `/login`, `/logout`, nach Klick auf Anmelden (auch in einem anderen Tab: localStorage `inf-mb-app:anmeldung`), wenn ein anderer Tab angemeldet ist, nach 30 Minuten und mit `status(true)`. Test: `app/skripte/tests/kern.test.mjs` (läuft mit `npm run selbsttest`). |
| Fortschritt | Eine Regel in `KursApp.fortschritt` (`termin(t)` synchron, `lektion(nr)` als Promise, `offeneAufgaben`): Pflichtabschnitte ohne „freiwillig“, Aufgaben je prüfbarem Teil, Status offen/begonnen/fertig. `stand.js` und der Lektionswähler (`shell.js`) nutzen sie; vorher zeigte der Wähler „4/5“, Heute „4 von 4“. |
| Glossar | `skripte/index-bauen.mjs` exportiert `sammleGlossar()`/`glossarSammler()`; `glossar-daten.mjs` nutzt sie (doppelte Regel entfernt). Singular/Plural zusammengeführt, wenn eine Form die andere plus `-e`, `-n`, `-en`, `-s`, `-es` ist (33 Paare, 459 → 426 Begriffe), außer „Schlüssel/Schlüsseln“ (dict vs. Kryptografie). Es bleibt die kurze Form mit der Erklärung der früheren Fundstelle; alte Anker (`#g-dateien`) bleiben als leere Anker im Eintrag erhalten, die Suche nennt „Auch: Dateien“. |
| Runner | `shell.css`: Die Hinweiszeile `.ke__status` automatischer Runner erscheint weiter sofort mit dem Fokus im Editor, verschwindet aber erst 0,8 s nach seinem Verlust (`transition-behavior: allow-discrete`). Dadurch verschiebt sich die Knopfleiste während des Klicks nicht mehr. Eine erste Fassung (sichtbar bei Fokus irgendwo im Runner) verschob die Leiste beim Klick auf einen Knopf eines unfokussierten Runners nach unten; `pruefe-werkbank` deckte das auf, `pruefe-zusammenspiel` prüft jetzt beide Fälle. Beweis: V07-Lerneinheit und V01-Labor (Werkzeugkasten); ohne die Regel scheitern genau diese Prüfungen (Knopf rutscht 28 px). Safari mit Klicks über 0,8 s nicht abgedeckt. |
| PWA | `pwa.js`: kein Fehler mehr, wenn `register()` nichts liefert (blockierter Service Worker). Heute verlinkt den Installationshinweis auf `konto.html#offline` (`id="offline"` am Offline-Bereich). Service Worker fasst `/login` und `/logout` nicht mehr an (wie `/.auth/`, `/api/`). Meta-Angaben `apple-mobile-web-app-*` stehen jetzt im Kopf der Hülle. `staticwebapp.config.json`: `.mp4` als `video/mp4`. |
| CSP | `globalHeaders` mit `default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; media-src 'self' blob: https://*.blob.core.windows.net; connect-src 'self' https://*.blob.core.windows.net; manifest-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'`. Kein `unsafe-eval` nötig (Pyodide, numpy, pandas, matplotlib, Jedi, requests, sqlite3 laufen). Der Emulator liefert den Kopf auf allen Seiten; alle Prüfskripte grün. `pruefe-offline` t5 (Video fremder Herkunft) setzt die Ersatz-Herkunft an die Stelle des Storage in der CSP. |
| API lokal | Datei-Ablage: `renameSync` wird unter Windows bei EPERM/EBUSY/EACCES kurz wiederholt (gesehen als 500 auf `/api/abgleich` im Emulator). Fehlerlog nennt zusätzlich den Fehlercode (z. B. `EPERM`), nie Inhalte. |
| Doku | `ARCHITEKTUR.md`: Rolle Integration, Dateiliste Tutor um `api/tests/tutor*.js`, Fortschritt-Regel. `fundament.md`: CSP. |

## Korrekturrunde nach den drei Gesamtprüfungen (Sicherheit, Nutzerweg, Zusammenspiel)

| Befund | Änderung | Prüfung, die ihn künftig fängt |
|---|---|---|
| Geteiltes Programm läuft mit der Sitzung (blocker) | `kern.js` ersetzt `window.Worker`: jeder klassische Worker startet mit einem Vorspiel (eingebaute Funktionen vorher festgehalten): `fetch`, `XMLHttpRequest.open`, `importScripts` nur zu `assets/` und `pyodide/` derselben Herkunft (dekodiert, ohne `..`, `//`, `\`); `caches`, `indexedDB`, `Worker`, `SharedWorker`, `BroadcastChannel`, `EventSource`, `WebSocket`, `navigator.serviceWorker` entfernt. CSP: `connect-src`/`media-src` nur das Storage-Konto aus `VIDEO_BASIS` (`assets-kopieren.mjs`, ohne `VIDEO_BASIS` keines). Kein sandboxed iframe: der wäre ohne Service Worker (Offline-Python, 79 MB Pyodide) und bräuchte CORS für alles; `kurs.js` bleibt unverändert. | zusammenspiel/teilen: Angriffsprogramm (XHR auf `/api/ich`, `/api/konto/export`, `/.auth/me`, `/API/ich`, `/assets/%2e%2e/api/ich`, DELETE `/api/konto`, `importScripts`, `caches`, `indexedDB`, `Worker`) läuft beim angemeldeten Opfer: alles gesperrt, Kursdatei 200, Einträge unverändert. gast: CSP sperrt fremdes Storage-Konto. selbsttest: CSP-Ersetzung |
| Tutor-Verlauf überlebt Abmelden | `KursApp.konto.abmelden()` entfernt `inf-mb-app:tutor:*` aus dem sessionStorage (alle Abmeldewege und Konto löschen laufen darüber); `tutor.js` bindet den Verlauf an die `benutzerId` und verwirft ihn bei Wechsel oder Gast | kern.test; zusammenspiel/tutor: Konto A fragt, meldet ab, Gast sieht nichts, Konto B schickt 1 Beitrag |
| Wegwerf-Konten brauchen Tagesgrenzen auf | Optional `KURS_CODE`: Tutor erst nach `POST /api/ich/freischalten` (10 Versuche/Tag); Eingabefeld im Tutor-Panel. Mengenbremse bewusst kursweit (Kostenschutz; stand schon in BETRIEB.md) | tutor.test (403, falscher Code, Versuche, ohne Code); zusammenspiel/tutor: Freischalt-Feld, Frage bleibt, danach Antwort |
| Datenschutztext | `konto.astro`: GitHub, Anthropic (USA, Verlauf, Code, Ausgabe, Aufgabe), öffentliche Links mit Anzeigename, Videos aus Azure | Sichtprüfung |
| Redirect `//fremd` | `eigenerPfad()` in `kern.js` (führende `/` und `\` auf einen) | kern.test |
| Labor: roter „Weiter mit V0n“ | `shell.js` blendet `.app-weiter` im Labor bis zur letzten Station aus (beobachtet `hidden` der letzten `.l-task`) | pruefe-seiten (alle Labore, beide Größen) |
| Tablet-Ziele < 44 px | `shell.css`, `seiten.css`: `@media (max-width:1099px), (pointer:coarse)` | pruefe-seiten/tablet misst Hüllen-Ziele und Glossar-Buchstaben |
| Geteilt: EOFError | `eingaben` in `POST/GET /api/geteilt`, Werkbank sendet sie, `geteilt.js` setzt `data-stdin`, Kopie übernimmt sie | api.test; zusammenspiel/teilen: Programm mit `input()` läuft beim Gast |
| Tutor in der Werkbank ohne Code | `tutor.js`: Werkbank-Kontext (Code, letzte Ausgabe, Schalter) | zusammenspiel/tutor |
| Konto „Offline nutzen“ überladen | `pwa.js`: sichtbar Satz, Installieren, „Python offline bereit machen (… MB)“; Paketliste und Speicher hinter „Mehr“; Gruppen in Alltagssprache (`pyodide-holen.mjs`) | pruefe-offline (unverändert grün) |
| „liegen 1 Eintrag“ | `speicher-azure.js`: „liegt 1 Eintrag“, doppelte Frage gestrichen | Sichtprüfung |
| Suche: Stichwörter in der Unterzeile | `suche.js`: eigenes, nicht angezeigtes Feld `stichwoerter` | Sichtprüfung |
| 404-Text | „zu Heute, zum Kurs oder zur Bibliothek“ | – |
| Werkbank: fünf gleiche Knöpfe | sichtbar Neu, Teilen; Duplizieren, Herunterladen, Löschen (abgesetzt) hinter „Mehr“; Hinweis je Kontostatus | pruefe-werkbank (über „Mehr“, Menü schließt sich) |
| Labor ohne h1 | `App.astro`: nur für Screenreader sichtbare h1 aus dem Lektionstitel, wenn der Inhalt keine hat | selbsttest (jede gebaute Seite hat h1), pruefe-seiten |
| Prüfskripte ohne Explorables/Begriffe | pruefe-seiten: jedes `[data-explorable]` hat Inhalt, erster `abbr.k-begriff` ist erweitert und öffnet per Klick; `tests/e2e` im Vertrag durch `app/skripte/pruefe-*.mjs` ersetzt | – |
| Selbsttest ohne Ausgabeordner grün | gebautes HTML als eigene Tests, ohne Ausgabeordner `skip` mit Begründung | – |
| Voller localStorage mit Konto | `speicher-azure.js`: was nicht passt, bleibt im Arbeitsspeicher als offen und geht an den Server; einmal Meldung | nicht automatisch geprüft |
| Zwei Geräte am selben Programm | Meldung „Dieses Programm wurde auf einem anderen Gerät geändert“ mit „Meine Fassung wiederherstellen“ | pruefe-werkbank (zweiter Tab) |
| Ohne Service Worker „wird eingerichtet“ | `pwa.js`: Merker nach gescheiterter Registrierung beendet das Nachfragen | nicht automatisch geprüft |
| Prüfskript-Kleinigkeiten | `pruefe-abgleich` wartet auf `/.auth/me` ohne Benutzer statt `|| true`; Angriffsbericht nach `api/.daten/<ausgabe>/` | – |

Nicht geändert: V09-Labor Aufgabe `tr-4` (Vorlage überdeckt die Prüfhilfe `zeilen()`, auch die Musterlösung besteht Test 3 nicht). Liegt in `site/lektionen/v09-labor.html`, außerhalb von Vertrag Abschnitt 11. **Wunsch an den Dozenten (Freigabe nötig):** in Vorlage und Musterlösung `zeilen` in `csv_zeilen` umbenennen oder die Prüfhilfen in `site/assets/js/aufgaben.js` als `_zeilen`/`_zahlen` ablegen.

## pruefe-zusammenspiel.mjs (Teil B)

`node skripte/pruefe-zusammenspiel.mjs http://localhost:4340 [--nur gast,konto,teilen,tutor,offline,seiten]`. Szenarien: Gast (Heute → V01 abhaken, Python, „Werkbank“ am Codeblock → Labor tr-1 lösen → Heute mit Stand und „Weiter“; Wähler, Heute, Lernpfad zählen gleich; Suche; Glossar-Anker; CSP sperrt fremde Ziele), Konto (Anmelden mit Gaststand, Dialog, Stand auf dem Server; Gerät B mit derselben Kennung sieht Fortschritt und Programm; Änderung auf B erreicht A), Teilen (Anzeigename auf `konto.html`, Link, Gast öffnet, führt aus, kopiert), Tutor mit Doppel (Code mitgeschickt, Antwort, Rest sinkt, Esc, Labor bedienbar; Gast: Anmelde-Hinweis), Offline (Service Worker, Python offline bereit, offline: Lerneinheit, Python, Werkbank lokal, „warten“; `/.auth/me`, `/login`, `/logout` weder im Cache noch offline beantwortet; online nachgereicht; Abmelden zeigt den Gastzustand trotz Service Worker), alle 57 Seiten angemeldet (als Gast prüft sie `pruefe-seiten`). Toleriert werden nur die bekannten Bestandsmängel (Dateien, die schon in `site/` fehlen) und vom Browser abgebrochene Anfragen (`ERR_ABORTED`).

## Größe (Produktions-Build, mit VIDEO_BASIS und Pyodide)

Gemessen am 2026-11-23 (`VIDEO_BASIS=https://<storage>.blob.core.windows.net/video`, Pyodide lokal): **112,1 MB in 351 Dateien** (Grenze Free-Tarif 250 MB / 15.000 Dateien). Davon `pyodide/` 79,3 MB (29 Dateien), `assets/` 27,3 MB (209; Poster, Untertitel, Bilder, Vendor), Seiten 4,4 MB, `app/` 0,6 MB, `notebooks/` 0,5 MB. Ohne `VIDEO_BASIS` wären es 218,3 MB (23 Videos, 106 MB) und damit knapp unter der Grenze. Precache des Service Workers: 276 Dateien, 10,7 MB (ohne Pyodide und Videos; Pyodide 79 MB nur auf Wunsch).
`bereitstellen.ps1`, Schritt Bauen: gibt Größe und Dateizahl aus, warnt bei Videos in `dist`, bricht über 230 MB oder 14.000 Dateien ab (Funktion `Test-DistGroesse`, mit beiden Ordnern geprüft).

## Offen

- `KursSpeicher.sofort.schreiben` meldet einen vollen Speicher nicht (Bestand `site/assets/js/speicher.js`, tabu). Mit Konto geht der Stand trotzdem an den Server (siehe oben); als Gast bleibt er nur bis zum Neuladen.
- Python-Worker: Erzeugte SVG-Dateien bietet `kurs.js` als blob-Download an; öffnet man ihn bewusst in einem neuen Tab, liefe ein Skript darin unter der Herkunft der App (Bestand, tabu; sehr unwahrscheinlicher Weg).
- `KURS_CODE` muss der Besitzer setzen (BETRIEB.md, Abschnitt 5); ohne ihn bleibt das Tutor-Kontingent mit Wegwerf-Konten aufbrauchbar.
- Lerneinheiten zeigen in ihrer eigenen Fortschrittsleiste (Bestand `kurs.js`) weiter alle Abschnitte samt Deep Dive; die App-Anzeigen zählen ihn nicht.
- `pwa.js` zeichnet den Offline-Bereich auf `konto.html` beim ersten Besuch nach `serviceWorker.ready` neu; ein Klick genau in diesem Moment geht ins Leere (Prüfung wartet 1,5 s).
- Echter Tutor-Lauf (`npm run tutor:angriffe` mit Schlüssel), echte Azure-Umgebung (CSP, MIME-Typen, Storage-CORS), Safari/iPad: nicht geprüft.
