# Übergabe Konto und Abgleich

Stand: 2026-11-23. Ergänzt `docs/app/ARCHITEKTUR.md` Abschnitt 7; bei Widerspruch gilt der Vertrag.

## Was gebaut wurde

| Datei | Inhalt |
|---|---|
| `app/public/app/speicher-azure.js` | Adapter für `KursSpeicher`, Statusfeld in der Kopfzeile, Anmeldestatus an der Leiste, Dialoge (global `KursAbgleich`) |
| `app/src/pages/konto.astro`, `public/app/konto.js`, `konto.css` | Seite Konto |
| `app/skripte/pruefe-abgleich.mjs` | wiederholbare Beweise (13 Gruppen, 99 Prüfungen) |

### Wie der Kern einen Adapter anbindet (`site/assets/js/speicher.js`, unverändert)
`setzeAdapter(a)` tauscht den Adapter, ruft `a.abonnieren(fn)`, merged `a.alleSync()` in den Cache, ruft `a.alle()` und merged das Ergebnis (neuere Einträge in Cache und an Abonnenten); lokal Neueres oder dort Fehlendes wird per `a.speichern` nachgereicht. Danach ruft der Kern bei jedem Schreiben `a.speichern(eintrag)`, beim Löschen `a.loeschen(pfad)` (ohne Zeitstempel). Folgen für einen lokal-zuerst-Adapter:
- Der Kern schreibt **nicht** mehr in localStorage, sobald der Adapter gewechselt ist. Der Adapter muss denselben Schlüssel `dhbw-inf-mb:speicher:v2` selbst pflegen, sonst sehen Folgeseiten (Seitenstart liest synchron) nichts. Auch das storage-Ereignis des lokalen Adapters entfällt; der Adapter muss es selbst über `abonnieren` weitergeben (`fn({__neuLaden:true})`).
- `fn({__neuLaden:true})` ist der Weg für Fremdänderungen: Der Kern vergleicht Cache mit `alleSync()` und meldet Änderungen und Löschungen an Abonnenten. Der Adapter schreibt Serverstand zuerst in localStorage und stößt dann dieses Neuladen an.
- Direkt in `abonnieren` kann der Adapter ein Neuladen auslösen; so lässt sich der Cache vor dem Merge auf einen vorbereiteten Speicher bringen (genutzt für „Nein, getrennt halten“ und Benutzerwechsel). Ohne das würden Gaststand-Einträge aus dem Cache über das „Nachreichen“ doch hochgeladen.
- `alle()` gibt hier den lokalen Gesamtstand nach dem Abgleich zurück (nicht einen Vollabzug des Servers), sonst würde der Kern jeden lokalen Eintrag erneut hochreichen.
- Der Kern prüft bei Löschungen von außen nicht den Zeitstempel; der Adapter prüft deshalb selbst („neuester gewinnt“, Löschmarke gilt nur, wenn sie neuer ist).

### Speicher auf dem Gerät (nur dieses Gerät, nicht im Abgleich)
`inf-mb-app:abgleich` (Meta: besitzer, seit, letzter, problem, naechster, fehler, entscheidung je Benutzer), `inf-mb-app:offen:<pfad>` (offene Änderung, ein Schlüssel je Pfad, damit Tabs sich nicht überschreiben), `inf-mb-app:gast-stand` (bei „Nein“ geparkter Stand).

