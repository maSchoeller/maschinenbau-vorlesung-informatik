/* Selbsttest Termin 04: Rechenkern der Bausteine vier-schalter, gleichwertig und schleife (site/assets/js/explorables-v04.js).
   Alle Erwartungswerte sind mit Python nachgerechnet (itertools.product), nicht im Kopf.
   Das Verhalten im Browser (Tastatur, 44 px, Live-Ansage) prüft die Sichtprüfung an der gebauten Seite. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { SITE } from '../../src/lib/pfade.mjs';

const lade = createRequire(path.join(SITE, 'assets', 'js', 'x.js'));
const V4 = lade('./explorables-v04.js');
const PAP = lade('./pap-engine.js');

const spalte = (id) => V4.zeilenVier(V4.ausdruckMit(id)).map((z) => z.y).join('');

test('vier-schalter: 16 Zeilen von 0000 bis 1111, D wechselt jede Zeile, A alle 8', () => {
  const z = V4.zeilenVier(V4.AUSDRUECKE[0]);
  assert.equal(z.length, 16);
  assert.deepEqual(z.map((r) => `${r.a}${r.b}${r.c}${r.d}`), Array.from({ length: 16 }, (_, i) => i.toString(2).padStart(4, '0')));
  assert.deepEqual([[0, 0, 0, 0], [0, 0, 0, 1], [1, 0, 1, 1], [1, 1, 1, 1]].map((v) => V4.zeileVonVier(...v)), [0, 1, 11, 15]);
});

test('vier-schalter: Ergebnisspalten F, Y und Stör (Python)', () => {
  assert.equal(spalte('f'), '0000000000000001');
  assert.equal(spalte('y'), '0001000100011111');
  assert.equal(spalte('s'), '1110111011101110');
  assert.deepEqual(['f', 'y', 's'].map((id) => V4.anzahlEinsen(V4.ausdruckMit(id))), [1, 7, 12]);
});

test('vier-schalter: Hilfsspalten A UND B und C UND D, NICHT C und NICHT D', () => {
  const z = V4.zeilenVier(V4.ausdruckMit('y'));
  assert.equal(z.map((r) => r.hilf[0]).join(''), '0000000000001111');
  assert.equal(z.map((r) => r.hilf[1]).join(''), '0001000100010001');
  const s = V4.zeilenVier(V4.ausdruckMit('s'));
  assert.equal(s.map((r) => r.hilf[0]).join(''), '1100110011001100');
  assert.equal(s.map((r) => r.hilf[1]).join(''), '1010101010101010');
});

test('vier-schalter: Ansage nennt alle vier Schalter und die Lampe', () => {
  assert.equal(V4.satzVier(V4.ausdruckMit('f'), 1, 1, 1, 1), 'F = (A UND B) UND (C UND D). A = 1, B = 1, C = 1, D = 1. Hub frei: leuchtet, F = 1.');
  assert.equal(V4.satzVier(V4.ausdruckMit('s'), 1, 1, 1, 1), 'Stör = (NICHT C) ODER (NICHT D). A = 1, B = 1, C = 1, D = 1. Störlampe: aus, Stör = 0.');
  assert.match(V4.satzVier(V4.ausdruckMit('y'), 0, 0, 1, 1), /Lampe Y: leuchtet, Y = 1\.$/);
});

test('gleichwertig: Spalten der vier Paare (Python)', () => {
  const sp = (id, s) => V4.spalteText(V4.paarMit(id), s).replace(/ /g, '');
  assert.deepEqual([sp('sperre', 'links'), sp('sperre', 'rechts')], ['1110', '1110']);
  assert.deepEqual([sp('ruhe', 'links'), sp('ruhe', 'rechts')], ['1000', '1000']);
  assert.deepEqual([sp('falle', 'links'), sp('falle', 'rechts')], ['1110', '1000']);
  assert.deepEqual([sp('vorrang', 'links'), sp('vorrang', 'rechts')], ['00010101', '00011111']);
});

test('gleichwertig: Urteil nennt die Unterschiedszeilen, bei Gleichheit nur „gleichwertig“', () => {
  assert.equal(V4.urteil(V4.paarMit('sperre')), 'gleichwertig');
  assert.equal(V4.urteil(V4.paarMit('ruhe')), 'gleichwertig');
  assert.equal(V4.urteil(V4.paarMit('falle')), 'nicht gleichwertig, Unterschied in Zeile 01 und 10');
  assert.equal(V4.urteil(V4.paarMit('vorrang')), 'nicht gleichwertig, Unterschied in Zeile 100 und 110');
  assert.deepEqual(V4.unterschiede(V4.paarMit('falle')), ['01', '10']);
  assert.equal(V4.liste(['1', '2', '3']), '1, 2 und 3');
  assert.equal(V4.liste(['7']), '7');
});

test('gleichwertig: Ansage nennt beide Ausdrücke, beide Spalten und das Urteil', () => {
  assert.equal(V4.satzPaar(V4.paarMit('falle')), 'Falle: NICHT (C UND D) hat die Spalte 1 1 1 0, (NICHT C) UND (NICHT D) hat die Spalte 1 0 0 0. Urteil: nicht gleichwertig, Unterschied in Zeile 01 und 10.');
});

function verlauf(cfg) { return V4.bisEnde(V4.neu(), cfg); }

test('schleife: Ausgabe und Durchläufe für alle Startwerte, > und >= (Python)', () => {
  const erwartet = {
    '0 >': [[], 0], '0 >=': [['0'], 1], '1 >': [['1'], 1], '1 >=': [['1', '0'], 2],
    '3 >': [['3', '2', '1'], 3], '3 >=': [['3', '2', '1', '0'], 4], '5 >': [['5', '4', '3', '2', '1'], 5], '5 >=': [['5', '4', '3', '2', '1', '0'], 6]
  };
  for (const start of V4.STARTWERTE) for (const op of V4.VERGLEICHE) {
    const z = verlauf({ start, op, verr: true });
    const [aus, n] = erwartet[`${start} ${op}`];
    assert.deepEqual(z.ausgabe, [...aus, 'Start!'], `${start} ${op}`);
    assert.equal(z.rumpf, n, `${start} ${op}`);
    assert.ok(z.fertig && !z.endlos);
  }
});

test('schleife: Startwert 0 mit > läuft den Rumpf nie, es erscheint nur „Start!“', () => {
  const z = verlauf({ start: 0, op: '>', verr: true });
  assert.deepEqual(z.ausgabe, ['Start!']);
  assert.equal(V4.rumpfText(z), 'Der Rumpf lief 0-mal.');
  /* ohne Verringern ebenfalls, denn der Rumpf läuft gar nicht erst */
  const o = verlauf({ start: 0, op: '>', verr: false });
  assert.ok(o.fertig && !o.endlos);
  assert.equal(o.schritte, 4);
});

