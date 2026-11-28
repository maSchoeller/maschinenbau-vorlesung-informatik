/* Selbsttest Termin 09 (npm run selbsttest): Lerneinheit V09 (Rechneraufbau, Zerlegen, Zahlenraten Stufe 1, Spielzeug-Rechner).
   Prüft Zahlen und Programme der Lerneinheit gegen die Rechnung (mit Python 3.13 nachgerechnet), den Selbstcheck
   (20 Punkte), die Zeitangaben im Ablaufplan und die Schreibregeln (keine Pausen, kein Gedankenstrich, keine Antwort
   vor einer Vermutung). Die Bausteine prüft explorables-v09.test.mjs, das Labor prüft sich selbst. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { WURZEL } from '../../src/lib/pfade.mjs';

const ordner = path.join(WURZEL, 'app', 'inhalte', 'v09');
const lerneinheit = fs.readFileSync(path.join(ordner, 'lerneinheit.mdx'), 'utf8');
const inhalt = lerneinheit.replace(/^---[\s\S]*?---/, '');
const ohneDozent = inhalt.replace(/<Dozent[\s\S]*<\/Dozent>/, '');

/* Spielzeug-Rechner: vier Befehle, drei Takte je Befehl */
function spielzeug(prog, zellen) {
  const z = { ...zellen };
  let rp = 0;
  let takte = 0;
  for (const zeile of prog) {
    takte += 3;
    const [op, x] = zeile.split(' ');
    if (op === 'LADE') rp = z[x];
    else if (op === 'ADDIERE') rp += z[x];
    else if (op === 'SPEICHERE') z[x] = rp;
    else break;
  }
  return { rp, z, takte };
}

/* Getränkeautomat wie in der Lerneinheit, Texte wie Python (:.2f) */
const preisVon = (nr) => (nr === 1 ? 2.5 : nr === 2 ? 1.0 : 2.0);
const antwort = (geld, preis) => (geld >= preis
  ? `Bitte sehr. Wechselgeld: ${(geld - preis).toFixed(2)} Euro`
  : `Es fehlen ${(preis - geld).toFixed(2)} Euro`);
const hinweis = (geraten, geheim) => (geraten < geheim ? 'Zu klein' : geraten > geheim ? 'Zu groß' : 'Richtig!');

test('Termin 09, Spielzeug-Rechner: Beispielprogramm, Vermutungsprogramm und Selbstcheck sind nachgerechnet', () => {
  const bsp = spielzeug(['LADE A', 'ADDIERE B', 'SPEICHERE C', 'STOPP'], { A: 5, B: 3, C: 0, D: 0 });
  assert.equal(bsp.z.C, 8);
  assert.equal(bsp.takte, 12);
  const verm = spielzeug(['LADE A', 'ADDIERE A', 'SPEICHERE B', 'ADDIERE B', 'SPEICHERE D', 'STOPP'], { A: 4, B: 0, C: 0, D: 0 });
  assert.equal(verm.z.B, 8);
  assert.equal(verm.z.D, 16);
  assert.equal(verm.takte, 18);
  const check = spielzeug(['LADE A', 'ADDIERE A', 'SPEICHERE B', 'STOPP'], { A: 6, B: 0, C: 0, D: 0 });
  assert.equal(check.z.B, 12);
  for (const z of ['Das sind 6 Befehle mal 3 Takte, also 18 Takte.', 'der Rechner hat 12 Takte gebraucht', 'Danach steht in `C` die 8']) assert.ok(lerneinheit.includes(z), z);
  assert.match(lerneinheit, /^- \[x\] 16$/m);
  assert.match(lerneinheit, /<Frage id="spielzeug-rechnen" typ="num" punkte="4" antwort="12" tol="0"/);
  assert.ok(lerneinheit.includes('LADE A\nADDIERE B\nSPEICHERE C\nSTOPP'), 'Beispielprogramm im Text');
});

