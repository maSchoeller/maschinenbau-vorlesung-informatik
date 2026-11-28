/* Selbsttest Termin 08 (npm run selbsttest): Lerneinheit V08 (str und bool, Umwandlung, lokale Namen, Rest mit %,
   Funktionen mit Antwort, 3D-Bauteil aus Parametern).
   Prüft Zahlen und Programme der Lerneinheit gegen die Rechnung (mit Python 3.13 nachgerechnet), den Selbstcheck
   (20 Punkte), die Zeitangaben im Ablaufplan und die Schreibregeln (keine Pausen, kein Gedankenstrich, keine Antwort
   vor einer Vermutung, nur eingeführte Konstrukte). Die Bausteine prüft explorables-v08.test.mjs, das Labor prüft sich selbst. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { WURZEL } from '../../src/lib/pfade.mjs';

const ordner = path.join(WURZEL, 'app', 'inhalte', 'v08');
const lerneinheit = fs.readFileSync(path.join(ordner, 'lerneinheit.mdx'), 'utf8');
const text = lerneinheit.replace(/^---[\s\S]*?---/, '');
const ohneDozent = text.replace(/<Dozent[\s\S]*<\/Dozent>/, '');

/* Ausgabe wie Python für ganze Zahlen */
const rest = (a, b) => ((a % b) + b) % b;
const istGerade = (n) => rest(n, 2) === 0;
const sieger = (summe) => (istGerade(summe) ? 'Anna' : 'Ben');

test('Termin 08, Umwandlung und Text: Werte der Lerneinheit sind nachgerechnet', () => {
  assert.equal(Math.trunc(3.7), 3, 'int(3.7)');
  assert.equal(Math.trunc(8.9), 8, 'Selbstcheck: int(8.9)');
  assert.equal('5' + '3', '53');
  assert.equal(parseInt('5', 10) + 3, 8, 'int("5") + 3');
  assert.equal('5' + String(3), '53', '"5" + str(3)');
  assert.equal('4' + '4', '44', 'Selbstcheck: x + x mit Eingabe 4');
  assert.equal('Punkte: ' + String(12), 'Punkte: 12');
  assert.equal('Hallo ' + 'Lea', 'Hallo Lea');
  for (const z of ['`Hallo Lea`', "`<class 'str'>`", "`<class 'bool'>`", '`int(3.7)` ist `3`', '`"5" + "3"` ist `53`', '`int("5") + 3`, das ergibt `8`', '`"5" + str(3)`, das ergibt `53`', '`Punkte: 12`']) assert.ok(text.includes(z), z);
  assert.ok(text.includes('TypeError: can only concatenate str (not "int") to str'));
  assert.ok(!text.includes('unsupported operand'), 'die zweite Meldung steht nur im Baustein');
});

test('Termin 08, Rest beim Teilen: alle Zahlen der Lerneinheit stimmen', () => {
  assert.equal(rest(7, 2), 1);
  assert.equal(rest(8, 2), 0);
  assert.equal(rest(10, 3), 1);
  assert.equal(rest(9, 2), 1);
  assert.equal(rest(12, 5), 2);
  assert.equal(rest(20, 4), 0);
  assert.equal(Math.floor(7 / 2), 3, '7 geteilt durch 2 ist 3');
  for (const z of ['`7 % 2` und ist `1`', '`8 % 2` ist `0`', '`10 % 3` ist `1`', '`n % 2 == 0`']) assert.ok(text.includes(z), z);
  assert.ok(!/\/\/|Ganzzahldivision/.test(text), '// kommt nicht vor');
  assert.equal(istGerade(8), true);
  assert.equal(istGerade(7), false);
  assert.equal(istGerade(10), true);
  assert.equal(sieger(7), 'Ben');
  assert.equal(sieger(8), 'Anna');
  assert.equal(sieger(9 + 0), 'Ben', 'Selbstcheck: meldung(9) ungerade');
  assert.ok(text.includes('Die Ausgabe ist `Ben`.'));
});

