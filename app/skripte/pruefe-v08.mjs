/* =============================================================
   pruefe-v08.mjs – Bedienung der Bausteine umwandler, raeume und kette im Browser (Termin 08)
   Aufruf:  node skripte/pruefe-v08.mjs [Ausgabeordner, Standard: dist]   (erst bauen)
   Startet einen kleinen statischen Server, kein Emulator nötig. Chromium, 1440×900.
   Die Lerneinheit wird im Ordner lektionen/ gesucht (Datei beginnt mit v08-, ist nicht das Labor).
   Geprüft: Umwandler (Ausgangszustand ohne Ergebnis, int(3.7) ergibt 3, str(5) mit Anführungszeichen, "5" + "3" ergibt 53,
   beide Meldungen wörtlich, Ergebnis verschwindet bei neuer Wahl, Tastatur), Zwei Räume (Ausgangszustand ohne Namen und ohne Meldung,
   Programm A bis zum NameError, Kasten der Funktion weg nach return, Programm B mit zwei x, Wechsel setzt zurück),
   Aufrufkette (leerer Stapel, drei Kästen auf dem Höhepunkt, Rechnung 7 % 2, graue Zeilen erst am Ende, Summe 10), keine Skriptfehler.
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
const seite = fs.existsSync(SEITEN) ? fs.readdirSync(SEITEN).find((n) => /^v08-.*\.html$/.test(n) && !/labor/.test(n)) : null;
if (!seite) { console.error('Lerneinheit von Termin 08 nicht gefunden in ' + SEITEN); process.exit(2); }
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
  await p.goto(BASIS + '/lektionen/' + seite);
  await p.locator('[data-explorable="umwandler"] .v08-wahl').first().waitFor({ timeout: 30000 });
  const text = async (l) => (await l.innerText()).trim();
  const kasten = async (b) => (await b.locator('.v08-kasten').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());

  console.log('\n== umwandler');
  const u = p.locator('[data-explorable="umwandler"]');
  pruefe((await u.locator('.v08-hinweis').allInnerTexts()).every((t) => t.trim() === 'Noch nichts ausgeführt. Vermute, wähle und drück auf Ausführen.') && await u.locator('.v08-hinweis').count() === 2,
    'im Ausgangszustand zeigen beide Teile nur den Satz „Noch nichts ausgeführt“');
  pruefe(await u.locator('.v08-erg').first().isHidden() && await u.locator('.v08-erg').nth(1).isHidden(), 'beide Ergebniskästen sind verborgen');
  pruefe(!/TypeError|Ausgabe:|Typ des Ergebnisses/.test(await u.innerText()), 'im Ausgangszustand steht keine Ausgabe, kein Typ und keine Meldung');
  const los = u.getByRole('button', { name: 'Ausführen' });
  /* Teil 1 */
  await u.getByRole('radiogroup', { name: 'Wert' }).getByRole('radio', { name: '3.7' }).click();
  await u.getByRole('radiogroup', { name: 'Funktion' }).getByRole('radio', { name: 'int' }).click();
  pruefe(await u.locator('.v08-erg').first().isHidden(), 'nach der Wahl, vor dem Ausführen, steht noch kein Ergebnis da');
  await los.first().click();
  const e1 = u.locator('.v08-erg').first();
  pruefe(/print\(int\(3\.7\)\)/.test(await text(e1)) && /Ausgabe: 3\b/.test(await text(e1)) && /Typ des Ergebnisses: int/.test(await text(e1)), 'int(3.7) ergibt 3 vom Typ int', await text(e1));
  await u.getByRole('radiogroup', { name: 'Funktion' }).getByRole('radio', { name: 'float' }).click();
  pruefe(await e1.isHidden(), 'eine neue Wahl räumt das Ergebnis weg');
  await u.getByRole('radiogroup', { name: 'Wert' }).getByRole('radio', { name: '5', exact: true }).click();
  await los.first().click();
  pruefe(/Ausgabe: 5\.0/.test(await text(e1)) && /Typ des Ergebnisses: float/.test(await text(e1)), 'float(5) ergibt 5.0');
  await u.getByRole('radiogroup', { name: 'Funktion' }).getByRole('radio', { name: 'str' }).click();
  await los.first().click();
  pruefe(/Typ des Ergebnisses: str/.test(await text(e1)) && /Als Wert geschrieben: '5'/.test(await text(e1)), "str(5) hat den Typ str und steht als '5' da", await text(e1));
  /* Tastatur */
  const fg = u.getByRole('radiogroup', { name: 'Funktion' });
  await fg.getByRole('radio', { name: 'str' }).focus();
  await p.keyboard.press('ArrowLeft');
  pruefe(await fg.getByRole('radio', { name: 'float' }).getAttribute('aria-checked') === 'true', 'die Pfeiltaste wechselt die Funktion');
  /* Teil 2 */
  const a = u.getByRole('radiogroup', { name: 'Erste Zahl' }), b = u.getByRole('radiogroup', { name: 'Zweite Zahl' });
  const e2 = u.locator('.v08-erg').nth(1);
  await los.nth(1).click();
  pruefe(/print\(5 \+ 3\)/.test(await text(e2)) && /Ausgabe: 8/.test(await text(e2)), '5 + 3 ergibt 8');
  await a.getByRole('radio', { name: '"5"' }).click(); await b.getByRole('radio', { name: '"3"' }).click();
  await los.nth(1).click();
  pruefe(/Ausgabe: 53/.test(await text(e2)), '"5" + "3" ergibt 53', await text(e2));
  await b.getByRole('radio', { name: '3', exact: true }).click();
  await los.nth(1).click();
  pruefe(/TypeError: can only concatenate str \(not "int"\) to str/.test(await text(e2)) && /Das Programm bricht in dieser Zeile ab\./.test(await text(e2)), '"5" + 3 meldet den TypeError, mit Satz');
  await a.getByRole('radio', { name: '5', exact: true }).click(); await b.getByRole('radio', { name: '"3"' }).click();
  await los.nth(1).click();
  pruefe(/TypeError: unsupported operand type\(s\) for \+: 'int' and 'str'/.test(await text(e2)), '5 + "3" meldet die andere Zeile');
  pruefe(!/[–—]/.test(await u.innerText()), 'kein Gedankenstrich im Baustein');

  console.log('\n== raeume');
  const r = p.locator('[data-explorable="raeume"]');
  const rEin = r.getByRole('button', { name: 'Ein Schritt' }), rVorn = r.getByRole('button', { name: 'Von vorn' });
  const rAus = r.locator('.v08-ausgabe');
  pruefe(/def quadrat\(x\):/.test(await r.innerText()) && /print\(ergebnis\)/.test(await r.innerText()), 'vorbelegt ist Programm A');
  pruefe((await kasten(r)).length === 0 && /noch nichts ausgegeben/.test(await text(rAus)) && await r.locator('.v08-meldung').isHidden(), 'im Ausgangszustand gibt es keine Kästen, keine Ausgabe und keine Meldung');
  pruefe(!/NameError|16/.test(await r.innerText()), 'im Ausgangszustand steht weder NameError noch die 16');
  pruefe(await rVorn.getAttribute('aria-disabled') === 'true', '„Von vorn“ ist am Anfang gesperrt');
  await rEin.click(); await rEin.click();
  pruefe(JSON.stringify(await kasten(r)) === JSON.stringify(['Hauptprogramm keine Namen', 'quadrat (läuft gerade) x = 4']), 'beim Aufruf entsteht der Kasten quadrat mit x = 4', await kasten(r));
  await rEin.click();
  pruefe((await kasten(r))[1].includes('ergebnis = 16'), 'ergebnis steht im Kasten der Funktion');
  await rEin.click();
  pruefe((await kasten(r)).length === 1 && /Rückgabewert unterwegs: 16/.test(await r.innerText()), 'nach return ist der Kasten weg, der Wert 16 ist unterwegs');
  await rEin.click(); await rEin.click();
  pruefe(/^16$/.test(await text(rAus)) && (await kasten(r))[0].includes('zahl = 16') && !(await kasten(r))[0].includes('ergebnis'), 'zahl ist 16, print zeigt 16, im Hauptkasten steht kein ergebnis');
  pruefe(await r.locator('.v08-meldung').isHidden(), 'die Meldung kommt erst im letzten Schritt');
  await rEin.click();
  pruefe(/NameError: name 'ergebnis' is not defined/.test(await text(r.locator('.v08-meldung'))), 'im letzten Schritt steht der NameError wörtlich');
  pruefe(await rEin.getAttribute('aria-disabled') === 'true', 'am Ende ist „Ein Schritt“ gesperrt');
  await rVorn.click();
  pruefe((await kasten(r)).length === 0 && await r.locator('.v08-meldung').isHidden(), '„Von vorn“ räumt Kästen und Meldung weg');
  await r.getByRole('radio', { name: 'Programm B' }).click();
  pruefe(/def verdoppeln\(x\):/.test(await r.innerText()) && (await kasten(r)).length === 0, 'Programm B beginnt leer');
  for (let i = 0; i < 4; i++) await rEin.click();
  pruefe(JSON.stringify(await kasten(r)) === JSON.stringify(['Hauptprogramm x = 5', 'verdoppeln (läuft gerade) x = 10']), 'zwei Plätze: draußen x = 5, in der Funktion x = 10', await kasten(r));
  await rEin.click();
  pruefe((await kasten(r)).length === 1 && /Rückgabewert unterwegs: 10/.test(await r.innerText()), 'nach return ist der Kasten von verdoppeln weg');
  await rEin.click(); await rEin.click(); await rEin.click();
  pruefe(/^5\s+10$/.test(await text(rAus)), 'die Ausgabe zeigt 5 und 10', await text(rAus));
  pruefe(await r.locator('.v08-meldung').isHidden(), 'Programm B hat keine Meldung');
  await r.getByRole('radio', { name: 'Programm B' }).focus();
  await p.keyboard.press('ArrowLeft');
  pruefe(await r.getByRole('radio', { name: 'Programm A' }).getAttribute('aria-checked') === 'true' && (await kasten(r)).length === 0, 'Pfeiltaste wechselt zu Programm A und setzt zurück');
  pruefe((await r.locator('[role="status"]').innerText()).length > 0, 'die Live-Ansage hat einen Text');
  pruefe(!/[–—]/.test(await r.innerText()), 'kein Gedankenstrich im Baustein');

  console.log('\n== kette');
  const k = p.locator('[data-explorable="kette"]');
  const kEin = k.getByRole('button', { name: 'Ein Schritt' });
  pruefe(/print\(sieger\(7\)\)/.test(await k.innerText()), 'vorbelegt ist die Summe 7');
  pruefe((await kasten(k)).length === 0 && /noch nichts ausgegeben/.test(await text(k.locator('.v08-ausgabe'))), 'im Ausgangszustand ist der Stapel leer');
  pruefe((await k.locator('.v08-zeile.is-grau').count()) === 0, 'am Anfang ist keine Zeile grau');
  for (let i = 0; i < 3; i++) await kEin.click();
  pruefe((await kasten(k)).length === 2, 'nach dem Aufruf von sieger stehen zwei Kästen da');
  await kEin.click();
  pruefe((await kasten(k)).length === 3 && (await kasten(k))[2].includes('n = 7'), 'beim Aufruf von ist_gerade stehen drei Kästen da', await kasten(k));
  await kEin.click();
  pruefe(/Rechnung: 7 % 2 ist 1. Der Rest ist nicht 0./.test((await kasten(k))[2]), 'beim Rechnen steht 7 % 2 ist 1', await kasten(k));
  pruefe((await k.locator('.v08-zeile.is-grau').count()) === 0, 'vor dem Ende ist keine Zeile grau');
  await kEin.click();
  pruefe((await kasten(k)).length === 2 && /Rückgabewert unterwegs: False/.test(await k.innerText()), 'ist_gerade ist fertig, sein Kasten ist weg, False ist unterwegs');
  await kEin.click(); await kEin.click();
  pruefe(/^Ben$/.test(await text(k.locator('.v08-ausgabe'))), 'am Ende zeigt print Ben');
  const grau = await k.locator('.v08-zeile.is-grau').allInnerTexts();
  pruefe(grau.length === 2 && grau.every((t) => /lief nicht/.test(t)), 'am Ende sind zwei Zeilen grau und tragen das Wort „lief nicht“', grau);
  await k.getByRole('radio', { name: '10', exact: true }).click();
  pruefe((await kasten(k)).length === 0 && (await k.locator('.v08-zeile.is-grau').count()) === 0 && /print\(sieger\(10\)\)/.test(await k.innerText()), 'eine neue Summe beginnt von vorn');
  for (let i = 0; i < 5; i++) await kEin.click();
  pruefe(/Rechnung: 10 % 2 ist 0. Der Rest ist 0, der Vergleich mit 0 stimmt./.test((await kasten(k))[2]), 'bei 10 steht 10 % 2 ist 0');
  for (let i = 0; i < 3; i++) await kEin.click();
  pruefe(/^Anna$/.test(await text(k.locator('.v08-ausgabe'))), 'bei 10 zeigt print Anna');
  pruefe(!/[–—]/.test(await k.innerText()), 'kein Gedankenstrich im Baustein');

  pruefe(probleme.length === 0, 'keine Skriptfehler', probleme.slice(0, 3));
} finally { await browser.close(); server.close(); }
console.log(fehler.length ? `\n${fehler.length} von ${ok.length + fehler.length} Prüfungen fehlgeschlagen.` : `\n${ok.length} von ${ok.length} Prüfungen bestanden.`);
process.exit(fehler.length ? 1 : 0);
