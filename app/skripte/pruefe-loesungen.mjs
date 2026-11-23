/* =============================================================
   pruefe-loesungen.mjs – jede Musterlösung der neuen Terminseiten besteht ihre Tests.
   Aufruf:  node skripte/pruefe-loesungen.mjs [http://localhost:4340 | <Ausgabeordner, Standard dist>]
   Geprüft werden die Seiten der Termine, die eigene Seiten haben (kurs.json: termine[].lektion).
   Für jede Aufgabe mit Tests läuft die Lösung durch dieselbe Prüfung wie bei den Studierenden
   (KursAufgaben.runPython mit dem Python der Seite):
     code, klausur   Lösung aus <script data-role="solution">
     gap             Lückentext, jede Lücke mit ihrer ersten Antwort gefüllt
     pap-zeichnen    Musterplan (JSON, data-role="solution") in Python übersetzt wie im Editor
   Außerdem: Die Startvorlage einer Code-Aufgabe darf die Tests NICHT bestehen (sonst wäre nichts zu tun),
   und jede Aufgabe mit Tests hat eine Lösung.
   ============================================================= */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';
import { APP } from '../src/lib/pfade.mjs';

const arg = process.argv[2] || '';
const URL_ARG = /^https?:\/\//.test(arg) ? arg.replace(/\/+$/, '') : null;
let server = null;
let BASIS = URL_ARG;
if (!URL_ARG) {
  const wurzel = path.join(APP, arg || process.env.KURS_AUSGABE || 'dist');
  if (!fs.existsSync(path.join(wurzel, 'app', 'daten', 'kurs.json'))) { console.error(`Kein gebauter Stand unter ${wurzel}. Erst bauen (npm run build).`); process.exit(2); }
  const typ = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp', '.wasm': 'application/wasm', '.zip': 'application/zip', '.whl': 'application/zip', '.py': 'text/plain; charset=utf-8' };
  server = http.createServer((req, res) => {
    const p = path.join(wurzel, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(wurzel) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': typ[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  BASIS = `http://127.0.0.1:${server.address().port}`;
}

let fehler = 0, anzahl = 0;
function pruefe(name, ok, detail) {
  anzahl++; if (!ok) fehler++;
  console.log(`  ${ok ? 'OK    ' : 'FEHLER'} ${name}${detail ? ' – ' + detail : ''}`);
}

const browser = await chromium.launch();
try {
  const kurs = await fetch(BASIS + '/app/daten/kurs.json').then((r) => r.json());
  const lektionen = kurs.termine.filter((t) => t.lektion).map((t) => kurs.lektionen.find((l) => l.nr === t.lektion));
  if (!lektionen.length) console.log('Noch kein Termin hat eigene Seiten.');
  for (const l of lektionen) {
    for (const seite of [l.lerneinheit, l.labor].filter(Boolean)) {
      console.log(`\n${l.nr} ${seite}`);
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
      const page = await ctx.newPage();
      const konsole = [];
      page.on('pageerror', (e) => konsole.push(String(e)));
      await page.goto(`${BASIS}/${seite}`, { waitUntil: 'load' });
      await page.waitForFunction(() => window.KursAufgaben && window.KursAufgaben.runPython, null, { timeout: 20000 });
      /* Aufgaben einsammeln (im Browser, wie die Seite sie selbst liest) */
      const aufgaben = await page.evaluate(async () => {
        const lies = (box, rolle, typ) => { const s = box.querySelector(`script[type="${typ}"][data-role="${rolle}"]`); return s ? s.textContent.replace(/^\n/, '').replace(/\s+$/, '') : null; };
        /* aus dem ausgelieferten HTML lesen, nicht aus der laufenden Seite: aufgaben.js baut den Lückentext um */
        const quelle = new DOMParser().parseFromString(await (await fetch(location.pathname)).text(), 'text/html');
        return [...quelle.querySelectorAll('.a-task[data-a]')].map((box) => {
          const art = box.getAttribute('data-a');
          const tests = lies(box, 'tests', 'text/x-python');
          if (!tests) return null;
          let loesung = lies(box, 'solution', 'text/x-python'), modus = box.getAttribute('data-mode') || 'programm', vorlage = null;
          if (art === 'gap') { const src = box.querySelector('.a-gap__src'); loesung = src ? src.textContent.replace(/@@(.*?)@@/g, (a, x) => x.split('|')[0]) : null; }
          if (art === 'pap-zeichnen') {
            const j = lies(box, 'solution', 'application/json');
            loesung = j ? window.KursPAP.toText(window.KursPAP.fromJson(JSON.parse(j))) : null;
            modus = 'programm';
          }
          if (art === 'code') { const ta = box.querySelector('textarea'); vorlage = ta ? (ta.defaultValue || ta.value || '') : ''; }
          return { id: box.getAttribute('data-id'), art, tests, loesung, modus, vorlage, zeit: Number(box.getAttribute('data-timeout')) || 8000 };
        }).filter(Boolean);
      });
      if (!aufgaben.length) console.log('  (keine Aufgaben mit Tests)');
      for (const a of aufgaben) {
        if (!a.loesung) { pruefe(`${a.id} (${a.art}) hat eine Musterlösung`, false); continue; }
        const lauf = (code) => page.evaluate(([c, t, m, z]) => window.KursAufgaben.runPython('test', c, [], t, m, z).then((r) => ({
          n: r.results.length, ok: r.results.filter((x) => x.ok).length, erste: (r.results.find((x) => !x.ok) || {}).msg || '', fatal: r.fatal, hinweis: r.loadError || r.jsError || (r.timedOut ? 'Zeitlimit' : ''),
        })), [code, a.tests, a.modus, a.zeit]);
        const r = await lauf(a.loesung);
        pruefe(`${a.id} (${a.art}): Lösung besteht ${r.ok} von ${r.n} Tests`, r.n > 0 && r.ok === r.n && !r.fatal && !r.hinweis, r.fatal || r.hinweis || r.erste);
        if (a.art === 'code') {
          const v = await lauf(a.vorlage);
          pruefe(`${a.id}: die Startvorlage besteht die Tests noch nicht`, !(v.n > 0 && v.ok === v.n && !v.fatal));
        }
      }
      pruefe('keine Skriptfehler auf der Seite', konsole.length === 0, konsole.slice(0, 2).join(' | '));
      await ctx.close();
    }
  }
} catch (e) {
  pruefe('Lauf ohne Ausnahme', false, (e && e.stack || e).toString().split('\n').slice(0, 3).join(' | '));
} finally {
  await browser.close();
  if (server) server.close();
}
console.log(`\n${anzahl - fehler} von ${anzahl} Prüfungen bestanden.`);
process.exit(fehler ? 1 : 0);
