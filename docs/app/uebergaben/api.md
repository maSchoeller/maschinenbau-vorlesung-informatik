# Übergabe: API und Infrastruktur

Stand: 2026-11-23 (Korrekturrunde 1). Für die Rollen Tutor, Konto und Abgleich, Werkbank, Fundament und Tests.

## 1. Für die Tutor-Rolle

### Neue Function registrieren

Datei `api/src/functions/tutor.js` (Programmiermodell v4, CommonJS; `package.json` lädt `src/functions/*.js` automatisch):

```js
'use strict';
const { app } = require('@azure/functions');
const { ok, json, sicher, wirf } = require('../lib/antwort');
const { verlangeBenutzer } = require('../lib/auth');
const pruefen = require('../lib/pruefen');
const limits = require('../lib/limits');

async function tutor(request, context) {
  const b = verlangeBenutzer(request);            // 401 / 403 / 503 (Salt fehlt)
  const body = await pruefen.body(request);       // X-Kurs-App, content-type, ≤ 256 KB, JSON-Objekt
  if (!process.env.ANTHROPIC_API_KEY) wirf(503, 'nicht-eingerichtet', 'Der Tutor ist noch nicht eingerichtet.');
  const { limitNutzer, limitKurs } = limits.tutorLimits();
  const k = await limits.pruefeUndZaehle({ benutzerId: b.benutzerId, art: 'tutor', limitNutzer, limitKurs });
  if (!k.erlaubt) return json(429, { fehler: k.grund, meldung: '…', rest: { heute: k.restNutzer } });
  // … Modell aufrufen; bei Modellfehler: await limits.erstatte({ benutzerId: b.benutzerId, art: 'tutor' }); wirf(502, …)
  return ok({ antwort: '…', rest: { heute: k.restNutzer } });
}

app.http('tutor', { methods: ['POST'], authLevel: 'anonymous', route: 'tutor', handler: sicher(tutor) });
module.exports = { tutor };
```

Function-Namen sind eindeutig; vergeben sind: `status, ich, eintraegeListe, eintrag, abgleich, kontoExport, kontoLoeschen, geteiltListe, geteiltEinzeln`.
Neue npm-Abhängigkeiten (z. B. `@anthropic-ai/sdk`) bitte nicht selbst in `api/package.json` eintragen, sondern hier wünschen; `fetch` von Node 22 genügt ohne Abhängigkeit.

### Hilfen (Signaturen)

`src/lib/antwort.js`
- `ok(body, kopf?)` → 200 JSON; `json(status, body, kopf?)`; `fehler(status, code, meldung, extra?)`
- `wirf(status, code, meldung, extra?)` wirft `ApiFehler` (wird von `sicher` in `{fehler, meldung, ...extra}` übersetzt)
- `sicher(handler)` umhüllt den Handler: ApiFehler → Antwort; sonst 500 `intern` (Cosmos 429/503/408 → 503 `ueberlastet`); kein Stacktrace nach außen, Log nur Fehlerart. Alle Antworten haben `cache-control: no-store`.

`src/lib/auth.js`
- `benutzerOderNull(request)` → `{benutzerId, anbieter}` oder `null` (auch bei fremdem Anbieter)
- `verlangeBenutzer(request)` → `{benutzerId, anbieter}`; wirft 401 `nicht-angemeldet`, 403 `anbieter-nicht-erlaubt`, 503 `nicht-eingerichtet` (Produktion ohne Salt)

`src/lib/pruefen.js`
- `body(request, {leerErlaubt?, maxBytes?})` → Objekt; prüft vorher `aenderndeAnfrage`; 413 `zu-gross`, 400 `json-ungueltig`
- `aenderndeAnfrage(request)` (POST/PUT/DELETE: `X-Kurs-App: 1`, `content-type: application/json`, sonst 400)
- `pfad, iso, geaendert(wert, jetztMs), seit, eintragWert, anzeigename, titel, code, lektion, geteiltId, bytes`, Konstanten `GRENZEN`

