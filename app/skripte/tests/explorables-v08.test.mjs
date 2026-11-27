/* Selbsttest Termin 08: Rechenkern der Bausteine umwandler, raeume und kette (site/assets/js/explorables-v08.js).
   Die Erwartungswerte sind mit Python 3.13 erzeugt, nicht im Kopf: print(f(w)), type(f(w)).__name__ und repr(f(w)) für die neun Umwandlungen,
   die vier Summen mit ihren Meldungen, die Zeilenfolgen der Programme mit sys.settrace (nur die Zeilen des Programms, ohne die wiederholte Rückkehrzeile),
   die Ausgaben der Programme. Das Verhalten im Browser (Tastatur, Ansagen, keine Lösung im Ausgangszustand) prüft pruefe-v08.mjs an der gebauten Seite. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { SITE } from '../../src/lib/pfade.mjs';

const lade = createRequire(path.join(SITE, 'assets', 'js', 'x.js'));
const V8 = lade('./explorables-v08.js');
const keinStrich = (s) => assert.ok(!/[–—]/.test(s), 'kein Gedankenstrich: ' + s);
const keineEmojis = (s) => assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(s), 'kein Emoji: ' + s);

/* Python 3.13: [wert, funktion, str(f(wert)), Typname, repr(f(wert))] */
const PYTHON_UMW = [
  ['5', 'int', '5', 'int', '5'], ['5', 'float', '5.0', 'float', '5.0'], ['5', 'str', '5', 'str', "'5'"],
  ['"5"', 'int', '5', 'int', '5'], ['"5"', 'float', '5.0', 'float', '5.0'], ['"5"', 'str', '5', 'str', "'5'"],
  ['3.7', 'int', '3', 'int', '3'], ['3.7', 'float', '3.7', 'float', '3.7'], ['3.7', 'str', '3.7', 'str', "'3.7'"]
];
/* Python 3.13: [a, b, Ausgabe oder '', Meldung oder ''] für print(a + b) */
const PYTHON_SUMMEN = [
  ['5', '3', '8', ''],
  ['"5"', '"3"', '53', ''],
  ['5', '"3"', '', "TypeError: unsupported operand type(s) for +: 'int' and 'str'"],
  ['"5"', '3', '', 'TypeError: can only concatenate str (not "int") to str']
];
/* Python 3.13, sys.settrace: Zeilen des Programms, in der Reihenfolge der Zeilenereignisse; Ausgabe (stdout, ohne die Fehlermeldung) */
const PYTHON_LAUF = {
  A: { zeilen: [1, 5, 2, 3, 6, 7], ausgabe: ['16'], meldung: "NameError: name 'ergebnis' is not defined" },
  B: { zeilen: [1, 5, 6, 2, 3, 7, 8], ausgabe: ['5', '10'], meldung: '' }
};
const PYTHON_KETTE = {
  5: { zeilen: [1, 7, 13, 8, 2, 5, 11], ausgabe: ['Ben'] },
  7: { zeilen: [1, 7, 13, 8, 2, 5, 11], ausgabe: ['Ben'] },
  8: { zeilen: [1, 7, 13, 8, 2, 3, 9], ausgabe: ['Anna'] },
  10: { zeilen: [1, 7, 13, 8, 2, 3, 9], ausgabe: ['Anna'] }
};
/* Die Zeile des Aufrufs (5 bei A, 6 bei B, 13 bei der Kette) kommt nach der Rückkehr der Funktion noch einmal vor; alle anderen Zeilen nicht doppelt hintereinander */
const ohneRueckkehr = (zeilen) => zeilen.filter((z, i) => !(i > 0 && z === zeilen[i - 1]));

