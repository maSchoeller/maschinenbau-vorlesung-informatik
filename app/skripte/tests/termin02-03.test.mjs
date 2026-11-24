/* Selbsttest Termin 02 und 03 (npm run selbsttest): Rechen- und Entscheidungslogik der interaktiven Bausteine
   vergleich und weiche (site/assets/js/explorables-v02.js) und schalter (explorables-v03.js).
   Muster: termin01.test.mjs. Das Verhalten im Browser (Tastatur, 44 px, kein Quer-Scrollen) prüft pruefe-seiten.mjs
   an den gebauten Seiten, sobald sie die Bausteine enthalten. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { SITE } from '../../src/lib/pfade.mjs';

const lade = createRequire(path.join(SITE, 'assets', 'js', 'x.js'));
const V2 = lade('./explorables-v02.js');
const V3 = lade('./explorables-v03.js');
const PAP = lade('./pap-engine.js');

test('vergleich: genau auf der Grenze (1,50 €) ist die Aussage bei <=, >= und == wahr', () => {
  assert.deepEqual(V2.wahrBei(1.5), ['<=', '>=', '==']);
  assert.deepEqual(V2.wahrBei(1), ['<', '<=']);
  assert.deepEqual(V2.wahrBei(2), ['>', '>=']);
});

test('vergleich: Aussage mit Zahlen, wahr oder falsch im Satz, True oder False in Python', () => {
  const a = V2.aussage(2, '>=');
  assert.deepEqual([a.code, a.wort, a.python], ['2.0 >= 1.5', 'wahr', 'True']);
  const b = V2.aussage(1, '>=');
  assert.deepEqual([b.code, b.wort, b.python], ['1.0 >= 1.5', 'falsch', 'False']);
  const c = V2.aussage(1.5, '>');
  assert.deepEqual([c.code, c.wort, c.python], ['1.5 > 1.5', 'falsch', 'False']);
  assert.equal(V2.aussage(0.5, '<').code, '0.5 < 1.5');
});

test('vergleich: sieben Punkte für 0 bis 3 Euro in Schritten von 0,50, gefärbt sind die wahren', () => {
  assert.deepEqual(V2.BETRAEGE, [0, 0.5, 1, 1.5, 2, 2.5, 3]);
  assert.deepEqual(V2.punkte('>=').map((p) => p.wahr), [false, false, false, true, true, true, true]);
  assert.deepEqual(V2.punkte('<').map((p) => p.wahr), [true, true, true, false, false, false, false]);
  assert.deepEqual(V2.punkte('==').map((p) => p.wahr), [false, false, false, true, false, false, false]);
  assert.equal(V2.OPERATOREN.length, 5);
});

test('vergleich: Beträge mit Komma und Euro-Zeichen, Ansage mit Wortlaut des Zeichens', () => {
  assert.equal(V2.euro(2), '2,00 €');
  assert.equal(V2.euro(0.5), '0,50 €');
  assert.equal(V2.euro(1.5), '1,50 €');
  assert.match(V2.satzVergleich(1.5, '>='), /Dein Geld 1,50 €.*größer oder gleich.*1\.5 >= 1\.5 ist wahr.*True/);
  assert.match(V2.satzVergleich(1.5, '>'), /1\.5 > 1\.5 ist falsch.*False/);
});

test('weiche, Automat: genau ein Weg, danach läuft es zusammen, Grenzfall 1,50 € nimmt den ja-Weg', () => {
  const P = V2.PLAENE.automat;
  assert.deepEqual(P.werte, [0.5, 1, 1.5, 2, 3]);
  for (const [geld, weg, ausgabe] of [[0.5, 'nein', 'Zu wenig Geld'], [1, 'nein', 'Zu wenig Geld'], [1.5, 'ja', 'Cola kommt'], [2, 'ja', 'Cola kommt'], [3, 'ja', 'Cola kommt']]) {
    const g = V2.gehe(P, geld);
    assert.equal(g.fragen.length, 1, 'eine Frage');
    assert.equal(g.fragen[0].weg, weg, `Weg bei ${geld}`);
    assert.deepEqual(g.ausgaben, [ausgabe, 'Danke'], `Ausgaben bei ${geld}`);
    assert.ok(g.besucht.includes('f1') && g.besucht.includes('a3') && g.besucht.at(-1) === 'e');
    assert.equal(g.besucht.includes('a1') !== g.besucht.includes('a2'), true, 'nie beide Wege, nie keiner');
  }
  assert.equal(V2.gehe(P, 1).fragen[0].text, '1.0 >= 1.5');
  assert.deepEqual(V2.gehe(P, 1).kanten.map((k) => `${k.von}>${k.nach}${k.label ? ':' + k.label : ''}`), ['s>e1', 'e1>f1', 'f1>a2:nein', 'a2>a3', 'a3>e']);
});

test('weiche, Ampel: von oben nach unten, nach dem ersten Ja wird nicht weiter gefragt', () => {
  const P = V2.PLAENE.ampel;
  assert.deepEqual(P.werte, [10, 29, 30, 32, 35, 50]);
  const erwartet = { 10: ['Grün', 1], 29: ['Grün', 1], 30: ['Gelb', 2], 32: ['Gelb', 2], 35: ['Rot', 2], 50: ['Rot', 2] };
  for (const [s, [farbe, fragen]] of Object.entries(erwartet)) {
    const g = V2.gehe(P, Number(s));
    assert.deepEqual(g.ausgaben, [farbe], `Sekunde ${s}`);
    assert.equal(g.fragen.length, fragen, `Fragen bei ${s}`);
  }
  const g32 = V2.gehe(P, 32);
  assert.deepEqual(g32.fragen.map((f) => `${f.text} ${f.wahr}`), ['32 < 30 false', '32 < 35 true']);
  assert.deepEqual(V2.gehe(P, 10).fragen.map((f) => f.text), ['10 < 30'], 'die zweite Frage 10 < 35 wird nie gestellt');
  assert.ok(!V2.gehe(P, 10).besucht.includes('f2'));
  /* Grenzfälle genau auf der Grenze */
  assert.equal(V2.gehe(P, 30).ausgaben[0], 'Gelb', '30 ist schon nicht mehr unter 30');
  assert.equal(V2.gehe(P, 35).ausgaben[0], 'Rot', '35 ist schon nicht mehr unter 35');
  assert.equal(V2.gehe(P, 29).ausgaben[0], 'Grün');
});