`src/lib/limits.js`
- `pruefeUndZaehle({benutzerId, art, limitNutzer, limitKurs})` → `{erlaubt, grund: null|'tageslimit'|'kursbudget', restNutzer}`. Zählt atomar Benutzer- und Kurszähler je Tag (Europe/Berlin). Bei `kursbudget` wird nichts verbraucht.
- `erstatte({benutzerId, art})` gibt eine Nutzung zurück (nie unter 0)
- `stand({benutzerId, art, limitNutzer})` → `{restNutzer}` ohne zu zählen (für die Anzeige)
- `tutorLimits()` → `{limitNutzer, limitKurs}` aus den App-Einstellungen (Standard 40/1500)
- `art`: `/^[a-z][a-z0-9-]{0,19}$/`, z. B. `'tutor'` oder `'tutor-pruefer'`

`src/lib/ablage.js` (normalerweise nicht direkt nötig): `ablage()` → fachliches Objekt (`eintragSetzen, eintraegeSeit, abgleich, benutzerHolenOderAnlegen, benutzerLesen, anzeigenameSetzen, geteiltAnlegen/Lesen/VonBenutzer/Loeschen, zaehlerAendern, zaehlerLesen, kontoExport, kontoLoeschen`). Wirft 503 `ablage-fehlt`, wenn keine Ablage eingerichtet ist.

`src/lib/umgebung.js`: `istLokal()` – lokal nur mit `ABLAGE=datei|speicher` und ohne `WEBSITE_INSTANCE_ID`.

`api/daten/aufgaben.json` erzeugt das Fundament beim Build; lesen mit `require('../../daten/aufgaben.json')` bzw. `fs` relativ zu `__dirname` (fehlende Datei abfangen).

### Tests mit Login

```js
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const h = require('./hilfe');            // setzt ABLAGE=speicher und einen Test-Salt, fängt app.http ab
h.lade(['tutor']);                       // Dateien aus src/functions ohne .js
beforeEach(() => h.neueAblage());        // frische Ablage im Arbeitsspeicher (auch Zähler)

it('ohne Login 401', async () => {
  const r = await h.aufruf('POST', '/api/tutor', { body: { verlauf: [] } });
  assert.equal(r.status, 401);
});
it('mit Login', async () => {
  const r = await h.aufruf('POST', '/api/tutor', { benutzer: 'u1', body: { verlauf: [{ rolle: 'nutzer', text: 'Was ist eine Variable?' }] } });
  // r.status, r.daten (JSON), r.headers
});
```

`aufruf(methode, url, {benutzer, body, headers, ohneAppKopf})`: `benutzer` ist `'u1'` oder `{userId, provider, userDetails}` (→ `x-ms-client-principal`); bei POST/PUT/DELETE setzt die Hilfe `X-Kurs-App: 1` und `content-type` (abschalten mit `ohneAppKopf: true`). Die Route wird über die registrierte `route` aufgelöst (prüft damit auch die Registrierung). Fremder Anbieter: `benutzer: {userId: 'x', provider: 'aad'}`. Die Tests laufen mit `npm test` in `api/` (`node --test "tests/**/*.test.js"`, auch `tutor*.test.js`).

## 2. Für Konto und Abgleich (speicher-azure.js)

Stand nach Korrekturrunde 1 (2026-11-23). **Geändert gegenüber der ersten Fassung:** Format von `abgelehnt`, Sicherheitsabstand 5 s, neue Fehler 410 und 429, Grenze 10 MB.

