/* Selbsttest Kursplan (npm run selbsttest): kurs.yaml entspricht dem Plan aus KONZEPT.md
   (20 Termine, 4 Blöcke je Termin, 48 Blöcke Programmieren, 32 Theorie einschließlich 2 Puffer). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ladeKurs, terminLektion, TERMINE, BLOECKE_JE_TERMIN } from '../../src/lib/kurs.mjs';

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

test('Lektionen: nur Seiten fertiger Termine (Kennung V + Terminnummer); der alte Kurs ist entfernt', () => {
  assert.equal(termine[0].lektion, 'V01', 'Termin 01 hat eigene Seiten');
  assert.equal(termine[0].entwurf, null);
  assert.ok(lektionen.some((l) => l.nr === 'V01'), 'V01 steht unter lektionen');
  /* jede Lektion gehört zu genau einem Termin und trägt dessen Nummer: Termin 02 = V02 usw. */
  for (const l of lektionen) {
    const zu = termine.filter((t) => t.lektion === l.nr || t.entwurf === l.nr);
    assert.equal(zu.length, 1, `${l.nr} gehört zu ${zu.length} Terminen`);
    assert.equal(l.nr, 'V' + zu[0].kennung, `${l.nr} steht bei Termin ${zu[0].kennung}`);
    assert.ok(l.lerneinheit && l.labor, `${l.nr}: Lerneinheit und Labor`);
  }
  assert.ok(lektionen.every((l) => l.aktiv), 'keine abgeschaltete Lektion');
  /* bisheriges Material (stoff) gibt es nicht mehr: keine Einheit nennt alte Lektionen, kein Termin zeigt welche */
  for (const e of einheiten) assert.deepEqual(e.stoff, [], `${e.id} nennt kein altes Material`);
  for (const t of termine) assert.deepEqual(t.stoff, [], `Termin ${t.kennung} zeigt kein bisheriges Material`);
});

test('Termin mit Entwurf: abgeschaltete Lektion ergibt lektion null und entwurf', () => {
  const lek = [{ nr: 'V02', aktiv: false }, { nr: 'V01', aktiv: true }];
  assert.deepEqual(terminLektion('V02', lek), { lektion: null, entwurf: 'V02' });
  assert.deepEqual(terminLektion('V01', lek), { lektion: 'V01', entwurf: null });
  assert.deepEqual(terminLektion(null, lek), { lektion: null, entwurf: null });
  assert.equal(terminLektion('V09', lek).fehlt, true, 'unbekannte Lektion wird gemeldet');
  /* jeder Termin hat höchstens eins von beiden */
  for (const t of termine) assert.ok(!(t.lektion && t.entwurf), `Termin ${t.kennung}`);
});
