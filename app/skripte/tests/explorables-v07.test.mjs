/* Selbsttest Termin 07: Rechenkern der Bausteine kreis, maschine und lupe (site/assets/js/explorables-v07.js).
   Die Erwartungswerte der Kommazahlen sind mit Python 3.13 erzeugt (repr, f"{x:.20f}", ==, round(x, 2) ==), nicht im Kopf;
   die Tabelle PYTHON_SUMMEN enthält alle 121 Paare aus der Auswahl des Bausteins. Zweierpotenzen und Überläufe sind nachgerechnet.
   Das Verhalten im Browser (Tastatur, Ansagen, keine Lösung im Ausgangszustand) prüft pruefe-v07.mjs an der gebauten Seite. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { SITE } from '../../src/lib/pfade.mjs';

const lade = createRequire(path.join(SITE, 'assets', 'js', 'x.js'));
const V7 = lade('./explorables-v07.js');
const M = V7.MINUS;
const keinStrich = (s) => assert.ok(!/[–—]/.test(s), 'kein Gedankenstrich: ' + s);

/* Python 3.13: [ha, hb, repr(a + b), f"{a + b:.20f}", a + b == erwartet, round(a + b, 2) == erwartet], a = ha / 100, b = hb / 100, erwartet = (ha + hb) / 100 */
const PYTHON_SUMMEN = [
  [10, 10, '0.2', '0.20000000000000001110', true, true],
  [10, 20, '0.30000000000000004', '0.30000000000000004441', false, true],
  [10, 30, '0.4', '0.40000000000000002220', true, true],
  [10, 40, '0.5', '0.50000000000000000000', true, true],
  [10, 50, '0.6', '0.59999999999999997780', true, true],
  [10, 60, '0.7', '0.69999999999999995559', true, true],
  [10, 70, '0.7999999999999999', '0.79999999999999993339', false, true],
  [10, 80, '0.9', '0.90000000000000002220', true, true],
  [10, 90, '1.0', '1.00000000000000000000', true, true],
  [10, 25, '0.35', '0.34999999999999997780', true, true],
  [10, 75, '0.85', '0.84999999999999997780', true, true],
  [20, 10, '0.30000000000000004', '0.30000000000000004441', false, true],
  [20, 20, '0.4', '0.40000000000000002220', true, true],
  [20, 30, '0.5', '0.50000000000000000000', true, true],
  [20, 40, '0.6000000000000001', '0.60000000000000008882', false, true],
  [20, 50, '0.7', '0.69999999999999995559', true, true],
  [20, 60, '0.8', '0.80000000000000004441', true, true],
  [20, 70, '0.8999999999999999', '0.89999999999999991118', false, true],
  [20, 80, '1.0', '1.00000000000000000000', true, true],
  [20, 90, '1.1', '1.10000000000000008882', true, true],
  [20, 25, '0.45', '0.45000000000000001110', true, true],
  [20, 75, '0.95', '0.94999999999999995559', true, true],
  [30, 10, '0.4', '0.40000000000000002220', true, true],
  [30, 20, '0.5', '0.50000000000000000000', true, true],
  [30, 30, '0.6', '0.59999999999999997780', true, true],
  [30, 40, '0.7', '0.69999999999999995559', true, true],
  [30, 50, '0.8', '0.80000000000000004441', true, true],
  [30, 60, '0.8999999999999999', '0.89999999999999991118', false, true],
  [30, 70, '1.0', '1.00000000000000000000', true, true],
  [30, 80, '1.1', '1.10000000000000008882', true, true],
  [30, 90, '1.2', '1.19999999999999995559', true, true],
  [30, 25, '0.55', '0.55000000000000004441', true, true],
  [30, 75, '1.05', '1.05000000000000004441', true, true],
  [40, 10, '0.5', '0.50000000000000000000', true, true],
  [40, 20, '0.6000000000000001', '0.60000000000000008882', false, true],
  [40, 30, '0.7', '0.69999999999999995559', true, true],
  [40, 40, '0.8', '0.80000000000000004441', true, true],
  [40, 50, '0.9', '0.90000000000000002220', true, true],
  [40, 60, '1.0', '1.00000000000000000000', true, true],
  [40, 70, '1.1', '1.10000000000000008882', true, true],
  [40, 80, '1.2000000000000002', '1.20000000000000017764', false, true],
  [40, 90, '1.3', '1.30000000000000004441', true, true],
  [40, 25, '0.65', '0.65000000000000002220', true, true],
  [40, 75, '1.15', '1.14999999999999991118', true, true],
  [50, 10, '0.6', '0.59999999999999997780', true, true],
  [50, 20, '0.7', '0.69999999999999995559', true, true],
  [50, 30, '0.8', '0.80000000000000004441', true, true],
  [50, 40, '0.9', '0.90000000000000002220', true, true],
  [50, 50, '1.0', '1.00000000000000000000', true, true],
  [50, 60, '1.1', '1.10000000000000008882', true, true],
  [50, 70, '1.2', '1.19999999999999995559', true, true],
  [50, 80, '1.3', '1.30000000000000004441', true, true],
  [50, 90, '1.4', '1.39999999999999991118', true, true],
  [50, 25, '0.75', '0.75000000000000000000', true, true],
  [50, 75, '1.25', '1.25000000000000000000', true, true],
  [60, 10, '0.7', '0.69999999999999995559', true, true],
  [60, 20, '0.8', '0.80000000000000004441', true, true],
  [60, 30, '0.8999999999999999', '0.89999999999999991118', false, true],
  [60, 40, '1.0', '1.00000000000000000000', true, true],
  [60, 50, '1.1', '1.10000000000000008882', true, true],
  [60, 60, '1.2', '1.19999999999999995559', true, true],
  [60, 70, '1.2999999999999998', '1.29999999999999982236', false, true],
  [60, 80, '1.4', '1.39999999999999991118', true, true],
  [60, 90, '1.5', '1.50000000000000000000', true, true],
  [60, 25, '0.85', '0.84999999999999997780', true, true],
  [60, 75, '1.35', '1.35000000000000008882', true, true],
  [70, 10, '0.7999999999999999', '0.79999999999999993339', false, true],
  [70, 20, '0.8999999999999999', '0.89999999999999991118', false, true],
  [70, 30, '1.0', '1.00000000000000000000', true, true],
  [70, 40, '1.1', '1.10000000000000008882', true, true],
  [70, 50, '1.2', '1.19999999999999995559', true, true],
  [70, 60, '1.2999999999999998', '1.29999999999999982236', false, true],
  [70, 70, '1.4', '1.39999999999999991118', true, true],
  [70, 80, '1.5', '1.50000000000000000000', true, true],
  [70, 90, '1.6', '1.60000000000000008882', true, true],
  [70, 25, '0.95', '0.94999999999999995559', true, true],
  [70, 75, '1.45', '1.44999999999999995559', true, true],
  [80, 10, '0.9', '0.90000000000000002220', true, true],
  [80, 20, '1.0', '1.00000000000000000000', true, true],
  [80, 30, '1.1', '1.10000000000000008882', true, true],
  [80, 40, '1.2000000000000002', '1.20000000000000017764', false, true],
  [80, 50, '1.3', '1.30000000000000004441', true, true],
  [80, 60, '1.4', '1.39999999999999991118', true, true],
  [80, 70, '1.5', '1.50000000000000000000', true, true],
  [80, 80, '1.6', '1.60000000000000008882', true, true],
  [80, 90, '1.7000000000000002', '1.70000000000000017764', false, true],
  [80, 25, '1.05', '1.05000000000000004441', true, true],
  [80, 75, '1.55', '1.55000000000000004441', true, true],
  [90, 10, '1.0', '1.00000000000000000000', true, true],
  [90, 20, '1.1', '1.10000000000000008882', true, true],
  [90, 30, '1.2', '1.19999999999999995559', true, true],
  [90, 40, '1.3', '1.30000000000000004441', true, true],
  [90, 50, '1.4', '1.39999999999999991118', true, true],
  [90, 60, '1.5', '1.50000000000000000000', true, true],
  [90, 70, '1.6', '1.60000000000000008882', true, true],
  [90, 80, '1.7000000000000002', '1.70000000000000017764', false, true],
  [90, 90, '1.8', '1.80000000000000004441', true, true],
  [90, 25, '1.15', '1.14999999999999991118', true, true],
  [90, 75, '1.65', '1.64999999999999991118', true, true],
  [25, 10, '0.35', '0.34999999999999997780', true, true],
  [25, 20, '0.45', '0.45000000000000001110', true, true],
  [25, 30, '0.55', '0.55000000000000004441', true, true],
  [25, 40, '0.65', '0.65000000000000002220', true, true],
  [25, 50, '0.75', '0.75000000000000000000', true, true],
  [25, 60, '0.85', '0.84999999999999997780', true, true],
  [25, 70, '0.95', '0.94999999999999995559', true, true],
  [25, 80, '1.05', '1.05000000000000004441', true, true],
  [25, 90, '1.15', '1.14999999999999991118', true, true],
  [25, 25, '0.5', '0.50000000000000000000', true, true],
  [25, 75, '1.0', '1.00000000000000000000', true, true],
  [75, 10, '0.85', '0.84999999999999997780', true, true],
  [75, 20, '0.95', '0.94999999999999995559', true, true],
  [75, 30, '1.05', '1.05000000000000004441', true, true],
  [75, 40, '1.15', '1.14999999999999991118', true, true],
  [75, 50, '1.25', '1.25000000000000000000', true, true],
  [75, 60, '1.35', '1.35000000000000008882', true, true],
  [75, 70, '1.45', '1.44999999999999995559', true, true],
  [75, 80, '1.55', '1.55000000000000004441', true, true],
  [75, 90, '1.65', '1.64999999999999991118', true, true],
  [75, 25, '1.0', '1.00000000000000000000', true, true],
  [75, 75, '1.5', '1.50000000000000000000', true, true],
];

