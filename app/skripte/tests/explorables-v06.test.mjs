/* Selbsttest Termin 06: Rechenkern der Bausteine hexfarbe, doppelschleife und xorschrift (site/assets/js/explorables-v06.js).
   Die Erwartungswerte sind mit Python 3 nachgerechnet (hex, bin, XOR mit ^, Schleifen), nicht im Kopf.
   Das Verhalten im Browser (Tastatur, 44 px, Live-Ansage) prüft pruefe-v06.mjs an der gebauten Seite. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { SITE } from '../../src/lib/pfade.mjs';

const lade = createRequire(path.join(SITE, 'assets', 'js', 'x.js'));
const V6 = lade('./explorables-v06.js');

/* ── hexfarbe ─────────────────────────────────────────────── */
test('hexfarbe: Bytes in Vierergruppen mit Hex-Ziffer (226 ist E2, 0 ist 00, 255 ist FF, 10 ist 0A)', () => {
  const e = V6.byteHex(226);
  assert.equal(e.bits, '11100010');
  assert.deepEqual(e.gruppen, ['1110', '0010']);
  assert.deepEqual(e.ziffern, ['E', '2']);
  assert.equal(e.hex, 'E2');
  assert.equal(e.satz, '1110 ist E, 0010 ist 2.');
  assert.equal(V6.byteHex(0).hex, '00');
  assert.equal(V6.byteHex(255).hex, 'FF');
  assert.equal(V6.byteHex(255).bits, '11111111');
  assert.equal(V6.byteHex(10).hex, '0A');
  assert.equal(V6.byteHex(37).hex, '25');
  assert.equal(V6.byteHex(26).hex, '1A');
  for (let z = 0; z <= 255; z++) {
    const h = V6.byteHex(z);
    assert.equal(h.hex, z.toString(16).toUpperCase().padStart(2, '0'), `hex ${z}`);
    assert.equal(h.bits, z.toString(2).padStart(8, '0'), `bits ${z}`);
    assert.equal(parseInt(h.hex, 16), z, `rueckweg ${z}`);
  }
});

test('hexfarbe: Farbcode, Farbtext und Namen (nie nur die Fläche)', () => {
  assert.equal(V6.farbcode(226, 0, 26), '#E2001A');
  assert.equal(V6.farbcode(255, 255, 255), '#FFFFFF');
  assert.equal(V6.farbcode(0, 0, 0), '#000000');
  assert.equal(V6.farbcode(0, 255, 0), '#00FF00');
  assert.equal(V6.farbText(226, 0, 26), 'Rot 226, Grün 0, Blau 26');
  assert.match(V6.farbWort(255, 255, 255), /^Weiß/);
  assert.match(V6.farbWort(0, 0, 0), /^Schwarz/);
  assert.match(V6.farbWort(0, 255, 0), /^Reines Grün/);
  assert.match(V6.farbWort(226, 0, 26), /DHBW/);
  assert.match(V6.farbWort(128, 128, 128), /Grau/);
  assert.equal(V6.farbWort(1, 2, 3), '');
  const a = V6.ansichtFarbe(226, 0, 26);
  assert.equal(a.code, '#E2001A');
  assert.equal(a.kanaele[2].hex, '1A');
  assert.equal(a.satz, 'Farbcode #E2001A. Rot 226, Grün 0, Blau 26. Das Rot der DHBW.');
});

test('hexfarbe: Eingabe des Farbcodes (mit oder ohne #, klein oder groß, genau sechs Ziffern)', () => {
  assert.deepEqual(V6.pruefeFarbcode('#E2001A'), { ok: true, r: 226, g: 0, b: 26, code: '#E2001A' });
  assert.deepEqual(V6.pruefeFarbcode('e2001a'), { ok: true, r: 226, g: 0, b: 26, code: '#E2001A' });
  assert.equal(V6.pruefeFarbcode(' #00ff00 ').g, 255);
  for (const falsch of ['', '#', '#E2001', '#E2001AB', '#GG0000', 'E2 00 1Z', '#12 345']) {
    const p = V6.pruefeFarbcode(falsch);
    assert.equal(p.ok, false, `abgelehnt: ${falsch}`);
    assert.ok(p.meldung.length > 10);
    assert.ok(!/[–—]/.test(p.meldung), 'kein Gedankenstrich');
  }
  assert.match(V6.pruefeFarbcode('#E2001').meldung, /^Es fehlen noch Ziffern/);
  assert.match(V6.pruefeFarbcode('#E2001AB').meldung, /^Das sind zu viele Ziffern/);
  assert.equal(V6.pruefeKanal('255').zahl, 255);
  assert.equal(V6.pruefeKanal('256').ok, false);
  assert.equal(V6.pruefeKanal('-1').ok, false);
  assert.equal(V6.pruefeKanal('1.5').ok, false);
  assert.equal(V6.pruefeKanal('').ok, false);
});

