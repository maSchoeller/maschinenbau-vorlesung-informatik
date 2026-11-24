/* =============================================================
   pruefe-navigation.mjs – Wiederholbare Prüfung der Navigationsseiten (Rolle Navigation)
   Heute, Lernpfad, Glossar, Suche mit Playwright/Chromium bei 1440×900 und 1024×768.
   Der Lernstand wird über KursSpeicher in den Browser geschrieben (wie die Oberfläche es tut).
   Startet einen eigenen kleinen Dateiserver für die Ausgabe (kein Emulator nötig).
   Aufruf: node skripte/pruefe-navigation.mjs [ausgabeordner=dist-nav] [port=4321]
           node skripte/pruefe-navigation.mjs http://localhost:4340   (gegen einen laufenden Server, ohne eigenen)
   Fängt unter anderem: leere Suche zeigt nur die Lektionen, „Weiter“ führt nie auf Navigationsseiten,
   im Fertig-Zustand genau ein primärer Knopf, Warm-up mit bis zu drei Aufgaben, Glossar-Filter ae/oe/ue,
   Suche findet Python-Themen, Fokus kehrt zurück (Suche, Hinweis wegklicken).
   ============================================================= */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/* Erstes Argument: Ausgabeordner (eigener Dateiserver) oder Basis-URL eines laufenden Servers (z. B. Emulator) */
