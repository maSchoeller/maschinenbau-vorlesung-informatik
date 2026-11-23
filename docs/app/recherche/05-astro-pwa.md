# Recherche 05: Astro als Generator über bestehenden HTML-Seiten, PWA und Service Worker

Stand: 2026-11-22. Quellen sind im Text verlinkt. Nicht belegt ist mit **UNBELEGT** markiert.

## 1. Astro-Version und Node

- Aktuelle Version laut `npm view astro version`: **7.4.13**. Engines laut npm für 7.4.13: `node >=22.23.4`, `npm >=9.6.5`. Quelle: npm-Registry (`npm view astro engines`).
- Installationsseite: „`v22.23.4` or higher. Odd-numbered versions like `v23` are not supported.“ Quelle: https://docs.astro.build/en/install-and-setup/
- Ergebnis: **Node v26.5.1 ist gerade-nummeriert und liegt über 22.23.4, also laut Doku unterstützt.** Ein praktischer Build mit Node 26 wurde nicht getestet: **UNBELEGT (Praxistest offen)**.

Minimal-Setup (ohne UI-Framework):

```sh
npm init -y
npm install --save-exact astro@7.4.13
```

`package.json` (Auszug):

```json
{
  "name": "lernplattform-site",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && node scripts/build-sw.mjs"
  },
  "dependencies": {
    "astro": "7.4.13"
  }
}
```

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'ignore',        // Default laut Doku: 'ignore'
  build: {
    format: 'file',               // erzeugt lektionen/v07-funktionen.html statt Ordner
  },
  outDir: './dist',               // Default laut Doku: "./dist"
  publicDir: './public-leer',     // siehe Abschnitt 2
  compressHTML: false,            // Default 'jsx'; false erhält Leerzeichen/Einrückung
});
```

## 2. Statische Ausgabe mit unveränderten URLs

Belegt (https://docs.astro.build/en/reference/configuration-reference/):

- `build.format`: `'file' | 'directory' | 'preserve'`, Default `'directory'`. `'file'` erzeugt `/about.html`. `'preserve'` spiegelt das Quell-Layout.
- `trailingSlash`: `'always' | 'never' | 'ignore'`, Default `'ignore'`.
- `outDir`: Default `"./dist"`, absolut oder relativ zur Projektwurzel.
- `compressHTML`: `boolean | "jsx"`, Default `'jsx'`. `false` „disables HTML compression and preserves all whitespace“.
- `publicDir`: Default `"./public"`, absolut oder relativ zur Projektwurzel. Dateien werden unverändert nach `/` kopiert.

Offen:

- **UNBELEGT**: Ob `publicDir` außerhalb der Projektwurzel liegen darf. Die Doku sagt dazu nichts.
- **Achtung Fehler im Plan**: Der Inhalt von `publicDir` wird unter `/` ausgeliefert. Zeigt `publicDir` auf `../site/assets`, landet `js/kurs.js` unter `/js/kurs.js` und nicht unter `/assets/js/kurs.js`. Zeigt `publicDir` auf `../site`, werden alle HTML-Seiten mitkopiert und kollidieren mit den Routen.
- **Empfehlung (robust, ohne Unbekanntes)**: `publicDir` auf einen leeren Ordner setzen und die Assets per Build-Schritt kopieren:

```js
// scripts/copy-assets.mjs  (läuft nach astro build)
import { cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const src = fileURLToPath(new URL('../../site/assets/', import.meta.url));
const dst = fileURLToPath(new URL('../dist/assets/', import.meta.url));
await cp(src, dst, { recursive: true });
```

Alternative: Vite-Plugin oder Astro-Integration mit `astro:build:done`-Hook. Beides nicht geprüft: **UNBELEGT**. Der Kopierschritt ist der einfachste Weg.

Zur Prüfung, ob Astro Seiten unverändert baut: `npm run build` und `ls dist/lektionen/` (erwartet `v07-funktionen.html`).

## 3. Dynamische Routen aus externen HTML-Dateien

`getStaticPaths` läuft zur Build-Zeit. Die Route muss alle Parameter in jedem Objekt liefern. Format: `{ params, props }`. Quelle: https://docs.astro.build/en/guides/routing/

Beispiel `src/pages/lektionen/[slug].astro`:

```astro
---
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';   // oder cheerio, siehe unten
import Lektion from '../../layouts/Lektion.astro';

// Pfad relativ zu dieser Datei anpassen (Projektlayout abhängig)
const DIR = fileURLToPath(new URL('../../../../site/lektionen/', import.meta.url));

export function getStaticPaths() {
  return readdirSync(DIR)
    .filter((f) => f.endsWith('.html'))
    .map((f) => {
      const html = readFileSync(DIR + f, 'utf8');
      const body = parse(html).querySelector('body')?.innerHTML ?? '';
      return { params: { slug: f.replace(/\.html$/, '') }, props: { body } };
    });
}

const { body } = Astro.props;
---
<Lektion>
  <Fragment set:html={body} />
</Lektion>
```

Hinweise:

- `set:html` fügt Rohtext ein, ohne Escaping. Das ist hier gewollt, weil die Quelle eigene HTML-Dateien sind. Fremde Inhalte dürfen so nicht eingesetzt werden: **Gefahr XSS bei fremden Quellen**.
- `<script>`-Tags im `set:html`-String bleiben im statischen Ergebnis erhalten, weil die Ausgabe fertiges HTML ist. Astro verarbeitet sie dort nicht. **UNBELEGT** (aus allgemeiner Kenntnis, nicht in der Doku geprüft). Praxistest nötig.
- Der Pfad `../../../../site` ist abhängig davon, wo das Astro-Projekt im Worktree liegt. Vorher prüfen.

Parser-Vergleich (wichtig für `<pre>` und `<script type="text/x-python">`):

- Quellen zu Parser-Whitespace und Script-Erhalt: **nicht gefunden (UNBELEGT)**. Die Entscheidung muss durch einen Test fallen.
- Testskript (in Scratch-Ordner, nicht im Projekt):

```sh
npm install node-html-parser@9.0.7 cheerio@1.2.0
```

```js
// test-parser.mjs: prüft, ob <pre> und Scripts unverändert bleiben
import { parse } from 'node-html-parser';
import * as cheerio from 'cheerio';
import { readFileSync } from 'node:fs';
const html = readFileSync(process.argv[2], 'utf8');
const a = parse(html).querySelector('body').innerHTML;
const b = cheerio.load(html)('body').html();
const pre = (s) => (s.match(/<pre[\s\S]*?<\/pre>/g) || []).join('\n');
const scr = (s) => (s.match(/<script[\s\S]*?<\/script>/g) || []).join('\n');
console.log('pre identisch (node-html-parser):', pre(a) === pre(html));
console.log('pre identisch (cheerio):', pre(b) === pre(html));
console.log('script identisch (node-html-parser):', scr(a) === scr(html));
console.log('script identisch (cheerio):', scr(b) === scr(html));
```

Aufruf: `node test-parser.mjs ../site/lektionen/v07-funktionen.html`. Wenn ein Parser die Ausgabe verändert, ist der andere die Wahl. Die Versionen sind per npm geprüft: node-html-parser **9.0.7**, cheerio **1.2.0**.

## 4. Klassische Client-Skripte einbinden

- Astro verarbeitet standardmäßig `<script>`-Tags ohne Attribute außer `src`. Es bündelt Imports, macht sie zu `type="module"`, entdoppelt und inlined kleine Skripte. Quelle: https://docs.astro.build/en/guides/client-side-scripts/
- `is:inline` deaktiviert diese Verarbeitung. Der Inhalt wird „rendered into the HTML exactly as written“. Mit `src` werden Bundling und Optimierung übergangen. Quelle: dieselbe Seite.
- Empfehlung: Skripte nach `public/` bzw. `publicDir` kopieren und im Layout mit `is:inline` einbinden. Keine Umbenennung, globale Objekte wie `window.KursSpeicher` bleiben erhalten.

```astro
<!-- Layout: src/layouts/Lektion.astro -->
<script is:inline src={`/js/kurs.js?v=${buildId}`}></script>
```

Die Skriptreihenfolge muss erhalten bleiben (klassische Skripte, keine `defer`-Module nötig).

### Cache-Busting

- Astro versioniert `public/`-Dateien nicht automatisch. Das ist aus der Public-Doku ablesbar (`public/` wird „untouched“ kopiert): https://docs.astro.build/en/guides/imports/
- Strategie: Build-ID in eine Datei schreiben, die das Layout importiert.

```js
// scripts/build-id.mjs (vor astro build)
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const id = execSync('git rev-parse --short HEAD').toString().trim() + '-' + Date.now().toString(36);
writeFileSync('src/build-id.json', JSON.stringify({ id }));
```

Im Layout: `import { id as buildId } from '../build-id.json';` (JSON-Import ist Vite-Standard, **UNBELEGT** für diese Astro-Version, Praxistest nötig).

## 5. Service Worker ohne Framework

Empfehlung: **handgeschrieben**. Die Site ist klein, Workbox würde eine zusätzliche Build-Abhängigkeit bringen. `workbox-build` ist als Option vorhanden (npm: **7.4.1**), aber nicht nötig. Quelle für Workbox-Optionen nicht geprüft: **UNBELEGT** für Details.

### Precache-Manifest per Node-Skript

```js
// scripts/build-sw.mjs (läuft nach astro build)
import { readdirSync, readFileSync, statSync, writeFileSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative, sep } from 'node:path';

const DIST = 'dist';
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

const files = walk(DIST)
  .filter((p) => !p.endsWith('sw.js'))
  .map((p) => {
    const url = '/' + relative(DIST, p).split(sep).join('/');
    const hash = createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 12);
    return { url, rev: hash };
  });