/* ── umwandler ────────────────────────────────────────────── */
test('umwandler: alle neun Umwandlungen stimmen mit Python überein, mit Typ und Schreibweise', () => {
  assert.equal(PYTHON_UMW.length, 9);
  assert.equal(Object.keys(V8.UMW).length, 9);
  for (const [w, f, aus, typ, wert] of PYTHON_UMW) {
    const r = V8.umwandle(w, f);
    assert.equal(r.zeile, `print(${f}(${w}))`);
    assert.equal(r.ausgabe, aus, `${f}(${w}) Ausgabe`);
    assert.equal(r.typ, typ, `${f}(${w}) Typ`);
    assert.equal(r.wert, wert, `${f}(${w}) Wert`);
    keinStrich(V8.satzUmwandle(r));
  }
  assert.equal(V8.umwandle('3.7', 'int').ausgabe, '3', 'int schneidet ab, es rundet nicht');
  assert.equal(V8.umwandle('5', 'float').ausgabe, '5.0', 'JavaScript würde 5 schreiben, Python schreibt 5.0');
  assert.equal(V8.umwandle('5', 'str').wert, "'5'", 'der Text steht mit Anführungszeichen daneben');
  assert.equal(V8.umwandle('7', 'int'), null);
  assert.deepEqual(V8.UMW_WERTE, ['5', '"5"', '3.7']);
  assert.deepEqual(V8.UMW_FUNKTIONEN, ['int', 'float', 'str']);
  /* jede Auswahl hat ein Ergebnis */
  for (const w of V8.UMW_WERTE) for (const f of V8.UMW_FUNKTIONEN) assert.ok(V8.umwandle(w, f), `${f}(${w})`);
});

test('umwandler: die vier Summen, bei Text plus Zahl steht die Meldung von Python wörtlich', () => {
  assert.equal(PYTHON_SUMMEN.length, 4);
  for (const [a, b, aus, fehler] of PYTHON_SUMMEN) {
    const r = V8.summe(a, b);
    assert.equal(r.zeile, `print(${a} + ${b})`);
    assert.equal(r.ausgabe, aus, `${a} + ${b} Ausgabe`);
    assert.equal(r.fehler, fehler, `${a} + ${b} Meldung`);
    assert.equal(r.abbruch, fehler ? 'Das Programm bricht in dieser Zeile ab.' : '');
    keinStrich(V8.satzSumme(r));
    keineEmojis(V8.satzSumme(r));
  }
  assert.equal(V8.summe('"5"', '"3"').ausgabe, '53', 'Text plus Text hängt aneinander');
  assert.equal(V8.summe('5', '3').ausgabe, '8');
  assert.equal(V8.summe('5', '7'), null);
  assert.deepEqual(V8.SUM_ERSTE, ['5', '"5"']);
  assert.deepEqual(V8.SUM_ZWEITE, ['3', '"3"']);
  assert.equal(Object.keys(V8.UMW).length + Object.keys(V8.SUM).length, 13, 'zusammen 13 Ergebnisse');
  assert.equal(V8.satzSumme(V8.summe('"5"', '3')), 'print("5" + 3) meldet TypeError: can only concatenate str (not "int") to str. Das Programm bricht in dieser Zeile ab.');
});

test('umwandler: der Ausgangszustand nennt nur den Satz, keine Lösung', () => {
  assert.equal(V8.NICHTS, 'Noch nichts ausgeführt. Vermute, wähle und drück auf Ausführen.');
  keinStrich(V8.NICHTS);
});