test('weiche: Plan aus denselben Daten, jede Kante und jeder Knoten des Wegs steckt im gezeichneten Plan', () => {
  for (const name of ['automat', 'ampel']) {
    const plan = V2.PLAENE[name];
    const lay = PAP.layout(V2.planSpec(PAP.P, plan));
    const knoten = new Set(lay.nodes.map((n) => n.id));
    const kanten = lay.edges.map((e) => `${e.from}>${e.to}:${e.label}`);
    for (const wert of plan.werte) {
      const g = V2.gehe(plan, wert);
      g.besucht.forEach((id) => assert.ok(knoten.has(id), `${name}: Knoten ${id} fehlt im Plan`));
      g.kanten.forEach((k) => assert.ok(kanten.includes(`${k.von}>${k.nach}:${k.label}`), `${name}, ${wert}: Kante ${k.von} nach ${k.nach} (${k.label}) fehlt im Plan; vorhanden: ${kanten}`));
    }
  }
  const svg = PAP.svg(V2.planSpec(PAP.P, V2.PLAENE.ampel), {});
  assert.match(svg, /sekunde &lt; 30\?/);
  assert.match(svg, /sekunde &lt; 35\?/);
});

test('weiche: Plan wählen nach Angabe, sonst nach der Lektion (Termin 03 zeigt die Ampel)', () => {
  assert.equal(V2.planName('ampel', 'V02'), 'ampel');
  assert.equal(V2.planName('automat', 'V03'), 'automat');
  assert.equal(V2.planName(null, 'V03'), 'ampel');
  assert.equal(V2.planName(null, 'V02'), 'automat');
  assert.equal(V2.planName('gibtsnicht', 'V02'), 'automat');
  assert.match(V2.satzWeiche(V2.PLAENE.ampel, 32), /Sekunde im Umlauf 32\. 32 < 30 ist falsch: Weg nein\. 32 < 35 ist wahr: Weg ja\. Ausgabe: Gelb\./);
});

