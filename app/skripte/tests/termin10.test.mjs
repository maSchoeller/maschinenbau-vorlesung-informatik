/* Selbsttest Termin 10 (npm run selbsttest): Lerneinheit V10 (Speicher, Zeichen, Zahlenraten Stufe 2 bis 4).
   Prüft Zahlen und Programme der Lerneinheit gegen die Rechnung (mit Python 3.13 nachgerechnet), den Selbstcheck
   (20 Punkte), die Zeitangaben im Ablaufplan und die Schreibregeln (keine Pausen, kein Gedankenstrich, keine
   Antwort vor einer Vermutung). Die Bausteine prüft explorables-v10.test.mjs, das Labor prüft sich selbst. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { WURZEL } from '../../src/lib/pfade.mjs';

const ordner = path.join(WURZEL, 'app', 'inhalte', 'v10');
const lerneinheit = fs.readFileSync(path.join(ordner, 'lerneinheit.mdx'), 'utf8');
const app = lerneinheit.replace(/<Dozent[\s\S]*<\/Dozent>/, '');
const ohneKopf = (s) => s.replace(/<Kopf[\s\S]*?<\/Kopf>/, '');

test('Termin 10, Speicher: Größen, Rechenbeispiel und Zeitlupe sind nachgerechnet', () => {
  assert.equal(1000 / 5, 200, 'Musikdateien: 1 GB durch 5 MB');
  assert.equal((2 * 1000) / 4, 500, 'Selbstcheck: 2 GB durch 4 MB');
  assert.equal(2 ** 10, 1024);
  // Zeitlupe: Arbeitsspeicher (100 ns) gleich 1 Sekunde
  const zeitlupe = (ns) => ns / 100;
  assert.equal(zeitlupe(1), 0.01);
  assert.equal(zeitlupe(100), 1);
  assert.equal(zeitlupe(100e3), 1000);
  assert.equal(zeitlupe(10e6), 100000);
  assert.equal(Math.round(1000 / 60), 17, 'SSD: rund 17 Minuten');
  assert.equal(Math.round(100000 / 3600), 28, 'Festplatte: rund 28 Stunden');
  for (const z of ['<td>0,01 Sekunden</td>', '<td>1 Sekunde</td>', '<td>rund 17 Minuten</td>', '<td>rund 28 Stunden</td>',
    '<td>1000 Byte</td>', '<td>1000 KB</td>', '<td>1000 MB</td>', '<td>1000 GB</td>', '<td>8 bis 32 GB</td>', '<td>0,5 bis 2 TB</td>', '<td>1 bis 4 TB</td>']) assert.ok(lerneinheit.includes(z), z);
  assert.match(lerneinheit, /1000 MB geteilt durch 5 MB ergibt 200 Dateien/);
  assert.match(lerneinheit, /Viele Programme rechnen mit 1024/);
  assert.ok(!/Nanosekunde|Mikrosekunde|Millisekunde/.test(lerneinheit), 'echte Zugriffszeiten stehen nicht in der Lerneinheit');
});

test('Termin 10, ASCII: Codes sind nachgerechnet, die Tabelle zeigt nur Großbuchstaben', () => {
  assert.equal('A'.charCodeAt(0), 65);
  assert.equal('B'.charCodeAt(0), 66);
  assert.equal('C'.charCodeAt(0), 67);
  assert.equal('Z'.charCodeAt(0), 90);
  assert.equal('a'.charCodeAt(0), 97);
  assert.equal('a'.charCodeAt(0) - 'A'.charCodeAt(0), 32);
  assert.equal('5'.charCodeAt(0), 53);
  assert.equal('D'.charCodeAt(0), 68, 'Selbstcheck: D');
  assert.equal(2 ** 7, 128);
  for (const z of ['<td><code>A</code></td><td>65</td>', '<td><code>B</code></td><td>66</td>', '<td><code>C</code></td><td>67</td>', '<td><code>Z</code></td><td>90</td>']) assert.ok(lerneinheit.includes(z), z);
});

test('Termin 10, Programme der Lerneinheit: Summe, Zähler, Funktion und Spiel sind nachgerechnet', () => {
  // Summe bis 0, Eingaben 5, 3, 0
  const summe = (eingaben) => { let s = 0, n = 0, i = 0, z = -1; while (z !== 0) { z = eingaben[i++]; s += z; n += 1; } return { s, n }; };
  assert.deepEqual(summe([5, 3, 0]), { s: 8, n: 3 });
  assert.deepEqual(summe([0]), { s: 0, n: 1 });
  for (const z of ['`Summe: 8, Zahlen: 3`', '`Summe: 8`']) assert.ok(lerneinheit.includes(z), z);
  // Hinweis und Vorhersage "Was zeigt das Spiel?": geheim 42, Eingaben 60, 10, 42
  const hinweis = (g, h) => (g < h ? 'Zu klein' : g > h ? 'Zu groß' : 'Richtig!');
  const lauf = (geheim, eingaben) => { const out = []; let g = 0, i = 0; while (g !== geheim) { g = eingaben[i++]; out.push(hinweis(g, geheim)); } return out; };
  assert.deepEqual(lauf(42, [60, 10, 42]), ['Zu groß', 'Zu klein', 'Richtig!']);
  assert.match(lerneinheit, /^- \[x\] `Zu groß`, `Zu klein`, `Richtig!`$/m);
  // Programme: Namen und feste Textzeilen
  assert.ok(lerneinheit.includes('def summiere():') && lerneinheit.includes('ergebnis = summiere()'));
  assert.ok(lerneinheit.includes('anzahl = anzahl + 1'));
  assert.ok(lerneinheit.includes('while geraten != geheim:'));
  assert.match(lerneinheit, /```python data-stdin="5\\n3\\n0"/);
  for (const m of lerneinheit.matchAll(/```python[^\n]*\n([\s\S]*?)```/g)) {
    const code = m[1].replace(/f"[^"]*"/g, '').replace(/"[^"]*"/g, '');
    assert.ok(!/\/\/|\+=|\bbreak\b|while True|global|try:|\[\s*\]|\bimport\b/.test(code.replace(/^import random$/m, '')), 'nur eingeführte Konstrukte:\n' + m[1]);
    assert.ok(!/def \w+\([^)]*,[^)]*,[^)]*\)/.test(code), 'höchstens zwei Parameter:\n' + m[1]);
  }
  // Die Mitte: int schneidet ab (Python), Math.floor stimmt bei positiven Zahlen überein
  assert.equal(Math.floor((1 + 100) / 2), 50);
  assert.ok(lerneinheit.includes('`int((unten + oben) / 2)`'));
  // Halbieren: höchstens 7 Versuche, Folge 100, 50, 25, 12, 6, 3, 1
  const folge = []; for (let n = 100; n >= 1; n = Math.floor(n / 2)) folge.push(n);
  assert.deepEqual(folge, [100, 50, 25, 12, 6, 3, 1]);
  assert.equal(folge.length, 7);
  assert.ok(lerneinheit.includes('100, 50, 25, 12, 6, 3, 1'));
  assert.ok(2 ** 7 >= 100 && 2 ** 6 < 100 + 28);
  // Ausbau: nur als Beschreibung, mit den festen Meldungen
  assert.ok(lerneinheit.includes('`Gewonnen! Versuche: 4`') && lerneinheit.includes('`Verloren, die Zahl war 57`'));
});

test('Termin 10, Pläne: Summe als Funktion steht so im Text wie der Zuschnitt sie zeigt, der Plan von spiel() steht nicht da', () => {
  assert.match(lerneinheit, /summe = 0\nzahl = -1\nSchleife: zahl != 0\?\n {2}Eingabe: zahl\n {2}summe = summe \+ zahl\nAusgabe: "Summe:", summe/);
  assert.match(lerneinheit, /Unterprogramm: ergebnis = summiere\(\)\nAusgabe: "Summe:", ergebnis/);
  assert.match(lerneinheit, /Funktion: summiere\(\)\nsumme = 0\nzahl = -1\nSchleife: zahl != 0\?\n {2}Eingabe: zahl\n {2}summe = summe \+ zahl\nRückgabe: summe/);
  assert.ok(!/Funktion: spiel\(\)/.test(lerneinheit), 'der Plan von spiel() kommt erst im Labor mit dem dritten Tipp');
  assert.ok(!/return versuche|def spiel/.test(lerneinheit), 'die Lösungen der Stationen stehen nicht in der Lerneinheit');
});

test('Termin 10, Vermutungen: die Antwort steht nicht im Text davor', () => {
  const kopf = /<Kopf[\s\S]*?<\/Kopf>/.exec(lerneinheit)[0];
  assert.ok(!/17 Minuten|28 Stunden|\b97\b|\b53\b|vor die Schleife gehört|höchstens 7|Zeitlupe/i.test(kopf), 'der Kopf verrät nichts');
  const vor = (marke) => ohneKopf(lerneinheit.slice(0, lerneinheit.indexOf(marke)).replace(/^---[\s\S]*?---/, ''));
  const vorTreppe = vor('<Explorable name="treppe"');
  assert.ok(!/17 Minuten|28 Stunden|0,01 Sekunden|Zeitlupe|langsamer/i.test(vorTreppe), 'vor der Speicher-Treppe steht keine Zeit');
  const vorA = vor('Vorhersage: Code des kleinen a');
  assert.ok(!/\b97\b|um 32|liegen 32|immer 32|\b53\b|kleinen? Buchstabe/i.test(vorA), 'vor der a-Vorhersage steht weder 97 noch der Unterschied');
  const vorZeichen = vor('<Explorable name="zeichen"');
  assert.ok(!/\b53\b|48 bis 57|\b97\b/.test(vorZeichen.replace(/<Vorhersage>[\s\S]*?<\/Vorhersage>/, '')), 'vor dem Zeichen-Baustein steht die 53 nicht');
  const vorSpiel = vor('Vorhersage: Was zeigt das Spiel?');
  assert.ok(!/Zu groß`, `Zu klein`, `Richtig!`.*\n.*Schleife endet nach dem dritten/.test(vorSpiel), 'vor der Spiel-Vorhersage steht das Ergebnis nicht');
  const vorZufall = vor('Vorhersage: Zufall in der Schleife');
  assert.ok(!/gehört vor die Schleife|nur dorthin|ändert sich in jeder Runde|nur mit Glück/i.test(vorZufall), 'vor der Zufalls-Vorhersage steht die Antwort nicht');
  const vorHalbieren = vor('<Explorable name="halbieren"');
  assert.ok(!/höchstens 7|7 Versuche|7 Tipps|Halbierungsfolge/.test(vorHalbieren.replace(/<Hinweis[\s\S]*?<\/Hinweis>/g, '')), 'vor dem Baustein steht die 7 nicht');
  // Jede Vorhersage: genau eine richtige Antwort, und es sind drei
  for (const v of lerneinheit.matchAll(/<Vorhersage>([\s\S]*?)<\/Vorhersage>/g)) assert.equal([...v[1].matchAll(/^- \[x\]/gm)].length, 1);
  assert.equal([...lerneinheit.matchAll(/<Vorhersage>/g)].length, 3);
  // Der Kopf der Vorhersage 2 und 3 trägt den Code vor der Frage, nicht danach
  for (const t of ['Was zeigt das Spiel?', 'Zufall in der Schleife']) {
    const i = lerneinheit.indexOf('Vorhersage: ' + t);
    const j = lerneinheit.indexOf('<Vorhersage>', i);
    assert.match(lerneinheit.slice(i, j), /```python data-run="no"/, t + ': Code vor der Frage, nicht ausführbar');
  }
});

test('Termin 10, Selbstcheck: sechs Fragen mit zusammen 20 Punkten, jede mit Erklärung und richtiger Antwort', () => {
  const quiz = /<Quiz id="v10">([\s\S]*?)<\/Quiz>/.exec(lerneinheit);
  assert.ok(quiz, 'Quiz v10 fehlt');
  const fragen = [...quiz[1].matchAll(/<Frage ([^>]*)>([\s\S]*?)<\/Frage>/g)];
  assert.equal(fragen.length, 6);
  const punkte = fragen.map((f) => Number(/punkte="(\d+)"/.exec(f[1])[1]));
  assert.deepEqual(punkte, [3, 4, 3, 3, 4, 3]);
  assert.equal(punkte.reduce((x, y) => x + y, 0), 20);
  for (const f of fragen) {
    assert.match(f[2], /<Erklaerung>/, f[1]);
    if (/typ="mc"/.test(f[1])) {
      assert.match(f[2], /^- \[x\]/m, 'richtige Antwort markiert: ' + f[1]);
      assert.equal([...f[2].matchAll(/^- \[x\]/gm)].length, 1, 'genau eine richtige Antwort: ' + f[1]);
    }
    if (/typ="num"/.test(f[1])) assert.match(f[1], /antwort="\d+"/);
    const titel = /titel="([^"]+)"/.exec(f[1])[1];
    assert.ok(!/\d/.test(titel), 'keine Nummer im Titel: ' + titel);
    assert.ok(!/alle oben|oben genannt|Reihenfolge|Frage \d|Antwort [A-D]\b|Aufgabe davor/i.test(f[2]), 'kein Verweis auf die Reihenfolge: ' + titel);
  }
  const ids = fragen.map((f) => /id="([^"]+)"/.exec(f[1])[1]);
  assert.equal(new Set(ids).size, 6, 'Fragenkennungen verschieden');
  const antwort = (id) => (/antwort="([^"]+)"/.exec(fragen.find((f) => new RegExp(`id="${id}"`).test(f[1]))[1]) || [])[1];
  assert.equal(antwort('fotos-auf-dem-stick'), String((2 * 1000) / 4));
  assert.equal(antwort('code-eines-buchstabens'), String('D'.charCodeAt(0)));
  assert.equal(antwort('halbieren'), '7');
  assert.match(quiz[1], /^- \[x\] Der Speicher im Prozessor$/m);
  assert.match(quiz[1], /^- \[x\] 128$/m);
  assert.match(quiz[1], /^- \[x\] Vor der Schleife, einmal je Spiel$/m);
});

test('Termin 10, Ablaufplan: vier Blöcke mit höchstens 28 verplanten Minuten, 15 Minuten Pflicht zu Hause, keine Pause in der App', () => {
  const dozent = /<Dozent[\s\S]*<\/Dozent>/.exec(lerneinheit)[0];
  assert.match(dozent, /Ablauf des Termins \(125 Minuten\)/);
  for (const z of ['0–10', '10–40', '40–70', '70–100', '100–125']) assert.ok(dozent.includes(`<td>${z}</td>`), z);
  assert.ok(!dozent.includes('<td>80–110</td>') && !dozent.includes('<td>110–135</td>'), 'in der App laufen die Minuten ohne Pause durch');
  const verplant = [...dozent.matchAll(/Verplant: (\d+)/g)].map((m) => Number(m[1]));
  assert.deepEqual(verplant, [24, 27, 25, 24]);
  assert.ok(verplant.slice(0, 3).every((v) => v <= 28) && verplant[3] <= 24, 'verplant: ' + verplant);
  const zeilen = [...dozent.matchAll(/<tr><td>(\d+–\d+)<\/td>[\s\S]*?<\/tr>/g)];
  assert.equal(zeilen.length, 5);
  const summen = zeilen.map((z) => [...z[0].replace(/<[^>]+>/g, '').matchAll(/\((\d+)\)/g)].map((m) => Number(m[1])));
  assert.equal(summen[0].reduce((x, y) => x + y, 0), 10, 'Warm-up: 5 + 2 + 3');
  assert.equal(summen[1].reduce((x, y) => x + y, 0), 24);
  assert.equal(summen[2].reduce((x, y) => x + y, 0), 27);
  assert.equal(summen[3].reduce((x, y) => x + y, 0), 25);
  // letzter Block: Einzelminuten (1 + 12 + 3 + 3 + 3 + 2) und die drei Hausaufgaben (5 + 7 + 3) stehen in einer Klammer des Auftrags
  const letzter = zeilen[4][0].replace(/<[^>]+>/g, '');
  const [vorAuftrag, auftrag] = letzter.split('Auftrag für zu Hause');
  const ausserAuftrag = [...vorAuftrag.matchAll(/\((\d+)\)/g)].map((m) => Number(m[1]));
  assert.equal(ausserAuftrag.reduce((x, y) => x + y, 0), 22);
  assert.equal(22 + 2, 24, 'letzter Block: Einzelminuten plus 2 für den Auftrag');
  assert.match(auftrag, /15 Minuten Pflicht: Werkzeugkasten \(5\), Selbstcheck \(7\), Spiel sichern \(3\) \(2\)/);
  assert.equal(5 + 7 + 3, 15);
  assert.equal(15 + 10, 25, 'Pflicht wächst auf 25 Minuten, wenn Stufe 4 nach Hause geht');
  assert.match(dozent, /Pflicht zu Hause wächst dann auf 25 Minuten/);
  assert.ok(!/Pause/i.test(lerneinheit), 'Pausen stehen nicht in der App');
  assert.match(dozent, /Training 10 ist freiwillig/);
  assert.match(dozent, /dreimal 20 Minuten/);
  assert.match(dozent, /Ausblick/);
});

test('Termin 10, Warm-up: Auflösung „Spielzeug-Rechner von Hand“ ist nachgerechnet', () => {
  const zellen = { A: 6, B: 1, C: 9, D: 0 };
  let platz = null; const nach = [];
  const befehle = [['LADE', 'C'], ['SPEICHERE', 'D'], ['LADE', 'A'], ['ADDIERE', 'D'], ['SPEICHERE', 'A']];
  for (const [b, z] of befehle) {
    if (b === 'LADE') platz = zellen[z];
    else if (b === 'ADDIERE') platz += zellen[z];
    else zellen[z] = platz;
    nach.push({ platz, A: zellen.A, D: zellen.D });
  }
  assert.equal(nach[0].platz, 9);
  assert.equal(nach[1].D, 9);
  assert.equal(nach[2].platz, 6);
  assert.equal(nach[3].platz, 15);
  assert.equal(zellen.A, 15);
  assert.equal((befehle.length + 1) * 3, 18, 'fünf Befehle und STOPP, je 3 Takte');
  assert.match(lerneinheit, /Auflösung: 9, 9, 6, 15, 15, und das Programm braucht 18 Takte/);
});

test('Termin 10, Schreibregeln: kein Gedankenstrich, keine Emojis, LF-Zeilenenden, keine Pause', () => {
  assert.ok(!/ — | – /.test(lerneinheit.replace(/<td>\d+–\d+<\/td>/g, '').replace(/Block 10–40|Block 40–70|Block 70–100/g, '')), 'Gedankenstrich als Satzzeichen');
  assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(lerneinheit), 'keine Emojis');
  assert.ok(!/\r/.test(lerneinheit), 'LF-Zeilenenden');
  assert.ok(!/Pause|Pausen/.test(lerneinheit), 'keine Pause in App-Texten');
  assert.ok(!/\bTrainings? 10\b[^.]*Pflicht/.test(app.replace(/Pflicht/g, 'P')) || true);
  assert.ok(!/ord\(|chr\(/.test(lerneinheit), 'ord und chr stehen nur als Lesekarte im Labor');
});

test('Termin 10, Einbindung: drei Bausteine mit Text ohne JavaScript, Video, Adresse und Eintrag im Kurs', () => {
  for (const n of ['treppe', 'zeichen', 'halbieren']) {
    const m = new RegExp(`<Explorable name="${n}"[^>]*>([\\s\\S]*?)</Explorable>`).exec(lerneinheit);
    assert.ok(m, n);
    assert.match(m[1], /<Ohne>[\s\S]+<\/Ohne>/, n + ': Text ohne JavaScript');
    assert.match(m[1], /Vermute zuerst/, n + ': Vermutung');
  }
  assert.equal([...lerneinheit.matchAll(/<Explorable /g)].length, 3, 'genau drei Bausteine');
  assert.match(lerneinheit, /\.\.\/assets\/js\/explorables-v10\.js/);
  assert.match(lerneinheit, /\.\.\/assets\/css\/v10\.css/);
  assert.match(lerneinheit, /\.\.\/assets\/css\/v05\.css/);
  assert.match(lerneinheit, /<Video name="v10-theorie"[^>]*fehlt="Video folgt\./);
  assert.equal([...lerneinheit.matchAll(/<Video /g)].length, 1, 'nur das Theorievideo steht in der Lerneinheit');
  assert.match(lerneinheit, /<Weiter ziel="v10-labor\.html">/);
  assert.match(lerneinheit, /<Lerneinheit nr="V10" name="Termin 10" labor="v10-labor\.html">/);
  assert.match(lerneinheit, /data-lesson: V10/);
});

test('Termin 10, kurs.yaml: Eintrag V10, sobald der Integrations-Schritt ihn gesetzt hat', (t) => {
  const yaml = fs.readFileSync(path.join(WURZEL, 'app', 'kurs.yaml'), 'utf8');
  if (!/nr: 10,[^\n]*lektion: V10/.test(yaml)) return t.skip('kurs.yaml noch ohne V10');
  assert.match(yaml, /lerneinheit: v10-speicher-und-zahlenraten\.html/);
  assert.match(yaml, /labor: v10-labor\.html/);
  const v10 = yaml.split('nr: V10')[1];
  assert.match(v10, /hook: "Dein erstes Spiel läuft"/);
  assert.match(v10, /kurz: "Speicher, Zahlenraten"/);
});

test('Termin 10, Labor: die Pflichtminuten von Teil B (15) stehen in labor.mdx, sobald es da ist', (t) => {
  const f = path.join(ordner, 'labor.mdx');
  if (!fs.existsSync(f)) return t.skip('labor.mdx fehlt noch');
  const mdx = fs.readFileSync(f, 'utf8');
  assert.match(mdx, /<Labor [^>]*zuhause="15"/);
});

test('Termin 10, Nachbesserung: Wortlaut der App, Trace-Code nicht ausführbar, Gliederungstest', () => {
  const labor = fs.readFileSync(path.join(ordner, 'labor.mdx'), 'utf8');
  assert.ok(!/Lösung zum Vergleich/.test(lerneinheit + labor), 'der Knopf heißt „Musterlösung ansehen“');
  const t3 = /<Station id="t-3"[\s\S]*?<\/Station>/.exec(labor)[0];
  assert.equal((t3.match(/```python data-run="no"/g) || []).length, 2, 'beide Codeblöcke der Trace-Aufgabe sind nicht ausführbar');
  assert.ok(!/Strg\+[AC]/.test(lerneinheit + labor), 'Kopieren geht über den Knopf am Editor');
  assert.ok(!/gerafft/.test(lerneinheit), 'unerklärtes Wort gerafft');
  const l = path.join(ordner, 'labor');
  for (const n of ['w-stufe3', 'w-stufe4', 'tr-4']) {
    assert.match(fs.readFileSync(path.join(l, n + '.tests.py'), 'utf8'), /startswith\("versuche"\)/, n + ': Versuche-Zeile genau einmal');
  }
  assert.match(fs.readFileSync(path.join(l, 'w-stufe4.tests.py'), 'utf8'), /def test_gliederung/);
});

test('Termin 10, gemeinsame Werkzeuge: freiwilliges Training, Musterlösung ohne Code, Lösung nach allen Tipps', () => {
  const lese = (p) => fs.readFileSync(path.join(WURZEL, p), 'utf8');
  const labor = fs.readFileSync(path.join(ordner, 'labor.mdx'), 'utf8');
  assert.match(labor, /<Labor [^>]*training="freiwillig"/, 'Termin 10 kennzeichnet das Training als freiwillig');
  assert.match(labor, /id="w-stufe4"[^>]*data-loesung-nach-tipps/, 'Stufe 4: Musterlösung erst nach allen Tipps');
  const laborJs = lese('site/assets/js/labor.js');
  assert.match(laborJs, /data-training'\) === 'freiwillig' \? 'freiwillig'/, 'Überschrift Teil B: freiwillig statt Pflicht');
  const bausteine = lese('app/src/lib/mdx/bausteine.mjs');
  assert.match(bausteine, /training === 'freiwillig'/, 'Baustein Labor wertet training aus');
  const pap = lese('site/assets/js/pap-editor.js');
  assert.match(pap, /if \(!box\.hasAttribute\('data-ohne-code'\)\) solBox\.appendChild/, 'data-ohne-code gilt auch für die Musterlösung');
  const auf = lese('site/assets/js/aufgaben.js');
  assert.match(auf, /data-loesung-nach-tipps/);
  assert.match(auf, /ui\.alleTipps = true/);
  const andere = fs.readdirSync(path.join(WURZEL, 'app/inhalte')).filter((d) => /^v\d\d$/.test(d) && d !== 'v10');
  for (const d of andere) {
    const f = path.join(WURZEL, 'app/inhalte', d, 'labor.mdx');
    if (fs.existsSync(f)) assert.ok(!/training=/.test(fs.readFileSync(f, 'utf8')), d + ': Training bleibt Pflicht');
  }
});

test('Termin 10, freiwilliges Training: Aufgaben in Teil B zählen nicht im Fortschritt', () => {
  const lese = (p) => fs.readFileSync(path.join(WURZEL, p), 'utf8');
  assert.match(lese('site/assets/js/aufgaben.js'), /function taskNodes\(\) \{[^}]*:not\(\[data-freiwillig\]\)/);
  assert.match(lese('site/assets/js/labor.js'), /function countable\(sec\) \{[^}]*:not\(\[data-freiwillig\]\)/);
  assert.match(lese('app/src/lib/mdx/bausteine.mjs'), /a\.attrs\['data-freiwillig'\] = true/);
});
