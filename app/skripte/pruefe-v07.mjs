/* =============================================================
   pruefe-v07.mjs – Bedienung der Bausteine kreis, maschine und lupe im Browser (Termin 07)
   Aufruf:  node skripte/pruefe-v07.mjs [Ausgabeordner, Standard: dist]   (erst bauen)
   Startet einen kleinen statischen Server, kein Emulator nötig. Chromium, 1440×900.
   Die Lerneinheit wird im Ordner lektionen/ gesucht (Datei beginnt mit v07-, ist nicht das Labor).
   Geprüft: Zahlenkreis (Ausgangszustand ohne Lösung, 255 + 1 ergibt 0 ohne die Zahl 256, mit Vorzeichen 127 + 1 ergibt −128,
   dieselben Bits, 4 Bit ohne Vorzeichen, ungültiger Start, Tastatur an Auswahl und Schalter), Funktionsmaschine (kein Wert vor dem
   ersten Schritt, return gegen print, ergebnis bleibt None, Tabelle getrennt, ungültige Eingabe), Kommazahl-Lupe (Ausgangszustand
   ohne Ergebnis, 0.1 + 0.2, 0.5 + 0.25, zehnmal 0.1), keine Skriptfehler.
   ============================================================= */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, '..', process.argv[2] || 'dist');