/* ── kreis ────────────────────────────────────────────────── */
test('kreis: Bereiche, Lesarten und Bits (8 Bit ohne und mit Vorzeichen, 4 Bit nur ohne)', () => {
  assert.deepEqual(V7.bereich(8, false), { min: 0, max: 255 });
  assert.deepEqual(V7.bereich(8, true), { min: -128, max: 127 });
  assert.deepEqual(V7.bereich(4, false), { min: 0, max: 15 });
  assert.deepEqual(V7.bereich(4, true), { min: 0, max: 15 }, 'mit 4 Bit gibt es keine Zahlen mit Vorzeichen');
  assert.equal(V7.vzErlaubt(8), true);
  assert.equal(V7.vzErlaubt(4), false);
  assert.equal(V7.anzahl(8), 256);
  assert.equal(V7.anzahl(4), 16);
  const tab = [[0, 0, 0], [127, 127, 127], [128, 128, -128], [254, 254, -2], [255, 255, -1]];
  for (const [u, ohne, mit] of tab) {
    assert.equal(V7.lesen(u, 8, false), ohne, `ohne ${u}`);
    assert.equal(V7.lesen(u, 8, true), mit, `mit ${u}`);
  }
  assert.equal(V7.bitsText(128, 8), '1000 0000');
  assert.equal(V7.bitsText(255, 8), '1111 1111');
  assert.equal(V7.bitsText(0, 8), '0000 0000');
  assert.equal(V7.bitsText(10, 4), '1010');
  assert.deepEqual(V7.gruppen(250, 8), ['1111', '1010']);
  for (let u = 0; u <= 255; u++) {
    assert.equal(V7.bitsText(u, 8).replace(' ', ''), u.toString(2).padStart(8, '0'), `bits ${u}`);
    assert.equal(V7.bitsVon(V7.lesen(u, 8, true), 8), u, `rueckweg mit ${u}`);
    assert.equal(V7.bitsVon(V7.lesen(u, 8, false), 8), u, `rueckweg ohne ${u}`);
    assert.equal(V7.lesen(u, 8, true), u >= 128 ? u - 256 : u);
  }
  assert.equal(V7.lesen(12, 4, true), 12);
  assert.equal(V7.zustand(4, true, 12).mitVz, false);
});