### Ablauf
- Schreiben: sofort lokal (gebündelt je Mikrotask), Pfad als „offen“ markiert, `POST /api/abgleich` nach 1,5 s Schreibpause (spätestens 10 s), bei Tabwechsel weg sofort. Löschung = Löschmarke mit Zeit.
- Auslöser: Start (nicht, wenn vor < 20 s abgeglichen wurde), Schreibpause, `online`, Fokus/sichtbar (höchstens alle 10 s), Takt alle 60 s nur im sichtbaren Tab und nur bei Eingabe in den letzten 10 Minuten (Kosten), nie wenn ein anderer Tab vor < 45 s abgeglichen hat. Web Locks (`navigator.locks`) lassen nur einen Tab zugleich übertragen.
- Bündelgröße: höchstens 500 Einträge und ca. 200 KB je Aufruf (Server: 256 KB Body). Einträge mit Wert über 64 KB werden nicht gesendet, verlassen „offen“ und werden einmal je Seite gemeldet (bleiben lokal). Antwortet der Server trotzdem 413, wird das Bündel halbiert und sofort erneut gesendet; ein einzelner abgelehnter Eintrag wird aufgegeben. Weitere Runden folgen, bis nichts mehr offen ist.
- Anheften mit bekanntem Besitzer: alles lokal Neuere als der letzte Abgleich (`geaendert` > `letzter`) gilt als offen (Gast-Änderungen nach „Stand hier behalten“, Seiten bei gestörtem `/api/ich`). Grenze: Löschungen in solchen Phasen sind nicht bekannt und wandern nicht mit.
- Server-Antwort: Gesendetes ist erledigt; abgelehnte Einträge verlassen „offen“, Meldung einmal; `eintraege` werden eingearbeitet (neuester gewinnt; für gerade Gesendetes gilt der Serverstand, auch bei ersetzter Zukunftszeit). `seit` = `serverzeit` der letzten Antwort.
- Fehler: 401 pausiert (Anzeige „Sitzung abgelaufen“ + Knopf, prüft bei Fokus erneut `/api/ich`); Netzfehler, 5xx: Abstand 15 s, 30 s … höchstens 5 min; 429: 15 min; offline: kein Versuch, `online`-Ereignis.
- Angemeldet bleiben (`kern.js`, seit 2026-11-28): Die Sitzung von Static Web Apps läuft nach einigen Stunden ab, die Dauer lässt sich nicht einstellen. Wer sich angemeldet und nicht selbst abgemeldet hat (`inf-mb-app:angemeldet-bleiben` = `1`), wird bei abgelaufener Sitzung still über `/.auth/login/github` neu angemeldet und landet wieder auf derselben Seite. GitHub springt ohne Rückfrage zurück, solange man dort angemeldet ist und die App schon zugelassen hat. Das passiert nur direkt nach dem Laden einer Seite oder wenn der Tab gerade wieder sichtbar wurde (20 s, noch keine Eingabe). Mitten in der Arbeit bleibt es bei „Sitzung abgelaufen“, erneuert wird dann beim nächsten Seitenaufruf. Kommt ein Versuch ohne Sitzung zurück (`inf-mb-app:erneuert` noch gesetzt), gibt die App auf (`0`), bis man sich wieder selbst anmeldet. Abmelden setzt `0`. Gilt nicht bei 5xx oder fehlender API. Grenze: Auf einem geteilten Rechner meldet die App die zuletzt angemeldete Person wieder an, solange sie bei GitHub angemeldet ist. Deshalb dort abmelden (wie bisher schon nötig).
- Mehrere Tabs: Der Kern-Speicher ist ein einziges JSON, das jeder Tab „lesen, ändern, schreiben“ kann. Gleichzeitige Schreibvorgänge zweier Tabs können einander überschreiben; der Adapter erneuert eigene Schreibvorgänge der letzten 10 s bei jedem Fremdschreiben (`heile`). Stresstest: 50 gleichzeitige Schreibvorgänge aus zwei Tabs, keiner geht verloren.
- Erster Login: Gast-Stand (ohne `inf-mb/app/*`) > 0 und noch keine Entscheidung: Dialog mit Anzahl. Ja = alles in „offen“, Server führt zusammen. Nein = Stand wird geparkt, Konto wird geladen, Abmelden mit „entfernen“ bringt ihn zurück. Entscheidung je Benutzer und Gerät gemerkt. Esc = später, diese Seite bleibt lokal.
- Anderes Konto auf demselben Gerät: Dialog (als Datei sichern / entfernen und weiter / abbrechen und abmelden); nichts wandert ins neue Konto.
- Abmelden (Konto-Seite): letzter Abgleich, Frage „Stand hier behalten / entfernen“, dann `KursApp.konto.abmelden()`.
- Konto löschen: zwei Stufen (Erklärung, dann Wort LÖSCHEN tippen; Haken „auch den Stand in diesem Browser entfernen“), `DELETE /api/konto`, Abmelden.

