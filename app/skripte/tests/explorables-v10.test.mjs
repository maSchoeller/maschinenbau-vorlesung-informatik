/* Selbsttest Termin 10: Rechenkern der Bausteine treppe, zeichen und halbieren (site/assets/js/explorables-v10.js).
   Die Erwartungswerte sind mit Python 3.13 erzeugt: ord(), Zeitlupe aus 100 ns, 100 µs, 10 ms und die Versuchszahlen von
   "immer die Mitte" (int((unten + oben) / 2)) für alle 100 Zahlen (Verteilung 1, 2, 4, 8, 16, 32, 37, Höchstwert 7).
   Das Verhalten im Browser (Ausgangszustand ohne Lösung, Tastatur, Ansagen) prüft pruefe-v10.mjs an der gebauten Seite. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { SITE } from '../../src/lib/pfade.mjs';

const lade = createRequire(path.join(SITE, 'assets', 'js', 'x.js'));
const V = lade('./explorables-v10.js');
const keinStrich = (s) => assert.ok(!/[–—]/.test(s), 'kein Gedankenstrich: ' + s);

/* Python 3.13: [versuche(g) for g in range(1, 101)] mit int((unten + oben) / 2) */
const VERSUCHE = [6, 7, 5, 6, 7, 4, 6, 7, 5, 6, 7, 3, 6, 7, 5, 6, 7, 4, 6, 7, 5, 7, 6, 7, 2, 6, 7, 5, 6, 7, 4, 6, 7, 5, 6, 7, 3, 6, 7, 5, 6, 7, 4, 6, 7, 5, 7, 6, 7, 1, 6, 7, 5, 6, 7, 4, 6, 7, 5, 6, 7, 3, 6, 7, 5, 6, 7, 4, 6, 7, 5, 7, 6, 7, 2, 6, 7, 5, 6, 7, 4, 6, 7, 5, 7, 6, 7, 3, 6, 7, 5, 6, 7, 4, 6, 7, 5, 7, 6, 7];

test('treppe: vier Stufen mit Größe und Zeitlupe (RAM gleich 1 Sekunde, nachgerechnet)', () => {
  assert.deepEqual(V.STUFEN.map((s) => s.name), ['Speicher im Prozessor', 'Arbeitsspeicher', 'SSD', 'Festplatte']);
  assert.deepEqual(V.STUFEN.map((s) => s.sekunden), [0.01, 1, 1000, 100000]);
  assert.deepEqual(V.STUFEN.map((s) => s.zeit), ['0,01 Sekunden', '1 Sekunde', 'rund 17 Minuten', 'rund 28 Stunden']);
  assert.deepEqual(V.STUFEN.map((s) => s.groesse), ['einige KB bis einige MB', '8 bis 32 GB', '0,5 bis 2 TB', '1 bis 4 TB']);
  /* 1000 s sind rund 16,7 Minuten, 100 000 s rund 27,8 Stunden */
  assert.equal(Math.round(1000 / 60), 17);
  assert.equal(Math.round(100000 / 3600), 28);
  assert.deepEqual(V.STUFEN.map((s) => s.gerafft), [false, false, true, true]);
});

test('treppe: Länge wächst mit der Größe, liegt zwischen 0 und 1, Teilstriche stimmen', () => {
  const a = [0, 1, 2, 3].map((i) => V.balkenAnteil(i));
  for (const x of a) assert.ok(x > 0 && x < 1, 'Anteil ' + x);
  assert.ok(a[0] < a[1] && a[1] < a[2] && a[2] < a[3], 'Größe nimmt nach unten zu');
  assert.deepEqual(V.TEILSTRICHE.map((t) => t.text), ['KB', 'MB', 'GB', 'TB']);
  assert.equal(V.teilstrichAnteil(V.TEILSTRICHE[0]), 0);
  assert.ok(Math.abs(V.teilstrichAnteil(V.TEILSTRICHE[1]) - 0.3) < 1e-12);
  assert.ok(Math.abs(V.teilstrichAnteil(V.TEILSTRICHE[3]) - 0.9) < 1e-12);
  assert.ok(Math.abs(V.balkenAnteil(0) - 0.3) < 1e-9, '1 MB liegt beim Teilstrich MB');
});

test('treppe: Sätze nennen die Zeitlupe, keine echten Zeiten, keine Gedankenstriche', () => {
  assert.equal(V.zeitlupeText(2), 'In Zeitlupe: rund 17 Minuten');
  assert.equal(V.zeitlupeText(1), 'In Zeitlupe: 1 Sekunde');
  for (let i = 0; i < 4; i++) {
    const t = V.satzStufe(i);
    keinStrich(t);
    assert.ok(!/Nanosekunde|Mikrosekunde|Millisekunde|\bns\b|µs|\bms\b/.test(t), 'keine echten Zugriffszeiten: ' + t);
    assert.ok(t.includes(V.STUFEN[i].name) && t.includes('Größe ungefähr'));
  }
  assert.ok(/schneller als die Zeitlupe/.test(V.geraffText(3)) && !/schneller/.test(V.geraffText(0)));
  assert.ok(!/gerafft/.test(V.geraffText(3)), 'das Wort gerafft wird nicht erklärt, also nicht benutzt');
  assert.equal(V.laufMs(3, true), 0, 'bei reduzierter Bewegung steht der Balken sofort da');
  assert.ok(V.laufMs(1, false) > 0);
  assert.ok(!/17|28|1 Sekunde/.test(V.TREPPE_START), 'der Ausgangssatz verrät keine Zeit');
  keinStrich(V.TREPPE_START);
});

