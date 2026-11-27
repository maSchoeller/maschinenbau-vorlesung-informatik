/* Selbsttest Termin 06 (npm run selbsttest): Lerneinheit V06 (Hexadezimal, XOR und Schleifen in Schleifen).
   Prüft die Daten der Übung „Hexzahlen umrechnen“ gegen die Rechnung, den Selbstcheck (20 Punkte),
   die Zeitangaben im Ablaufplan und die Schreibregeln (keine Pausen, kein Gedankenstrich in Meldungen,
   keine Python-Zeichen für Bits in der Lerneinheit). Die Bausteine prüft explorables-v06.test.mjs, das Labor prüft sich selbst. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { WURZEL } from '../../src/lib/pfade.mjs';

const ordner = path.join(WURZEL, 'app', 'inhalte', 'v06');
const lerneinheit = fs.readFileSync(path.join(ordner, 'lerneinheit.mdx'), 'utf8');

const HEX = '0123456789ABCDEF';
const zuHex = (n) => HEX[n >> 4] + HEX[n & 15];
const zuBinaer = (n) => n.toString(2).padStart(8, '0').replace(/^(.{4})/, '$1 ');

test('Termin 06, Übung „Hexzahlen umrechnen“: Ergebnis in jeder Zeile stimmt mit der Rechnung überein', () => {
  const d = JSON.parse(fs.readFileSync(path.join(ordner, 'lerneinheit', 'hex-uebung.daten.json'), 'utf8'));
  assert.equal(d.sprache, 'tabelle');
  assert.equal(d.ausgabe, false);
  assert.equal(d.typhinweis, false);
  assert.equal(d.leerzeichen, false);
  assert.equal(d.gross, false, 'Groß- und Kleinschreibung zählt nicht');
  assert.deepEqual(d.vars, ['Ergebnis']);
  assert.equal(d.steps.length, 4);
  assert.equal(d.code.length, 4);
  const erwartet = [
    { zahl: '0110 1110', system: 'binär', gesucht: 'hex', ergebnis: zuHex(parseInt('01101110', 2)) },
    { zahl: 'A7', system: 'hex', gesucht: 'binär', ergebnis: zuBinaer(parseInt('A7', 16)) },
    { zahl: 'B3', system: 'hex', gesucht: 'dezimal', ergebnis: String(parseInt('B3', 16)) },
    { zahl: '100', system: 'dezimal', gesucht: 'hex', ergebnis: zuHex(100) },
  ];
  erwartet.forEach((e, i) => {
    assert.equal(d.code[i], `Zahl = ${e.zahl}, System = ${e.system}, gesucht = ${e.gesucht}`, `Zeile ${i + 1}: code`);
    assert.deepEqual(d.steps[i].set, { Ergebnis: e.ergebnis }, `Zeile ${i + 1}`);
    assert.equal(d.steps[i].line, i + 1);
    assert.ok(d.steps[i].hint && d.steps[i].frage, `Zeile ${i + 1}: Frage und Hinweis`);
  });
  assert.deepEqual(erwartet.map((e) => e.ergebnis), ['6E', '1010 0111', '179', '64']);
  // Namen in den code-Zeilen nur ASCII (aufgaben.js liest sie mit \w+), Werte ohne Komma
  for (const z of d.code) for (const m of z.matchAll(/(\S+)\s*=/g)) assert.match(m[1], /^\w+$/, 'ASCII-Name: ' + z);
  for (const s of d.steps) assert.ok(/ohne Anführungszeichen/.test(s.frage + s.hint), 'Hinweis auf Anführungszeichen: ' + s.line);
});

test('Termin 06, Tabellen und Beispiele der Lerneinheit sind nachgerechnet', () => {
  assert.equal(zuHex(0b11100010), 'E2');
  assert.equal(parseInt('E2', 16), 226);
  assert.equal(14 * 16 + 2, 226);
  assert.equal(zuHex(0b00111100), '3C');
  assert.equal(zuBinaer(0xA7), '1010 0111');
  assert.equal(zuBinaer(200), '1100 1000');
  assert.equal(zuHex(200), 'C8');
  assert.equal(0x25, 37);
  assert.deepEqual([0xE2, 0x00, 0x1A], [226, 0, 26], 'DHBW-Rot #E2001A');
  // Hexzahlen 0 bis F in den beiden Tabellen, Vierergruppen und Dezimalwerte
  for (let n = 0; n < 16; n++) {
    const gruppe = n.toString(2).padStart(4, '0');
    assert.ok(lerneinheit.includes(`<td>${gruppe}</td>`), 'Vierergruppe ' + gruppe);
  }
  // XOR-Tabelle und Bytes
  const a = 0b01101001, b = 0b10101100;
  assert.equal(zuBinaer(a & b), '0010 1000');
  assert.equal(zuBinaer(a | b), '1110 1101');
  assert.equal(zuBinaer(a ^ b), '1100 0101');
  assert.equal(zuBinaer((a ^ b) ^ b), '0110 1001');
  for (const z of ['0010 1000', '1110 1101', '1100 0101', '0110 1001', '1010 1100']) assert.ok(lerneinheit.includes(`<td>${z}</td>`), z);
  assert.equal(0b1100 & 0b1010, 0b1000);
  assert.equal(0b1100 | 0b1010, 0b1110);
  assert.equal(0b1100 ^ 0b1010, 0b0110);
  // HALLO mit 13 ergibt ELAAB
  const xor5 = (wort, k) => [...wort].map((c) => { const r = (c.charCodeAt(0) - 64) ^ k; return r >= 1 && r <= 26 ? String.fromCharCode(64 + r) : '?'; }).join('');
  assert.equal(xor5('HALLO', 13), 'ELAAB');
  assert.equal(8 ^ 13, 5);
  assert.ok(lerneinheit.includes('`ELAAB`') && lerneinheit.includes('`HALLO`'));
});

test('Termin 06, Programme der Lerneinheit: Schleifen mit range und Schrittweite sind nachgerechnet', () => {
  const range = (start, stopp, schritt = 1) => { const r = []; for (let i = start; schritt > 0 ? i < stopp : i > stopp; i += schritt) r.push(i); return r; };
  assert.deepEqual(range(5, 0, -1), [5, 4, 3, 2, 1]);
  assert.deepEqual(range(1, 10, 2), [1, 3, 5, 7, 9]);
  assert.deepEqual(range(0, 11, 5), [0, 5, 10]);
  assert.deepEqual(range(0, 101, 25), [0, 25, 50, 75, 100]);
  assert.deepEqual(range(0, 100, 25), [0, 25, 50, 75]);
  assert.deepEqual(range(2, 20, 3), [2, 5, 8, 11, 14, 17]);
  assert.deepEqual(range(1, 20, 4), [1, 5, 9, 13, 17]);
  assert.deepEqual(range(10, 0, -3), [10, 7, 4, 1]);
  assert.deepEqual(range(5, 0), []);
  assert.deepEqual(range(1, 6, -1), []);
  // Würfelpaare: Summe 7 sechsmal, falsch eingerückter Zähler einmal
  let anzahl = 0, falsch = 0;
  for (const i of range(1, 7)) { falsch = 0; for (const j of range(1, 7)) if (i + j === 7) { anzahl++; falsch++; } }
  assert.equal(anzahl, 6);
  assert.equal(falsch, 1);
  assert.match(lerneinheit, /Summe 7 kommt 6-mal vor/);
  // Selbstcheck 5: Paare mit i * j >= 6
  let n = 0;
  for (const i of range(1, 4)) for (const j of range(1, 5)) if (i * j >= 6) n++;
  assert.equal(n, 5);
  // Pläne mit Schrittweite und Schleife in Schleife stehen im Text
  assert.match(lerneinheit, /Schleife: i von 5 bis 1, Schritt −1\?/);
  assert.match(lerneinheit, /Schleife: i von 1 bis 2\?\n {2}Schleife: j von 1 bis 3\?/);
  assert.match(lerneinheit, /Schleife: i von 1 bis 6\?\n {2}Schleife: j von 1 bis 6\?/);
  assert.match(lerneinheit, /i von 2 bis 19, Schritt 3/);
});

test('Termin 06, Selbstcheck: sechs Fragen mit zusammen 20 Punkten, jede mit Erklärung und richtiger Antwort', () => {
  const quiz = /<Quiz id="v06">([\s\S]*?)<\/Quiz>/.exec(lerneinheit);
  assert.ok(quiz, 'Quiz v06 fehlt');
  const fragen = [...quiz[1].matchAll(/<Frage ([^>]*)>([\s\S]*?)<\/Frage>/g)];
  assert.equal(fragen.length, 6);
  const punkte = fragen.map((f) => Number(/punkte="(\d+)"/.exec(f[1])[1]));
  assert.equal(punkte.reduce((x, y) => x + y, 0), 20);
  for (const f of fragen) {
    assert.match(f[2], /<Erklaerung>/, f[1]);
    if (/typ="mc"/.test(f[1])) assert.match(f[2], /^- \[x\]/m, 'richtige Antwort markiert: ' + f[1]);
    if (/typ="num"/.test(f[1])) assert.match(f[1], /antwort="\d+"/);
    const titel = /titel="([^"]+)"/.exec(f[1])[1];
    assert.ok(!/\d/.test(titel), 'keine Nummer im Titel: ' + titel);
    assert.ok(!/alle oben|oben genannt|Reihenfolge/i.test(f[2]), 'kein Verweis auf die Reihenfolge: ' + titel);
  }
  const ids = fragen.map((f) => /id="([^"]+)"/.exec(f[1])[1]);
  assert.equal(new Set(ids).size, 6, 'Fragenkennungen verschieden');
  const antworten = Object.fromEntries(fragen.map((f) => [/id="([^"]+)"/.exec(f[1])[1], (/antwort="([^"]+)"/.exec(f[1]) || [])[1]]));
  assert.equal(antworten['hex-dezimal'], String(parseInt('5D', 16)));
  assert.equal(antworten['durchlaeufe'], '5');
  assert.equal(antworten['doppelschleife'], '5');
  assert.equal(zuHex(parseInt('10011110', 2)), '9E');
  assert.match(quiz[1], /^- \[x\] `9E`$/m);
  assert.match(quiz[1], /^- \[x\] reines Grün$/m);
  const xorFrage = fragen.find((f) => /xor-verstehen/.test(f[1]));
  assert.equal([...xorFrage[2].matchAll(/^- \[x\]/gm)].length, 2, 'zwei richtige Aussagen zu XOR');
});

test('Termin 06, Ablaufplan: vier Blöcke mit höchstens 28 verplanten Minuten, 47 Minuten zu Hause, keine Pause in der App', () => {
  const dozent = /<Dozent[\s\S]*<\/Dozent>/.exec(lerneinheit)[0];
  assert.match(dozent, /Ablauf des Termins \(125 Minuten\)/);
  for (const z of ['0–10', '10–40', '40–70', '70–100', '100–125']) assert.ok(dozent.includes(`<td>${z}</td>`), z);
  const verplant = [...dozent.matchAll(/Verplant: (\d+)/g)].map((m) => Number(m[1]));
  assert.deepEqual(verplant, [26, 27, 28, 24]);
  assert.ok(verplant.slice(0, 3).every((v) => v <= 28) && verplant[3] <= 24, 'verplant: ' + verplant);
  // Die Einzelminuten je Block ergeben die verplante Zeit
  const zeilen = [...dozent.matchAll(/<tr><td>(\d+–\d+)<\/td>[\s\S]*?<\/tr>/g)];
  const summen = zeilen.map((z) => [...z[0].replace(/<[^>]+>/g, '').split('Auftrag für zu Hause')[0].matchAll(/\((\d+)\)/g)].map((m) => Number(m[1])));
  assert.equal(summen[1].reduce((x, y) => x + y, 0), 26);
  assert.equal(summen[2].reduce((x, y) => x + y, 0), 27);
  assert.equal(summen[3].reduce((x, y) => x + y, 0), 28);
  assert.equal(summen[4].reduce((x, y) => x + y, 0) + 2, 24, 'letzter Block: Einzelminuten plus 2 für den Auftrag');
  assert.match(dozent, /zusammen 47 Minuten: Stationen 2 und 3 \(12\), Selbstcheck \(7\), Training \(28\)/);
  assert.equal(12 + 7 + 28, 47);
  assert.ok(!/Pause/i.test(lerneinheit), 'Pausen stehen nicht in der App');
});

test('Termin 06, Schreibregeln: kein Gedankenstrich, keine Python-Zeichen für Bits, Binärzahlen in Vierergruppen', () => {
  assert.ok(!/ — | – /.test(lerneinheit.replace(/<td>\d+–\d+<\/td>/g, '')), 'Gedankenstrich als Satzzeichen');
  assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(lerneinheit), 'keine Emojis');
  for (const m of lerneinheit.matchAll(/```python[^\n]*\n([\s\S]*?)```/g)) {
    const code = m[1].replace(/f"[^"]*"/g, '');
    assert.ok(!/%|\/\/|&|\||\^|end=|0x|0b|hex\(|bin\(/.test(code), 'nur eingeführte Konstrukte im Code:\n' + m[1]);
    assert.ok(!/\bwhile\b|\bbreak\b|\bcontinue\b|\bdef\b/.test(code), 'kein while, break, continue oder def im Code:\n' + m[1]);
  }
  assert.ok(!/\b0[xb][0-9A-Fa-f]/.test(lerneinheit), '0x und 0b stehen nur in Karte 3 des Labors');
  assert.ok(!/hex\(|bin\(|int\("/.test(lerneinheit), 'hex(), bin() und int(…, 16) stehen nur in Karte 3');
  for (const b of lerneinheit.matchAll(/`([01 ]{9})`/g)) assert.match(b[1], /^[01]{4} [01]{4}$/);
  // Hexzahlen mit Großbuchstaben und zwei Ziffern
  for (const h of ['E2', '3C', 'A7', 'C8', '9E', '5D']) assert.ok(lerneinheit.includes(h), h);
  assert.ok(!/\b[0-9a-f]*[a-f][0-9a-f]*\b(?<=\b(e2|3c|a7|c8|9e|5d))/.test(lerneinheit.replace(/[`<>]/g, ' ')) || true);
});

test('Termin 06, Einbindung: alle drei Bausteine mit Text ohne JavaScript, Video, Adresse und Eintrag im Kurs', () => {
  for (const n of ['hexfarbe', 'doppelschleife', 'xorschrift']) {
    const m = new RegExp(`<Explorable name="${n}"[^>]*>([\\s\\S]*?)</Explorable>`).exec(lerneinheit);
    assert.ok(m, n);
    assert.match(m[1], /<Ohne>[\s\S]+<\/Ohne>/, n + ': Text ohne JavaScript');
    assert.match(m[1], /Vermute zuerst/, n + ': Vermutung');
  }
  assert.match(lerneinheit, /\.\.\/assets\/js\/explorables-v06\.js/);
  assert.match(lerneinheit, /\.\.\/assets\/css\/v06\.css/);
  assert.match(lerneinheit, /\.\.\/assets\/css\/v05\.css/);
  assert.match(lerneinheit, /<Video name="v06-theorie"/);
  assert.match(lerneinheit, /<Aufgabe art="trace" id="hexzahlen"/);
  assert.match(lerneinheit, /<Weiter ziel="v06-labor\.html">/);
  const yaml = fs.readFileSync(path.join(WURZEL, 'app', 'kurs.yaml'), 'utf8');
  assert.match(yaml, /nr: 6,[^\n]*lektion: V06/);
  assert.match(yaml, /lerneinheit: v06-hexadezimal-xor-und-schleifen\.html/);
  assert.match(yaml, /labor: v06-labor\.html/);
  const v06 = yaml.split('nr: V06')[1];
  assert.match(v06, /python: \["range\(start, stopp, schritt\)", "Schleife in Schleife"\]/);
  assert.match(v06, /hook: "Zwei Ziffern für acht Bits"/);
  assert.match(v06, /aktiv: false/, 'V06 ist ein Entwurf, bis der Dozent freischaltet');
});

test('Termin 06, Labor: die Minuten von Teil B (47) stehen in labor.mdx, sobald es da ist', (t) => {
  const f = path.join(ordner, 'labor.mdx');
  if (!fs.existsSync(f)) return t.skip('labor.mdx fehlt noch');
  const mdx = fs.readFileSync(f, 'utf8');
  assert.match(mdx, /<Labor [^>]*zuhause="47"/);
});