/* ── doppelschleife ───────────────────────────────────────── */
test('doppelschleife: 3 und 4 ergeben 12 Durchläufe, j beginnt bei jedem neuen i wieder bei 1', () => {
  const c = V6.einstellung(3, 4, false);
  const d = V6.durchlaeufe(c);
  assert.equal(d.length, 12);
  assert.equal(V6.durchlaeufeInnen(3, 4), 12);
  assert.equal(V6.rechnungInnen(3, 4), '3 mal 4 = 12 Durchläufe des inneren Rumpfs');
  assert.deepEqual(d.map((x) => x.i + '' + x.j), ['11', '12', '13', '14', '21', '22', '23', '24', '31', '32', '33', '34']);
  assert.deepEqual(d.filter((x) => x.neuesI).map((x) => x.nr), [1, 5, 9]);
  assert.deepEqual(V6.zeilenText(c).map((z) => z.text), ['for i in range(1, 4):', 'for j in range(1, 5):', 'print(i, j)']);
  assert.equal(V6.satzSchleife(c, 0), 'Noch kein Durchlauf. Als Nächstes: i ist 1, j ist 1.');
  assert.equal(V6.satzSchleife(c, 4), 'Durchlauf 4: i ist 1, j ist 4.');
  assert.equal(V6.satzSchleife(c, 5), 'Durchlauf 5: i ist 2, und j beginnt wieder bei 1.');
  assert.equal(V6.satzSchleife(c, 12), 'Durchlauf 12: i ist 3, j ist 4. Beide Schleifen sind zu Ende.');
  /* aktive Zeilen: die i-Zeile nur beim ersten j, die j-Zeile und der Rumpf immer */
  assert.deepEqual(V6.aktiveZeilen(c, 0), []);
  assert.deepEqual(V6.aktiveZeilen(c, 1), [0, 1, 2]);
  assert.deepEqual(V6.aktiveZeilen(c, 2), [1, 2]);
  assert.deepEqual(V6.aktiveZeilen(c, 5), [0, 1, 2]);
});

test('doppelschleife: Grenzen werden begrenzt, alle Größen von 1 bis 6 stimmen', () => {
  assert.equal(V6.einstellung(9, 0, false).a, 6);
  assert.equal(V6.einstellung(9, 0, false).b, 1);
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) assert.equal(V6.durchlaeufe(V6.einstellung(a, b, false)).length, a * b);
  assert.equal(V6.durchlaeufe(V6.einstellung(1, 1, false)).length, 1);
});

test('doppelschleife: Würfelpaare 6 mal 6 haben 36 Durchläufe und 6 mit Summe 7', () => {
  const c = V6.einstellung(2, 2, true);
  assert.equal(c.a, 6); assert.equal(c.b, 6);
  const d = V6.durchlaeufe(c);
  assert.equal(d.length, 36);
  assert.equal(V6.trefferGesamt(c), 6);
  assert.deepEqual(d.filter((x) => x.treffer).map((x) => x.i + '' + x.j), ['16', '25', '34', '43', '52', '61']);
  assert.equal(d[d.length - 1].trefferBisher, 6);
  assert.deepEqual(V6.zeilenText(c).map((z) => z.text), ['anzahl = 0', 'for i in range(1, 7):', 'for j in range(1, 7):', 'if i + j == 7:', 'anzahl = anzahl + 1', 'print(anzahl)']);
  /* Durchlauf 6 ist i 1, j 6: Treffer 1; der Rumpf ist nur dort aktiv */
  assert.equal(V6.satzSchleife(c, 6), 'Durchlauf 6: i ist 1, j ist 6. Summe 7: Treffer 1.');
  assert.deepEqual(V6.aktiveZeilen(c, 6), [2, 3, 4]);
  assert.deepEqual(V6.aktiveZeilen(c, 7), [1, 2, 3]);
  assert.equal(V6.satzSchleife(c, 36), 'Durchlauf 36: i ist 6, j ist 6. Beide Schleifen sind zu Ende: 6 Würfelpaare haben die Summe 7.');
});

