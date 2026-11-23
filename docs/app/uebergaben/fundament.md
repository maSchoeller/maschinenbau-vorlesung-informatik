# Übergabe Fundament → alle Rollen

Stand: 2026-11-22. Ergänzt `docs/app/ARCHITEKTUR.md`; bei Widerspruch gilt der Vertrag.

## Bauen und lokal starten

```bash
W=/c/_Data/01_sourcecode/github/maschinenbau-vorlesung-informatik/.claude/worktrees/interactive-learning-platform-c684cf
export PATH="$W/.werkzeuge/node22:$W/.werkzeuge/node_modules/.bin:$PATH"
cd "$W/app" && npm install          # einmalig
npm run build                        # astro build && node skripte/nach-build.mjs  -> app/dist
npm run selbsttest                   # Byte-Genauigkeit aller site/-Seiten (nach dem Build auch gegen dist)
cd "$W" && swa start app/dist --port <PORT> [--api-location api --api-port <API_PORT>]
cd "$W/app" && npm run pruefen -- http://localhost:<PORT>   # alle Seiten, 1440×900 und 1024×768
```

- `npm run pruefen` startet nichts selbst. Fotos und `bestandsmaengel.txt` landen in `app/.cache/pruefung/`.
  Ausnahme API: liefert `/api/status` 404 (Azure) bzw. 502 (Emulator ohne `--api-location`), wird genau dieser Status auf `/api/*` toleriert. Sobald die API läuft, gilt das nicht mehr.
- Nach Änderungen in `public/app/` immer neu bauen (dist ist eine Kopie; Platzhalter werden erst im Build ersetzt).
- `npm run dev` gibt es, getestet wird aber nur der gebaute Stand.
- **Parallele Agenten bauen nie nach `app/dist`**: `KURS_AUSGABE=dist-<rolle> npm run build` schreibt nach `app/dist-<rolle>` (alle Build-Skripte folgen `DIST` aus `src/lib/pfade.mjs`); Emulator dann mit `swa start app/dist-<rolle> …`. `npm run pruefen`/`selbsttest` mit derselben Variable aufrufen. Ordner am Ende löschen.

## Neue Seite in der Hülle

```astro
---
import App from '../layouts/App.astro';
---
<App pfad="werkbank.html" art="werkbank" titel="Werkbank" beschreibung="…" css={['seiten']} skripte={[]}>
  <main id="inhalt" class="app-seite">
    <h1>Werkbank</h1>
    …
  </main>
</App>
```

- `pfad`: Pfad relativ zur Wurzel (bestimmt `basis` für relative Verweise, Bereich und Reiter). Muss in `SEITEN` in `src/lib/navigation.mjs` stehen, sonst bricht der Build ab.
- `art`: Seitenkennung, landet als `data-page` am `<body>` und als `KursApp.seite.art`.
- `titel`: ohne Zusatz; die Hülle hängt „· Informatik Maschinenbau“ an.
- Der Inhalt muss ein Element mit `id="inhalt"` haben (Sprunglink). `class="app-seite"` gibt eine schlichte Lesespalte (max. 1100 px, Abstände wie Bestand). Bestandsklassen aus `kurs.css` (`k-section`, `k-btn`, `hinweis` …) sind auf jeder Seite verfügbar.
- Relative Verweise im Inhalt: In Seiten der Wurzel ohne Präfix (`lektionen/v01-…html`, `assets/…`). Aus Unterordnern `../`. Im Client immer `KursApp.url('lernpfad.html')`.
- Die Platzhalterseiten (`index`, `lernpfad`, `kurs`, `glossar`, `werkbank`, `geteilt`, `konto`, `offline`) gehören jetzt den jeweiligen Rollen und dürfen komplett ersetzt werden. `kurs.astro` zieht Leitidee, Ampel, Termin und Startklar byte-genau aus `site/index.html` (`abschnitte()` in `src/lib/quelle.mjs`) und nummeriert neu. `konto.astro` enthält `<div data-pwa-einstellungen></div>`; bitte beim Ersetzen erhalten.

## Client-Skripte und CSS einbinden (nur eigene Dateien anfassen)

Kein Rollen-Skript muss das Layout ändern. Die Hülle bindet beim Build ein, **was als Datei in `app/public/app/` existiert**:

| Art | Konvention | Einbindung |
|---|---|---|
| global, früh | `speicher-azure.js` | direkt nach `kern.js`, vor dem Bestand, ohne `defer` |
| global | `suche.js`, `tutor.js`, `pwa.js`, `werkbank-knopf.js` | jede Seite, nach dem Bestand, `defer` |
| global CSS | `shell.css`, `suche.css`, `tutor.css`, `pwa.css`, `werkbank-knopf.css` | jede Seite, im Kopf nach dem Bestands-CSS |
| je neue Seite | `app/<art>.js`, `app/<art>.css` | automatisch auf der Seite mit dieser `art` (z. B. `werkbank.js` auf `werkbank.html`, `konto.js`/`konto.css` auf `konto.html`, `heute.js` auf `index.html` mit `art="heute"`, `lernpfad.js`, `geteilt.js`) |
| weitere je Seite | Props `skripte={['name']}`, `css={['seiten']}` | nur dort; fehlt die Datei, bricht der Build ab |

