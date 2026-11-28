/* Selbsttest Termin 07 (npm run selbsttest): Lerneinheit V07 (Datentypen, Überlauf, Funktionen, Kommazahlen).
   Prüft Zahlen und Programme der Lerneinheit gegen die Rechnung (mit Python 3.13 nachgerechnet), den Selbstcheck
   (20 Punkte), die Zeitangaben im Ablaufplan und die Schreibregeln (keine Pausen, kein Gedankenstrich, kein
   Umrechnen von Bytes mit Vorzeichen, keine Antwort vor einer Vermutung). Die Bausteine prüft explorables-v07.test.mjs,
   das Labor prüft sich selbst. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { WURZEL } from '../../src/lib/pfade.mjs';

const ordner = path.join(WURZEL, 'app', 'inhalte', 'v07');
const lerneinheit = fs.readFileSync(path.join(ordner, 'lerneinheit.mdx'), 'utf8');

/* Ausgabe wie Python für ein Programm mit nur einer Kommazahl-Summe */
const pyFloat = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));

test('Termin 07, Wertebereich: Tabelle, 2 hoch n und der Python-Beleg sind nachgerechnet', () => {
  assert.equal(2 ** 8, 256);
  assert.equal(2 ** 16, 65536);
  assert.equal(2 ** 32, 4294967296);
  assert.equal((2n ** 64n + 1n).toString(), '18446744073709551617');
  assert.equal((2n ** 64n - 1n).toString(), '18446744073709551615');
  assert.equal(4294967295 + 1, 4294967296);
  assert.equal(2 ** 12 - 1, 4095, 'Selbstcheck: 12 Bit');
  for (const z of ['<td>256</td>', '<td>65 536</td>', '<td>4 294 967 296</td>', '<td>0 bis 255</td>', '<td>0 bis 65 535</td>', '<td>0 bis 4 294 967 295</td>']) assert.ok(lerneinheit.includes(z), z);
  for (const z of ['`2 ** 8`', '`256`', '`4294967296`', '`18446744073709551617`', '`18446744073709551615`']) assert.ok(lerneinheit.includes(z), z);
});

test('Termin 07, Vorzeichen: Tabelle der Bytes stimmt, es steht keine Umrechnungsregel in der Lerneinheit', () => {
  const mit = (n) => (n >= 128 ? n - 256 : n);
  const zeilen = [[0, '0000 0000'], [127, '0111 1111'], [128, '1000 0000'], [254, '1111 1110'], [255, '1111 1111']];
  for (const [n, bits] of zeilen) {
    assert.equal(n.toString(2).padStart(8, '0').replace(/^(.{4})/, '$1 '), bits);
    assert.ok(lerneinheit.includes(`<tr><td>${bits}</td><td>${n}</td><td>${String(mit(n)).replace('-', '−')}</td></tr>`), bits);
  }
  assert.equal(mit(127 + 1), -128);
  assert.equal(((127 + 1) & 0xff), 128, 'dieselben Bits wie 128 ohne Vorzeichen');
  const app = lerneinheit.replace(/<Dozent[\s\S]*<\/Dozent>/, '');
  assert.ok(!/Zweierkomplement|kippen|invertier|1 addieren|Bits umdrehen/i.test(app), 'kein Umrechnen, kein Fachwort außerhalb des Dozentenplans');
  assert.match(lerneinheit, /<Dozent[\s\S]*Zweierkomplement[\s\S]*oberste Bit −128 zählt[\s\S]*<\/Dozent>/, 'mündliche Begründung nur im Dozentenplan');
});