test('Termin 09, Getränkeautomat: Beispielwerte und Hauptprogramm mit vier Zeilen sind nachgerechnet', () => {
  assert.equal(antwort(3, preisVon(1)), 'Bitte sehr. Wechselgeld: 0.50 Euro');
  assert.equal(antwort(1.5, preisVon(3)), 'Es fehlen 0.50 Euro');
  assert.equal(antwort(1, preisVon(2)), 'Bitte sehr. Wechselgeld: 0.00 Euro');
  for (const z of ['`Bitte sehr. Wechselgeld: 0.50 Euro`', '`Bitte sehr. Wechselgeld: 0.00 Euro`']) assert.ok(lerneinheit.includes(z), z);
  // Zerlegtes Programm: genau vier Zeilen im Hauptprogramm, das lange Programm hat 14 Zeilen ohne Kommentar
  const codes = [...lerneinheit.matchAll(/```python data-stdin="1\\n3"\n([\s\S]*?)```/g)].map((m) => m[1]);
  assert.equal(codes.length, 2, 'langes und zerlegtes Programm');
  const [lang, zerlegt] = codes;
  const zeilen = (c) => c.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));
  assert.equal(zeilen(lang).length, 14, 'langes Programm hat 14 Zeilen');
  const hauptStart = zerlegt.indexOf('wahl = int(input');
  assert.equal(zeilen(zerlegt.slice(hauptStart)).length, 4, 'Hauptprogramm hat vier Zeilen');
  assert.ok(zerlegt.indexOf('def preis_von') < hauptStart && zerlegt.indexOf('def antwort') < hauptStart, 'erst Funktionen, dann Hauptprogramm');
  // Beide Fassungen ergeben für alle 33 Eingaben (3 Getränke mal 11 halbe Euro) dasselbe
  const langFn = (wahl, geld) => {
    let preis;
    if (wahl === 1) preis = 2.5; else if (wahl === 2) preis = 1.0; else preis = 2.0;
    return geld >= preis ? `Bitte sehr. Wechselgeld: ${(geld - preis).toFixed(2)} Euro` : `Es fehlen ${(preis - geld).toFixed(2)} Euro`;
  };
  for (const w of [1, 2, 3]) for (let h = 0; h <= 10; h++) assert.equal(antwort(h / 2, preisVon(w)), langFn(w, h / 2), `${w} / ${h / 2}`);
});

