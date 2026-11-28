/* =============================================================
   pruefe-v09.mjs – Bedienung der Bausteine bauteile, zerlegen und spielzeug im Browser (Termin 09)
   Aufruf:  node skripte/pruefe-v09.mjs [Ausgabeordner, Standard: dist]   (erst bauen)
   Startet einen kleinen statischen Server, kein Emulator nötig. Chromium, 1440×900.
   Die Lerneinheit wird im Ordner lektionen/ gesucht (Datei beginnt mit v09-, ist nicht das Labor).
   Geprüft: Rechner-Baukasten (Ausgangszustand ohne Lösung und ohne leuchtende Bauteile, Taste drücken, Strom aus leert nur den
   Arbeitsspeicher, nach Strom aus ohne Speichern Level 3, mit Speichern Level 5, bei ausgeschaltetem Rechner nur eine Meldung),
   Programm zerlegen (Ausgangszustand nur das lange Programm ohne Zahl der Zeilen und ohne Ausgabe, Laufenlassen erst nach dem Zerlegen,
   beide Ausgaben gleich, Ablauf mit Sprung in die Funktion, neue Eingabe räumt die Ausgabe weg), Spielzeug-Rechner (Ausgangszustand ohne
   Zwischenergebnis, Takt für Takt, Beispiel C gleich 8 nach 12 Takten, Vermutungsprogramm D gleich 16 nach 18 Takten, Tastatur an der Auswahl),
   keine Skriptfehler.
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
const seite = fs.existsSync(SEITEN) ? fs.readdirSync(SEITEN).find((n) => /^v09-.*\.html$/.test(n) && !/labor/.test(n)) : null;
if (!seite) { console.error('Lerneinheit von Termin 09 nicht gefunden in ' + SEITEN); process.exit(2); }
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
  await p.locator('[data-explorable="bauteile"] .v09-bau__svg').waitFor({ timeout: 30000 });
  const text = async (l) => (await l.innerText()).trim();
  const kein = async (l) => !/[–—]/.test(await l.innerText());

  console.log('\n== bauteile');
  const b = p.locator('[data-explorable="bauteile"]');
  const svg = b.locator('svg');
  const svgText = async () => (await svg.locator('text').evaluateAll((n) => n.map((x) => x.textContent))).join(' | ');
  pruefe(await svg.getAttribute('aria-label') !== null, 'das Schema hat einen Text für Screenreader');
  pruefe(/Spielstand: Level 3/.test(await svgText()) && /Spiel läuft: Level 5/.test(await svgText()), 'Ausgangszustand: SSD Level 3, Arbeitsspeicher Level 5', await svgText());
  pruefe(await b.locator('.v09-box.is-aktiv').count() === 0 && await b.locator('.v09-pfeil').count() === 0, 'im Ausgangszustand leuchtet kein Bauteil und kein Pfeil');
  pruefe(!/flüchtig|dauerhaft|verschwind|bleibt/.test(await b.innerText()), 'im Ausgangszustand steht keine Lösung (kein Wort zu flüchtig oder dauerhaft)');
  pruefe((await b.getByRole('button').allInnerTexts()).slice(0, 6).join('|') === 'Spiel starten|Taste drücken|Rechnen|Ergebnis zeigen|Spielstand speichern|Strom aus', 'sechs Knöpfe in der vorgesehenen Reihenfolge');
  await b.getByRole('button', { name: 'Taste drücken' }).click();
  pruefe(await b.locator('.v09-box.is-aktiv').count() === 2 && /beteiligt/.test(await svgText()), 'Taste drücken: zwei Bauteile leuchten, dazu das Wort „beteiligt“');
  pruefe(await b.locator('.v09-pfeil').count() === 2 && await b.locator('.v09-leitung.is-aktiv').count() === 2, 'Taste drücken: zwei Pfeile auf zwei Leitungen am Bus');
  pruefe(/Die Taste geht über die Eingabe und den Bus zum Prozessor\./.test(await b.innerText()), 'ein Satz sagt, was passiert');
  pruefe(await b.getByRole('button', { name: 'Taste drücken' }).getAttribute('aria-pressed') === 'true', 'der gedrückte Knopf ist als gedrückt gekennzeichnet');
  await b.getByRole('button', { name: 'Rechnen' }).click();
  pruefe(await b.locator('.v09-pfeil').count() === 4, 'Rechnen: Pfeile in beide Richtungen zwischen Prozessor und Arbeitsspeicher');
  /* Strom aus ohne Speichern */
  await b.getByRole('button', { name: 'Strom aus' }).click();
  pruefe(await b.locator('.v09-box.is-leer').count() === 1 && /leer/.test(await svgText()), 'Strom aus: der Arbeitsspeicher ist leer und grau (dazu das Wort „leer“)');
  pruefe(/Spielstand: Level 3/.test(await svgText()), 'Strom aus: die SSD zeigt weiter Level 3');
  pruefe(await b.locator('.v09-box.is-aktiv').count() === 0, 'Strom aus: kein Bauteil leuchtet');
  await b.getByRole('button', { name: 'Taste drücken' }).click();
  pruefe(/Der Rechner ist aus und der Arbeitsspeicher ist leer\./.test(await b.innerText()) && await b.locator('.v09-box.is-aktiv').count() === 0, 'bei ausgeschaltetem Rechner kommt nur eine Meldung');
  await b.getByRole('button', { name: 'Spiel starten' }).click();
  pruefe(/Spiel läuft: Level 3/.test(await svgText()) && await b.locator('.v09-box.is-leer').count() === 0, 'ohne Speichern startet das Spiel wieder bei Level 3', await svgText());
  pruefe(/Das Spiel wird von der SSD in den Arbeitsspeicher geladen\./.test(await b.innerText()), 'Spiel starten: der Satz zum Laden');
  /* mit Speichern */
  await b.getByRole('button', { name: 'Von vorn' }).click();
  pruefe(/Spiel läuft: Level 5/.test(await svgText()) && /Spielstand: Level 3/.test(await svgText()), 'Von vorn: wieder der Ausgangszustand');
  await b.getByRole('button', { name: 'Spielstand speichern' }).click();
  pruefe(/Spielstand: Level 5/.test(await svgText()), 'Spielstand speichern: die SSD zeigt Level 5');
  await b.getByRole('button', { name: 'Strom aus' }).click();
  await b.getByRole('button', { name: 'Spiel starten' }).click();
  pruefe(/Spiel läuft: Level 5/.test(await svgText()), 'mit Speichern vor Strom aus startet das Spiel bei Level 5');
  pruefe((await b.locator('[role="status"]').innerText()).length > 0, 'die Live-Ansage hat einen Text');
  pruefe(await kein(b), 'kein Gedankenstrich im Baustein');
  await b.getByRole('button', { name: 'Ergebnis zeigen' }).focus();
  await p.keyboard.press('Enter');
  pruefe(/Das Ergebnis geht über den Bus zum Arbeitsspeicher und weiter zur Ausgabe\./.test(await b.innerText()), 'die Eingabetaste löst einen Knopf aus');

  console.log('\n== zerlegen');
  const z = p.locator('[data-explorable="zerlegen"]');
  const progs = z.locator('.v09-prog');
  pruefe(await progs.first().locator('.v09-zeile').count() === 14, 'das lange Programm hat 14 Zeilen');
  pruefe(await progs.nth(1).isHidden(), 'im Ausgangszustand gibt es nur das lange Programm');
  pruefe(!/preis_von|antwort\(|Hauptprogramm|4 Zeilen/.test(await z.innerText()), 'im Ausgangszustand stehen weder die Funktionen noch die Zahl der Zeilen im Hauptprogramm');
  pruefe(await z.locator('.v09-ausgabe').first().isHidden(), 'im Ausgangszustand steht keine Ausgabe da');
  pruefe((await z.locator('.v09-legende li').allInnerTexts()).join('|') === 'Eingabe|Preis bestimmen|Antwort bilden', 'drei Gruppen mit Namen');
  pruefe((await progs.first().locator('.v09-zeile__tag').allInnerTexts()).every((t) => /^(Eingabe|Preis|Antwort)$/.test(t.trim())), 'jede Zeile trägt das Wort ihrer Gruppe');
  const laufKnopf = z.getByRole('button', { name: 'Beide laufen lassen' });
  pruefe(await laufKnopf.getAttribute('aria-disabled') === 'true' && /zerlege zuerst/.test(await z.innerText()), '„Beide laufen lassen“ ist erst nach dem Zerlegen frei, ein Satz sagt warum');
  await laufKnopf.click({ force: true });
  pruefe(await z.locator('.v09-ausgabe').first().isHidden(), 'ein Klick auf den gesperrten Knopf ändert nichts');
  await z.getByRole('radio', { name: '3 Saft' }).click();
  await z.locator('select').selectOption('1.5');
  await z.getByRole('button', { name: 'Zerlegen' }).click();
  pruefe(await progs.nth(1).isVisible() && /def preis_von\(nr\):/.test(await progs.nth(1).innerText()) && /def antwort\(geld, preis\):/.test(await progs.nth(1).innerText()), 'nach „Zerlegen“ stehen die Funktionen preis_von und antwort da');
  pruefe(/Hauptprogramm \(4 Zeilen\)/.test(await z.innerText()), 'das Hauptprogramm hat 4 Zeilen');
  pruefe(await z.locator('.v09-ausgabe').first().isHidden(), 'nach dem Zerlegen steht noch keine Ausgabe da');
  pruefe(await z.getByRole('button', { name: 'Zerlegen' }).getAttribute('aria-disabled') === 'true', '„Zerlegen“ ist danach gesperrt');
  await laufKnopf.click();
  const ausgaben = await z.locator('.v09-ausgabe:visible').allInnerTexts();
  pruefe(ausgaben.length === 2 && ausgaben.every((t) => t.trim() === 'Ausgabe: Es fehlen 0.50 Euro'), 'bei 3 und 1.5 geben beide Fassungen „Es fehlen 0.50 Euro“ aus', ausgaben);
  pruefe(/Als Nächstes: Hauptprogramm: wahl wird eingelesen\./.test(await z.innerText()) && await progs.nth(1).locator('.v09-zeile.is-jetzt').count() === 1, 'beim zerlegten Programm ist die nächste Zeile gekennzeichnet');
  const einer = z.getByRole('button', { name: 'Ein Schritt' });
  for (let i = 0; i < 3; i++) await einer.click();
  pruefe(/Als Nächstes: In preis_von: Ist nr gleich 1\?/.test(await z.innerText()) && /if nr == 1:/.test(await progs.nth(1).locator('.v09-zeile.is-jetzt').innerText()), 'nach dem Aufruf springt die nächste Zeile in die Funktion');
  pruefe(/▶/.test(await progs.nth(1).locator('.v09-zeile.is-jetzt').innerText()) && /als Nächstes/.test(await progs.nth(1).locator('.v09-zeile.is-jetzt').innerText()), 'die nächste Zeile trägt Pfeil und Wort');
  for (let i = 0; i < 9; i++) await einer.click();
  pruefe(/Das Programm ist zu Ende\./.test(await z.innerText()) && await einer.getAttribute('aria-disabled') === 'true', 'nach zwölf Schritten ist das Programm zu Ende');
  await z.getByRole('button', { name: 'Ablauf von vorn' }).click();
  pruefe(/Als Nächstes: Hauptprogramm/.test(await z.innerText()), 'Ablauf von vorn beginnt im Hauptprogramm');
  await z.locator('select').selectOption('3');
  pruefe(await z.locator('.v09-ausgabe:visible').count() === 0, 'eine neue Eingabe räumt die Ausgaben weg');
  await laufKnopf.click();
  pruefe((await z.locator('.v09-ausgabe:visible').allInnerTexts()).every((t) => t.trim() === 'Ausgabe: Bitte sehr. Wechselgeld: 1.00 Euro'), 'bei 3 und 3.0 geben beide „Bitte sehr. Wechselgeld: 1.00 Euro“ aus');
  await z.getByRole('radio', { name: '1 Cola' }).focus();
  await p.keyboard.press('ArrowRight');
  pruefe(await z.getByRole('radio', { name: '2 Wasser' }).getAttribute('aria-checked') === 'true', 'Pfeiltaste wechselt das Getränk');
  await z.getByRole('button', { name: 'Von vorn' }).first().click();
  pruefe(await progs.nth(1).isHidden() && await z.locator('.v09-ausgabe:visible').count() === 0, 'Von vorn: wieder nur das lange Programm');
  pruefe(await kein(z), 'kein Gedankenstrich im Baustein');

  console.log('\n== spielzeug');
  const s = p.locator('[data-explorable="spielzeug"]');
  const zellen = async () => (await s.locator('.v09-zelle__wert').allInnerTexts()).map((t) => t.trim()).join(' ');
  const platz = s.locator('[aria-label="Rechenplatz"]'), takte = s.locator('[aria-label="Takte bisher"]'), geholt = s.locator('[aria-label="geholter Befehl"]');
  pruefe(await s.locator('.v09-zeile').count() === 4 && /LADE A/.test(await s.innerText()), 'vorbelegt ist das Beispielprogramm mit 4 Zeilen');
  pruefe(await zellen() === '5 3 0 0' && await text(platz) === '0' && await text(takte) === '0', 'Ausgangszustand: Zellen 5 3 0 0, Rechenplatz 0, Takte 0', [await zellen(), await text(platz)]);
  pruefe(/noch nichts geholt/.test(await text(geholt)), 'noch nichts geholt');
  pruefe(!/c = a \+ b/.test(await s.innerText()) && await s.locator('.v09-lampe.is-an').count() === 0, 'im Ausgangszustand keine Lösung und kein Lämpchen an');
  pruefe((await s.locator('.v09-lampe__wort').allInnerTexts()).join('|') === 'holen|entschlüsseln|ausführen', 'drei Lämpchen mit Wort');
  pruefe(/nächster Befehl/.test(await s.locator('.v09-zeile').first().innerText()), 'der Pfeil „nächster Befehl“ steht an der ersten Zeile');
  const takt = s.getByRole('button', { name: 'Ein Takt' }), befehl = s.getByRole('button', { name: 'Ein Befehl' });
  await takt.click();
  pruefe(await text(geholt) === 'LADE A' && await text(takte) === '1' && await text(platz) === '0', 'Takt 1: LADE A geholt, Rechenplatz noch 0');
  pruefe(/holen/.test(await s.locator('.v09-lampe.is-an').innerText()) && await s.locator('.v09-lampe.is-an').count() === 1, 'das Lämpchen „holen“ leuchtet (mit gefülltem Punkt)');
  pruefe(/nächster Befehl/.test(await s.locator('.v09-zeile').nth(1).innerText()) && /wird bearbeitet/.test(await s.locator('.v09-zeile').first().innerText()), 'der Pfeil ist weitergerückt, die erste Zeile wird bearbeitet');
  await takt.click(); await takt.click();
  pruefe(await text(platz) === '5' && await text(takte) === '3' && /ausführen/.test(await s.locator('.v09-lampe.is-an').innerText()), 'Takt 3: der Rechenplatz hält 5, das Lämpchen „ausführen“ leuchtet');
  pruefe(await zellen() === '5 3 0 0', 'die Zellen sind unverändert, solange nichts gespeichert ist');
  await befehl.click();
  pruefe(await text(platz) === '8' && await text(takte) === '6', 'Ein Befehl: ADDIERE B ergibt 8 nach 6 Takten');
  await befehl.click(); await befehl.click();
  pruefe(await zellen() === '5 3 8 0' && await text(takte) === '12', 'am Ende steht C auf 8 nach 12 Takten', [await zellen(), await text(takte)]);
  pruefe(await takt.getAttribute('aria-disabled') === 'true' && await befehl.getAttribute('aria-disabled') === 'true', 'nach STOPP sind „Ein Takt“ und „Ein Befehl“ gesperrt');
  pruefe(/c = a \+ b/.test(await s.innerText()), 'erst am Ende steht der Vergleich mit c = a + b');
  await takt.click({ force: true });
  pruefe(await text(takte) === '12', 'ein Klick auf den gesperrten Knopf ändert nichts');
  await s.getByRole('button', { name: 'Von vorn' }).click();
  pruefe(await zellen() === '5 3 0 0' && await text(takte) === '0', 'Von vorn setzt alles zurück');
  /* Vermutungsprogramm */
  await s.getByRole('radio', { name: 'Beispiel (Summe)' }).focus();
  await p.keyboard.press('ArrowRight');
  pruefe(await s.getByRole('radio', { name: 'Vermutungsprogramm' }).getAttribute('aria-checked') === 'true', 'Pfeiltaste wählt das Vermutungsprogramm');
  pruefe(await s.locator('.v09-zeile').count() === 6 && await zellen() === '4 0 0 0' && await text(takte) === '0', 'Vermutungsprogramm: 6 Zeilen, A ist 4, sonst nichts');
  pruefe(!/16/.test(await s.innerText()), 'vor dem ersten Takt steht die 16 nirgends');
  for (let i = 0; i < 4; i++) await befehl.click();
  pruefe(await text(platz) === '16' && await zellen() === '4 8 0 0', 'nach vier Befehlen: Rechenplatz 16, B ist 8, D noch 0', [await text(platz), await zellen()]);
  await befehl.click(); await befehl.click();
  pruefe(await zellen() === '4 8 0 16' && await text(takte) === '18', 'am Ende steht D auf 16 nach 18 Takten', [await zellen(), await text(takte)]);
  pruefe(/drei Takte/.test(await s.innerText()) && !/Sekunde/.test(await s.innerText()), 'ein Satz sagt „drei Takte“, es gibt keine Umrechnung in Sekunden');
  pruefe((await s.locator('[role="status"]').innerText()).length > 0, 'die Live-Ansage hat einen Text');
  pruefe(await kein(s), 'kein Gedankenstrich im Baustein');

  pruefe(probleme.length === 0, 'keine Skriptfehler', probleme.slice(0, 3));
} finally { await browser.close(); server.close(); }
console.log(fehler.length ? `\n${fehler.length} von ${ok.length + fehler.length} Prüfungen fehlgeschlagen.` : `\n${ok.length} von ${ok.length} Prüfungen bestanden.`);
process.exit(fehler.length ? 1 : 0);