test('zeichen: die Codes sind die von Python (ord)', () => {
  const erwartet = { ' ': 32, '0': 48, '5': 53, '9': 57, 'A': 65, 'D': 68, 'Z': 90, 'a': 97, 'z': 122 };
  for (const [z, c] of Object.entries(erwartet)) {
    const p = V.pruefeZeichen(z);
    assert.equal(p.ok, true, z);
    assert.equal(p.karten[0].code, c, 'Code von ' + JSON.stringify(z));
  }
  assert.equal(V.pruefeZeichen('5').karten[0].code, 53, 'das Zeichen 5 hat die Zahl 53');
  assert.equal(V.codeVon('a') - V.codeVon('A'), 32);
  assert.equal(V.codeVon('D') - V.codeVon('A'), 3);
  for (let c = 48; c <= 57; c++) assert.equal(V.codeVon(String.fromCharCode(c)), c);
  for (let c = 65; c <= 90; c++) assert.equal(V.pruefeZeichen(String.fromCharCode(c)).karten[0].code, c);
  for (let c = 97; c <= 122; c++) assert.equal(V.pruefeZeichen(String.fromCharCode(c)).karten[0].code, c);
});

test('zeichen: nur Buchstaben, Ziffern, Leerzeichen, höchstens 8 Zeichen, leer ist erlaubt', () => {
  assert.deepEqual(V.pruefeZeichen('').karten, []);
  assert.equal(V.pruefeZeichen('').ok, true);
  assert.equal(V.pruefeZeichen('Hallo 5ab').ok, false, '9 Zeichen');
  assert.equal(V.pruefeZeichen('Hallo 5a').ok, true, '8 Zeichen');
  assert.equal(V.pruefeZeichen('Hallo 5a').karten.length, 8);
  for (const falsch of ['ä', 'ö', 'ß', 'Ü', '!', '.', ',', '-', '+', '@', '€', '😀', 'á', '\n', '\t', '~', '_', '{']) {
    const p = V.pruefeZeichen(falsch);
    assert.equal(p.ok, false, 'abgelehnt: ' + JSON.stringify(falsch));
    assert.equal(p.meldung, 'Dieses Zeichen kennt der Baustein nicht.');
    assert.deepEqual(p.karten, []);
  }
  keinStrich(V.MELDUNG_UNBEKANNT); keinStrich(V.MELDUNG_LANG);
  assert.equal(V.pruefeZeichen('ab ').karten[2].name, 'Leerzeichen');
  assert.equal(V.pruefeZeichen('ab ').karten[2].code, 32);
});

test('zeichen: Groß und klein tauschen ändert nur Buchstaben, um genau 32', () => {
  assert.equal(V.tausche('Hallo 5'), 'hALLO 5', 'Python: "Hallo 5".swapcase()');
  assert.equal(V.tausche('AZaz'), 'azAZ');
  assert.equal(V.tausche('09 '), '09 ', 'Ziffern und Leerzeichen bleiben');
  assert.equal(V.tausche(V.tausche('Abc 1Xy')), 'Abc 1Xy', 'zweimal tauschen bringt alles zurück');
  for (let c = 65; c <= 90; c++) {
    const g = String.fromCharCode(c), k = V.tausche(g);
    assert.equal(k.charCodeAt(0), c + 32);
    assert.equal(V.aenderung(g), 32);
    assert.equal(V.aenderung(k), -32);
  }
  for (const z of ['0', '5', '9', ' ']) { assert.equal(V.tausche(z), z); assert.equal(V.aenderung(z), 0); }
  assert.equal(V.tausche('5').charCodeAt(0), 53, 'die 5 wird nie zu einem Steuerzeichen');
  assert.equal(V.pruefeZeichen(V.tausche('Ab 12 Zz')).ok, true);
});

test('zeichen: Satz für Screenreader, ohne Gedankenstrich', () => {
  assert.equal(V.satzZeichen([]), 'Noch keine Zeichen.');
  const s = V.satzZeichen(V.pruefeZeichen('A 5').karten);
  assert.equal(s, 'A ist 65, Leerzeichen ist 32, 5 ist 53.');
  keinStrich(s);
});