test('Termin 07, Programme der Lerneinheit: Funktionen und Kommazahlen sind nachgerechnet', () => {
  // quadrat mit return, print-Fassung ergibt None
  const quadrat = (x) => x * x;
  assert.equal(quadrat(4), 16);
  assert.equal(quadrat(5) + 1, 26);
  // Fahrenheit
  const fahr = (c) => c * 9 / 5 + 32;
  assert.equal(fahr(20), 68);
  assert.equal(fahr(37), 98.6);
  assert.equal(fahr(0), 32);
  assert.equal(fahr(-10), 14);
  assert.equal(pyFloat(fahr(20)), '68.0');
  // Kommazahlen: wie Python
  assert.equal(String(0.1 + 0.2), '0.30000000000000004');
  assert.equal(0.1 + 0.2 === 0.3, false);
  assert.equal(0.5 + 0.25 === 0.75, true);
  assert.equal(0.1 * 3 === 0.3, false);
  assert.equal(String(0.1 * 3), '0.30000000000000004');
  assert.equal(0.1 + 0.2 === 0.30, false);
  assert.equal(Math.round((0.1 + 0.2) * 100) / 100 === 0.3, true);
  assert.equal((0.1).toFixed(20), '0.10000000000000000555');
  assert.equal((0.1 + 0.2).toFixed(20), '0.30000000000000004441');
  assert.equal(pyFloat(6 / 2), '3.0');
  assert.equal(7 / 2, 3.5);
  // Endlosschleife: die Summen nach zehn und elf Schritten
  let x = 0, schritte = [];
  for (let i = 0; i < 11; i++) { x = x + 0.1; schritte.push(String(x)); }
  assert.equal(schritte[9], '0.9999999999999999');
  assert.equal(schritte[10], '1.0999999999999999');
  assert.ok(schritte.every((s) => Number(s) !== 1.0), 'die Summe trifft 1.0 nie');
  for (const z of ['`3.5`', '`3.0`', "`<class 'int'>`", "`<class 'float'>`", '`Summe stimmt`', '`0.9999999999999999`', '`1.0999999999999999`', '`16`', '`26`']) assert.ok(lerneinheit.includes(z), z);
  // Ohne 5 an der Rundungsstelle: keine Rundungsfälle in der Lerneinheit
  assert.ok(!/round\([^)]*\b\d+\.\d*5\b/.test(lerneinheit.replace(/round\(0\.1 \+ 0\.2/g, '')), 'kein Wert mit 5 an der Rundungsstelle');
});

test('Termin 07, Pläne: Unterprogramm, Funktionskopf und Rückgabe stehen so im Text wie der Zuschnitt sie zeigt', () => {
  assert.match(lerneinheit, /Ausgabe: "Runde 1"\nUnterprogramm: trennlinie\(\)\nAusgabe: "Runde 2"\nUnterprogramm: trennlinie\(\)/);
  assert.match(lerneinheit, /Eingabe: celsius\nUnterprogramm: fahr = fahrenheit\(celsius\)\nAusgabe: celsius, fahr/);
  assert.match(lerneinheit, /Funktion: fahrenheit\(c\)\ngrad = c \* 9 \/ 5 \+ 32\nRückgabe: grad/);
  assert.ok(!/Unterprogramm: round/.test(lerneinheit), 'round steht im normalen Rechteck (Entscheidung 6)');
  assert.match(lerneinheit, /Rechteck mit doppelten Seitenlinien/);
});

test('Termin 07, Code der Lerneinheit: nur eingeführte Konstrukte, ** nur zum Lesen', () => {
  for (const m of lerneinheit.matchAll(/```python[^\n]*\n([\s\S]*?)```/g)) {
    const code = m[1].replace(/f"[^"]*"/g, '').replace(/"[^"]*"/g, '');
    assert.ok(!/\*\*|%|\/\/|&|\||\^|0x|0b|import|str\(|int\(|float\(|bool\(|True|False|lambda|global/.test(code), 'nur eingeführte Konstrukte im Code:\n' + m[1]);
    assert.ok(!/def \w+\([^)]*,[^)]*,[^)]*\)/.test(code), 'höchstens zwei Parameter:\n' + m[1]);
    assert.ok(!/def \w+\([^)]*=/.test(code), 'keine Standardwerte:\n' + m[1]);
  }
  // ** nur in Inline-Code und Tabelle, nie als Aufgabe
  const app = lerneinheit.replace(/<Dozent[\s\S]*<\/Dozent>/, '');
  assert.ok(!/Potenz|pow\(/.test(app), 'das Wort „Potenz“ fällt nicht');
  assert.ok(!/<Frage[\s\S]*?\*\*[\s\S]*?<\/Frage>/.test(lerneinheit), 'keine Frage zu **');
  // Die Endlosschleife läuft nicht auf der Seite
  assert.match(lerneinheit, /```python data-run="no"\nx = 0\.0\nwhile x != 1\.0:/);
  // Beispielfunktionen und Parameternamen: Hauptprogramm und Funktion benutzen verschiedene Namen
  assert.ok(lerneinheit.includes('def begruessen(name):') && lerneinheit.includes('def quadrat(x):') && lerneinheit.includes('ergebnis = quadrat(4)'));
  assert.ok(lerneinheit.includes('def zeige_stand(runde, punkte):'));
});

test('Termin 07, Vermutungen: die Antwort steht nicht im Text davor', () => {
  const kopf = /<Kopf[\s\S]*?<\/Kopf>/.exec(lerneinheit)[0];
  assert.ok(!/None|−128|auf 0|wieder 0|nicht genau|256 \+|gleich 0/i.test(kopf), 'der Kopf verrät nichts');
  const vorZaehler = lerneinheit.replace(/^---[\s\S]*?---/, '').slice(0, lerneinheit.replace(/^---[\s\S]*?---/, '').indexOf('<Explorable name="kreis"'));
  assert.ok(!/Überlauf|wieder 0|00 000|springt/i.test(vorZaehler.replace(/<Kopf[\s\S]*?<\/Kopf>/, '')), 'vor dem Zahlenkreis steht der Überlauf nicht');
  const vorVorzeichen = lerneinheit.slice(0, lerneinheit.indexOf('Vorhersage: Ein Byte mit Vorzeichen'));
  assert.ok(!/von −128 bis 127|nach 127 kommt/i.test(vorVorzeichen), 'vor der Vorhersage steht der Bereich nicht');
  const vorPython = lerneinheit.slice(0, lerneinheit.indexOf('Vorhersage: Python zählt weiter'));
  assert.ok(!/wächst mit|nicht über/i.test(vorPython.replace(/<Kopf[\s\S]*?<\/Kopf>/, '').replace(/<Hinweis[\s\S]*?<\/Hinweis>/g, '')), 'vor der Python-Vorhersage steht die Antwort nicht');
  const vorDef = lerneinheit.slice(0, lerneinheit.indexOf('Vorhersage: Aufruf vor der Definition'));
  assert.ok(!/NameError|Erst definieren, dann aufrufen/.test(vorDef), 'vor der Definitions-Vorhersage steht die Reihenfolge nicht');
  const vorNone = lerneinheit.slice(0, lerneinheit.indexOf('Vorhersage: print statt return'));
  assert.ok(!/None/.test(vorNone), 'vor der print-Vorhersage steht None nicht');
  const vorVergleich = lerneinheit.slice(0, lerneinheit.indexOf('Vorhersage: Welcher Vergleich stimmt?'));
  assert.ok(!/0\.30000000000000004|Zweiersystem genau|Halbe/.test(vorVergleich.replace(/<Kopf[\s\S]*?<\/Kopf>/, '')), 'vor der Vergleichs-Vorhersage steht der Grund nicht');
  // Jede Vorhersage: genau eine richtige Antwort
  for (const v of lerneinheit.matchAll(/<Vorhersage>([\s\S]*?)<\/Vorhersage>/g)) assert.equal([...v[1].matchAll(/^- \[x\]/gm)].length, 1);
  assert.equal([...lerneinheit.matchAll(/<Vorhersage>/g)].length, 5);
});

test('Termin 07, Selbstcheck: sechs Fragen mit zusammen 20 Punkten, jede mit Erklärung und richtiger Antwort', () => {
  const quiz = /<Quiz id="v07">([\s\S]*?)<\/Quiz>/.exec(lerneinheit);
  assert.ok(quiz, 'Quiz v07 fehlt');
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
    assert.ok(!/alle oben|oben genannt|Reihenfolge|Frage \d|Antwort [A-D]\b/i.test(f[2]), 'kein Verweis auf die Reihenfolge: ' + titel);
  }
  const ids = fragen.map((f) => /id="([^"]+)"/.exec(f[1])[1]);
  assert.equal(new Set(ids).size, 6, 'Fragenkennungen verschieden');
  const antwort = (id) => (/antwort="([^"]+)"/.exec(fragen.find((f) => new RegExp(`id="${id}"`).test(f[1]))[1]) || [])[1];
  assert.equal(antwort('groesste-zahl'), String(2 ** 12 - 1));
  assert.equal(antwort('datentyp-bestimmen'), pyFloat(6 / 2));
  assert.match(quiz[1], /^- \[x\] 0$/m, 'Zähler läuft auf 0');
  assert.match(quiz[1], /^- \[x\] Es reicht von −128 bis 127, und nach 127 kommt −128\.$/m);
  assert.match(quiz[1], /^- \[x\] `None`$/m);
  const vergleiche = fragen.find((f) => /id="vergleiche"/.test(f[1]));
  assert.equal([...vergleiche[2].matchAll(/^- \[x\]/gm)].length, 2, 'zwei richtige Vergleiche');
  assert.match(vergleiche[2], /^- \[x\] `0\.25 \+ 0\.5 == 0\.75`$/m);
  assert.match(vergleiche[2], /^- \[x\] `round\(0\.1 \* 3, 2\) == 0\.3`$/m);
  const ohneDozent = quiz[1];
  assert.ok(!/Zweierkomplement|\*\*/.test(ohneDozent), 'im Selbstcheck weder Zweierkomplement noch **');
});

test('Termin 07, Ablaufplan: vier Blöcke mit höchstens 28 verplanten Minuten, 47 Minuten zu Hause, keine Pause in der App', () => {
  const dozent = /<Dozent[\s\S]*<\/Dozent>/.exec(lerneinheit)[0];
  assert.match(dozent, /Ablauf des Termins \(125 Minuten\)/);
  for (const z of ['0–10', '10–40', '40–70', '70–100', '100–125']) assert.ok(dozent.includes(`<td>${z}</td>`), z);
  const verplant = [...dozent.matchAll(/Verplant: (\d+)/g)].map((m) => Number(m[1]));
  assert.deepEqual(verplant, [23, 27, 28, 24]);
  assert.ok(verplant.slice(0, 3).every((v) => v <= 28) && verplant[3] <= 24, 'verplant: ' + verplant);
  const zeilen = [...dozent.matchAll(/<tr><td>(\d+–\d+)<\/td>[\s\S]*?<\/tr>/g)];
  const summen = zeilen.map((z) => [...z[0].replace(/<[^>]+>/g, '').split('Auftrag für zu Hause')[0].matchAll(/\((\d+)\)/g)].map((m) => Number(m[1])));
  assert.equal(summen[0].reduce((x, y) => x + y, 0), 10, 'Warm-up: 5 + 2 + 3');
  assert.equal(summen[1].reduce((x, y) => x + y, 0), 23);
  assert.equal(summen[2].reduce((x, y) => x + y, 0), 27);
  assert.equal(summen[3].reduce((x, y) => x + y, 0), 28);
  assert.equal(summen[4].reduce((x, y) => x + y, 0) + 2, 24, 'letzter Block: Einzelminuten plus 2 für den Auftrag');
  assert.match(dozent, /zusammen 47 Minuten: Stationen 3 und 6 \(9\), Fahrenheit Schritte 6 und 7 \(1\), Selbstcheck \(7\), Training \(30\)/);
  assert.equal(9 + 1 + 7 + 30, 47);
  assert.equal(47 + 7, 54, 'Hausaufgabe wächst auf 54, wenn der Funktionsplan nach Hause geht');
  assert.ok(!/Pause/i.test(lerneinheit), 'Pausen stehen nicht in der App');
  assert.match(dozent, /B7, 5A, 0A, 0100 1111, 1101 1001, 127, 160 und B4/);
});

test('Termin 07, Warm-up: Auflösung des Trainings „Umrechnen“ stimmt', () => {
  const hex = (n) => n.toString(16).toUpperCase().padStart(2, '0');
  const bin = (n) => n.toString(2).padStart(8, '0').replace(/^(.{4})/, '$1 ');
  assert.equal(hex(0b10110111), 'B7');
  assert.equal(hex(0b01011010), '5A');
  assert.equal(hex(0b00001010), '0A');
  assert.equal(bin(0x4F), '0100 1111');
  assert.equal(bin(0xD9), '1101 1001');
  assert.equal(0x7F, 127);
  assert.equal(0xA0, 160);
  assert.equal(hex(180), 'B4');
});

test('Termin 07, Schreibregeln: kein Gedankenstrich, keine Emojis, Umlaute und Minuszeichen', () => {
  assert.ok(!/ — | – /.test(lerneinheit.replace(/<td>\d+–\d+<\/td>/g, '')), 'Gedankenstrich als Satzzeichen');
  assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(lerneinheit), 'keine Emojis');
  assert.ok(!/\r/.test(lerneinheit), 'LF-Zeilenenden');
  for (const b of lerneinheit.matchAll(/`([01 ]{9})`/g)) assert.match(b[1], /^[01]{4} [01]{4}$/, 'Binärzahlen in Vierergruppen');
  assert.ok(!/Argument/.test(lerneinheit), 'das Wort „Argument“ wird nicht verlangt');
  assert.ok(!/\bstr\b|\bbool\b|TypeError/.test(lerneinheit), 'str, bool und TypeError kommen erst in Termin 08');
});

test('Termin 07, Einbindung: drei Bausteine mit Text ohne JavaScript, Video, Adresse und Eintrag im Kurs', () => {
  for (const n of ['kreis', 'maschine', 'lupe']) {
    const m = new RegExp(`<Explorable name="${n}"[^>]*>([\\s\\S]*?)</Explorable>`).exec(lerneinheit);
    assert.ok(m, n);
    assert.match(m[1], /<Ohne>[\s\S]+<\/Ohne>/, n + ': Text ohne JavaScript');
    assert.match(m[1], /Vermute zuerst/, n + ': Vermutung');
  }
  assert.equal([...lerneinheit.matchAll(/<Explorable /g)].length, 3, 'genau drei Bausteine');
  assert.match(lerneinheit, /\.\.\/assets\/js\/explorables-v07\.js/);
  assert.match(lerneinheit, /\.\.\/assets\/css\/v07\.css/);
  assert.match(lerneinheit, /\.\.\/assets\/css\/v05\.css/);
  assert.match(lerneinheit, /<Video name="v07-theorie"/);
  assert.match(lerneinheit, /<Weiter ziel="v07-labor\.html">/);
  assert.match(lerneinheit, /<Lerneinheit nr="V07" name="Termin 07" labor="v07-labor\.html">/);
  const yaml = fs.readFileSync(path.join(WURZEL, 'app', 'kurs.yaml'), 'utf8');
  assert.match(yaml, /nr: 7,[^\n]*lektion: V07/);
  assert.match(yaml, /lerneinheit: v07-datentypen-und-funktionen\.html/);
  assert.match(yaml, /labor: v07-labor\.html/);
  const v07 = yaml.split('nr: V07')[1];
  assert.match(v07, /python: \["def name\(parameter\):", "return", "type\(\)", "round\(x, 2\)", "2 \*\* n \(nur lesen\)"\]/);
  assert.match(v07, /hook: "Was kommt nach 255\?"/);
  assert.match(v07, /kurz: "Datentypen, def"/);
  assert.match(v07, /aktiv: false/, 'V07 ist ein Entwurf, bis der Dozent freischaltet');
});

test('Termin 07, Labor: die Minuten von Teil B (47) stehen in labor.mdx, sobald es da ist', (t) => {
  const f = path.join(ordner, 'labor.mdx');
  if (!fs.existsSync(f)) return t.skip('labor.mdx fehlt noch');
  const mdx = fs.readFileSync(f, 'utf8');
  assert.match(mdx, /<Labor [^>]*zuhause="47"/);
});