test('kreis: Überlauf nach 255 + 1 ergibt 0, ohne die Zahl, die Python liefert (Meldung ohne Gedankenstrich)', () => {
  const r = V7.schritt(V7.zustand(8, false, 255), 1);
  assert.equal(r.zustand.u, 0);
  assert.equal(r.neu, 0);
  assert.equal(r.ueberlauf, true);
  assert.equal(r.zeile1, 'Überlauf: 255 + 1 ergibt 0');
  assert.equal(r.zeile2, 'Der Platz reicht nicht, der Zähler springt auf die andere Seite.');
  assert.ok(!/256/.test(r.zeile2 + r.satz), 'die Antwort der Vorhersage steht nicht im Baustein');
  assert.equal(r.satz, 'Überlauf: 255 + 1 ergibt 0. Der Platz reicht nicht, der Zähler springt auf die andere Seite.');
  keinStrich(r.satz);
  const n = V7.schritt(V7.zustand(8, false, 250), 1);
  assert.equal(n.ueberlauf, false);
  assert.equal(n.zeile1, '');
  assert.equal(n.satz, '250 + 1 ergibt 251.');
  assert.equal(n.zustand.u, 251);
  const u = V7.schritt(V7.zustand(8, false, 0), -1);
  assert.equal(u.zustand.u, 255);
  assert.equal(u.zeile1, `Überlauf: 0 ${M} 1 ergibt 255`);
  assert.equal(u.zeile2, 'Der Platz reicht nicht, der Zähler springt auf die andere Seite.');
  const v = V7.schritt(V7.zustand(4, false, 15), 1);
  assert.equal(v.zeile1, 'Überlauf: 15 + 1 ergibt 0');
  assert.equal(v.zeile2, 'Der Platz reicht nicht, der Zähler springt auf die andere Seite.');
});