- Liste der globalen Dateien: `GLOBAL_FRUEH`, `GLOBAL_DEFER` in `src/lib/huelle.mjs` (Fundament). Wer eine weitere globale Datei braucht, meldet das.
- Alle `app/*`-URLs tragen `?v=<Build-Hash>`. `/app/*.{js,css}` wird mit `max-age=1 Jahr, immutable` ausgeliefert: **App-Dateien nur mit `?v=` laden** (der Service Worker ebenso, oder mit `cache: 'reload'`). `/app/daten/*` ist `no-cache`.
- Client-Code: klassisches JS (IIFE), keine Module, kein Framework. Texte mit `textContent` setzen.

## KursApp (app/kern.js), wie umgesetzt

Alles aus Vertrag 4.4, dazu:
- `KursApp.wurzel` – absolute URL der App-Wurzel (für Worker, `new URL`).
- `KursApp.sende(name, daten)` gibt die Zahl der Empfänger zurück (0 = niemand hört zu).
- `KursApp.panel.oeffnen(id)` sendet `'panel'` mit `{id, offen: true, element}`; `element` ist `[data-app-slot="panel-inhalt"]`. Beim Schließen `{id, offen: false, element}`. Zusätzlich `panel.id()` und `panel.element()`. Der Tutor füllt `element` und kann die Überschrift `#app-panel-titel` lassen. Fokus: beim Öffnen auf `[autofocus]`, sonst erstes Eingabefeld, sonst das Panel; beim Schließen zurück auf den Auslöser. Esc und der Schließen-Knopf schließen.
- Tutor-Knopf der Leiste: öffnet/schließt `panel('tutor')`. Ist das Panel-Element danach leer, schreibt die Hülle einen Platzhaltersatz hinein: **tutor.js muss im `'panel'`-Ereignis synchron Inhalt einsetzen** (oder vorher), dann erscheint der Hinweis nicht.
- Suche: Knopf und Strg+K senden `KursApp.sende('suche', {})`. suche.js: `KursApp.an('suche', oeffnen)`. Ohne Empfänger zeigt die Hülle eine kurze Meldung.
- `konto.status()`: `GET /api/ich`; jede Fehlerantwort (401, 404, 502 …) gilt als nicht angemeldet, ohne Netz der letzte Stand aus `localStorage['inf-mb-app:konto']` (nur Gerät, nicht im Abgleich). Statuswechsel feuern `'konto'`. Die Hülle selbst ruft `konto.status()` **nicht** auf; die Konto-Rolle entscheidet, wann (z. B. konto.js bzw. speicher-azure.js).
- `'netz'` sendet kern.js bei `online`/`offline`; pwa.js darf zusätzlich senden.
- `fortschritt.lektion(nr)`: Abschnitte = `data-section` der Lerneinheit, Aufgaben = alle `[data-a][data-id]` (ohne `data-count="0"`) des Labors, wie `labor.js` zählt.
- Pyodide: `kern.js` setzt `window.KURS_PYODIDE_BASIS = KursApp.wurzel + 'pyodide/'` nur, wenn der Build `dist/pyodide/pyodide.js` vorfand (absolute URL, weil der Python-Worker aus `blob:` läuft).
- Zuletzt besucht: `shell.js` schreibt bei jedem Seitenaufruf und (entprellt) bei Hash-Wechsel `inf-mb/app/zuletzt` = `{url, titel, art, lektion, zeit}`; `url` relativ zur Wurzel inkl. Anker. Nicht auf `heute`, `offline`, `404`.

## Hülle: DOM, Klassen, Variablen

DOM wie Vertrag 4.2. Zusätzlich: `[data-app-slot="panel-inhalt"]` im Panel, `.app-weiter` (nächster Schritt am Ende von Labor-Seiten, die keinen `.k-next` haben), `body.app--panel` solange das Panel offen ist, `html.app-html`.

CSS-Variablen (`shell.css`): `--app-rail-w` 76px, `--app-bar-h` 56px, `--app-panel-w` 380px, `--app-oben` (Kopfzeile + 16px, für klebende Elemente), `--app-linie`, `--app-flaeche` (heller Grund für Hover/Felder). Farben, Abstände, Schrift: Bestand (`--red`, `--red-dark`, `--red-tint`, `--text`, `--k-muted`, `--k-line`, `--k-ok`, `--k-bad`, `--sp-1…7`, `--fs-*`, `--r-*`, `--k-measure`, `--k-section-gap`).

Klassen zum Mitbenutzen: `.app-seite` (Lesespalte), `.k-btn` / `.k-btn--ghost` / `.k-btn--small`, `.hinweis` (Bestand), `.k-ic` für Symbole. Eigene Klassen bitte mit eigenem Präfix (`wb-`, `tutor-`, `konto-`, `suche-`, `pwa-`).