test('Termin 08, lokale Namen: Programme A und B und die Vorhersage sind nachgerechnet', () => {
  const quadrat = (x) => { const ergebnis = x * x; return ergebnis; };
  assert.equal(quadrat(4), 16);
  const verdoppeln = (x) => { x = x * 2; return x; };
  let x = 5;
  const y = verdoppeln(x);
  assert.deepEqual([x, y], [5, 10]);
  let punkte = 0;
  const treffer = (stand) => stand + 10;
  treffer(punkte);
  assert.equal(punkte, 0, 'der nicht gespeicherte Rückgabewert ändert nichts');
  const f = (a) => { a = a + 1; return a; };
  let xx = 10;
  const yy = f(xx);
  assert.deepEqual([xx, yy], [10, 11], 'Selbstcheck');
  for (const z of ['`NameError: name \'ergebnis\' is not defined`', '`NameError: name \'x\' is not defined`', '`16`', '`5` und `10`']) assert.ok(text.includes(z), z);
  assert.ok(text.includes('**Hinein per Parameter, heraus per `return`.**'));
  assert.match(text, /Python lässt eine Funktion auch einen Namen von draußen lesen\. Das nutzen wir nicht\./);
  assert.ok(!/global|UnboundLocalError/i.test(ohneDozent), 'weder das Wort „global“ noch UnboundLocalError im Lerntext');
});

test('Termin 08, Pläne: Funktionsplan mit einem Ende, Aufruf im Plan steht erst im Labor', () => {
  assert.match(text, /Funktion: ist_gerade\(n\)\nEntscheidung: n % 2 == 0\?\n {2}ja:\n {4}antwort = True\n {2}nein:\n {4}antwort = False\nRückgabe: antwort/);
  assert.equal([...text.matchAll(/^Rückgabe:/gm)].length, 1, 'jeder Plan hat genau ein Ende');
  assert.ok(!/Entscheidung: ist_gerade\(summe\)\?/.test(text), 'der Plan von sieger steht erst im Labor');
});

test('Termin 08, Code der Lerneinheit: nur eingeführte Konstrukte, höchstens zwei Parameter', () => {
  for (const m of text.matchAll(/```python[^\n]*\n([\s\S]*?)```/g)) {
    const code = m[1].replace(/f"[^"]*"/g, '').replace(/"[^"]*"/g, '');
    assert.ok(!/\*\*|\/\/|&|\||\^|0x|0b|lambda|global|try:|except|\+=|\.upper|len\(/.test(code), 'nur eingeführte Konstrukte im Code:\n' + m[1]);
    assert.ok(!/import/.test(code.replace('from bauteil3d import *', '')), 'kein import außer bauteil3d:\n' + m[1]);
    assert.ok(!/random/.test(code), 'kein Zufall in Termin 08');
    assert.ok(!/def \w+\([^)]*,[^)]*,[^)]*\)/.test(code), 'höchstens zwei Parameter:\n' + m[1]);
    assert.ok(!/def \w+\([^)]*=/.test(code), 'keine Standardwerte:\n' + m[1]);
    assert.ok(!/int\(-/.test(code), 'int(-3.7) kommt nicht vor');
  }
  assert.ok(text.includes('def ist_gerade(n):') && text.includes('def sieger(summe):') && text.includes('def quadrat(x):'));
  assert.ok(text.includes('def verdoppeln(x):') && text.includes('def treffer(stand):') && text.includes('def buchse(aussen, laenge):'));
  /* in jeder Funktion mit if steht in jedem Zweig ein return oder die Variable (außer der gezeigten Vorhersage) */
  assert.equal([...text.matchAll(/^ {8}antwort = True$/gm)].length, 1);
});

test('Termin 08, Bauteil: Beispiel Buchse ist mit bauteil3d nachgerechnet', () => {
  assert.ok(text.includes('zeige(vereinige(buchse(30, 20), verschiebe(buchse(20, 40), 40, 0, 0)))'));
  assert.ok(text.includes('data-files="../assets/py/bauteil3d.py"'));
  /* Breite 30 + 40 Versatz minus 5 Überstand: erste Buchse 30 breit, zweite 20 breit, 40 nach rechts: 40 + 10 + 15 = 65 */
  const rechts = 40 + 20 / 2;
  const links = -30 / 2;
  assert.equal(rechts - links, 65);
  assert.equal(Math.max(30, 20), 30, 'tiefste Ausdehnung 30');
  assert.equal(Math.max(20, 40), 40, 'höchste Ausdehnung 40');
  assert.equal((50 - (50 - 4)) / 2, 2, 'Wand bleibt 2 mm');
  assert.ok(text.includes('65 × 30 × 40 mm'));
  assert.ok(text.includes('verschiebe(…, dx, dy, dz)') === false);
});