test('halbieren: immer die Mitte braucht höchstens 7 Versuche, Verteilung 1, 2, 4, 8, 16, 32, 37 (Python)', () => {
  const verteilung = {};
  for (let g = 1; g <= 100; g++) {
    const n = V.spieleMitte(g);
    assert.equal(n, VERSUCHE[g - 1], 'geheim ' + g);
    verteilung[n] = (verteilung[n] || 0) + 1;
  }
  assert.deepEqual(verteilung, { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32, 7: 37 });
  assert.equal(Math.max(...VERSUCHE), 7);
  assert.equal(V.spieleMitte(50), 1);
  assert.equal(V.spieleMitte(1), 6);
  assert.equal(V.spieleMitte(100), 7);
  assert.equal(V.spieleMitte(64), 7);
  assert.equal(V.spieleMitte(37), 3);
});

test('halbieren: die Folge der Mitten für die Zahl 1 ist 50, 25, 12, 6, 3, 1', () => {
  let s = V.neuesSpiel(1); const folge = [];
  while (!s.fertig) { const m = V.mitte(s); folge.push(m); s = V.tippe(s, m).zustand; }
  assert.deepEqual(folge, [50, 25, 12, 6, 3, 1]);
  assert.equal(V.mitte(V.neuesSpiel(1)), 50);
});

test('halbieren: Hinweise Zu klein, Zu groß, Richtig! und der Bereich schrumpft', () => {
  let s = V.neuesSpiel(64);
  assert.equal(s.unten, 1); assert.equal(s.oben, 100); assert.equal(s.versuche, 0); assert.equal(s.fertig, false);
  let r = V.tippe(s, 80);
  assert.equal(r.hinweis, 'Zu groß'); s = r.zustand;
  assert.equal(s.oben, 79); assert.equal(s.unten, 1); assert.equal(s.versuche, 1);
  r = V.tippe(s, 50);
  assert.equal(r.hinweis, 'Zu klein'); s = r.zustand;
  assert.equal(s.unten, 51); assert.equal(s.oben, 79);
  r = V.tippe(s, 10);
  assert.equal(r.hinweis, 'Zu klein'); assert.equal(r.zustand.unten, 51, 'ein Tipp außerhalb macht den Bereich nicht weiter');
  s = r.zustand;
  r = V.tippe(s, 64);
  assert.equal(r.hinweis, 'Richtig!'); assert.equal(r.zustand.fertig, true); assert.equal(r.zustand.versuche, 4);
  assert.deepEqual(r.zustand.tipps.map((t) => t.zahl), [80, 50, 10, 64]);
  const nach = V.tippe(r.zustand, 5);
  assert.equal(nach.ignoriert, true); assert.equal(nach.zustand.versuche, 4);
  assert.equal(V.spanne(r.zustand), 1);
});

test('halbieren: Streifen, Prüfung der Eingabe, Zufallszahl und Sätze', () => {
  const st = V.streifen(V.neuesSpiel(5));
  assert.equal(st.links, 0); assert.equal(st.breite, 1);
  const s2 = V.tippe(V.neuesSpiel(80), 50).zustand;
  const st2 = V.streifen(s2);
  assert.ok(Math.abs(st2.links - 0.50) < 1e-12 && Math.abs(st2.breite - 0.50) < 1e-12);
  assert.equal(V.pruefeTipp('57').ok, true);
  assert.equal(V.pruefeTipp(' 100 ').zahl, 100);
  for (const f of ['', 'abc', '0', '101', '-5', '5.5', '1e2', '5 6']) assert.equal(V.pruefeTipp(f).ok, false, f);
  assert.equal(V.pruefeTipp('x').meldung, 'Schreib eine ganze Zahl von 1 bis 100.');
  keinStrich(V.MELDUNG_TIPP);
  assert.equal(V.zufallZahl(0), 1); assert.equal(V.zufallZahl(0.999999), 100); assert.equal(V.zufallZahl(0.5), 51);
  for (let i = 0; i < 1000; i++) { const z = V.zufallZahl(); assert.ok(z >= 1 && z <= 100 && Number.isInteger(z)); }
  assert.equal(V.SPIEL_START, 'Noch kein Tipp. Die Zahl liegt zwischen 1 und 100.');
  assert.ok(!/\b7\b|Mitte|halbier/i.test(V.SPIEL_START), 'der Ausgangssatz verrät weder Folge noch Höchstzahl');
  assert.equal(V.satzSpiel(V.neuesSpiel(3)), V.SPIEL_START);
  const t = V.tippe(V.neuesSpiel(64), 80).zustand;
  assert.equal(V.satzSpiel(t), 'Tipp 80: Zu groß. Versuche: 1. Die Zahl liegt zwischen 1 und 79.');
  keinStrich(V.satzSpiel(t));
  const ende = V.tippe(t, 64).zustand;
  assert.equal(V.satzSpiel(ende), 'Tipp 64: Richtig! Gefunden nach 2 Versuchen.');
  const eins = V.tippe(V.neuesSpiel(50), 50).zustand;
  assert.equal(V.satzSpiel(eins), 'Tipp 50: Richtig! Gefunden nach 1 Versuch.', 'Einzahl bei einem Versuch');
  assert.equal(V.versuchWort(1), '1 Versuch'); assert.equal(V.versuchWort(7), '7 Versuche'); assert.equal(V.versuchWort(7, true), '7 Versuchen');
});