test('schalter: Wahrheitstabelle mit 1 und 0, UND in einer, ODER in drei von vier Stellungen', () => {
  assert.deepEqual(V3.TABELLE.map((z) => [z.a, z.b, z.und, z.oder]), [[0, 0, 0, 0], [0, 1, 0, 1], [1, 0, 0, 1], [1, 1, 1, 1]]);
  assert.equal(V3.anzahlAn('und'), 1);
  assert.equal(V3.anzahlAn('oder'), 3);
  assert.deepEqual([[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => V3.zeileVon(a, b)), [0, 1, 2, 3]);
  assert.equal(V3.und(1, 1), 1);
  assert.equal(V3.oder(0, 0), 0);
});

test('schalter: Ansage nennt beide Schalter und beide Lampen', () => {
  assert.equal(V3.satz(1, 0), 'A = 1, B = 0. Lampe A UND B: aus. Lampe A ODER B: an.');
  assert.equal(V3.satz(1, 1), 'A = 1, B = 1. Lampe A UND B: an. Lampe A ODER B: an.');
  assert.equal(V3.satz(0, 0), 'A = 0, B = 0. Lampe A UND B: aus. Lampe A ODER B: aus.');
});

/* ── Gegenleser-Befunde (Plattform, Termin 02) ─────────────────────────────── */
import fs from 'node:fs';
import { WURZEL } from '../../src/lib/pfade.mjs';
test('Termin 02, Training 3: Tests prüfen Grenze und beide Seiten (ein `>=` statt `==` darf nicht bestehen)', () => {
  const t = fs.readFileSync(path.join(WURZEL, 'app', 'inhalte', 'v02', 'labor', 'tr-3.tests.py'), 'utf8');
  const tipps = [...t.matchAll(/_pruefe\((\d+),/g)].map((m) => Number(m[1]));
  assert.ok(tipps.includes(7) && tipps.some((x) => x < 7) && tipps.some((x) => x > 7), 'Tipps unter, auf und über 7: ' + tipps);
});

test('Labor: die Minuten von Teil B stehen nicht fest im Skript, sondern kommen aus <Labor zuhause>', () => {
  const js = fs.readFileSync(path.join(SITE, 'assets', 'js', 'labor.js'), 'utf8');
  assert.ok(!/\(45 Min, Pflicht\)/.test(js), 'labor.js enthält „(45 Min, Pflicht)“ fest');
  for (const [v, min] of [['v01', '45'], ['v02', '48'], ['v03', '45']]) {
    const mdx = fs.readFileSync(path.join(WURZEL, 'app', 'inhalte', v, 'labor.mdx'), 'utf8');
    assert.match(mdx, new RegExp(`<Labor [^>]*zuhause="${min}"`), `${v}: zuhause="${min}" fehlt`);
    const intro = /Das Training gehört zum Termin:[^<]*?(\d+) Minuten/.exec(mdx);
    assert.equal(intro && intro[1], min, `${v}: Überschrift und Satz bei t-1 nennen verschiedene Minuten`);
  }
});

test('Plan-Engine: kein getipptes Fragezeichen doppelt in der Raute (siehe pap-engine.test.mjs)', () => {
  const p = PAP.toPap([PAP.nIf('alter < 18?', [], [])]);
  const text = JSON.stringify(p);
  assert.ok(text.includes('alter < 18?') && !text.includes('??'));
});

test('Ablauf-Aufgabe als Wahrheitstabelle: jede Aufgabe mit Zeilen „A = 0, B = 1“ trägt sprache „tabelle“ (sonst steht „Python“ über der Tabelle und Schritt/Zeile statt A und B)', () => {
  const ordner = path.join(WURZEL, 'app', 'inhalte');
  const dateien = [];
  const geh = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) geh(p); else if (/\.daten\.json$/.test(e.name)) dateien.push(p); } };
  geh(ordner);
  let gesehen = 0;
  for (const f of dateien) {
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (!Array.isArray(d.code) || !d.code.length || !Array.isArray(d.steps)) continue;
    if (!d.code.every((z) => /^\w+ = [01](, \w+ = [01])+$/.test(z))) continue;
    gesehen++;
    assert.equal(d.sprache, 'tabelle', path.relative(ordner, f) + ': Zeilen sehen wie eine Wahrheitstabelle aus, es fehlt "sprache": "tabelle"');
  }
  assert.ok(gesehen >= 2, 'mindestens die Übung in Termin 03 (Lerneinheit) und Station t-1 (Labor) gefunden');
});