/* ── raeume ───────────────────────────────────────────────── */
test('raeume: Programm A, sieben Schritte, Zeilenfolge wie in Python, Meldung erst im letzten Schritt', () => {
  const s = V8.raeumeSchritte('A');
  assert.equal(s.length, 7);
  assert.deepEqual(PYTHON_LAUF.A.zeilen, [1, 5, 2, 3, 6, 7], 'Python meldet die Zeile 5 nach der Rückkehr nicht noch einmal, die Schrittliste zeigt sie');
  assert.deepEqual(s.map((x) => x.zeile), [1, 5, 2, 3, 5, 6, 7]);
  assert.deepEqual(V8.raeumeProgramm('A').map((z) => z.text), ['def quadrat(x):', 'ergebnis = x * x', 'return ergebnis', '', 'zahl = quadrat(4)', 'print(zahl)', 'print(ergebnis)']);
  assert.deepEqual(V8.raeumeProgramm('A').map((z) => z.ein), [0, 1, 1, 0, 0, 0, 0]);
  /* Ausgangszustand: nichts, keine Kästen, keine Ausgabe, keine Meldung */
  const a0 = V8.raeumeStand('A', 0);
  assert.deepEqual(a0.stapel, []);
  assert.deepEqual(a0.ausgabe, []);
  assert.equal(a0.meldung, '');
  assert.equal(a0.aktiv, 0);
  assert.equal(a0.pfeil, null);
  assert.equal(a0.fertig, false);
  /* Kästen */
  assert.deepEqual(V8.raeumeStand('A', 2).stapel.map((k) => k.titel), ['Hauptprogramm', 'quadrat']);
  assert.deepEqual(V8.raeumeStand('A', 2).stapel[1].vars, [['x', '4']]);
  assert.deepEqual(V8.raeumeStand('A', 3).stapel[1].vars, [['x', '4'], ['ergebnis', '16']]);
  const a4 = V8.raeumeStand('A', 4);
  assert.deepEqual(a4.stapel.map((k) => k.titel), ['Hauptprogramm'], 'nach return ist der Kasten der Funktion weg');
  assert.equal(a4.pfeil, '16');
  assert.deepEqual(a4.stapel[0].vars, [], 'noch ist nichts gespeichert');
  assert.deepEqual(V8.raeumeStand('A', 5).stapel[0].vars, [['zahl', '16']]);
  assert.equal(V8.raeumeStand('A', 5).pfeil, null);
  /* Meldung nur im letzten Schritt, Ausgabe nur 16 */
  for (let p = 0; p < 7; p++) assert.equal(V8.raeumeStand('A', p).meldung, '', `Schritt ${p} ohne Meldung`);
  const a7 = V8.raeumeStand('A', 7);
  assert.equal(a7.meldung, PYTHON_LAUF.A.meldung);
  assert.equal(a7.meldung, V8.MELDUNG_NAMEERROR);
  assert.deepEqual(a7.ausgabe, PYTHON_LAUF.A.ausgabe);
  assert.equal(a7.fertig, true);
  assert.ok(!a7.stapel.some((k) => k.vars.some((v) => v[0] === 'ergebnis')), 'draußen steht kein ergebnis');
  /* Die Wörter NameError und „Fehler“ stehen vor dem letzten Schritt nirgends */
  for (let i = 0; i < 6; i++) assert.ok(!/NameError|Fehler|bricht/.test(s[i].satz), `Satz ${i + 1}`);
  /* der Satz zu x: die Funktion hat ihr eigenes x, das Hauptprogramm bekommt keins */
  assert.ok(!V8.raeumeStand('A', 7).stapel.some((k) => k.vars.some((v) => v[0] === 'x')));
});

test('raeume: Programm B, acht Schritte, x an zwei Plätzen, draußen bleibt 5', () => {
  const s = V8.raeumeSchritte('B');
  assert.equal(s.length, 8);
  assert.deepEqual(s.map((x) => x.zeile), [1, 5, 6, 2, 3, 6, 7, 8]);
  assert.deepEqual(ohneRueckkehr(s.map((x) => x.zeile)), [1, 5, 6, 2, 3, 6, 7, 8]);
  assert.deepEqual(PYTHON_LAUF.B.zeilen, [1, 5, 6, 2, 3, 7, 8], 'Python meldet die Zeile 6 nach der Rückkehr nicht noch einmal, die Schrittliste zeigt sie');
  assert.deepEqual(V8.raeumeProgramm('B').map((z) => z.text), ['def verdoppeln(x):', 'x = x * 2', 'return x', '', 'x = 5', 'y = verdoppeln(x)', 'print(x)', 'print(y)']);
  const b0 = V8.raeumeStand('B', 0);
  assert.deepEqual(b0.stapel, []);
  assert.deepEqual(b0.ausgabe, []);
  assert.equal(b0.meldung, '');
  const b3 = V8.raeumeStand('B', 3);
  assert.deepEqual(b3.stapel.map((k) => k.titel + ':' + k.vars.map((v) => v.join('=')).join(',')), ['Hauptprogramm:x=5', 'verdoppeln:x=5']);
  const b4 = V8.raeumeStand('B', 4);
  assert.deepEqual(b4.stapel.map((k) => k.titel + ':' + k.vars.map((v) => v.join('=')).join(',')), ['Hauptprogramm:x=5', 'verdoppeln:x=10'], 'zwei Plätze, zwei Werte');
  const b5 = V8.raeumeStand('B', 5);
  assert.deepEqual(b5.stapel.map((k) => k.titel), ['Hauptprogramm']);
  assert.equal(b5.pfeil, '10');
  assert.deepEqual(V8.raeumeStand('B', 6).stapel[0].vars, [['x', '5'], ['y', '10']]);
  assert.deepEqual(V8.raeumeStand('B', 6).ausgabe, [], 'bis print kommt nichts in die Ausgabe');
  assert.deepEqual(V8.raeumeStand('B', 7).ausgabe, ['5']);
  const b8 = V8.raeumeStand('B', 8);
  assert.deepEqual(b8.ausgabe, PYTHON_LAUF.B.ausgabe);
  assert.equal(b8.meldung, '');
  assert.equal(b8.fertig, true);
  /* Die Antwort der Vermutung (5) steht in keinem Satz vor Zeile 7 außer als Wert, den man schon sieht: kein Satz sagt „zeigt 5“ vor dem Schritt */
  for (let i = 0; i < 6; i++) assert.ok(!/zeigt/.test(s[i].satz), `Satz ${i + 1} sagt noch nicht, was print zeigt`);
});