test('kreis: mit Vorzeichen nach 127 + 1 kommt −128, dieselben Bits, andere Lesart', () => {
  const r = V7.schritt(V7.zustand(8, true, 127), 1);
  assert.equal(r.zustand.u, 128);
  assert.equal(r.neu, -128);
  assert.equal(r.zeile1, `Überlauf: 127 + 1 ergibt ${M}128`);
  assert.equal(r.zeile2, 'Der Platz reicht nicht, der Zähler springt auf die andere Seite.');
  const u = V7.schritt(V7.zustand(8, true, 128), -1);
  assert.equal(u.zustand.u, 127);
  assert.equal(u.zeile1, `Überlauf: ${M}128 ${M} 1 ergibt 127`);
  assert.equal(u.zeile2, 'Der Platz reicht nicht, der Zähler springt auf die andere Seite.');
  /* −1 + 1 ergibt 0, kein Überlauf (255 + 1 wäre einer, aber nur ohne Vorzeichen) */
  const z = V7.schritt(V7.zustand(8, true, 255), 1);
  assert.equal(z.neu, 0);
  assert.equal(z.ueberlauf, false);
  assert.equal(z.zustand.u, 0);
  /* Wechsel der Lesart: 1000 0000 ist 128 oder −128, die Bits bleiben */
  const w = V7.lesartWechsel(V7.zustand(8, false, 128), true);
  assert.equal(w.zustand.u, 128);
  assert.equal(w.vorher, 128);
  assert.equal(w.jetzt, -128);
  assert.equal(w.satz, `Dieselben Bits 1000 0000, andere Lesart: eben noch 128, jetzt ${M}128.`);
  keinStrich(w.satz);
  const g = V7.lesartWechsel(V7.zustand(8, false, 100), true);
  assert.equal(g.geaendert, false);
  assert.equal(g.satz, 'Dieselben Bits 0110 0100, in beiden Lesarten 100.');
  /* 256 Schritte einmal rundherum: genau ein Überlauf, danach wieder am Start */
  for (const vz of [false, true]) {
    let zz = V7.zustand(8, vz, 0), ueberlaeufe = 0;
    for (let i = 0; i < 256; i++) { const s = V7.schritt(zz, 1); zz = s.zustand; if (s.ueberlauf) ueberlaeufe++; }
    assert.equal(zz.u, 0);
    assert.equal(ueberlaeufe, 1, vz ? 'mit Vorzeichen' : 'ohne Vorzeichen');
  }
});