test('Termin 09, Zahlenraten Stufe 1: hinweis, Grenzen und Code sind nachgerechnet', () => {
  assert.equal(hinweis(30, 42), 'Zu klein');
  assert.equal(hinweis(77, 42), 'Zu groß');
  assert.equal(hinweis(42, 42), 'Richtig!');
  assert.equal(hinweis(100, 1), 'Zu groß');
  assert.equal(hinweis(40, 25), 'Zu groß', 'Selbstcheck');
  assert.match(lerneinheit, /<Frage id="tipp-bewerten" typ="output" punkte="3" antwort="Zu groß"/);
  const code = /```python data-stdin="30"\n(import random[\s\S]*?)```/.exec(lerneinheit);
  assert.ok(code, 'Code der Stufe 1');
  assert.ok(code[1].startsWith('import random\n\ndef hinweis(geraten, geheim):'), 'import ganz oben, dann die Funktion');
  assert.ok(code[1].indexOf('def hinweis') < code[1].indexOf('geheim = random.randint(1, 100)'), 'Funktion vor dem Hauptprogramm');
  assert.equal([...code[1].matchAll(/random\.randint\(/g)].length, 1, 'Zahl genau einmal gezogen');
  for (const z of ['Tipp 30 ergibt `Zu klein`', 'Tipp 77 ergibt `Zu groß`', 'Tipp 42 ergibt `Richtig!`', 'Bei `geheim` 1 und Tipp 100 kommt `Zu groß`', "`NameError: name 'random' is not defined`"]) assert.ok(lerneinheit.includes(z), z);
  // Pläne: Zufall im normalen Rechteck, Rückgabe am Ende
  assert.match(lerneinheit, /geheim = random\.randint\(1, 100\)\nEingabe: geraten\nUnterprogramm: text = hinweis\(geraten, geheim\)\nAusgabe: text/);
  assert.match(lerneinheit, /Funktion: hinweis\(geraten, geheim\)\nEntscheidung: geraten < geheim\?[\s\S]*?text = "Richtig!"\nRückgabe: text/);
  assert.ok(!/Unterprogramm: [^\n]*random/.test(lerneinheit), 'randint steht im normalen Rechteck');
});

test('Termin 09, Pläne: Hauptplan und Funktionspläne stehen wie im Zuschnitt, Ergebnis in text', () => {
  assert.match(lerneinheit, /Eingabe: wahl\nEingabe: geld\nUnterprogramm: preis = preis_von\(wahl\)\nUnterprogramm: text = antwort\(geld, preis\)\nAusgabe: text/);
  assert.match(lerneinheit, /Funktion: preis_von\(nr\)\nEntscheidung: nr == 1\?[\s\S]*?preis = 2\.0\nRückgabe: preis/);
  assert.match(lerneinheit, /Funktion: antwort\(geld, preis\)\nEntscheidung: geld >= preis\?[\s\S]*?Rückgabe: text/);
  assert.equal([...lerneinheit.matchAll(/<Plan /g)].length, 5, 'Hauptplan, zwei Funktionen, Zahlenraten und hinweis');
  assert.match(lerneinheit, /Rechteck mit doppelten Seitenlinien/);
});

test('Termin 09, Code der Lerneinheit: nur eingeführte Konstrukte', () => {
  for (const m of lerneinheit.matchAll(/```python[^\n]*\n([\s\S]*?)```/g)) {
    const code = m[1].replace(/f"[^"]*"/g, '').replace(/"[^"]*"/g, '');
    assert.ok(!/\*\*|\/\/|\+=|-=|break|while True|lambda|global|try:|\[|from random|random\.(random|choice|seed|randrange)/.test(code), 'nur eingeführte Konstrukte:\n' + m[1]);
    assert.ok(!/def \w+\([^)]*,[^)]*,[^)]*\)/.test(code), 'höchstens zwei Parameter:\n' + m[1]);
    assert.ok(!/def \w+\([^)]*=/.test(code), 'keine Standardwerte:\n' + m[1]);
  }
  assert.ok(!/Akku|Befehlszähler|Register|Cache|von-Neumann|Adressbus|Datenbus|Steuerbus|Nanosekunde/.test(lerneinheit), 'Wörter, die in Termin 09 nicht fallen');
  assert.ok(!/flüchtig/i.test(lerneinheit), 'flüchtig ist kein Pflichtwort');
});