- Pfade in der URL nicht als Ganzes kodieren: `/api/eintraege/inf-mb/v07/code:t-3` (Schrägstriche bleiben). `%XX` wird serverseitig dekodiert, ist also auch erlaubt (z. B. `encodeURIComponent` je Segment).
- `POST /api/abgleich` → `{uebernommen: <Anzahl>, eintraege: [...], serverzeit, abgelehnt?: [{pfad, fehler, meldung}]}`.
  - Alles Gesendete ist danach erledigt: übernommen (zählt in `uebernommen`; auch Gleichstand mit gleichem Inhalt), oder der Server ist neuer bzw. gleich alt mit anderem Inhalt – dann steht sein Stand in `eintraege` –, oder es steht in `abgelehnt`.
  - **`abgelehnt`** (neu als Liste von Objekten): Einträge, die der Server nicht speichert. Die übrigen der Anfrage werden trotzdem angewendet. `fehler` ist einer von `pfad-ungueltig`, `zeit-ungueltig`, `eintrag-ungueltig`, `wert-fehlt`, `wert-ungueltig`, `eintrag-zu-gross` (über 64 KB), `grenze-erreicht` (5000 lebende Einträge oder 10 MB je Konto), `konto-geloescht` (Stand von vor einer Konto-Löschung). `pfad` ist `null`, wenn er fehlte oder keine Zeichenkette war. **Bitte abgelehnte Einträge aus „offen“ nehmen** (sonst werden sie ewig wiederholt) und `meldung` einmal anzeigen; der lokale Stand bleibt.
  - 400 gibt es nur noch für die Form der Anfrage selbst (kein JSON-Objekt, `eintraege` keine Liste, `seit` ungültig), 413 `zu-viele` über 500 Einträge, 413 `zu-gross` über 256 KB Body.
  - Doppelte Pfade in einer Anfrage: der neueste gilt.
  - Ohne `seit` liefert `eintraege` den ganzen Serverstand (außer dem gerade Übernommenen) – für den ersten Abgleich. Das Konto ist auf 10 MB Werte begrenzt, die Antwort also auch.
  - `geaendert` mehr als 5 Minuten in der Zukunft ersetzt der Server durch seine Zeit; der Eintrag kommt dann **mit dem gespeicherten Zeitstempel in `eintraege` zurück** (lokal übernehmen, sonst hält das Gerät mit falscher Uhr seinen Stand für neuer).
- `serverzeit` liegt 5 Sekunden zurück. Gefiltert wird nach der Commit-Zeit der Datenbank, langsame Schreiber gehen also nicht verloren. Beim nächsten Aufruf als `seit` mitschicken; Doppelte sind möglich und harmlos (gleicher Zeitstempel).
- Löschmarken kommen als `{pfad, geaendert, geloescht: true}` ohne `wert`. Löschen eines Pfads, den der Server nicht kennt, legt keine Marke an (Antwort trotzdem 200 bzw. „übernommen“). Löschmarken zählen nicht zur Grenze und verfallen nach 180 Tagen.
- PUT: 200 `{eintrag}` bzw. 409 `{fehler:'server-neuer', eintrag}`; 403 `grenze-erreicht` (5000 Einträge oder 10 MB); 410 `konto-geloescht`.
- **429 `mengenbremse`** auf allen Routen außer Tutor und Status: Tagesgrenze des Kontos (5000 Punkte; eine Anfrage oder angefangene 16 KB = 1 Punkt) oder des Kurses erreicht. Wie offline behandeln: lokal weiterarbeiten, „offen“ behalten, nicht in kurzen Abständen wiederholen (frühestens beim nächsten 60-s-Takt, besser erst nach Tageswechsel oder Neuladen).
- **Konto löschen:** Danach lehnt der Server 30 Tage lang Einträge ab, deren `geaendert` vor der Löschung liegt (`konto-geloescht`). Andere, noch angemeldete Geräte füllen das Konto so nicht wieder auf. Bitte auf der Konto-Seite einen Satz ergänzen: „Melde dich auch auf deinen anderen Geräten ab und entferne dort den Stand.“
- `GET /api/ich`: `{angemeldet:false}` auch bei fremdem Anbieter (Entra); `neu: true` nur beim allerersten Aufruf.
- `PUT /api/ich {anzeigename}` → `{angemeldet, benutzerId, anzeigename}`; 400 `anzeigename-ungueltig`; 400 `anzeigename-reserviert` (Wörter wie Prof, Dozent, Tutor, Admin, DHBW als ganzes Wort). Unicode-Formatzeichen (Bidi) werden abgelehnt.
- `DELETE /api/konto` braucht ebenfalls `content-type: application/json` (Body darf leer sein) → `{geloescht:true, eintraege:n, geteilt:n}`. Die Tutor-Tageszähler bleiben dabei bis zu 8 Tage stehen (sonst ließe sich das Kontingent durch Löschen erneuern); bitte im Datenschutzhinweis nennen: „Nach dem Löschen bleiben nur Zähler ohne Inhalt, die nach höchstens 30 Tagen verfallen.“

## 3. Für die Werkbank