test('kreis: Start setzen nur im erlaubten Bereich, Minus mit Bindestrich oder Minuszeichen', () => {
  assert.deepEqual(V7.pruefeStart('255', 8, false), { ok: true, zahl: 255, u: 255 });
  assert.deepEqual(V7.pruefeStart('0', 8, false), { ok: true, zahl: 0, u: 0 });
  assert.deepEqual(V7.pruefeStart('-128', 8, true), { ok: true, zahl: -128, u: 128 });
  assert.deepEqual(V7.pruefeStart(`${M}1`, 8, true), { ok: true, zahl: -1, u: 255 });
  assert.deepEqual(V7.pruefeStart('127', 8, true), { ok: true, zahl: 127, u: 127 });
  assert.equal(V7.pruefeStart('15', 4, false).ok, true);
  for (const [t, b, vz] of [['256', 8, false], ['-1', 8, false], ['128', 8, true], ['-129', 8, true], ['16', 4, false], ['-1', 4, false], ['', 8, false], ['1.5', 8, false], ['abc', 8, false]]) {
    const p = V7.pruefeStart(t, b, vz);
    assert.equal(p.ok, false, `abgelehnt: ${t}`);
    assert.ok(p.meldung.length > 10);
    keinStrich(p.meldung);
  }
  assert.equal(V7.pruefeStart('256', 8, false).meldung, 'Der Zähler zeigt nur Zahlen von 0 bis 255.');
  assert.equal(V7.pruefeStart('128', 8, true).meldung, `Der Zähler zeigt nur Zahlen von ${M}128 bis 127.`);
});

test('kreis: Zeiger auf dem Kreis (0 oben, im Uhrzeigersinn) und Beschriftung ohne die Lösung', () => {
  const o = V7.punkt(0, 8, 100, 0, 0);
  assert.ok(Math.abs(o.x) < 1e-9 && Math.abs(o.y + 100) < 1e-9, 'null steht oben');
  const r = V7.punkt(64, 8, 100, 0, 0);
  assert.ok(Math.abs(r.x - 100) < 1e-9 && Math.abs(r.y) < 1e-9, '64 steht rechts');
  const u = V7.punkt(128, 8, 100, 0, 0);
  assert.ok(Math.abs(u.y - 100) < 1e-9, '128 steht unten');
  assert.equal(V7.winkel(4, 4), 90);
  assert.deepEqual(V7.marken(8, false).map((m) => m.text), ['0', '64', '128', '192']);
  assert.deepEqual(V7.marken(4, false).map((m) => m.text), ['0', '4', '8', '12']);
  /* mit Vorzeichen fehlt die Beschriftung bei der Hälfte: −128 steht nirgends auf dem Kreis */
  assert.deepEqual(V7.marken(8, true).map((m) => m.text), ['0', '64', `${M}64`]);
  const a = V7.ansichtKreis(V7.zustand(8, true, 200));
  assert.equal(a.wert, -56);
  assert.equal(a.negativ, true);
  assert.equal(a.bits, '1100 1000');
  keinStrich(a.satz);
});

/* ── maschine ─────────────────────────────────────────────── */
test('maschine: quadrat(4) mit return, sechs Schritte, ergebnis ist 16', () => {
  const s = V7.schritte('quadrat', 4, false);
  assert.equal(s.length, 6);
  assert.deepEqual(V7.programm('quadrat', 4, false).map((z) => z.text), ['def quadrat(x):', 'return x * x', '', 'ergebnis = quadrat(4)', 'print(ergebnis)']);
  assert.deepEqual(V7.programm('quadrat', 4, false).map((z) => z.ein), [0, 1, 0, 0, 0]);
  const a = V7.stand('quadrat', 4, false, 0);
  assert.deepEqual(a.tabelle, { zahl: null, param: null, var: null }, 'am Anfang ist noch nichts in der Tabelle');
  assert.deepEqual(a.ausgabe, []);
  assert.equal(a.fertig, false);
  const b = V7.stand('quadrat', 4, false, 2);
  assert.equal(b.tabelle.param, '4');
  assert.equal(b.tabelle.var, null, 'ergebnis ist noch leer, solange der Aufruf läuft');
  assert.deepEqual(b.aktiv, [0]);
  const c = V7.stand('quadrat', 4, false, 4);
  assert.equal(c.ausgang, '16');
  assert.equal(c.tabelle.var, null);
  const d = V7.stand('quadrat', 4, false, 5);
  assert.equal(d.tabelle.var, '16');
  assert.deepEqual(d.aktiv, [3]);
  const e = V7.stand('quadrat', 4, false, 6);
  assert.equal(e.fertig, true);
  assert.deepEqual(e.ausgabe, ['16']);
  assert.deepEqual(e.tabelle, { zahl: null, param: '4', var: '16' }, 'x bleibt stehen, getrennt von ergebnis');
  assert.match(s[3].satz, /^return gibt 16 zurück/);
});

