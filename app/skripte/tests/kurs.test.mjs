/* Selbsttest Kursplan (npm run selbsttest): kurs.yaml entspricht dem Plan aus KONZEPT.md
   (20 Termine, 4 Blöcke je Termin, 48 Blöcke Programmieren, 32 Theorie einschließlich 2 Puffer). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ladeKurs, TERMINE, BLOECKE_JE_TERMIN } from '../../src/lib/kurs.mjs';

const { semester, einheiten, termine, lektionen } = ladeKurs();
const summe = (liste) => liste.reduce((s, x) => s + x, 0);

test('20 Termine in zwei Semestern, je Termin 4 Blöcke', () => {
  assert.equal(termine.length, TERMINE);
  assert.deepEqual(semester.map((s) => s.nr), [1, 2]);
  assert.deepEqual(termine.map((t) => t.semester), [...Array(10).fill(1), ...Array(10).fill(2)]);
  for (const t of termine) assert.equal(summe(t.teile.map((x) => x.bloecke)) + t.puffer, BLOECKE_JE_TERMIN, `Termin ${t.kennung}`);
  assert.deepEqual(termine.map((t) => t.kennung).slice(0, 3), ['01', '02', '03']);
});

test('48 Blöcke Programmieren, 30 Theorie und 2 Puffer', () => {
  const je = (strang) => summe(termine.flatMap((t) => t.teile.filter((x) => x.strang === strang).map((x) => x.bloecke)));
  assert.equal(je('programmieren'), 48);
  assert.equal(je('theorie'), 30);
  assert.equal(summe(termine.map((t) => t.puffer)), 2);
  assert.equal(einheiten.filter((e) => e.strang === 'programmieren').length, 11);
  assert.equal(einheiten.filter((e) => e.strang === 'theorie').length, 11);
});

test('Teil x von y zählt eine Einheit über ihre Termine durch', () => {
  const schleifen = termine.flatMap((t) => t.teile.filter((x) => x.einheit === 'P3').map((x) => [t.nr, x.teil, x.vonTeilen, x.bloecke]));
  assert.deepEqual(schleifen, [[4, 1, 3, 2], [5, 2, 3, 3], [6, 3, 3, 2]]);
  const p1 = termine.flatMap((t) => t.teile.filter((x) => x.einheit === 'P1').map((x) => [t.nr, x.teil, x.vonTeilen]));
  assert.deepEqual(p1, [[1, 1, 2], [2, 2, 2]]);
});

test('bisheriges Material: jede Lektion steht bei mindestens einem Termin, entfallene kommen nicht vor', () => {
  const genannt = new Set(termine.flatMap((t) => t.stoff));
  for (const l of lektionen.filter((x) => x.aktiv)) assert.ok(genannt.has(l.nr) || termine.some((t) => t.lektion === l.nr), `${l.nr} steht bei keinem Termin`);
  assert.deepEqual(lektionen.filter((x) => x.aktiv).map((x) => x.nr), ['V01'], 'nur Termin 01 ist freigeschaltet');
  for (const nr of ['V05', 'V11', 'V12', 'V13', 'V15', 'V20', 'V21']) assert.ok(!lektionen.some((l) => l.nr === nr), `${nr} ist entfallen`);
  assert.equal(termine[0].lektion, 'V01', 'Termin 01 hat eigene Seiten');
  assert.deepEqual(termine[0].stoff, [], 'ein Termin mit eigenen Seiten zeigt kein bisheriges Material');
  assert.deepEqual(termine[3].stoff, [], 'abgeschaltete Lektionen erscheinen nicht als bisheriges Material');
  assert.deepEqual(termine[18].stoff, [], 'Termin 19: Puffer und Schiffe versenken werden neu gebaut');
});