if (!fs.existsSync(WURZEL)) { console.error('Ausgabeordner fehlt: ' + WURZEL); process.exit(2); }
const SEITEN = path.join(WURZEL, 'lektionen');
const seite = fs.existsSync(SEITEN) ? fs.readdirSync(SEITEN).find((n) => /^v07-.*\.html$/.test(n) && !/labor/.test(n)) : null;
if (!seite) { console.error('Lerneinheit von Termin 07 nicht gefunden in ' + SEITEN); process.exit(2); }
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
const M = '−';
const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE', serviceWorkers: 'block' });
  const p = await ctx.newPage();
  const probleme = [];
  p.on('pageerror', (e) => probleme.push(String(e.message || e)));
  await p.goto(BASIS + '/lektionen/' + seite);
  await p.locator('[data-explorable="kreis"] .v07-zahl').waitFor({ timeout: 30000 });

  console.log('\n== kreis');
  const k = p.locator('[data-explorable="kreis"]');
  const zahl = k.locator('.v07-zahl'), bits = k.locator('.v07-bits');
  const text = async (l) => (await l.innerText()).trim();
  pruefe(await text(zahl) === '250' && await text(bits) === '1111 1010', 'Start bei 250 mit den Bits 1111 1010', [await text(zahl), await text(bits)]);
  pruefe(!/Überlauf|Python rechnet/.test(await k.innerText()), 'im Ausgangszustand steht keine Lösung (kein Überlauf)');
  pruefe(await k.locator('.v07-ueber').isHidden(), 'der Kasten für den Überlauf ist verborgen');
  pruefe(await k.locator('svg').getAttribute('aria-label') !== null, 'der Kreis hat einen Text für Screenreader');
  pruefe(!(await k.locator('svg').innerHTML()).includes('v07-ring--neg'), 'ohne Vorzeichen gibt es keine negative Hälfte');
  const plus = k.getByRole('button', { name: 'Plus 1' }), minus = k.getByRole('button', { name: 'Minus 1' });
  for (let i = 0; i < 5; i++) await plus.click();
  pruefe(await text(zahl) === '255' && await text(bits) === '1111 1111', 'nach fünfmal +1 steht der Zähler auf 255', await text(zahl));
  pruefe(await k.locator('.v07-ueber').isHidden(), 'bei 255 ist noch kein Überlauf');
  await plus.click();
  pruefe(await text(zahl) === '0', 'nach 255 + 1 zeigt der Zähler 0', await text(zahl));
  pruefe(/Überlauf: 255 \+ 1 ergibt 0/.test(await k.innerText()) && /Der Platz reicht nicht/.test(await k.innerText()) && !/256/.test(await k.innerText()), 'Überlauf erscheint erst jetzt, die Zahl 256 steht nirgends');
  pruefe(!/[–—]/.test(await k.innerText()), 'kein Gedankenstrich im Baustein');
  await minus.click();
  pruefe(await text(zahl) === '255' && /Überlauf: 0 − 1 ergibt 255/.test(await k.innerText()) && /Der Platz reicht nicht/.test(await k.innerText()), 'nach 0 − 1 steht 255, der Überlauf nach unten wird gemeldet', await text(zahl));
  /* Start setzen */
  const start = k.locator('input[type="text"]');
  await start.fill('300');
  await k.getByRole('button', { name: 'Start setzen' }).click();
  pruefe(await start.getAttribute('aria-invalid') === 'true' && /Der Zähler zeigt nur Zahlen von 0 bis 255\./.test(await k.innerText()), '300 wird abgelehnt, mit Satz');
  pruefe(await text(zahl) === '255', 'bei ungültigem Start bleibt der Zähler stehen');
  await start.fill('128');
  await p.keyboard.press('Enter');
  pruefe(await text(zahl) === '128' && await text(bits) === '1000 0000', 'Eingabetaste im Feld setzt den Start: 128 ist 1000 0000');
  /* mit Vorzeichen */
  const vz = k.getByRole('switch');
  pruefe(await vz.getAttribute('aria-checked') === 'false', 'der Schalter „Mit Vorzeichen“ ist aus');
  await vz.focus();
  await p.keyboard.press('Space');
  pruefe(await vz.getAttribute('aria-checked') === 'true', 'Leertaste schaltet auf „mit Vorzeichen“');
  pruefe(await text(zahl) === M + '128' && await text(bits) === '1000 0000', 'dieselben Bits 1000 0000 sind jetzt −128', await text(zahl));
  pruefe(/Dieselben Bits 1000 0000, andere Lesart: eben noch 128, jetzt −128\./.test(await k.innerText()), 'der Satz zur anderen Lesart steht da');
  pruefe((await k.locator('svg').innerHTML()).includes('v07-ring--neg') && /negativ/.test(await k.locator('svg').innerHTML()), 'die negative Hälfte trägt auch das Wort „negativ“');
  await start.fill('127');
  await k.getByRole('button', { name: 'Start setzen' }).click();
  pruefe(await text(zahl) === '127' && await text(bits) === '0111 1111', '127 ist 0111 1111');
  pruefe(await k.locator('.v07-ueber').isHidden(), 'vor dem Schritt über 127 steht kein Überlauf da');
  await plus.click();
  pruefe(await text(zahl) === M + '128', 'mit Vorzeichen: nach 127 + 1 steht −128', await text(zahl));
  pruefe(/Überlauf: 127 \+ 1 ergibt −128/.test(await k.innerText()) && /Der Platz reicht nicht/.test(await k.innerText()), 'Überlauf: 127 + 1 ergibt −128');
  await start.fill('-1');
  await k.getByRole('button', { name: 'Start setzen' }).click();
  pruefe(await text(zahl) === M + '1' && await text(bits) === '1111 1111', '−1 ist 1111 1111');
  await start.fill('128');
  await k.getByRole('button', { name: 'Start setzen' }).click();
  pruefe(await start.getAttribute('aria-invalid') === 'true' && /von −128 bis 127/.test(await k.innerText()), 'mit Vorzeichen ist 128 als Start nicht erlaubt');
  /* 4 Bit */
  await k.getByRole('radio', { name: '4 Bit' }).click();
  pruefe(await k.getByRole('radio', { name: '4 Bit' }).getAttribute('aria-checked') === 'true', '4 Bit ist gewählt');
  pruefe(await vz.getAttribute('aria-checked') === 'false' && await vz.getAttribute('aria-disabled') === 'true', 'mit 4 Bit ist „mit Vorzeichen“ aus und gesperrt');
  pruefe(/nur bei 8 Bit/.test(await k.innerText()), 'ein Satz sagt, warum der Schalter gesperrt ist');
  pruefe(await text(zahl) === '13' && await text(bits) === '1101', '4 Bit starten bei 13 mit 1101');
  await vz.click({ force: true });
  pruefe(await vz.getAttribute('aria-checked') === 'false', 'ein Klick auf den gesperrten Schalter ändert nichts');
  await plus.click(); await plus.click(); await plus.click();
  pruefe(await text(zahl) === '0' && /Überlauf: 15 \+ 1 ergibt 0/.test(await k.innerText()) && /Der Platz reicht nicht/.test(await k.innerText()), 'mit 4 Bit: 15 + 1 ergibt 0');
  await k.getByRole('radio', { name: '4 Bit' }).focus();
  await p.keyboard.press('ArrowRight');
  pruefe(await k.getByRole('radio', { name: '8 Bit' }).getAttribute('aria-checked') === 'true', 'Pfeiltaste wechselt zu 8 Bit');
  pruefe(await text(zahl) === '250', 'beim Wechsel beginnt der Zähler wieder bei 250');
  pruefe(await k.locator('.v07-ueber').isHidden(), 'der Überlauf-Kasten verschwindet beim Wechsel');
  pruefe((await k.locator('[role="status"]').innerText()).length > 0, 'die Live-Ansage hat einen Text');

  console.log('\n== maschine');
  const m = p.locator('[data-explorable="maschine"]');
  const mAus = m.locator('.v07-ausgabe');
  pruefe(/def begruessen\(name\):/.test(await m.innerText()) && /begruessen\("Lea"\)/.test(await m.innerText()) && /begruessen\("Tom"\)/.test(await m.innerText()), 'vorbelegt: begruessen mit zwei Aufrufen');
  pruefe(/noch nichts ausgegeben/.test(await mAus.innerText()) && !/Hallo/.test(await mAus.innerText()), 'vor dem ersten Schritt ist die Ausgabe leer');
  pruefe((await m.locator('td').allInnerTexts()).every((t) => t.trim() === 'noch leer'), 'vor dem ersten Schritt steht in der Tabelle nichts');
  const einer = m.getByRole('button', { name: 'Ein Schritt' });
  for (let i = 0; i < 5; i++) await einer.click();
  pruefe((await m.locator('td').first().innerText()).trim() === '"Tom"', 'beim zweiten Aufruf bekommt name den Wert "Tom"', await m.locator('td').first().innerText());
  await einer.click();
  pruefe(/Hallo Lea, viel Spaß!\s+Hallo Tom, viel Spaß!/.test(await mAus.innerText()), 'nach sechs Schritten stehen beide Grüße in der Ausgabe');
  pruefe(await einer.getAttribute('aria-disabled') === 'true', 'am Ende ist „Ein Schritt“ gesperrt');
  const sw = m.getByRole('switch');
  pruefe(await sw.getAttribute('aria-disabled') === 'true', 'bei begruessen ist der Schalter „print statt return“ gesperrt');
  await m.getByRole('radio', { name: 'quadrat(x)' }).click();
  pruefe(/ergebnis = quadrat\(4\)/.test(await m.innerText()) && /return x \* x/.test(await m.innerText()), 'quadrat: Programm mit return und Aufruf mit 4');
  pruefe(!/16/.test(await m.innerText()), 'vor dem ersten Schritt steht die 16 nirgends');
  pruefe(await sw.getAttribute('aria-disabled') === 'false' && await sw.getAttribute('aria-checked') === 'false', 'der Schalter ist frei und aus');
  await sw.focus();
  await p.keyboard.press('Enter');
  pruefe(await sw.getAttribute('aria-checked') === 'true' && /print\(x \* x\)/.test(await m.innerText()), 'Eingabetaste schaltet auf print, im Programm steht print(x * x)');
  pruefe(!/None/.test(await m.innerText()), 'vor dem Ausprobieren steht „None“ nirgends');
  for (let i = 0; i < 4; i++) await einer.click();
  pruefe(/^16$/.test((await mAus.innerText()).trim()), 'nach vier Schritten zeigt print die 16 in der Ausgabe', await mAus.innerText());
  pruefe((await m.locator('td').allInnerTexts()).map((t) => t.trim()).join('|') === '4|noch leer', 'x ist 4, ergebnis ist noch leer', await m.locator('td').allInnerTexts());
  await einer.click();
  pruefe((await m.locator('td').allInnerTexts()).map((t) => t.trim()).join('|') === '4|None', 'danach steht in ergebnis None', await m.locator('td').allInnerTexts());
  await einer.click();
  pruefe(/16\s+None/.test(await mAus.innerText()), 'die Ausgabe zeigt 16 und None');
  await sw.click();
  pruefe(/return x \* x/.test(await m.innerText()) && /noch nichts ausgegeben/.test(await mAus.innerText()), 'Umschalten auf return setzt den Ablauf zurück');
  for (let i = 0; i < 5; i++) await einer.click();
  pruefe((await m.locator('td').allInnerTexts()).map((t) => t.trim()).join('|') === '4|16', 'mit return steht in ergebnis die 16', await m.locator('td').allInnerTexts());
  await einer.click();
  pruefe(/^16$/.test((await mAus.innerText()).trim()), 'mit return zeigt print(ergebnis) die 16');
  const eingabe = m.locator('input[type="text"]');
  await eingabe.fill('abc');
  pruefe(await eingabe.getAttribute('aria-invalid') === 'true' && /ganze Zahl von −99 bis 99/.test(await m.innerText()), 'abc wird abgelehnt, mit Satz');
  await eingabe.fill('-5');
  pruefe(/ergebnis = quadrat\(-5\)/.test(await m.innerText()), 'die Zahl -5 steht im Aufruf mit ASCII-Bindestrich');
  for (let i = 0; i < 6; i++) await einer.click();
  pruefe((await m.locator('td').allInnerTexts()).map((t) => t.trim()).join('|') === M + '5|25', 'quadrat(−5) ergibt 25', await m.locator('td').allInnerTexts());
  await m.getByRole('radio', { name: 'doppelt(x)' }).click();
  pruefe((await m.locator('th').allInnerTexts()).some((t) => /zahl \(Hauptprogramm\)/.test(t)), 'bei doppelt gibt es die Spalte zahl im Hauptprogramm');
  pruefe(!/[–—]/.test(await m.innerText()), 'kein Gedankenstrich im Baustein');

  console.log('\n== lupe');
  const l = p.locator('[data-explorable="lupe"]');
  pruefe(!/0\.30000000000000004|nicht genau/.test(await l.innerText()), 'im Ausgangszustand steht kein Ergebnis und keine Lösung');
  pruefe(/Noch nicht gerechnet/.test(await l.innerText()), 'ein Satz sagt, dass noch nicht gerechnet wurde');
  pruefe(await l.locator('.v07-erg').isHidden(), 'der Ergebniskasten ist verborgen');
  const sel = l.locator('select');
  pruefe(await sel.nth(0).inputValue() === '10' && await sel.nth(1).inputValue() === '20', 'vorbelegt sind 0.1 und 0.2');
  await l.getByRole('button', { name: 'Addieren' }).click();
  pruefe(/Python zeigt: 0\.30000000000000004/.test(await l.innerText()), 'Python zeigt 0.30000000000000004');
  pruefe(/Mit 20 Nachkommastellen: 0\.30000000000000004441/.test(await l.innerText()), 'mit 20 Nachkommastellen 0.30000000000000004441');
  pruefe(/nicht genau/.test(await l.locator('.v07-ampel').innerText()), 'die Ampel sagt „nicht genau“ (als Wort)');
  pruefe(/0\.1 \+ 0\.2 == 0\.3 ergibt False/.test(await l.innerText()), '0.1 + 0.2 == 0.3 ergibt False');
  pruefe(/round\(0\.1 \+ 0\.2, 2\) == 0\.3 ergibt True/.test(await l.innerText()), 'mit round(…, 2) ergibt der Vergleich True');
  await sel.nth(0).selectOption('50');
  pruefe(await l.locator('.v07-erg').isHidden() && /Noch nicht gerechnet/.test(await l.innerText()), 'eine neue Zahl räumt das Ergebnis weg, die Vermutung kommt wieder zuerst');
  await sel.nth(1).selectOption('25');
  await l.getByRole('button', { name: 'Addieren' }).click();
  pruefe(/Python zeigt: 0\.75/.test(await l.innerText()) && /genau/.test(await l.locator('.v07-ampel').innerText()) && !/nicht genau/.test(await l.locator('.v07-ampel').innerText()), '0.5 + 0.25 zeigt 0.75, Ampel „genau“');
  pruefe(/0\.5 \+ 0\.25 == 0\.75 ergibt True/.test(await l.innerText()), '0.5 + 0.25 == 0.75 ergibt True');
  /* Teil 2 */
  pruefe(!/0\.9999999999999999/.test(await l.innerText()), 'vor den Schritten steht 0.9999999999999999 nirgends');
  const leinzel = l.getByRole('button', { name: 'Ein Schritt' });
  for (let i = 0; i < 3; i++) await leinzel.click();
  pruefe(/0\.30000000000000004/.test(await l.locator('.v07-tabelle').innerText()), 'nach drei Schritten steht in der Tabelle 0.30000000000000004');
  for (let i = 0; i < 7; i++) await leinzel.click();
  pruefe(/0\.9999999999999999/.test(await l.locator('.v07-tabelle').innerText()) && /Nach zehnmal 0\.1 steht dort nicht 1\.0\./.test(await l.innerText()), 'nach zehn Schritten steht dort 0.9999999999999999');
  await leinzel.click();
  pruefe(/1\.0999999999999999/.test(await l.locator('.v07-tabelle').innerText()), 'der elfte Schritt zeigt 1.0999999999999999');
  pruefe(await leinzel.getAttribute('aria-disabled') === 'true', 'danach ist „Ein Schritt“ gesperrt');
  const jas = await l.locator('.v07-tabelle tbody tr td:last-child').allInnerTexts();
  pruefe(jas.length === 11 && jas.every((t) => t.trim() === 'ja'), 'bei jedem Schritt ist x != 1.0 mit „ja“ beantwortet', jas.length);
  pruefe(!/[–—]/.test(await l.innerText()), 'kein Gedankenstrich im Baustein');

  pruefe(probleme.length === 0, 'keine Skriptfehler', probleme.slice(0, 3));
} finally { await browser.close(); server.close(); }
console.log(fehler.length ? `\n${fehler.length} von ${ok.length + fehler.length} Prüfungen fehlgeschlagen.` : `\n${ok.length} von ${ok.length} Prüfungen bestanden.`);
process.exit(fehler.length ? 1 : 0);