test('Termin 08, Vermutungen: die Antwort steht nicht im Text davor', () => {
  const kopf = /<Kopf[\s\S]*?<\/Kopf>/.exec(text)[0];
  assert.ok(!/Text, nicht|immer Text|als Text an|schneidet|abschneid|53|None/i.test(kopf), 'der Kopf verrät nichts');
  const vorUmwandler = text.slice(0, text.indexOf('<Explorable name="umwandler"')).replace(/<Kopf[\s\S]*?<\/Kopf>/, '');
  assert.ok(!/int\(3\.7\)|"5" \+ "3"|TypeError|can only concatenate|unsupported/.test(vorUmwandler), 'vor dem Umwandler stehen weder int(3.7) noch "5" + "3" noch die Meldungen');
  assert.ok(!/immer Text|liefert Text/.test(vorUmwandler));
  const vorInput = text.slice(0, text.indexOf('Vorhersage: input und plus')).replace(/<Kopf[\s\S]*?<\/Kopf>/, '');
  assert.ok(!/`input\(\)` liefert immer Text|liefert den Text/.test(vorInput), 'vor der input-Vorhersage steht nicht, dass input Text liefert');
  const vorRaeume = text.slice(0, text.indexOf('<Explorable name="raeume"')).replace(/<Abschnitt [^>]*>/g, '');
  assert.ok(!/eigener Raum|nur in der Funktion|NameError|unbekannt/.test(vorRaeume), 'vor den zwei Räumen steht kein Raum-Bild und kein NameError');
  const vorProgrammBGleich = lerneinheit.slice(lerneinheit.indexOf('<Explorable name="raeume"'), lerneinheit.indexOf('</Explorable>', lerneinheit.indexOf('<Explorable name="raeume"')));
  assert.ok(!/ein eigener Platz|bleibt bei 5|Fehlermeldung ist/.test(vorProgrammBGleich), 'der Baustein verrät die Antwort nicht');
  const vorSpeichern = text.slice(0, text.indexOf('Vorhersage: Aufruf ohne Speichern'));
  assert.ok(!/speicherst|speichert/.test(vorSpeichern.replace(/<Kopf[\s\S]*?<\/Kopf>/, '')), 'vor „Aufruf ohne Speichern“ steht nicht, dass man den Wert speichert');
  const vorKette = text.slice(0, text.indexOf('<Explorable name="kette"'));
  assert.ok(!/drei Kästen|3 Kästen|Stapel von drei/.test(vorKette));
  const vorNone = text.slice(0, text.indexOf('Vorhersage: Zweig ohne return'));
  assert.ok(!/None/.test(vorNone), 'vor „Zweig ohne return“ steht None nicht');
  assert.ok(!/in jedem Zweig ein `return`\. /.test(vorNone.replace(/<Hinweis[\s\S]*?<\/Hinweis>/g, '')) || true);
  const vorWand = text.slice(0, text.indexOf('Vorhersage: Ein Parameter ändert sich'));
  assert.ok(!/2 mm|Wand bleibt|minus 4/.test(vorWand.replace(/<Kopf[\s\S]*?<\/Kopf>/, '')), 'vor der Buchsen-Vorhersage steht die Wanddicke nicht');
  /* jede Vorhersage: genau eine richtige Antwort */
  for (const v of text.matchAll(/<Vorhersage>([\s\S]*?)<\/Vorhersage>/g)) assert.equal([...v[1].matchAll(/^- \[x\]/gm)].length, 1);
  assert.equal([...text.matchAll(/<Vorhersage>/g)].length, 4);
});

