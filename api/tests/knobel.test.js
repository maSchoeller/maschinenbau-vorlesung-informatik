'use strict';
// Knobelaufgaben (freiwillig, Teil K): zählen weder im Nenner noch im Zähler des Gruppenbilds der Dozierenden.
// Reine Rechenregeln, ohne Functions-Host: Kursstruktur (Filter) und Gruppenbild (berechne).

const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { _setzeKursstruktur, kursstruktur } = require('../src/lib/kursstruktur');
const { berechne } = require('../src/lib/gruppenbild');
const { findeAufgabe, _setzeAufgaben } = require('../src/lib/tutor/kontext');

/* So liefert app/skripte/index-bauen.mjs das Labor eines Termins mit zwei Knobelaufgaben (knobel: true, pruefbar leer) */
const ROH = [
  {
    nr: 'V01', quiz: 'v01', abschnitte: ['warum', 'theorie'],
    stationen: [
      { id: 'a-werkzeugkasten', teil: 'A', pruefbar: [] },
      { id: 'a-plan', teil: 'A', pruefbar: ['w-plan'] },
      { id: 't-1', teil: 'B', pruefbar: ['tr-1'] },
      { id: 'kn-1', teil: 'K', pruefbar: [], knobel: true },
      { id: 'kn-2', teil: 'K', pruefbar: [], knobel: true },
    ],
  },
];
const OHNE_KNOBEL = ROH.map((t) => ({ ...t, stationen: t.stationen.filter((s) => !s.knobel) }));

const doc = (benutzerId, schluessel, wert) => ({ benutzerId, pfad: 'inf-mb/v01/' + schluessel, wert });
/* fünf Konten (die Mindestzahl) mit gleichem Pflichtstand; die Knobelkennungen kommen nur in `mitKnobel` dazu */
function konten(mitKnobel) {
  const docs = [];
  for (let i = 1; i <= 5; i++) {
    const b = 's' + i;
    const aufg = { 'w-plan': 1, ...(i <= 3 ? { 'tr-1': 1 } : {}), ...(mitKnobel ? { 'k-1': 1, 'k-2': 1 } : {}) };
    const begonnen = { 'tr-1': 1, ...(mitKnobel ? { 'k-1': 1, 'k-2': 1 } : {}) };
    docs.push(doc(b, 'aufg', aufg), doc(b, 'begonnen', begonnen), doc(b, 'done', { warum: 1 }));
  }
  return docs;
}

describe('Knobelaufgaben im Gruppenbild', () => {
  afterEach(() => _setzeKursstruktur(undefined));

  it('die Kursstruktur kennt keine Knobel-Station (auch nicht mit prüfbaren Teilen)', () => {
    _setzeKursstruktur([{ ...ROH[0], stationen: [...ROH[0].stationen, { id: 'kn-3', teil: 'K', pruefbar: ['k-3'], knobel: true }] }]);
    const ids = kursstruktur()[0].stationen.map((s) => s.id);
    assert.deepEqual(ids, ['a-werkzeugkasten', 'a-plan', 't-1']);
    assert.ok(kursstruktur()[0].stationen.every((s) => s.teil === 'A' || s.teil === 'B'));
  });

  it('gelöste Knobelaufgaben ändern kein Gruppenbild (Nenner und Zähler)', () => {
    _setzeKursstruktur(ROH);
    const kurs = kursstruktur();
    const ohne = berechne(kurs, konten(false));
    const mit = berechne(kurs, konten(true));
    assert.deepEqual(mit, ohne);
    assert.equal(mit.genug, true);
    const l = mit.lektionen[0];
    assert.deepEqual(l.stationen.map((s) => s.id), ['a-plan', 't-1'], 'keine Zeile für Knobelaufgaben');
    assert.equal(l.stationen[1].geloest, 3);
    assert.deepEqual(Object.keys(l.teile).sort(), ['A', 'B']);
  });

  it('auch der Weg über eine Struktur ohne Knobel-Stationen ergibt dasselbe Bild', () => {
    _setzeKursstruktur(OHNE_KNOBEL);
    const direkt = berechne(kursstruktur(), konten(true));
    _setzeKursstruktur(ROH);
    assert.deepEqual(berechne(kursstruktur(), konten(true)), direkt);
  });

  it('ein Konto mit nur Knobelaufgaben zählt nicht als aktiv und löst keine Pflichtstation', () => {
    _setzeKursstruktur(ROH);
    const kurs = kursstruktur();
    const nurKnobel = ['a', 'b', 'c', 'd', 'e'].flatMap((b) => [doc(b, 'aufg', { 'k-1': 1, 'k-2': 1 }), doc(b, 'begonnen', { 'k-1': 1 })]);
    const r = berechne(kurs, nurKnobel);
    assert.equal(r.konten, 0);
    assert.equal(r.genug, false);
    const sechs = berechne(kurs, [...konten(false), ...nurKnobel.slice(0, 2)]);
    assert.equal(sechs.konten, 5, 'das sechste Konto (nur Knobelaufgaben) zählt nicht mit');
    assert.equal(sechs.lektionen[0].konten, 5);
    assert.deepEqual(sechs.lektionen[0].stationen, berechne(kurs, konten(false)).lektionen[0].stationen);
  });

  it('eine Kennung, die zufällig wie eine Pflichtkennung heißt, wird nicht verwechselt', () => {
    _setzeKursstruktur(ROH);
    // „k-1“ gehört keiner Pflichtstation: ein Konto, das nur sie hat, löst nichts
    const r = berechne(kursstruktur(), ['a', 'b', 'c', 'd', 'e'].map((b) => doc(b, 'aufg', { 'k-1': 1 })));
    assert.equal(r.konten, 0);
  });

  it('der Tutor kennt die Knobelaufgabe (Station kn-1 und Kennung k-1), obwohl sie nicht zählt', () => {
    // index-bauen schreibt ids = alle Kennungen der Station, bei Knobelaufgaben also k-1
    _setzeAufgaben([{ lektion: 'V01', seite: 'labor', id: 'kn-1', ids: ['k-1'], titel: 'Münzen', text: 'Text', loesung: 'print(1)', erlaubt: [] }]);
    try {
      assert.equal(findeAufgabe('V01', 'labor', 'kn-1').id, 'kn-1');
      assert.equal(findeAufgabe('V01', 'labor', 'k-1').id, 'kn-1');
    } finally { _setzeAufgaben(null); }
  });
});