- `POST /api/geteilt {titel, code, eingaben?, lektion?}` → 201 `{id, erstellt}` (`eingaben`: Text für `input()`, höchstens 4 KB, kommt bei `GET /api/geteilt/{id}` zurück); 409 `anzeigename-fehlt` (freundlicher Hinweis mit Weg zum Konto); 403 `grenze-erreicht` (50); 400/413 bei Titel/Code (Titel ohne Zeilenumbrüche und ohne Unicode-Formatzeichen); 429 `mengenbremse`.
- `GET /api/geteilt` → `{eintraege:[{id, titel, lektion, erstellt}]}` (neueste zuerst).
- `GET /api/geteilt/{id}` ohne Login → `{id, titel, code, lektion, autor, erstellt}`; unbekannt oder ungültiges Format → 404 `nicht-gefunden`.
- `DELETE /api/geteilt/{id}` → 200; fremd → 403 `nicht-eigen`; unbekannt → 404.
- Anzeigenamen sind nicht geprüft (nur Rollenwörter gesperrt). Auf `geteilt.html` den Autor deshalb neutral zeigen („geteilt von <Name>“), nicht als Bestätigung.

## 4. Wünsche an das Fundament

- `app/staticwebapp.config.json` (wird nach `dist/` kopiert):
  - `"platform": { "apiRuntime": "node:22" }` (sonst wählt SWA eine Standardlaufzeit; beim GitHub-Workflow mit `skip_api_build` Pflicht).
  - Route `{ "route": "/.auth/login/aad", "statusCode": 404 }` (Entra sperren).
  - Keine `allowedRoles` auf `/api/*`: `/api/status`, `/api/ich` und `GET /api/geteilt/{id}` müssen ohne Login gehen; die API prüft selbst.
  - Falls eine Content-Security-Policy gesetzt wird: `media-src` und `connect-src` müssen `https://<storage>.blob.core.windows.net` erlauben (Videos, Offline-Speichern im Service Worker).
- `KursApp.api` sollte bei DELETE ebenfalls `content-type: application/json` und `X-Kurs-App: 1` senden (die API verlangt beides bei allen ändernden Anfragen).
- Der Build schreibt `api/daten/aufgaben.json`; `infra/bereitstellen.ps1` (Schritt Bauen) warnt, wenn die Datei fehlt.

## 5. Für die Tests (E2E)

- Lokal mit dem Emulator: `api/local.settings.json` aus `api/local.settings.beispiel.json` kopieren (`ABLAGE=datei` speichert unter `api/.daten/ablage.json`, `ABLAGE=speicher` nur im Arbeitsspeicher).
- Rauchtest gegen eine beliebige Adresse: `node api/skripte/rauchtest.mjs <basis-url>`.

## 6. Wünsche an die PWA-Rolle

- **Precache je Datei versionieren** (Hash je Datei in der Precache-Liste, beim Aktivieren nur Geänderte neu holen), statt bei jeder neuen Build-Version alles neu zu laden. Grund: SWA Free hat 100 GB Bandbreite im Monat ohne Zukauf; ein vollständiger Neuabruf kostet bei 200 Geräten ca. 5 GB je Bereitstellung (Rechnung in `BETRIEB.md`, Abschnitt 2). Alternativ beim Neuladen `cache: 'no-cache'` nutzen, damit die SWA mit 304 antwortet (ETag), wo sich nichts geändert hat.
- Pyodide nur auf Wunsch („Python offline bereit machen“) bzw. beim ersten Ausführen laden, nicht bei der Installation (83 MB je Gerät).

## 7. Korrekturrunde 1: was sich in der API geändert hat (für alle)

- Obergrenzen (5000 lebende Einträge, 10 MB Werte, 50 geteilte Programme) werden über einen Kontozähler atomar reserviert; parallele Anfragen umgehen sie nicht mehr. Doppeltes gleichzeitiges Löschen eines geteilten Programms gibt nur einen Platz frei.
- Mengenbremse für alle Nicht-Tutor-Routen (`limits.gebremst`), 429 `mengenbremse`. Die Tutor-Rolle braucht sie nicht (eigene Kontingente).
- `seit` filtert nach der Commit-Zeit (`_ts`), Cosmos-Wiederholungen bei 429 höchstens ca. 8 s, danach 503 `ueberlastet`.
- Testdoppel `tests/cosmos-doppel.js` kann Verzögerung und Fehler einspielen (`doppel.stoerung`); siehe `tests/robustheit.test.js`.
