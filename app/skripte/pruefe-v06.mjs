/* =============================================================
   pruefe-v06.mjs – Bedienung der Bausteine hexfarbe, doppelschleife und xorschrift im Browser (Termin 06)
   Aufruf:  node skripte/pruefe-v06.mjs [Ausgabeordner, Standard: dist]   (erst bauen)
   Startet einen kleinen statischen Server, kein Emulator nötig. Chromium, 1440×900.
   Geprüft: Hex-Farbmischer (Regler, Zahlfeld, Farbcode eintippen, ungültige Eingabe, Farbe als Text), Schleife in Schleife
   (Schritt für Schritt, j beginnt wieder bei 1, Grenzen, Würfelmodus mit 6 Treffern), XOR-Geheimschrift (ELAAB, ?WZZY,
   noch einmal ergibt das Wort, Schlüssel 0, ungültiges Wort), Tastatur an den Schaltern, keine Skriptfehler.
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
  await p.goto(BASIS + '/lektionen/v06-hexadezimal-xor-und-schleifen.html');
  await p.locator('[data-explorable="hexfarbe"] .v06-regler').first().waitFor({ timeout: 30000 });

  console.log('\n== hexfarbe');
  const hex = p.locator('[data-explorable="hexfarbe"]');
  pruefe((await hex.locator('.v06-codegross').innerText()).trim() === '#E2001A', 'Start mit dem Rot der DHBW: #E2001A', await hex.locator('.v06-codegross').innerText());
  pruefe(/Rot 226, Grün 0, Blau 26/.test(await hex.innerText()), 'die Farbe steht auch als Text da');
  pruefe(/1110/.test(await hex.innerText()) && /0010/.test(await hex.innerText()), 'Vierergruppen 1110 und 0010 sind sichtbar');
  const rot = hex.locator('input[type="number"]').first();
  await rot.fill('255');
  await hex.locator('input[type="number"]').nth(1).fill('255');
  await hex.locator('input[type="number"]').nth(2).fill('255');
  pruefe((await hex.locator('.v06-codegross').innerText()).trim() === '#FFFFFF', '255, 255, 255 ergibt #FFFFFF', await hex.locator('.v06-codegross').innerText());
  pruefe(/Weiß/.test(await hex.innerText()), 'Weiß wird als Wort genannt');
  const code = hex.locator('input[type="text"]');
  await code.fill('00ff00');
  pruefe((await hex.locator('.v06-codegross').innerText()).trim() === '#00FF00', 'Eingabe 00ff00 (klein, ohne #) ergibt #00FF00');
  pruefe(/Rot 0, Grün 255, Blau 0/.test(await hex.innerText()) && /Reines Grün/.test(await hex.innerText()), 'Reines Grün als Text');
  pruefe(await hex.locator('input[type="number"]').nth(1).inputValue() === '255', 'das Zahlfeld Grün steht auf 255');
  await code.fill('#12');
  pruefe(await code.getAttribute('aria-invalid') === 'true' && /sechs Hex-Ziffern/.test(await hex.innerText()), 'zu kurzer Farbcode wird mit einem Satz abgelehnt');
  pruefe((await hex.locator('.v06-codegross').innerText()).trim() === '#00FF00', 'bei ungültiger Eingabe bleibt die letzte Farbe stehen');
  await hex.locator('input[type="range"]').first().focus();
  await p.keyboard.press('End');
  pruefe((await hex.locator('.v06-codegross').innerText()).trim() === '#FFFF00', 'Taste Ende am Rot-Regler ergibt #FFFF00', await hex.locator('.v06-codegross').innerText());

  console.log('\n== doppelschleife');
  const ds = p.locator('[data-explorable="doppelschleife"]');
  pruefe(/for i in range\(1, 4\):/.test(await ds.innerText()) && /for j in range\(1, 5\):/.test(await ds.innerText()), 'vorbelegt: range(1, 4) und range(1, 5)');
  pruefe(!/12 Durchl/.test(await ds.innerText()), 'am Anfang steht die Zahl der Durchläufe noch nicht da (Vermutung)');
  const schritt = ds.getByRole('button', { name: 'Ein Schritt' });
  for (let i = 0; i < 4; i++) await schritt.click();
  await schritt.click();
  pruefe(/j beginnt wieder bei 1/.test(await ds.locator('[role="status"]').innerText()), 'beim fünften Schritt beginnt j wieder bei 1', await ds.locator('[role="status"]').innerText());
  pruefe(await ds.locator('.v06-zelle.is-jetzt').count() === 1, 'genau eine Zelle ist die aktive');
  await ds.getByRole('button', { name: 'Bis zum Ende' }).click();
  pruefe(/3 mal 4 = 12/.test(await ds.innerText()), 'am Ende steht 3 mal 4 = 12 Durchläufe');
  pruefe(/Fertig/.test(await ds.innerText()) && await schritt.getAttribute('aria-disabled') === 'true', '„Bis zum Ende“ beendet beide Schleifen, „Ein Schritt“ ist gesperrt');
  const plusI = ds.getByRole('button', { name: 'Grenze für i vergrößern' });
  for (let i = 0; i < 5; i++) await plusI.click({ force: true });
  pruefe(await plusI.getAttribute('aria-disabled') === 'true' && (await ds.locator('output').first().innerText()) === '6', 'Grenze für i geht nicht über 6');
  const wuerfel = ds.getByRole('switch');
  await wuerfel.focus();
  await p.keyboard.press('Space');
  pruefe(await wuerfel.getAttribute('aria-checked') === 'true', 'Leertaste schaltet den Würfelmodus an');
  pruefe(/for i in range\(1, 7\):/.test(await ds.innerText()) && /if i \+ j == 7:/.test(await ds.innerText()), 'Würfelmodus zeigt range(1, 7) und die if-Zeile');
  await ds.getByRole('button', { name: 'Bis zum Ende' }).click();
  pruefe(await ds.locator('.v06-zelle.is-treffer').count() === 6, 'sechs Zellen mit Summe 7 sind hervorgehoben', await ds.locator('.v06-zelle.is-treffer').count());
  pruefe(/Summe 7/.test(await ds.locator('.v06-zelle.is-treffer').first().innerText()), 'ein Treffer trägt das Wort „Summe 7“');
  pruefe(/Treffer bisher: 6/.test(await ds.innerText()), 'der Zähler steht auf 6');

  console.log('\n== xorschrift');
  const xor = p.locator('[data-explorable="xorschrift"]');
  pruefe(/Geheimtext: ELAAB/.test(await xor.innerText()), 'HALLO mit 13 ergibt ELAAB');
  await xor.getByRole('button', { name: 'Noch einmal mit demselben Schlüssel' }).click();
  pruefe(/Danach: HALLO/.test(await xor.innerText()), 'noch einmal mit demselben Schlüssel ergibt HALLO');
  const schl = xor.locator('input[type="number"]');
  await schl.fill('22');
  pruefe(/Geheimtext: \?WZZY/.test(await xor.innerText()), 'Schlüssel 22 ergibt ?WZZY');
  pruefe(/Für 30 gibt es keinen Buchstaben\. Er bleibt als Zahl stehen\./.test(await xor.innerText()), 'der Satz zur 30 steht da');
  await xor.getByRole('button', { name: 'Noch einmal mit demselben Schlüssel' }).click();
  pruefe(/Danach: HALLO/.test(await xor.innerText()), 'auch mit Fragezeichen kommt das Wort zurück');
  await schl.fill('0');
  pruefe(/Dieser Schlüssel ändert nichts\./.test(await xor.innerText()) && /Geheimtext: HALLO/.test(await xor.innerText()), 'Schlüssel 0 ändert nichts, mit Hinweis');
  const kipp = xor.locator('.v06-bit');
  pruefe(await kipp.count() === 5, 'fünf Kippschalter für den Schlüssel');
  await kipp.last().focus();
  await p.keyboard.press('Enter');
  pruefe(await kipp.last().getAttribute('aria-checked') === 'true' && await schl.inputValue() === '1', 'Eingabetaste am Schalter 1 ergibt Schlüssel 1', await schl.inputValue());
  const wortFeld = xor.locator('input[type="text"]');
  await wortFeld.fill('GRÖSSE');
  pruefe(await wortFeld.getAttribute('aria-invalid') === 'true' && /Umlaute und Zahlen gehen nicht/.test(await xor.innerText()), 'ein Wort mit Umlaut wird abgelehnt');
  await wortFeld.fill('zebra');
  pruefe(/Wort ZEBRA/.test(await xor.innerText()), 'Kleinbuchstaben werden zu Großbuchstaben');

  pruefe(probleme.length === 0, 'keine Skriptfehler', probleme.slice(0, 3));
} finally { await browser.close(); server.close(); }
console.log(fehler.length ? `\n${fehler.length} von ${ok.length + fehler.length} Prüfungen fehlgeschlagen.` : `\n${ok.length} von ${ok.length} Prüfungen bestanden.`);
process.exit(fehler.length ? 1 : 0);