test('raeume: alle Sätze ohne Gedankenstrich und Emoji, jede Zeilennummer gibt es im Programm', () => {
  for (const id of V8.RAEUME_NAMEN) {
    const prog = V8.raeumeProgramm(id);
    for (const st of V8.raeumeSchritte(id)) {
      keinStrich(st.satz); keineEmojis(st.satz); keinStrich(st.meldung);
      assert.ok(st.zeile >= 1 && st.zeile <= prog.length, 'Zeile liegt im Programm');
      assert.ok(prog[st.zeile - 1].ausf, 'die Zeile ist ausführbar');
      assert.ok(!/Pause/.test(st.satz));
    }
    prog.forEach((z) => keinStrich(z.text));
  }
});

/* ── kette ────────────────────────────────────────────────── */
test('kette: Summe 7, acht Schritte, höchstens drei Kästen übereinander, die Rechnung 7 % 2', () => {
  assert.deepEqual(V8.KETTE_SUMMEN, [5, 7, 8, 10]);
  const s = V8.ketteSchritte(7);
  assert.equal(s.length, 8);
  assert.deepEqual(s.map((x) => x.zeile), [1, 7, 13, 8, 2, 5, 11, 13]);
  assert.deepEqual(ohneRueckkehr(s.map((x) => x.zeile)), [1, 7, 13, 8, 2, 5, 11, 13]);
  assert.deepEqual(V8.ketteProgramm(7).map((z) => z.text), [
    'def ist_gerade(n):', 'if n % 2 == 0:', 'return True', 'else:', 'return False', '', 'def sieger(summe):', 'if ist_gerade(summe):', 'return "Anna"', 'else:', 'return "Ben"', '', 'print(sieger(7))'
  ]);
  const k0 = V8.ketteStand(7, 0);
  assert.deepEqual(k0.stapel, [], 'am Anfang ist der Stapel leer');
  assert.deepEqual(k0.ausgabe, []);
  assert.equal(k0.pfeil, null);
  assert.deepEqual(k0.grau, [], 'am Anfang ist keine Zeile grau');
  assert.deepEqual(V8.ketteStand(7, 3).stapel.map((k) => k.titel), ['Hauptprogramm', 'sieger']);
  assert.deepEqual(V8.ketteStand(7, 3).stapel[1].vars, [['summe', '7']]);
  const k4 = V8.ketteStand(7, 4);
  assert.deepEqual(k4.stapel.map((k) => k.titel), ['Hauptprogramm', 'sieger', 'ist_gerade']);
  assert.deepEqual(k4.stapel[2].vars, [['n', '7']]);
  assert.equal(V8.maxKaesten(s), 3, 'auf dem Höhepunkt stehen drei Kästen');
  const k5 = V8.ketteStand(7, 5);
  assert.equal(k5.stapel[2].rechnung, '7 % 2 ist 1. Der Rest ist nicht 0.');
  assert.equal(k5.satz, 'Zeile 2: 7 % 2 ist 1. Der Rest ist nicht 0. Die Bedingung ergibt False.');
  const k6 = V8.ketteStand(7, 6);
  assert.deepEqual(k6.stapel.map((k) => k.titel), ['Hauptprogramm', 'sieger'], 'ist_gerade ist fertig, bevor sieger weitermacht');
  assert.equal(k6.pfeil, 'False');
  assert.equal(k6.aktiv, 5);
  const k7 = V8.ketteStand(7, 7);
  assert.deepEqual(k7.stapel.map((k) => k.titel), ['Hauptprogramm']);
  assert.equal(k7.pfeil, '"Ben"');
  assert.equal(k7.aktiv, 11);
  assert.deepEqual(k7.ausgabe, []);
  const k8 = V8.ketteStand(7, 8);
  assert.deepEqual(k8.ausgabe, ['Ben']);
  assert.equal(k8.fertig, true);
  assert.deepEqual(k8.grau, [3, 9], 'am Ende sind die zwei Zeilen grau, die nicht gelaufen sind');
});

