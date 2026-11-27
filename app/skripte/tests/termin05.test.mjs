/* Selbsttest Termin 05 (npm run selbsttest): Lerneinheit V05 (Zweiersystem und Zählschleifen).
   Prüft die Daten der Übung „Stellenwerttabelle: 200“ gegen die Rechnung, den Selbstcheck (20 Punkte),
   die Zeitangaben im Ablaufplan und die Schreibregeln (keine Pausen, kein Gedankenstrich in Meldungen,
   kein % und kein // im Code). Die Bausteine prüft explorables-v05.test.mjs, das Labor prüft termin02-03.test.mjs. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { WURZEL } from '../../src/lib/pfade.mjs';

const ordner = path.join(WURZEL, 'app', 'inhalte', 'v05');
const lerneinheit = fs.readFileSync(path.join(ordner, 'lerneinheit.mdx'), 'utf8');

test('Termin 05, Übung „Stellenwerttabelle: 200“: Bit und Rest in jeder Zeile stimmen mit der Rechnung überein', () => {
  const d = JSON.parse(fs.readFileSync(path.join(ordner, 'lerneinheit', 'stellenwert.daten.json'), 'utf8'));
  assert.equal(d.sprache, 'tabelle');
  assert.equal(d.ausgabe, false);
  assert.deepEqual(d.vars, ['Bit', 'Rest']);
  assert.equal(d.steps.length, 8);
  let rest = 200;
  let bits = '';
  [128, 64, 32, 16, 8, 4, 2, 1].forEach((w, i) => {
    const bit = w <= rest ? 1 : 0;
    if (bit) rest -= w;
    bits += bit;
    assert.equal(d.code[i], `Stellenwert = ${w}`);
    assert.deepEqual(d.steps[i].set, { Bit: String(bit), Rest: String(rest) }, `Zeile ${i + 1}`);
    assert.equal(d.steps[i].line, i + 1);
    assert.ok(/ohne Anführungszeichen/.test(d.steps[i].frage + d.steps[i].hint), `Zeile ${i + 1}: Hinweis auf Anführungszeichen`);
  });
  assert.equal(bits, '11001000');
  assert.equal(rest, 0);
});

test('Termin 05, Selbstcheck: sechs Fragen mit zusammen 20 Punkten, jede mit Erklärung und richtiger Antwort', () => {
  const quiz = /<Quiz id="v05">([\s\S]*?)<\/Quiz>/.exec(lerneinheit);
  assert.ok(quiz, 'Quiz v05 fehlt');
  const fragen = [...quiz[1].matchAll(/<Frage ([^>]*)>([\s\S]*?)<\/Frage>/g)];
  assert.equal(fragen.length, 6);
  const punkte = fragen.map((f) => Number(/punkte="(\d+)"/.exec(f[1])[1]));
  assert.equal(punkte.reduce((a, b) => a + b, 0), 20);
  for (const f of fragen) {
    assert.match(f[2], /<Erklaerung>/, f[1]);
    if (/typ="mc"/.test(f[1])) assert.match(f[2], /^- \[x\]/m, 'richtige Antwort markiert: ' + f[1]);
    if (/typ="num"/.test(f[1])) assert.match(f[1], /antwort="\d+"/);
  }
  const ids = fragen.map((f) => /id="([^"]+)"/.exec(f[1])[1]);
  assert.equal(new Set(ids).size, 6, 'Fragenkennungen verschieden');
  const antworten = Object.fromEntries(fragen.map((f) => [/id="([^"]+)"/.exec(f[1])[1], (/antwort="([^"]+)"/.exec(f[1]) || [])[1]]));
  assert.equal(antworten['binaer-dezimal'], String(parseInt('01100101', 2)));
  assert.equal(antworten['wie-viele-werte'], String(2 ** 10));
  assert.equal(antworten['durchlaeufe'], String(9 - 2));
  assert.equal(antworten['schleife'], '9');
  assert.equal(parseInt('01001101', 2), 77);
});

test('Termin 05, Ablaufplan: vier Blöcke mit höchstens 28 verplanten Minuten, 48 Minuten zu Hause, keine Pause in der App', () => {
  const dozent = /<Dozent[\s\S]*<\/Dozent>/.exec(lerneinheit)[0];
  assert.match(dozent, /Ablauf des Termins \(125 Minuten\)/);
  for (const z of ['0–10', '10–40', '40–70', '70–100', '100–125']) assert.ok(dozent.includes(`<td>${z}</td>`), z);
  const verplant = [...dozent.matchAll(/Verplant: (\d+)/g)].map((m) => Number(m[1]));
  assert.equal(verplant.length, 4);
  assert.ok(verplant.every((v) => v <= 28), 'verplant: ' + verplant);
  assert.match(dozent, /zusammen 48 Minuten: Stationen 3 und 5 \(9\), Selbstcheck \(7\), Training \(32\)/);
  assert.equal(9 + 7 + 32, 48);
  assert.ok(!/Pause/i.test(lerneinheit), 'Pausen stehen nicht in der App');
});

test('Termin 05, Schreibregeln: Binärzahlen in Vierergruppen, Gedankenstrich nur nicht als Satzzeichen, kein % und kein // im Code', () => {
  assert.ok(!/ — | – /.test(lerneinheit.replace(/<td>\d+–\d+<\/td>/g, '')), 'Gedankenstrich als Satzzeichen');
  for (const m of lerneinheit.matchAll(/```python[^\n]*\n([\s\S]*?)```/g)) {
    assert.ok(!/%|\/\//.test(m[1].replace(/f"[^"]*"/g, '')), 'kein % und kein // im Code:\n' + m[1]);
  }
  assert.ok(!/\b0b[01]/.test(lerneinheit), 'kein 0b in Termin 05');
  for (const b of lerneinheit.matchAll(/`([01]{4} [01]{4})`/g)) assert.match(b[1], /^[01]{4} [01]{4}$/);
  assert.ok(/<div class="v05-planpaar">/.test(lerneinheit), 'beide Pläne in Abschnitt 2 nebeneinander');
});

test('Termin 05, Einbindung: alle drei Bausteine, Pläne und Codeblöcke mit Eingaben, Adresse im Kurs', () => {
  for (const n of ['byte', 'range', 'summe']) assert.match(lerneinheit, new RegExp(`<Explorable name="${n}"`), n);
  assert.match(lerneinheit, /Schleife: i von 1 bis 5\?/);
  assert.match(lerneinheit, /Schleife: i von 1 bis 4\?/);
  assert.equal([...lerneinheit.matchAll(/data-stdin="8\\n10\\n4\\n8"/g)].length, 4);
  const yaml = fs.readFileSync(path.join(WURZEL, 'app', 'kurs.yaml'), 'utf8');
  assert.match(yaml, /lektion: V05/);
  assert.match(yaml, /lerneinheit: v05-zweiersystem-und-zaehlschleifen\.html/);
  assert.match(yaml, /labor: v05-labor\.html/);
  assert.doesNotMatch(yaml.split("nr: V05")[1].split("  - nr:")[0], /aktiv: false/, "V05 ist freigeschaltet");
});

test('Termin 05, Labor: die Minuten von Teil B (48) stehen in labor.mdx, sobald es da ist', (t) => {
  const f = path.join(ordner, 'labor.mdx');
  if (!fs.existsSync(f)) return t.skip('labor.mdx fehlt noch');
  const mdx = fs.readFileSync(f, 'utf8');
  assert.match(mdx, /<Labor [^>]*zuhause="48"/);
  const intro = /Das Training gehört zum Termin:[^<]*?(\d+) Minuten/.exec(mdx);
  assert.equal(intro && intro[1], '48');
});