test('Termin 09, Vermutungen: die Antwort steht nicht im Text davor', () => {
  const kopf = /<Kopf[\s\S]*?<\/Kopf>/.exec(lerneinheit)[0];
  assert.ok(!/Level|verliert|verschwind|dauerhaft|16|18 Takte/.test(kopf), 'der Kopf verrät nichts');
  const vorBaukasten = ohneDozent.slice(0, ohneDozent.indexOf('<Explorable name="bauteile"'));
  assert.ok(!/verliert|verschwind|dauerhaft|flüchtig|ohne Strom|Strom aus|Strom ausfällt|Level/.test(vorBaukasten.replace(/<Kopf[\s\S]*?<\/Kopf>/, '')), 'vor dem Baukasten steht nichts zu Strom aus');
  const vorBaukastenKopfFrei = vorBaukasten.replace(/<Kopf[\s\S]*?<\/Kopf>/, '');
  assert.ok(!/<Begriff/.test(vorBaukastenKopfFrei), 'Begriffs-Hinweise stehen erst nach dem Baustein');
  const baukasten = /<Explorable name="bauteile"[\s\S]*?<\/Explorable>/.exec(lerneinheit)[0];
  assert.ok(!/Level 3 übrig|bleibt Level 3/.test(baukasten.replace(/<Ohne>[\s\S]*?<\/Ohne>/, '')), 'der Baustein verrät Level 3 nicht als Antwort');
  const vorZerlegt = ohneDozent.slice(0, ohneDozent.indexOf('Vorhersage: Wie lang bleibt das Hauptprogramm?'));
  assert.ok(!/(^|[^0-9])4 Zeilen|vier Zeilen/.test(vorZerlegt.replace(/<Kopf[\s\S]*?<\/Kopf>/, '')), 'vor der Zeilen-Vorhersage steht die Zahl nicht');
  assert.ok(!/def preis_von/.test(vorZerlegt.slice(vorZerlegt.indexOf('Zerlegen geht in drei Schritten'))), 'das zerlegte Programm kommt nach der Vorhersage');
  const vorBaustein2 = ohneDozent.slice(0, ohneDozent.indexOf('<Explorable name="zerlegen"'));
  assert.ok(!/dieselbe Ausgabe|ändert die Ausgabe nicht|nicht, was herauskommt|Es fehlen 0\.50/.test(vorBaustein2), 'vor dem Zerlege-Baustein steht nicht, ob sich die Ausgabe ändert');
  const vorZahlen = ohneDozent.slice(0, ohneDozent.indexOf('Vorhersage: Welche Zahlen sind möglich?'));
  assert.ok(!/1 bis 100|beide Grenzen|auch 1 und 100/.test(vorZahlen.slice(vorZahlen.indexOf('Zahlenraten, Teil 1'))), 'vor der Zahlen-Vorhersage steht der Bereich nicht');
  const vorD = ohneDozent.slice(0, ohneDozent.indexOf('Vorhersage: Was steht am Ende in D?'));
  assert.ok(!/18 Takte|16/.test(vorD.replace(/<Kopf[\s\S]*?<\/Kopf>/, '').replace(/1[0-9]{2}/g, '')), 'vor der Vorhersage zu D steht das Ergebnis nicht');
  const vorSpielzeug = ohneDozent.slice(0, ohneDozent.indexOf('<Explorable name="spielzeug"'));
  assert.ok(vorSpielzeug.includes('Vorhersage: Was steht am Ende in D?'), 'Vorhersage steht vor dem Baustein');
  for (const v of lerneinheit.matchAll(/<Vorhersage>([\s\S]*?)<\/Vorhersage>/g)) assert.equal([...v[1].matchAll(/^- \[x\]/gm)].length, 1);
  assert.equal([...lerneinheit.matchAll(/<Vorhersage>/g)].length, 3);
  // Jeder Baustein hat eine Vermutung im Text
  for (const n of ['bauteile', 'zerlegen', 'spielzeug']) {
    const m = new RegExp(`<Explorable name="${n}"[^>]*>([\\s\\S]*?)</Explorable>`).exec(lerneinheit);
    assert.ok(m, n);
    assert.match(m[1], /<Ohne>[\s\S]+<\/Ohne>/, n + ': Text ohne JavaScript');
    assert.match(m[1], /Vermute zuerst/, n + ': Vermutung');
  }
});