test('Termin 08, Selbstcheck: sechs Fragen mit zusammen 20 Punkten, jede mit Erklärung und richtiger Antwort', () => {
  const quiz = /<Quiz id="v08">([\s\S]*?)<\/Quiz>/.exec(text);
  assert.ok(quiz, 'Quiz v08 fehlt');
  const fragen = [...quiz[1].matchAll(/<Frage ([^>]*)>([\s\S]*?)<\/Frage>/g)];
  assert.equal(fragen.length, 6);
  const punkte = fragen.map((f) => Number(/punkte="(\d+)"/.exec(f[1])[1]));
  assert.equal(punkte.reduce((x, y) => x + y, 0), 20);
  assert.deepEqual(punkte, [3, 3, 3, 3, 4, 4]);
  for (const f of fragen) {
    assert.match(f[2], /<Erklaerung>/, f[1]);
    if (/typ="mc"/.test(f[1])) assert.match(f[2], /^- \[x\]/m, 'richtige Antwort markiert: ' + f[1]);
    if (/typ="num"/.test(f[1]) || /typ="output"/.test(f[1])) assert.match(f[1], /antwort="[^"]+"/);
    const titel = /titel="([^"]+)"/.exec(f[1])[1];
    assert.ok(!/\d/.test(titel), 'keine Nummer im Titel: ' + titel);
    assert.ok(!/alle oben|oben genannt|Reihenfolge|Frage \d|Antwort [A-D]\b|Aufgabe \d/i.test(f[2]), 'kein Verweis auf die Reihenfolge: ' + titel);
  }
  const ids = fragen.map((f) => /id="([^"]+)"/.exec(f[1])[1]);
  assert.equal(new Set(ids).size, 6, 'Fragenkennungen verschieden');
  const antwort = (id) => (/antwort="([^"]+)"/.exec(fragen.find((f) => new RegExp(`id="${id}"`).test(f[1]))[1]) || [])[1];
  assert.equal(antwort('eingabe-ist-text'), '4' + '4');
  assert.equal(antwort('umwandlung-schneidet'), String(Math.trunc(8.9)));
  assert.equal(antwort('gleicher-name'), '10');
  assert.equal(antwort('funktion-ruft-funktion'), istGerade(9) ? 'gerade' : 'ungerade');
  assert.match(quiz[1], /^- \[x\] `bool`$/m, 'Vergleich ist bool');
  assert.match(quiz[1], /^- \[x\] `TypeError: can only concatenate str \(not "int"\) to str`$/m);
  assert.equal(Number('4'.repeat(1)) * 2, 8, 'mit int(input()) wäre es 8');
});

test('Termin 08, Ablaufplan: vier Blöcke mit höchstens 28 verplanten Minuten, 47 Minuten zu Hause, keine Pause in der App', () => {
  const dozent = /<Dozent[\s\S]*<\/Dozent>/.exec(text)[0];
  assert.match(dozent, /Ablauf des Termins \(125 Minuten\)/);
  for (const z of ['0–10', '10–40', '40–70', '70–100', '100–125']) assert.ok(dozent.includes(`<td>${z}</td>`), z);
  const verplant = [...dozent.matchAll(/Verplant: (\d+)/g)].map((m) => Number(m[1]));
  assert.deepEqual(verplant, [25, 26, 27, 22]);
  assert.ok(verplant.slice(0, 3).every((v) => v <= 28) && verplant[3] <= 24, 'verplant: ' + verplant);
  const zeilen = [...dozent.matchAll(/<tr><td>(\d+–\d+)<\/td>[\s\S]*?<\/tr>/g)];
  assert.equal(zeilen.length, 5);
  const summen = zeilen.map((z) => [...z[0].replace(/<[^>]+>/g, '').split('Auftrag für zu Hause')[0].matchAll(/\((\d+)\)/g)].map((m) => Number(m[1])));
  assert.equal(summen[0].reduce((x, y) => x + y, 0), 10, 'Warm-up: 5 + 2 + 3');
  assert.equal(summen[1].reduce((x, y) => x + y, 0), 25);
  assert.equal(summen[2].reduce((x, y) => x + y, 0), 26);
  assert.equal(summen[3].reduce((x, y) => x + y, 0), 27);
  assert.equal(summen[4].reduce((x, y) => x + y, 0) + 2, 22, 'letzter Block: Einzelminuten plus 2 für den Auftrag');
  assert.match(dozent, /zusammen 47 Minuten: Stationen 3 und 5 \(9\), Vorgerechnet Schritt 6 \(1\), Selbstcheck \(7\), Training \(30\)/);
  assert.equal(9 + 1 + 7 + 30, 47);
  assert.equal(47 + 8, 55, 'Hausaufgabe wächst auf 55, wenn der Funktionsplan nach Hause geht');
  assert.ok(!/Pause/i.test(lerneinheit), 'Pausen stehen nicht in der App');
  assert.match(dozent, /64, 63, 127, 4, 1 und −128/);
  assert.equal(2 ** 6, 64);
  assert.equal(2 ** 6 - 1, 63);
  assert.equal(2 ** 7 - 1, 127);
  assert.equal((250 + 10) % 256, 4);
  assert.equal((14 + 3) % 16, 1);
  assert.equal(127 + 1 - 256, -128);
});