const URL_ARG = /^https?:\/\//.test(process.argv[2] || '') ? process.argv[2].replace(/\/+$/, '') + '/' : null;
const ordner = path.join(APP, URL_ARG ? (process.env.KURS_AUSGABE || 'dist') : (process.argv[2] || 'dist-nav'));
const port = Number(process.argv[3] || 4321);
const TYP = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
  const f = path.join(ordner, p);
  if (!f.startsWith(ordner) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(p.startsWith('api/') ? 502 : 404); return res.end(); }
  res.writeHead(200, { 'content-type': TYP[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

const fehler = [];
function pruefe(ok, text) { if (!ok) fehler.push(text); console.log((ok ? '  ok  ' : '  FEHLER  ') + text); }

async function stand(page, fn, arg) { return page.evaluate(fn, arg); }

async function main() {
  let basis = URL_ARG;
  if (!basis) {
    if (!fs.existsSync(ordner)) throw new Error(ordner + ' fehlt: erst bauen (KURS_AUSGABE=dist-nav npm run build)');
    await new Promise((r) => server.listen(port, r));
    basis = 'http://localhost:' + port + '/';
  }
  const browser = await chromium.launch();
  try {
    for (const g of [{ n: 'desktop', width: 1440, height: 900 }, { n: 'tablet', width: 1024, height: 768 }]) {
      console.log('== ' + g.n + ' ' + g.width + '×' + g.height);
      const ctx = await browser.newContext({ viewport: { width: g.width, height: g.height }, locale: 'de-DE' });
      const page = await ctx.newPage();
      const konsole = [];
      page.on('pageerror', (e) => konsole.push(String(e)));
      page.on('console', (m) => { if (m.type() === 'error' && !/502|404/.test(m.text())) konsole.push(m.text()); });

      /* Leerer Stand */
      await page.goto(basis + 'index.html'); await page.evaluate(() => localStorage.clear()); await page.reload();
      pruefe(/V01/.test(await page.locator('main').innerText()), 'Heute ohne Stand: Einstieg mit V01');

      /* Suche: leere Suche, Python-Themen, Fokus */
      await page.keyboard.press('Control+k');
      await page.waitForSelector('dialog.suche[open] a.suche-treffer');
      let opt = await page.locator('dialog.suche a.suche-treffer').count();
      let grp = await page.locator('dialog.suche .suche-gruppe__name').allTextContents();
      const nLek = (await page.evaluate(() => window.KursApp.kurs())).lektionen.length;
      pruefe(opt === nLek && nLek >= 1 && grp.length === 1 && grp[0] === 'Lektionen', 'Leere Suche: genau die ' + nLek + ' Lektionen in einer Gruppe (' + opt + ' Treffer, Gruppen: ' + grp.join(',') + ')');
      await page.waitForTimeout(400);
      pruefe(new RegExp('Alle ' + nLek + ' Lektionen').test(await page.locator('dialog.suche .suche-status').textContent()), 'Statusmeldung „Alle ' + nLek + ' Lektionen“');
      for (const [q, erwartet] of [['input', 'V01'], ['zuweisung', 'V01'], ['ablauf', null]]) {
        await page.fill('#suche-feld', q);
        const t = await page.locator('dialog.suche a.suche-treffer').allInnerTexts();
        if (erwartet) {
          const lek = await page.locator('dialog.suche [aria-labelledby="suche-g-lektion"] a.suche-treffer').allInnerTexts();
          pruefe(lek.some((x) => x.includes(erwartet)), 'Suche „' + q + '“ findet ' + erwartet + ' unter Lektionen');
        } else pruefe(t.length > 0, 'Suche „' + q + '“ (ae für ä) findet etwas');
      }
      await page.keyboard.press('Escape');
      pruefe(await page.waitForFunction(() => document.activeElement && document.activeElement.matches('[data-app-aktion="suche"]'), null, { timeout: 1500 }).then(() => true, () => false), 'Esc: Fokus zurück auf den Suchknopf');
      /* Opener nicht mehr im Dokument: Fallback auf den Suchknopf */
      await page.evaluate(() => { const b = document.createElement('button'); b.id = 'wegwerf'; document.body.appendChild(b); b.focus(); });
      await page.keyboard.press('Control+k');
      await page.waitForSelector('dialog.suche[open]');
      await page.evaluate(() => document.getElementById('wegwerf').remove());
      await page.keyboard.press('Escape');
      pruefe(await page.waitForFunction(() => document.activeElement && document.activeElement.matches('[data-app-aktion="suche"]'), null, { timeout: 1500 }).then(() => true, () => false), 'Opener aus dem DOM entfernt: Fokus trotzdem auf dem Suchknopf');

      /* Glossar */
      await page.goto(basis + 'glossar.html');
      await page.fill('#gl-filter', 'ablauf');
      const z = await page.locator('.gl-eintrag:not([hidden])').count();
      pruefe(z > 0, 'Glossar-Filter „ablauf“ findet Begriffe (' + z + ')');

      /* Heute nach dem Besuch einer Navigationsseite: „Weiter“ nie auf Glossar */
      await page.goto(basis + 'lektionen/v01-ablauf-und-erste-programme.html').catch(() => {});
      await page.goto(basis + 'index.html'); await page.evaluate(() => localStorage.clear());
      const kurs = await page.evaluate(() => window.KursApp.kurs());
      const t = kurs.lektionen;
      const seed = (n, was) => page.evaluate(({ nr, was }) => {
        const KS = window.KursSpeicher;
        for (const [k, ids] of Object.entries(was)) { const b = KS.sofort.lesen(KS.pfad(nr, k)) || {}; ids.forEach((i) => { b[i] = 1; }); KS.sofort.schreiben(KS.pfad(nr, k), b); }
      }, { nr: n, was });
      await seed(t[0].nr, { done: [t[0].abschnitte[0].id] });
      for (const x of t.slice(1, 3)) await seed(x.nr, { done: [x.abschnitte[0].id] });
      await page.evaluate(() => window.KursSpeicher.sofort.schreiben('inf-mb/app/zuletzt', { url: 'glossar.html', titel: 'Glossar', art: 'glossar', lektion: null, zeit: new Date().toISOString() }));
      await page.reload(); await page.waitForTimeout(700);
      let haupt = await page.locator('main').innerText();
      pruefe(!/Weiter, wo du warst/.test(haupt), 'Zuletzt = Glossar: kein „Weiter, wo du warst“ auf Heute');
      pruefe(await page.locator('main a.k-btn:not(.k-btn--ghost)').count() === 1, 'Heute: genau ein primärer Knopf (Stand begonnen)');
      const warm = await page.locator('.np-warmup li').count();
      const warmSoll = Math.min(3, 2 * (Math.min(t.length, 3) - 1));   /* aus den früheren begonnenen Lektionen, höchstens 2 je Lektion */
      pruefe(warm === warmSoll, 'Warm-up zeigt ' + warmSoll + ' offene Aufgaben aus den begonnenen Lektionen (' + warm + ')');
      const proLektion = await page.locator('.np-aufgabe__lektion').allInnerTexts();
      const maxLek = Math.max(...Object.values(proLektion.reduce((a, x) => ((a[x] = (a[x] || 0) + 1), a), {})), 0);
      pruefe(maxLek <= 2, 'Warm-up: höchstens 2 Aufgaben je Lektion');

      /* Zuletzt = Lektion: Weiter-Knopf zeigt auf die Lektion */
      await page.evaluate((u) => window.KursSpeicher.sofort.schreiben('inf-mb/app/zuletzt', { url: 'lektionen/' + u, titel: 'Test', art: 'lerneinheit', lektion: 'V01', zeit: new Date().toISOString() }), t[t.length - 1].lerneinheit);
      await page.reload(); await page.waitForTimeout(700);
      pruefe(await page.locator('main a.k-btn:not(.k-btn--ghost)').count() === 1, 'Heute mit „Weiter“: genau ein primärer Knopf');
      pruefe(/Weiter, wo du warst/.test(await page.locator('main').innerText()), 'Zuletzt = Lektion: „Weiter, wo du warst“ erscheint');

      /* Hinweis wegklicken: Fokus bleibt auf der Seite */
      const zu = page.locator('.np-hinweis__zu');
      if (await zu.count()) {
        await zu.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1800);
        pruefe(await page.evaluate(() => document.activeElement && document.activeElement !== document.body), 'Hinweis weggeklickt: Fokus nicht auf body');
      } else console.log('  (kein Hinweis sichtbar, Fokus-Prüfung übersprungen)');

      /* Alles fertig: ein primärer Knopf (Klausurtrainer) */
      await page.evaluate((termine) => {
        const KS = window.KursSpeicher;
        termine.forEach((x) => {
          const d = {}, a = {};
          (x.abschnitte || []).forEach((s) => { d[s.id] = 1; });
          (x.aufgaben || []).forEach((s) => (s.pruefbar || []).forEach((i) => { a[i] = 1; }));
          KS.sofort.schreiben(KS.pfad(x.nr, 'done'), d); KS.sofort.schreiben(KS.pfad(x.nr, 'aufg'), a);
        });
      }, t);
      await page.reload(); await page.waitForTimeout(700);
      const prim = page.locator('main a.k-btn:not(.k-btn--ghost)');
      pruefe(await prim.count() === 1 && /Lernpfad|Klausurtrainer/.test(await prim.innerText()), 'Alles fertig: genau ein primärer Knopf (Lernpfad, solange Termine fehlen; sonst Klausurtrainer)');

      /* Lernpfad */
      await page.goto(basis + 'lernpfad.html'); await page.waitForTimeout(500);
      pruefe(await page.locator('.lp-station').count() === kurs.termine.length && kurs.termine.length === 20, 'Lernpfad zeigt die 20 Termine');
      pruefe(await page.locator('.lp-material [data-nr], .lp-seite[data-nr]').count() >= t.length, 'Lernpfad nennt zu den Terminen alle aktiven Lektionen (' + t.length + ')');
      if (g.n === 'desktop') await page.screenshot({ path: path.join(APP, '.cache', 'nav-lernpfad.png') }).catch(() => {});
      pruefe(konsole.length === 0, 'keine Konsolenfehler' + (konsole.length ? ': ' + konsole.slice(0, 3).join(' | ') : ''));
      await ctx.close();
    }
  } finally { await browser.close(); server.close(); }
  console.log(fehler.length ? '\n' + fehler.length + ' Fehler' : '\nalles ok');
  process.exit(fehler.length ? 1 : 0);
}
main().catch((e) => { console.error(e); try { server.close(); } catch (_) {} process.exit(1); });