test('kette: alle vier Summen stimmen mit Python überein (Zeilen, Ausgabe, Rest)', () => {
  const rest = { 5: 1, 7: 1, 8: 0, 10: 0 };
  for (const n of V8.KETTE_SUMMEN) {
    const s = V8.ketteSchritte(n), erw = PYTHON_KETTE[n];
    assert.deepEqual(ohneRueckkehr(s.map((x) => x.zeile)).slice(0, 7), erw.zeilen, `Zeilen für ${n}`);
    assert.equal(s.length, 8);
    assert.equal(s[7].zeile, 13, 'die letzte Zeile ist wieder der Aufruf mit print');
    assert.deepEqual(V8.ketteStand(n, 8).ausgabe, erw.ausgabe, `Ausgabe für ${n}`);
    assert.equal(V8.maxKaesten(s), 3, `drei Kästen bei ${n}`);
    assert.equal(s[4].rechnung, `${n} % 2 ist ${rest[n]}. ${rest[n] === 0 ? 'Der Rest ist 0, der Vergleich mit 0 stimmt.' : 'Der Rest ist nicht 0.'}`);
    assert.equal(n % 2, rest[n]);
    assert.equal(V8.ketteProgramm(n)[12].text, `print(sieger(${n}))`);
  }
  assert.equal(V8.ketteSchritte(10)[4].satz, 'Zeile 2: 10 % 2 ist 0. Der Rest ist 0, der Vergleich mit 0 stimmt. Die Bedingung ergibt True.');
  assert.equal(V8.ketteStand(10, 6).pfeil, 'True');
  assert.equal(V8.ketteStand(10, 7).pfeil, '"Anna"');
  assert.deepEqual(V8.ketteStand(10, 8).grau, [5, 11]);
  assert.deepEqual(V8.ketteStand(8, 8).grau, [5, 11]);
  assert.deepEqual(V8.ketteStand(5, 8).grau, [3, 9]);
});

test('kette: Sätze ohne Gedankenstrich und Emoji, vor dem Ende steht das Wort „Anna“ oder „Ben“ nicht als Ausgabe', () => {
  for (const n of V8.KETTE_SUMMEN) {
    const s = V8.ketteSchritte(n), prog = V8.ketteProgramm(n);
    s.forEach((st) => { keinStrich(st.satz); keineEmojis(st.satz); assert.ok(prog[st.zeile - 1].ausf); });
    for (let p = 0; p < 7; p++) assert.deepEqual(V8.ketteStand(n, p).ausgabe, [], `bis Schritt ${p} keine Ausgabe`);
    /* Die Anzahl der Kästen (die Antwort der Vermutung) steht in keinem Satz */
    s.forEach((st) => assert.ok(!/drei|3 Kästen|übereinander/.test(st.satz)));
  }
});
