/* =============================================================
   pruefe-v10.mjs – Bedienung der Bausteine treppe, zeichen und halbieren im Browser (Termin 10)
   Aufruf:  node skripte/pruefe-v10.mjs [Ausgabeordner, Standard: dist]   (erst bauen)
   Startet einen kleinen statischen Server, kein Emulator nötig. Chromium, 1440×900.
   Die Lerneinheit wird im Ordner lektionen/ gesucht (Datei beginnt mit v10-, ist nicht das Labor).
   Der Zufall der Seite ist festgelegt (Math.random gibt 0.63): Die geheime Zahl ist dann 64.
   Geprüft: Speicher-Treppe (Ausgangszustand ohne Zeiten, Zeitlupe erst nach dem Klick, Wartebalken läuft, SSD 17 Minuten,
   Festplatte 28 Stunden, keine echten Zugriffszeiten, Tastatur), Zeichen sind Zahlen (leeres Feld ohne Tabelle, 5 ist 53, A ist 65,
   Tauschen ändert nur Buchstaben um 32, fremde Zeichen werden abgelehnt, höchstens 8 Zeichen), Immer die Mitte (Ausgangszustand ohne
   Folge und ohne Höchstzahl, geheime Zahl erst nach dem Treffer, die Mitte tippen trifft 64 im 7. Versuch, ungültige Tipps),
   kein Gedankenstrich, keine Skriptfehler.
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
const seite = fs.existsSync(SEITEN) ? fs.readdirSync(SEITEN).find((n) => /^v10-.*\.html$/.test(n) && !/labor/.test(n)) : null;
if (!seite) { console.error('Lerneinheit von Termin 10 nicht gefunden in ' + SEITEN); process.exit(2); }
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
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE', serviceWorkers: 'block', reducedMotion: 'no-preference' });
  const p = await ctx.newPage();
  const probleme = [];
  p.on('pageerror', (e) => probleme.push(String(e.message || e)));
  await p.addInitScript(() => { Math.random = () => 0.63; });
  await p.goto(BASIS + '/lektionen/' + seite);
  await p.locator('[data-explorable="treppe"] .v10-reihe').first().waitFor({ timeout: 30000 });
  const text = async (l) => (await l.innerText()).trim();

  console.log('\n== treppe');
  const t = p.locator('[data-explorable="treppe"]');
  const zeiten = t.locator('.v10-zeit');
  pruefe((await zeiten.allInnerTexts()).map((x) => x.trim()).join('|') === '?|?|?|?', 'im Ausgangszustand zeigt jede Zeit „?“', await zeiten.allInnerTexts());
  pruefe(!/Sekunde|Minuten|Stunden|Zeitlupe/.test(await t.innerText()), 'im Ausgangszustand steht keine Zeit und keine Zeitlupe da');
  pruefe(/ungefähr 8 bis 32 GB/.test(await t.innerText()) && /ungefähr 1 bis 4 TB/.test(await t.innerText()), 'die Größen stehen da, als „ungefähr“');
  const stufen = t.locator('button.v10-stufe');
  pruefe(await stufen.count() === 4, 'vier Stufen zum Anklicken');
  pruefe((await stufen.evaluateAll((l) => l.map((b) => b.getAttribute('aria-pressed')))).every((x) => x === 'false'), 'keine Stufe ist gewählt');
  const fuell = (i) => t.locator('.v10-warte__fuell').nth(i);
  const breite = async (i) => fuell(i).evaluate((e) => e.getBoundingClientRect().width);
  pruefe(await breite(0) === 0 && await breite(1) === 0 && await breite(2) === 0 && await breite(3) === 0, 'im Ausgangszustand läuft kein Wartebalken');
  /* Arbeitsspeicher: 1 Sekunde */
  await stufen.nth(1).click();
  pruefe(await stufen.nth(1).getAttribute('aria-pressed') === 'true', 'die gewählte Stufe ist markiert');
  pruefe(/läuft/.test(await text(zeiten.nth(1))), 'während der Balken läuft, steht „läuft“ statt der Zeit', await text(zeiten.nth(1)));
  await p.waitForTimeout(400);
  pruefe(await breite(1) > 0, 'der Wartebalken füllt sich');
  await p.waitForTimeout(1200);
  pruefe(await text(zeiten.nth(1)) === '1 Sekunde', 'Arbeitsspeicher: 1 Sekunde', await text(zeiten.nth(1)));
  pruefe(/In Zeitlupe: 1 Sekunde/.test(await t.innerText()), 'ein Satz sagt „In Zeitlupe“');
  pruefe(await text(zeiten.nth(2)) === '?' && await text(zeiten.nth(3)) === '?', 'die anderen Zeiten bleiben „?“');
  /* Prozessor: 0,01 Sekunden */
  await stufen.nth(0).click();
  await p.waitForTimeout(300);
  pruefe(await text(zeiten.nth(0)) === '0,01 Sekunden', 'Speicher im Prozessor: 0,01 Sekunden', await text(zeiten.nth(0)));
  /* SSD: Tastatur, gerafft */
  await stufen.nth(2).focus();
  await p.keyboard.press('Enter');
  pruefe(/läuft/.test(await text(zeiten.nth(2))) && /schneller als die Zeitlupe/.test(await t.innerText()), 'SSD: der Balken läuft schneller als die Zeitlupe, das steht dabei');
  await p.waitForFunction(() => /17 Minuten/.test(document.querySelector('[data-explorable="treppe"]').innerText), null, { timeout: 8000 });
  pruefe(await text(zeiten.nth(2)) === 'rund 17 Minuten', 'SSD: rund 17 Minuten', await text(zeiten.nth(2)));
  /* Festplatte */
  await stufen.nth(3).focus();
  await p.keyboard.press('Space');
  await p.waitForFunction(() => /28 Stunden/.test(document.querySelector('[data-explorable="treppe"]').innerText), null, { timeout: 10000 });
  pruefe(await text(zeiten.nth(3)) === 'rund 28 Stunden', 'Festplatte: rund 28 Stunden', await text(zeiten.nth(3)));
  pruefe(!/Nanosekunde|Mikrosekunde|Millisekunde|\bns\b|µs|\bms\b/.test(await t.innerText()), 'echte Zugriffszeiten stehen nirgends');
  pruefe(!/[–—]/.test(await t.innerText()), 'kein Gedankenstrich im Baustein');

  console.log('\n== zeichen');
  const z = p.locator('[data-explorable="zeichen"]');
  const feld = z.locator('input[type="text"]');
  const karten = z.locator('.v10-karte');
  const tauschen = z.getByRole('button', { name: 'Groß und klein tauschen' });
  pruefe(await feld.inputValue() === '' && await karten.count() === 0, 'im Ausgangszustand ist das Feld leer und es steht keine Tabelle da');
  pruefe(!/\b(65|53|97|90|122)\b/.test(await z.innerText()), 'im Ausgangszustand steht keine Zahl da');
  pruefe(await tauschen.getAttribute('aria-disabled') === 'true', 'ohne Zeichen ist „Groß und klein tauschen“ gesperrt');
  await feld.fill('5');
  pruefe(await karten.count() === 1 && /53/.test(await text(karten.first())), 'das Zeichen 5 hat die Zahl 53', await text(karten.first()));
  await feld.fill('A a');
  pruefe((await karten.locator('.v10-karte__code').allInnerTexts()).map((x) => x.trim()).join('|') === '65|32|97', 'A, Leerzeichen, a sind 65, 32, 97');
  await feld.fill('Ab 5');
  await tauschen.click();
  pruefe(await feld.inputValue() === 'aB 5', 'Tauschen macht aus „Ab 5“ „aB 5“', await feld.inputValue());
  pruefe((await karten.locator('.v10-karte__code').allInnerTexts()).map((x) => x.trim()).join('|') === '97|66|32|53', 'die Zahlen sind jetzt 97, 66, 32, 53');
  pruefe((await karten.locator('.v10-karte__aend').allInnerTexts()).map((x) => x.trim()).join('|') === '+32|' + M + '32', 'nur Buchstaben ändern sich: +32 und −32');
  await feld.fill('Zürich');
  pruefe(await feld.getAttribute('aria-invalid') === 'true' && /Dieses Zeichen kennt der Baustein nicht\./.test(await z.innerText()), 'Umlaut wird abgelehnt, mit Satz');
  pruefe(await karten.count() === 0 && await tauschen.getAttribute('aria-disabled') === 'true', 'bei ungültiger Eingabe stehen keine Karten da und Tauschen ist gesperrt');
  await feld.fill('a!');
  pruefe(/Dieses Zeichen kennt der Baustein nicht\./.test(await z.innerText()), 'ein Satzzeichen wird abgelehnt');
  await feld.fill('123456789');
  pruefe(await feld.getAttribute('aria-invalid') === 'true' && /höchstens 8 Zeichen/.test(await z.innerText()), 'mehr als 8 Zeichen werden abgelehnt');
  await feld.fill('Hallo');
  pruefe(await feld.getAttribute('aria-invalid') === null && await karten.count() === 5, 'nach einer gültigen Eingabe verschwindet die Meldung');
  pruefe((await z.locator('[role="status"]').innerText()).length > 0, 'die Live-Ansage hat einen Text');
  pruefe(!/[–—]/.test(await z.innerText()), 'kein Gedankenstrich im Baustein');

  console.log('\n== halbieren');
  const h = p.locator('[data-explorable="halbieren"]');
  const tippFeld = h.locator('input[type="text"]');
  const tipp = h.getByRole('button', { name: 'Tipp', exact: true });
  const mitte = h.getByRole('button', { name: 'Die Mitte tippen' });
  const zaehler = h.locator('.v10-zaehler');
  const treffer = h.locator('.v10-treffer');
  pruefe(/Versuche: 0/.test(await text(zaehler)), 'der Zähler beginnt bei 0');
  pruefe(await h.locator('.v10-tipps li').count() === 0, 'im Ausgangszustand gibt es keine Tipps');
  pruefe(await treffer.isHidden(), 'die geheime Zahl steht im Ausgangszustand nicht da');
  pruefe(!/\b64\b/.test(await h.innerText()) && !/Höchstens|höchstens|\b7\b/.test(await h.innerText()), 'weder die geheime Zahl noch eine Höchstzahl stehen da');
  pruefe(/zwischen 1 und 100/.test(await h.innerText()), 'der Bereich ist 1 bis 100');
  await tippFeld.fill('abc');
  await tipp.click();
  pruefe(await tippFeld.getAttribute('aria-invalid') === 'true' && /Schreib eine ganze Zahl von 1 bis 100\./.test(await h.innerText()), 'ein Text als Tipp wird abgelehnt');
  await tippFeld.fill('101');
  await p.keyboard.press('Enter');
  pruefe(/Schreib eine ganze Zahl von 1 bis 100\./.test(await h.innerText()) && /Versuche: 0/.test(await text(zaehler)), '101 wird abgelehnt und zählt nicht');
  await tippFeld.fill('80');
  await p.keyboard.press('Enter');
  pruefe(/Versuche: 1/.test(await text(zaehler)) && /Zu groß/.test(await text(h.locator('.v10-tipps'))), 'Tipp 80: Zu groß, ein Versuch');
  pruefe(/zwischen 1 und 79/.test(await h.innerText()), 'der Bereich schrumpft auf 1 bis 79');
  await tippFeld.fill('10');
  await tipp.click();
  pruefe(/zwischen 11 und 79/.test(await h.innerText()) && /Zu klein/.test(await text(h.locator('.v10-tipps'))), 'Tipp 10: Zu klein, der Bereich ist 11 bis 79');
  /* neues Spiel, dann nur mit der Mitte */
  await h.getByRole('button', { name: 'Neue Zahl' }).click();
  pruefe(/Versuche: 0/.test(await text(zaehler)) && await h.locator('.v10-tipps li').count() === 0, '„Neue Zahl“ setzt alles zurück');
  const folge = [];
  for (let i = 0; i < 7; i++) {
    await mitte.click();
    folge.push((await h.locator('.v10-tipps__zahl').first().innerText()).trim());
    if (i < 6) pruefe(await treffer.isHidden(), 'vor dem Treffer steht die geheime Zahl nicht da (Tipp ' + (i + 1) + ')');
  }
  pruefe(folge.join(',') === '50,75,62,68,65,63,64', 'die Mitten für 64: 50, 75, 62, 68, 65, 63, 64', folge);
  pruefe(/Versuche: 7/.test(await text(zaehler)) && await treffer.isVisible() && /Die Zahl war 64\./.test(await text(treffer)), 'nach dem Treffer: 7 Versuche, die Zahl war 64', await text(treffer));
  pruefe(/Richtig!/.test(await text(h.locator('.v10-tipps'))), 'der letzte Hinweis ist „Richtig!“');
  pruefe(await mitte.getAttribute('aria-disabled') === 'true' && await tippFeld.isDisabled(), 'nach dem Treffer sind Tippen und Mitte gesperrt');
  await mitte.click({ force: true });
  pruefe(/Versuche: 7/.test(await text(zaehler)), 'ein Klick auf den gesperrten Knopf ändert nichts');
  await h.getByRole('button', { name: 'Neue Zahl' }).click();
  pruefe(await treffer.isHidden() && await tippFeld.isEnabled(), 'nach „Neue Zahl“ ist wieder alles frei, der Treffer ist verborgen');
  pruefe((await h.locator('[role="status"]').innerText()).length > 0, 'die Live-Ansage hat einen Text');
  pruefe(!/[–—]/.test(await h.innerText()), 'kein Gedankenstrich im Baustein');

  pruefe(probleme.length === 0, 'keine Skriptfehler', probleme.slice(0, 3));
} finally { await browser.close(); server.close(); }
console.log(fehler.length ? `\n${fehler.length} von ${ok.length + fehler.length} Prüfungen fehlgeschlagen.` : `\n${ok.length} von ${ok.length} Prüfungen bestanden.`);
process.exit(fehler.length ? 1 : 0);