test('maschine: print statt return, ergebnis bleibt None und die 16 steht in der Ausgabe', () => {
  assert.deepEqual(V7.programm('quadrat', 4, true).map((z) => z.text), ['def quadrat(x):', 'print(x * x)', '', 'ergebnis = quadrat(4)', 'print(ergebnis)']);
  const s = V7.schritte('quadrat', 4, true);
  assert.equal(s.length, 6);
  const c = V7.stand('quadrat', 4, true, 4);
  assert.deepEqual(c.ausgabe, ['16'], 'print zeigt die 16');
  assert.equal(c.tabelle.var, null);
  const d = V7.stand('quadrat', 4, true, 5);
  assert.equal(d.tabelle.var, 'None');
  assert.match(d.satz, /In ergebnis steht None\./);
  const e = V7.stand('quadrat', 4, true, 6);
  /* Python: def quadrat(x): print(x * x); ergebnis = quadrat(4); print(ergebnis) gibt 16 und None aus */
  assert.deepEqual(e.ausgabe, ['16', 'None']);
});

test('maschine: doppelt(x) mit zahl und b, sieben Schritte', () => {
  assert.deepEqual(V7.programm('doppelt', 3, false).map((z) => z.text), ['def doppelt(x):', 'return x * 2', '', 'zahl = 3', 'b = doppelt(zahl)', 'print(b)']);
  const s = V7.schritte('doppelt', 3, false);
  assert.equal(s.length, 7);
  assert.deepEqual(V7.stand('doppelt', 3, false, 1).tabelle, { zahl: '3', param: null, var: null });
  assert.deepEqual(V7.stand('doppelt', 3, false, 7).tabelle, { zahl: '3', param: '3', var: '6' });
  assert.deepEqual(V7.stand('doppelt', 3, false, 7).ausgabe, ['6']);
  assert.deepEqual(V7.stand('doppelt', 3, true, 7).ausgabe, ['6', 'None']);
  assert.deepEqual(V7.spaltenKopf('doppelt').map((c) => c.schluessel), ['zahl', 'param', 'var']);
  assert.deepEqual(V7.spaltenKopf('quadrat').map((c) => c.schluessel), ['param', 'var']);
  assert.deepEqual(V7.spaltenKopf('begruessen').map((c) => c.schluessel), ['param']);
});

test('maschine: begruessen läuft zweimal, name ist zuerst "Lea" und dann der Eingabewert', () => {
  assert.deepEqual(V7.programm('begruessen', 'Tom', false).map((z) => z.text), ['def begruessen(name):', 'print(f"Hallo {name}, viel Spaß!")', '', 'begruessen("Lea")', 'begruessen("Tom")']);
  const s = V7.schritte('begruessen', 'Tom', false);
  assert.equal(s.length, 6);
  assert.equal(V7.stand('begruessen', 'Tom', false, 0).tabelle.param, null, 'vor dem Start ist name leer');
  assert.equal(V7.stand('begruessen', 'Tom', false, 2).tabelle.param, '"Lea"');
  assert.equal(V7.stand('begruessen', 'Tom', false, 4).tabelle.param, '"Lea"');
  assert.equal(V7.stand('begruessen', 'Tom', false, 5).tabelle.param, '"Tom"');
  assert.deepEqual(V7.stand('begruessen', 'Tom', false, 6).ausgabe, ['Hallo Lea, viel Spaß!', 'Hallo Tom, viel Spaß!']);
  assert.equal(V7.stand('begruessen', 'Mia', false, 6).ausgabe[1], 'Hallo Mia, viel Spaß!');
});