test('Termin 09, Begriffe: Rechenplatz statt Akku, Begriffs-Hinweise mit den festgelegten Sätzen', () => {
  const hinweise = [
    'Das Bauteil, das rechnet und die Befehle eines Programms ausführt.',
    'Hält das laufende Programm und seine Daten. Der Inhalt verschwindet, wenn der Strom ausfällt.',
    'Speichert Programme und Dateien dauerhaft, auch ohne Strom. Eine Festplatte macht dasselbe, nur langsamer.',
    'Die Leitungen, über die die Bauteile Daten austauschen.',
    'Der Teil, der die Funktionen der Reihe nach aufruft. Er steht unter den Funktionen.',
    'Ein einzelner kleiner Schritt, den der Prozessor ausführt, zum Beispiel laden, addieren oder speichern.',
    'Die Uhr des Prozessors: Bei jedem Takt macht er einen kleinen Schritt.',
    'Der Platz im Prozessor, an dem gerechnet wird.',
  ];
  for (const h of hinweise) assert.ok(lerneinheit.includes(`e="${h}"`), h);
  assert.ok(lerneinheit.includes('3 Milliarden Takte pro Sekunde') && lerneinheit.includes('1 GHz sind 1 Milliarde Takte pro Sekunde'));
});

test('Termin 09, Selbstcheck: sechs Fragen mit zusammen 20 Punkten, jede mit Erklärung und richtiger Antwort', () => {
  const quiz = /<Quiz id="v09">([\s\S]*?)<\/Quiz>/.exec(lerneinheit);
  assert.ok(quiz, 'Quiz v09 fehlt');
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
    assert.ok(!/alle oben|oben genannt|Reihenfolge der (Fragen|Antworten)|Frage \d|Antwort [A-D]\b|siehe oben/i.test(f[2]), 'kein Verweis auf die Reihenfolge: ' + titel);
  }
  const ids = fragen.map((f) => /id="([^"]+)"/.exec(f[1])[1]);
  assert.equal(new Set(ids).size, 6, 'Fragenkennungen verschieden');
  const strom = fragen.find((f) => /id="strom-aus"/.test(f[1]));
  assert.equal([...strom[2].matchAll(/^- \[x\]/gm)].length, 2, 'SSD und Festplatte');
  assert.match(strom[2], /^- \[x\] SSD$/m);
  assert.match(strom[2], /^- \[x\] Festplatte$/m);
  assert.match(quiz[1], /^- \[x\] Im Arbeitsspeicher$/m);
  assert.match(quiz[1], /^- \[x\] holen, entschlüsseln, ausführen$/m);
  assert.match(quiz[1], /^- \[x\] Nur in `preis_von`$/m);
});

test('Termin 09, Ablaufplan: vier Blöcke mit höchstens 28 verplanten Minuten, 42 Minuten zu Hause, keine Pause in der App', () => {
  const dozent = /<Dozent[\s\S]*<\/Dozent>/.exec(lerneinheit)[0];
  assert.match(dozent, /Ablauf des Termins \(125 Minuten\)/);
  for (const z of ['0–10', '10–40', '40–70', '70–100', '100–125']) assert.ok(dozent.includes(`<td>${z}</td>`), z);
  const verplant = [...dozent.matchAll(/Verplant: (\d+)/g)].map((m) => Number(m[1]));
  assert.deepEqual(verplant, [25, 26, 27, 24]);
  assert.ok(verplant.slice(0, 3).every((v) => v <= 28) && verplant[3] <= 24, 'verplant: ' + verplant);
  const zeilen = [...dozent.matchAll(/<tr><td>(\d+–\d+)<\/td>[\s\S]*?<\/tr>/g)];
  const summen = zeilen.map((z) => [...z[0].replace(/<[^>]+>/g, '').split('Auftrag für zu Hause')[0].matchAll(/\((\d+)\)/g)].map((m) => Number(m[1])));
  assert.equal(summen[0].reduce((x, y) => x + y, 0), 10, 'Warm-up: 5 + 2 + 3');
  assert.equal(summen[1].reduce((x, y) => x + y, 0), 25);
  assert.equal(summen[2].reduce((x, y) => x + y, 0), 26);
  assert.equal(summen[3].reduce((x, y) => x + y, 0), 27);
  assert.equal(summen[4].reduce((x, y) => x + y, 0) + 2, 24, 'letzter Block: Einzelminuten plus 2 für den Auftrag');
  assert.match(dozent, /zusammen 42 Minuten: Bauteile zuordnen \(4\), Vorgerechnet Schritt 6 \(1\), Selbstcheck \(7\), Training \(30\)/);
  assert.equal(4 + 1 + 7 + 30, 42);
  assert.equal(42 + 6, 48, 'Hausaufgabe wächst auf 48, wenn Station 5 nach Hause geht');
  assert.ok(!/Pause/i.test(lerneinheit), 'Pausen stehen nicht in der App');
  assert.ok(dozent.includes('Training Termin 08, Aufgabe 1 „Typen und Umwandlung“'));
});

