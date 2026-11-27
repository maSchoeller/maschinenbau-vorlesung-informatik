/* Selbsttest Bibliothek (site/assets/data/bibliothek.json): Einträge dürfen nur Lektionen zugeordnet sein, die es gibt.
   Die alten Kennungen V02 bis V20 gehörten zum entfernten Kurs; ab V02 gehören sie den neuen Terminen. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SITE } from '../../src/lib/pfade.mjs';
import { ladeKurs } from '../../src/lib/kurs.mjs';

const bib = JSON.parse(fs.readFileSync(path.join(SITE, 'assets', 'data', 'bibliothek.json'), 'utf8'));
/* Termine mit Entwurf (aktiv: false) gibt es schon: Bibliothekseinträge dürfen ihnen zugeordnet sein (die Suche nennt sie bis zur Freischaltung nicht, siehe index-bauen.mjs) */
const aktiv = new Set(ladeKurs().lektionen.map((l) => l.nr));

test('Bibliothek: eingefuehrt nennt nur Lektionen des Kurses, sonst keine Kennung', () => {
  assert.ok(bib.eintraege.length > 100);
  for (const e of bib.eintraege) {
    const kennung = /\bV\d{2}\b/.exec(e.eingefuehrt || '');
    if (kennung) assert.ok(aktiv.has(kennung[0]), `${e.id}: eingefuehrt „${e.eingefuehrt}“ gehört zu keiner aktiven Lektion`);
    assert.ok(e.eingefuehrt, `${e.id}: eingefuehrt fehlt`);
  }
});

test('Bibliothek: Zuordnungen zu entfernten Lektionen sind neutral und die alte Kennung bleibt erhalten', () => {
  const neutral = bib.eintraege.filter((e) => !/\d/.test(e.eingefuehrt));
  assert.ok(neutral.length > 0);
  for (const e of neutral) assert.match(e.eingefuehrt_alt, /^V\d{2}$/, `${e.id}: alte Kennung in eingefuehrt_alt`);
  assert.ok(bib.eintraege.filter((e) => /^V01$/.test(e.eingefuehrt)).length > 0, 'Termin 01 behält seine Einträge');
});

test('Bibliothek: Sprachmittel der gebauten Termine gelten ab ihrem Termin, nicht „später“', () => {
  const soll = { V01: ['int', 'float', 'typumwandlung', 'rechenoperatoren'], V02: ['bool', 'vergleiche', 'if', 'else', 'einrueckung', 'fstring'], V03: ['elif', 'and-or'], V07: ['def', 'return', 'parameter', 'type', 'round', 'potenz'], V08: ['str-text', 'modulo', 'lokale-variablen'], V09: ['import-random', 'random-randint'], V10: ['ord-chr'] };
  for (const [v, ids] of Object.entries(soll)) {
    for (const id of ids) {
      const e = bib.eintraege.find((x) => x.id === id);
      assert.ok(e, `Eintrag ${id} fehlt`);
      assert.equal(e.eingefuehrt, v, `${id}: eingefuehrt ist „${e.eingefuehrt}“, erwartet ${v}`);
    }
  }
  /* not und verschachtelte Verzweigungen kommen später */
  assert.match(bib.eintraege.find((x) => x.id === 'not').eingefuehrt, /späteren/);
});

test('Bibliothek: keine Kategorie und keine Auswahl aus dem alten Kurs („ab V10“, „bis V22“)', () => {
  for (const e of bib.eintraege) assert.ok(!/ab V\d\d/.test(e.kategorie), `${e.id}: Kategorie „${e.kategorie}“`);
  for (const f of ['assets/js/editor.js', 'bibliothek.html']) {
    const t = fs.readFileSync(path.join(SITE, f), 'utf8');
    assert.ok(!/i <= 22/.test(t), `${f}: Stand-Auswahl reicht bis V22, der Kurs hat 20 Termine`);
  }
});