## Prüfen
```bash
W=/c/_Data/01_sourcecode/github/maschinenbau-vorlesung-informatik/.claude/worktrees/interactive-learning-platform-c684cf
export PATH="$W/.werkzeuge/node22:$W/.werkzeuge/node_modules/.bin:$PATH"
cd "$W/app" && KURS_AUSGABE=dist-konto npm run build
cd "$W" && ABLAGE=datei ABLAGE_DATEI="<Wurzel>/api/.daten/konto/ablage.json" BENUTZER_SALT=lokal-test swa start app/dist-konto --api-location api --port 4324 --api-port 7334   # im Hintergrund
cd "$W/app" && node skripte/pruefe-abgleich.mjs http://localhost:4324     # --nur t6,t9 ; --ohne-messung
```
(Umgebungsvariablen aus dem Prozess überschreiben `local.settings.json`; so bekommt jeder Agent seine eigene Ablage.) Der Emulator-Login liest Formularwerte erst nach `keyup`; das Skript löst es aus. Letzter Lauf: 99 von 99.

## Messung (API-Aufrufe, echte lokale API, Zeitraffer per Playwright-Uhr)
- Leerlauf, 1 Stunde, Tab sichtbar, keine Eingabe: **9** (Takt pausiert nach 10 min ohne Eingabe).
- Aktive Stunde (alle 5 min eine Eingabe, nichts geändert): **60** (1 je Minute).
- Lernsitzung 45 min (23 Änderungen, 9 Seitenwechsel, ständig aktiv): **39** (alle `POST /api/abgleich`; `/api/ich` entfällt bei bekanntem, frisch abgeglichenem Konto).
- Hintergrund-Tab: 0 Taktaufrufe. Jeder Aufruf zählt höchstens 1 Punkt der Tagesgrenze (5000).
Ein Tag mit zwei offenen aktiven Tabs bleibt unter 1500 Punkten.

## Wünsche an andere Rollen
- **PWA (`pwa.js`)**: Ist der Service Worker blockiert oder nicht registrierbar, wirft `pwa.js` „Cannot read properties of undefined (reading 'waiting')“ (Seitenfehler). Vermutlich fehlt eine Prüfung auf `registrierung`.
- **Fundament**: `KursApp.api` kennt kein `keepalive`; ein Abgleich beim Schließen des Tabs ist deshalb nicht möglich (offene Änderungen bleiben gespeichert und gehen beim nächsten Start hoch). `KursApp.konto.abmelden()` setzt vor dem Weiterleiten den Status; funktioniert wie benötigt.
- **Werkbank/Tutor**: Programme unter `inf-mb/werkbank/prog:<id>` laufen ohne weiteres durch den Abgleich; ein Programm über 64 KB wird nicht gesendet (Meldung einmal, lokal bleibt es) und blockiert den übrigen Abgleich nicht.

## Bekannte Grenzen
- Nur Chromium geprüft; Web Locks sind in Safari ab 15.4 vorhanden, ohne sie sind doppelte (harmlose) Anfragen mehrerer Tabs möglich. Nicht auf echten iPads geprüft.
- Der gemeinsame Kern-Speicher bleibt ein JSON; die Absicherung gegen überschriebene Tabs (`heile`) deckt 10 s ab, nicht jeden denkbaren Ablauf. Der Stresstest bestand; ohne `heile` wurde er nicht gegengeprüft.
- Nach „Konto löschen“ und Behalten des lokalen Stands lehnt der Server bei erneutem Anmelden 30 Tage lang ältere Einträge ab (Meldung erscheint, Stand bleibt lokal).
- Ein Gerät mit sehr falscher Uhr: Der Server ersetzt Zeiten > 5 min in der Zukunft (geprüft); eine Uhr, die nur nachgeht, kann unterliegen.
- Dialog „erster Login“ bei Esc: keine Entscheidung gespeichert, er erscheint beim nächsten Seitenaufruf wieder.
- Konfliktregel „neuester gewinnt“ je Eintrag: Listen-Einträge wie `inf-mb/v07/done` (ein Objekt) werden als Ganzes ersetzt; gleichzeitiges Abhaken verschiedener Abschnitte auf zwei Geräten innerhalb eines Abgleichsfensters kann einen Haken kosten (Kern-Datenmodell, nicht Adapter).
- Nicht geprüft: Tablet-Layout der Dialoge nur per Screenshot (1024x768), kein Handy.

- Ohne Konto ruft jede Seite einmal `GET /api/ich` auf (keine Daten); der Datenschutztext sagt das. Gäste erzeugen so einen Functions-Aufruf je Seitenaufruf.