test('schleife: Ein Schritt geht Knoten für Knoten durch den Plan, jede Prüfung der Raute ist ein Schritt', () => {
  const cfg = { start: 1, op: '>', verr: true };
  let z = V4.neu();
  const folge = [z.pos];
  while (!z.fertig) { z = V4.schritt(z, cfg); folge.push(z.pos); }
  assert.deepEqual(folge, ['start', 'init', 'frage', 'ausgabe', 'verringern', 'frage', 'schluss', 'ende']);
  assert.equal(z.schritte, 7);
});

test('schleife: ohne Verringern stoppt der Lauf nach 20 Schritten mit der Meldung zur Endlosschleife', () => {
  const z = verlauf({ start: 3, op: '>', verr: false });
  assert.ok(z.endlos && !z.fertig);
  assert.equal(z.schritte, V4.GRENZE);
  assert.equal(V4.GRENZE, 20);
  assert.match(z.letzte, /Das wäre eine Endlosschleife\.$/);
  assert.deepEqual(z.ausgabe.slice(0, 3), ['3', '3', '3']);
  /* ein weiterer Schritt ändert nichts mehr */
  assert.equal(V4.schritt(z, { start: 3, op: '>', verr: false }), z);
});

test('schleife: Zustand ist unveränderlich, der Zähler läuft mit dem Rumpf herunter', () => {
  const cfg = V4.standard();
  const a = V4.neu();
  const b = V4.schritt(a, cfg);
  assert.equal(a.pos, 'start');
  assert.equal(b.pos, 'init');
  let z = V4.bisEnde(a, cfg);
  assert.equal(z.zaehler, 0);
  assert.match(V4.satzSchleife(z), /Zähler: 0\. Der Rumpf lief 3-mal\. Bisherige Ausgabe: 3, 2, 1, Start!\./);
});

test('schleife: Plan mit Rücksprung aus denselben Daten, jeder Schritt-Knoten steckt im gezeichneten Plan', () => {
  for (const verr of [true, false]) {
    const cfg = { start: 3, op: '>=', verr };
    const spec = V4.planSpec(PAP.P, cfg);
    const svg = PAP.svg(spec, {});
    for (const id of ['start', 'init', 'frage', 'ausgabe', 'schluss', 'ende']) assert.match(svg, new RegExp(`data-id="${id}"`), id);
    assert.equal(/data-id="verringern"/.test(svg), verr);
    assert.match(svg, /zaehler &gt;= 0\?/);
    assert.match(svg, /zaehler = 3/);
    /* Rücksprung: eine Kante führt vom letzten Rumpfknoten zurück zur Raute */
    const letzter = verr ? 'verringern' : 'ausgabe';
    assert.match(svg, new RegExp(`data-from="${letzter}" data-to="frage"`));
  }
});