test('Termin 09, Warm-up: Auflösung des Trainings „Typen und Umwandlung“ stimmt', () => {
  assert.equal(Math.trunc(7.9), 7);
  assert.equal('4' + '5', '45');
  assert.equal(parseInt('4', 10) + 5, 9);
  assert.equal('Punkte: ' + String(15), 'Punkte: 15');
  for (const z of ['<code>7</code>', '<code>45</code>', '<code>9</code>', '<code>str</code>', '<code>Punkte: 15</code>', '<code>TypeError</code>']) assert.ok(lerneinheit.includes(z), z);
});

test('Termin 09, Schreibregeln: kein Gedankenstrich, keine Emojis, LF-Zeilenenden', () => {
  assert.ok(!/ — | – /.test(lerneinheit.replace(/<td>\d+–\d+<\/td>/g, '')), 'Gedankenstrich als Satzzeichen');
  assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(lerneinheit), 'keine Emojis');
  assert.ok(!/\r/.test(lerneinheit), 'LF-Zeilenenden');
  assert.ok(!/Pause|Pausen/.test(lerneinheit), 'keine Pause in App-Texten');
});

test('Termin 09, Einbindung: drei Bausteine mit Text ohne JavaScript, Video, Adresse und Eintrag im Kurs', () => {
  assert.equal([...lerneinheit.matchAll(/<Explorable /g)].length, 3, 'genau drei Bausteine');
  assert.match(lerneinheit, /\.\.\/assets\/js\/explorables-v09\.js/);
  assert.match(lerneinheit, /\.\.\/assets\/css\/v09\.css/);
  assert.match(lerneinheit, /\.\.\/assets\/css\/v05\.css/);
  assert.match(lerneinheit, /<Video name="v09-theorie"[^>]*fehlt="Video folgt\./);
  assert.match(lerneinheit, /<Weiter ziel="v09-labor\.html">/);
  assert.match(lerneinheit, /<Lerneinheit nr="V09" name="Termin 09" labor="v09-labor\.html">/);
  assert.match(lerneinheit, /data-lesson: V09/);
});

test('Termin 09, kurs.yaml: Eintrag V09, sobald der Integrations-Schritt ihn gesetzt hat', (t) => {
  const yaml = fs.readFileSync(path.join(WURZEL, 'app', 'kurs.yaml'), 'utf8');
  if (!/nr: 9,[^\n]*lektion: V09/.test(yaml)) return t.skip('kurs.yaml noch ohne V09');
  assert.match(yaml, /lerneinheit: v09-rechneraufbau-und-zufall\.html/);
  assert.match(yaml, /labor: v09-labor\.html/);
  const v09 = yaml.split('nr: V09')[1];
  assert.match(v09, /python: \["import random", "random\.randint\(a, b\)", "Programm in Funktionen zerlegen"\]/);
  assert.match(v09, /hook: "Dein Rechner zählt im Takt"/);
  assert.match(v09, /kurz: "Rechneraufbau, Zufall"/);
});

test('Termin 09, Labor: die Minuten von Teil B (42) stehen in labor.mdx, sobald es da ist', (t) => {
  const f = path.join(ordner, 'labor.mdx');
  if (!fs.existsSync(f)) return t.skip('labor.mdx fehlt noch');
  const mdx = fs.readFileSync(f, 'utf8');
  assert.match(mdx, /<Labor [^>]*zuhause="42"/);
});
