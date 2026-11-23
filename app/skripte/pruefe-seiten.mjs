/* =============================================================
   pruefe-seiten.mjs – Bestandsprüfung aller veröffentlichten Seiten (npm run pruefen -- <basis-url>)
   Startet nichts selbst. Prüft mit Playwright/Chromium bei 1440×900 und 1024×768:
   keine Konsolenfehler, keine fehlgeschlagenen Anfragen, Hülle vorhanden (Leiste, Kopfzeile, #inhalt),
   kein horizontales Scrollen, in Lerneinheiten ist das Quiz initialisiert, im Labor die Aufgabenliste.
   Bildschirmfotos nach app/.cache/pruefung/.
   Ausnahme (eng): Liefert GET /api/status 404 (Azure) bzw. 502 (Emulator ohne API), gilt die API als noch nicht
   vorhanden; dann ist genau dieser Status auf /api/* (samt Chromium-Konsolenmeldung) erlaubt. Alles andere bleibt Fehler.
   Fehlt eine angefragte Datei unter assets/ oder notebooks/ schon in site/, ist das ein Bestandsmangel: gemeldet, nicht gezählt.
   Aufruf: node skripte/pruefe-seiten.mjs http://localhost:4301 [--nur lektionen/v07] [--ohne-fotos]
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { DIST, CACHE, SITE } from '../src/lib/pfade.mjs';

const args = process.argv.slice(2);
const basis = (args.find((a) => /^https?:\/\//.test(a)) || process.env.PRUEF_BASIS || 'http://localhost:4301').replace(/\/+$/, '');
const nur = args.includes('--nur') ? args[args.indexOf('--nur') + 1] : null;
const ohneFotos = args.includes('--ohne-fotos');
const FOTOS = path.join(CACHE, 'pruefung');

/* Datei fehlt schon in site/ (Mangel des Bestands, kein Fehler der Hülle): nur melden, nicht scheitern */
function bestandFehlt(u) {
  const p = decodeURIComponent(new URL(u).pathname).replace(/^\/+/, '');
  if (!/^(assets|notebooks)\//.test(p)) return false;
  return !fs.existsSync(path.join(SITE, p)) && !fs.existsSync(path.join(DIST, p));
}

const GROESSEN = [{ name: 'desktop', width: 1440, height: 900 }, { name: 'tablet', width: 1024, height: 768 }];

/* Alle HTML-Seiten der Ausgabe, außer der reinen Weiterleitung */
function seiten() {
  const liste = [];
  const lauf = (rel) => {
    for (const e of fs.readdirSync(path.join(DIST, rel), { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) { if (!['assets', 'notebooks', 'app', 'pyodide', '_astro'].includes(e.name)) lauf(r); }
      else if (e.name.endsWith('.html')) liste.push(r);
    }
  };
  lauf('');
  return liste.filter((s) => s !== 'lektionen/v03-training.html' && (!nur || s.includes(nur))).sort();
}

async function main() {
  if (!fs.existsSync(DIST)) throw new Error('app/dist fehlt: erst npm run build');
  /* API fehlt: Azure liefert dann 404, der SWA-Emulator ohne --api-location 502 */
  let apiFehlt = 0;
  try { const r = await fetch(basis + '/api/status'); if (r.status === 404 || r.status === 502) apiFehlt = r.status; } catch (e) { throw new Error(`${basis} ist nicht erreichbar. Läuft der Emulator?`); }
  if (apiFehlt) console.log(`Hinweis: /api/status liefert ${apiFehlt}, die API fehlt noch. ${apiFehlt} auf /api/* wird toleriert.`);
  if (!ohneFotos) fs.mkdirSync(FOTOS, { recursive: true });

  const browser = await chromium.launch();
  const liste = seiten();
  const fehler = [];
  const bestandsmaengel = new Set();
  let geprueft = 0;
  for (const g of GROESSEN) {
    const ctx = await browser.newContext({ viewport: { width: g.width, height: g.height }, locale: 'de-DE' });
    for (const s of liste) {
      const page = await ctx.newPage();
      const eigene = [];
      const apiErlaubt = (u, status) => !!apiFehlt && status === apiFehlt && new URL(u).pathname.startsWith('/api/');
      page.on('console', (m) => {
        if (m.type() !== 'error') return;
        const loc = m.location() && m.location().url;
        const st = /^Failed to load resource: the server responded with a status of (\d+)/.exec(m.text());
        if (st && loc && ((st[1] === '404' && bestandFehlt(new URL(loc, basis).href)) || apiErlaubt(new URL(loc, basis).href, +st[1]))) return;
        eigene.push('Konsole: ' + m.text().slice(0, 200) + (loc ? ` (${loc})` : ''));
      });
      page.on('pageerror', (e) => eigene.push('Skriptfehler: ' + String(e.message || e).slice(0, 200)));
      page.on('requestfailed', (r) => {
        const f = r.failure() ? r.failure().errorText : '';
        /* Video- und Untertitel-Vorladen bricht der Browser selbst ab; fehlende Bestandsdateien zählen dort mit */
        if (f === 'net::ERR_ABORTED' && (['media', 'texttrack'].includes(r.resourceType()) || bestandFehlt(r.url()))) return;
        eigene.push(`Anfrage fehlgeschlagen: ${r.url()} ${f}`);
      });
      page.on('response', (r) => {
        if (r.status() === 404 && bestandFehlt(r.url())) { bestandsmaengel.add(`${new URL(r.url()).pathname} (verlangt von ${s})`); return; }
        if (r.status() >= 400 && !apiErlaubt(r.url(), r.status())) eigene.push(`HTTP ${r.status()}: ${r.url()}`);
      });
      try {
        await page.goto(`${basis}/${s}`, { waitUntil: 'load', timeout: 45000 });
        await page.waitForTimeout(600);
        /* Explorables brauchen ihr Skript (explorables-vXX.js); bis zu 5 s warten, bis alle etwas zeigen */
        await page.waitForFunction(() => [...document.querySelectorAll('[data-explorable]')].every((x) => x.childElementCount > 0), null, { timeout: 5000 }).catch(() => {});
        const befund = await page.evaluate((tablet) => {
          const r = [];
          /* Tablet: Bedienelemente der Hülle mindestens 44 × 44 px */
          if (tablet) {
            const klein = [...document.querySelectorAll('.app-ansicht a, .app-lektion__pfeil, .app-bar__suche, .app-bar__link, .app-waehler__knopf, .app-panel__zu, .gl-buchstaben a')]
              .filter((x) => x.offsetParent !== null).map((x) => [x, x.getBoundingClientRect()]).filter(([, b]) => b.width < 43.5 || b.height < 43.5)
              .map(([x, b]) => `${x.className || x.tagName} ${Math.round(b.width)}×${Math.round(b.height)}`);
            if (klein.length) r.push('Ziele unter 44 px: ' + [...new Set(klein)].slice(0, 4).join(', '));
          }
          const q = (x) => document.querySelector(x);
          if (!q('body.app')) r.push('body.app fehlt');
          if (!q('nav.app-rail [data-app-ziel="heute"]')) r.push('Leiste fehlt');
          if (!q('header.app-bar [data-app-slot="kontext"]')) r.push('Kopfzeile fehlt');
          if (!q('.app-inhalt #inhalt')) r.push('#inhalt fehlt in .app-inhalt');
          if (document.querySelectorAll('header.dhbw-header, footer.dhbw-footer').length) r.push('Bestands-Kopf/Fuß noch vorhanden');
          if (!window.KursApp) r.push('KursApp fehlt');
          const sw = document.documentElement.scrollWidth, cw = document.documentElement.clientWidth;
          if (sw > cw + 1) r.push(`horizontales Scrollen (${sw} > ${cw})`);
          const art = document.body.getAttribute('data-page');
          if (art === 'lerneinheit') {
            const quiz = document.querySelectorAll('.k-quiz, [data-quiz]').length;
            const opts = document.querySelectorAll('.k-q__opt').length;
            if (quiz && document.querySelector('.k-q__options') && !opts) r.push('Quiz nicht initialisiert (keine .k-q__opt)');
          }
          if (art === 'labor' && !document.querySelectorAll('[data-lab-items] a, [data-lab-items] .lab__item').length) r.push('Aufgabenliste des Labors leer');
          /* Explorables: jedes zeigt nach dem Laden etwas (fehlt explorables-vXX.js, bleiben sie leer) */
          const leer = [...document.querySelectorAll('[data-explorable]')].filter((x) => x.childElementCount === 0).map((x) => x.getAttribute('data-explorable'));
          if (leer.length) r.push('Explorables nicht initialisiert: ' + leer.join(', '));
          /* Begriffe (abbr.k-begriff, begriff.js): erweitert und Klick öffnet die Erklärung */
          const begriffe = [...document.querySelectorAll('abbr.k-begriff[data-erklaerung]')];
          if (begriffe.length) {
            const b = begriffe[0];
            if (b.getAttribute('role') !== 'button' || !b.getAttribute('aria-describedby')) r.push(`Begriffe nicht erweitert (${begriffe.length} abbr.k-begriff ohne begriff.js)`);
            else {
              b.click();
              const offen = b.getAttribute('aria-expanded') === 'true';
              b.click();
              if (!offen) r.push('Klick auf einen Begriff öffnet keine Erklärung');
            }
          }
          /* Labor: „Nächster Schritt“ der Hülle (nächste Lektion) erst auf der letzten Station */
          const weiter = document.querySelector('.app-weiter');
          const stationen = document.querySelectorAll('.l-task');
          if (art === 'labor' && weiter && stationen.length > 1 && stationen[stationen.length - 1].hidden && getComputedStyle(weiter).display !== 'none') r.push('Labor: „Nächster Schritt“ steht schon vor der letzten Station');
          if (!document.querySelector('h1')) r.push('keine h1');
          return r;
        }, g.name === 'tablet');
        eigene.push(...befund);
        if (!ohneFotos) await page.screenshot({ path: path.join(FOTOS, `${s.replace(/\//g, '_').replace(/\.html$/, '')}-${g.name}.png`) });
      } catch (e) {
        eigene.push('Laden: ' + String(e.message || e).split('\n')[0]);
      }
      await page.close();
      geprueft++;
      if (eigene.length) { fehler.push({ seite: s, groesse: g.name, eigene }); console.log(`FEHLER ${g.name} ${s}\n  - ${eigene.join('\n  - ')}`); }
      else console.log(`ok     ${g.name} ${s}`);
    }
    await ctx.close();
  }
  await browser.close();
  if (bestandsmaengel.size) {
    const liste = [...bestandsmaengel].sort();
    fs.mkdirSync(FOTOS, { recursive: true });
    fs.writeFileSync(path.join(FOTOS, 'bestandsmaengel.txt'), liste.join('\n') + '\n');
    console.log(`\nBestandsmängel: ${liste.length} Dateien fehlen schon in site/ (nicht als Fehler gezählt), z. B.\n  - ${liste.slice(0, 3).join('\n  - ')}\n  Liste: ${path.join(FOTOS, 'bestandsmaengel.txt')}`);
  }
  console.log(`\n${geprueft} Prüfungen (${liste.length} Seiten × ${GROESSEN.length} Größen), ${fehler.length} mit Fehlern.${ohneFotos ? '' : ' Fotos: ' + FOTOS}`);
  process.exitCode = fehler.length ? 1 : 0;
}

main().catch((e) => { console.error(e.message || e); process.exitCode = 2; });