const version = createHash('sha256').update(files.map((f) => f.url + f.rev).join('|')).digest('hex').slice(0, 12);
const template = readFileSync('sw/sw-template.js', 'utf8');
writeFileSync(join(DIST, 'sw.js'),
  template
    .replace('__VERSION__', version)
    .replace('__PRECACHE__', JSON.stringify(files)));
```

Vorlage `sw/sw-template.js` enthält `const VERSION = '__VERSION__';` und `const PRECACHE = __PRECACHE__;`.

### Strategien

| Anfrage | Strategie | Hinweis |
|---|---|---|
| Shell, Seiten, JS/CSS (Precache) | Precache bei `install` | Versionsname enthält Hash |
| Navigation (HTML-Seiten) | stale-while-revalidate | Offline-Fallback auf `index.html` |
| Versionierte Assets (`?v=`, Fonts) | cache-first | Hash im Pfad/Query |
| `/api/*` und `/.auth/*` | **nie cachen**, `fetch` direkt | Sicherheits- und Login-Relevanz |
| Videos fremder Herkunft | **nicht cachen**, Netzwerk durchreichen | siehe unten |

```js
// sw/sw-template.js (Auszug)
const VERSION = '__VERSION__';
const PRECACHE = __PRECACHE__;
const CACHE = 'shell-' + VERSION;

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();   // nur auf Klick des Nutzers
});

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE.map((f) => f.url))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/.auth/')) return; // nie cachen
  if (url.origin !== self.location.origin) return;                                   // Fremd-Herkunft
  if (e.request.headers.has('range')) return;                                        // Range-Anfragen ans Netz
  if (e.request.mode === 'navigate') {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
```

Die Navigationsstrategie oben ist eine vereinfachte cache-first-Variante. Für echtes stale-while-revalidate: Antwort aus Cache sofort zurückgeben und parallel `fetch` ausführen und mit `cache.put` aktualisieren. **Nicht getestet**.

### Update-Ablauf

Belegt (https://web.dev/articles/service-worker-lifecycle):

- Ein neuer Worker installiert sich neben dem alten und wartet im Zustand „waiting“, bis kein Client mehr vom alten Worker kontrolliert wird. Ein Reload reicht nicht.
- `skipWaiting()` aktiviert sofort, kann aber Seiten mit gemischten Versionen erzeugen. Der Artikel warnt davor.
- `clients.claim()` übernimmt offene Seiten, die noch ohne Worker laufen.

Ablauf für die Seite:

```js
// Seiten-Skript
navigator.serviceWorker.register('/sw.js').then((reg) => {
  if (reg.waiting) showUpdateBanner(reg);
  reg.addEventListener('updatefound', () => {
    const w = reg.installing;
    w.addEventListener('statechange', () => {
      if (w.state === 'installed' && navigator.serviceWorker.controller) showUpdateBanner(reg);
    });
  });
});
function showUpdateBanner(reg) {
  // Hinweis „Neue Version verfügbar“ mit Button:
  // onclick → reg.waiting?.postMessage('SKIP_WAITING')
  // danach einmal location.reload() bei 'controllerchange'
}
navigator.serviceWorker.addEventListener('controllerchange', () => location.reload());
```

### Videos fremder Herkunft und Range-Problem

Belegt (https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests): Ein Server mit Range-Unterstützung antwortet mit `206 Partial Content` und `Content-Range`. Ohne Range-Support kommt `200` mit dem ganzen Body. `<video>` sucht über Range-Anfragen.

- Das Problem: Ein `cache.match` liefert die volle `200`-Antwort und ignoriert den Range-Header. Spulen funktioniert dann nicht zuverlässig.
- Die Cache API speichert 206-Antworten nicht: `cache.put()` lehnt sie ab. **UNBELEGT**: aus allgemeiner Kenntnis, nicht in der MDN-Seite zu `Cache.match` gefunden.
- **Lösung**: Videos nicht in den Cache legen. Der Worker lässt Range-Anfragen und Fremd-Herkunft ans Netz (siehe oben). Offline-Video nur über vollständiges Herunterladen als Blob in IndexedDB; das ist ein eigener Schritt.
- Alternative (Sketch, **nicht getestet**): Range-Antwort selbst aus einem vollständigen Cache-Blob schneiden (`blob.slice`, Header `Content-Range`, `206`). Die Vorlage ist im Rechercheprozess entstanden; bei Bedarf separat prüfen.
- Cross-Origin-Antworten ohne CORS sind im SW „opaque“ und können nicht geschnitten werden. **UNBELEGT**, aus allgemeiner Kenntnis.

## 6. Web-App-Manifest und iPadOS

Belegt (https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable):

- Pflicht für installierbare PWA (Chromium): `name` oder `short_name`, `icons` mit einem 192-px- und einem 512-px-Icon, `start_url`, `display` und/oder `display_override`, `prefer_related_applications` nicht `true`.

Beispiel `manifest.webmanifest` (in `public/` bzw. kopiert):

```json
{
  "name": "Lernplattform Maschinenbau-Informatik",
  "short_name": "Lernplattform",
  "id": "/",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1d4f91",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "shortcuts": [
    { "name": "Weiter lernen", "url": "/lektionen/", "icons": [{ "src": "/icons/icon-192.png", "sizes": "192x192" }] }
  ]
}
```

- `id`, `scope`, `shortcuts`: Bedeutung aus allgemeinem Wissen. **UNBELEGT** in den geprüften Quellen, bitte mit MDN-Mitgliederseiten gegenprüfen.
- Maskable: Sichere Zone liegt in der Mitte (ungefähr 80 %). Die Angabe `purpose: "maskable"` ist **UNBELEGT** in den geprüften Quellen (MDN-Installationsseite erwähnt sie nicht).
- Die Symbolgrößen 192 und 512 sind belegt. Empfehlung: zusätzlich ein maskable-Icon.

HTML-Kopf (Layout):

```html
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#1d4f91">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Lernplattform">
```

Belegt (https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html):

- `apple-touch-icon`: Safari wählt die passendste Größe. Empfohlene Größen stehen in der iOS Human Interface Guidelines. Die konkrete Größe **180×180** ist **UNBELEGT** in dieser Quelle.
- `apple-mobile-web-app-capable` = `yes` schaltet den Standalone-Modus ein. Erkennung per `window.navigator.standalone`.
- Ob Safari auf iPadOS das Manifest für „Zum Home-Bildschirm“ nutzt: **UNBELEGT**. Die Apple-Seite erwähnt das Manifest nicht. Deshalb `apple-touch-icon` und Apple-Meta-Tags zusätzlich setzen.

Android und Windows: Chrome und Edge installieren über das Manifest. Standalone und Shortcuts sind dort belegt durch die MDN-Manifest-Seite (Mitgliederbeschreibungen nur teilweise geprüft).

## 7. Schriften selbst hosten

- Quelle für Pakete: Fontsource (npm). Versionen per npm geprüft: `@fontsource/source-sans-3` **5.3.1**, `@fontsource/fira-code` **5.3.0**, `@fontsource-variable/fira-code` **5.3.0**.
- Install-Muster laut Fontsource-Doku: https://fontsource.org/docs/getting-started/install

```sh
npm install @fontsource/source-sans-3 @fontsource/fira-code
```

```js
// im Layout oder in einer CSS-Datei
import '@fontsource/source-sans-3/400.css';
import '@fontsource/source-sans-3/700.css';
import '@fontsource/fira-code/400.css';
```

- Die Doku sagt, dass generierte CSS `unicode-range` nutzt. Latin-only-Pfad: **UNBELEGT**.
- Schriftlizenz (SIL Open Font License) für Source Sans 3 und Fira Code: **UNBELEGT** in den geprüften Quellen. Bitte vor Veröffentlichung auf den Paketseiten prüfen.
- `font-display: swap` und woff2-Dateien: **UNBELEGT** (nicht geprüft). Fontsource liefert woff2 aus, das Muster ist allgemein üblich.
- Die Fontsource-Dateien landen per Vite/Astro im Build. Falls Astro die CSS-Imports bündelt, ist das erwünscht. Bei Bedarf stattdessen Dateien nach `public/fonts/` kopieren und `@font-face` manuell schreiben.

## Offene Punkte (Praxistest nötig)

1. `publicDir` außerhalb der Projektwurzel: UNBELEGT. Kopierschritt empfohlen.
2. Parser-Wahl (node-html-parser vs. cheerio): UNBELEGT, Test-Skript oben.
3. `<script>` innerhalb `set:html`: UNBELEGT, Praxistest.
4. JSON-Import für Build-ID in Astro: UNBELEGT.
5. Range-Sketch im SW: ungetestet.
6. Maskable und iPadOS-Manifest: UNBELEGT.
7. Lizenz und `font-display` der Schriften: UNBELEGT.

## Quellen

- https://docs.astro.build/en/install-and-setup/
- https://docs.astro.build/en/reference/configuration-reference/
- https://docs.astro.build/en/guides/routing/
- https://docs.astro.build/en/guides/client-side-scripts/
- https://docs.astro.build/en/guides/imports/
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests
- https://developer.mozilla.org/en-US/docs/Web/API/Cache/match
- https://web.dev/articles/service-worker-lifecycle
- https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
- https://fontsource.org/docs/getting-started/install
- npm-Registry: astro, @fontsource/*, @fontsource-variable/fira-code, workbox-build, node-html-parser, cheerio