/* ── xorschrift ───────────────────────────────────────────── */
test('xorschrift: HALLO mit 13 ergibt ELAAB, mit 22 ergibt ?WZZY, zweimal ergibt HALLO', () => {
  const e = V6.xor5('HALLO', 13);
  assert.equal(e.text, 'ELAAB');
  assert.deepEqual(e.zahlen, [5, 12, 1, 1, 2]);
  assert.equal(V6.nocheinmal(e).text, 'HALLO');
  const f = V6.xor5('HALLO', 22);
  assert.equal(f.text, '?WZZY');
  assert.deepEqual(f.zahlen, [30, 23, 26, 26, 25]);
  assert.equal(f.spalten[0].hatBuchstabe, false);
  assert.equal(f.spalten[1].hatBuchstabe, true);
  assert.equal(V6.nocheinmal(f).text, 'HALLO', 'mit den Zahlen entschlüsseln geht immer');
  assert.deepEqual(V6.nocheinmal(f).zahlen, [8, 1, 12, 12, 15]);
  assert.equal(V6.keinBuchstabe(30), 'Für 30 gibt es keinen Buchstaben. Er bleibt als Zahl stehen.');
  const s = e.spalten[0];
  assert.equal(s.bits, '01000'); assert.equal(s.schluesselBits, '01101'); assert.equal(s.ergebnisBits, '00101'); assert.equal(s.ergebnis, 5);
  assert.equal(V6.fuenf(13), '01101');
});

test('xorschrift: Schlüssel 0 ändert nichts, jeder Schlüssel von 0 bis 31 macht das Wort wieder', () => {
  assert.equal(V6.xor5('HALLO', 0).text, 'HALLO');
  assert.equal(V6.schluesselHinweis(0), 'Dieser Schlüssel ändert nichts.');
  assert.equal(V6.schluesselHinweis(13), '');
  for (let k = 0; k <= 31; k++) {
    for (const w of ['HALLO', 'ZEBRA', 'A', 'AZ', 'MASCHINE'.slice(0, 6)]) {
      const e = V6.xor5(w, k);
      const z = V6.nocheinmal(e);
      assert.equal(z.text, w, `${w} mit ${k}`);
      /* gegen Python: die Zahl ist (Buchstabenzahl ^ k) */
      e.spalten.forEach((s, i) => assert.equal(s.ergebnis, (V6.zahlVon(w[i]) ^ k), `${w}[${i}] ^ ${k}`));
    }
  }
});

test('xorschrift: XOR spaltenweise, Buchstaben und Fragezeichen', () => {
  assert.equal(V6.xorBits('0110', '1010'), '1100');
  assert.equal(V6.xorBits('11111', '11111'), '00000');
  assert.equal(V6.zahlVon('A'), 1); assert.equal(V6.zahlVon('Z'), 26);
  assert.equal(V6.buchstabeVon(1), 'A'); assert.equal(V6.buchstabeVon(26), 'Z');
  for (const z of [0, 27, 28, 29, 30, 31]) assert.equal(V6.buchstabeVon(z), '?', `?${z}`);
  /* A (1) mit 31 ergibt 30, Z (26) mit 31 ergibt 5 */
  assert.equal(V6.xor5('A', 31).zahlen[0], 30);
  assert.equal(V6.xor5('Z', 31).text, 'E');
  /* Ergebnis 0: gleiche Zahl wie der Schlüssel */
  assert.equal(V6.xor5('A', 1).text, '?');
  assert.equal(V6.xor5('A', 1).zahlen[0], 0);
});

test('xorschrift: Eingaben prüfen (1 bis 6 Buchstaben, Schlüssel 0 bis 31)', () => {
  assert.deepEqual(V6.pruefeWort('hallo'), { ok: true, wort: 'HALLO' });
  assert.deepEqual(V6.pruefeWort(' ab '), { ok: true, wort: 'AB' });
  for (const falsch of ['', 'HALLO1', 'GRÖSSE', 'ABCDEFG', 'A B!', '12']) {
    const p = V6.pruefeWort(falsch);
    assert.equal(p.ok, false, `abgelehnt: ${falsch}`);
    assert.ok(!/[–—]/.test(p.meldung));
  }
  assert.match(V6.pruefeWort('ABCDEFG').meldung, /^Das Wort ist zu lang/);
  assert.equal(V6.pruefeSchluessel('31').zahl, 31);
  assert.equal(V6.pruefeSchluessel('0').zahl, 0);
  assert.equal(V6.pruefeSchluessel('32').ok, false);
  assert.equal(V6.pruefeSchluessel('-1').ok, false);
  assert.equal(V6.pruefeSchluessel('').ok, false);
  assert.equal(V6.pruefeSchluessel('1.5').ok, false);
  assert.equal(V6.satzXor(V6.xor5('HALLO', 13), V6.nocheinmal(V6.xor5('HALLO', 13))),
    'Wort HALLO, Schlüssel 13 (01101). Ergebnis als Zahlen: 5, 12, 1, 1, 2, als Buchstaben: ELAAB. Noch einmal mit demselben Schlüssel ergibt HALLO.');
});