Klebende Elemente in neuen Seiten: `position: sticky; top: var(--app-oben)`. Anker: `.app-inhalt [id]` hat schon `scroll-margin-top`.

Symbole: `KursApp.icon('search')` bzw. in Astro `<Icon id="…" basis={…} />` (`src/components/Icon.astro`). Neu im Sprite: `home`, `route`, `code`, `exam`, `chat`, `user`, `search`, `notebook`, `cloud-off`, `sync`. Weitere bitte beim Fundament anfragen.

## Navigation erweitern

`src/lib/navigation.mjs` ist die einzige Quelle: `BEREICHE` (Leiste, Reiter je Bereich), `UNTEN` (Tutor, Konto), `SEITEN` (Pfad → Bereich, aktiver Reiter). Neuer Reiter: Eintrag in `reiter[]` des Bereichs **und** die Seite in `SEITEN`. Lektionsseiten (`lektionen/*`) brauchen keinen Eintrag. Die Navigations-Rolle darf diese Datei für ihre Seiten ändern (bitte melden).

## Daten aus dem Build

- `app/daten/kurs.json`: `{phasen, termine:[{nr, titel, kurz, hook, python[], phase, freigabe, lerneinheit, labor, notebook, abschnitte:[{id, anker, titel}], aufgaben:[{id, titel, teil, sterne, minuten, extra, pruefbar[]}]}]}`. Pfade relativ zur Wurzel.
- `app/daten/suche.json`: `{eintraege:[{typ: lektion|abschnitt|aufgabe|bibliothek|glossar, titel, text, url, lektion}]}`.
- `app/daten/glossar.json`: `{begriffe:[{id, begriff, erklaerung, lektion, url}]}`; `id` ist der Anker auf `glossar.html` (`g-…`), die Suche verlinkt `glossar.html#<id>`.
- `app/daten/build.json`: `{version, erstellt, pyodide}`.
- `api/daten/aufgaben.json` (nicht in dist): `{aufgaben:[{lektion, seite: labor|lerneinheit, id, ids[], titel, text, loesung, erlaubt[]}]}`. Labor: `id` = Anker der Station (`t-3`), `ids` = `data-id` der prüfbaren Teile. Lerneinheit: `id` = `data-id`. `erlaubt` = Python-Konstrukte aus `kurs.yaml` bis zu dieser Lektion.

## Build-Skripte der PWA-Rolle

`skripte/nach-build.mjs` ruft `pyodide-holen.mjs` nach `index-bauen`, dann `version.mjs` (Hash über dist, ersetzt `__KURS_VERSION__`/`__KURS_PYODIDE__`, schreibt `build.json`), dann `sw-bauen.mjs`. Ein Skript wird per `import()` geladen; exportiert es `default` (Funktion, gern `async`), wird diese aufgerufen. Bitte nur `export default`, keine Arbeit auf oberster Ebene. `sw-bauen.mjs` liest die Version aus `dist/app/daten/build.json`. `dist/sw.js` und `build.json` gehen nicht in den Hash ein. Pfade: `src/lib/pfade.mjs` (`DIST`, `CACHE`, `SITE` …).

## Bekannte Einschränkungen

- **Bestandsmängel**: 80 Dateien fehlen schon in `site/` (Poster und Untertitel zu noch nicht produzierten Videos ab V07, z. B. `assets/video/v07-python-poster.png`, `…vtt`). Die Seiten fordern sie trotzdem an (404). `pruefen` meldet sie, zählt sie aber nicht.
- Laborseiten: Bestandstexte „0 von 15 Aufgaben gelöst“ im HTML sind teils veraltet; `aufgaben.js` korrigiert sie zur Laufzeit.
- Labor: `labor.js` scrollt beim Aufgabenwechsel auf die Oberkante der Arbeitsfläche minus 8 px. Damit nichts unter der Kopfzeile verschwindet, hat `.lab` in der Hülle `padding-top`/`margin-top` von ±56 px. Klausurtrainer scrollt ebenso (`klausurtrainer.js`), dort kann der Aufgabenkopf bis zu 48 px unter der Kopfzeile liegen.
- Panel neben dem Labor (Desktop): die angedockte Befehls-Bibliothek wird ausgeblendet, solange das Panel offen ist (sonst wird der Editor zu schmal). Tablet: Panel liegt über dem Inhalt, der Bibliotheks-Knopf ist dann verdeckt.
- Content-Security-Policy ist seit der Integration gesetzt (`globalHeaders` in `staticwebapp.config.json`, Begründung in `integration.md`): nur eigene Herkunft, dazu Inline-Skripte, `blob:`-Worker, `wasm-unsafe-eval` und für Videos `https://*.blob.core.windows.net`.
- `/.auth/login/aad` ist gesperrt (404). Im Emulator liefert `/api/*` ohne `--api-location` 502, nicht 404.
- `site/assets/img/icons.svg` enthält seit früher einen Kommentar, in dem versehentlich sechs Symbole und ein `</svg>` stehen (harmlos, nicht angefasst).
