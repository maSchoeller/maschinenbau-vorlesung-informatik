/* =============================================================
   pruefe-v05.mjs – Bedienung der Bausteine byte, range und summe im Browser (Termin 05)
   Aufruf:  node skripte/pruefe-v05.mjs [Ausgabeordner, Standard: dist]   (z. B. dist-int5; erst bauen)
   Startet einen kleinen statischen Server, kein Emulator nötig. Chromium, 1440×900.
   Geprüft: Tastatur und aria-checked an den Bit-Schaltern, „Nächste Stelle“ achtmal, Stepper-Grenzen,
   „Bis zum Ende“ bei „Startwert fehlt“ mit NameError, beide summe-Bausteine laufen unabhängig.
   ============================================================= */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, '..', process.argv[2] || 'dist');
if (!fs.existsSync(WURZEL)) { console.error('Ausgabeordner fehlt: ' + WURZEL); process.exit(2); }
const TYPEN = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(WURZEL, p);
  if (!f.startsWith(WURZEL) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPEN[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASIS = 'http://127.0.0.1:' + server.address().port;

const ok = [], fehler = [];
function pruefe(b, text, info) {
  const z = text + (info !== undefined ? ' – ' + JSON.stringify(info) : '');
  (b ? ok : fehler).push(z);
  console.log((b ? '  ok      ' : '  FEHLER  ') + z);
}
const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE', serviceWorkers: 'block' });
  const p = await ctx.newPage();
  const probleme = [];
  p.on('pageerror', (e) => probleme.push(String(e.message || e)));
  await p.goto(BASIS + '/lektionen/v05-zweiersystem-und-zaehlschleifen.html');
  await p.locator('[data-explorable="byte"] .v05-bit').first().waitFor({ timeout: 30000 });

  console.log('\n== byte');
  const byte = p.locator('[data-explorable="byte"]');
  const bits = byte.locator('.v05-bit');
  pruefe(await bits.count() === 8, 'acht Bit-Schalter');
  const erster = bits.first();
  pruefe(await erster.getAttribute('aria-label') === 'Stellenwert 128', 'Name ohne Zustand', await erster.getAttribute('aria-label'));
  await erster.focus();
  await p.keyboard.press('Space');
  pruefe(await erster.getAttribute('aria-checked') === 'true', 'Leertaste schaltet den linken Schalter an');
  await p.keyboard.press('Tab'); await p.keyboard.press('Enter');
  pruefe(await bits.nth(1).getAttribute('aria-checked') === 'true', 'Tab und Eingabetaste schalten den zweiten Schalter an');
  pruefe((await byte.locator('.v05-gross').innerText()).trim() === '192', 'Zahl 128 + 64 = 192', await byte.locator('.v05-gross').innerText());
  await byte.getByRole('button', { name: 'Zahl eingeben' }).click();
  pruefe(await byte.getByRole('button', { name: 'Zahl eingeben' }).getAttribute('aria-pressed') === 'true', 'Betriebsart Zahl eingeben ist gedrückt');
  pruefe(await bits.first().getAttribute('aria-disabled') === 'true', 'in der Zahl-Betriebsart sind die Schalter gesperrt');
  await byte.locator('input[type="number"]').fill('45');
  const weiter = byte.getByRole('button', { name: 'Nächste Stelle' });
  let letzte = '';
  for (let i = 0; i < 8; i++) { await weiter.click({ force: true }); letzte = await byte.locator('.v05-byte').innerText(); }
  pruefe(letzte.replace(/\s+/g, '') === '00101101', 'nach achtmal „Nächste Stelle“ steht 0010 1101', letzte);
  pruefe(await weiter.getAttribute('aria-disabled') === 'true', '„Nächste Stelle“ ist am Ende gesperrt');
  await byte.locator('input[type="number"]').fill('300');
  pruefe(await byte.locator('input[type="number"]').getAttribute('aria-invalid') === 'true', '300 ist ungültig (aria-invalid)');

  console.log('\n== range');
  const range = p.locator('[data-explorable="range"]');
  const druecke = async (name, mal) => { const b = range.getByRole('button', { name }); for (let i = 0; i < mal; i++) await b.click({ force: true }); return b; };
  const startMinus = await druecke('Start verkleinern', 6);
  pruefe(await startMinus.getAttribute('aria-disabled') === 'true' && (await range.locator('output').first().innerText()) === '0', 'Start geht nicht unter 0');
  const stoppPlus = await druecke('Stopp vergrößern', 12);
  pruefe(await stoppPlus.getAttribute('aria-disabled') === 'true' && (await range.locator('output').nth(1).innerText()) === '10', 'Stopp geht nicht über 10');
  await druecke('Stopp verkleinern', 10);
  const text = await range.innerText();
  pruefe(/Keine Zahl/.test(text), 'Stopp 0 und Start 0: keine Zahl, der Rumpf läuft nie');
  pruefe(/gleich beim ersten Mal nein/.test(text), 'Raute ohne unsinnige Zahlen');

  console.log('\n== summe');
  const sums = p.locator('[data-explorable="summe"]');
  pruefe(await sums.count() === 2, 'zwei summe-Bausteine auf der Seite', await sums.count());
  const a = sums.nth(0), b = sums.nth(1);
  await a.locator('select').selectOption('startfehlt');
  await a.getByRole('button', { name: 'Bis zum Ende' }).click();
  pruefe(/NameError: name 'summe' is not defined/.test(await a.innerText()), '„Startwert fehlt“ endet mit NameError');
  pruefe(!/NameError/.test(await b.innerText()), 'der zweite Baustein läuft unabhängig (kein NameError)');
  await b.getByRole('button', { name: 'Ein Schritt' }).click();
  pruefe(/Zuletzt ausgeführt: Zeile 1/.test(await b.innerText()), 'zweiter Baustein: ein Schritt führt Zeile 1 aus');
  const feld = a.locator('input[type="number"]').first();
  await feld.fill('11');
  pruefe(await feld.getAttribute('aria-invalid') === 'true' && /0 bis 10, ganze Zahl/.test(await a.innerText()), '11 ist ungültig, die erlaubte Eingabe steht sichtbar da');
  await feld.blur();
  pruefe(await feld.inputValue() === '8', 'nach dem Verlassen steht der letzte gültige Wert wieder da', await feld.inputValue());

  pruefe(probleme.length === 0, 'keine Skriptfehler', probleme.slice(0, 3));
} finally { await browser.close(); server.close(); }
console.log(fehler.length ? `\n${fehler.length} von ${ok.length + fehler.length} Prüfungen fehlgeschlagen.` : `\n${ok.length} von ${ok.length} Prüfungen bestanden.`);
process.exit(fehler.length ? 1 : 0);