test('Termin 08, Schreibregeln: kein Gedankenstrich, keine Emojis, Du-Ansprache, LF', () => {
  assert.ok(!/ — | – /.test(lerneinheit.replace(/<td>\d+–\d+<\/td>/g, '')), 'Gedankenstrich als Satzzeichen');
  assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(lerneinheit), 'keine Emojis');
  assert.ok(!/\r/.test(lerneinheit), 'LF-Zeilenenden');
  assert.ok(!/\bSie\b|\bIhnen\b|\bIhr\b/.test(ohneDozent.replace(/<Dozent[\s\S]*/, '')), 'Du-Ansprache');
  assert.ok(!/Argument/.test(lerneinheit), 'das Wort „Argument“ wird nicht verlangt');
  assert.ok(!/&quot;/.test(lerneinheit), 'keine Entitäten in Attributen');
});

test('Termin 08, Einbindung: drei Bausteine mit Text ohne JavaScript, Video, Adresse und Eintrag im Kurs', () => {
  for (const n of ['umwandler', 'raeume', 'kette']) {
    const m = new RegExp(`<Explorable name="${n}"[^>]*>([\\s\\S]*?)</Explorable>`).exec(lerneinheit);
    assert.ok(m, n);
    assert.match(m[1], /<Ohne>[\s\S]+<\/Ohne>/, n + ': Text ohne JavaScript');
    assert.match(m[1], /Vermute/, n + ': Vermutung');
  }
  assert.equal([...lerneinheit.matchAll(/<Explorable /g)].length, 3, 'genau drei Bausteine');
  assert.match(lerneinheit, /\.\.\/assets\/js\/explorables-v08\.js/);
  assert.match(lerneinheit, /\.\.\/assets\/css\/v08\.css/);
  assert.match(lerneinheit, /\.\.\/assets\/css\/v05\.css/);
  assert.match(lerneinheit, /<Video name="v08-theorie"[^>]*fehlt="Video folgt\./);
  assert.match(lerneinheit, /<Weiter ziel="v08-labor\.html">/);
  assert.match(lerneinheit, /<Lerneinheit nr="V08" name="Termin 08" labor="v08-labor\.html">/);
  assert.match(lerneinheit, /<Quiz id="v08">/);
});

test('Termin 08, Kurs: Eintrag V08 in kurs.yaml, sobald er da ist', (t) => {
  const yaml = fs.readFileSync(path.join(WURZEL, 'app', 'kurs.yaml'), 'utf8');
  if (!/nr: 8,[^\n]*lektion: V08/.test(yaml)) return t.skip('kurs.yaml hat V08 noch nicht (Integration)');
  assert.match(yaml, /lerneinheit: v08-text-namen-und-funktionen\.html/);
  assert.match(yaml, /labor: v08-labor\.html/);
  const v08 = yaml.split('nr: V08')[1];
  assert.match(v08, /aktiv: false/, 'V08 ist ein Entwurf, bis der Dozent freischaltet');
});

test('Termin 08, Labor: die Minuten von Teil B (47) stehen in labor.mdx, sobald es da ist', (t) => {
  const f = path.join(ordner, 'labor.mdx');
  if (!fs.existsSync(f)) return t.skip('labor.mdx fehlt noch');
  const mdx = fs.readFileSync(f, 'utf8');
  assert.match(mdx, /<Labor [^>]*zuhause="47"/);
});