test('maschine: Zahlen von −99 bis 99, Quadrate und Doppelte stimmen mit Python überein', () => {
  /* Python: [n * n for n in (-99, -5, 0, 4, 99)] ergibt [9801, 25, 0, 16, 9801] */
  const erwartet = { '-99': 9801, '-5': 25, '0': 0, '4': 16, '99': 9801 };
  for (const [n, q] of Object.entries(erwartet)) {
    assert.equal(V7.stand('quadrat', Number(n), false, 6).tabelle.var, V7.zahlText(q), `quadrat ${n}`);
  }
  for (let n = -99; n <= 99; n++) {
    assert.equal(V7.stand('quadrat', n, false, 6).tabelle.var, V7.zahlText(n * n));
    assert.equal(V7.stand('doppelt', n, false, 7).tabelle.var, V7.zahlText(n * 2));
  }
  assert.equal(V7.stand('doppelt', -5, false, 7).tabelle.var, `${M}10`);
  assert.equal(V7.pruefeEingabe('quadrat', '-5').wert, -5);
  assert.equal(V7.pruefeEingabe('quadrat', `${M}5`).wert, -5);
  assert.equal(V7.pruefeEingabe('quadrat', '99').ok, true);
  for (const falsch of ['', '100', '-100', '1.5', 'abc', '3 4']) {
    const p = V7.pruefeEingabe('quadrat', falsch);
    assert.equal(p.ok, false, `abgelehnt: ${falsch}`);
    keinStrich(p.meldung);
  }
  assert.equal(V7.pruefeEingabe('begruessen', 'Tom').wert, 'Tom');
  for (const falsch of ['', '1', 'Tom"', 'Abcdefghijkl', 'T o']) assert.equal(V7.pruefeEingabe('begruessen', falsch).ok, false, `abgelehnt: ${falsch}`);
  keinStrich(V7.pruefeEingabe('begruessen', '').meldung);
});

test('maschine: alle Sätze der Schritte ohne Gedankenstrich', () => {
  for (const f of V7.NAMEN) {
    for (const mp of [false, true]) {
      const wert = f === 'begruessen' ? 'Tom' : -7;
      for (const st of V7.schritte(f, wert, mp)) keinStrich(st.satz);
    }
  }
});

/* ── lupe ─────────────────────────────────────────────────── */
test('lupe: 0.1 + 0.2 zeigt wie Python 0.30000000000000004 und mit 20 Stellen 0.30000000000000004441', () => {
  const r = V7.addiere(10, 20);
  assert.equal(r.summeText, '0.30000000000000004');
  assert.equal(r.summe20, '0.30000000000000004441');
  assert.equal(r.a20, '0.10000000000000000555');
  assert.equal(r.b20, '0.20000000000000001110');
  assert.equal(r.erwartetText, '0.3');
  assert.equal(r.erwartet20, '0.29999999999999998890');
  assert.equal(r.gleich, false);
  assert.equal(r.genau, false);
  assert.equal(r.ampel, 'nicht genau');
  assert.equal(r.rundenGleich, true, 'round(0.1 + 0.2, 2) == 0.3');
  assert.match(V7.satzAddition(r), /^0\.1 \+ 0\.2 zeigt Python als 0\.30000000000000004\. Mit 20 Nachkommastellen: 0\.30000000000000004441\. Die Summe ist nicht genau\./);
  keinStrich(V7.satzAddition(r));
  const h = V7.addiere(50, 25);
  assert.equal(h.summeText, '0.75');
  assert.equal(h.summe20, '0.75000000000000000000');
  assert.equal(h.gleich, true);
  assert.equal(h.ampel, 'genau');
  assert.equal(h.erwartetText, '0.75');
  assert.equal(h.aText, '0.5');
  assert.equal(h.bText, '0.25');
  assert.equal(V7.addiere(10, 90).summeText, '1.0');
  assert.equal(V7.addiere(10, 90).erwartetText, '1.0');
  assert.deepEqual(V7.WERTE, [10, 20, 30, 40, 50, 60, 70, 80, 90, 25, 75]);
  assert.equal(V7.zwanzig(0.1), '0.10000000000000000555');
  assert.equal(V7.zwanzig(0.25), '0.25000000000000000000');
});

test('lupe: alle 121 Paare stimmen mit Python überein (repr, 20 Stellen, ==, round ==)', () => {
  assert.equal(PYTHON_SUMMEN.length, V7.WERTE.length * V7.WERTE.length);
  const kommt = new Set();
  let nichtGenau = 0;
  for (const [ha, hb, py, f20, eq, req] of PYTHON_SUMMEN) {
    const r = V7.addiere(ha, hb);
    const id = `${ha} + ${hb}`;
    kommt.add(id);
    assert.equal(r.summeText, py, `repr ${id}`);
    assert.equal(r.summe20, f20, `20 Stellen ${id}`);
    assert.equal(r.gleich, eq, `== ${id}`);
    assert.equal(r.rundenGleich, req, `round ${id}`);
    assert.equal(r.ampel, eq ? 'genau' : 'nicht genau');
    if (!eq) nichtGenau++;
  }
  assert.equal(kommt.size, 121);
  assert.ok(nichtGenau > 0, 'es gibt Paare, die nicht genau sind');
  /* round(…, 2) ist bei jedem Paar der Auswahl wahr: die Testdaten haben nie eine 5 an der Rundungsstelle */
  assert.ok(PYTHON_SUMMEN.every((z) => z[5] === true));
});

test('lupe: zehnmal 0.1 aufsummiert ergibt 0.9999999999999999 und dann 1.0999999999999999', () => {
  const f = V7.summenfolge();
  assert.equal(f.length, 11);
  /* Python: x = 0.0; elfmal x = x + 0.1; repr(x) */
  assert.deepEqual(f.map((e) => e.text), ['0.1', '0.2', '0.30000000000000004', '0.4', '0.5', '0.6', '0.7', '0.7999999999999999', '0.8999999999999999', '0.9999999999999999', '1.0999999999999999']);
  assert.ok(f.every((e) => e.ungleich), 'x != 1.0 ist jedes Mal wahr');
  assert.equal(f[9].text20, '0.99999999999999988898');
  assert.equal(f[9].nr, 10);
  assert.equal(V7.satzSumme(f, 0), 'Noch kein Schritt. x ist 0.0.');
  assert.equal(V7.satzSumme(f, 3), 'Schritt 3: x ist 0.30000000000000004. Ist x != 1.0? Ja.');
  assert.equal(V7.satzSumme(f, 10), 'Schritt 10: x ist 0.9999999999999999. Ist x != 1.0? Ja. Nach zehnmal 0.1 steht dort nicht 1.0.');
  assert.equal(V7.satzSumme(f, 11), 'Schritt 11: x ist 1.0999999999999999. Ist x != 1.0? Ja. Die Schleife while x != 1.0 würde nie enden.');
  for (let p = 0; p <= 11; p++) keinStrich(V7.satzSumme(f, p));
  assert.equal(V7.pyText(1), '1.0');
  assert.equal(V7.pyText(0.5), '0.5');
});

test('maschine: Code-Zeilen enthalten nie das typografische Minus', () => {
  for (const f of ['quadrat', 'doppelt']) {
    for (const n of [-3, 0, 5]) {
      for (const mp of [false, true]) {
        for (const z of V7.programm(f, n, mp)) assert.ok(!z.text.includes(M), `${f} ${n}: ${z.text}`);
      }
    }
  }
  assert.deepEqual(V7.programm('quadrat', -3, false).map((z) => z.text).slice(3, 4), ['ergebnis = quadrat(-3)']);
  assert.deepEqual(V7.programm('doppelt', -3, false).map((z) => z.text).slice(3, 4), ['zahl = -3']);
  assert.match(V7.schritte('quadrat', -3, false)[0].satz, /quadrat\(-3\)/);
});

test('kreis: im Modus mit Vorzeichen nennt der Baustein den Bereich nicht vorab', () => {
  const a = V7.ansichtKreis(V7.zustand(8, true, 100));
  assert.ok(!/128|127/.test(a.satz), a.satz);
});
